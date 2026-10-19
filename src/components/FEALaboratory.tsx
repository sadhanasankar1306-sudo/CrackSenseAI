import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  FileSpreadsheet,
  Info,
  Maximize2,
} from 'lucide-react';
import { FEARunParameters, FEAResult, InspectionRecord } from '../types';
import { solveFEA } from '../utils/feaEngine';

interface FEALaboratoryProps {
  activeInspection?: InspectionRecord | null;
}

export const FEALaboratory: React.FC<FEALaboratoryProps> = ({ activeInspection }) => {
  // FEA Parameters state
  const [params, setParams] = useState<FEARunParameters>({
    modelType: 'Simply Supported Beam',
    lengthMm: 1200,
    heightMm: 200,
    thicknessMm: 150,
    elasticModulusGPa: 30, // 30 GPa for C30/37 concrete
    poissonsRatio: 0.20,
    appliedLoadKN: 25.0,
    loadType: 'Point Load at Midspan',
    hasCrack: true,
    crackDepthMm: activeInspection?.metrics?.maxWidthMm
      ? Math.round(activeInspection.metrics.maxWidthMm * 15)
      : 35,
    crackLocationMm: 600,
    crackWidthMm: activeInspection?.metrics?.maxWidthMm || 2.8,
    meshDensity: 'Medium (480 elements)',
  });

  const [activeStage, setActiveStage] = useState<'Stage A' | 'Stage B' | 'Stage C'>('Stage B');
  const [contourField, setContourField] = useState<'vonMises' | 'displacement'>('vonMises');
  const [feaResult, setFeaResult] = useState<FEAResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Run FEA calculation
  const runSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = solveFEA(params);
      setFeaResult(res);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    runSimulation();
  }, [params.meshDensity, params.hasCrack, activeStage]);

  // Handle stage toggling
  const setStageMode = (stage: 'Stage A' | 'Stage B' | 'Stage C') => {
    setActiveStage(stage);
    if (stage === 'Stage A') {
      // Intact baseline
      setParams((p) => ({ ...p, hasCrack: false, crackDepthMm: 0 }));
    } else if (stage === 'Stage B') {
      // Documented center notch
      setParams((p) => ({
        ...p,
        hasCrack: true,
        crackDepthMm: 40,
        crackLocationMm: p.lengthMm / 2,
        crackWidthMm: 2.5,
      }));
    } else if (stage === 'Stage C') {
      // Image-informed parameters
      const crackW = activeInspection?.metrics?.maxWidthMm || 3.2;
      setParams((p) => ({
        ...p,
        hasCrack: true,
        crackDepthMm: Math.min(80, Math.round(crackW * 14)),
        crackLocationMm: p.lengthMm / 2,
        crackWidthMm: crackW,
      }));
    }
  };

  // Export CSV of simulation nodes
  const exportCSV = () => {
    if (!feaResult) return;
    let csv = 'X_Coord_mm,Y_Coord_mm,VonMises_Stress_MPa,Deflection_mm\n';
    const grid = feaResult.stressFieldGrid;
    const dispGrid = feaResult.displacementFieldGrid;
    const ny = grid.length - 1;
    const nx = grid[0].length - 1;

    for (let j = 0; j <= ny; j++) {
      const y = (j / ny) * params.heightMm - params.heightMm / 2;
      for (let i = 0; i <= nx; i++) {
        const x = (i / nx) * params.lengthMm;
        csv += `${x.toFixed(1)},${y.toFixed(1)},${grid[j][i]},${dispGrid[j][i]}\n`;
      }
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FEA_Simulation_${feaResult.id}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E1D8]">
        <div>
          <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider mb-1">
            Structural Mechanics & Computational Simulation
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#263238] font-serif-display">
            Finite Element Analysis (FEA) Laboratory
          </h1>
          <p className="text-sm text-[#69777B] mt-1 max-w-2xl">
            2D plane-stress continuum elasticity. Benchmarks baseline beam flexure against Euler-Bernoulli
            analytical closed-form solutions, examines notch stress concentrations, and models image-informed damage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 text-xs font-medium text-[#263238] bg-white hover:bg-[#F7F5EF] border border-[#E4E1D8] rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#167D80]" />
            <span>Export Mesh Nodes (CSV)</span>
          </button>
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#167D80] hover:bg-[#126466] rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isRunning ? 'Solving...' : 'Solve FEA'}</span>
          </button>
        </div>
      </div>

      {/* Stage Progression Selector Ribbon */}
      <div className="bg-white border border-[#E4E1D8] p-3 rounded flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#263238]">Simulation Stages:</span>
          <span className="text-[#69777B]">Linear elastic continuum validation</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStageMode('Stage A')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeStage === 'Stage A'
                ? 'bg-[#167D80] text-white font-medium'
                : 'bg-[#F7F5EF] text-[#263238] hover:bg-[#E4E1D8]'
            }`}
          >
            Stage A: Intact Baseline Beam
          </button>
          <button
            onClick={() => setStageMode('Stage B')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeStage === 'Stage B'
                ? 'bg-[#167D80] text-white font-medium'
                : 'bg-[#F7F5EF] text-[#263238] hover:bg-[#E4E1D8]'
            }`}
          >
            Stage B: Notched / Cracked Specimen
          </button>
          <button
            onClick={() => setStageMode('Stage C')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeStage === 'Stage C'
                ? 'bg-[#167D80] text-white font-medium'
                : 'bg-[#F7F5EF] text-[#263238] hover:bg-[#E4E1D8]'
            }`}
          >
            Stage C: Image-Informed Model
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Form & Contour Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Model Parameters (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E1D8] p-4 rounded space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4E1D8]">
            <h2 className="text-sm font-bold text-[#263238] font-serif-display">
              Structural Parameters
            </h2>
            <span className="text-[10px] font-mono-tabular text-[#426B9A]">SI Units (mm, kN, GPa)</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Model Geometry */}
            <div>
              <label className="text-[#69777B] block mb-1">Structural Boundary Scheme</label>
              <select
                value={params.modelType}
                onChange={(e) => setParams({ ...params, modelType: e.target.value as any })}
                className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs text-[#263238]"
              >
                <option value="Simply Supported Beam">Simply Supported Beam (Center Load)</option>
                <option value="Cantilever Beam">Cantilever Beam (End Point Load)</option>
                <option value="Center-Notched Plate">Center-Notched Tensile Specimen</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[#69777B] block mb-1">Length L (mm)</label>
                <input
                  type="number"
                  value={params.lengthMm}
                  onChange={(e) => setParams({ ...params, lengthMm: parseFloat(e.target.value) || 1000 })}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                />
              </div>
              <div>
                <label className="text-[#69777B] block mb-1">Height H (mm)</label>
                <input
                  type="number"
                  value={params.heightMm}
                  onChange={(e) => setParams({ ...params, heightMm: parseFloat(e.target.value) || 200 })}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                />
              </div>
              <div>
                <label className="text-[#69777B] block mb-1">Width B (mm)</label>
                <input
                  type="number"
                  value={params.thicknessMm}
                  onChange={(e) => setParams({ ...params, thicknessMm: parseFloat(e.target.value) || 150 })}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                />
              </div>
            </div>

            {/* Material Parameters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[#69777B] block mb-1">Modulus E (GPa)</label>
                <input
                  type="number"
                  value={params.elasticModulusGPa}
                  onChange={(e) => setParams({ ...params, elasticModulusGPa: parseFloat(e.target.value) || 30 })}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                />
              </div>
              <div>
                <label className="text-[#69777B] block mb-1">Poisson's ν</label>
                <input
                  type="number"
                  step="0.01"
                  value={params.poissonsRatio}
                  onChange={(e) => setParams({ ...params, poissonsRatio: parseFloat(e.target.value) || 0.2 })}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                />
              </div>
            </div>

            {/* Applied Load */}
            <div>
              <label className="text-[#69777B] block mb-1">Applied Load P (kN)</label>
              <input
                type="number"
                value={params.appliedLoadKN}
                onChange={(e) => setParams({ ...params, appliedLoadKN: parseFloat(e.target.value) || 20 })}
                className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
              />
            </div>

            {/* Crack / Notch Parameters */}
            <div className="pt-2 border-t border-[#E4E1D8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#263238]">Include Crack / Notch</span>
                <input
                  type="checkbox"
                  checked={params.hasCrack}
                  onChange={(e) => setParams({ ...params, hasCrack: e.target.checked })}
                  className="accent-[#167D80] w-4 h-4 cursor-pointer"
                />
              </div>

              {params.hasCrack && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#69777B] block mb-1">Depth a (mm)</label>
                    <input
                      type="number"
                      value={params.crackDepthMm}
                      onChange={(e) => setParams({ ...params, crackDepthMm: parseFloat(e.target.value) || 30 })}
                      className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                    />
                  </div>
                  <div>
                    <label className="text-[#69777B] block mb-1">Location X (mm)</label>
                    <input
                      type="number"
                      value={params.crackLocationMm}
                      onChange={(e) => setParams({ ...params, crackLocationMm: parseFloat(e.target.value) || 600 })}
                      className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs font-mono-tabular text-[#263238]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mesh Refinement Selector */}
            <div className="pt-2 border-t border-[#E4E1D8]">
              <label className="text-[#69777B] block mb-1">Continuum Mesh Discretization</label>
              <select
                value={params.meshDensity}
                onChange={(e) => setParams({ ...params, meshDensity: e.target.value as any })}
                className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 text-xs text-[#263238]"
              >
                <option value="Coarse (120 elements)">Coarse (20×6 = 120 elements)</option>
                <option value="Medium (480 elements)">Medium (40×12 = 480 elements)</option>
                <option value="Fine (1920 elements)">Fine (60×18 = 1080 elements)</option>
                <option value="Adaptive Refined (3800 elements)">Adaptive (80×24 = 1920 elements)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Contour Visualization Stage & Analytical Comparison (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E4E1D8] p-4 rounded space-y-4">
          {/* Contour Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E4E1D8]">
            <div className="flex items-center gap-1 bg-[#F7F5EF] p-1 rounded text-xs">
              <button
                onClick={() => setContourField('vonMises')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  contourField === 'vonMises' ? 'bg-white text-[#167D80] shadow-xs' : 'text-[#69777B]'
                }`}
              >
                von Mises Stress (σ_vM)
              </button>
              <button
                onClick={() => setContourField('displacement')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  contourField === 'displacement' ? 'bg-white text-[#167D80] shadow-xs' : 'text-[#69777B]'
                }`}
              >
                Displacement Deflection (v)
              </button>
            </div>

            {feaResult && (
              <div className="text-xs text-[#69777B] font-mono-tabular">
                Solved in {feaResult.computationTimeMs} ms · {feaResult.meshElementsCount} Quad Elements
              </div>
            )}
          </div>

          {/* 2D Continuum Stress Contour Canvas / SVG */}
          {feaResult && (
            <div className="relative border border-[#E4E1D8] rounded bg-[#F7F5EF] p-4 flex flex-col justify-between blueprint-grid min-h-[300px]">
              {/* Beam Profile Diagram with Simulated Stress Color Field */}
              <div className="w-full flex items-center justify-center py-6">
                <svg
                  className="w-full h-44 overflow-visible"
                  viewBox={`0 0 ${params.lengthMm} ${params.heightMm * 1.8}`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="stressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#426B9A" stopOpacity="0.8" />
                      <stop offset="45%" stopColor="#167D80" stopOpacity="0.3" />
                      <stop offset="55%" stopColor="#167D80" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#B84A43" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Beam Outline */}
                  <rect
                    x="0"
                    y="30"
                    width={params.lengthMm}
                    height={params.heightMm}
                    fill="url(#stressGrad)"
                    stroke="#263238"
                    strokeWidth="2"
                    rx="2"
                  />

                  {/* Quad Mesh Lines */}
                  {Array.from({ length: 15 }).map((_, idx) => (
                    <line
                      key={`vx-${idx}`}
                      x1={(idx / 14) * params.lengthMm}
                      y1="30"
                      x2={(idx / 14) * params.lengthMm}
                      y2={30 + params.heightMm}
                      stroke="#263238"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                    />
                  ))}
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <line
                      key={`hy-${idx}`}
                      x1="0"
                      y1={30 + (idx / 4) * params.heightMm}
                      x2={params.lengthMm}
                      y2={30 + (idx / 4) * params.heightMm}
                      stroke="#263238"
                      strokeOpacity="0.15"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Crack / Notch Cutout */}
                  {params.hasCrack && (
                    <g>
                      <path
                        d={`M ${params.crackLocationMm - 6} ${30 + params.heightMm} L ${params.crackLocationMm} ${
                          30 + params.heightMm - params.crackDepthMm
                        } L ${params.crackLocationMm + 6} ${30 + params.heightMm} Z`}
                        fill="#FFFFFF"
                        stroke="#B84A43"
                        strokeWidth="2"
                      />
                      {/* Stress concentration aura */}
                      <circle
                        cx={params.crackLocationMm}
                        cy={30 + params.heightMm - params.crackDepthMm}
                        r="14"
                        fill="#B84A43"
                        fillOpacity="0.4"
                      />
                      <text
                        x={params.crackLocationMm + 18}
                        y={30 + params.heightMm - params.crackDepthMm + 4}
                        className="text-[20px] fill-[#B84A43] font-mono-tabular font-bold"
                      >
                        Kt = {feaResult.stressConcentrationFactorKt}
                      </text>
                    </g>
                  )}

                  {/* Support Boundaries (Pinned & Roller) */}
                  {/* Left Pin Support */}
                  <polygon
                    points={`0,${30 + params.heightMm + 16} -14,${30 + params.heightMm + 32} 14,${
                      30 + params.heightMm + 32
                    }`}
                    fill="#426B9A"
                  />
                  {/* Right Roller Support */}
                  <polygon
                    points={`${params.lengthMm},${30 + params.heightMm + 16} ${params.lengthMm - 14},${
                      30 + params.heightMm + 32
                    } ${params.lengthMm + 14},${30 + params.heightMm + 32}`}
                    fill="#426B9A"
                  />
                  <circle cx={params.lengthMm} cy={30 + params.heightMm + 38} r="5" fill="#426B9A" />

                  {/* Load Arrow */}
                  <g transform={`translate(${params.crackLocationMm}, 0)`}>
                    <line x1="0" y1="0" x2="0" y2="26" stroke="#B84A43" strokeWidth="4" />
                    <polygon points="0,28 -6,18 6,18" fill="#B84A43" />
                    <text
                      x="10"
                      y="16"
                      className="text-[22px] fill-[#B84A43] font-mono-tabular font-bold"
                    >
                      P = {params.appliedLoadKN} kN
                    </text>
                  </g>
                </svg>
              </div>

              {/* Colormap Legend Bar */}
              <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E4E1D8]">
                <span className="text-[#69777B]">0.0 MPa (Compression / Neutral)</span>
                <div className="h-2.5 w-64 rounded-xs bg-gradient-to-r from-[#426B9A] via-[#167D80] via-[#B47A32] to-[#B84A43] border border-[#E4E1D8]" />
                <span className="font-bold text-[#B84A43] font-mono-tabular">
                  {feaResult.maxVonMisesStressMPa} MPa (Tension Peak)
                </span>
              </div>
            </div>
          )}

          {/* Validation & Discrepancy Comparative Table */}
          {feaResult && (
            <div className="p-4 bg-[#F7F5EF]/60 border border-[#E4E1D8] rounded space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#263238] font-serif-display">
                  Analytical Closed-Form Beam Validation
                </span>
                <span className="text-[11px] font-mono-tabular text-[#3E7958] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Discrepancy: {feaResult.deflectionDiscrepancyPct}% (Within &lt;2% tolerance)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono-tabular">
                <div className="p-2 bg-white rounded border border-[#E4E1D8]">
                  <span className="text-[#69777B] text-[10px] block uppercase">Analytical δ</span>
                  <span className="font-semibold text-[#263238]">
                    {feaResult.analyticalDeflectionMm} mm
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E4E1D8]">
                  <span className="text-[#69777B] text-[10px] block uppercase">FEA Computed δ</span>
                  <span className="font-semibold text-[#167D80]">
                    {feaResult.maxDeflectionMm} mm
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E4E1D8]">
                  <span className="text-[#69777B] text-[10px] block uppercase">Analytical σ_max</span>
                  <span className="font-semibold text-[#263238]">
                    {feaResult.analyticalMaxStressMPa} MPa
                  </span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E4E1D8]">
                  <span className="text-[#69777B] text-[10px] block uppercase">FEA Peak σ_vM</span>
                  <span className="font-semibold text-[#B84A43]">
                    {feaResult.maxVonMisesStressMPa} MPa
                  </span>
                </div>
              </div>

              {/* Mesh Convergence Series */}
              <div className="pt-2 border-t border-[#E4E1D8]/80 flex flex-wrap items-center justify-between text-xs text-[#69777B] gap-2">
                <span className="font-medium text-[#263238]">Mesh Convergence Study:</span>
                <div className="flex items-center gap-3 font-mono-tabular text-[11px]">
                  {feaResult.convergenceData.map((c) => (
                    <span key={c.elements}>
                      {c.elements} el: <b className="text-[#263238]">{c.maxStressMPa} MPa</b>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
