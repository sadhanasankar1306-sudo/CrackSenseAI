export interface Structure {
  id: string;
  name: string;
  code: string;
  type: 'Bridge Pier' | 'RC Beam' | 'Retaining Wall' | 'Floor Slab' | 'Dam Gallery' | 'Laboratory Specimen';
  location: string;
  constructionYear: number;
  concreteGrade: string; // e.g. "C30/37" or "f'c = 35 MPa"
  totalInspections: number;
  activeCracksCount: number;
  riskStatus: 'Stable' | 'Monitor' | 'Review Required';
  isDemo?: boolean;
}

export interface CrackMetrics {
  areaPixels: number;
  areaMm2?: number;
  skeletonLengthPixels: number;
  skeletonLengthMm?: number;
  meanWidthPixels: number;
  meanWidthMm?: number;
  maxWidthPixels: number;
  maxWidthMm?: number;
  crackDensity: number; // percentage of inspected area
  connectedComponents: number;
  primaryOrientationDeg: number;
  uncertaintyEstimatePct: number;
}

export interface CalibrationData {
  isCalibrated: boolean;
  scaleMmPerPixel: number;
  calibrationMethod: 'Ruler Tag' | 'Optical Target' | 'Laser Grid' | 'Known Dimension' | 'Uncalibrated (Pixel Scale)';
  referenceDimensionMm?: number;
  referenceDimensionPx?: number;
  notes?: string;
}

export interface InspectionRecord {
  id: string;
  structureId: string;
  structureName: string;
  regionId: string;
  regionDescription: string;
  timestamp: string; // ISO string
  inspector: string;
  imageUrl: string;
  maskUrl?: string;
  modelVersion: string;
  confidenceScore: number;
  metrics: CrackMetrics;
  calibration: CalibrationData;
  severityLevel: 'Negligible (<0.1mm)' | 'Low (0.1-0.2mm)' | 'Moderate (0.2-0.3mm)' | 'Critical (>0.3mm)';
  structuralContext: 'Flexural zone' | 'Shear span' | 'Torsional region' | 'Shrinkage pattern' | 'Direct tension';
  inspectorNotes: string;
  isDemo?: boolean;
}

export interface ProgressionComparison {
  structureId: string;
  regionId: string;
  baselineInspection: InspectionRecord;
  currentInspection: InspectionRecord;
  timeDeltaDays: number;
  deltaAreaMm2: number;
  deltaAreaPercent: number;
  deltaLengthMm: number;
  deltaMeanWidthMm: number;
  deltaMaxWidthMm: number;
  growthRateMmPerMonth: number;
  growthRateStatus: 'Stable (<0.01 mm/mo)' | 'Slow Progression (0.01-0.05 mm/mo)' | 'Active Growth (>0.05 mm/mo)' | 'Accelerated / Review Required';
  alignmentQualityScore: number; // 0.0 - 1.0 (e.g. 0.94)
  alignmentMethod: 'ORB Feature Homography' | 'ECC Alignment' | 'Manual Control Points';
  warnings: string[];
}

export interface FEARunParameters {
  modelType: 'Simply Supported Beam' | 'Cantilever Beam' | 'Center-Notched Plate' | 'Edge-Cracked Tension Specimen';
  lengthMm: number; // L
  heightMm: number; // H
  thicknessMm: number; // B
  elasticModulusGPa: number; // E (e.g., 30 GPa for concrete)
  poissonsRatio: number; // nu (e.g., 0.20)
  appliedLoadKN: number; // P or w
  loadType: 'Point Load at Midspan' | 'Uniformly Distributed Load' | 'Pure Tension' | 'Four-Point Bending';
  hasCrack: boolean;
  crackDepthMm: number; // a
  crackLocationMm: number; // x position
  crackWidthMm: number; // w
  meshDensity: 'Coarse (120 elements)' | 'Medium (480 elements)' | 'Fine (1920 elements)' | 'Adaptive Refined (3800 elements)';
}

export interface FEAResult {
  id: string;
  timestamp: string;
  params: FEARunParameters;
  maxDeflectionMm: number;
  analyticalDeflectionMm: number;
  deflectionDiscrepancyPct: number;
  maxVonMisesStressMPa: number;
  analyticalMaxStressMPa: number;
  stressConcentrationFactorKt: number;
  meshElementsCount: number;
  nodesCount: number;
  computationTimeMs: number;
  stressFieldGrid: number[][]; // 2D grid of von Mises stress for contour plot
  displacementFieldGrid: number[][]; // 2D grid of displacement magnitude
  convergenceData: { elements: number; maxStressMPa: number; deflectionMm: number }[];
  engineeringNotes: string[];
}

export interface ModelBenchmark {
  modelName: string;
  architecture: string;
  backbone: string;
  dataset: 'Crack500' | 'DeepCrack' | 'SDNET2018 (Annotated)' | 'CrackSense-Combined';
  diceScore: number;
  iouScore: number;
  precision: number;
  recall: number;
  f1Score: number;
  inferenceTimeMs: number;
  parametersMillion: number;
  trainedEpochs: number;
}
