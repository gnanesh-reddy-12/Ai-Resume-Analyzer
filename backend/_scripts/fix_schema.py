import json

with open("main.py", "r", encoding="utf-8") as f:
    code = f.read()

NEW_SCHEMAS = """JD_SCHEMA = {
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
"""

start_idx = code.find("JD_SCHEMA = {")
end_idx = code.find("def extract_jd_keywords")

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + NEW_SCHEMAS + "\n\n" + code[end_idx:]
    with open("main.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Schemas successfully replaced!")
else:
    print("Could not find start or end indices!")
