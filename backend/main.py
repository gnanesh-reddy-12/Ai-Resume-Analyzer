from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from groq import Groq
from dotenv import load_dotenv
from supabase import create_client, Client
import bcrypt
import jwt
import os
import pdfplumber
import io
import re
import json
from difflib import SequenceMatcher
from datetime import datetime, timedelta
from pydantic import BaseModel

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this")
JWT_EXPIRY_HOURS = 24

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AuthRequest(BaseModel):
    email: str
    password: str


def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/")
def home():
    return {"message": "Backend is working"}


@app.post("/signup")
async def signup(body: AuthRequest):
    email = body.email.strip().lower()
    password = body.password
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    existing = supabase.table("users").select("id").eq("email", email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    result = supabase.table("users").insert({"email": email, "password_hash": password_hash}).execute()
    user = result.data[0]
    token = create_token(user["id"], user["email"])
    return {"token": token, "email": user["email"], "user_id": user["id"]}


@app.post("/login")
async def login(body: AuthRequest):
    email = body.email.strip().lower()
    result = supabase.table("users").select("*").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = result.data[0]
    if not bcrypt.checkpw(body.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], user["email"])
    return {"token": token, "email": user["email"], "user_id": user["id"]}


@app.get("/history")
async def get_history(user=Depends(verify_token)):
    result = supabase.table("analyses") \
        .select("*") \
        .eq("user_id", user["user_id"]) \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()
    return {"analyses": result.data}


@app.delete("/history/{analysis_id}")
async def delete_analysis(analysis_id: str, user=Depends(verify_token)):
    supabase.table("analyses") \
        .delete() \
        .eq("id", analysis_id) \
        .eq("user_id", user["user_id"]) \
        .execute()
    return {"message": "Deleted"}


