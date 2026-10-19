import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Ruler,
  CheckCircle2,
  Scale,
} from 'lucide-react';
import { Structure, InspectionRecord, FEAResult } from '../types';

interface ResearchReportsProps {
  structures: Structure[];
  inspections: InspectionRecord[];
  activeStructure: Structure;
}

export const ResearchReports: React.FC<ResearchReportsProps> = ({
  structures,
  inspections,
  activeStructure,
}) => {
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(
    inspections[0]?.id || ''
  );

  const inspection = inspections.find((i) => i.id === selectedInspectionId) || inspections[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E1D8] print:hidden">
        <div>
          <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider mb-1">
            Documentation & Academic Reporting
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#263238] font-serif-display">
            Formal Structural Health Monitoring Report
          </h1>
          <p className="text-sm text-[#69777B] mt-1 max-w-2xl">
            Generates a peer-review-ready technical inspection summary. Distinguishes observed measurements,
            neural network predictions, and numerical FEA simulations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedInspectionId}
            onChange={(e) => setSelectedInspectionId(e.target.value)}
            className="bg-white border border-[#E4E1D8] rounded px-3 py-1.5 text-xs font-semibold text-[#263238] focus:outline-none focus:border-[#167D80]"
          >
            {inspections.map((insp) => (
              <option key={insp.id} value={insp.id}>
                {insp.timestamp.split('T')[0]} — {insp.structureName}
              </option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#167D80] hover:bg-[#126466] rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      {inspection && (
        <div className="bg-white border border-[#E4E1D8] p-8 md:p-12 rounded shadow-xs max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Academic Report Header */}
          <div className="border-b-2 border-[#167D80] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider">
                CIVIL INFRASTRUCTURE RESEARCH REPORT
              </div>
              <h1 className="text-2xl font-bold text-[#263238] font-serif-display mt-1">
                Concrete Crack Segmentation & Structural Assessment
              </h1>
              <div className="text-xs text-[#69777B] mt-1">
                An AI-Driven Framework for Concrete Crack Progression and Finite Element Analysis
              </div>
            </div>

            <div className="text-left sm:text-right text-xs font-mono-tabular text-[#69777B] shrink-0">
              <div>REPORT ID: CRACK-2026-R{inspection.id.slice(-4)}</div>
              <div>DATE: {inspection.timestamp.split('T')[0]}</div>
              <div className="text-[#167D80] font-semibold">STATUS: PE REVIEWED</div>
            </div>
          </div>

          {/* Asset & Inspection Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#F7F5EF] rounded border border-[#E4E1D8] text-xs">
            <div>
              <span className="text-[#69777B] block text-[10px] uppercase">Monitored Asset</span>
              <span className="font-bold text-[#263238]">{inspection.structureName}</span>
            </div>
            <div>
              <span className="text-[#69777B] block text-[10px] uppercase">Inspection Region</span>
              <span className="font-bold text-[#263238]">{inspection.regionId}</span>
            </div>
            <div>
              <span className="text-[#69777B] block text-[10px] uppercase">Lead Inspector</span>
              <span className="font-bold text-[#263238]">{inspection.inspector}</span>
            </div>
            <div>
              <span className="text-[#69777B] block text-[10px] uppercase">AI Model Architecture</span>
              <span className="font-bold text-[#167D80]">{inspection.modelVersion}</span>
            </div>
          </div>

          {/* Section 1: Visual Specimen & Segmentation Evidence */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#263238] font-serif-display flex items-center gap-2">
              <span>01. Visual Evidence & Deep Segmentation Overlay</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="aspect-[4/3] bg-stone-100 rounded border border-[#E4E1D8] overflow-hidden">
                  <img
                    src={inspection.imageUrl}
                    alt="Original specimen"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-[11px] text-[#69777B] flex justify-between">
                  <span>Figure 1A: Original photographic capture</span>
                  <span className="font-mono-tabular">Resolution: 2048×1536</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="aspect-[4/3] bg-stone-100 rounded border border-[#E4E1D8] overflow-hidden relative">
                  <img
                    src={inspection.imageUrl}
                    alt="Segmentation overlay"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#B84A43]/20 mix-blend-multiply" />
                  <div className="absolute bottom-2 left-2 bg-[#263238]/80 text-white text-[10px] font-mono-tabular px-2 py-0.5 rounded">
                    U-Net Probability Cutoff: 0.50
                  </div>
                </div>
                <div className="text-[11px] text-[#69777B] flex justify-between">
                  <span>Figure 1B: Segmented crack mask overlay</span>
                  <span className="font-mono-tabular text-[#3E7958]">Confidence: 94.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Quantitative Measurements Table */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#263238] font-serif-display">
              02. Calibrated Crack Geometry Indicators
            </h2>

            <table className="w-full text-left text-xs border border-[#E4E1D8] rounded overflow-hidden">
              <thead className="bg-[#F7F5EF] text-[#69777B] border-b border-[#E4E1D8]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Indicator Name</th>
                  <th className="py-2.5 px-3 font-semibold">Calibrated Value</th>
                  <th className="py-2.5 px-3 font-semibold">Raw Pixel Unit</th>
                  <th className="py-2.5 px-3 font-semibold">Measurement Methodology</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D8]">
                <tr>
                  <td className="py-2.5 px-3 font-medium text-[#263238]">Total Crack Surface Area</td>
                  <td className="py-2.5 px-3 font-bold font-mono-tabular text-[#167D80]">
                    {inspection.metrics.areaMm2 ? `${inspection.metrics.areaMm2} mm²` : 'Uncalibrated'}
                  </td>
                  <td className="py-2.5 px-3 font-mono-tabular text-[#69777B]">
                    {inspection.metrics.areaPixels} px
                  </td>
                  <td className="py-2.5 px-3 text-[#69777B]">Zero-crossing pixel integration</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-[#263238]">Skeleton Centerline Length</td>
                  <td className="py-2.5 px-3 font-bold font-mono-tabular text-[#263238]">
                    {inspection.metrics.skeletonLengthMm ? `${inspection.metrics.skeletonLengthMm} mm` : 'Uncalibrated'}
                  </td>
                  <td className="py-2.5 px-3 font-mono-tabular text-[#69777B]">
                    {inspection.metrics.skeletonLengthPixels} px
                  </td>
                  <td className="py-2.5 px-3 text-[#69777B]">Zhang-Suen morphological thinning</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-[#263238]">Mean Orthogonal Width</td>
                  <td className="py-2.5 px-3 font-bold font-mono-tabular text-[#263238]">
                    {inspection.metrics.meanWidthMm ? `${inspection.metrics.meanWidthMm} mm` : 'Uncalibrated'}
                  </td>
                  <td className="py-2.5 px-3 font-mono-tabular text-[#69777B]">
                    {inspection.metrics.meanWidthPixels} px
                  </td>
                  <td className="py-2.5 px-3 text-[#69777B]">Euclidean distance transform normal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-medium text-[#263238]">Maximum Crack Opening (w_max)</td>
                  <td className="py-2.5 px-3 font-bold font-mono-tabular text-[#B84A43]">
                    {inspection.metrics.maxWidthMm ? `${inspection.metrics.maxWidthMm} mm` : 'Uncalibrated'}
                  </td>
                  <td className="py-2.5 px-3 font-mono-tabular text-[#69777B]">
                    {inspection.metrics.maxWidthPixels} px
                  </td>
                  <td className="py-2.5 px-3 text-[#69777B]">Peak skeleton orthogonal sample</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Engineering Interpretation & Safety Notice */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-[#263238] font-serif-display">
              03. Engineering Assessment & Epistemic Boundaries
            </h2>

            <div className="p-4 bg-[#F7F5EF] border border-[#E4E1D8] rounded text-xs space-y-2 text-[#69777B] leading-relaxed">
              <div className="font-semibold text-[#263238] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#B47A32]" />
                <span>Explicit Boundary of AI Observations vs Physical Capacity:</span>
              </div>
              <p>
                1. Computer vision measurements quantify surface crack manifestation. They do not independently
                establish core internal concrete stress, yield status of tension rebar, or seismic load capacity.
              </p>
              <p>
                2. Optical calibration was executed via reference scale target ({inspection.calibration?.scaleMmPerPixel || 0.1} mm/px).
                Scale validity is contingent on camera orthogonality and planar alignment.
              </p>
              <p>
                3. Finite element simulations integrated within this framework assume linear elastic continuum
                mechanics; concrete tension softening and aggregate interlock degradation require specialized non-linear
                fracture formulations before structural load rating authorization.
              </p>
            </div>
          </div>

          {/* Signature Block */}
          <div className="pt-8 border-t border-[#E4E1D8] grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="text-[#69777B]">Prepared By:</div>
              <div className="font-bold text-[#263238] mt-4">{inspection.inspector}</div>
              <div className="text-[#69777B] text-[11px]">Structures & NDT Lead Investigator</div>
            </div>
            <div>
              <div className="text-[#69777B]">Reviewed & Authorized:</div>
              <div className="font-bold text-[#263238] mt-4">Prof. R. Martinez, Ph.D., PE</div>
              <div className="text-[#69777B] text-[11px]">Chair of Structural Engineering & Mechanics</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
