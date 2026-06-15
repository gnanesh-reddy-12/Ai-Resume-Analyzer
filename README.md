<div align="center">

# ResumeAI — AI-Powered ATS Resume Analyzer

**Beat the Applicant Tracking System. Land the interview.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-resume-analyzer-two-red.vercel.app)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

</div>

---

## 🚀 Overview

ResumeAI is a full-stack platform designed to help job seekers optimize their resumes against the strict algorithms of modern Applicant Tracking Systems (ATS). 

Instead of relying on basic keyword matching, ResumeAI uses advanced Large Language Models (Groq LLaMA-3.3-70b) and a custom Python extraction engine to semantically analyze resumes. It provides users with an instant ATS score, missing keyword identification, and actionable AI-generated suggestions to rewrite their bullet points for maximum impact.

## ✨ Key Features

- **Semantic ATS Scoring:** Go beyond exact-match keywords. Our engine understands context, synonyms, and variations to give you a highly accurate ATS compatibility score.
- **Smart Keyword Analysis:** Instantly identify exactly which crucial skills from the job description are missing from your resume.
- **AI-Powered Suggestions:** Receive section-by-section feedback and rewritten bullet points tailored to the specific role you are applying for.
- **Guest Trial & Secure Authentication:** Try the platform instantly as a guest, or create an account (secured by JWT and Supabase) to save your analysis history permanently.
- **Multi-Column PDF Parsing:** Robust document extraction utilizing `pdfplumber` to handle complex, highly-formatted resume templates.

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
- **Backend:** Python 3.11, FastAPI
- **Artificial Intelligence:** Groq API (LLaMA-3.3-70b-versatile)
- **Database & Auth:** Supabase (PostgreSQL), JWT
- **Deployment:** Vercel (Frontend), Render & Docker (Backend)

## 💻 Quick Start (Local Development)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend/` folder and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_secure_jwt_secret
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Open a new terminal and stay in the root directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root folder:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```

---

<div align="center">
Built by <a href="https://www.linkedin.com/in/gnanesh-reddy/">Gnanesh Reddy</a>
</div>