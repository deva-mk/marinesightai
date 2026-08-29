export type UserRole = 'ADMIN' | 'MARINE_OPERATOR' | 'RESEARCHER' | 'CLEANUP_TEAM' | 'VIEWER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  avatarUrl?: string;
}

export type DebrisCategory = 
  | 'Ghost Fishing Gear'
  | 'Fishing Net'
  | 'Fishing Line'
  | 'Plastic'
  | 'Bottle'
  | 'Can'
  | 'Tire'
  | 'Metal Debris'
  | 'Glass'
  | 'Derelict Crab Pot'
  | 'Unknown Debris'
  | 'Marine Anomaly'
  | 'Natural Object'
  | 'Floating Debris';

export type DetectionSource = 'SONAR' | 'DRONE' | 'CAMERA' | 'FUSION' | 'SATELLITE';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'NEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type MissionStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  confidence?: number;
}

export interface DetectionRecord {
  id: string;
  title: string;
  category: DebrisCategory;
  source: DetectionSource;
  confidence: number;
  qualityScore: number;
  severity: SeverityLevel;
  location: {
    lat: number;
    lng: number;
    depthMeters?: number;
    sector: string;
    areaName: string;
  };
  timestamp: string;
  imageUrl: string;
  processedImageUrl?: string;
  status: 'Unverified' | 'Verified' | 'Incident Created' | 'Archived';
  boundingBoxes?: BoundingBox[];
  estimatedDimensions?: string;
  estimatedWeightKg?: number;
  acousticSignature?: string;
  opticalSignature?: string;
  aiExplanation?: string;
  isDemo?: boolean;
}

export interface IncidentRecord {
  id: string;
  title: string;
  category: DebrisCategory;
  source: DetectionSource;
  severity: SeverityLevel;
  confidence: number;
  status: IncidentStatus;
  location: {
    lat: number;
    lng: number;
    depthMeters?: number;
    sector: string;
    areaName: string;
  };
  priorityScore: number; // 0-100
  assignedTeam?: string;
  assignedVessel?: string;
  createdDate: string;
  updatedDate: string;
  reportedBy: string;
  notes: string[];
  imageUrl: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  associatedDetectionIds: string[];
  bioRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedRemovalEffortHours: number;
}

export interface CleanupMission {
  id: string;
  title: string;
  status: MissionStatus;
  teamName: string;
  vesselName: string;
  leader: string;
  targetIncidents: string[];
  locationName: string;
  scheduledDate: string;
  completedDate?: string;
  debrisCollectedKg: number;
  highRiskResolvedCount: number;
  fuelEfficiencyIndex?: number;
  routeCoordinates: [number, number][];
  beforePhoto?: string;
  afterPhoto?: string;
  notes: string;
}

export interface DroneMission {
  id: string;
  missionName: string;
  droneModel: string;
  pilot: string;
  flightPath: [number, number][];
  coverageAreaKm2: number;
  durationMinutes: number;
  detectionsCount: number;
  averageConfidence: number;
  date: string;
  status: 'COMPLETED' | 'IN_FLIGHT' | 'SCHEDULED';
  videoStreamUrl?: string;
}

export interface HotspotRecord {
  id: string;
  name: string;
  sector: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  detectionCount: number;
  dominantCategory: DebrisCategory;
  riskScore: number; // 0-100
  recurrenceIndex: number; // 0-10
  lastActivity: string;
  currentVelocityKnots: number;
}

export interface AIModelRecord {
  id: string;
  name: string;
  version: string;
  task: 'SONAR_ACOUSTIC' | 'SURFACE_YOLO' | 'MULTIMODAL_FUSION' | 'RISK_DRIFT';
  classes: string[];
  precision: number;
  recall: number;
  mAP: number;
  dataset: string;
  dateTrained: string;
  status: 'ACTIVE' | 'TESTING' | 'ARCHIVED';
  architecture: string;
}

export interface DatasetRecord {
  id: string;
  name: string;
  version: string;
  type: 'SONAR_ACOUSTIC' | 'SURFACE_AERIAL' | 'UNDERWATER_OPTICAL';
  imagesCount: number;
  annotationsCount: number;
  classesCount: number;
  trainValTestSplit: string;
  qualityScore: number;
  lastUpdated: string;
  formats: string[];
}

export interface AlertRecord {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL_DEBRIS' | 'NEW_HOTSPOT' | 'REPEATED_DETECTION' | 'CLEANUP_OVERDUE' | 'FUSED_ALERT';
  severity: SeverityLevel;
  timestamp: string;
  isRead: boolean;
  relatedIncidentId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'ALERT' | 'ASSIGNMENT' | 'MISSION' | 'AI_DONE' | 'REPORT';
}

export interface LiveStreamEvent {
  id: string;
  timestamp: string;
  source: DetectionSource;
  category: DebrisCategory;
  confidence: number;
  location: string;
  severity: SeverityLevel;
}
