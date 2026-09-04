import { FusionResult, RiskPredictionResult, SonarProcessingParams } from '../types';

export const apiService = {
  // Health check
  checkHealth: async () => {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch (e) {
      return { status: 'error', error: (e as Error).message };
    }
  },

  // Sonar Detection
  processSonar: async (payload: {
    filename: string;
    fileSize?: number;
    fileType?: string;
    coordinates?: [number, number];
    params?: Partial<SonarProcessingParams>;
    imageSnippet?: string;
  }) => {
    const res = await fetch('/api/detection/sonar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Sonar API error: ${res.statusText}`);
    return await res.json();
  },

  // Surface Vision (YOLO)
  processSurface: async (payload: {
    filename: string;
    source?: string;
    modelId?: string;
    confidenceThreshold?: number;
    iouThreshold?: number;
    imageData?: string;
    coordinates?: [number, number];
  }) => {
    const res = await fetch('/api/detection/surface', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Surface Vision API error: ${res.statusText}`);
    return await res.json();
  },

  // Video Tracking
  processVideo: async (payload: { durationSeconds?: number; fps?: number }) => {
    const res = await fetch('/api/detection/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Video Tracker API error: ${res.statusText}`);
    return await res.json();
  },

  // Multimodal Fusion
  analyzeFusion: async (payload: any): Promise<{ success: boolean; fusion: FusionResult }> => {
    const res = await fetch('/api/fusion/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Fusion API error: ${res.statusText}`);
    return await res.json();
  },

  // Risk Prediction
  predictRisk: async (payload: {
    coordinates: [number, number];
    debrisHistoryCount: number;
    primaryCategory: string;
  }): Promise<{ success: boolean } & RiskPredictionResult> => {
    const res = await fetch('/api/risk/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Risk Prediction API error: ${res.statusText}`);
    return await res.json();
  },

  // MarineSight AI Copilot
  askCopilot: async (message: string, context?: any) => {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    });
    if (!res.ok) throw new Error(`Copilot API error: ${res.statusText}`);
    return await res.json();
  },

  // Detection Explanation
  explainDetection: async (payload: {
    category: string;
    source: string;
    confidence: number;
    qualityScore: number;
    depthMeters?: number;
    acousticShadowLengthM?: number;
  }) => {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`AI Explanation API error: ${res.statusText}`);
    return await res.json();
  },

  // Executive Report Generation
  generateReport: async (timeframe: string, region: string) => {
    const res = await fetch('/api/ai/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeframe, region }),
    });
    if (!res.ok) throw new Error(`Report Generator API error: ${res.statusText}`);
    return await res.json();
  },

  // Hydrodynamic Drift Prediction
  predictDrift: async (payload: {
    origin: [number, number];
    debrisCategory?: string;
    windSpeedKmh?: number;
    windDirectionDeg?: number;
    currentSpeedKnots?: number;
    currentDirectionDeg?: number;
    waveHeightM?: number;
    simulationHours?: number;
  }) => {
    const res = await fetch('/api/drift/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Drift API error: ${res.statusText}`);
    return await res.json();
  },

  // Fleet Telemetry
  getFleetVessels: async () => {
    const res = await fetch('/api/fleet/vessels');
    if (!res.ok) throw new Error(`Fleet API error: ${res.statusText}`);
    return await res.json();
  },

  // Fleet Dispatch
  dispatchVessel: async (payload: {
    incidentId: string;
    vesselId: string;
    assignedLead?: string;
    priority?: string;
  }) => {
    const res = await fetch('/api/fleet/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Dispatch API error: ${res.statusText}`);
    return await res.json();
  },

  // YOLO Model Training
  trainYoloModel: async (payload: {
    architecture?: string;
    datasetId?: string;
    datasetName?: string;
    epochs?: number;
    batchSize?: number;
    learningRate?: number;
    imageSize?: number;
    optimizer?: string;
    augmentations?: string[];
  }) => {
    const res = await fetch('/api/model/train', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Model Training API error: ${res.statusText}`);
    return await res.json();
  },

  // Deploy YOLO Model
  deployYoloModel: async (payload: {
    runId?: string;
    modelName?: string;
    map50?: number;
    precision?: number;
    recall?: number;
    latencyMs?: number;
  }) => {
    const res = await fetch('/api/model/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Model Deploy API error: ${res.statusText}`);
    return await res.json();
  },

  // Get Model Status
  getYoloStatus: async () => {
    const res = await fetch('/api/model/status');
    if (!res.ok) throw new Error(`Model Status API error: ${res.statusText}`);
    return await res.json();
  },

  // Dataset Lab APIs
  getDatasets: async () => {
    const res = await fetch('/api/datasets');
    if (!res.ok) throw new Error(`Datasets API error: ${res.statusText}`);
    return await res.json();
  },

  uploadDatasetBatch: async (payload: {
    datasetId: string;
    batchName: string;
    sensorType: string;
    format: string;
    sampleCount: number;
    annotationsCount: number;
    classes: string[];
    splitRatio?: string;
    filenames?: string[];
    notes?: string;
  }) => {
    const res = await fetch('/api/datasets/upload-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Dataset Batch Upload error: ${res.statusText}`);
    return await res.json();
  },

  // Unified Detections API
  getDetections: async (modality?: string) => {
    const url = modality ? `/api/detections?modality=${encodeURIComponent(modality)}` : '/api/detections';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Detections API error: ${res.statusText}`);
    return await res.json();
  },

  createDetection: async (detection: any) => {
    const res = await fetch('/api/detections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detection),
    });
    if (!res.ok) throw new Error(`Create Detection API error: ${res.statusText}`);
    return await res.json();
  },

  // Unified Incidents API
  getIncidents: async (status?: string, severity?: string) => {
    let url = '/api/incidents';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Incidents API error: ${res.statusText}`);
    return await res.json();
  },

  updateIncidentStatus: async (incidentId: string, status: string, notes?: string) => {
    const res = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error(`Update Incident API error: ${res.statusText}`);
    return await res.json();
  },

  // Unified Alerts API
  getAlerts: async (unacknowledgedOnly: boolean = false) => {
    const url = unacknowledgedOnly ? '/api/alerts?unacknowledgedOnly=true' : '/api/alerts';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Alerts API error: ${res.statusText}`);
    return await res.json();
  },

  acknowledgeAlert: async (alertId: string) => {
    const res = await fetch(`/api/alerts/${encodeURIComponent(alertId)}/acknowledge`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Acknowledge Alert API error: ${res.statusText}`);
    return await res.json();
  },

  // Unified Cleanup API
  getCleanupOperations: async (status?: string) => {
    const url = status ? `/api/cleanup?status=${encodeURIComponent(status)}` : '/api/cleanup';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Cleanup API error: ${res.statusText}`);
    return await res.json();
  },

  dispatchCleanup: async (payload: {
    incidentId: string;
    vesselId: string;
    vesselName?: string;
    targetCoords?: [number, number];
    debrisType?: string;
  }) => {
    const res = await fetch('/api/cleanup/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Dispatch Cleanup API error: ${res.statusText}`);
    return await res.json();
  },
};

