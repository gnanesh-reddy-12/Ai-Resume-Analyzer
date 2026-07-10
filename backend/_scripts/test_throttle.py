import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from main import generate_with_fallback, JD_SCHEMA, IMPROVE_SCHEMA, COVER_LETTER_SCHEMA, INTERVIEW_SCHEMA
import google.generativeai as genai
genai.configure(api_key="INVALID_KEY")

prompt = "Test prompt for sequence."

schemas = [
    ("JD_SCHEMA (/analyze)", JD_SCHEMA),
    ("IMPROVE_SCHEMA (/improve)", IMPROVE_SCHEMA),
    ("COVER_LETTER_SCHEMA (/cover-letter)", COVER_LETTER_SCHEMA),
    ("INTERVIEW_SCHEMA (/mock-interview)", INTERVIEW_SCHEMA),
]

for name, schema in schemas:
    print(f"\n--- Running {name} ---")
    start = time.time()
    try:
        generate_with_fallback(prompt, schema, quality_first=True)
        t = time.time() - start
        print(f"Finished in {t:.2f}s")
    except Exception as e:
        print(f"Failed: {e}")
