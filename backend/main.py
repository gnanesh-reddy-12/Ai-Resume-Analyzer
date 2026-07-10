from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from groq import Groq
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client
import os
import pdfplumber
import io
import re
import json
from difflib import SequenceMatcher
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(os.getenv("SUPABASE_URL"), supabase_key)
security = HTTPBearer()

MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024  # 2MB
limiter = Limiter(key_func=get_remote_address)

ALLOWED_ORIGINS = [
    "https://ai-resume-analyzer-two-red.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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

@app.head("/")
async def root_head():
    return JSONResponse(content={}, status_code=200)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
    )


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        response = supabase.auth.get_user(credentials.credentials)
        if not response or not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": response.user.id, "email": response.user.email}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")


@app.get("/history")
async def get_history(user=Depends(verify_token)):
    result = supabase.table("analyses") \
        .select("*") \
        .eq("user_id", user["user_id"]) \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()
    return {"analyses": result.data}


@app.get("/history/{analysis_id}")
async def get_single_history(analysis_id: str, user=Depends(verify_token)):
    result = supabase.table("analyses") \
        .select("*") \
        .eq("id", analysis_id) \
        .eq("user_id", user["user_id"]) \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Analysis not found or unauthorized")
    return {"analysis": result.data[0]}


@app.delete("/history/{analysis_id}")
async def delete_analysis(analysis_id: str, user=Depends(verify_token)):
    supabase.table("analyses") \
        .delete() \
        .eq("id", analysis_id) \
        .eq("user_id", user["user_id"]) \
        .execute()
    return {"message": "Deleted"}


def clean_text(text: str) -> str:
    text = re.sub(r'[ \t]+', ' ', text)
    return re.sub(r'\n+', '\n', text).strip()


def extract_text_from_pdf(contents: bytes) -> str:
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    return clean_text(text)


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
            if is_unusual and not any(s in clean for s in STANDARD_HEADINGS):
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
    seen, seen_lower = [], set()
    for w in words:
        if w.lower() not in stopwords and w.lower() not in seen_lower:
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

    if re.search(rf'\b{re.escape(word_lower)}\b', text_lower):
        return True
    if any(syn in text_lower for syn in expand_synonyms(word_lower)):
        return True

    kw_stopwords = {"and", "or", "of", "in", "to", "for", "with", "on", "at", "by", "from", "the", "a", "an", "skills", "experience", "knowledge", "expertise"}
    kw_words = [w for w in re.findall(r'\b[a-zA-Z0-9][a-zA-Z0-9+#.\-]*', word_lower) if w not in kw_stopwords]

    if len(kw_words) >= 2:
        match_count = sum(1 for w in kw_words if w in text_lower or any(syn in text_lower for syn in expand_synonyms(w)))
        if match_count == len(kw_words):
            return True
        core_suffixes = {"developer", "engineer", "framework", "library", "platform", "tool", "tools", "service", "services", "system", "systems", "architecture", "methodology", "methodologies", "principles", "concepts", "practices", "experience", "degree"}
        if len(kw_words) == 2 and kw_words[1] in core_suffixes:
            if kw_words[0] in text_lower or any(syn in text_lower for syn in expand_synonyms(kw_words[0])):
                return True

    return any(
        SequenceMatcher(None, word_lower, tw).ratio() >= threshold
        for tw in re.findall(r'\b[a-zA-Z0-9][a-zA-Z0-9+#.\-]*', text_lower)
    )


