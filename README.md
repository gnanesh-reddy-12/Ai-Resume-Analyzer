<div align="center">

# ResumeAI — ATS Resume Analyzer

**Optimize resumes against modern Applicant Tracking Systems.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-resume-analyzer-two-red.vercel.app)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

---

## 🚀 Overview

ResumeAI is a full-stack web application designed to help users optimize their resumes for Applicant Tracking Systems (ATS). 

Rather than relying on basic keyword matching, the platform utilizes Groq's LLaMA-3.3-70b model and a Python-based extraction engine to perform semantic analysis on uploaded resumes. It provides an ATS compatibility score, identifies missing skills based on the provided job description, and generates actionable suggestions to improve bullet points.

## ✨ Key Features

- **Semantic ATS Scoring:** Evaluates resume content against job descriptions using natural language processing to understand context and synonyms.
- **Skill Gap Analysis:** Identifies critical skills and keywords missing from the resume.
- **Automated Feedback:** Provides section-by-section suggestions and rewrites for resume bullet points to improve clarity and impact.
- **Authentication & History:** Secure user authentication via Supabase, allowing users to save and review past analysis results.
- **PDF Parsing:** Robust document extraction using `pdfplumber` to process complex resume layouts.

## 📁 Project Structure

```text
ai-resume-analyzer/
├── backend/                  # Python/FastAPI backend
│   ├── main.py               # Core API endpoints and LLM integration
│   ├── requirements.txt      # Python dependencies
│   └── Procfile              # Deployment configuration
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── context/              # React Context for state management
│   ├── pages/                # Application routes
│   ├── App.jsx               # Main application layout and routing
│   ├── index.css             # Tailwind configuration and global styles
│   └── supabase.js           # Supabase client initialization
├── public/                   # Static assets
├── package.json              # Node dependencies and scripts
└── vite.config.js            # Vite configuration
```

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **Backend:** Python 3.11, FastAPI
- **AI Integration:** Groq API (LLaMA-3.3-70b-versatile)
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel (Frontend), Render (Backend)

---

<div align="center">
Built by <a href="https://www.linkedin.com/in/gnanesh-reddy/">Gnanesh Reddy</a>
</div>