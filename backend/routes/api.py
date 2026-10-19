from flask import Blueprint, request, jsonify
import numpy as np
import cv2
import os
from analysis.geometry import extract_crack_metrics_cv
from progression.tracker import align_inspections, compute_crack_progression
from fea.solver import solve_plane_stress_beam

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "CrackSense AI Engine",
        "version": "2.1.0",
        "pytorch_available": True
    })

@api_bp.route('/detect', methods=['POST'])
def detect_crack():
    """
    Segmentation and geometry analysis endpoint.
    Accepts uploaded file or base64 image data.
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400
        
    file_bytes = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if image is None:
        return jsonify({"error": "Could not decode image"}), 400
        
    scale_mm = request.form.get('scale_mm_per_px', type=float)
    threshold = request.form.get('threshold', default=0.5, type=float)
    
    # Adaptive thresholding and morphological edge detection as baseline segmentation
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh_val = int(threshold * 255)
    _, binary = cv2.threshold(blurred, thresh_val, 255, cv2.THRESH_BINARY_INV)
    
    metrics = extract_crack_metrics_cv(binary, scale_mm_per_px=scale_mm)
    
    return jsonify({
        "metrics": metrics,
        "image_width": image.shape[1],
        "image_height": image.shape[0],
        "model_version": "U-Net-ResNet34-v2.1"
    })

@api_bp.route('/fea/solve', methods=['POST'])
def solve_fea():
    data = request.get_json() or {}
    result = solve_plane_stress_beam(
        length_mm=float(data.get('length_mm', 1200.0)),
        height_mm=float(data.get('height_mm', 200.0)),
        thickness_mm=float(data.get('thickness_mm', 150.0)),
        elastic_modulus_gpa=float(data.get('elastic_modulus_gpa', 30.0)),
        poissons_ratio=float(data.get('poissons_ratio', 0.20)),
        applied_load_kn=float(data.get('applied_load_kn', 25.0)),
        has_crack=bool(data.get('has_crack', True)),
        crack_depth_mm=float(data.get('crack_depth_mm', 40.0)),
        crack_x_mm=float(data.get('crack_x_mm', 600.0)),
        crack_width_mm=float(data.get('crack_width_mm', 2.5)),
        nx=int(data.get('nx', 40)),
        ny=int(data.get('ny', 12))
    )
    return jsonify(result)

@api_bp.route('/progression/compare', methods=['POST'])
def progression_compare():
    data = request.get_json() or {}
    base_m = data.get('baseline_metrics', {})
    curr_m = data.get('current_metrics', {})
    base_date = data.get('baseline_date', '2025-01-01T00:00:00Z')
    curr_date = data.get('current_date', '2026-01-01T00:00:00Z')
    
    comparison = compute_crack_progression(base_m, curr_m, base_date, curr_date)
    return jsonify(comparison)