def calculate_scores(resume_text: str, jd_keyword_groups: list):
    matched, missing, optional = [], [], []
    fulfilled_groups = 0

    for group in jd_keyword_groups:
        if not isinstance(group, list):
            group = [str(group)]
        
        group_matched = []
        group_unmatched = []
        for kw in group:
            if fuzzy_match(kw, resume_text):
                group_matched.append(kw)
            else:
                group_unmatched.append(kw)
        
        if len(group_matched) > 0:
            fulfilled_groups += 1
            matched.extend(group_matched)
            optional.extend(group_unmatched)
        else:
            missing.extend(group_unmatched)

    import math
    total_groups = len(jd_keyword_groups)
    kw_ratio = fulfilled_groups / total_groups if total_groups > 0 else 0
    keyword_score = int(math.pow(kw_ratio, 0.35) * 100) if total_groups > 0 else 50
    
    stopwords = {
        "a","an","the","and","or","but","in","on","at","to","for","of","with",
        "is","are","was","were","be","been","have","has","had","will","would",
        "could","should","this","that","as","by","from","also","such","than",
        "then","so","if","when","where","while","all","both","each","more",
        "most","other","some","any","only","just","well","good","great","new"
    }
    
    flat_keywords = [kw for group in jd_keyword_groups for kw in group if isinstance(group, list)]
    if not flat_keywords and jd_keyword_groups:
        flat_keywords = jd_keyword_groups # fallback if flat list was passed

    jd_words = {
        w for w in re.findall(r'\b[a-zA-Z0-9][a-zA-Z0-9+#.\-]{1,}', " ".join(flat_keywords).lower())
        if w not in stopwords
    }
    matched_semantic = sum(1 for w in jd_words if fuzzy_match(w, resume_text.lower()))
    sem_ratio = matched_semantic / max(len(jd_words), 1)
    semantic_score = min(int(math.pow(sem_ratio, 0.35) * 100), 100)
    ats_score = max(0, min(int(keyword_score * 0.5 + semantic_score * 0.5), 100))
    
    return matched[:20], missing[:20], optional[:20], keyword_score, semantic_score, ats_score



def _gemini(prompt: str, schema: dict) -> dict:
    def strip_props(d):
        if not isinstance(d, dict): return d
        return {k: strip_props(v) if isinstance(v, dict) else [strip_props(i) for i in v] if isinstance(v, list) else v for k, v in d.items() if k != "additionalProperties"}
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    r = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json", "response_schema": strip_props(schema)},
        request_options={"timeout": 5}
    )
    return json.loads(r.text)

def _groq(prompt: str, schema: dict, max_tokens: int = 3000) -> dict:
    raw = groq_client.chat.completions.with_raw_response.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_schema", "json_schema": {"name": "analysis", "schema": schema, "strict": True}},
        max_completion_tokens=max_tokens,
        temperature=0.3,
        timeout=15,
    )
    print(f"[Groq RateLimit] remaining_tokens: {raw.headers.get('x-ratelimit-remaining-tokens')}")
    print(f"[Groq RateLimit] remaining_requests: {raw.headers.get('x-ratelimit-remaining-requests')}")
    completion = raw.parse()
    return json.loads(completion.choices[0].message.content)

import time
from collections import deque
from threading import Lock

_token_budget = deque()
_lock = Lock()

ENDPOINT_TOKEN_ESTIMATE = {
    "analyze": 1200,
    "improve": 2800,
    "cover_letter": 1200,
    "mock_interview": 2800,
}

def _throttle(estimated_tokens=2500):
    with _lock:
        now = time.time()
        while _token_budget and now - _token_budget[0][0] > 60:
            _token_budget.popleft()
        used = sum(t for _, t in _token_budget)
        if used + estimated_tokens > 7800:
            wait = 60 - (now - _token_budget[0][0])
            time.sleep(max(wait, 0))
        _token_budget.append((time.time(), estimated_tokens))

def generate_with_fallback(prompt: str, schema: dict, quality_first: bool = False, max_tokens: int = 3000) -> dict:
    providers = [("gemini", _gemini), ("groq", _groq)] if quality_first else [("groq", _groq), ("gemini", _gemini)]
    for name, fn in providers:
        try:
            t0 = time.perf_counter()
            result = fn(prompt, schema, max_tokens) if name == "groq" else fn(prompt, schema)
            t1 = time.perf_counter()
            print(f"[generate_with_fallback] served by: {name} in {t1 - t0:.2f}s")
            return result
        except Exception as e:
            t1 = time.perf_counter()
            print(f"Provider {name} failed in {t1 - t0:.2f}s: {e}")
            continue
    raise RuntimeError("Both AI providers exhausted")

