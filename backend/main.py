from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import anthropic
from dotenv import load_dotenv
import os
import pdfplumber
import docx
import io
import re
import json

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

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


def extract_text_from_file(filename: str, contents: bytes) -> str:
    text = ""

    if filename.endswith(".pdf"):
        pdf_file = io.BytesIO(contents)
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

    elif filename.endswith(".docx"):
        doc_file = io.BytesIO(contents)
        document = docx.Document(doc_file)
        for para in document.paragraphs:
            text += para.text + "\n"

    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def build_analysis_prompt(resume_text: str, job_description: str) -> str:
    return f"""You are a professional ATS (Applicant Tracking System) expert and resume coach.

Analyze the resume below against the job description and return ONLY a valid JSON object — no markdown, no extra text, no backticks, no preamble.

Resume:
{resume_text[:3000]}

Job Description:
{job_description[:2000]}

Return this exact JSON structure:

{{
  "ats_score": <integer 0-100, overall ATS compatibility score>,
  "keyword_score": <integer 0-100, how well resume keywords match the JD>,
  "semantic_score": <integer 0-100, how semantically aligned the resume is with the JD>,
  "matched_keywords": [<list of up to 15 important keywords/skills found in BOTH resume and JD>],
  "missing_keywords": [<list of up to 15 important keywords/skills in JD but NOT in resume>],
  "can_apply": <true if ats_score >= 60, false otherwise>,
  "apply_verdict": "<one line verdict like 'Strong match — apply confidently' or 'Needs improvement before applying'>",
  "improvement_suggestions": [
    {{
      "section": "<resume section like Summary, Experience, Skills, etc.>",
      "issue": "<what is weak or missing>",
      "fix": "<specific actionable fix with example text or bullet point>"
    }}
  ],
  "rewritten_bullets": [
    "<rewritten bullet point 1 using strong action verbs and metrics>",
    "<rewritten bullet point 2>",
    "<rewritten bullet point 3>"
  ],
  "strong_action_verbs": [<list of 8 action verbs relevant to this JD>],
  "summary_suggestion": "<a suggested 2-3 sentence professional summary tailored to this JD>"
}}

Scoring rules:
- keyword_score: count exact and synonym matches of technical skills, tools, and role-specific terms
- semantic_score: assess conceptual alignment of experience, responsibilities, and domain knowledge
- ats_score: weighted average (keyword_score * 0.45 + semantic_score * 0.55), adjust ±5 for formatting quality
- Be strict and honest — 75+ means genuinely competitive for the role"""


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not (resume.filename.endswith(".pdf") or resume.filename.endswith(".docx")):
        return {"error": "Only PDF and DOCX files are supported"}

    contents = await resume.read()
    resume_text = extract_text_from_file(resume.filename, contents)

    if not resume_text.strip():
        return {"error": "Could not extract text from the resume. Make sure it is not a scanned image."}

    prompt = build_analysis_prompt(resume_text, job_description)

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        raw = message.content[0].text.strip()

        if raw.startswith("```"):
            raw = re.sub(r'^```[a-z]*\n?', '', raw)
            raw = re.sub(r'\n?```$', '', raw)

        data = json.loads(raw)

    except json.JSONDecodeError as e:
        return {
            "filename": resume.filename,
            "job_description_length": len(job_description),
            "resume_text_preview": resume_text[:700],
            "ats_score": 0,
            "keyword_score": 0,
            "semantic_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "can_apply": False,
            "apply_verdict": "Analysis failed — please try again",
            "improvement_suggestions": [],
            "rewritten_bullets": [],
            "strong_action_verbs": [],
            "summary_suggestion": "",
            "message": f"Parse error: {str(e)}",
            "error": "JSON parse failed"
        }

    except anthropic.APIError as e:
        return {"error": f"Claude API error: {str(e)}"}

    return {
        "filename": resume.filename,
        "job_description_length": len(job_description),
        "resume_text_preview": resume_text[:700],
        "ats_score": data.get("ats_score", 0),
        "keyword_score": data.get("keyword_score", 0),
        "semantic_score": data.get("semantic_score", 0),
        "matched_keywords": data.get("matched_keywords", [])[:15],
        "missing_keywords": data.get("missing_keywords", [])[:15],
        "can_apply": data.get("can_apply", False),
        "apply_verdict": data.get("apply_verdict", ""),
        "improvement_suggestions": data.get("improvement_suggestions", []),
        "rewritten_bullets": data.get("rewritten_bullets", []),
        "strong_action_verbs": data.get("strong_action_verbs", []),
        "summary_suggestion": data.get("summary_suggestion", ""),
        "message": "Resume analyzed successfully"
    }