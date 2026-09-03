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
  REGISTERED_USERS: 'gv_registered_users',
  IS_LOGGED_IN: 'gv_is_logged_in',
  AUTH_TOKEN: 'gv_auth_token',
  DEMO_MODE: 'gv_demo_mode'
};

export const DEFAULT_ACCOUNTS: (UserProfile & { password: string; clearance: string })[] = [
  {
    id: 'usr-admin-01',
    name: 'Dr. Aris Thorne',
    email: 'admin@marinesight.ai',
    password: 'admin123',
    role: 'ADMIN',
    organization: 'Marine Directorate & AI Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    clearance: 'Level 5 (Super Administrator)',
    status: 'ACTIVE',
    phone: '+1 (555) 839-2041'
  },
  {
    id: 'usr-op-02',
    name: 'Elena Rostova',
    email: 'operator@marinesight.ai',
    password: 'operator123',
    role: 'MARINE_OPERATOR',
    organization: 'Coastal Drone Patrol Command',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    clearance: 'Level 4 (Fleet Operator)',
    status: 'ACTIVE',
    phone: '+1 (555) 492-1188'
  },
  {
    id: 'usr-res-03',
    name: 'Dr. Marcus Vance',
    email: 'researcher@marinesight.ai',
    password: 'researcher123',
    role: 'RESEARCHER',
    organization: 'Oceanographic Research Institute',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    clearance: 'Level 3 (Scientific Analyst)',
    status: 'ACTIVE',
    phone: '+1 (555) 774-9023'
  },
  {
    id: 'usr-cln-04',
    name: 'Sarah Chen',
    email: 'cleanup@marinesight.ai',
    password: 'cleanup123',
    role: 'CLEANUP_TEAM',
    organization: 'Marine Salvage Rapid Response',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    clearance: 'Level 3 (Response Squad Lead)',
    status: 'ACTIVE',
    phone: '+1 (555) 321-4470'
  },
  {
    id: 'usr-view-05',
    name: 'Guest Observer',
    email: 'viewer@marinesight.ai',
    password: 'viewer123',
    role: 'VIEWER',
    organization: 'Public Marine Sanctuary Portal',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    clearance: 'Level 1 (Public Observer)',
    status: 'ACTIVE',
    phone: '+1 (555) 100-0000'
  }
];

class MarineStorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaults();
  }

  public initDefaults(force = false) {
    const existingDetections = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
    const hasLegacyPredefined = existingDetections && (
      existingDetections.includes('GV-1024') || 
      existingDetections.includes('INC-9042') || 
      existingDetections.includes('MSN-201')
    );

    if (force || hasLegacyPredefined || !localStorage.getItem(STORAGE_KEYS.DETECTIONS)) {
      localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DRONES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(SAMPLE_AI_MODELS));
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(SAMPLE_DATASETS));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LIVE_STREAM, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_ACCOUNTS[0]));
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `ms_tok_${Date.now()}`);
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'false');
      this.notifyListeners();
    } else if (!localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    }
  }

  public clearAllData() {
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DRONES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LIVE_STREAM, JSON.stringify([]));
    this.notifyListeners();
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

  // --- Authentication & Accounts ---
  public isLoggedIn(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return val === 'true';
    } catch {
      return true;
    }
  }

  public getRegisteredUsers(): (UserProfile & { password?: string; clearance?: string })[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (!data) return DEFAULT_ACCOUNTS;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  }

  public getCurrentUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_ACCOUNTS[0];
    } catch {
      return DEFAULT_ACCOUNTS[0];
    }
  }

  public setCurrentUser(user: UserProfile) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    this.notifyListeners();
  }

  public login(email: string, password?: string): { success: boolean; user?: UserProfile; message: string } {
    const users = this.getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    // Find matched account
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      // If it's a new email without registration, allow quick login if password is provided
      if (cleanPass.length >= 4) {
        const newUser: UserProfile & { password: string; clearance: string } = {
          id: `usr-${Date.now().toString().slice(-4)}`,
          name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: cleanEmail,
          password: cleanPass,
          role: 'MARINE_OPERATOR',
          organization: 'MarineSight AI Coastal Fleet',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          clearance: 'Level 3 (Operational Field Operator)',
          status: 'ACTIVE',
          token: `ms_tok_${Date.now()}`,
          lastLogin: new Date().toISOString()
        };
        const updatedUsers = [...users, newUser];
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));
        this.setCurrentUser(newUser);
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        this.notifyListeners();
        return { success: true, user: newUser, message: `Account created and signed in as ${newUser.name}!` };
      }
      return { success: false, message: 'Account not found. Please check your email or create an account.' };
    }

    // Check password if set
    if (matched.password && cleanPass && matched.password !== cleanPass) {
      return { success: false, message: 'Invalid password. Please verify your credentials or use a demo account.' };
    }

    const updatedUser: UserProfile = {
      ...matched,
      token: `ms_tok_${Date.now()}`,
      lastLogin: new Date().toISOString(),
      status: 'ACTIVE'
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, updatedUser.token || '');
    this.notifyListeners();

    return { success: true, user: updatedUser, message: `Welcome back, ${updatedUser.name}!` };
  }

  public register(accountData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    organization?: string;
    phone?: string;
    avatarUrl?: string;
  }): { success: boolean; user?: UserProfile; message: string } {
    const users = this.getRegisteredUsers();
    const cleanEmail = accountData.email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const newUser: UserProfile & { password: string; clearance: string } = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: accountData.name.trim(),
      email: cleanEmail,
      password: accountData.password,
      role: accountData.role,
      organization: accountData.organization?.trim() || 'MarineSight AI Environmental Operations',
      avatarUrl: accountData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: accountData.phone?.trim() || '+1 (555) 000-0000',
      clearance: accountData.role === 'ADMIN' ? 'Level 5 (Super Administrator)' : accountData.role === 'MARINE_OPERATOR' ? 'Level 4 (Fleet Operator)' : 'Level 3 (Standard Clearance)',
      status: 'ACTIVE',
      token: `ms_tok_${Date.now()}`,
      lastLogin: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newUser.token || '');
    this.notifyListeners();

    return { success: true, user: newUser, message: `Account created successfully for ${newUser.name}!` };
  }

  public logout(): void {
    // Switch to Guest Observer mode
    const guest = DEFAULT_ACCOUNTS.find(u => u.role === 'VIEWER') || DEFAULT_ACCOUNTS[4];
    const guestUser: UserProfile = {
      ...guest,
      name: 'Guest User (Logged Out)',
      email: 'guest@marinesight.public',
      role: 'VIEWER',
      organization: 'MarineSight AI Public Viewer',
      status: 'OFFLINE'
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guestUser));
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    this.notifyListeners();
  }

  public updateProfile(updatedData: Partial<UserProfile>): UserProfile {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updatedData };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));

    // Update in registered users list as well
    const users = this.getRegisteredUsers();
    const updatedUsers = users.map(u => u.id === updated.id ? { ...u, ...updated } : u);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));

    this.notifyListeners();
    return updated;
  }

  public deleteUser(userId: string) {
    const users = this.getRegisteredUsers();
    const updated = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updated));
    this.notifyListeners();
  }

  public switchRole(role: UserRole) {
    const users = this.getRegisteredUsers();
    const matched = users.find(u => u.role === role) || DEFAULT_ACCOUNTS.find(u => u.role === role);
    if (matched) {
      this.setCurrentUser(matched);
    } else {
      const user: UserProfile = {
        id: `usr-${role.toLowerCase()}`,
        name: `${role.replace('_', ' ')} Operator`,
        email: `${role.toLowerCase()}@marinesight.demo`,
        role: role,
        organization: 'MarineSight AI Marine Network'
      };
      this.setCurrentUser(user);
    }
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
