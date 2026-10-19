import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / 'uploads'
RESULTS_DIR = BASE_DIR / 'results'
CHECKPOINTS_DIR = BASE_DIR / 'checkpoints'
DATABASE_URI = f"sqlite:///{BASE_DIR / 'cracksense.db'}"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'cracksense-research-key-2026')
    SQLALCHEMY_DATABASE_URI = DATABASE_URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max image upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    UPLOAD_FOLDER = str(UPLOAD_DIR)
    RESULTS_FOLDER = str(RESULTS_DIR)
    CHECKPOINT_FOLDER = str(CHECKPOINTS_DIR)
