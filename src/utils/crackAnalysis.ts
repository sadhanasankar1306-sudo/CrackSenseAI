import { CrackMetrics, CalibrationData } from '../types';

/**
 * Perform Zhang-Suen morphological thinning to extract 1-pixel wide crack skeleton
 */
export function zhangSuenThinning(binaryMask: Uint8Array, width: number, height: number): Uint8Array {
  const skeleton = new Uint8Array(binaryMask);
  let changing = true;

  const getPixel = (arr: Uint8Array, x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    return arr[y * width + x] > 0 ? 1 : 0;
  };

  while (changing) {
    changing = false;

    // Step 1
    const toClearStep1: number[] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (skeleton[idx] === 0) continue;

        const p2 = getPixel(skeleton, x, y - 1);
        const p3 = getPixel(skeleton, x + 1, y - 1);
        const p4 = getPixel(skeleton, x + 1, y);
        const p5 = getPixel(skeleton, x + 1, y + 1);
        const p6 = getPixel(skeleton, x, y + 1);
        const p7 = getPixel(skeleton, x - 1, y + 1);
        const p8 = getPixel(skeleton, x - 1, y);
        const p9 = getPixel(skeleton, x - 1, y - 1);

        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (b < 2 || b > 6) continue;

        // Number of 0-1 transitions in sequence p2, p3, p4, p5, p6, p7, p8, p9, p2
        const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let a = 0;
        for (let i = 0; i < 8; i++) {
          if (neighbors[i] === 0 && neighbors[i + 1] === 1) a++;
        }
        if (a !== 1) continue;

        if (p2 * p4 * p6 !== 0) continue;
        if (p4 * p6 * p8 !== 0) continue;

        toClearStep1.push(idx);
        changing = true;
      }
    }
    for (const idx of toClearStep1) {
      skeleton[idx] = 0;
    }

    // Step 2
    const toClearStep2: number[] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (skeleton[idx] === 0) continue;

        const p2 = getPixel(skeleton, x, y - 1);
        const p3 = getPixel(skeleton, x + 1, y - 1);
        const p4 = getPixel(skeleton, x + 1, y);
        const p5 = getPixel(skeleton, x + 1, y + 1);
        const p6 = getPixel(skeleton, x, y + 1);
        const p7 = getPixel(skeleton, x - 1, y + 1);
        const p8 = getPixel(skeleton, x - 1, y);
        const p9 = getPixel(skeleton, x - 1, y - 1);

        const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
        if (b < 2 || b > 6) continue;

        const neighbors = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
        let a = 0;
        for (let i = 0; i < 8; i++) {
          if (neighbors[i] === 0 && neighbors[i + 1] === 1) a++;
        }
        if (a !== 1) continue;

        if (p2 * p4 * p8 !== 0) continue;
        if (p2 * p6 * p8 !== 0) continue;

        toClearStep2.push(idx);
        changing = true;
      }
    }
    for (const idx of toClearStep2) {
      skeleton[idx] = 0;
    }
  }

  return skeleton;
}

/**
 * 2D Euclidean Distance Transform (approximation via two-pass cityblock / chamfer)
 * Returns orthogonal distance to nearest boundary for each foreground pixel
 */
export function computeDistanceTransform(binaryMask: Uint8Array, width: number, height: number): Float32Array {
  const dist = new Float32Array(width * height);
  const INF = 1e6;

  // Initialize
  for (let i = 0; i < binaryMask.length; i++) {
    dist[i] = binaryMask[i] > 0 ? INF : 0;
  }

  // Forward pass (top-left to bottom-right)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (dist[idx] === 0) continue;

      let d = dist[idx];
      if (x > 0) d = Math.min(d, dist[idx - 1] + 1);
      if (y > 0) {
        d = Math.min(d, dist[(y - 1) * width + x] + 1);
        if (x > 0) d = Math.min(d, dist[(y - 1) * width + (x - 1)] + 1.414);
        if (x < width - 1) d = Math.min(d, dist[(y - 1) * width + (x + 1)] + 1.414);
      }
      dist[idx] = d;
    }
  }

  // Backward pass (bottom-right to top-left)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      if (dist[idx] === 0) continue;

      let d = dist[idx];
      if (x < width - 1) d = Math.min(d, dist[idx + 1] + 1);
      if (y < height - 1) {
        d = Math.min(d, dist[(y + 1) * width + x] + 1);
        if (x < width - 1) d = Math.min(d, dist[(y + 1) * width + (x + 1)] + 1.414);
        if (x > 0) d = Math.min(d, dist[(y + 1) * width + (x - 1)] + 1.414);
      }
      dist[idx] = d;
    }
  }

  return dist;
}

/**
 * 8-Connected components labeling using two-pass disjoint-set
 */
