from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from fastapi.middleware.cors import CORSMiddleware

import google.generativeai as genai
from dotenv import load_dotenv
import os

import pdfplumber
import docx
import io
import re

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)
model = genai.GenerativeModel("gemini-2.0-flash")

import nltk

nltk.download("punkt_tab")
nltk.download("stopwords")

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

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

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=30
    )

    tfidf_matrix = vectorizer.fit_transform([job_description])

    keywords = vectorizer.get_feature_names_out()

    keywords = [keyword.lower() for keyword in keywords]

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
    documents = [
        resume_lower,
        job_description.lower()
    ]

    vectorizer = TfidfVectorizer()

    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:2]
    )[0][0]

    semantic_score = similarity * 100

    # Final ATS score
    ats_score = int(
        (keyword_score * 0.6) +
        (semantic_score * 0.4)
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

    except Exception as e:

        ai_suggestions = f"AI generation failed: {str(e)}"

    return {
        "filename": resume.filename,
        "job_description_length": len(job_description),
        "resume_text_preview": extracted_text[:500],
        "matched_keywords": matched_keywords[:15],
        "missing_keywords": missing_keywords[:15],
        "keyword_score": int(keyword_score),
        "semantic_score": int(semantic_score),
        "ats_score": ats_score,
        "ai_suggestions": ai_suggestions,
        "message": "Resume parsed successfully"
    }