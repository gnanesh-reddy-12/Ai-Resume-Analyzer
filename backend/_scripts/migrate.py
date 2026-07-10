import re
import os

with open("main.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update Imports
code = code.replace(
    "from groq import Groq\nfrom dotenv import load_dotenv",
    "from groq import Groq\nfrom dotenv import load_dotenv\nimport google.generativeai as genai"
)

# 2. Update Client Init
code = code.replace(
    "client = Groq(api_key=os.getenv(\"GROQ_API_KEY\"))",
    "groq_client = Groq(api_key=os.getenv(\"GROQ_API_KEY\"))\ngenai.configure(api_key=os.getenv(\"GEMINI_API_KEY\"))"
)

# 3. Add AI Provider Helpers and Schemas before extract_jd_keywords
ai_helpers = """
def _gemini(prompt: str, schema: dict) -> dict:
    model = genai.GenerativeModel("gemini-2.5-flash")
    r = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json", "response_schema": schema},
    )
    return json.loads(r.text)

def _groq(prompt: str, schema: dict) -> dict:
    r = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_schema", "json_schema": {"name": "analysis", "schema": schema, "strict": True}},
        max_completion_tokens=4096,
        temperature=0.3
    )
    return json.loads(r.choices[0].message.content)

def generate_with_fallback(prompt: str, schema: dict) -> dict:
    for fn in (_gemini, _groq):
        try:
            return fn(prompt, schema)
        except Exception as e:
            print(f"Provider {fn.__name__} failed: {e}")
            continue
    raise RuntimeError("Both AI providers exhausted")

JD_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "keyword_groups": {
            "type": "ARRAY",
            "items": {
                "type": "ARRAY",
                "items": {"type": "STRING"}
            }
        },
        "role_focus": {"type": "STRING"},
        "recruiter_needs": {"type": "STRING"}
    },
    "required": ["keyword_groups", "role_focus", "recruiter_needs"]
}

IMPROVE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary": {"type": "STRING"},
        "ai_snapshot": {
            "type": "OBJECT",
            "properties": {
                "keep": {"type": "STRING"},
                "missing": {"type": "STRING"},
                "experience_gap": {"type": "STRING"}
            },
            "required": ["keep", "missing", "experience_gap"]
        },
        "skills_recommendation": {
            "type": "OBJECT",
            "properties": {
                "keep_skills": {"type": "ARRAY", "items": {"type": "STRING"}},
                "add_skills": {"type": "ARRAY", "items": {"type": "STRING"}},
                "integration_advice": {"type": "STRING"}
            },
            "required": ["keep_skills", "add_skills", "integration_advice"]
        },
        "sections": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "bullets": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "original": {"type": "STRING"},
                                "rewritten": {"type": "STRING"}
                            },
                            "required": ["original", "rewritten"]
                        }
                    }
                },
                "required": ["title", "bullets"]
            }
        }
    },
    "required": ["summary", "ai_snapshot", "skills_recommendation", "sections"]
}

COVER_LETTER_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "cover_letter": {"type": "STRING"}
    },
    "required": ["cover_letter"]
}

INTERVIEW_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "role_category": {"type": "STRING"},
        "company_tier": {"type": "STRING"},
        "seniority_detected": {"type": "STRING"},
        "total_rounds": {"type": "INTEGER"},
        "rounds": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "round": {"type": "STRING"},
                    "interviewer": {"type": "STRING"},
                    "duration": {"type": "STRING"},
                    "focus": {"type": "STRING"},
                    "prep_tip": {"type": "STRING"},
                    "questions": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                },
                "required": ["round", "interviewer", "duration", "focus", "prep_tip", "questions"]
            }
        }
    },
    "required": ["role_category", "company_tier", "seniority_detected", "total_rounds", "rounds"]
}

def extract_jd_keywords"""

code = code.replace("def extract_jd_keywords", ai_helpers)

# 4. Refactor extract_jd_keywords
old_jd_logic = """    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You analyze job descriptions. Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0,
        seed=42,
        max_tokens=600,
        timeout=30,
    )
    raw = re.sub(r'^```[a-z]*\\n?', '', response.choices[0].message.content.strip())
    raw = re.sub(r'\\n?```$', '', raw)
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            if "keyword_groups" not in data and "keywords" in data:
                # Fallback if model returns flat list
                data["keyword_groups"] = [[k] for k in data["keywords"]]
            elif "keyword_groups" not in data:
                data["keyword_groups"] = []
            return data
    except Exception:
        pass
    kws = [k for k in re.findall(r'"([^"]+)"', raw) if k not in ("keyword_groups", "keywords", "role_focus", "recruiter_needs")]
    return {
        "keyword_groups": [[k] for k in sorted(kws)],
        "role_focus": "Core software developer role focused on technical requirements.",
        "recruiter_needs": "A candidate possessing the listed technical skills and qualifications."
    }"""

new_jd_logic = """    try:
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
        }"""
code = code.replace(old_jd_logic, new_jd_logic)

# 5. Refactor improve_resume
old_improve_logic = """    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a senior resume coach. Return ONLY valid JSON. No markdown, no backticks. Be specific to this person's resume — no generic advice."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            seed=42,
            max_tokens=3000,
            timeout=30,
        )
        raw = re.sub(r'^```[a-z]*\\n?', '', response.choices[0].message.content.strip())
        raw = re.sub(r'\\n?```$', '', raw)
        result = json.loads(raw)

        if analysis_id:
            try:
                select_res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
                existing = (select_res.data[0].get("improvement_suggestions") or {}) if select_res.data else {}
                existing["suggestions"] = result
                supabase.table("analyses").update({"improvement_suggestions": existing}).eq("id", analysis_id).execute()
            except Exception as db_err:
                print("Failed to save suggestions to history:", str(db_err))

        return {"suggestions": result}
    except Exception as e:
        return {"error": f"Failed to generate improvements: {str(e)}"}"""

new_improve_logic = """    try:
        result = generate_with_fallback(prompt, IMPROVE_SCHEMA)

        if analysis_id:
            try:
                select_res = supabase.table("analyses").select("improvement_suggestions").eq("id", analysis_id).execute()
                existing = (select_res.data[0].get("improvement_suggestions") or {}) if select_res.data else {}
                existing["suggestions"] = result
                supabase.table("analyses").update({"improvement_suggestions": existing}).eq("id", analysis_id).execute()
            except Exception as db_err:
                print("Failed to save suggestions to history:", str(db_err))

        return {"suggestions": result}
    except Exception as e:
        return {"error": f"Failed to generate improvements: {str(e)}"}"""
code = code.replace(old_improve_logic, new_improve_logic)


# 6. Refactor cover_letter
old_cl_logic = """    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a professional cover letter writer. Return only the cover letter text. No markdown formatting, no preambles."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            seed=42,
            max_tokens=1500,
            timeout=30,
        )
        cover_letter_result = response.choices[0].message.content.strip()

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
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")"""

new_cl_logic = """    try:
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
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")"""
code = code.replace(old_cl_logic, new_cl_logic)

# 7. Refactor mock interview
old_int_logic = """    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert hiring manager. Return ONLY valid JSON. No backticks, no explanation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            seed=42,
            max_tokens=1500,
            timeout=30,
        )
        raw = re.sub(r'^```[a-z]*\\n?', '', response.choices[0].message.content.strip())
        raw = re.sub(r'\\n?```$', '', raw)
        result = json.loads(raw)

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
    except Exception as e:"""

new_int_logic = """    try:
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
    except Exception as e:"""

code = code.replace(old_int_logic, new_int_logic)

with open("main.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Migration complete!")
