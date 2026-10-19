import React from 'react';
import { ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { Structure } from '../types';

interface HeaderProps {
  currentSection: string;
  structures: Structure[];
  selectedStructureId: string;
  onSelectStructure: (id: string) => void;
  onNewInspection: () => void;
  onRunFEA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  structures,
  selectedStructureId,
  onSelectStructure,
  onNewInspection,
  onRunFEA,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-[#E4E1D8] sticky top-0 z-20">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="#overview" className="text-xl font-bold tracking-tight text-[#263238] font-serif-display whitespace-nowrap">
          CrackSense AI
        </a>
        <span className="text-xs text-[#69777B] hidden sm:inline" aria-hidden="true">/</span>
        <span className="text-xs text-[#69777B] tracking-wide font-medium hidden sm:inline">
          Structural Health & FEA Lab
        </span>
      </div>

      {/* Zone 2: Structure selector and active section */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <span className="text-[#69777B]">Active Structure:</span>
        <select
          value={selectedStructureId}
          onChange={(e) => onSelectStructure(e.target.value)}
          className="bg-[#F7F5EF] border border-[#E4E1D8] rounded px-3 py-1.5 text-xs font-medium text-[#263238] focus:outline-none focus:border-[#167D80] cursor-pointer"
        >
          {structures.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
        <span className="text-[#69777B]" aria-hidden="true">·</span>
        <span className="text-[#167D80] font-medium">{currentSection}</span>
      </div>

      {/* Zone 3: Primary actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onRunFEA}
          className="px-3 py-1.5 text-xs font-medium text-[#426B9A] bg-[#426B9A]/10 hover:bg-[#426B9A]/20 border border-[#426B9A]/20 rounded transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick FEA</span>
        </button>
        <button
          onClick={onNewInspection}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#167D80] hover:bg-[#126466] rounded transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Inspection</span>
        </button>
      </div>
    </header>
  );
};
