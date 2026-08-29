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
    confidenceThreshold?: number;
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
};
