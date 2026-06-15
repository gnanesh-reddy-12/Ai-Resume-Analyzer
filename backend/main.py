from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from groq import Groq
from dotenv import load_dotenv
from supabase import create_client, Client
import os
import pdfplumber
import io
import re
import json
from difflib import SequenceMatcher
from datetime import datetime
from pydantic import BaseModel

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# Use service_role key on production (bypasses RLS safely — backend is trusted).
# Falls back to anon key for local development.
supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(os.getenv("SUPABASE_URL"), supabase_key)
security = HTTPBearer()

ALLOWED_ORIGINS = [
    "https://ai-resume-analyzer-two-red.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok", "message": "ResumeAI API is running"}


# Ensure CORS headers are present even on unhandled 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers=headers,
    )


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        response = supabase.auth.get_user(credentials.credentials)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": response.user.id, "email": response.user.email}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


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
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
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
    "js": ["javascript", "react"],
    "javascript": ["js"],
    "ts": ["typescript"],
    "typescript": ["ts"],
    "k8s": ["kubernetes"],
    "kubernetes": ["k8s"],
    "db": ["database", "sql", "nosql"],
    "ci/cd": ["continuous integration", "continuous deployment", "cicd", "github actions", "gitlab ci", "jenkins", "circleci"],
    "continuous integration": ["ci", "cicd", "continuous integration", "github actions", "gitlab ci", "jenkins"],
    "continuous deployment": ["cd", "cicd", "continuous deployment", "github actions", "gitlab ci", "jenkins"],
    "oop": ["object oriented programming", "object-oriented programming"],
    "object oriented programming": ["oop"],
    "rest": ["restful", "rest api", "apis", "api"],
    "rest api": ["rest", "restful", "rest apis", "apis", "api"],
    "restful": ["rest", "rest api"],
    "nlp": ["natural language processing"],
    "natural language processing": ["nlp"],
    "dl": ["deep learning"],
    "deep learning": ["dl"],
    "aws": ["amazon web services"],
    "amazon web services": ["aws"],
    "gcp": ["google cloud platform", "google cloud"],
    "google cloud platform": ["gcp", "google cloud"],
    "google cloud": ["gcp", "google cloud platform"],
    "computer science": ["cs", "cse", "computer science and engineering", "it", "information technology"],
    "cs": ["computer science", "cse", "computer science and engineering", "it", "information technology"],
    "software engineering": ["software development", "software engineer", "swe", "developer"],
    "software development": ["software engineering", "software engineer", "swe", "developer"],
    "web development": ["frontend", "backend", "fullstack", "web developer", "website"],
    "version control": ["git", "github", "gitlab", "bitbucket"],
    "agile": ["scrum", "kanban", "sprints"],
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
    word_lower = word.lower().strip()
    text_lower = text.lower()
    
    # Direct match
    if word_lower in text_lower:
        return True
        
    # Synonym match
    for synonym in expand_synonyms(word_lower):
        if synonym in text_lower:
            return True
            
    # Stopwords for parsing multi-word phrases
    kw_stopwords = {"and", "or", "of", "in", "to", "for", "with", "on", "at", "by", "from", "the", "a", "an", "skills", "experience", "knowledge", "expertise"}
    
    # Split keyword into constituent words
    kw_words = [w for w in re.findall(r'\b\w[\w+#.\-]*\b', word_lower) if w not in kw_stopwords]
    
    if len(kw_words) >= 2:
        # Check if all constituent words (or their synonyms) are in the text
        match_count = sum(1 for w in kw_words if w in text_lower or any(syn in text_lower for syn in expand_synonyms(w)))
        if match_count == len(kw_words):
            return True
            
        # Core technology suffix check (e.g., "Python developer" -> matches if "Python" is present)
        core_suffixes = {"developer", "engineer", "framework", "library", "platform", "tool", "tools", "service", "services", "system", "systems", "architecture", "methodology", "methodologies", "principles", "concepts", "practices", "experience", "degree"}
        if len(kw_words) == 2 and kw_words[1] in core_suffixes:
            if kw_words[0] in text_lower or any(syn in text_lower for syn in expand_synonyms(kw_words[0])):
                return True
                
    # Levenshtein distance fallback
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


