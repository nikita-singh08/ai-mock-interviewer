import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. AI features will not work.")