def extract_text_from_pdf(contents: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
            text += "\n"
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def detect_pdf_warnings(contents: bytes) -> list:
    warnings = []
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            if page.extract_tables():
                warnings.append("Resume contains tables — some ATS systems may misread content inside tables.")
                break
        for page in pdf.pages:
            words = page.extract_words()
            if words:
                x_positions = [w["x0"] for w in words]
                if x_positions:
                    mid = (min(x_positions) + max(x_positions)) / 2
                    left = [x for x in x_positions if x < mid - 50]
                    right = [x for x in x_positions if x > mid + 50]
                    if len(left) > 5 and len(right) > 5:
                        warnings.append("Resume appears to use a multi-column layout — ATS may read columns in wrong order.")
                        break
    return warnings


STANDARD_HEADINGS = {
    "experience", "work experience", "professional experience", "employment history",
    "education", "academic background", "qualifications",
    "skills", "technical skills", "core competencies",
    "certifications", "licenses", "projects", "summary",
    "professional summary", "objective", "awards", "publications"
}


def detect_heading_warnings(resume_text: str) -> list:
    warnings = []
    lines = resume_text.split("\n") if "\n" in resume_text else resume_text.split(". ")
    for line in lines[:40]:
        clean = line.strip().lower()
        if 2 < len(clean) < 40 and clean.replace(" ", "").isalpha():
            is_unusual = (
                any(c in line for c in ["'", "!", "?", "🔥", "💼", "⚡"]) or
                re.search(r'\b(what i|i have|i am|my |things i)\b', clean)
            )
            is_standard = any(s in clean for s in STANDARD_HEADINGS)
            if is_unusual and not is_standard:
                warnings.append(f'Non-standard heading: "{line.strip()}" — use standard headings like Experience, Skills, Education.')
    return warnings[:3]


def compress_text(text: str, max_words: int = 300) -> str:
    stopwords = {
        "a","an","the","and","or","but","in","on","at","to","for","of","with",
        "is","are","was","were","be","been","being","have","has","had","do",
        "does","did","will","would","could","should","may","might","shall",
        "i","me","my","we","our","you","your","he","she","it","they","them",
        "this","that","these","those","as","by","from","up","about","into",
        "through","during","including","until","against","among","throughout",
        "also","such","than","then","so","if","when","where","while","how",
        "all","both","each","few","more","most","other","some","any","only",
        "same","just","because","well","good","great","strong","new","high"
    }
    words = re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{1,}\b', text)
    filtered = [w for w in words if w.lower() not in stopwords]
    seen = []
    seen_lower = set()
    for w in filtered:
        if w.lower() not in seen_lower:
            seen.append(w)
            seen_lower.add(w.lower())
    return " ".join(seen[:max_words])


SYNONYMS = {
    "ml": ["machine learning"],
    "machine learning": ["ml"],
    "ai": ["artificial intelligence"],
    "artificial intelligence": ["ai"],
    "js": ["javascript"],
    "javascript": ["js"],
    "ts": ["typescript"],
    "typescript": ["ts"],
    "k8s": ["kubernetes"],
    "kubernetes": ["k8s"],
    "db": ["database"],
    "ci/cd": ["continuous integration", "continuous deployment", "cicd"],
    "oop": ["object oriented programming", "object-oriented programming"],
    "object oriented programming": ["oop"],
    "rest": ["restful", "rest api"],
    "restful": ["rest", "rest api"],
    "nlp": ["natural language processing"],
    "natural language processing": ["nlp"],
    "dl": ["deep learning"],
    "deep learning": ["dl"],
    "aws": ["amazon web services"],
    "amazon web services": ["aws"],
    "gcp": ["google cloud platform"],
    "google cloud platform": ["gcp"],
    "bachelor": ["bachelors", "b.tech", "btech", "b.s.", "bs", "b.e.", "be", "undergraduate", "b.sc", "bsc", "bachelor's", "bachelors degree", "bachelor's degree"],
    "bachelors": ["bachelor", "b.tech", "btech", "b.s.", "bs", "b.e.", "be", "undergraduate", "b.sc", "bsc", "bachelor's", "bachelors degree", "bachelor's degree"],
    "bachelor's": ["bachelors", "bachelor", "b.tech", "btech", "b.s.", "bs", "b.e.", "be", "undergraduate", "b.sc", "bsc", "bachelors degree", "bachelor's degree"],
    "bachelor's degree": ["bachelors", "bachelor", "b.tech", "btech", "b.s.", "bs", "b.e.", "be", "undergraduate", "b.sc", "bsc", "bachelor's", "bachelors degree"],
    "master": ["masters", "m.tech", "mtech", "m.s.", "ms", "mba", "m.eng", "master's", "masters degree", "master's degree"],
    "masters": ["master", "m.tech", "mtech", "m.s.", "ms", "mba", "m.eng", "master's", "masters degree", "master's degree"],
    "master's": ["masters", "master", "m.tech", "mtech", "m.s.", "ms", "mba", "m.eng", "masters degree", "master's degree"],
    "master's degree": ["masters", "master", "m.tech", "mtech", "m.s.", "ms", "mba", "m.eng", "master's", "masters degree"],
    "phd": ["ph.d", "doctorate", "doctoral"],
    "ph.d": ["phd", "doctorate", "doctoral"],
}


def expand_synonyms(word: str) -> list:
    return SYNONYMS.get(word.lower(), [])


def fuzzy_match(word: str, text: str, threshold: float = 0.78) -> bool:
    word_lower = word.lower()
    text_lower = text.lower()
    if word_lower in text_lower:
        return True
    for synonym in expand_synonyms(word_lower):
        if synonym in text_lower:
            return True
    for tw in re.findall(r'\b\w[\w+#.\-]*\b', text_lower):
        if SequenceMatcher(None, word_lower, tw).ratio() >= threshold:
            return True
    return False


def calculate_scores(resume_text: str, jd_keywords: list):
    matched, missing = [], []
    for kw in jd_keywords:
        (matched if fuzzy_match(kw, resume_text) else missing).append(kw)
    total = len(jd_keywords)
    keyword_score = int((len(matched) / total) * 100) if total > 0 else 50
    stopwords = {
        "a","an","the","and","or","but","in","on","at","to","for","of","with",
        "is","are","was","were","be","been","have","has","had","will","would",
        "could","should","this","that","as","by","from","also","such","than",
        "then","so","if","when","where","while","all","both","each","more",
        "most","other","some","any","only","just","well","good","great","new"
    }
    jd_words = set(
        w for w in re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b', " ".join(jd_keywords).lower())
        if w not in stopwords
    )
    matched_semantic = sum(1 for w in jd_words if fuzzy_match(w, resume_text.lower()))
    semantic_score = min(int((matched_semantic / max(len(jd_words), 1)) * 100), 100)
    ats_score = max(0, min(int(keyword_score * 0.5 + semantic_score * 0.5), 100))
    return matched[:15], missing[:15], keyword_score, semantic_score, ats_score


def extract_jd_keywords(job_description: str) -> list:
    compressed_jd = compress_text(job_description, max_words=200)
    prompt = f"""Extract every important ATS keyword from this job description.
Include: technical skills, tools, programming languages, frameworks, certifications, methodologies, degree requirements, and role-specific terms.
Return ONLY a JSON array of strings. No explanation, no markdown, no backticks.
Example: ["Python", "React", "REST API", "AWS", "Agile", "Bachelor's degree"]

Job Description:
{compressed_jd}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You extract ATS keywords. Return only a JSON array of strings. Be thorough — extract all technical and qualification keywords."},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
        seed=42,
        max_tokens=500,
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r'^```[a-z]*\n?', '', raw)
    raw = re.sub(r'\n?```$', '', raw)
    try:
        keywords = json.loads(raw)
        return sorted([str(k).strip() for k in keywords if k])
    except Exception:
        return sorted(re.findall(r'"([^"]+)"', raw))


def calculate_experience_months(resume_text: str) -> int:
    import re
    from datetime import datetime
    
    text_lower = resume_text.lower()
    months_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
        '7': 7, '8': 8, '9': 9, '10': 10, '11': 11, '12': 12,
        '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6,
        '07': 7, '08': 8, '09': 9
    }
    
    months_regex = r'(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|\d{1,2})'
    
    pattern = r'\b(' + months_regex + r')?[\s,./]*(20\d{2})\s*(?:-|–|—|to)\s*(?:(' + months_regex + r')?[\s,./]*(20\d{2})|(present|current|now))\b'
    
    matches = re.findall(pattern, text_lower)
    total_months = 0
    current_year = datetime.now().year
    current_month = datetime.now().month
    
    for start_m, start_y, end_m, end_y, present in matches:
        start_year = int(start_y)
        start_month = 1
        if start_m:
            for k, v in months_map.items():
                if start_m.startswith(k):
                    start_month = v
                    break
        
        if present:
            end_year = current_year
            end_month = current_month
        else:
            end_year = int(end_y)
            end_month = 1
            if end_m:
                for k, v in months_map.items():
                    if end_m.startswith(k):
                        end_month = v
                        break
        
        diff_months = (end_year - start_year) * 12 + (end_month - start_month)
        if 0 < diff_months < 480:
            total_months += diff_months
                
    if total_months == 0:
        year_pairs = re.findall(r'\b(20\d{2})\s*[-–—]\s*(20\d{2}|present|current)\b', text_lower)
        for start, end in year_pairs:
            s = int(start)
            e = current_year if end in ("present", "current") else int(end)
            diff = max(0, e - s)
            if diff < 40:
                total_months += diff * 12
                
    return total_months


def analyze_eligibility(resume_text: str, job_description: str) -> dict:
    text_lower = resume_text.lower()
    jd_lower = job_description.lower()

    # --- Education in resume ---
    has_phd = bool(re.search(r'\b(ph\.?d|doctorate|doctoral)\b', text_lower))
    has_masters = bool(re.search(r'\b(master\'?s?|m\.?s\.?|m\.?tech|mba|m\.?eng)\b', text_lower))
    has_bachelors = bool(re.search(r'\b(bachelor\'?s?|b\.?s\.?|b\.?e\.?|b\.?tech|b\.?sc|undergraduate|b\.?a\.?)\b', text_lower))
    is_pursuing = bool(re.search(r'\b(pursuing|currently enrolled|expected|candidate)\b', text_lower))

    if has_phd:
        resume_education = "PhD"
    elif has_masters:
        resume_education = "Master's"
    elif has_bachelors:
        resume_education = "Bachelor's" + (" (pursuing)" if is_pursuing else "")
    else:
        resume_education = "Not detected"

    # --- Education required in JD ---
    jd_requires_phd = bool(re.search(r'\b(ph\.?d|doctorate)\b', jd_lower))
    jd_requires_masters = bool(re.search(r'\b(master\'?s?|m\.?s\.?|m\.?tech)\b', jd_lower))
    jd_requires_bachelors = bool(re.search(r'\b(bachelor\'?s?|b\.?s\.?|b\.?tech|undergraduate)\b', jd_lower))
    jd_accepts_equivalent = bool(re.search(r'(equivalent practical experience|or equivalent|practical experience)', jd_lower))

    # Both Bachelor's AND Master's mentioned — check if OR or AND
    jd_both_degrees = jd_requires_masters and jd_requires_bachelors
    jd_either_degree = jd_both_degrees and bool(re.search(r'(bachelor\'?s?.{0,30}or.{0,30}master|master.{0,30}or.{0,30}bachelor|or equivalent)', jd_lower))

    if jd_requires_phd and not has_phd:
        if has_masters:
            education_status = "partial"
            education_note = "JD prefers PhD. Your Master's is a strong qualification — many companies accept Master's + experience."
        elif has_bachelors:
            education_status = "partial"
            education_note = "JD prefers PhD. You have a Bachelor's — highlight practical experience and projects strongly."
        else:
            education_status = "gap"
            education_note = "No degree detected. JD requires PhD level. Add your education section clearly."
    elif jd_requires_masters and not has_masters and not has_phd:
        if jd_either_degree or jd_accepts_equivalent:
            education_status = "meets"
            education_note = "JD accepts Bachelor's or equivalent experience. Your qualification meets this requirement."
        elif has_bachelors:
            education_status = "partial"
            education_note = "JD prefers Master's. Your Bachelor's is commonly accepted — emphasize hands-on experience."
        else:
            education_status = "gap"
            education_note = "No degree detected. Add your education section."
    elif jd_requires_bachelors and resume_education == "Not detected":
        education_status = "gap"
        education_note = "No education section detected in your resume. Add it."
    else:
        education_status = "meets"
        education_note = f"Your {resume_education} meets the education requirements for this role."

    # --- Years of experience ---
    exp_matches = re.findall(r'(\d+)\+?\s*year[s]?\s*of\s*(?:work\s*|relevant\s*)?experience', jd_lower)
    exp_matches += re.findall(r'(\d+)\+?\s*year[s]?\s*(?:of\s*)?(?:experience\s*)?with\b', jd_lower)
    jd_min_years = min([int(x) for x in exp_matches]) if exp_matches else None

    # Estimate using month and year calculation
    total_months = calculate_experience_months(resume_text)
    estimated_years = total_months // 12
    estimated_months = total_months % 12
    
    if total_months > 0:
        if estimated_years > 0 and estimated_months > 0:
            estimated_exp_str = f"{estimated_years} year{'s' if estimated_years > 1 else ''} {estimated_months} month{'s' if estimated_months > 1 else ''}"
        elif estimated_years > 0:
            estimated_exp_str = f"{estimated_years} year{'s' if estimated_years > 1 else ''}"
        else:
            estimated_exp_str = f"{estimated_months} month{'s' if estimated_months > 1 else ''}"
        estimated_exp = round(total_months / 12, 1)
    else:
        estimated_exp_str = "0 months"
        estimated_exp = 0.0

    if jd_min_years:
        jd_min_months = jd_min_years * 12
        if total_months == 0:
            experience_status = "unknown"
            experience_note = f"JD requires {jd_min_years}+ years. Could not detect dates in resume — add clear date ranges (e.g. Month Year - Month Year) to each role."
        elif total_months >= jd_min_months:
            experience_status = "meets"
            experience_note = f"~{estimated_exp_str} detected in resume. JD requires {jd_min_years}+ years — you meet this."
        else:
            experience_status = "gap"
            experience_note = f"JD requires {jd_min_years}+ years. Resume shows ~{estimated_exp_str}. Highlight impact over duration."
    else:
        experience_status = "unknown"
        experience_note = f"Detected ~{estimated_exp_str} of experience in resume. No specific experience duration found in JD." if total_months > 0 else "No specific experience requirement found in JD."

    # --- Programming languages ---
    lang_patterns = {
        "Python": r'\bpython\b',
        "Java": r'\bjava\b(?!script)',
        "Kotlin": r'\bkotlin\b',
        "JavaScript": r'\bjavascript\b|\bjs\b',
        "TypeScript": r'\btypescript\b|\bts\b',
        "C++": r'\bc\+\+\b',
        "C#": r'\bc#\b',
        "Go": r'\bgolang\b|\bgo\b',
        "Rust": r'\brust\b',
        "Swift": r'\bswift\b',
        "Ruby": r'\bruby\b',
        "PHP": r'\bphp\b',
        "Scala": r'\bscala\b',
    }
    jd_langs = [lang for lang, pat in lang_patterns.items() if re.search(pat, jd_lower)]
    resume_langs = [lang for lang, pat in lang_patterns.items() if re.search(pat, text_lower)]
    jd_any_lang = bool(re.search(r'(one of the following|one or more|at least one)', jd_lower))

    if jd_langs:
        matched_langs = [l for l in jd_langs if l in resume_langs]
        if jd_any_lang:
            if matched_langs:
                lang_status = "meets"
                lang_note = f"JD requires one of: {', '.join(jd_langs)}. You have: {', '.join(matched_langs)} ✓"
            else:
                lang_status = "gap"
                lang_note = f"JD requires at least one of: {', '.join(jd_langs)}. None detected — add the language you know."
        else:
            missing_langs = [l for l in jd_langs if l not in resume_langs]
            if not missing_langs:
                lang_status = "meets"
                lang_note = f"All required languages found: {', '.join(matched_langs)} ✓"
            elif matched_langs:
                lang_status = "partial"
                lang_note = f"You have: {', '.join(matched_langs)}. Missing: {', '.join(missing_langs)}"
            else:
                lang_status = "gap"
                lang_note = f"No required languages ({', '.join(jd_langs)}) found in resume."
    else:
        lang_status = "unknown"
        lang_note = "No specific programming language requirements found in JD."

    return {
        "education": {
            "resume_level": resume_education,
            "status": education_status,
            "note": education_note
        },
        "experience": {
            "estimated_years": estimated_exp,
            "estimated_years_str": estimated_exp_str,
            "required_years": jd_min_years,
            "status": experience_status,
            "note": experience_note
        },
        "languages": {
            "jd_requires": jd_langs,
            "resume_has": resume_langs,
            "any_sufficient": jd_any_lang,
            "status": lang_status,
            "note": lang_note
        }
    }


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    company_name: str = Form(default=""),
    job_role: str = Form(default=""),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user = verify_token(credentials)

    if not resume.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    contents = await resume.read()
    resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        return {"error": "Could not extract text. Make sure the resume is not a scanned image."}

    pdf_warnings = detect_pdf_warnings(contents)
    heading_warnings = detect_heading_warnings(resume_text)
    all_warnings = pdf_warnings + heading_warnings

    try:
        jd_keywords = extract_jd_keywords(job_description)
        matched_keywords, missing_keywords, keyword_score, semantic_score, ats_score = calculate_scores(resume_text, jd_keywords)
        eligibility = analyze_eligibility(resume_text, job_description)
    except Exception as e:
        return {"error": f"Analysis error: {str(e)}"}

    can_apply = ats_score >= 60
    if eligibility["education"]["status"] == "gap":
        can_apply = False

    result = {
        "filename": resume.filename,
        "company_name": company_name,
        "job_role": job_role,
        "ats_score": ats_score,
        "keyword_score": keyword_score,
        "semantic_score": semantic_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "can_apply": can_apply,
        "eligibility": eligibility,
        "warnings": all_warnings,
        "message": "Resume analyzed successfully"
    }

    try:
        supabase.table("analyses").insert({
            "user_id": user["user_id"],
            "filename": resume.filename,
            "company_name": company_name or None,
            "job_role": job_role or None,
            "ats_score": ats_score,
            "keyword_score": keyword_score,
            "semantic_score": semantic_score,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "eligibility": eligibility,
            "warnings": all_warnings,
            "job_description_preview": job_description[:300]
        }).execute()
    except Exception:
        pass

    return result


@app.post("/improve")
async def improve_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    verify_token(credentials)

    if not resume.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    contents = await resume.read()
    resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        return {"error": "Could not extract text. Make sure the resume is not a scanned image."}

    compressed_resume = compress_text(resume_text, max_words=300)
    compressed_jd = compress_text(job_description, max_words=150)

    prompt = f"""You are a senior resume coach. A recruiter spends 5 seconds on a resume.

RESUME:
{compressed_resume}

JOB DESCRIPTION:
{compressed_jd}

TASK 1 — PROFESSIONAL SUMMARY
Write a 2-3 sentence professional summary.
Rules:
- Must be written in IMPLICIT FIRST PERSON or standard resume summary style (e.g., "Software Engineer with 5+ years of experience..." or "Experienced developer specialized in...").
- DO NOT use second person pronouns ("you", "your").
- DO NOT use third person pronouns referring to the candidate ("he", "she", "they", "the candidate").
- NO BUZZWORDS: do not use words like "passionate", "results-driven", "dynamic", "detail-oriented", "seeking".
- Focus purely on hard skills, years of experience, a major achievement, and value added.

TASK 2 — AI SNAPSHOT
Provide a clear, brief assessment covering:
- What to keep: What parts of the current resume are strong and align well.
- What is missing: What critical skills/keywords or details are absent.
- Experience gaps: Any gaps in employment history or shortfall in required years.

TASK 3 — BULLET POINT REWRITES BY SECTION
Identify all major work experiences and projects in the resume. For each work experience/project section, rewrite its key bullet points using the Google XYZ formula:
"Accomplished [X] as measured by [Y], by doing [Z]"
Rules:
- Group bullets by section/job title.
- If the original bullet contains metrics/numbers, keep or refine them.
- If it has no metrics, rewrite to emphasize scope/impact without inventing fake data.
- Max 2 rewritten bullets per job/project.

Return ONLY valid JSON (no markdown, no backticks):
{{
  "summary": "<the professional summary>",
  "ai_snapshot": {{
    "keep": "<brief bullet points or paragraph of what is strong>",
    "missing": "<brief bullet points or paragraph of what is missing>",
    "experience_gap": "<brief bullet points or paragraph about experience/duration gaps>"
  }},
  "sections": [
    {{
      "title": "<Job Title at Company or Project Name>",
      "bullets": [
        {{"original": "<original bullet>", "rewritten": "<XYZ rewritten bullet>"}}
      ]
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a senior resume coach. Return ONLY valid JSON. No markdown, no backticks. Be specific to this person's resume — no generic advice."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            seed=42,
            max_tokens=1200,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'^```[a-z]*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)
        result = json.loads(raw)
        return {"suggestions": result}
    except Exception as e:
        return {"error": f"Failed to generate improvements: {str(e)}"}


@app.post("/analyze/guest")
async def analyze_guest(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    contents = await resume.read()
    resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        return {"error": "Could not extract text. Make sure the resume is not a scanned image."}

    try:
        jd_keywords = extract_jd_keywords(job_description)
        matched_keywords, missing_keywords, keyword_score, semantic_score, ats_score = calculate_scores(resume_text, jd_keywords)
    except Exception as e:
        return {"error": f"Analysis error: {str(e)}"}

    return {
        "ats_score": ats_score,
        "keyword_score": keyword_score,
        "semantic_score": semantic_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "can_apply": ats_score >= 60,
        "message": "Guest analysis complete"
    }