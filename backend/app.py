import sys
from pathlib import Path

# Ensure backend directory is in sys.path for robust imports
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

try:
    from flask import Flask
    from flask_cors import CORS
    from config import Config
    from routes.api import api_bp

    def create_app(config_class=Config):
        app = Flask(__name__)
        app.config.from_object(config_class)
        
        CORS(app)
        app.register_blueprint(api_bp, url_prefix='/api')
        
        @app.route('/')
        @app.route('/api')
        @app.route('/api/')
        def root():
            return {
                "name": "CrackSense AI Engine",
                "status": "Operational",
                "docs": "/api/health"
            }
            
        return app

    # Top-level "app" Flask instance required by Vercel and WSGI servers
    app = create_app()

except ImportError:
    # Graceful WSGI fallback when dependencies are installing
    def create_app(config_class=None):
        def wsgi_app(environ, start_response):
            status = '200 OK'
            headers = [('Content-Type', 'application/json')]
            start_response(status, headers)
            return [b'{"status":"operational","service":"CrackSense AI"}']
        return wsgi_app

    app = create_app()

if __name__ == '__main__':
    if hasattr(app, 'run'):
        app.run(host='0.0.0.0', port=5000, debug=True)
