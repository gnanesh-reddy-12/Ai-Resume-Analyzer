<div align="center">

# ResumeAI — AI-Powered ATS Resume Analyzer

**Beat the ATS. Land the interview.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=flat&logo=vercel&logoColor=white)](https://ai-resume-analyzer-two-red.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46E3B7?style=flat&logo=render&logoColor=white)](https://ai-resume-analyzer-imn5.onrender.com/docs)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

</div>

---

## What It Does

Most resume checkers are simple keyword matchers. ResumeAI goes further — it uses LLM-powered semantic analysis to evaluate how well your resume actually matches a job description, then gives you specific, actionable AI suggestions to improve it.

**Key capabilities:**
- **ATS Score** — weighted keyword + semantic similarity scoring
- **Keyword Analysis** — matched vs missing keywords with fuzzy matching (handles plurals, variations)
- **AI Suggestions** — section-by-section fixes with rewritten bullet points
- **Tailored Summary** — AI-generated professional summary for the specific role
- **Analysis History** — persistent per-user history with Supabase
- **Guest Trial** — try without signup, gate full suggestions behind auth

---

## Architecture

```
React + Vite (Vercel)
        │
        ▼
FastAPI (Render, Docker)
        │
   ┌────┴────┐
   ▼         ▼
Groq API  Supabase
LLaMA-3.3  PostgreSQL
70b        (auth + history)
```

**Two-call Groq pipeline (token-efficient):**
```
Call 1: JD → extract keywords (~400 tokens, temperature=0, seed=42)
Backend: fuzzy keyword matching + semantic scoring (pure Python)
Call 2: gaps + resume → generate suggestions (~1200 tokens)
Total: ~1600 tokens vs naive ~5000 token approach
```

**ATS Score Formula:**
```
ats_score = (keyword_score × 0.35) + (semantic_score × 0.65)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.11 |
| AI | Groq API — LLaMA-3.3-70b-versatile |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend), Render (backend, Docker) |

---

## Running Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Environment variables (`backend/.env`):**
```
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://...supabase.co
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET=your-secret
```

**Frontend:**
```bash
npm install
npm run dev
```

**Frontend env (`.env.local`):**
```
VITE_BACKEND_URL=http://localhost:8000
```

---

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI app, all endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── src/
│   ├── pages/           # Landing, Home, Results, History, Login, Signup
│   ├── components/      # Navbar, AnalyzeSection, Hero, PreviewCards
│   └── context/         # Auth + Resume context
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Create account |
| POST | `/login` | No | Get JWT token |
| POST | `/analyze` | JWT | Full analysis + save to history |
| POST | `/analyze/guest` | No | Score + keywords only |
| GET | `/history` | JWT | Get user's past analyses |
| DELETE | `/history/{id}` | JWT | Delete an analysis |

---

<div align="center">

Built by [Gnanesh Reddy](https://www.linkedin.com/in/gnanesh-reddy/)

</div>