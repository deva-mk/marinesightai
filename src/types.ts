export * from './types/index';

import {
  AlertRecord,
  MissionStatus,
  IncidentRecord,
  DetectionRecord,
  HotspotRecord,
  AIModelRecord,
  DatasetRecord,
  LiveStreamEvent,
  UserProfile as BaseUserProfile,
  BoundingBox,
  DebrisCategory,
  DetectionSource,
  SeverityLevel,
  IncidentStatus,
  CleanupMission as BaseCleanupMission,
  DroneMission
} from './types/index';

export interface SonarProcessingParams {
  frequencyKhz: number;
  altitudeMeters: number;
  contrastBoost: number;
  shadowThreshold: number;
  filterMode: 'Standard' | 'High-Pass' | 'Adaptive-Gain' | 'Acoustic-Shadow-Only';
}

export type SystemAlert = AlertRecord & {
  acknowledged?: boolean;
  location?: string;
  description?: string;
};

export type CleanupStatus = MissionStatus | 'In Progress' | 'Completed' | 'Scheduled' | 'Pending Verification' | 'Mobilizing' | 'PLANNED' | 'ACTIVE';
export type AIModelCard = AIModelRecord;

export interface RiskAssessment {
  score: number;
  level: string;
  riskScore?: number;
  factors: { name: string; weight: string; score: number; status: string; desc: string }[];
  recommendation: string;
  explanation?: string;
}

export interface RiskPredictionResult {
  riskScore: number;
  level: string;
  explanation: string;
}

export interface FusionResult {
  id?: string;
  sonarDetectionId?: string;
  surfaceDetectionId?: string;
  primaryCategory?: string;
  fusedConfidence: number;
  crossSensorCorrelation?: number;
  spatialOffsetMeters?: number;
  temporalOffsetMinutes?: number;
  contributingSensors?: {
    source: string;
    targetId: string;
    confidence: number;
    detectedAt: string;
  }[];
  coordinates?: [number, number];
  riskScore?: number;
  predictedClass?: string;
  depthEstimatedMeters?: number;
  bioHazardScore?: number;
  aiSynthesis?: string;
  summary?: string;
}

// Unified Detection Item interface
export interface DetectionItem {
  id: string;
  type: string;
  category?: DebrisCategory;
  source: string;
  confidence: number;
  coordinates: [number, number];
  locationName: string;
  timestamp: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  qualityScore: number;
  estimatedSizeM2?: number;
  depthMeters?: number;
  acousticShadowLengthM?: number;
  imageUrl: string;
  boundingBoxes?: BoundingBox[];
  status: string;
  tags?: string[];
  whyClassifiedExplanation?: string;
  isSimulated?: boolean;
}

// Unified Incident Item interface
export interface IncidentItem {
  id: string;
  title: string;
  debrisType: string;
  locationName: string;
  coordinates: [number, number];
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  cleanupPriorityScore: number;
  status: 'New' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved' | 'NEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | string;
  createdDate: string;
  updatedDate: string;
  assignedTeam?: string;
  sensorSources?: string[];
  estimatedWeightKg: number;
  depthMeters?: number;
  images: string[];
  notes: string[];
  confidence?: number;
}

export interface HotspotItem {
  id: string;
  name: string;
  coordinates: [number, number];
  debrisCount: number;
  primaryCategory: string;
  severity: 'Critical' | 'High' | 'Medium';
  riskScore: number;
  trend: string;
  description: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  location: string;
  isRead: boolean;
  type?: string;
  relatedTargetId?: string;
}

export interface UserItem {
  id: string;
  name: string;
  role: 'ADMIN' | 'MARINE OPERATOR' | 'MARINE_OPERATOR' | 'RESEARCHER' | 'CLEANUP DIVER' | 'CLEANUP_TEAM' | 'VIEWER' | string;
  email: string;
  avatar: string;
  avatarUrl?: string;
  organization: string;
  joinDate: string;
}

export type UserProfile = BaseUserProfile & {
  avatar?: string;
  joinDate?: string;
};

export type CleanupMission = BaseCleanupMission;
