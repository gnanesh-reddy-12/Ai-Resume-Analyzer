import time
import requests
import jwt
import os
from dotenv import load_dotenv

load_dotenv()
secret = os.getenv("JWT_SECRET")

# Create a valid Supabase JWT for testing
token = jwt.encode({"sub": "test_user", "role": "authenticated"}, secret, algorithm="HS256")
headers = {"Authorization": f"Bearer {token}"}

dummy_pdf = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF"
jd = "Software Engineer with React and Node.js experience."

print("1. Testing /analyze (Groq first, should be fast)...")
start = time.time()
res = requests.post(
    "http://localhost:8000/analyze",
    headers=headers,
    data={"job_description": jd},
    files={"resume": ("dummy.pdf", dummy_pdf, "application/pdf")}
)
t1 = time.time() - start
print(f"Time: {t1:.2f}s | Status: {res.status_code}")

print("\n2. Testing /improve (Gemini first, quality focus, takes longer)...")
start = time.time()
res = requests.post(
    "http://localhost:8000/improve",
    headers=headers,
    data={"job_description": jd},
    files={"resume": ("dummy.pdf", dummy_pdf, "application/pdf")}
)
t2 = time.time() - start
print(f"Time: {t2:.2f}s | Status: {res.status_code}")

print("\n3. Testing Fallback: Breaking Gemini API Key in .env...")
with open(".env", "r") as f:
    env_content = f.read()
with open(".env", "w") as f:
    f.write(env_content.replace("GEMINI_API_KEY=AQ.", "GEMINI_API_KEY=INVALID_AQ."))

time.sleep(1) # wait for uvicorn to maybe reload, but wait, os.environ is already set in uvicorn. 
# Actually, changing .env triggers a uvicorn reload!
time.sleep(3) 

print("Testing /improve again (Gemini broken -> should fallback to Groq, ~fast)...")
start = time.time()
try:
    res = requests.post(
        "http://localhost:8000/improve",
        headers=headers,
        data={"job_description": jd},
        files={"resume": ("dummy.pdf", dummy_pdf, "application/pdf")}
    )
    t3 = time.time() - start
    print(f"Time: {t3:.2f}s | Status: {res.status_code}")
except Exception as e:
    print("Error hitting endpoint:", e)

print("\nRestoring .env...")
with open(".env", "w") as f:
    f.write(env_content)
