import React, { useState } from 'react';
import {
  Database,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  FileCheck,
  Cpu,
  Layers,
  Trash2,
} from 'lucide-react';

interface DatasetSettingsProps {
  onClearDemoData: () => void;
  onResetDemoData: () => void;
}

export const DatasetSettings: React.FC<DatasetSettingsProps> = ({
  onClearDemoData,
  onResetDemoData,
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('U-Net-ResNet34-v2.1');
  const [augFlips, setAugFlips] = useState<boolean>(true);
  const [augAffine, setAugAffine] = useState<boolean>(true);
  const [augIllumination, setAugIllumination] = useState<boolean>(true);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [learningRate, setLearningRate] = useState<string>('1e-4');
  const [syntheticStatus, setSyntheticStatus] = useState<string>('');

  const publicDatasets = [
    {
      name: 'Crack500',
      type: 'Pixel-Level Segmentation Masks',
      imagesCount: 500,
      resolution: '2000×1500 (Tiled 512×512)',
      citation: 'Yang et al., 2016',
      license: 'Research Use Only',
      annotationQuality: 'Accurate Polygonal & Fissure Masks',
      notes: 'Standard benchmark for pavement and bridge deck concrete cracks.',
    },
    {
      name: 'DeepCrack',
      type: 'Pixel-Level Binary Segmentation Masks',
      imagesCount: 537,
      resolution: '544×384 Multi-Scale',
      citation: 'Liu et al., 2019',
      license: 'Creative Commons CC-BY 4.0',
      annotationQuality: 'High-Density Manual Ground Truth',
      notes: 'Features challenging multi-scale concrete fractures with varying surface textures.',
    },
    {
      name: 'SDNET2018',
      type: 'Image-Level Categorical Labels (Crack / No-Crack)',
      imagesCount: 56000,
      resolution: '256×256 Sub-Images',
      citation: 'Dorafshan et al., 2018',
      license: 'Utah State University Open Data',
      annotationQuality: 'Binary Classification (Not Pixel Masks)',
      notes: 'Crucial research note: Standard SDNET2018 provides image-level labels. For pixel segmentation, only subset annotations or weak supervision apply.',
    },
  ];

  const handleGenerateSynthetic = () => {
    setSyntheticStatus('Generating 256x256 synthetic ground-truth test specimen...');
    setTimeout(() => {
      setSyntheticStatus('Synthetic shear fracture specimen synthesized. Ground truth length: 216 px. Unit tests passed.');
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E1D8]">
        <div>
          <div className="text-xs font-semibold text-[#167D80] uppercase tracking-wider mb-1">
            Data Governance & Training Pipeline
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#263238] font-serif-display">
            Benchmark Datasets, Training Pipeline & Settings
          </h1>
          <p className="text-sm text-[#69777B] mt-1 max-w-2xl">
            Verified public concrete crack datasets, model checkpoint management, data augmentation
            parameters, and reproducibility configurations.
          </p>
        </div>
      </div>

      {/* Public Datasets Guide */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#263238] font-serif-display">
          Public Concrete Fracture Datasets & Licensing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {publicDatasets.map((ds) => (
            <div key={ds.name} className="bg-white border border-[#E4E1D8] p-4 rounded space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E1D8]">
                  <span className="font-bold text-sm text-[#263238] font-serif-display">{ds.name}</span>
                  <span className="text-[10px] font-mono-tabular text-[#167D80]">{ds.license}</span>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div>
                    <span className="text-[#69777B] block text-[10px] uppercase">Annotation Standard</span>
                    <span className="font-semibold text-[#263238]">{ds.type}</span>
                  </div>

                  <div>
                    <span className="text-[#69777B] block text-[10px] uppercase">Image Count & Geometry</span>
                    <span className="font-mono-tabular text-[#263238]">{ds.imagesCount} images · {ds.resolution}</span>
                  </div>

                  <div>
                    <span className="text-[#69777B] block text-[10px] uppercase">Formal Citation</span>
                    <span className="text-[#426B9A] font-mono-tabular">{ds.citation}</span>
                  </div>

                  <p className="text-[#69777B] text-[11px] leading-relaxed pt-1 border-t border-[#E4E1D8]/60">
                    {ds.notes}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Checkpoint Version Switcher & Training Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Checkpoints */}
        <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
          <h2 className="text-base font-bold text-[#263238] font-serif-display">
            Active Checkpoint Weights
          </h2>

          <div className="space-y-2 text-xs">
            {[
              { id: 'U-Net-ResNet34-v2.1', label: 'CrackSense Attention-UNet (v2.1)', size: '104 MB', trainedOn: 'Crack500 + DeepCrack', iou: '82.8%' },
              { id: 'ResNet34-UNet-v2.0', label: 'ResNet-34 Standard U-Net (v2.0)', size: '98 MB', trainedOn: 'Crack500', iou: '77.6%' },
              { id: 'Vanilla-UNet-v1.0', label: 'Vanilla 4-Stage U-Net (v1.0 Baseline)', size: '124 MB', trainedOn: 'Crack500', iou: '68.4%' },
            ].map((chk) => (
              <label
                key={chk.id}
                className={`p-3 border rounded flex items-center justify-between cursor-pointer transition-colors ${
                  selectedCheckpoint === chk.id
                    ? 'border-[#167D80] bg-[#167D80]/5'
                    : 'border-[#E4E1D8] bg-[#F7F5EF]/30 hover:bg-[#F7F5EF]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="checkpoint"
                    checked={selectedCheckpoint === chk.id}
                    onChange={() => setSelectedCheckpoint(chk.id)}
                    className="accent-[#167D80]"
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#263238]">{chk.label}</div>
                    <div className="text-[11px] text-[#69777B]">
                      Trained on {chk.trainedOn} · {chk.size}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono-tabular text-xs">
                  <span className="text-[#69777B] text-[10px] block">Test IoU</span>
                  <span className="font-bold text-[#167D80]">{chk.iou}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="text-[11px] text-[#69777B] p-2.5 bg-[#F7F5EF] rounded border border-[#E4E1D8]">
            Weights format: PyTorch <code>state_dict</code> (.pt/.pth). Supports high-resolution sliding-window tiling (512×512) for sub-millimeter crack retention.
          </div>
        </div>

        {/* Training & Augmentation Parameters */}
        <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
          <h2 className="text-base font-bold text-[#263238] font-serif-display">
            Data Augmentation & Training Hyperparameters
          </h2>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#69777B] block mb-1">Batch Size</label>
                <input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 16)}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 font-mono-tabular text-[#263238]"
                />
              </div>
              <div>
                <label className="text-[#69777B] block mb-1">Learning Rate</label>
                <input
                  type="text"
                  value={learningRate}
                  onChange={(e) => setLearningRate(e.target.value)}
                  className="w-full bg-[#F7F5EF] border border-[#E4E1D8] rounded p-1.5 font-mono-tabular text-[#263238]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-[#E4E1D8] space-y-2">
              <span className="font-semibold text-[#263238] block">Augmentation Pipeline:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={augFlips}
                  onChange={(e) => setAugFlips(e.target.checked)}
                  className="accent-[#167D80]"
                />
                <span>Random Horizontal & Vertical Flips (p=0.5)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={augAffine}
                  onChange={(e) => setAugAffine(e.target.checked)}
                  className="accent-[#167D80]"
                />
                <span>Random Affine Rotation & Scaling (±15°, 0.9x-1.1x)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={augIllumination}
                  onChange={(e) => setAugIllumination(e.target.checked)}
                  className="accent-[#167D80]"
                />
                <span>Illumination & Contrast Color Jitter (Concrete weathering simulation)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Research Demo Dataset Management & Deterministic Test Specimen */}
      <div className="bg-white border border-[#E4E1D8] p-5 rounded space-y-4">
        <h2 className="text-base font-bold text-[#263238] font-serif-display">
          Specimen Data Governance & Synthetic Test Tools
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs pt-2">
          <div className="space-y-1">
            <div className="font-semibold text-[#263238]">Demo Records Management</div>
            <div className="text-[#69777B]">
              Purge sample specimens to work in a completely blank production environment, or reload initial research data.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearDemoData}
              className="px-3.5 py-1.5 bg-[#B84A43]/10 hover:bg-[#B84A43]/20 border border-[#B84A43]/30 text-[#B84A43] rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Demo Data</span>
            </button>
            <button
              onClick={onResetDemoData}
              className="px-3.5 py-1.5 bg-[#167D80]/10 hover:bg-[#167D80]/20 border border-[#167D80]/30 text-[#167D80] rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Research Demo Dataset</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E4E1D8] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-semibold text-[#263238]">Deterministic Synthetic Specimen Generator</div>
            <div className="text-[#69777B]">
              Generates mathematical ground-truth crack models with exact pixel geometry for unit test verification.
            </div>
          </div>
          <button
            onClick={handleGenerateSynthetic}
            className="px-3.5 py-1.5 bg-[#426B9A] hover:bg-[#34567e] text-white rounded font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Ground-Truth Specimen</span>
          </button>
        </div>

        {syntheticStatus && (
          <div className="p-3 bg-[#3E7958]/10 border border-[#3E7958]/30 text-[#3E7958] rounded text-xs font-mono-tabular">
            {syntheticStatus}
          </div>
        )}
      </div>
    </div>
  );
};
