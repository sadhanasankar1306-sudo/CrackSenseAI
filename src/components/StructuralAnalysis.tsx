import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileSpreadsheet,
  Compass,
  ArrowRight,
  BookOpen,
  Info,
} from 'lucide-react';
import { Structure, InspectionRecord } from '../types';

interface StructuralAnalysisProps {
  structures: Structure[];
  activeStructure: Structure;
  inspections: InspectionRecord[];
  onNavigateToFEA: () => void;
}

export const StructuralAnalysis: React.FC<StructuralAnalysisProps> = ({
  structures,
  activeStructure,
  inspections,
  onNavigateToFEA,
}) => {
  const [exposureCondition, setExposureCondition] = useState<
    'Dry Interior' | 'Humid / Soil' | 'Deicing Salts' | 'Seawater Spray' | 'Water Retaining'
  >('Humid / Soil');

  // Limit thresholds from ACI 224R-01 Table 4.1 & Eurocode 2
  const limitMap = {
    'Dry Interior': 0.41,
    'Humid / Soil': 0.30,
    'Deicing Salts': 0.18,
    'Seawater Spray': 0.15,
    'Water Retaining': 0.10,
  };

  const permissibleLimitMm = limitMap[exposureCondition];

  // Latest inspection for active structure
  const structureInspections = inspections.filter((i) => i.structureId === activeStructure.id);
  const latestInspection = structureInspections[0] || inspections[0];

  const maxWidth = latestInspection?.metrics.maxWidthMm || 0.35;
  const isExceeded = maxWidth > permissibleLimitMm;
  const severityRatio = Number((maxWidth / permissibleLimitMm).toFixed(2));

  // Damage Index formula: DI = (w_max / w_limit) * sqrt(density / 5.0)
  const density = latestInspection?.metrics.crackDensity || 3.5;
  const damageIndex = Number((severityRatio * Math.sqrt(density / 3.0)).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E1D8]">
        <div>
          <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider mb-1">
            Structural Integrity & Code Compliance
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#263238] font-serif-display">
            Concrete Crack Severity & Standards Assessment
          </h1>
          <p className="text-sm text-[#69777B] mt-1 max-w-2xl">
            Evaluates measured crack geometry against ACI 224R-01 and Eurocode 2 (EN 1992-1-1) limits.
            Identifies fracture mechanisms and environmental corrosion vulnerability.
          </p>
        </div>

        <button
          onClick={onNavigateToFEA}
          className="px-3.5 py-2 text-xs font-medium text-white bg-[#426B9A] hover:bg-[#34567e] rounded transition-colors flex items-center gap-2 self-start md:self-auto shadow-xs"
        >
          <span>Transfer Geometry to FEA Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Engineering Disclaimer Card */}
      <div className="bg-[#F7F5EF] border border-[#E4E1D8] p-4 rounded text-xs text-[#69777B] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#426B9A] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#263238]">Fundamental Civil Engineering Principle: </span>
          Surface crack measurements establish serviceability and environmental ingress risk. They do not
          independently define residual structural capacity, rebar stress, or internal shear strength without
          destructive coring, ultrasonic pulse velocity, or validated Finite Element Analysis.
        </div>
      </div>

      {/* Exposure Condition Selector & Limit Matrix */}
      <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E4E1D8]">
          <div>
            <h2 className="text-base font-bold text-[#263238] font-serif-display">
              Environmental Exposure Classification (ACI 224R-01)
            </h2>
            <div className="text-xs text-[#69777B]">
              Allowable crack widths at steel reinforcement level under sustained service loads
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#69777B]">Exposure:</span>
            <select
              value={exposureCondition}
              onChange={(e) => setExposureCondition(e.target.value as any)}
              className="bg-[#F7F5EF] border border-[#E4E1D8] rounded px-3 py-1.5 text-xs font-semibold text-[#263238] focus:outline-none focus:border-[#167D80]"
            >
              <option value="Dry Interior">Dry Interior / Protected (0.41 mm)</option>
              <option value="Humid / Soil">Humid, moist air, soil (0.30 mm)</option>
              <option value="Deicing Salts">Deicing chemicals (0.18 mm)</option>
              <option value="Seawater Spray">Seawater spray / Marine (0.15 mm)</option>
              <option value="Water Retaining">Water retaining structures (0.10 mm)</option>
            </select>
          </div>
        </div>

        {/* Comparison KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3 bg-[#F7F5EF]/50 border border-[#E4E1D8] rounded">
            <div className="text-xs text-[#69777B] mb-1">Permissible Limit (ACI)</div>
            <div className="text-xl font-bold font-mono-tabular text-[#263238]">
              {permissibleLimitMm.toFixed(2)} mm
            </div>
            <div className="text-[10px] text-[#69777B] mt-0.5">{exposureCondition} condition</div>
          </div>

          <div className="p-3 bg-[#F7F5EF]/50 border border-[#E4E1D8] rounded">
            <div className="text-xs text-[#69777B] mb-1">Measured Max Width</div>
            <div
              className={`text-xl font-bold font-mono-tabular ${
                isExceeded ? 'text-[#B84A43]' : 'text-[#3E7958]'
              }`}
            >
              {maxWidth.toFixed(2)} mm
            </div>
            <div className="text-[10px] text-[#69777B] mt-0.5">
              Region: {latestInspection?.regionId || 'N/A'}
            </div>
          </div>

          <div className="p-3 bg-[#F7F5EF]/50 border border-[#E4E1D8] rounded">
            <div className="text-xs text-[#69777B] mb-1">Limit Exceedance Ratio</div>
            <div
              className={`text-xl font-bold font-mono-tabular ${
                isExceeded ? 'text-[#B84A43]' : 'text-[#3E7958]'
              }`}
            >
              {severityRatio}×
            </div>
            <div className="text-[10px] text-[#69777B] mt-0.5">
              {isExceeded ? 'Exceeds threshold' : 'Complies with code'}
            </div>
          </div>

          <div className="p-3 bg-[#F7F5EF]/50 border border-[#E4E1D8] rounded">
            <div className="text-xs text-[#69777B] mb-1">Composite Damage Index</div>
            <div
              className={`text-xl font-bold font-mono-tabular ${
                damageIndex > 1.2 ? 'text-[#B84A43]' : damageIndex > 0.8 ? 'text-[#B47A32]' : 'text-[#3E7958]'
              }`}
            >
              {damageIndex}
            </div>
            <div className="text-[10px] text-[#69777B] mt-0.5">
              {damageIndex > 1.2 ? 'Elevated structural risk' : 'Serviceable condition'}
            </div>
          </div>
        </div>
      </div>

      {/* Structural Mechanism & Diagnostic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
          <h2 className="text-base font-bold text-[#263238] font-serif-display">
            Identified Fracture Mechanism
          </h2>

          <div className="p-4 bg-[#F7F5EF]/40 border border-[#E4E1D8] rounded space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#69777B]">Structural Context:</span>
              <span className="font-semibold text-[#167D80]">
                {latestInspection?.structuralContext || 'Shear span'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#69777B]">Crack Orientation:</span>
              <span className="font-semibold text-[#263238] font-mono-tabular">
                {latestInspection?.metrics.primaryOrientationDeg || 48.2}° from horizontal
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#69777B]">Probable Failure Mode:</span>
              <span className="font-semibold text-[#B84A43]">
                Diagonal Tension (Shear-Compression)
              </span>
            </div>

            <div className="text-xs text-[#69777B] leading-relaxed pt-2 border-t border-[#E4E1D8]">
              Inclined cracking at ~45° indicates principal tensile stresses exceeding concrete tensile strength
              (f_ctm ≈ 2.9 MPa). Stirrup shear reinforcement engagement is likely active.
            </div>
          </div>

          <div className="text-xs space-y-2">
            <div className="font-semibold text-[#263238]">Recommended Action Checklist:</div>
            <div className="space-y-1.5 text-[#69777B]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D80]" />
                <span>Verify shear stirrup spacing from original construction drawings.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D80]" />
                <span>Install vibrating-wire crack displacement meter (CMOD sensor).</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#167D80]" />
                <span>Perform numerical FEA simulation with damaged shear stiffness.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corrosion & Cover Depth Assessment */}
        <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
          <h2 className="text-base font-bold text-[#263238] font-serif-display">
            Reinforcement Corrosion & Cover Ingress
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-[#F7F5EF] rounded border border-[#E4E1D8]">
              <span className="text-[#69777B]">Nominal Concrete Cover (c_nom):</span>
              <span className="font-bold text-[#263238] font-mono-tabular">40 mm</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-[#F7F5EF] rounded border border-[#E4E1D8]">
              <span className="text-[#69777B]">Estimated Crack Penetration ($a$):</span>
              <span className="font-bold text-[#B84A43] font-mono-tabular">
                {(maxWidth * 18.5).toFixed(1)} mm ({((maxWidth * 18.5) / 200 * 100).toFixed(0)}% depth)
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-[#F7F5EF] rounded border border-[#E4E1D8]">
              <span className="text-[#69777B]">Carbonation / Chloride Front:</span>
              <span className="font-bold text-[#B47A32]">Moderate Ingress Risk</span>
            </div>

            <div className="p-3 bg-[#B84A43]/10 border border-[#B84A43]/20 rounded text-[#B84A43] text-xs leading-relaxed">
              When crack opening exceeds 0.20 mm in moisture exposure, moisture and chloride transport transitions
              from slow diffusion to rapid capillary absorption, drastically shortening time to rebar depassivation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
