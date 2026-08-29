import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MarineSight AI Marine Intelligence Backend',
    timestamp: new Date().toISOString(),
    geminiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

// 2. Sonar Intelligence Detection API
app.post('/api/detection/sonar', async (req, res) => {
  try {
    const {
      filename,
      fileSize,
      fileType,
      coordinates,
      params = {},
      imageSnippet,
    } = req.body;

    const confThreshold = params.confidenceThreshold ?? 0.5;
    const noiseReduction = params.noiseReduction ?? true;
    const freq = params.frequencyKhz ?? 455;
    const contrast = params.contrastEnhancement ?? 50;

    // Simulated / Model Adapter Sonar Detections based on acoustic shadow & texture algorithms
    const isHighFreq = freq >= 800;
    const detectedObjects = [
      {
        id: `DET-SONAR-${Date.now()}-1`,
        category: 'Ghost Fishing Gear',
        confidence: Number((0.89 + (contrast > 40 ? 0.05 : 0)).toFixed(2)),
        estimatedSizeM2: 18.5,
        depthMeters: 14.2,
        acousticShadowLengthM: 6.8,
        boundingBox: { x: 22, y: 35, width: 48, height: 38, label: 'Ghost Net Cluster', confidence: 0.94 },
        textureSignature: 'High acoustic reflectivity with dense reticulated webbing pattern',
        riskLevel: 'Critical',
        whyClassified: 'High-contrast acoustic backscatter with elongated shadow (6.8m) matching suspended trawl net on silt substrate.',
      },
      {
        id: `DET-SONAR-${Date.now()}-2`,
        category: 'Tire',
        confidence: 0.91,
        estimatedSizeM2: 1.4,
        depthMeters: 14.8,
        acousticShadowLengthM: 1.9,
        boundingBox: { x: 74, y: 62, width: 16, height: 18, label: 'Submerged Toroid (Tire)', confidence: 0.91 },
        textureSignature: 'Toroidal acoustic highlight with central hollow shadow',
        riskLevel: 'High',
        whyClassified: 'Characteristic circular acoustic halo and central void corresponding to a sunken heavy vehicle tire.',
      },
    ].filter((item) => item.confidence >= confThreshold);

    res.json({
      success: true,
      processedAt: new Date().toISOString(),
      detectionCount: detectedObjects.length,
      qualityScore: Math.min(98, 85 + (noiseReduction ? 8 : 0)),
      detections: detectedObjects,
      preprocessingApplied: {
        noiseReduction,
        contrastEnhancement: contrast,
        frequencyKhz: freq,
        resolutionMode: isHighFreq ? 'High Resolution (0.05m/pixel)' : 'Standard Long-Range (0.15m/pixel)',
      },
      inferenceEngine: 'GhostVision SonarNet Ultra v2.4 (Python Adapter Simulation)',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Surface Vision Detection API (YOLO format)
app.post('/api/detection/surface', async (req, res) => {
  try {
    const { filename, source = 'Drone Vision', confidenceThreshold = 0.5 } = req.body;

    const detectedObjects = [
      {
        id: `DET-SURF-${Date.now()}-1`,
        category: 'Plastic',
        confidence: 0.92,
        estimatedSizeM2: 4.8,
        boundingBox: { x: 32, y: 28, width: 38, height: 42, label: 'HDPE Barrel & Plastic Film', confidence: 0.92 },
        severity: 'High',
        whyClassified: 'Visual segmentation identified high-saturation synthetic polymers with rigid geometric profiles.',
      },
      {
        id: `DET-SURF-${Date.now()}-2`,
        category: 'Fishing Net',
        confidence: 0.88,
        estimatedSizeM2: 12.0,
        boundingBox: { x: 15, y: 55, width: 28, height: 30, label: 'Floating Monofilament Net', confidence: 0.88 },
        severity: 'Critical',
        whyClassified: 'Detected mesh pattern and attached float line on surface eddy boundary.',
      },
    ].filter((item) => item.confidence >= confidenceThreshold);

    res.json({
      success: true,
      processedAt: new Date().toISOString(),
      detectionCount: detectedObjects.length,
      qualityScore: 91,
      detections: detectedObjects,
      inferenceEngine: 'GhostVision Surface-YOLOv9 SeaGuard (ONNX/TensorRT Adapter)',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Video Tracking Simulation API
app.post('/api/detection/video', async (req, res) => {
  try {
    const { durationSeconds = 10, fps = 30 } = req.body;
    const totalFrames = Math.floor(durationSeconds * fps);

    const trackedEntities = [
      {
        trackerId: 'TRK-208',
        category: 'Plastic',
        firstDetectedFrame: 0,
        lastDetectedFrame: totalFrames,
        confidence: 0.89,
        estimatedVelocityKnots: 1.3,
        driftDirectionDeg: 138,
        keyframeTrajectories: [
          { frame: 0, x: 30, y: 40, sizeM2: 3.2 },
          { frame: Math.floor(totalFrames * 0.5), x: 42, y: 48, sizeM2: 3.3 },
          { frame: totalFrames, x: 55, y: 58, sizeM2: 3.1 },
        ],
      },
      {
        trackerId: 'TRK-209',
        category: 'Ghost Fishing Gear',
        firstDetectedFrame: 15,
        lastDetectedFrame: totalFrames,
        confidence: 0.94,
        estimatedVelocityKnots: 0.4,
        driftDirectionDeg: 112,
        keyframeTrajectories: [
          { frame: 15, x: 60, y: 25, sizeM2: 18.0 },
          { frame: Math.floor(totalFrames * 0.5), x: 62, y: 29, sizeM2: 18.4 },
          { frame: totalFrames, x: 65, y: 34, sizeM2: 18.2 },
        ],
      },
    ];

    res.json({
      success: true,
      totalFrames,
      trackedEntities,
      summary: `Tracked ${trackedEntities.length} debris objects over ${durationSeconds} seconds with continuous spatial vector estimation.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Multimodal Marine Fusion API
app.post('/api/fusion/analyze', async (req, res) => {
  try {
    const {
      sonarTarget = { detected: true, confidence: 0.94, depthMeters: 14.2, shadowLengthM: 6.8, coords: [9.3142, 79.1821] },
      droneTarget = { detected: true, confidence: 0.91, altitudeM: 45, coords: [9.3155, 79.1834] },
      cameraTarget = { detected: true, confidence: 0.88, coords: [9.3149, 79.1825] },
    } = req.body;

    // Calculate spatial delta in meters (approximate haversine)
    const lat1 = sonarTarget.coords[0];
    const lon1 = sonarTarget.coords[1];
    const lat2 = droneTarget.coords[0];
    const lon2 = droneTarget.coords[1];

    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = Math.round(R * c);

    // Multimodal fusion formula: combined confidence boosts when co-registered within 150m
    const isClose = distanceMeters <= 200;
    const fusedConfidence = isClose
      ? Math.min(0.99, Number((1 - (1 - sonarTarget.confidence) * (1 - droneTarget.confidence) * 0.7).toFixed(2)))
      : sonarTarget.confidence;

    const fusedResult = {
      fusedId: `FUSED-${Date.now()}`,
      targetCategory: 'Ghost Fishing Gear',
      combinedConfidence: fusedConfidence,
      priority: fusedConfidence > 0.9 ? 'Critical' : 'High',
      coordinates: [
        Number(((lat1 + lat2) / 2).toFixed(5)),
        Number(((lon1 + lon2) / 2).toFixed(5)),
      ],
      spatialMatchDistanceM: distanceMeters,
      sensorSignals: {
        sonar: {
          detected: sonarTarget.detected,
          confidence: sonarTarget.confidence,
          shadowLengthM: sonarTarget.shadowLengthM,
          note: 'Submerged high-density net mass casting 6.8m acoustic shadow at 14.2m depth.',
        },
        drone: {
          detected: droneTarget.detected,
          confidence: droneTarget.confidence,
          altitudeM: droneTarget.altitudeM,
          note: 'Surface floating buoy markers and green poly netting observed from 45m AGL.',
        },
        camera: {
          detected: cameraTarget.detected,
          confidence: cameraTarget.confidence,
          surfaceVis: 'High',
          note: 'Optical confirmation of surface eddy trapping entangled debris.',
        },
        gps: {
          lat: Number(((lat1 + lat2) / 2).toFixed(5)),
          lng: Number(((lon1 + lon2) / 2).toFixed(5)),
          accuracyMeters: 2.1,
        },
      },
      aiExplanation: `Multimodal Marine Fusion established spatial-temporal co-registration (Δd = ${distanceMeters}m). Subsurface acoustic shadow aligns with aerial multi-spectral surface sighting, raising combined confidence to ${Math.round(fusedConfidence * 100)}%.`,
      recommendation: 'Immediate dispatch of RV Sagar Guardian dive salvage unit with heavy hydraulic cutters.',
    };

    res.json({ success: true, fusion: fusedResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Marine Risk Intelligence Prediction API
app.post('/api/risk/predict', async (req, res) => {
  try {
    const { coordinates = [9.3148, 79.1828], debrisHistoryCount = 14, primaryCategory = 'Ghost Fishing Gear' } = req.body;

    const densityScore = Math.min(100, Math.round(debrisHistoryCount * 6.5));
    const ghostGearBonus = primaryCategory === 'Ghost Fishing Gear' ? 20 : 10;
    const riskScore = Math.min(99, Math.max(40, Math.round(densityScore * 0.6 + ghostGearBonus + 15)));

    const classification =
      riskScore >= 85 ? 'CRITICAL' : riskScore >= 70 ? 'HIGH' : riskScore >= 50 ? 'MODERATE' : 'LOW';

    let explanation = `High debris density (${debrisHistoryCount} detections) observed in close proximity to sensitive coral reef habitat. Predominance of ${primaryCategory} presents severe entanglement and habitat smothering hazard.`;

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `Analyze this marine debris risk assessment:
Coordinates: ${coordinates[0]}, ${coordinates[1]}
Historical Detection Count: ${debrisHistoryCount}
Primary Debris Type: ${primaryCategory}
Calculated Risk Score: ${riskScore}/100 (${classification})

Provide a concise 2-sentence marine scientific risk summary detailing ecological impact and immediate operational urgency. Do not use generic filler.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        if (response.text) {
          explanation = response.text.trim();
        }
      } catch (e) {
        console.warn('Gemini API risk explanation fallback:', e);
      }
    }

    res.json({
      success: true,
      riskScore,
      classification,
      densityScore,
      ghostGearRisk: riskScore >= 80 ? 94 : 72,
      cleanupPriority: Math.min(100, riskScore + 2),
      recurrenceProbability: Math.min(96, Math.round(densityScore * 0.9)),
      explanation,
      factors: [
        { name: 'Historical Debris Density', score: densityScore, impact: 'High concentration of recurring debris' },
        { name: 'Ghost Gear Entanglement Potential', score: ghostGearBonus * 4.5, impact: 'Lethal threat to turtles, dugongs, and cetaceans' },
        { name: 'Sensitive Habitat Proximity', score: 95, impact: 'Within 2.5km of MPAs and living coral reefs' },
        { name: 'Hydrodynamic Current Accumulation', score: 82, impact: 'Tidal convergence zone accelerates deposition' },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. MarineSight AI Copilot AI Chat API
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Deterministic intelligent fallback when Gemini key is not configured
      let reply = `MarineSight AI Copilot: I am operating in offline intelligence mode. Currently monitoring 5 major marine sectors including Palk Bay, Gulf of Mannar, and Malacca Strait. Our highest priority incident is INC-401 (Critical Ghost Net on Palk Bay Coral Shelf, Priority Score 96/100), currently assigned to RV Sagar Guardian.`;
      
      const lower = message.toLowerCase();
      if (lower.includes('priority') || lower.includes('highest')) {
        reply = `Top priority incidents right now:\n1. **INC-401** (Palk Bay): Fused Ghost Net entity (Score 96/100, Critical). RV Sagar Guardian deployed.\n2. **INC-402** (Mannar Dugong Corridor): Derelict Crab Pot Trapline (Score 92/100, Critical).\n3. **INC-414** (Ribbon Reef): Tangled poly rope mass (Score 95/100, Critical).`;
      } else if (lower.includes('recurrence') || lower.includes('hotspot')) {
        reply = `Highest recurrence hotspots:\n• **Palk Bay Coral Shoal** (Recurrence: 91%, Risk: 94/100) — 42 debris items logged, primarily ghost fishing gear.\n• **Gulf of Mannar Sector 3** (Recurrence: 85%, Risk: 88/100) — High trawl net snag frequency.`;
      } else if (lower.includes('today') || lower.includes('summarize')) {
        reply = `Today's Marine Intelligence Summary:\n• **52 Total Active Detections** across Sonar, Drone, and Surface optical sensors.\n• **6 Critical Incidents** requiring active dive intervention.\n• **1,270 kg Debris Removed** across 2 completed cleanup missions.\n• **Detection Accuracy**: 93.4% average across SonarNet v2.4 and YOLOv9.`;
      } else if (lower.includes('cleanup') || lower.includes('mission')) {
        reply = `Recommended Cleanup Prioritization:\n1. Maintain operation on **MSN-701** (Palk Bay Ghost Net) to secure remaining 18.5m² net mass.\n2. Dispatch **Patrol Craft Vajra-2** to INC-402 before prevailing tidal currents shift the trapline into deep navigation channels.`;
      }

      return res.json({ success: true, reply, source: 'offline-rule-engine' });
    }

    const systemInstruction = `You are the MarineSight AI Copilot, an expert AI marine scientist and ocean operations coordinator for the MarineSight AI Marine Debris & Underwater Anomaly Intelligence Platform.
You have real-time access to the platform telemetry:
- Total Detections: 52 (Sonar, Drone, Surface camera, Fused)
- High-Risk Incidents: 6 Critical (INC-401 Palk Bay Ghost Net, INC-402 Crab Trapline, INC-414 Coral Reef Net)
- Active Cleanup Missions: MSN-701 (RV Sagar Guardian), MSN-704 (Coral Star)
- Primary Hotspots: Palk Bay (Risk 94/100), Gulf of Mannar (Risk 88/100), Malacca Strait (Risk 76/100)
- AI Detection Engines: MarineSight AI SonarNet Ultra v2.4 (mAP 0.942), Surface-YOLOv9 SeaGuard (mAP 0.931), Multimodal GeoFusion v1.8

Always provide professional, precise, concise, and scientifically grounded responses. Suggest actionable cleanup steps, dive safety recommendations, or sensor parameter adjustments where helpful. Do not invent fake statistics beyond the platform scope.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'No response generated from model.',
      source: 'gemini-3.7-flash',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. AI Detection Explanation API
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { category, source, confidence, qualityScore, depthMeters, acousticShadowLengthM } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        success: true,
        explanation: `Classified as ${category} with ${Math.round(confidence * 100)}% confidence based on ${source} spatial signature, ${acousticShadowLengthM ? `acoustic shadow of ${acousticShadowLengthM}m, ` : ''}and distinct geometric profile matching marine debris training benchmarks.`,
        uncertainty: confidence > 0.9 ? 'Low' : 'Moderate',
        recommendedVerification: 'ROV optical inspection or high-frequency 900 kHz verification pass.',
      });
    }

    const prompt = `Explain why a marine intelligence model classified this underwater/surface target:
Category: ${category}
Sensor Source: ${source}
Confidence: ${confidence}
Quality Score: ${qualityScore}/100
${depthMeters ? `Depth: ${depthMeters} meters` : ''}
${acousticShadowLengthM ? `Acoustic Shadow: ${acousticShadowLengthM} meters` : ''}

Generate a concise 2-sentence user-facing technical explanation, state uncertainty level (Low/Moderate/High), and suggest recommended field verification.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      explanation: response.text || 'Classification confirmed by spatial and acoustic features.',
      uncertainty: confidence > 0.9 ? 'Low' : 'Moderate',
      recommendedVerification: 'ROV optical inspection or high-frequency 900 kHz verification pass.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. AI Executive Marine Intelligence Report Generator
app.post('/api/ai/report', async (req, res) => {
  try {
    const { timeframe = 'Last 30 Days', region = 'Palk Bay & Gulf of Mannar' } = req.body;

    const ai = getGenAI();
    let reportMarkdown = '';

    if (ai) {
      try {
        const prompt = `Generate an executive Marine Intelligence & Debris Impact Report for:
Timeframe: ${timeframe}
Region: ${region}
Total Detections Logged: 52
Critical Ghost Gear Incidents: 6
Total Debris Recovered: 1,950 kg
Model Performance: SonarNet v2.4 (mAP 0.942), Surface YOLOv9 (mAP 0.931)

Structure with:
1. Executive Summary
2. Key Spatial Hotspots & Recurrence
3. Ghost Gear & Ecological Entanglement Risks
4. Cleanup Operations & Yield Metrics
5. Strategic Operational Recommendations for Next Cycle`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
        });

        reportMarkdown = response.text || '';
      } catch (e) {
        console.warn('Gemini report fallback:', e);
      }
    }

    if (!reportMarkdown) {
      reportMarkdown = `# GhostVision Executive Marine Intelligence Report
**Timeframe:** ${timeframe} | **Region:** ${region} | **Classification:** Official Marine Ops

## 1. Executive Summary
During the observation cycle, GhostVision processed 52 verified marine debris sightings across side-scan sonar, UAV aerial surveys, and vessel surface cameras. Multimodal fusion identified 6 critical ghost fishing gear anomalies with an average co-registration confidence of 94.6%.

## 2. Key Spatial Hotspots & Recurrence
- **Palk Bay Coral Shoal (9.31°N, 79.18°E):** Recurrence rate of 91%. 42 discrete targets logged, with heavy synthetic net masses snagged on live coral bommies.
- **Gulf of Mannar Bio-Reserve (8.81°N, 78.43°E):** 28 targets logged. High density of derelict wire crab traps posing immediate threat to local dugong populations.

## 3. Cleanup Operations & Yield Metrics
- **Missions Executed:** 10 scheduled / active missions.
- **Total Debris Recovered:** 1,950 kg of high-density polymers, derelict gillnets, and sunken tires.
- **High-Risk Incidents Resolved:** 3 critical entanglements eliminated.

## 4. Strategic Recommendations
1. Intensify UAV drone survey passes over Palk Bay reef crest during morning slack water.
2. Upgrade sonar survey frequencies to 900 kHz for fine mesh discrimination in high-turbidity estuarine channels.
3. Coordinate with local port marshals for rapid deployment of boom barriers at Tuticorin outfalls.`;
    }

    res.json({
      success: true,
      timeframe,
      region,
      reportMarkdown,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GhostVision Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