JD_SCHEMA = {
    "type": "object",
    "properties": {
        "keyword_groups": {
            "type": "array",
            "items": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "role_focus": {"type": "string"},
        "recruiter_needs": {"type": "string"}
    },
    "required": ["keyword_groups", "role_focus", "recruiter_needs"],
    "additionalProperties": False
}

IMPROVE_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "ai_snapshot": {
            "type": "object",
            "properties": {
                "keep": {"type": "string"},
                "missing": {"type": "string"},
                "experience_gap": {"type": "string"}
            },
            "required": ["keep", "missing", "experience_gap"],
            "additionalProperties": False
        },
        "skills_recommendation": {
            "type": "object",
            "properties": {
                "keep_skills": {"type": "array", "items": {"type": "string"}},
                "add_skills": {"type": "array", "items": {"type": "string"}},
                "integration_advice": {"type": "string"}
            },
            "required": ["keep_skills", "add_skills", "integration_advice"],
            "additionalProperties": False
        },
        "sections": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "bullets": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "original": {"type": "string"},
                                "rewritten": {"type": "string"}
                            },
                            "required": ["original", "rewritten"],
                            "additionalProperties": False
                        }
                    }
                },
                "required": ["title", "bullets"],
                "additionalProperties": False
            }
        }
    },
    "required": ["summary", "ai_snapshot", "skills_recommendation", "sections"],
    "additionalProperties": False
}

COVER_LETTER_SCHEMA = {
    "type": "object",
    "properties": {
        "cover_letter": {"type": "string"}
    },
    "required": ["cover_letter"],
    "additionalProperties": False
}

INTERVIEW_SCHEMA = {
    "type": "object",
    "properties": {
        "role_category": {"type": "string"},
        "company_tier": {"type": "string"},
        "seniority_detected": {"type": "string"},
        "total_rounds": {"type": "integer"},
        "rounds": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "round": {"type": "string"},
                    "interviewer": {"type": "string"},
                    "duration": {"type": "string"},
                    "focus": {"type": "string"},
                    "prep_tip": {"type": "string"},
                    "questions": {
                        "type": "array",
                        "items": {"type": "string"}
                    }
                },
                "required": ["round", "interviewer", "duration", "focus", "prep_tip", "questions"],
                "additionalProperties": False
            }
        }
    },
    "required": ["role_category", "company_tier", "seniority_detected", "total_rounds", "rounds"],
    "additionalProperties": False
}


def extract_jd_keywords(job_description: str) -> dict:
    cleaned_jd = clean_text(job_description)
    prompt = f"""Analyze this job description precisely.

CRITICAL RULES:
1. Be EXHAUSTIVE with technical skills. Extract every single programming language, tool, framework, and methodology mentioned.
2. For OR-lists of technical skills (e.g., "Java, Python, C/C++ or SQL"), group them into a single sub-array. 
3. For AND-lists of technical skills (e.g., "unit testing, debugging, and code reviews"), do NOT group them! They are mandatory separate skills. Output them as separate single-element arrays: [["unit testing"], ["debugging"], ["code reviews"]].
3. For DEGREE requirements that list multiple alternative majors or fields of study, do NOT extract the specific acronyms or majors. Condense them into a single general requirement (e.g., "Bachelor's degree", "Master's degree", or "PhD"). This prevents false matches on short acronyms and keeps the system generic for all professions.
4. If a skill is a standalone requirement (e.g., "Agile"), it should be in its own single-element sub-array.
5. Extract ONLY what is explicitly stated. Do not invent synonyms.

Extract:
1. Every ATS keyword (skills, tools, frameworks, degrees) grouped into arrays of alternatives.
2. role_focus: In 2 sentences, state exactly what this role does day-to-day. Be specific to this JD.
3. recruiter_needs: In 2 sentences, state exactly what kind of candidate the recruiter wants.

Return ONLY valid JSON. No explanation, no markdown, no backticks.
Format:
{{
  "keyword_groups": [
    ["Python", "Java", "C++", "SQL"],
    ["React"],
    ["AWS", "GCP", "Azure"],
    ["Bachelor's degree", "Computer Science Degree"]
  ],
  "role_focus": "Builds and maintains scalable REST APIs using Python and FastAPI, owning backend services end-to-end.",
  "recruiter_needs": "A backend engineer with 2+ years of hands-on Python experience who has shipped production APIs and can work independently without hand-holding."
}}

Job Description:
{cleaned_jd}"""

    try:
        _throttle(ENDPOINT_TOKEN_ESTIMATE["analyze"])
        data = generate_with_fallback(prompt, JD_SCHEMA)
        if "keyword_groups" not in data and "keywords" in data:
            data["keyword_groups"] = [[k] for k in data["keywords"]]
        elif "keyword_groups" not in data:
            data["keyword_groups"] = []
        return data
    except Exception:
        return {
            "keyword_groups": [],
            "role_focus": "Core software developer role focused on technical requirements.",
            "recruiter_needs": "A candidate possessing the listed technical skills and qualifications."
        }


