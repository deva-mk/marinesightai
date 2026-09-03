import { 
  DetectionRecord, 
  IncidentRecord, 
  CleanupMission, 
  DroneMission, 
  HotspotRecord, 
  AIModelRecord, 
  DatasetRecord, 
  AlertRecord, 
  UserProfile,
  LiveStreamEvent
} from '../types';

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Dr. Aris Thorne',
    email: 'admin@marinesight.ai',
    role: 'ADMIN',
    organization: 'Global Ocean Observatories / MarineSight AI HQ',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-operator',
    name: 'Capt. Maya Vance',
    email: 'operator@marinesight.ai',
    role: 'MARINE_OPERATOR',
    organization: 'Coastal Survey Vessel RV Poseidon',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-researcher',
    name: 'Elena Rostova, Ph.D.',
    email: 'researcher@marinesight.ai',
    role: 'RESEARCHER',
    organization: 'Marine Benthic Acoustic Ecology Lab',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-cleanup',
    name: 'Liam Gallagher',
    email: 'cleanup@marinesight.ai',
    role: 'CLEANUP_TEAM',
    organization: 'Ocean Cleanup Rapid Response Taskforce',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr-viewer',
    name: 'Public Environmental Observer',
    email: 'viewer@marinesight.ai',
    role: 'VIEWER',
    organization: 'Independent Marine Conservationist',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  }
];

// All predefined data arrays initialized to empty arrays as requested
export const SAMPLE_DETECTIONS: DetectionRecord[] = [];
export const SAMPLE_INCIDENTS: IncidentRecord[] = [];
export const SAMPLE_CLEANUP_MISSIONS: CleanupMission[] = [];
export const SAMPLE_DRONE_MISSIONS: DroneMission[] = [];
export const SAMPLE_HOTSPOTS: HotspotRecord[] = [];
export const SAMPLE_ALERTS: AlertRecord[] = [];
export const INITIAL_LIVE_STREAM: LiveStreamEvent[] = [];

export const SAMPLE_AI_MODELS: AIModelRecord[] = [
  {
    id: 'MOD-01',
    name: 'MarineSight AI Sonar Acoustic Net & Pot Detector',
    version: 'v3.2.0-rf-acoustic',
    task: 'SONAR_ACOUSTIC',
    classes: ['Ghost Net', 'Crab Pot', 'Tire', 'Metal Drum', 'Hull Anomaly'],
    precision: 0.934,
    recall: 0.912,
    mAP: 0.923,
    dataset: 'DS-SONAR-GLOBAL-2026 (18,400 acoustic frames)',
    dateTrained: '2026-07-14',
    status: 'ACTIVE',
    architecture: 'Random Forest + Acoustic Backscatter Shadow Feature Pyramid'
  },
  {
    id: 'MOD-02',
    name: 'MarineSight AI YOLOv8-Marine Surface Vision',
    version: 'v2.8.4-yolov8x',
    task: 'SURFACE_YOLO',
    classes: ['Floating Plastic', 'Buoy', 'Monofilament Line', 'Cans', 'Bottles', 'Trawl Webbing'],
    precision: 0.948,
    recall: 0.925,
    mAP: 0.936,
    dataset: 'DS-DRONE-OPTICAL-v4 (24,500 labeled frames)',
    dateTrained: '2026-08-02',
    status: 'ACTIVE',
    architecture: 'Custom DarkNet Backbone + Multispectral Fusion Layer'
  },
  {
    id: 'MOD-03',
    name: 'MarineSight AI Multimodal Marine Fusion Engine',
    version: 'v2.1.0-spatial-temporal',
    task: 'MULTIMODAL_FUSION',
    classes: ['Confirmed Ghost Gear', 'Surface Polymer Slick', 'Submerged Hazard', 'Natural Debris'],
    precision: 0.962,
    recall: 0.941,
    mAP: 0.952,
    dataset: 'DS-MULTIMODAL-PAIRED-v2 (6,800 paired missions)',
    dateTrained: '2026-08-10',
    status: 'ACTIVE',
    architecture: 'Spatial-Temporal Bayesian Graph Neural Association'
  },
  {
    id: 'MOD-04',
    name: 'Oceanic Hydrodynamic Drift & Debris Accumulation Net',
    version: 'v1.4.2-eddy-drift',
    task: 'RISK_DRIFT',
    classes: ['Critical Accumulation', 'High Recurrence', 'Dispersal Zone'],
    precision: 0.892,
    recall: 0.870,
    mAP: 0.881,
    dataset: 'NOAA + Copernicus Ocean Current Reanalysis',
    dateTrained: '2026-06-20',
    status: 'ACTIVE',
    architecture: 'LSTM + Physics-Informed Neural Network (PINN)'
  },
  {
    id: 'MOD-05',
    name: 'Experimental Deep Sea Side-Scan Transformer',
    version: 'v0.9.0-transformer-experimental',
    task: 'SONAR_ACOUSTIC',
    classes: ['Ghost Gear', 'Benthic Reef', 'Sand Ribs', 'Man-Made Object'],
    precision: 0.915,
    recall: 0.884,
    mAP: 0.901,
    dataset: 'DS-SONAR-SYNTHETIC-DEEP',
    dateTrained: '2026-08-20',
    status: 'TESTING',
    architecture: 'Vision Transformer (ViT-Large) with Acoustic Positional Encoding'
  }
];