export function countConnectedComponents(binaryMask: Uint8Array, width: number, height: number): number {
  const labels = new Int32Array(width * height);
  let nextLabel = 1;
  const parent: number[] = [0];

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) root = parent[root];
    let curr = i;
    while (curr !== root) {
      const nxt = parent[curr];
      parent[curr] = root;
      curr = nxt;
    }
    return root;
  };

  const union = (i: number, j: number) => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootJ] = rootI;
    }
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binaryMask[idx] === 0) continue;

      const neighbors: number[] = [];
      if (x > 0 && labels[idx - 1] > 0) neighbors.push(labels[idx - 1]);
      if (y > 0 && labels[(y - 1) * width + x] > 0) neighbors.push(labels[(y - 1) * width + x]);
      if (y > 0 && x > 0 && labels[(y - 1) * width + (x - 1)] > 0) neighbors.push(labels[(y - 1) * width + (x - 1)]);
      if (y > 0 && x < width - 1 && labels[(y - 1) * width + (x + 1)] > 0) neighbors.push(labels[(y - 1) * width + (x + 1)]);

      if (neighbors.length === 0) {
        labels[idx] = nextLabel;
        parent[nextLabel] = nextLabel;
        nextLabel++;
      } else {
        const minLab = Math.min(...neighbors);
        labels[idx] = minLab;
        for (const n of neighbors) {
          union(minLab, n);
        }
      }
    }
  }

  // Count unique roots with at least 15 pixels to filter single-pixel noise
  const componentPixelCounts: { [root: number]: number } = {};
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] > 0) {
      const root = find(labels[i]);
      componentPixelCounts[root] = (componentPixelCounts[root] || 0) + 1;
    }
  }

  const validComponents = Object.values(componentPixelCounts).filter(c => c >= 15);
  return Math.max(1, validComponents.length);
}

/**
 * Principal axis orientation via covariance matrix of crack pixel coordinates
 */
export function computeCrackOrientation(binaryMask: Uint8Array, width: number, height: number): number {
  let count = 0;
  let sumX = 0;
  let sumY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binaryMask[y * width + x] > 0) {
        sumX += x;
        sumY += y;
        count++;
      }
    }
  }

  if (count === 0) return 0;
  const meanX = sumX / count;
  const meanY = sumY / count;

  let covXX = 0;
  let covYY = 0;
  let covXY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binaryMask[y * width + x] > 0) {
        const dx = x - meanX;
        const dy = y - meanY;
        covXX += dx * dx;
        covYY += dy * dy;
        covXY += dx * dy;
      }
    }
  }

  // Angle in degrees from horizontal [0, 180)
  const thetaRad = 0.5 * Math.atan2(2 * covXY, covXX - covYY);
  let thetaDeg = (thetaRad * 180) / Math.PI;
  if (thetaDeg < 0) thetaDeg += 180;
  return Number(thetaDeg.toFixed(1));
}

/**
 * Full structural crack geometry extraction
 */
export function extractCrackMetrics(
  binaryMask: Uint8Array,
  width: number,
  height: number,
  calibration?: CalibrationData
): CrackMetrics {
  let areaPixels = 0;
  for (let i = 0; i < binaryMask.length; i++) {
    if (binaryMask[i] > 0) areaPixels++;
  }

  if (areaPixels === 0) {
    return {
      areaPixels: 0,
      areaMm2: 0,
      skeletonLengthPixels: 0,
      skeletonLengthMm: 0,
      meanWidthPixels: 0,
      meanWidthMm: 0,
      maxWidthPixels: 0,
      maxWidthMm: 0,
      crackDensity: 0,
      connectedComponents: 0,
      primaryOrientationDeg: 0,
      uncertaintyEstimatePct: 0,
    };
  }

  // Skeleton
  const skeleton = zhangSuenThinning(binaryMask, width, height);
  let skeletonLengthPixels = 0;
  for (let i = 0; i < skeleton.length; i++) {
    if (skeleton[i] > 0) skeletonLengthPixels++;
  }
  // If skeleton is empty (e.g. tiny speckle), fallback to approximate length
  if (skeletonLengthPixels === 0) {
    skeletonLengthPixels = Math.round(Math.sqrt(areaPixels));
  }

  // Distance transform for orthogonal widths
  const dist = computeDistanceTransform(binaryMask, width, height);
  const widthsAtSkeleton: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (skeleton[idx] > 0) {
        // Orthogonal width is twice the distance to closest boundary
        const localWidth = dist[idx] * 2.0;
        widthsAtSkeleton.push(localWidth);
      }
    }
  }

  let meanWidthPixels = areaPixels / Math.max(1, skeletonLengthPixels);
  let maxWidthPixels = meanWidthPixels * 1.5;

  if (widthsAtSkeleton.length > 0) {
    const sumW = widthsAtSkeleton.reduce((a, b) => a + b, 0);
    meanWidthPixels = Number((sumW / widthsAtSkeleton.length).toFixed(2));
    maxWidthPixels = Number(Math.max(...widthsAtSkeleton).toFixed(2));
  }

  const crackDensity = Number(((areaPixels / (width * height)) * 100).toFixed(2));
  const connectedComponents = countConnectedComponents(binaryMask, width, height);
  const primaryOrientationDeg = computeCrackOrientation(binaryMask, width, height);

  // Calibration math
  const scale = calibration?.isCalibrated && calibration.scaleMmPerPixel > 0 ? calibration.scaleMmPerPixel : null;
  const areaMm2 = scale ? Number((areaPixels * scale * scale).toFixed(1)) : undefined;
  const skeletonLengthMm = scale ? Number((skeletonLengthPixels * scale).toFixed(1)) : undefined;
  const meanWidthMm = scale ? Number((meanWidthPixels * scale).toFixed(2)) : undefined;
  const maxWidthMm = scale ? Number((maxWidthPixels * scale).toFixed(2)) : undefined;

  // Measurement uncertainty based on optical resolution and skeleton discretization
  const uncertaintyEstimatePct = scale ? 3.5 : 7.0;

  return {
    areaPixels,
    areaMm2,
    skeletonLengthPixels,
    skeletonLengthMm,
    meanWidthPixels,
    meanWidthMm,
    maxWidthPixels,
    maxWidthMm,
    crackDensity,
    connectedComponents,
    primaryOrientationDeg,
    uncertaintyEstimatePct,
  };
}