def analyze_eligibility(resume_text: str, job_description: str) -> dict:
    return {
        "education": {"resume_level": "Not evaluated", "status": "meets", "note": ""},
        "experience": {
            "estimated_years": 0.0, "estimated_years_str": "Not evaluated",
            "bachelor_graduation_year": None, "student_experience_str": "None",
            "post_graduation_experience_str": "None", "required_years": None,
            "status": "meets", "note": ""
        },
        "languages": {"jd_requires": [], "resume_has": [], "any_sufficient": True, "status": "meets", "note": ""}
    }


def _parse_pdf(resume: UploadFile):
    if not resume.filename.endswith(".pdf"):
        return None, None, {"error": "Only PDF files are supported"}
    return None, None, None


@app.post("/analyze")
@limiter.limit("5/minute")
async def analyze_resume(
    request: Request,
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    company_name: str = Form(default=""),
    job_role: str = Form(default=""),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    user = await verify_token(credentials)

    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    contents = await resume.read()

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 2MB")

    if not contents.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. Make sure the resume is not a scanned image.")

    all_warnings = detect_pdf_warnings(contents) + detect_heading_warnings(resume_text)

    try:
        jd_data = extract_jd_keywords(job_description)
        matched_keywords, missing_keywords, optional_keywords, keyword_score, semantic_score, ats_score = calculate_scores(resume_text, jd_data.get("keyword_groups", []))
        eligibility = analyze_eligibility(resume_text, job_description)
        eligibility["job_analysis"] = {
            "role_focus": jd_data.get("role_focus", "Core software developer role focused on technical requirements."),
            "recruiter_needs": jd_data.get("recruiter_needs", "A candidate possessing the listed technical skills and qualifications.")
        }
    except Exception as e:
        return {"error": f"Analysis error: {str(e)}"}

    can_apply = ats_score >= 60 and eligibility["education"]["status"] != "gap"

    result = {
        "filename": resume.filename,
        "company_name": company_name,
        "job_role": job_role,
        "ats_score": ats_score,
        "keyword_score": keyword_score,
        "semantic_score": semantic_score,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "optional_keywords": optional_keywords,
        "can_apply": can_apply,
        "eligibility": eligibility,
        "job_analysis": eligibility["job_analysis"],
        "warnings": all_warnings,
        "message": "Resume analyzed successfully"
    }

    try:
        insert_data = {
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
                "warnings": all_warnings, 
                "optional_keywords": optional_keywords,
                "resume_snapshot_text": resume_text
            },
            "job_description_preview": job_description[:5000]
        }
        
        insert_res = supabase.table("analyses").insert(insert_data).execute()
        if insert_res.data:
            result["id"] = insert_res.data[0]["id"]
    except Exception as e:
        print("Database insert failed:", str(e))

    return result