export const SAMPLE_DATASETS: DatasetRecord[] = [
  {
    id: 'DS-01',
    name: 'Global Side-Scan Sonar Marine Debris Benchmark',
    version: 'v3.2',
    type: 'SONAR_ACOUSTIC',
    imagesCount: 18400,
    annotationsCount: 42100,
    classesCount: 6,
    trainValTestSplit: '70% / 15% / 15%',
    qualityScore: 94,
    lastUpdated: '2026-08-15',
    formats: ['.PNG', '.XTF', '.JSF', '.DAT', '.SL2']
  },
  {
    id: 'DS-02',
    name: 'Aerial Drone Marine Litter Optical & Multispectral',
    version: 'v4.0',
    type: 'SURFACE_AERIAL',
    imagesCount: 24500,
    annotationsCount: 68900,
    classesCount: 12,
    trainValTestSplit: '75% / 15% / 10%',
    qualityScore: 96,
    lastUpdated: '2026-08-20',
    formats: ['.JPG', '.MP4', '.GeoTIFF']
  },
  {
    id: 'DS-03',
    name: 'Benthic Reef Underwater ROV Entanglement Imagery',
    version: 'v2.1',
    type: 'UNDERWATER_OPTICAL',
    imagesCount: 9200,
    annotationsCount: 21400,
    classesCount: 8,
    trainValTestSplit: '70% / 20% / 10%',
    qualityScore: 91,
    lastUpdated: '2026-07-28',
    formats: ['.JPG', '.PNG', '.RAW']
  },
  {
    id: 'DS-04',
    name: 'Multimodal Paired Acoustic-Optical Co-Registrations',
    version: 'v1.8',
    type: 'SONAR_ACOUSTIC',
    imagesCount: 6800,
    annotationsCount: 19500,
    classesCount: 5,
    trainValTestSplit: '80% / 10% / 10%',
    qualityScore: 98,
    lastUpdated: '2026-08-10',
    formats: ['.JSON', '.XTF', '.GeoJSON']
  }
];

export const DRONE_MISSIONS_DATA: any[] = [];

export const AI_MODELS_DATA = [
  {
    id: 'MOD-01',
    name: 'SonarNet-YOLOv8 Dual-Channel',
    version: 'v2.4.1',
    architecture: 'Side-Scan Sonar Slant-Range & Acoustic Shadow CNN',
    status: 'ACTIVE',
    mapScore: 94.8,
    latencyMs: 14,
    precision: 95.2,
    lastTrained: '2026-08-20',
    classesSupported: ['Ghost Net', 'Derelict Crab Pot', 'Tire', 'Metal Drum', 'Natural Reef']
  },
  {
    id: 'MOD-02',
    name: 'YOLOv8-Marine Aerial Debris Vision',
    version: 'v3.1.0',
    architecture: 'Multispectral RGB + 850nm NIR Drone Model',
    status: 'ACTIVE',
    mapScore: 96.2,
    latencyMs: 8,
    precision: 96.8,
    lastTrained: '2026-08-22',
    classesSupported: ['Floating Plastic Matrix', 'Ghost Net Buoy', 'Mooring Line', 'Polymer Slick']
  },
  {
    id: 'MOD-03',
    name: 'Multimodal Spatial-Temporal Fusion Engine',
    version: 'v2.0.0',
    architecture: 'Bayesian Acoustic-Optical Co-Registration Graph Network',
    status: 'ACTIVE',
    mapScore: 97.4,
    latencyMs: 22,
    precision: 98.1,
    lastTrained: '2026-08-24',
    classesSupported: ['High-Risk Fused Incident', 'Submerged Entanglement Hazard', 'Drifting Buoy Matrix']
  },
  {
    id: 'MOD-04',
    name: 'MarineSight AI Copilot Gemini 2.5 Flash',
    version: 'v2.5-flash',
    architecture: 'Multimodal Oceanographic LLM & Risk Reasoning Core',
    status: 'ACTIVE',
    mapScore: 98.9,
    latencyMs: 420,
    precision: 99.1,
    lastTrained: '2026-08-26',
    classesSupported: ['Acoustic Interpretation', 'Triage Recommendation', 'Cleanup Route Optimization']
  }
];

export const DATASETS_DATA = [
  {
    id: 'DS-01',
    name: 'Global Side-Scan Sonar Marine Debris Benchmark',
    format: 'COCO + SL2',
    description: 'High-frequency hydroacoustic side-scan transects containing ghost gear, crab pots, and seabed anomalies.',
    sampleCount: '18,400 scans',
    splitRatio: '70 / 15 / 15',
    classes: ['Ghost Net', 'Crab Pot', 'Tire', 'Metal Drum', 'Coral Pinnacle'],
    lastUpdated: '2026-08-15'
  },
  {
    id: 'DS-02',
    name: 'Aerial Drone Marine Litter Optical & Multispectral',
    format: 'YOLOv8 Darknet',
    description: 'RGB and 850nm NIR UAV imagery capturing floating plastic debris, nets, ropes, and buoys in Gulf of Mannar.',
    sampleCount: '24,500 frames',
    splitRatio: '75 / 15 / 10',
    classes: ['Plastic Matrix', 'Net Buoy', 'Rope', 'Polymer Slick', 'Foam Float'],
    lastUpdated: '2026-08-20'
  },
  {
    id: 'DS-03',
    name: 'Multimodal Paired Acoustic-Optical Co-Registrations',
    format: 'GeoJSON + JSON',
    description: 'Spatially synchronized side-scan sonar and drone aerial observations of submerged debris sites.',
    sampleCount: '6,800 pairs',
    splitRatio: '80 / 10 / 10',
    classes: ['Entangled Reef', 'Ghost Webbing Array', 'Sunken Line Cluster'],
    lastUpdated: '2026-08-10'
  }
];
