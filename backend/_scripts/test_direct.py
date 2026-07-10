import time
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import google.generativeai as genai
from main import generate_with_fallback, IMPROVE_SCHEMA

prompt = "Test prompt for JD analysis: Software engineer with Python and React."

print("Testing Fallback: Breaking Gemini API Key in runtime...")
genai.configure(api_key="INVALID_KEY")

for i in range(3):
    print(f"\n--- Run {i+1} ---")
    print("Testing IMPROVE_SCHEMA (Gemini broken -> should fallback to Groq quickly)...")
    start = time.time()
    res = generate_with_fallback(prompt, IMPROVE_SCHEMA, quality_first=True)
    t = time.time() - start
    print(f"Total Request Time: {t:.2f}s")
    try:
        print(f"Result preview: {str(res)[:100].encode('ascii', 'replace').decode()}...\n")
    except Exception:
        print("Could not print result preview.")
