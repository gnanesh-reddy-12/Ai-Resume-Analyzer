import re

with open("main.py", "r", encoding="utf-8") as f:
    code = f.read()

new_gemini = """def _gemini(prompt: str, schema: dict) -> dict:
    def strip_props(d):
        if not isinstance(d, dict): return d
        return {k: strip_props(v) if isinstance(v, dict) else [strip_props(i) for i in v] if isinstance(v, list) else v for k, v in d.items() if k != "additionalProperties"}
    
    model = genai.GenerativeModel("gemini-2.5-flash")
    r = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json", "response_schema": strip_props(schema)},
    )
    return json.loads(r.text)"""

code = re.sub(
    r'def _gemini\(prompt: str, schema: dict\) -> dict:\n\s+model = genai\.GenerativeModel\("gemini-2\.5-flash"\)\n\s+r = model\.generate_content\([\s\S]*?return json\.loads\(r\.text\)',
    new_gemini,
    code
)

with open("main.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Gemini helper fixed!")
