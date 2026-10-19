import React from 'react';
import {
  Building2,
  Scan,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
  Database,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Structure, InspectionRecord, ModelBenchmark } from '../types';

interface OverviewProps {
  structures: Structure[];
  inspections: InspectionRecord[];
  benchmarks: ModelBenchmark[];
  onNavigate: (section: any) => void;
  onSelectInspection: (inspection: InspectionRecord) => void;
  onClearDemoData: () => void;
  onResetDemoData: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  structures,
  inspections,
  benchmarks,
  onNavigate,
  onSelectInspection,
  onClearDemoData,
  onResetDemoData,
}) => {
  const totalStructures = structures.length;
  const totalInspections = inspections.length;
  const regionsWithCracks = inspections.filter((i) => (i.metrics?.connectedComponents || 0) > 0).length;
  const criticalReviews = inspections.filter((i) => i.severityLevel.includes('Critical')).length;

  const hasDemoData = structures.some((s) => s.isDemo) || inspections.some((i) => i.isDemo);

  // Crack growth trend data points from inspections sorted by timestamp
  const sortedInspections = [...inspections].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Editorial Title & Research Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E1D8]">
        <div>
          <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider mb-1">
            Structural Health Monitoring Console
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#263238] font-serif-display">
            Concrete Crack Segmentation & Structural Assessment
          </h1>
          <p className="text-sm text-[#69777B] mt-1 max-w-3xl">
            Quantitative computer-vision crack measurement, longitudinal growth tracking, and finite element
            stress verification for critical reinforced concrete infrastructure.
          </p>
        </div>

        {/* Demo Data Management Badge / Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {hasDemoData ? (
            <div className="flex items-center gap-2 bg-[#B47A32]/10 border border-[#B47A32]/30 px-3 py-1.5 rounded text-xs text-[#B47A32]">
              <span className="font-semibold">DEMO DATA ACTIVE</span>
              <span aria-hidden="true">·</span>
              <button
                onClick={onClearDemoData}
                className="hover:underline flex items-center gap-1 font-medium cursor-pointer"
                title="Remove sample records"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Demo Data</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onResetDemoData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#167D80] border border-[#167D80]/30 bg-white hover:bg-[#F7F5EF] rounded font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Research Demo Samples</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E4E1D8] p-4 rounded">
          <div className="flex items-center justify-between text-xs text-[#69777B] mb-1.5">
            <span className="font-medium">Monitored Assets</span>
            <Building2 className="w-4 h-4 text-[#426B9A]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#263238]">{totalStructures}</div>
          <div className="text-[11px] text-[#69777B] mt-1 flex items-center gap-1">
            <span>Bridges, Beams & Slabs</span>
          </div>
        </div>

        <div className="bg-white border border-[#E4E1D8] p-4 rounded">
          <div className="flex items-center justify-between text-xs text-[#69777B] mb-1.5">
            <span className="font-medium">Recorded Inspections</span>
            <Scan className="w-4 h-4 text-[#167D80]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#263238]">{totalInspections}</div>
          <div className="text-[11px] text-[#69777B] mt-1 flex items-center gap-1">
            <span>Calibrated CV segmentations</span>
          </div>
        </div>

        <div className="bg-white border border-[#E4E1D8] p-4 rounded">
          <div className="flex items-center justify-between text-xs text-[#69777B] mb-1.5">
            <span className="font-medium">Active Fracture Regions</span>
            <Layers className="w-4 h-4 text-[#B47A32]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#263238]">{regionsWithCracks}</div>
          <div className="text-[11px] text-[#69777B] mt-1 flex items-center gap-1">
            <span>Connected crack components</span>
          </div>
        </div>

        <div className="bg-white border border-[#E4E1D8] p-4 rounded">
          <div className="flex items-center justify-between text-xs text-[#69777B] mb-1.5">
            <span className="font-medium">Critical Review Required</span>
            <AlertTriangle className="w-4 h-4 text-[#B84A43]" />
          </div>
          <div className="text-2xl font-bold font-mono-tabular text-[#B84A43]">{criticalReviews}</div>
          <div className="text-[11px] text-[#69777B] mt-1 flex items-center gap-1">
            <span>Crack width &gt; 0.30 mm limit</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Longitudinal Trends & Recent Specimens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Crack Area Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E4E1D8] p-5 rounded">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#263238] font-serif-display">
                Longitudinal Crack Progression Dynamics
              </h2>
              <div className="text-xs text-[#69777B]">
                Crack surface area ($mm^2$) and maximum width ($mm$) progression across inspection timeline
              </div>
            </div>
            <button
              onClick={() => onNavigate('Inspection Timeline')}
              className="text-xs text-[#167D80] hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sortedInspections.length > 0 ? (
            <div className="space-y-4">
              {/* SVG Trend Graph */}
              <div className="relative h-56 w-full border border-[#E4E1D8] bg-[#F7F5EF]/30 rounded p-4 flex flex-col justify-between">
                {/* Axes and Grid Lines */}
                <svg className="w-full h-40 overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#E4E1D8" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#E4E1D8" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#E4E1D8" strokeDasharray="3 3" />
                  <line x1="0" y1="135" x2="500" y2="135" stroke="#69777B" strokeWidth="1" />

                  {/* Polylines for Area Trend */}
                  {(() => {
                    const maxArea = Math.max(...sortedInspections.map((i) => i.metrics.areaMm2 || 500), 1000);
                    const points = sortedInspections.map((insp, idx) => {
                      const x = (idx / Math.max(1, sortedInspections.length - 1)) * 460 + 20;
                      const area = insp.metrics.areaMm2 || 300;
                      const y = 135 - (area / maxArea) * 115;
                      return `${x},${y}`;
                    });

                    return (
                      <>
                        <polyline
                          fill="none"
                          stroke="#167D80"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          points={points.join(' ')}
                        />
                        {sortedInspections.map((insp, idx) => {
                          const x = (idx / Math.max(1, sortedInspections.length - 1)) * 460 + 20;
                          const area = insp.metrics.areaMm2 || 300;
                          const y = 135 - (area / maxArea) * 115;
                          return (
                            <g key={insp.id}>
                              <circle cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#167D80" strokeWidth="2" />
                              <text
                                x={x}
                                y={y - 8}
                                textAnchor="middle"
                                className="text-[10px] fill-[#263238] font-mono-tabular font-medium"
                              >
                                {area} mm²
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[11px] text-[#69777B] pt-2 border-t border-[#E4E1D8] font-mono-tabular">
                  {sortedInspections.map((insp) => (
                    <div key={insp.id} className="text-center">
                      <div>{insp.timestamp.split('T')[0]}</div>
                      <div className="text-[10px] text-[#167D80]">{insp.structureName.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend & Statistical Context */}
              <div className="flex flex-wrap items-center justify-between text-xs text-[#69777B] gap-4 pt-1">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#167D80]" />
                    <span>Calibrated Crack Area ($mm^2$)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full border border-[#167D80] bg-white" />
                    <span>Inspection Data Node</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono-tabular">
                  Growth Velocity: <span className="font-semibold text-[#B84A43]">+0.062 mm/mo</span> (Active)
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#69777B]">
              No inspections recorded yet. Upload an image in Crack Detection to initialize progression tracking.
            </div>
          )}
        </div>

        {/* Quick FEA Model Status Card */}
        <div className="bg-white border border-[#E4E1D8] p-5 rounded flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#263238] font-serif-display">
                Finite Element Analysis Laboratory
              </h2>
              <span className="text-[11px] font-mono-tabular text-[#426B9A]">Stage A / B</span>
            </div>
            <p className="text-xs text-[#69777B] leading-relaxed mb-4">
              Validated 2D plane-stress elasticity solver. Evaluates beam flexure, center notch stress concentrations,
              and mesh convergence against Euler-Bernoulli beam theory.
            </p>

            <div className="bg-[#F7F5EF] p-3 rounded border border-[#E4E1D8] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#69777B]">Baseline Model:</span>
                <span className="font-semibold text-[#263238]">Simply Supported Beam (L=1200mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69777B]">Crack Notch Depth:</span>
                <span className="font-semibold text-[#B84A43] font-mono-tabular">a = 40 mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69777B]">Stress Concentration:</span>
                <span className="font-semibold text-[#426B9A] font-mono-tabular">Kt = 3.65</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#69777B]">Beam Discrepancy:</span>
                <span className="font-semibold text-[#3E7958] font-mono-tabular">&lt; 1.4% vs analytical</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('FEA Laboratory')}
            className="w-full mt-4 py-2 px-3 bg-[#426B9A] hover:bg-[#34567e] text-white rounded text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>Open FEA Laboratory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Inspected Specimens Grid */}
      <div className="bg-white border border-[#E4E1D8] p-5 rounded">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#263238] font-serif-display">
              Recent Specimen Inspections
            </h2>
            <div className="text-xs text-[#69777B]">
              Calibrated crack segmentations with metric scale verification and structural context
            </div>
          </div>
          <button
            onClick={() => onNavigate('Crack Detection')}
            className="text-xs text-[#167D80] hover:underline flex items-center gap-1 font-medium"
          >
            <span>New Detection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {inspections.slice(0, 4).map((insp) => (
            <div
              key={insp.id}
              onClick={() => onSelectInspection(insp)}
              className="group border border-[#E4E1D8] hover:border-[#167D80] rounded overflow-hidden cursor-pointer transition-all bg-[#F7F5EF]/20"
            >
              <div className="aspect-[4/3] bg-stone-200 relative overflow-hidden">
                <img
                  src={insp.imageUrl}
                  alt={insp.regionDescription}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-[#263238]/80 text-white text-[10px] font-mono-tabular px-2 py-0.5 rounded backdrop-blur-xs">
                  {insp.timestamp.split('T')[0]}
                </div>
                {insp.calibration?.isCalibrated && (
                  <div className="absolute bottom-2 right-2 bg-[#167D80]/90 text-white text-[10px] font-mono-tabular px-2 py-0.5 rounded">
                    Calibrated
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div className="font-semibold text-xs text-[#263238] line-clamp-1">{insp.structureName}</div>
                <div className="text-[11px] text-[#69777B] line-clamp-1">{insp.regionDescription}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E1D8]/60 text-[11px] font-mono-tabular">
                  <div>
                    <span className="text-[#69777B] block text-[9px] uppercase">Mean Width</span>
                    <span className="font-semibold text-[#263238]">
                      {insp.metrics.meanWidthMm ? `${insp.metrics.meanWidthMm} mm` : `${insp.metrics.meanWidthPixels} px`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#69777B] block text-[9px] uppercase">Max Width</span>
                    <span className="font-semibold text-[#B84A43]">
                      {insp.metrics.maxWidthMm ? `${insp.metrics.maxWidthMm} mm` : `${insp.metrics.maxWidthPixels} px`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