def extract_jd_keywords(job_description: str) -> dict:
    cleaned_jd = re.sub(r'[ \t]+', ' ', job_description)
    cleaned_jd = re.sub(r'\n+', '\n', cleaned_jd).strip()
    prompt = f"""Analyze this job description and identify what the job actually is and what the recruiter is looking for.
Extract:
1. Every important ATS keyword (technical skills, tools, frameworks, degree requirements).
2. A brief 1-2 sentence description of what the core focus of the role is.
3. A brief 1-2 sentence description of what the recruiter needs in the right candidate.

Return ONLY a valid JSON object. No explanation, no markdown, no backticks.
Example format:
{{
  "keywords": ["Python", "React", "AWS", "Bachelor's degree"],
  "role_focus": "Developing and maintaining scalable frontend interfaces and web applications.",
  "recruiter_needs": "A developer skilled in modern JavaScript frameworks who can take ownership of UI features and optimize application performance."
}}

Job Description:
{cleaned_jd}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You analyze job descriptions. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
        seed=42,
        max_tokens=600,
    )
    raw = response.choices[0].message.content.strip()
    raw = re.sub(r'^```[a-z]*\n?', '', raw)
    raw = re.sub(r'\n?```$', '', raw)
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            if "keywords" not in data:
                data["keywords"] = []
            return data
    except Exception:
        pass
        
    kws = re.findall(r'"([^"]+)"', raw)
    kws = [k for k in kws if k not in ("keywords", "role_focus", "recruiter_needs")]
    return {
        "keywords": sorted(kws),
        "role_focus": "Core software developer role focused on technical requirements.",
        "recruiter_needs": "A candidate possessing the listed technical skills and qualifications."
    }


def analyze_eligibility(resume_text: str, job_description: str) -> dict:
    return {
        "education": {
            "resume_level": "Not evaluated",
            "status": "meets",
            "note": ""
        },
        "experience": {
            "estimated_years": 0.0,
            "estimated_years_str": "Not evaluated",
            "bachelor_graduation_year": None,
            "student_experience_str": "None",
            "post_graduation_experience_str": "None",
            "required_years": None,
            "status": "meets",
            "note": ""
        },
        "languages": {
            "jd_requires": [],
            "resume_has": [],
            "any_sufficient": True,
            "status": "meets",
            "note": ""
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
    user = await verify_token(credentials)

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
        jd_data = extract_jd_keywords(job_description)
        jd_keywords = jd_data["keywords"]
        matched_keywords, missing_keywords, keyword_score, semantic_score, ats_score = calculate_scores(resume_text, jd_keywords)
        eligibility = analyze_eligibility(resume_text, job_description)
        # Store job analysis inside eligibility to preserve it in Supabase history
        eligibility["job_analysis"] = {
            "role_focus": jd_data.get("role_focus", "Core software developer role focused on technical requirements."),
            "recruiter_needs": jd_data.get("recruiter_needs", "A candidate possessing the listed technical skills and qualifications.")
        }
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
        "job_analysis": eligibility["job_analysis"],
        "warnings": all_warnings,
        "message": "Resume analyzed successfully"
    }

    try:
        insert_res = supabase.table("analyses").insert({
            "user_id": user["user_id"],
            "filename": resume.filename,
            "company_name": company_name or None,
            "job_role": job_role or None,
            "ats_score": ats_score,
            "keyword_score": keyword_score,
            "semantic_score": semantic_score,
            "matched_keywords": matched_keywords,
            "missing_keywords": missing_keywords,
            "improvement_suggestions": {
                "eligibility": eligibility,
                "warnings": all_warnings
            },
            "job_description_preview": job_description[:5000]
        }).execute()
        if insert_res.data:
            result["id"] = insert_res.data[0]["id"]
    except Exception as e:
        print("Database insert failed:", str(e))

    return result


@app.post("/improve")
async def improve_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    analysis_id: str = Form(default=""),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    await verify_token(credentials)

    if not resume.filename.endswith(".pdf"):
        return {"error": "Only PDF files are supported"}

    contents = await resume.read()
    resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        return {"error": "Could not extract text. Make sure the resume is not a scanned image."}

    cleaned_resume = re.sub(r'[ \t]+', ' ', resume_text)
    cleaned_resume = re.sub(r'\n+', '\n', cleaned_resume).strip()
    cleaned_jd = re.sub(r'[ \t]+', ' ', job_description)
    cleaned_jd = re.sub(r'\n+', '\n', cleaned_jd).strip()

    prompt = f"""You are a senior resume coach. A recruiter spends 5 seconds on a resume.

RESUME:
{cleaned_resume}

JOB DESCRIPTION:
{cleaned_jd}

