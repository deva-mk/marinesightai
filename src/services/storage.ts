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
  LiveStreamEvent,
  UserRole
} from '../types';
import { 
  SAMPLE_DETECTIONS, 
  SAMPLE_INCIDENTS, 
  SAMPLE_CLEANUP_MISSIONS, 
  SAMPLE_DRONE_MISSIONS, 
  SAMPLE_HOTSPOTS, 
  SAMPLE_AI_MODELS, 
  SAMPLE_DATASETS, 
  SAMPLE_ALERTS, 
  INITIAL_LIVE_STREAM,
  DEMO_USERS 
} from '../data/sampleData';

const STORAGE_KEYS = {
  DETECTIONS: 'gv_detections',
  INCIDENTS: 'gv_incidents',
  MISSIONS: 'gv_missions',
  DRONES: 'gv_drones',
  HOTSPOTS: 'gv_hotspots',
  MODELS: 'gv_models',
  DATASETS: 'gv_datasets',
  ALERTS: 'gv_alerts',
  LIVE_STREAM: 'gv_live_stream',
  CURRENT_USER: 'gv_current_user',
  DEMO_MODE: 'gv_demo_mode'
};

class MarineStorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaults();
  }

  public initDefaults(force = false) {
    if (force || !localStorage.getItem(STORAGE_KEYS.DETECTIONS)) {
      localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(SAMPLE_DETECTIONS));
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(SAMPLE_INCIDENTS));
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(SAMPLE_CLEANUP_MISSIONS));
      localStorage.setItem(STORAGE_KEYS.DRONES, JSON.stringify(SAMPLE_DRONE_MISSIONS));
      localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(SAMPLE_HOTSPOTS));
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(SAMPLE_AI_MODELS));
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(SAMPLE_DATASETS));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(SAMPLE_ALERTS));
      localStorage.setItem(STORAGE_KEYS.LIVE_STREAM, JSON.stringify(INITIAL_LIVE_STREAM));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0])); // Dr. Aris Thorne (Admin)
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
      this.notifyListeners();
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  // --- Current User & Role ---
  public getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  }

  public setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notifyListeners();
  }

  public switchRole(role: UserRole) {
    const user = DEMO_USERS.find(u => u.role === role) || {
      id: `usr-${role.toLowerCase()}`,
      name: `${role.replace('_', ' ')} Operator`,
      email: `${role.toLowerCase()}@marinesight.demo`,
      role: role,
      organization: 'MarineSight AI Marine Network'
    };
    this.setCurrentUser(user);
  }

  // --- Detections ---
  public getDetections(): DetectionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
      return data ? JSON.parse(data) : SAMPLE_DETECTIONS;
    } catch {
      return SAMPLE_DETECTIONS;
    }
  }

  public addDetection(detection: DetectionRecord): DetectionRecord {
    const list = this.getDetections();
    const updated = [detection, ...list];
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(updated));

    // Also push to live stream
    this.addLiveEvent({
      id: `LIVE-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: detection.source,
      category: detection.category,
      confidence: detection.confidence,
      location: detection.location.sector || detection.location.areaName,
      severity: detection.severity
    });

    this.notifyListeners();
    return detection;
  }

  public verifyDetection(detectionId: string) {
    const list = this.getDetections();
    const updated = list.map(d => d.id === detectionId ? { ...d, status: 'Verified' as const } : d);
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- Incidents ---
  public getIncidents(): IncidentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      return data ? JSON.parse(data) : SAMPLE_INCIDENTS;
    } catch {
      return SAMPLE_INCIDENTS;
    }
  }

  public addIncident(incident: IncidentRecord): IncidentRecord {
    const list = this.getIncidents();
    const updated = [incident, ...list];
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));

    // Trigger an alert if Critical or High
    if (incident.severity === 'CRITICAL' || incident.severity === 'HIGH') {
      this.addAlert({
        id: `ALT-${Date.now().toString().slice(-4)}`,
        title: `${incident.severity}: ${incident.title}`,
        message: `New ${incident.category} incident reported in ${incident.location.areaName}. Priority Score: ${incident.priorityScore}/100`,
        type: incident.source === 'FUSION' ? 'FUSED_ALERT' : 'CRITICAL_DEBRIS',
        severity: incident.severity,
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedIncidentId: incident.id
      });
    }

    this.notifyListeners();
    return incident;
  }

  public updateIncidentStatus(incidentId: string, status: IncidentRecord['status'], note?: string) {
    const list = this.getIncidents();
    const updated = list.map(inc => {
      if (inc.id === incidentId) {
        const notes = note ? [note, ...inc.notes] : inc.notes;
        return {
          ...inc,
          status,
          updatedDate: new Date().toISOString(),
          notes
        };
      }
      return inc;
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public assignIncident(incidentId: string, team: string, vessel: string) {
    const list = this.getIncidents();
    const updated = list.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'ASSIGNED' as const,
          assignedTeam: team,
          assignedVessel: vessel,
          updatedDate: new Date().toISOString(),
          notes: [`Assigned to ${team} (${vessel}) by ${this.getCurrentUser().name}`, ...inc.notes]
        };
      }
      return inc;
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- Cleanup Missions ---
  public getMissions(): CleanupMission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
      return data ? JSON.parse(data) : SAMPLE_CLEANUP_MISSIONS;
    } catch {
      return SAMPLE_CLEANUP_MISSIONS;
    }
  }

  public addMission(mission: CleanupMission): CleanupMission {
    const list = this.getMissions();
    const updated = [mission, ...list];
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
    this.notifyListeners();
    return mission;
  }

  public completeMission(missionId: string, debrisKg: number, highRiskCount: number, afterPhoto?: string) {
    const list = this.getMissions();
    const updated = list.map(m => {
      if (m.id === missionId) {
        return {
          ...m,
          status: 'COMPLETED' as const,
          debrisCollectedKg: (m.debrisCollectedKg || 0) + debrisKg,
          highRiskResolvedCount: (m.highRiskResolvedCount || 0) + highRiskCount,
          completedDate: new Date().toISOString(),
          afterPhoto: afterPhoto || m.afterPhoto
        };
      }
      return m;
    });
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- Drone Missions ---
  public getDroneMissions(): DroneMission[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRONES);
      return data ? JSON.parse(data) : SAMPLE_DRONE_MISSIONS;
    } catch {
      return SAMPLE_DRONE_MISSIONS;
    }
  }

  // --- Hotspots ---
  public getHotspots(): HotspotRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOTSPOTS);
      return data ? JSON.parse(data) : SAMPLE_HOTSPOTS;
    } catch {
      return SAMPLE_HOTSPOTS;
    }
  }

  // --- Models & Datasets ---
  public getAIModels(): AIModelRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODELS);
      return data ? JSON.parse(data) : SAMPLE_AI_MODELS;
    } catch {
      return SAMPLE_AI_MODELS;
    }
  }

  public updateModelStatus(modelId: string, status: AIModelRecord['status']) {
    const list = this.getAIModels();
    const updated = list.map(m => m.id === modelId ? { ...m, status } : m);
    localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public getDatasets(): DatasetRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DATASETS);
      return data ? JSON.parse(data) : SAMPLE_DATASETS;
    } catch {
      return SAMPLE_DATASETS;
    }
  }

  // --- Alerts ---
  public getAlerts(): AlertRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      return data ? JSON.parse(data) : SAMPLE_ALERTS;
    } catch {
      return SAMPLE_ALERTS;
    }
  }

  public addAlert(alert: AlertRecord) {
    const list = this.getAlerts();
    const updated = [alert, ...list];
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public markAlertRead(alertId: string) {
    const list = this.getAlerts();
    const updated = list.map(a => a.id === alertId ? { ...a, isRead: true } : a);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public markAllAlertsRead() {
    const list = this.getAlerts();
    const updated = list.map(a => ({ ...a, isRead: true }));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public acknowledgeAlert(id: string) {
    this.markAlertRead(id);
  }

  public addIncidentNote(incidentId: string, note: string) {
    const list = this.getIncidents();
    const updated = list.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          notes: [note, ...inc.notes],
          updatedDate: new Date().toISOString()
        };
      }
      return inc;
    });
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public updateMissionStatus(missionId: string, status: CleanupMission['status']) {
    const list = this.getMissions();
    const updated = list.map(m => m.id === missionId ? { ...m, status } : m);
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- Live Stream ---
  public getLiveStream(): LiveStreamEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIVE_STREAM);
      return data ? JSON.parse(data) : INITIAL_LIVE_STREAM;
    } catch {
      return INITIAL_LIVE_STREAM;
    }
  }

  public addLiveEvent(event: LiveStreamEvent) {
    const list = this.getLiveStream();
    const updated = [event, ...list].slice(0, 20); // keep last 20
    localStorage.setItem(STORAGE_KEYS.LIVE_STREAM, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- Sensor Simulator Trigger ---
  public triggerSimulationScan(type: 'SONAR' | 'DRONE' | 'CAMERA' | 'GPS' | 'FUSION'): DetectionRecord {
    const idNum = Math.floor(1080 + Math.random() * 8000);
    const catMap: Record<string, string[]> = {
      SONAR: ['Ghost Fishing Gear', 'Derelict Crab Pot', 'Tire', 'Metal Debris'],
      DRONE: ['Plastic', 'Bottle', 'Can', 'Floating Debris'],
      CAMERA: ['Fishing Net', 'Fishing Line', 'Plastic'],
      GPS: ['Marine Anomaly', 'Unknown Debris'],
      FUSION: ['Ghost Fishing Gear', 'Plastic']
    };

    const choices = catMap[type] || ['Plastic'];
    const category = choices[Math.floor(Math.random() * choices.length)] as any;
    const confidence = Number((0.84 + Math.random() * 0.14).toFixed(2));
    const severity = confidence > 0.92 ? 'CRITICAL' : confidence > 0.85 ? 'HIGH' : 'MEDIUM';

    const newDetection: DetectionRecord = {
      id: `GV-${idNum}`,
      title: `Simulated ${type} Detection #${idNum}`,
      category,
      source: type === 'GPS' ? 'CAMERA' : type,
      confidence,
      qualityScore: Math.floor(82 + Math.random() * 16),
      severity,
      location: {
        lat: Number((10.9400 + Math.random() * 0.035).toFixed(4)),
        lng: Number((78.0650 + Math.random() * 0.030).toFixed(4)),
        depthMeters: type === 'SONAR' ? Number((18 + Math.random() * 20).toFixed(1)) : 0,
        sector: `Sector ${Math.floor(1 + Math.random() * 5)}`,
        areaName: `Live Simulator Scan Grid ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`
      },
      timestamp: new Date().toISOString(),
      imageUrl: type === 'SONAR' 
        ? 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
      status: 'Unverified',
      boundingBoxes: [
        { x: 100 + Math.floor(Math.random() * 150), y: 90 + Math.floor(Math.random() * 120), width: 180, height: 150, label: `${category} (${Math.round(confidence * 100)}%)`, confidence }
      ],
      estimatedDimensions: `${(1.5 + Math.random() * 8).toFixed(1)}m x ${(1.0 + Math.random() * 4).toFixed(1)}m`,
      estimatedWeightKg: Math.floor(30 + Math.random() * 250),
      aiExplanation: `Simulated real-time sensor ingestion event from ${type} telemetry channel. Acoustic/optical confidence computed at ${Math.round(confidence * 100)}%.`,
      isDemo: true
    };

    return this.addDetection(newDetection);
  }
}

export const marineStorage = new MarineStorageService();
