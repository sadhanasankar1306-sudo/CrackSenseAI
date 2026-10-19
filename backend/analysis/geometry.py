import numpy as np
import cv2
from typing import Dict, Any, Optional

def extract_crack_metrics_cv(binary_mask: np.ndarray, scale_mm_per_px: Optional[float] = None) -> Dict[str, Any]:
    """
    Extract crack geometry indicators from binary segmentation mask.
    Computes area, skeleton length, mean/max width, density, and connected components.
    """
    if binary_mask.ndim == 3:
        binary_mask = cv2.cvtColor(binary_mask, cv2.COLOR_BGR2GRAY)
    
    # Ensure binary 0 or 255
    _, binary = cv2.threshold(binary_mask, 127, 255, cv2.THRESH_BINARY)
    h, w = binary.shape
    total_pixels = h * w
    
    # Area
    area_pixels = int(np.count_nonzero(binary))
    if area_pixels == 0:
        return {
            "area_pixels": 0,
            "skeleton_length_pixels": 0,
            "mean_width_pixels": 0.0,
            "max_width_pixels": 0.0,
            "crack_density_pct": 0.0,
            "connected_components": 0,
            "calibrated": False
        }
    
    crack_density_pct = float((area_pixels / total_pixels) * 100.0)
    
    # Skeletonization via morphological thinning
    skeleton = np.zeros_like(binary)
    element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
    temp_binary = binary.copy()
    
    while True:
        eroded = cv2.erode(temp_binary, element)
        opened = cv2.dilate(eroded, element)
        subset = cv2.subtract(temp_binary, opened)
        skeleton = cv2.bitwise_or(skeleton, subset)
        temp_binary = eroded.copy()
        if cv2.countNonZero(temp_binary) == 0:
            break
            
    skeleton_length_pixels = int(cv2.countNonZero(skeleton))
    if skeleton_length_pixels == 0:
        skeleton_length_pixels = max(1, int(np.sqrt(area_pixels)))
        
    # Euclidean Distance Transform for true orthogonal widths
    dist_transform = cv2.distanceTransform(binary, cv2.DIST_L2, 5)
    
    # Sample distance transform at skeleton locations
    widths_at_skeleton = dist_transform[skeleton > 0] * 2.0  # full width is 2x distance to border
    
    if len(widths_at_skeleton) > 0:
        mean_width_pixels = float(np.mean(widths_at_skeleton))
        max_width_pixels = float(np.max(widths_at_skeleton))
    else:
        mean_width_pixels = float(area_pixels / skeleton_length_pixels)
        max_width_pixels = mean_width_pixels * 1.5
        
    # Connected components
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)
    # Filter small noise components (< 15 pixels)
    valid_components = sum(1 for s in stats[1:] if s[cv2.CC_STAT_AREA] >= 15)
    valid_components = max(1, valid_components)
    
    results = {
        "area_pixels": area_pixels,
        "skeleton_length_pixels": skeleton_length_pixels,
        "mean_width_pixels": round(mean_width_pixels, 2),
        "max_width_pixels": round(max_width_pixels, 2),
        "crack_density_pct": round(crack_density_pct, 2),
        "connected_components": valid_components,
        "calibrated": False
    }
    
    if scale_mm_per_px and scale_mm_per_px > 0:
        results["calibrated"] = True
        results["scale_mm_per_px"] = scale_mm_per_px
        results["area_mm2"] = round(area_pixels * (scale_mm_per_px ** 2), 2)
        results["skeleton_length_mm"] = round(skeleton_length_pixels * scale_mm_per_px, 2)
        results["mean_width_mm"] = round(mean_width_pixels * scale_mm_per_px, 2)
        results["max_width_mm"] = round(max_width_pixels * scale_mm_per_px, 2)
        
    return results
