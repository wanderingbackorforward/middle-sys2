import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
USE_SUPABASE = os.getenv("USE_SUPABASE", "0") == "1" and bool(SUPABASE_URL and SUPABASE_SERVICE_KEY)
