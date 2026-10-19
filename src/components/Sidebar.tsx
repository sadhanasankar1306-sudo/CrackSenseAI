import React from 'react';
import {
  LayoutDashboard,
  Scan,
  GitCommitVertical,
  Activity,
  Layers,
  BarChart3,
  FileText,
  Database,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Structure } from '../types';

export type NavSection =
  | 'Overview'
  | 'Crack Detection'
  | 'Inspection Timeline'
  | 'Structural Analysis'
  | 'FEA Laboratory'
  | 'Model Evaluation'
  | 'Reports'
  | 'Dataset & Settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  structures: Structure[];
  activeStructureId: string;
  onSelectStructure: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  structures,
  activeStructureId,
  onSelectStructure,
}) => {
  const navItems: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'Crack Detection', label: 'Crack Detection', icon: Scan },
    { id: 'Inspection Timeline', label: 'Inspection Timeline', icon: GitCommitVertical },
    { id: 'Structural Analysis', label: 'Structural Analysis', icon: Activity },
    { id: 'FEA Laboratory', label: 'FEA Laboratory', icon: Layers },
    { id: 'Model Evaluation', label: 'Model Evaluation', icon: BarChart3 },
    { id: 'Reports', label: 'Reports', icon: FileText },
    { id: 'Dataset & Settings', label: 'Dataset & Settings', icon: Database },
  ];

  const currentStructure = structures.find((s) => s.id === activeStructureId) || structures[0];

  return (
    <aside className="w-64 bg-white border-r border-[#E4E1D8] flex flex-col shrink-0 min-h-screen">
      {/* Structure Card */}
      <div className="p-4 border-b border-[#E4E1D8] bg-[#F7F5EF]/60">
        <div className="flex items-center gap-2 mb-1.5 text-xs text-[#69777B]">
          <Building2 className="w-3.5 h-3.5 text-[#167D80]" />
          <span className="font-medium">Active Asset</span>
        </div>
        <select
          value={activeStructureId}
          onChange={(e) => onSelectStructure(e.target.value)}
          className="w-full bg-white border border-[#E4E1D8] rounded p-2 text-xs font-semibold text-[#263238] focus:outline-none focus:border-[#167D80] cursor-pointer"
        >
          {structures.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {currentStructure && (
          <div className="mt-2.5 pt-2 border-t border-[#E4E1D8]/60 flex items-center justify-between text-[11px] text-[#69777B]">
            <span>{currentStructure.concreteGrade}</span>
            <span
              className={
                currentStructure.riskStatus === 'Review Required'
                  ? 'text-[#B84A43] font-medium'
                  : currentStructure.riskStatus === 'Monitor'
                  ? 'text-[#B47A32] font-medium'
                  : 'text-[#3E7958] font-medium'
              }
            >
              {currentStructure.riskStatus}
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-[#69777B] uppercase tracking-wider">
          Research Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#167D80] text-white shadow-xs'
                  : 'text-[#263238] hover:bg-[#F7F5EF] hover:text-[#167D80]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#69777B]'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Engineering Compliance Footer */}
      <div className="p-4 border-t border-[#E4E1D8] bg-[#F7F5EF]/40 text-[11px] text-[#69777B] space-y-1">
        <div className="font-semibold text-[#263238] flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#B47A32]" />
          <span>Research Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          CV observations and FEA outputs do not replace physical testing or in-situ structural inspection.
        </p>
      </div>
    </aside>
  );
};
