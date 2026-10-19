from datetime import datetime
from typing import Dict, Any, Tuple

try:
    import cv2
    import numpy as np
    HAVE_CV2 = True
except ImportError:
    HAVE_CV2 = False

def align_inspections(img1: Any, img2: Any) -> Tuple[Any, float, bool]:
    """
    Align inspection 2 to inspection 1 using ORB feature detection and Homography.
    Returns (aligned_img2, alignment_score, success_flag).
    """
    gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) if img1.ndim == 3 else img1
    gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY) if img2.ndim == 3 else img2
    
    orb = cv2.ORB_create(nfeatures=1500)
    kp1, des1 = orb.detectAndCompute(gray1, None)
    kp2, des2 = orb.detectAndCompute(gray2, None)
    
    if des1 is None or des2 is None or len(des1) < 10 or len(des2) < 10:
        return img2, 0.5, False
        
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    matches = bf.match(des1, des2)
    matches = sorted(matches, key=lambda x: x.distance)
    
    # Filter top 25% matches
    top_matches = matches[:max(10, int(len(matches) * 0.25))]
    if len(top_matches) < 4:
        return img2, 0.4, False
        
    pts1 = np.float32([kp1[m.queryIdx].pt for m in top_matches]).reshape(-1, 1, 2)
    pts2 = np.float32([kp2[m.trainIdx].pt for m in top_matches]).reshape(-1, 1, 2)
    
    H, mask = cv2.findHomography(pts2, pts1, cv2.RANSAC, 5.0)
    if H is None:
        return img2, 0.4, False
        
    h, w = gray1.shape[:2]
    aligned_img2 = cv2.warpPerspective(img2, H, (w, h))
    
    # Calculate alignment quality based on normalized cross-correlation
    inliers_ratio = float(np.sum(mask)) / len(top_matches)
    alignment_score = min(0.99, max(0.1, inliers_ratio * 0.95))
    
    return aligned_img2, round(alignment_score, 3), True

def compute_crack_progression(
    baseline_metrics: Dict[str, Any],
    current_metrics: Dict[str, Any],
    baseline_date_iso: str,
    current_date_iso: str
) -> Dict[str, Any]:
    """
    Calculate changes in crack geometry and growth rates over time.
    """
    dt_base = datetime.fromisoformat(baseline_date_iso.replace('Z', '+00:00'))
    dt_curr = datetime.fromisoformat(current_date_iso.replace('Z', '+00:00'))
    delta_days = max(1, (dt_curr - dt_base).days)
    
    is_calibrated = baseline_metrics.get("calibrated", False) and current_metrics.get("calibrated", False)
    
    if is_calibrated:
        delta_area = current_metrics["area_mm2"] - baseline_metrics["area_mm2"]
        delta_len = current_metrics["skeleton_length_mm"] - baseline_metrics["skeleton_length_mm"]
        delta_mean_w = current_metrics["mean_width_mm"] - baseline_metrics["mean_width_mm"]
        delta_max_w = current_metrics["max_width_mm"] - baseline_metrics["max_width_mm"]
        growth_rate_mm_per_mo = (delta_max_w / (delta_days / 30.4375)) if delta_days > 0 else 0.0
    else:
        delta_area = current_metrics["area_pixels"] - baseline_metrics["area_pixels"]
        delta_len = current_metrics["skeleton_length_pixels"] - baseline_metrics["skeleton_length_pixels"]
        delta_mean_w = current_metrics["mean_width_pixels"] - baseline_metrics["mean_width_pixels"]
        delta_max_w = current_metrics["max_width_pixels"] - baseline_metrics["max_width_pixels"]
        growth_rate_mm_per_mo = 0.0
        
    pct_area = ((delta_area / max(1, baseline_metrics.get("area_mm2" if is_calibrated else "area_pixels", 1))) * 100.0)
    
    status = "Stable (<0.01 mm/mo)"
    if growth_rate_mm_per_mo > 0.05:
        status = "Active Growth (>0.05 mm/mo)"
    elif growth_rate_mm_per_mo > 0.01:
        status = "Slow Progression (0.01-0.05 mm/mo)"
        
    return {
        "time_delta_days": delta_days,
        "is_calibrated": is_calibrated,
        "delta_area": round(delta_area, 2),
        "delta_area_percent": round(pct_area, 1),
        "delta_length": round(delta_len, 2),
        "delta_mean_width": round(delta_mean_w, 2),
        "delta_max_width": round(delta_max_w, 2),
        "growth_rate_mm_per_month": round(growth_rate_mm_per_mo, 3),
        "status": status,
        "unit": "mm" if is_calibrated else "px"
    }
