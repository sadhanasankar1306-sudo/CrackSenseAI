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
    def root():
        return {
            "name": "CrackSense AI Engine",
            "status": "Operational",
            "docs": "/api/health"
        }
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
