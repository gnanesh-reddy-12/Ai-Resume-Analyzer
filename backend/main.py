from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import os
import pdfplumber
import docx
import io
import re
import json
from difflib import SequenceMatcher

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is working"}

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
    for w in filtered:
        if w.lower() not in [x.lower() for x in seen]:
            seen.append(w)
    return " ".join(seen[:max_words])



def extract_jd_keywords(job_description: str) -> list[str]:
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
            {"role": "system", "content": "You extract ATS keywords. Return only a JSON array of strings."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=400,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r'^```[a-z]*\n?', '', raw)
    raw = re.sub(r'\n?```$', '', raw)

    try:
        keywords = json.loads(raw)
        return [str(k).strip() for k in keywords if k]
    except Exception:
        words = re.findall(r'"([^"]+)"', raw)
        return words if words else []



def fuzzy_match(word: str, text: str, threshold: float = 0.82) -> bool:
    word_lower = word.lower()
    text_lower = text.lower()

    if word_lower in text_lower:
        return True

    text_words = re.findall(r'\b\w[\w+#.\-]*\b', text_lower)
    for tw in text_words:
        ratio = SequenceMatcher(None, word_lower, tw).ratio()
        if ratio >= threshold:
            return True

    return False


def calculate_scores(
    resume_text: str,
    jd_keywords: list[str]
) -> tuple[list, list, int, int, int]:

    matched = []
    missing = []

    for kw in jd_keywords:
        if fuzzy_match(kw, resume_text):
            matched.append(kw)
        else:
            missing.append(kw)

    total = len(jd_keywords)
    keyword_score = int((len(matched) / total) * 100) if total > 0 else 50

    # Semantic score: check how many compressed JD meaningful words appear in resume
    jd_words = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b', compress_text(jd_keywords.__str__(), 300)))
    resume_words = set(re.findall(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b', resume_text.lower()))
    overlap = len(jd_words & {w.lower() for w in resume_words})
    semantic_score = min(int((overlap / max(len(jd_words), 1)) * 150), 100)

    # Weighted ATS score
    ats_score = int(keyword_score * 0.55 + semantic_score * 0.45)
    ats_score = max(0, min(ats_score, 100))

    return matched[:15], missing[:15], keyword_score, semantic_score, ats_score



def generate_suggestions(
    resume_text: str,
    job_description: str,
    missing_keywords: list[str],
    ats_score: int
) -> dict:

    compressed_resume = compress_text(resume_text, max_words=250)
    compressed_jd = compress_text(job_description, max_words=150)
    missing_str = ", ".join(missing_keywords[:12]) if missing_keywords else "None"

    prompt = f"""You are an expert ATS resume coach helping students and professionals pass ATS scanners.

Resume (compressed): {compressed_resume}
Job Description (compressed): {compressed_jd}
ATS Score: {ats_score}/100
Missing Keywords: {missing_str}

Return ONLY valid JSON with this structure:
{{
  "apply_verdict": "<one line: 'Strong match — apply confidently' OR 'Good match — minor fixes needed' OR 'Needs improvement before applying' OR 'Not a match — significant gaps'>",
  "improvement_suggestions": [
    {{"section": "<Summary/Experience/Skills/Education>", "issue": "<specific problem>", "fix": "<exact actionable fix with example>"}}
  ],
  "rewritten_bullets": [
    "<rewritten bullet with action verb + metric + impact>",
    "<rewritten bullet 2>",
    "<rewritten bullet 3>"
  ],
  "strong_action_verbs": ["<verb1>","<verb2>","<verb3>","<verb4>","<verb5>","<verb6>","<verb7>","<verb8>"],
  "summary_suggestion": "<2-3 sentence tailored professional summary for this specific JD>"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an ATS resume expert. Return only valid JSON. No markdown, no backticks."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
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
    job_description: str = Form(...)
):
    if not (resume.filename.endswith(".pdf") or resume.filename.endswith(".docx")):
        return {"error": "Only PDF and DOCX files are supported"}

    contents = await resume.read()
    resume_text = extract_text(resume.filename, contents)

    if not resume_text.strip():
        return {"error": "Could not extract text. Make sure the resume is not a scanned image."}

    try:
        # Call 1: Extract JD keywords (~400 tokens)
        jd_keywords = extract_jd_keywords(job_description)

        # Backend: Calculate all scores (no AI, pure Python)
        matched_keywords, missing_keywords, keyword_score, semantic_score, ats_score = calculate_scores(
            resume_text, jd_keywords
        )

        # Call 2: Generate suggestions (~1200 tokens)
        suggestions = generate_suggestions(
            resume_text, job_description, missing_keywords, ats_score
        )

    except Exception as e:
        return {"error": f"Analysis error: {str(e)}"}

    return {
        "filename": resume.filename,
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