import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavSection } from './components/Sidebar';
import { Overview } from './components/Overview';
import { CrackDetection } from './components/CrackDetection';
import { InspectionTimeline } from './components/InspectionTimeline';
import { StructuralAnalysis } from './components/StructuralAnalysis';
import { FEALaboratory } from './components/FEALaboratory';
import { ModelEvaluation } from './components/ModelEvaluation';
import { ResearchReports } from './components/ResearchReports';
import { DatasetSettings } from './components/DatasetSettings';

import { Structure, InspectionRecord, ModelBenchmark } from './types';
import { INITIAL_STRUCTURES, INITIAL_INSPECTIONS, BENCHMARK_EVALUATIONS } from './data/mockData';

export default function App() {
  const [currentSection, setCurrentSection] = useState<NavSection>('Overview');
  const [structures, setStructures] = useState<Structure[]>(() => {
    const saved = localStorage.getItem('cracksense_structures');
    return saved ? JSON.parse(saved) : INITIAL_STRUCTURES;
  });
  const [selectedStructureId, setSelectedStructureId] = useState<string>(
    structures[0]?.id || 'STR-001'
  );
  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('cracksense_inspections');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });
  const [activeInspection, setActiveInspection] = useState<InspectionRecord | null>(
    inspections[0] || null
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cracksense_structures', JSON.stringify(structures));
  }, [structures]);

  useEffect(() => {
    localStorage.setItem('cracksense_inspections', JSON.stringify(inspections));
  }, [inspections]);

  const activeStructure =
    structures.find((s) => s.id === selectedStructureId) || structures[0];

  // Save new inspection
  const handleSaveInspection = (newRecord: Partial<InspectionRecord>) => {
    const fullRecord: InspectionRecord = {
      id: `INSP-${Date.now().toString().slice(-6)}`,
      structureId: newRecord.structureId || activeStructure.id,
      structureName: newRecord.structureName || activeStructure.name,
      regionId: newRecord.regionId || 'REG-NEW',
      regionDescription: newRecord.regionDescription || 'Structural Inspection Region',
      timestamp: newRecord.timestamp || new Date().toISOString(),
      inspector: newRecord.inspector || 'Site Engineer',
      imageUrl: newRecord.imageUrl || '/src/assets/images/concrete_beam_shear_1792429531511.jpg',
      modelVersion: newRecord.modelVersion || 'CrackSense-AttentionUNet-v2.1',
      confidenceScore: newRecord.confidenceScore || 0.94,
      metrics: newRecord.metrics!,
      calibration: newRecord.calibration || {
        isCalibrated: false,
        scaleMmPerPixel: 1.0,
        calibrationMethod: 'Uncalibrated (Pixel Scale)',
      },
      severityLevel: newRecord.severityLevel || 'Moderate (0.2-0.3mm)',
      structuralContext: newRecord.structuralContext || 'Shear span',
      inspectorNotes: newRecord.inspectorNotes || '',
      isDemo: false,
    };

    setInspections((prev) => [fullRecord, ...prev]);
    setActiveInspection(fullRecord);

    // Update active crack count on structure
    setStructures((prev) =>
      prev.map((s) =>
        s.id === fullRecord.structureId
          ? {
              ...s,
              totalInspections: s.totalInspections + 1,
              activeCracksCount: s.activeCracksCount + 1,
              riskStatus: fullRecord.severityLevel.includes('Critical')
                ? 'Review Required'
                : 'Monitor',
            }
          : s
      )
    );
  };

  // Clear demo data
  const handleClearDemoData = () => {
    setStructures((prev) => prev.filter((s) => !s.isDemo));
    setInspections((prev) => prev.filter((i) => !i.isDemo));
  };

  // Restore demo data
  const handleResetDemoData = () => {
    setStructures(INITIAL_STRUCTURES);
    setInspections(INITIAL_INSPECTIONS);
    setSelectedStructureId(INITIAL_STRUCTURES[0].id);
    setActiveInspection(INITIAL_INSPECTIONS[0]);
  };

  const handleSelectInspection = (insp: InspectionRecord) => {
    setActiveInspection(insp);
    setSelectedStructureId(insp.structureId);
    setCurrentSection('Crack Detection');
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#263238] flex flex-col font-sans">
      <Header
        currentSection={currentSection}
        structures={structures}
        selectedStructureId={selectedStructureId}
        onSelectStructure={setSelectedStructureId}
        onNewInspection={() => setCurrentSection('Crack Detection')}
        onRunFEA={() => setCurrentSection('FEA Laboratory')}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
          structures={structures}
          activeStructureId={selectedStructureId}
          onSelectStructure={setSelectedStructureId}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentSection === 'Overview' && (
              <Overview
                structures={structures}
                inspections={inspections}
                benchmarks={BENCHMARK_EVALUATIONS}
                onNavigate={setCurrentSection}
                onSelectInspection={handleSelectInspection}
                onClearDemoData={handleClearDemoData}
                onResetDemoData={handleResetDemoData}
              />
            )}

            {currentSection === 'Crack Detection' && (
              <CrackDetection
                structures={structures}
                activeStructureId={selectedStructureId}
                onSaveInspection={handleSaveInspection}
                initialInspection={activeInspection}
              />
            )}

            {currentSection === 'Inspection Timeline' && (
              <InspectionTimeline
                inspections={inspections}
                onSelectInspection={handleSelectInspection}
              />
            )}

            {currentSection === 'Structural Analysis' && (
              <StructuralAnalysis
                structures={structures}
                activeStructure={activeStructure}
                inspections={inspections}
                onNavigateToFEA={() => setCurrentSection('FEA Laboratory')}
              />
            )}

            {currentSection === 'FEA Laboratory' && (
              <FEALaboratory activeInspection={activeInspection} />
            )}

            {currentSection === 'Model Evaluation' && (
              <ModelEvaluation benchmarks={BENCHMARK_EVALUATIONS} />
            )}

            {currentSection === 'Reports' && (
              <ResearchReports
                structures={structures}
                inspections={inspections}
                activeStructure={activeStructure}
              />
            )}

            {currentSection === 'Dataset & Settings' && (
              <DatasetSettings
                onClearDemoData={handleClearDemoData}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
