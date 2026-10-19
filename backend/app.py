import sys
from pathlib import Path

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from flask import Flask, jsonify
from flask_cors import CORS

def create_app(config_class=None):
    application = Flask(__name__)
    CORS(application)
    
    if config_class:
        application.config.from_object(config_class)
    else:
        try:
            from config import Config
            application.config.from_object(Config)
        except Exception:
            pass
            
    # Register API blueprint
    try:
        from routes.api import api_bp
        application.register_blueprint(api_bp, url_prefix='/api')
    except Exception as err:
        print(f"[Warning] Failed to register api_bp: {err}")
        
    @application.route('/')
    @application.route('/api')
    @application.route('/api/')
    def index():
        return {
            "name": "CrackSense AI Engine",
            "status": "Operational",
            "service": "Flask Research Backend",
            "docs": "/api/health"
        }
        
    @application.route('/health')
    def direct_health():
        return jsonify({
            "status": "healthy",
            "service": "CrackSense AI Engine",
            "version": "2.1.0"
        })
        
    return application

# Top-level "app" Flask instance required by Vercel and WSGI
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
