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
import docx
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
    result = supabase.table("users").insert({
        "email": email,
        "password_hash": password_hash
    }).execute()

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


def extract_text(filename: str, contents: bytes) -> str:
    text = ""
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
    elif filename.endswith(".docx"):
        document = docx.Document(io.BytesIO(contents))
        for para in document.paragraphs:
            text += para.text + "\n"
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


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

    jd_words = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b', " ".join(jd_keywords).lower()))
    resume_words = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b', resume_text.lower()))
    overlap = len(jd_words & resume_words)
    semantic_score = min(int((overlap / max(len(jd_words), 1)) * 150), 100)

    ats_score = max(0, min(int(keyword_score * 0.35 + semantic_score * 0.65), 100))
    return matched[:15], missing[:15], keyword_score, semantic_score, ats_score


def extract_jd_keywords(job_description: str) -> list:
    compressed_jd = compress_text(job_description, max_words=200)
    prompt = f"""Extract the most important ATS keywords from this job description.
Focus on: technical skills, tools, programming languages, frameworks, certifications, methodologies, and role-specific terms.
Return ONLY a JSON array of strings. No explanation, no markdown, no backticks.
Example: ["Python", "React", "REST API", "AWS", "Agile"]

Job Description Keywords:
{compressed_jd}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You extract ATS keywords. Return only a JSON array of strings. Exclude niche academic or theoretical terms. Focus only on practical, industry-standard skills."},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
        seed=42,
        max_tokens=400,
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r'^```[a-z]*\n?', '', raw)
    raw = re.sub(r'\n?```$', '', raw)
    try:
        keywords = json.loads(raw)
        return sorted([str(k).strip() for k in keywords if k])
    except Exception:
        return sorted(re.findall(r'"([^"]+)"', raw))


def generate_suggestions(resume_text: str, job_description: str, missing_keywords: list, ats_score: int) -> dict:
    compressed_resume = compress_text(resume_text, max_words=250)
    compressed_jd = compress_text(job_description, max_words=150)
    missing_str = ", ".join(missing_keywords[:12]) if missing_keywords else "None"

    prompt = f"""You are an expert ATS resume coach helping students and professionals pass ATS scanners and reach recruiters.

Resume (compressed): {compressed_resume}
Job Description (compressed): {compressed_jd}
ATS Score: {ats_score}/100
Missing Keywords: {missing_str}

Return ONLY valid JSON:
{{
  "apply_verdict": "<one line verdict>",
  "improvement_suggestions": [
    {{"section": "<Summary/Experience/Skills/Education>", "issue": "<specific problem>", "fix": "<exact actionable fix with example>"}}
  ],
  "rewritten_bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>"],
  "strong_action_verbs": ["<v1>","<v2>","<v3>","<v4>","<v5>","<v6>","<v7>","<v8>"],
  "summary_suggestion": "<2-3 sentence tailored professional summary>"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an ATS resume expert. Return only valid JSON. No markdown, no backticks."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        seed=42,
        max_tokens=1200,
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r'^```[a-z]*\n?', '', raw)
    raw = re.sub(r'\n?```$', '', raw)
    try:
        return json.loads(raw)
    except Exception:
        return {
            "apply_verdict": "Analysis complete — review suggestions below",
            "improvement_suggestions": [],
            "rewritten_bullets": [],
            "strong_action_verbs": [],
            "summary_suggestion": ""
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

    if not (resume.filename.endswith(".pdf") or resume.filename.endswith(".docx")):
        return {"error": "Only PDF and DOCX files are supported"}

    contents = await resume.read()
    resume_text = extract_text(resume.filename, contents)

    if not resume_text.strip():
        return {"error": "Could not extract text. Make sure the resume is not a scanned image."}

    try:
        jd_keywords = extract_jd_keywords(job_description)
        matched_keywords, missing_keywords, keyword_score, semantic_score, ats_score = calculate_scores(resume_text, jd_keywords)
        suggestions = generate_suggestions(resume_text, job_description, missing_keywords, ats_score)
    except Exception as e:
        return {"error": f"Analysis error: {str(e)}"}

    result = {
        "filename": resume.filename,
        "company_name": company_name,
        "job_role": job_role,
        "job_description_length": len(job_description),
        "resume_text_preview": resume_text[:700],
        "ats_score": ats_score,
        "keyword_score": keyword_score,
        "semantic_score": semantic_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "can_apply": ats_score >= 60,
        "apply_verdict": suggestions.get("apply_verdict", ""),
        "improvement_suggestions": suggestions.get("improvement_suggestions", []),
        "rewritten_bullets": suggestions.get("rewritten_bullets", []),
        "strong_action_verbs": suggestions.get("strong_action_verbs", []),
        "summary_suggestion": suggestions.get("summary_suggestion", ""),
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
            "apply_verdict": suggestions.get("apply_verdict", ""),
            "improvement_suggestions": suggestions.get("improvement_suggestions", []),
            "rewritten_bullets": suggestions.get("rewritten_bullets", []),
            "strong_action_verbs": suggestions.get("strong_action_verbs", []),
            "summary_suggestion": suggestions.get("summary_suggestion", ""),
            "job_description_preview": job_description[:300]
        }).execute()
    except Exception:
        pass

    return result


@app.post("/analyze/guest")
async def analyze_guest(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not (resume.filename.endswith(".pdf") or resume.filename.endswith(".docx")):
        return {"error": "Only PDF and DOCX files are supported"}

    contents = await resume.read()
    resume_text = extract_text(resume.filename, contents)

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