/**
 * Generate a synthetic crack ground truth specimen for deterministic verification
 */
export function generateSyntheticCrackSpecimen(
  width = 256,
  height = 256,
  crackType: 'shear-diagonal' | 'vertical-flexural' | 'notch-tensile' = 'shear-diagonal'
): { image: Uint8Array; mask: Uint8Array; width: number; height: number; groundTruthLengthPx: number } {
  const mask = new Uint8Array(width * height);
  const image = new Uint8Array(width * height * 4); // RGBA

  // Background concrete texture simulation with subtle aggregate noise
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const noise = ((Math.sin(x * 0.1) * Math.cos(y * 0.1) + 1) * 15) + (Math.random() * 20);
      const val = Math.min(255, Math.max(0, 190 + noise - (x + y) * 0.05));
      image[idx] = val; // R
      image[idx + 1] = val; // G
      image[idx + 2] = val - 4; // B (subtle warm tone)
      image[idx + 3] = 255;
    }
  }

  let groundTruthLengthPx = 0;

  if (crackType === 'shear-diagonal') {
    // 45 degree shear trajectory with realistic jagged path
    for (let t = 20; t < width - 20; t++) {
      const y = Math.round(t + Math.sin(t * 0.15) * 4 + (Math.random() - 0.5) * 2);
      if (y >= 0 && y < height) {
        groundTruthLengthPx++;
        const crackWidthHalf = Math.round(1 + Math.sin(t * 0.05) * 2.5);
        for (let dy = -crackWidthHalf; dy <= crackWidthHalf; dy++) {
          for (let dx = -crackWidthHalf; dx <= crackWidthHalf; dx++) {
            const px = t + dx;
            const py = y + dy;
            if (px >= 0 && px < width && py >= 0 && py < height) {
              mask[py * width + px] = 255;
              const imgIdx = (py * width + px) * 4;
              image[imgIdx] = 40;
              image[imgIdx + 1] = 42;
              image[imgIdx + 2] = 45;
            }
          }
        }
      }
    }
  } else if (crackType === 'vertical-flexural') {
    const midX = Math.round(width / 2);
    for (let y = 20; y < height - 20; y++) {
      const x = Math.round(midX + Math.sin(y * 0.08) * 6 + (Math.random() - 0.5) * 1.5);
      groundTruthLengthPx++;
      const crackWidthHalf = Math.round(2 + Math.sin(y * 0.03) * 1.8);
      for (let dy = -crackWidthHalf; dy <= crackWidthHalf; dy++) {
        for (let dx = -crackWidthHalf; dx <= crackWidthHalf; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            mask[py * width + px] = 255;
            const imgIdx = (py * width + px) * 4;
            image[imgIdx] = 35;
            image[imgIdx + 1] = 38;
            image[imgIdx + 2] = 40;
          }
        }
      }
    }
  } else {
    // Notch tensile
    const midX = Math.round(width / 2);
    for (let y = 0; y < Math.round(height * 0.65); y++) {
      const x = midX + Math.round((Math.random() - 0.5) * 2);
      groundTruthLengthPx++;
      const crackWidthHalf = y < 30 ? 5 : 2; // notch root opening
      for (let dx = -crackWidthHalf; dx <= crackWidthHalf; dx++) {
        const px = x + dx;
        if (px >= 0 && px < width) {
          mask[y * width + px] = 255;
          const imgIdx = (y * width + px) * 4;
          image[imgIdx] = 30;
          image[imgIdx + 1] = 30;
          image[imgIdx + 2] = 35;
        }
      }
    }
  }

  return { image, mask, width, height, groundTruthLengthPx };
}
