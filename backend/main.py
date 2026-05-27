from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai
from dotenv import load_dotenv
import os
import pdfplumber
import docx
import io
import re
from keybert import KeyBERT

# Initialize models & env
load_dotenv()
kw_model = KeyBERT()
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

app = FastAPI()

# Allow frontend connection
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


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):

    extracted_text = ""
    if not (
        resume.filename.endswith(".pdf")
        or resume.filename.endswith(".docx")
    ):
        return {
            "message": "Only PDF and DOCX files are supported"
        }

    # PDF parsing
    if resume.filename.endswith(".pdf"):
        contents = await resume.read()
        pdf_file = io.BytesIO(contents)
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                extracted_text += page.extract_text() or ""

    # DOCX parsing
    elif resume.filename.endswith(".docx"):
        contents = await resume.read()
        doc_file = io.BytesIO(contents)
        document = docx.Document(doc_file)
        for para in document.paragraphs:
            extracted_text += para.text + "\n"

    extracted_text = re.sub(r'([a-z])([A-Z])', r'\1 \2', extracted_text)
    extracted_text = re.sub(r'\s+', ' ', extracted_text)
    extracted_text = extracted_text.strip()

    # Dynamic keyword extraction from job description
    stop_words = set(stopwords.words("english"))

    keywords = kw_model.extract_keywords(
        job_description,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        top_n=15
    )

    keywords = [kw[0].lower() for kw in keywords]

    # Resume lowercase
    resume_lower = extracted_text.lower()

    matched_keywords = []
    missing_keywords = []

    # Keyword matching
    for keyword in keywords:
        if keyword in resume_lower:
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)

    # Keyword score
    total_keywords = len(matched_keywords) + len(missing_keywords)

    if total_keywords > 0:
        keyword_score = (
            len(matched_keywords) / total_keywords
        ) * 100
    else:
        keyword_score = 50

    # Semantic similarity using NLP
    resume_embedding = semantic_model.encode([resume_lower])

    jd_embedding = semantic_model.encode(
        [job_description.lower()]
    )

    semantic_score = cosine_similarity(
        resume_embedding,
        jd_embedding
    )[0][0] * 100

    # Final ATS score
    ats_score = int(
        (keyword_score * 0.4) + (semantic_score * 0.6)
    )

    prompt = f"""
    You are an expert ATS resume optimizer.

    Analyze this resume against the job description.

    Resume:
    {extracted_text[:2000]}

    Job Description:
    {job_description[:2000]}

    Provide:

    1. 4 ATS improvement suggestions
    2. 3 rewritten professional resume bullet points
    3. Missing technical skills
    4. Strong action verbs to use

    Format clearly with headings.
    """

    try:

        response = model.generate_content(prompt)

        ai_suggestions = response.text

    except Exception:

        ai_suggestions = """
        1. Add more measurable project outcomes with metrics
        2. Include cloud deployment and orchestration experience
        3. Highlight vector database and embedding workflows
        4. Mention LLM frameworks like LangChain where applicable
        5. Improve action-oriented resume bullet points
        """

    return {
        "filename": resume.filename,
        "job_description_length": len(job_description),
        "resume_text_preview": extracted_text[:700],
        "matched_keywords": matched_keywords[:15],
        "missing_keywords": missing_keywords[:15],
        "keyword_score": int(keyword_score),
        "semantic_score": int(semantic_score),
        "ats_score": ats_score,
        "ai_suggestions": ai_suggestions,
        "message": "Resume parsed successfully"
    }