@app.post("/improve")
@limiter.limit("5/minute")
async def improve_resume(
    request: Request,
    job_description: str = Form(default=""),
    analysis_id: str = Form(default=""),
    resume: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    await verify_token(credentials)

    resume_text = ""
    cleaned_jd = clean_text(job_description)
    
    known_missing = ""
    known_matched = ""
    known_optional = ""
    
    if analysis_id:
        try:
            res = supabase.table("analyses").select("missing_keywords, matched_keywords, improvement_suggestions, job_description_preview").eq("id", analysis_id).execute()
            if res.data:
                row = res.data[0]
                known_missing = ", ".join(row.get("missing_keywords", []))
                known_matched = ", ".join(row.get("matched_keywords", []))
                suggestions = row.get("improvement_suggestions") or {}
                known_optional = ", ".join(suggestions.get("optional_keywords", []))
                
                # Use stored snapshot and JD if not provided
                resume_text = suggestions.get("resume_snapshot_text", "")
                if not cleaned_jd and row.get("job_description_preview"):
                    cleaned_jd = clean_text(row.get("job_description_preview"))
                    
                # If suggestions already exist, just return them
                if suggestions.get("suggestions"):
                    return {"suggestions": suggestions.get("suggestions")}
        except Exception:
            pass

    if not resume_text:
        if not resume or not resume.filename:
            raise HTTPException(status_code=400, detail="Resume file is required if no analysis_id is provided.")
        if not resume.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        if resume.content_type not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Invalid file type")
        contents = await resume.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 2MB")
        if not contents.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. Make sure the resume is not a scanned image.")

    if not cleaned_jd:
        raise HTTPException(status_code=400, detail="Job description is required.")

    cleaned_resume = clean_text(resume_text)


    context_str = ""
    if known_missing or known_matched or known_optional:
        context_str = f"IMPORTANT CONTEXT:\nWe have already verified the candidate HAS these skills: {known_matched}\nWe have already verified the candidate is MISSING these mandatory skills: {known_missing}\nThese skills are strictly OPTIONAL (do not list them as critical gaps): {known_optional}\nDo NOT hallucinate missing skills. Only advise on actual mandatory gaps.\n\n"

    prompt = f"""You are a brutally honest senior resume coach. Recruiters spend 6 seconds on a resume. Every word must earn its place.

{context_str}RESUME:
{cleaned_resume}

JOB DESCRIPTION:
{cleaned_jd}

TASK 1 — PROFESSIONAL SUMMARY
Write exactly 3 sentences. No more, no less.
Rules:
- Start with who they are: title + years of experience + domain.
- Second sentence: their strongest 2-3 technical skills that directly match this JD.
- Third sentence: one specific achievement or the value they bring to this exact role.
- Write in implicit first person resume style: "Software Engineer with 4 years..." not "I am..." not "He is..."
- ZERO buzzwords. Banned words: passionate, results-driven, dynamic, detail-oriented, seeking, synergize, leverage, motivated, hardworking, team player, self-starter.
- Every word must be factual and specific to this person's resume and this JD.

TASK 2 — AI SNAPSHOT
Analyze the resume against the JD. Be specific and direct — no generic advice.
- keep: What is already strong and directly matches the JD. List specific skills, experiences, or achievements worth keeping.
- missing: What critical JD requirements are completely absent from this resume. Be specific — name the exact skills, tools, or experience types missing.
- experience_gap: Find the Bachelor's graduation year. Calculate total experience. If student or recent grad, count internships and projects as experience. Flag any employment gaps longer than 6 months. State clearly if this person is qualified, underqualified, or overqualified for this role.

TASK 3 — SKILLS ADVICE
- keep_skills: Skills already in resume that match JD keywords. List only relevant ones.
- add_skills: Skills required by JD that are missing from resume. List only what actually matters for this role.
- integration_advice: Tell them exactly WHERE and HOW to add missing skills — which project or job description to update, what sentence to write, how to show hands-on usage not just listing. Be specific and direct. No filler.

TASK 4 — BULLET POINT REWRITE
Rewrite every bullet point from every job and project using the Accomplished [X] as measured by [Y] by doing [Z] formula — known as XYZ formula by Google recruiters. This means: strong action verb + specific accomplishment + measurable metric + method or technology used.

Rules:
- Cover EVERY job title and EVERY project. Do not skip or merge any.
- If a bullet already has a strong action verb + specific metric + technology, keep it as-is or fix grammar only.
- If weak, vague, or missing metrics — rewrite it fully using XYZ formula.
- Use realistic metrics based on context clues in the resume. Never fabricate absurd numbers.
- Include JD keywords naturally inside rewritten bullets where they fit.
- ZERO buzzwords. Banned: spearhead, leverage, utilize, synergize, orchestrate, dynamic, passionate.
- Keep language simple and direct. A recruiter must understand it in 3 seconds.
- Work experience: max 2 rewritten bullets per role.
- Projects: max 3 rewritten bullets per project.
- Do NOT mention "XYZ formula", "Google formula", or "XYZ" anywhere in output.

Return ONLY valid JSON. No markdown, no backticks, no explanation:
{{
  "summary": "<3 sentence summary>",
  "ai_snapshot": {{
    "keep": "<specific strengths that match this JD>",
    "missing": "<specific gaps against this JD>",
    "experience_gap": "<graduation year, experience calculation, gap analysis, qualification verdict>"
  }},
  "skills_recommendation": {{
    "keep_skills": ["<skill>"],
    "add_skills": ["<skill>"],
    "integration_advice": "<specific actionable advice on where and how to add missing skills>"
  }},
  "sections": [
    {{
      "title": "<Job Title at Company or Project Name>",
      "bullets": [
        {{"original": "<original bullet>", "rewritten": "<XYZ formula rewritten bullet>"}}
      ]
    }}
  ]
}}"""

    try:
        _throttle(ENDPOINT_TOKEN_ESTIMATE["improve"])
        result = generate_with_fallback(prompt, IMPROVE_SCHEMA, quality_first=False, max_tokens=4096)

        if analysis_id:
            try:
                select_res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
                existing = (select_res.data[0].get("improvement_suggestions") or {}) if select_res.data else {}
                existing["suggestions"] = result
                supabase.table("analyses").update({"improvement_suggestions": existing}).eq("id", analysis_id).execute()
            except Exception as db_err:
                print("Failed to save suggestions to history:", str(db_err))

        return {"suggestions": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to generate improvements: {str(e)}")


@app.post("/analyze/guest")
@limiter.limit("2/minute")
async def analyze_guest(
    request: Request,
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if resume.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Invalid file type")

    contents = await resume.read()

    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 2MB")

    if not contents.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Invalid PDF file")

    resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text. Make sure the resume is not a scanned image.")

    try:
        jd_data = extract_jd_keywords(job_description)
        matched_keywords, missing_keywords, optional_keywords, keyword_score, semantic_score, ats_score = calculate_scores(resume_text, jd_data.get("keyword_groups", []))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

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


@app.post("/cover-letter")
@limiter.limit("5/minute")
async def generate_cover_letter(
    request: Request,
    job_description: str = Form(...),
    company_name: str = Form(default=""),
    analysis_id: str = Form(default=""),
    resume: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    await verify_token(credentials)

    resume_text = ""
    if analysis_id:
        try:
            res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
            if res.data:
                suggestions = res.data[0].get("improvement_suggestions") or {}
                known_cover_letter = suggestions.get("cover_letter_text")
                if known_cover_letter:
                    return {"cover_letter": known_cover_letter}
                resume_text = suggestions.get("resume_snapshot_text", "")
        except Exception:
            pass

    if not resume_text:
        if not resume or not resume.filename:
            raise HTTPException(status_code=400, detail="Resume file is required if no analysis_id is provided.")
        if not resume.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        if resume.content_type not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Invalid file type")
        contents = await resume.read()
        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 2MB")
        if not contents.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="Invalid PDF file")
        resume_text = extract_text_from_pdf(contents)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume.")

    cleaned_resume = clean_text(resume_text)
    cleaned_jd = clean_text(job_description)

    prompt = f"""You are an expert career coach writing a cover letter for a job applicant.

STRICT RULES:
1. Use ONLY facts, skills, and experiences explicitly present in the resume. Do not invent anything.
2. Banned words: passionate, results-driven, dynamic, detail-oriented, seeking, synergize, leverage, motivated, hardworking, team player, self-starter, excited, thrilled.
3. Do NOT start the letter with "I". Open with the role, company, or a specific accomplishment.
4. Exactly 3 paragraphs, maximum 80 words each.
   - Paragraph 1: The role you are applying for and one specific reason this company over others.
   - Paragraph 2: Two specific accomplishments from the resume with measurable impact that directly match the JD.
   - Paragraph 3: One forward-looking sentence about what you bring to this team, then a call to action.
5. Write in first person, professional but direct tone. No fluff.
6. Do not include subject line, date, address headers, or sign-off. Body only.

Company: {company_name}
Job Description: {cleaned_jd}
Resume: {cleaned_resume}"""

    try:
        _throttle(ENDPOINT_TOKEN_ESTIMATE["cover_letter"])
        result = generate_with_fallback(prompt, COVER_LETTER_SCHEMA)
        cover_letter_result = result.get("cover_letter", "")

        if analysis_id:
            try:
                select_res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
                if select_res.data:
                    existing = select_res.data[0].get("improvement_suggestions") or {}
                    existing["cover_letter_text"] = cover_letter_result
                    supabase.table("analyses").update({"improvement_suggestions": existing}).eq("id", analysis_id).execute()
            except Exception as e:
                print("Failed to save cover letter:", str(e))

        return {"cover_letter": cover_letter_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")


@app.post("/mock-interview")
@limiter.limit("5/minute")
async def generate_mock_interview(
    request: Request,
    job_description: str = Form(...),
    experience_years: float = Form(default=0),
    analysis_id: str = Form(default=""),
    resume: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    await verify_token(credentials)
    cleaned_jd = clean_text(job_description)

    resume_text = ""
    if analysis_id:
        try:
            res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
            if res.data:
                suggestions = res.data[0].get("improvement_suggestions") or {}
                known_interview = suggestions.get("interview_questions")
                if known_interview:
                    return {"interview_plan": known_interview}
                resume_text = suggestions.get("resume_snapshot_text", "")
        except Exception:
            pass

    if not resume_text:
        if resume and resume.filename:
            try:
                contents = await resume.read()
                if len(contents) <= MAX_FILE_SIZE_BYTES and contents.startswith(b"%PDF"):
                    extracted = extract_text_from_pdf(contents)
                    if extracted.strip():
                        resume_text = clean_text(extracted)
            except Exception:
                pass

    if not resume_text:
        resume_text = "No resume provided. Generate mock interview questions based solely on the JD and experience level."

    if experience_years == 0:
        seniority = "fresher (0 years experience, focus on fundamentals, DSA basics, internship projects)"
    elif experience_years <= 2:
        seniority = "junior (1-2 years experience, focus on practical coding, debugging, small system design)"
    elif experience_years <= 5:
        seniority = "mid-level (3-5 years experience, focus on system design, code quality, ownership, LLD)"
    else:
        seniority = "senior (6+ years experience, focus on HLD, architecture decisions, leadership, mentoring)"

    prompt = f"""You are a senior hiring manager and technical interviewer with 15 years of experience at top-tier product companies. You have conducted thousands of real interviews across all roles and seniority levels.

Your job is to generate a REALISTIC, COMPLETE mock interview plan that mirrors what this specific company actually asks in their real interviews for this exact role.

INPUTS:
- Job Description: {cleaned_jd}
- Candidate Profile: {resume_text}
- Stated Experience: {seniority}

STEP 1 — DETECT ROLE CATEGORY
Read the JD carefully. Classify into one of: Software Engineer, Data Engineer, Data Analyst, ML Engineer, DevOps/SRE, Product Manager, Marketing, Sales, Finance, Design, Operations, or Other. This controls which round types you generate.

STEP 2 — DETECT COMPANY TIER
- FAANG/Top-tier (Google, Apple, Meta, Amazon, Microsoft, Netflix, etc): heavy DSA, system design scales with seniority
- Product startups: practical coding, real-world problem solving, cultural fit
- Service companies (TCS, Infosys, Wipro, Accenture, etc): aptitude, basic coding, HR rounds
- Domain-specific (finance, healthcare, etc): domain knowledge rounds added

STEP 3 — DETECT CANDIDATE LEVEL from resume, NOT just experience_years input
- Has shipped production systems with real metrics = junior, not fresher
- Has only coursework and no deployed projects = fresher
- 3-5 years real work = mid-level
- 6+ years = senior

STEP 4 — GENERATE ROUNDS based on all three factors above

ROUND RULES BY ROLE:
Software Engineer:
- Fresher/Junior: Online Assessment (DSA easy-medium) → Technical (OOP, debugging, unit testing) → Behavioral → HR
- Mid: DSA medium-hard → System Design (API design, database schema, NOT distributed systems) → Behavioral → HR  
- Senior: DSA hard → HLD/System Design → Leadership/Behavioral → HR

Data Analyst: SQL round → Statistics/Analytics thinking → Case study (given a dataset, find insights) → Behavioral → HR. NO DSA rounds.

ML Engineer: Python/coding → ML concepts (bias-variance, model selection, metrics) → Case study (build a model for X problem) → System Design (ML pipeline, not software architecture) → Behavioral

Marketing/Sales: Campaign thinking round → Case study → Stakeholder communication → Behavioral → HR. NO technical rounds.

DevOps/SRE: Linux/networking fundamentals → CI/CD and infrastructure → Incident response scenario → Behavioral

CRITICAL SENIORITY RULES:
- Experience under 3 years OR early careers JD: NEVER ask HLD, microservices, distributed systems
- Fresher with strong projects (deployed APIs, real metrics): treat as junior, ask light system design (design a REST API for X, design a database schema for Y)
- FAANG early careers: DSA is mandatory but keep it easy-medium (arrays, strings, trees). One light design round maximum.
- Service company fresher: aptitude + verbal reasoning round first, then basic coding, then HR

QUESTION QUALITY RULES:
- Every question must be specific to THIS job description and THIS candidate's resume
- Reference the candidate's actual projects when relevant (e.g. "You built an ML classifier — how would you handle class imbalance in a larger dataset?")
- Include the exact technologies mentioned in the JD in technical questions
- Behavioral questions must use STAR format prompts
- Situational questions must be realistic day-to-day scenarios from this specific role
- Do NOT ask generic questions like "Tell me about yourself" or "What are your strengths"
- Each round must have 3-4 questions. No more, no less.
- Total rounds: minimum 3, maximum 5

PREPARATION TIPS:
For each round, add a "prep_tip" field — one specific, actionable tip on how to prepare for that round based on this JD and candidate profile.

Return ONLY valid JSON. No markdown, no backticks:
{{
  "role_category": "",
  "company_tier": "",
  "seniority_detected": "",
  "total_rounds": 0,
  "rounds": [
    {{
      "round": "",
      "interviewer": "",
      "duration": "",
      "focus": "",
      "prep_tip": "",
      "questions": ["", "", ""]
    }}
  ]
}}"""

    try:
        _throttle(ENDPOINT_TOKEN_ESTIMATE["mock_interview"])
        result = generate_with_fallback(prompt, INTERVIEW_SCHEMA)

        if not isinstance(result, dict) or "rounds" not in result:
            raise ValueError("Invalid format returned by AI")

        if analysis_id:
            try:
                select_res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
                if select_res.data:
                    existing = select_res.data[0].get("improvement_suggestions") or {}
                    existing["interview_questions"] = result
                    supabase.table("analyses").update({"improvement_suggestions": existing}).eq("id", analysis_id).execute()
            except Exception as e:
                print("Failed to save interview prep:", str(e))

        return {"interview_plan": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mock interview generation failed: {str(e)}")