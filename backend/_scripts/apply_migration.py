import re
import os

with open("main.py", "r", encoding="utf-8") as f:
    code = f.read()

# Add AI Provider Helpers and Schemas before extract_jd_keywords
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

def generate_with_fallback(prompt: str, schema: dict, quality_first: bool = False) -> dict:
    providers = [("gemini", _gemini), ("groq", _groq)] if quality_first else [("groq", _groq), ("gemini", _gemini)]
    for name, fn in providers:
        try:
            result = fn(prompt, schema)
            print(f"[generate_with_fallback] served by: {name}")
            return result
        except Exception as e:
            print(f"Provider {name} failed: {e}")
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

if "def generate_with_fallback" not in code:
    code = code.replace("def extract_jd_keywords", ai_helpers)


# Replace old groq call inside extract_jd_keywords
code = re.sub(
    r'response = groq_client\.chat\.completions\.create\([\s\S]*?return \{\n\s+"keyword_groups": \[\[k\] for k in sorted\(kws\)\],\n\s+"role_focus": "Core software developer role focused on technical requirements.",\n\s+"recruiter_needs": "A candidate possessing the listed technical skills and qualifications."\n\s+\}',
    r'''try:
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
        }''',
    code
)

# Replace old improve_resume
code = re.sub(
    r'try:\n\s+response = groq_client\.chat\.completions\.create\([\s\S]*?return \{"error": f"Failed to generate improvements: \{str\(e\)\}"\}',
    r'''try:
        result = generate_with_fallback(prompt, IMPROVE_SCHEMA, quality_first=True)

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
        return {"error": f"Failed to generate improvements: {str(e)}"}''',
    code
)

# Replace old cover_letter
code = re.sub(
    r'try:\n\s+response = groq_client\.chat\.completions\.create\([\s\S]*?raise HTTPException\(status_code=500, detail=f"Cover letter generation failed: \{str\(e\)\}"\)',
    r'''try:
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
        raise HTTPException(status_code=500, detail=f"Cover letter generation failed: {str(e)}")''',
    code
)

# Replace old mock_interview
code = re.sub(
    r'try:\n\s+response = groq_client\.chat\.completions\.create\([\s\S]*?except Exception as e:',
    r'''try:
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
    except Exception as e:''',
    code
)

with open("main.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Migration applied!")