TASK 1 — PROFESSIONAL SUMMARY
Write a 2-3 sentence professional summary.
Rules:
- Must be written in IMPLICIT FIRST PERSON or standard resume summary style (e.g., "Software Engineer with 5+ years of experience..." or "Experienced developer specialized in...").
- DO NOT use second person pronouns ("you", "your").
- DO NOT use third person pronouns referring to the candidate ("he", "she", "they", "the candidate").
- NO BUZZWORDS: do not use words like "passionate", "results-driven", "dynamic", "detail-oriented", "seeking".
- Focus purely on hard skills, years of experience, a major achievement, and value added.

TASK 2 — AI SNAPSHOT & GRADUATION ASSESSMENT
Identify the Bachelor's degree passing-out (graduation) year from the resume. Provide a clear, brief assessment covering:
- What to keep: What parts of the current resume are strong and align well.
- What is missing: What critical skills/keywords or details are absent.
- Experience & Graduation Gaps: Analyze the Bachelor's graduation year. If they are a student or recent grad, calculate their student experience (internships, college projects, coding activities before graduation) and show how it counts toward their experience. Note any employment gaps.

TASK 3 — SKILLS RECOMMENDER & INTEGRATION
Recommend:
- Skills to keep: Key skills already in their resume matching the JD.
- Skills to add: Crucial skills required by the JD that are missing.
- Contextual integration advice: Explicit guidance on how to integrate the missing/added skills inside their project descriptions or experience bullets so that they demonstrate hands-on usage rather than just listing them.

TASK 4 — BULLET POINT SUGGESTIONS BY SECTION
Identify all major work experiences and projects in the resume. Group them by section/job title/project name.
Rules for both work experiences and projects:
- You MUST create a section block in the JSON list for EVERY SINGLE work experience (job title/company) and EVERY SINGLE project section listed in the resume. Do not omit, skip, or consolidate any work experience or project.
- Correct all spelling, formatting, and grammar mistakes.
- DO NOT use corporate buzzwords (e.g., "synergize", "leverage", "utilize", "spearhead", "orchestrate") or overly complex, verbose language. Keep the words simple, clear, and direct.
- If a bullet point is already strong, clear, and contains precise metrics (e.g., 'Optimized response time by 30%'), do not change it or suggest only a minor grammar polish.
- If it is weak, vague, or lacks metrics, rewrite it using the action-impact-metric format (Action Verb + Accomplishment + Precise Metric + Tech Used).
- Ensure the metrics are precise and realistic, and the rewritten bullets are copy-paste ready and extremely clear for a recruiter's 5-second scan.
- DO NOT mention the words 'Google XYZ formula', 'XYZ formula', or 'XYZ' anywhere in your rewritten bullet points or text.
- Bullet Limits:
  - For work experience sections: limit to max 2 rewritten bullets.
  - For project sections: limit to max 3 suggested/rewritten bullets.

Return ONLY valid JSON (no markdown, no backticks):
{{
  "summary": "<the professional summary>",
  "ai_snapshot": {{
    "keep": "<brief bullet points or paragraph of what is strong>",
    "missing": "<brief bullet points or paragraph of what is missing>",
    "experience_gap": "<brief assessment of graduation year, student experience vs post-grad experience, and employment history gaps>"
  }},
  "skills_recommendation": {{
    "keep_skills": ["<skill 1>", "<skill 2>"],
    "add_skills": ["<skill 1>", "<skill 2>"],
    "integration_advice": "<detailed advice on how they should write about and demonstrate these skills contextually in their projects and experiences>"
  }},
  "sections": [
    {{
      "title": "<Job Title at Company or Project Name>",
      "bullets": [
        {{"original": "<original bullet or 'N/A for new suggestions'>", "rewritten": "<suggested improved bullet point>"}}
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
            max_tokens=3000,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r'^```[a-z]*\n?', '', raw)
        raw = re.sub(r'\n?```$', '', raw)
        result = json.loads(raw)

        if analysis_id:
            try:
                select_res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
                existing = {}
                if select_res.data:
                    existing = select_res.data[0].get("improvement_suggestions") or {}
                
                existing["suggestions"] = result
                
                supabase.table("analyses").update({
                    "improvement_suggestions": existing
                }).eq("id", analysis_id).execute()
            except Exception as db_err:
                print("Failed to save suggestions to history:", str(db_err))

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
        jd_data = extract_jd_keywords(job_description)
        jd_keywords = jd_data.get("keywords", [])
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
        "job_analysis": {
            "role_focus": jd_data.get("role_focus", "Core software developer role focused on technical requirements."),
            "recruiter_needs": jd_data.get("recruiter_needs", "A candidate possessing the listed technical skills and qualifications.")
        },
        "message": "Guest analysis complete"
    }