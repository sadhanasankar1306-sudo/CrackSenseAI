import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { solveFEA } from './src/utils/feaEngine.ts';
import { extractCrackMetrics, generateSyntheticCrackSpecimen } from './src/utils/crackAnalysis.ts';
import { INITIAL_STRUCTURES, INITIAL_INSPECTIONS, BENCHMARK_EVALUATIONS } from './src/data/mockData.ts';
import { Structure, InspectionRecord, FEARunParameters } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // In-memory persistent state (can also sync with local storage or sqlite)
  let structures: Structure[] = [...INITIAL_STRUCTURES];
  let inspections: InspectionRecord[] = [...INITIAL_INSPECTIONS];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      environment: isProd ? 'production' : 'development',
      service: 'CrackSense AI Full-Stack Engine',
      version: '2.1.0-research',
      totalStructures: structures.length,
      totalInspections: inspections.length,
    });
  });

  // Structures CRUD
  app.get('/api/structures', (req, res) => {
    res.json(structures);
  });

  app.post('/api/structures', (req, res) => {
    const newStructure: Structure = {
      id: `STR-${String(structures.length + 1).padStart(3, '0')}`,
      name: req.body.name || 'Untitled Structure',
      code: req.body.code || `STR-${Date.now().toString().slice(-4)}`,
      type: req.body.type || 'RC Beam',
      location: req.body.location || 'Site Inspection Zone',
      constructionYear: Number(req.body.constructionYear) || new Date().getFullYear(),
      concreteGrade: req.body.concreteGrade || "C30/37 (f'c = 30 MPa)",
      totalInspections: 0,
      activeCracksCount: 0,
      riskStatus: 'Stable',
      isDemo: false,
    };
    structures.push(newStructure);
    res.status(201).json(newStructure);
  });

  // Inspections CRUD
  app.get('/api/inspections', (req, res) => {
    const { structureId } = req.query;
    if (structureId && typeof structureId === 'string') {
      res.json(inspections.filter((i) => i.structureId === structureId));
    } else {
      res.json(inspections);
    }
  });

  app.post('/api/inspections', (req, res) => {
    const newRecord: InspectionRecord = {
      id: `INSP-${Date.now().toString().slice(-6)}`,
      structureId: req.body.structureId || structures[0].id,
      structureName: req.body.structureName || structures[0].name,
      regionId: req.body.regionId || 'REG-A1',
      regionDescription: req.body.regionDescription || 'Structural Inspection Region',
      timestamp: req.body.timestamp || new Date().toISOString(),
      inspector: req.body.inspector || 'Site Engineer',
      imageUrl: req.body.imageUrl || '/src/assets/images/concrete_beam_shear_1792429531511.jpg',
      maskUrl: req.body.maskUrl,
      modelVersion: req.body.modelVersion || 'U-Net-ResNet34-v2.1',
      confidenceScore: req.body.confidenceScore || 0.94,
      metrics: req.body.metrics,
      calibration: req.body.calibration || {
        isCalibrated: false,
        scaleMmPerPixel: 1.0,
        calibrationMethod: 'Uncalibrated (Pixel Scale)',
      },
      severityLevel: req.body.severityLevel || 'Moderate (0.2-0.3mm)',
      structuralContext: req.body.structuralContext || 'Flexural zone',
      inspectorNotes: req.body.inspectorNotes || '',
      isDemo: false,
    };

    inspections.unshift(newRecord);

    // Update structure counter
    const struct = structures.find((s) => s.id === newRecord.structureId);
    if (struct) {
      struct.totalInspections++;
      if (newRecord.metrics?.connectedComponents > 0) {
        struct.activeCracksCount++;
      }
    }

    res.status(201).json(newRecord);
  });

  // FEA Solver endpoint
  app.post('/api/fea/solve', (req, res) => {
    try {
      const params: FEARunParameters = req.body;
      const result = solveFEA(params);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'FEA calculation failed' });
    }
  });

  // Model benchmarks
  app.get('/api/benchmarks', (req, res) => {
    res.json(BENCHMARK_EVALUATIONS);
  });

  // Synthetic sample generator
  app.get('/api/synthetic-sample', (req, res) => {
    const type = (req.query.type as any) || 'shear-diagonal';
    const sample = generateSyntheticCrackSpecimen(256, 256, type);
    res.json({
      width: sample.width,
      height: sample.height,
      groundTruthLengthPx: sample.groundTruthLengthPx,
      type,
    });
  });

  // Reset demo data endpoint
  app.post('/api/reset-demo-data', (req, res) => {
    structures = [...INITIAL_STRUCTURES];
    inspections = [...INITIAL_INSPECTIONS];
    res.json({ success: true, message: 'Reset to initial research demo dataset.' });
  });

  // Purge demo data
  app.post('/api/clear-demo-data', (req, res) => {
    structures = structures.filter((s) => !s.isDemo);
    inspections = inspections.filter((i) => !i.isDemo);
    res.json({ success: true, message: 'Demo data cleared. Clean state active.' });
  });

  // Vite or Static file serving
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CrackSense AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
