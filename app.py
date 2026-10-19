import sys
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / 'backend'
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Import the configured Flask application
from backend.app import app, create_app

# Ensure top-level "app" is available for Vercel, WSGI, and Gunicorn
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
