import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend-flask'))
os.environ.setdefault("DISABLE_SCHEDULER", "1")
from app import app as app
