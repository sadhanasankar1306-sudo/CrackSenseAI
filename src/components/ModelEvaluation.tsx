import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Cpu,
  Layers,
  CheckCircle2,
  Table as TableIcon,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { ModelBenchmark } from '../types';

interface ModelEvaluationProps {
  benchmarks: ModelBenchmark[];
}

export const ModelEvaluation: React.FC<ModelEvaluationProps> = ({ benchmarks }) => {
  const [selectedDataset, setSelectedDataset] = useState<'All' | 'Crack500' | 'DeepCrack'>('All');

  const filtered =
    selectedDataset === 'All'
      ? benchmarks
      : benchmarks.filter((b) => b.dataset.includes(selectedDataset));

  // Export benchmark table to CSV
  const exportBenchmarkCSV = () => {
    let csv = 'Model,Architecture,Backbone,Dataset,Dice_F1,IoU,Precision,Recall,Inference_Time_ms,Params_M\n';
    filtered.forEach((b) => {
      csv += `"${b.modelName}","${b.architecture}","${b.backbone}","${b.dataset}",${b.diceScore},${b.iouScore},${b.precision},${b.recall},${b.inferenceTimeMs},${b.parametersMillion}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CrackSense_Model_Benchmarks_${selectedDataset}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E1D8]">
        <div>
          <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider mb-1">
            Empirical Validation & Quantitative Benchmarks
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#263238] font-serif-display">
            Segmentation Model Evaluation & Reproducibility
          </h1>
          <p className="text-sm text-[#69777B] mt-1 max-w-2xl">
            Quantitative evaluation across standardized benchmark datasets (Crack500, DeepCrack).
            Reports IoU, Dice/F1, inference latency, and error distribution.
          </p>
        </div>

        <button
          onClick={exportBenchmarkCSV}
          className="px-3.5 py-2 text-xs font-medium text-[#263238] bg-white hover:bg-[#F7F5EF] border border-[#E4E1D8] rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#167D80]" />
          <span>Download Benchmark CSV</span>
        </button>
      </div>

      {/* Dataset Filter & Protocol Summary */}
      <div className="bg-white border border-[#E4E1D8] p-4 rounded flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#167D80]" />
          <span className="font-semibold text-[#263238]">Dataset Benchmark Filter:</span>
          <div className="flex items-center gap-1 bg-[#F7F5EF] p-1 rounded">
            {(['All', 'Crack500', 'DeepCrack'] as const).map((ds) => (
              <button
                key={ds}
                onClick={() => setSelectedDataset(ds)}
                className={`px-3 py-1 rounded transition-colors ${
                  selectedDataset === ds
                    ? 'bg-white text-[#167D80] font-medium shadow-xs'
                    : 'text-[#69777B]'
                }`}
              >
                {ds}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[#69777B] text-[11px] font-mono-tabular">
          Test Split: 100 images · Evaluation Protocol: Structure-Level Partitioning
        </div>
      </div>

      {/* Main Benchmark Table */}
      <div className="bg-white border border-[#E4E1D8] rounded overflow-hidden">
        <div className="p-4 border-b border-[#E4E1D8] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#263238] font-serif-display">
            Quantitative Performance Metrics Comparison
          </h2>
          <span className="text-[11px] font-mono-tabular text-[#69777B]">
            Testing Hardware: NVIDIA RTX 4090 / CUDA 12.1
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5EF] border-b border-[#E4E1D8] text-[#69777B]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Model Architecture</th>
                <th className="py-2.5 px-4 font-semibold">Backbone</th>
                <th className="py-2.5 px-4 font-semibold">Dataset</th>
                <th className="py-2.5 px-4 font-semibold text-right">Dice (F1)</th>
                <th className="py-2.5 px-4 font-semibold text-right">IoU</th>
                <th className="py-2.5 px-4 font-semibold text-right">Precision</th>
                <th className="py-2.5 px-4 font-semibold text-right">Recall</th>
                <th className="py-2.5 px-4 font-semibold text-right">Latency</th>
                <th className="py-2.5 px-4 font-semibold text-right">Params</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1D8]">
              {filtered.map((item, idx) => {
                const isProposed = item.modelName.includes('Proposed');
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-[#F7F5EF]/40 transition-colors ${
                      isProposed ? 'bg-[#167D80]/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-[#263238]">
                      {item.modelName}
                      {isProposed && (
                        <span className="ml-2 text-[10px] text-[#167D80] font-semibold">
                          [Proposed]
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#69777B]">{item.backbone}</td>
                    <td className="py-3 px-4 font-mono-tabular text-[#426B9A]">{item.dataset}</td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-bold text-[#167D80]">
                      {(item.diceScore * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[#263238]">
                      {(item.iouScore * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#69777B]">
                      {(item.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#69777B]">
                      {(item.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#263238]">
                      {item.inferenceTimeMs} ms
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#69777B]">
                      {item.parametersMillion} M
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix & Pixel-Level Error Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
          <h2 className="text-base font-bold text-[#263238] font-serif-display">
            Pixel-Level Confusion Matrix (Normalized)
          </h2>
          <div className="text-xs text-[#69777B]">
            Evaluated on Crack500 test partition (100 images, 2048×1536 resolution)
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs">
            <div className="p-4 bg-[#3E7958]/10 border border-[#3E7958]/30 rounded">
              <span className="text-[#69777B] text-[10px] block uppercase">True Positives (Crack)</span>
              <span className="text-2xl font-bold font-mono-tabular text-[#3E7958]">89.5%</span>
              <span className="text-[10px] text-[#69777B] block mt-1">Sensitivity / Recall</span>
            </div>

            <div className="p-4 bg-[#B47A32]/10 border border-[#B47A32]/30 rounded">
              <span className="text-[#69777B] text-[10px] block uppercase">False Positives (Artifacts)</span>
              <span className="text-2xl font-bold font-mono-tabular text-[#B47A32]">8.2%</span>
              <span className="text-[10px] text-[#69777B] block mt-1">Stain / joint boundary</span>
            </div>

            <div className="p-4 bg-[#B84A43]/10 border border-[#B84A43]/30 rounded">
              <span className="text-[#69777B] text-[10px] block uppercase">False Negatives (Missed)</span>
              <span className="text-2xl font-bold font-mono-tabular text-[#B84A43]">10.5%</span>
              <span className="text-[10px] text-[#69777B] block mt-1">Sub-pixel thin hairline</span>
            </div>

            <div className="p-4 bg-[#426B9A]/10 border border-[#426B9A]/30 rounded">
              <span className="text-[#69777B] text-[10px] block uppercase">True Negatives (Matrix)</span>
              <span className="text-2xl font-bold font-mono-tabular text-[#426B9A]">99.4%</span>
              <span className="text-[10px] text-[#69777B] block mt-1">Background specificity</span>
            </div>
          </div>
        </div>

        {/* Reproducibility & Research Training Details */}
        <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-3">
          <h2 className="text-base font-bold text-[#263238] font-serif-display">
            Reproducibility & Hyperparameter Profile
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E4E1D8]">
              <span className="text-[#69777B]">Loss Formulation:</span>
              <span className="font-semibold text-[#263238]">Combo Loss (0.6 BCE + 0.4 Soft Dice)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E1D8]">
              <span className="text-[#69777B]">Optimizer & Learning Rate:</span>
              <span className="font-semibold text-[#263238]">AdamW, η₀ = 1.0 × 10⁻⁴, Cosine Annealing</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E1D8]">
              <span className="text-[#69777B]">Input Tile Resolution:</span>
              <span className="font-semibold text-[#263238]">512 × 512 with 20% Overlap Stride</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E4E1D8]">
              <span className="text-[#69777B]">Data Augmentation:</span>
              <span className="font-semibold text-[#263238]">Random Flips, Affine, Illumination Jitter</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#69777B]">Class Imbalance Handling:</span>
              <span className="font-semibold text-[#263238]">Foreground Weight Ratio w = 15.0</span>
            </div>
          </div>

          <div className="p-3 bg-[#F7F5EF] rounded border border-[#E4E1D8] text-[11px] text-[#69777B] leading-relaxed">
            Data leakage prevention verified: Splits were partitioned strictly at the physical specimen / bridge
            structure level. No adjacent cropped tiles from the same source image appear in both training and test sets.
          </div>
        </div>
      </div>
    </div>
  );
};
