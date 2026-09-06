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
import { cryptoVault } from './cryptoVault';

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

  public isEmailRegistered(email: string): boolean {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    return users.some(u => u.email.toLowerCase() === cleanEmail);
  }

  public getUserByEmail(email: string): (UserProfile & { clearance?: string }) | null {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) return null;
    const { password, ...safeUser } = found;
    return safeUser as UserProfile;
  }

  public login(email: string, password?: string): { success: boolean; notRegistered?: boolean; user?: UserProfile; message: string } {
    const users = this.getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    // 1. Check if email exists in database
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matched) {
      return { 
        success: false, 
        notRegistered: true,
        message: `Email "${cleanEmail}" is not registered. Please create a new account.` 
      };
    }

    // 2. Validate password
    if (!cleanPass) {
      return {
        success: false,
        notRegistered: false,
        message: 'Please enter your password.'
      };
    }

    // Check with encrypted hash & legacy fallback
    const isPasswordValid = cryptoVault.verifyPassword(cleanPass, matched.password || '', cleanEmail);
    if (!isPasswordValid) {
      return { 
        success: false, 
        notRegistered: false,
        message: 'Invalid password. Please enter the password you created for this account.' 
      };
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
    const cleanName = accountData.name.trim();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: `An account with "${cleanEmail}" already exists. Please sign in with your password.` };
    }

    // High-security cryptographic password hashing (SHA-256 + email salt)
    const hashedPassword = cryptoVault.hashPassword(accountData.password, cleanEmail);

    const newUser: UserProfile & { password: string; clearance: string } = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: accountData.role,
      organization: accountData.organization?.trim() || 'MarineSight AI Environmental Operations',
      avatarUrl: accountData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: cryptoVault.encryptField(accountData.phone?.trim() || '+1 (555) 000-0000'),
      clearance: accountData.role === 'ADMIN' 
        ? 'Level 5 (Super Administrator)' 
        : accountData.role === 'MARINE_OPERATOR' 
        ? 'Level 4 (Fleet Operator)' 
        : accountData.role === 'RESEARCHER'
        ? 'Level 3 (Oceanographer & Acoustic Analyst)'
        : accountData.role === 'CLEANUP_TEAM'
        ? 'Level 3 (Salvage Squad Commander)'
        : 'Level 1 (Public Observer)',
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

    return { success: true, user: newUser, message: `Encrypted account created successfully for ${newUser.name}!` };
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
      const list: DetectionRecord[] = data ? JSON.parse(data) : SAMPLE_DETECTIONS;
      if (!Array.isArray(list)) return SAMPLE_DETECTIONS;

      const seen = new Set<string>();
      const deduped: DetectionRecord[] = [];
      let hadDuplicates = false;

      for (const d of list) {
        if (!d || typeof d !== 'object') continue;
        const item: DetectionRecord = { ...d };
        if (!item.id || seen.has(item.id)) {
          hadDuplicates = true;
          item.id = `GV-${item.id || 'DET'}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(item.id);
        deduped.push(item);
      }

      if (hadDuplicates && data) {
        localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return SAMPLE_DETECTIONS;
    }
  }

  public addDetection(detection: DetectionRecord): DetectionRecord {
    const list = this.getDetections();
    const finalDet: DetectionRecord = { ...detection };
    if (!finalDet.id) {
      finalDet.id = `GV-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    }
    // Remove any existing item with the same ID to prevent duplication
    const filtered = list.filter(d => d.id !== finalDet.id);
    const updated = [finalDet, ...filtered];
    localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(updated));

    // Also push to live stream with guaranteed unique ID
    this.addLiveEvent({
      id: `LIVE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toTimeString().split(' ')[0],
      source: finalDet.source,
      category: finalDet.category,
      confidence: finalDet.confidence,
      location: finalDet.location?.sector || finalDet.location?.areaName || 'Sector Grid',
      severity: finalDet.severity
    });

    this.notifyListeners();
    return finalDet;
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
      const list: IncidentRecord[] = data ? JSON.parse(data) : SAMPLE_INCIDENTS;
      if (!Array.isArray(list)) return SAMPLE_INCIDENTS;

      const seen = new Set<string>();
      const deduped: IncidentRecord[] = [];
      let hadDuplicates = false;

      for (const inc of list) {
        if (!inc || typeof inc !== 'object') continue;
        const item: IncidentRecord = { ...inc };
        if (!item.id || seen.has(item.id)) {
          hadDuplicates = true;
          item.id = `INC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(item.id);
        deduped.push(item);
      }

      if (hadDuplicates && data) {
        localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return SAMPLE_INCIDENTS;
    }
  }

  public addIncident(incident: IncidentRecord): IncidentRecord {
    const list = this.getIncidents();
    const finalInc: IncidentRecord = { ...incident };
    if (!finalInc.id) {
      finalInc.id = `INC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    }
    const filtered = list.filter(i => i.id !== finalInc.id);
    const updated = [finalInc, ...filtered];
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));

    // Trigger an alert if Critical or High
    if (finalInc.severity === 'CRITICAL' || finalInc.severity === 'HIGH') {
      this.addAlert({
        id: `ALT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${finalInc.severity}: ${finalInc.title}`,
        message: `New ${finalInc.category} incident reported in ${finalInc.location.areaName}. Priority Score: ${finalInc.priorityScore}/100`,
        type: finalInc.source === 'FUSION' ? 'FUSED_ALERT' : 'CRITICAL_DEBRIS',
        severity: finalInc.severity,
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedIncidentId: finalInc.id
      });
    }

    this.notifyListeners();
    return finalInc;
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
      const list: CleanupMission[] = data ? JSON.parse(data) : SAMPLE_CLEANUP_MISSIONS;
      if (!Array.isArray(list)) return SAMPLE_CLEANUP_MISSIONS;

      const seen = new Set<string>();
      const deduped: CleanupMission[] = [];
      let hadDuplicates = false;

      for (const m of list) {
        if (!m || typeof m !== 'object') continue;
        const item: CleanupMission = { ...m };
        if (!item.id || seen.has(item.id)) {
          hadDuplicates = true;
          item.id = `MSN-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(item.id);
        deduped.push(item);
      }

      if (hadDuplicates && data) {
        localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return SAMPLE_CLEANUP_MISSIONS;
    }
  }

  public addMission(mission: CleanupMission): CleanupMission {
    const list = this.getMissions();
    const finalMission: CleanupMission = { ...mission };
    if (!finalMission.id) {
      finalMission.id = `MSN-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    }
    const filtered = list.filter(m => m.id !== finalMission.id);
    const updated = [finalMission, ...filtered];
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(updated));
    this.notifyListeners();
    return finalMission;
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

  public saveDatasets(datasets: DatasetRecord[]) {
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
    this.notifyListeners();
  }

  public addDataset(dataset: DatasetRecord): DatasetRecord {
    const list = this.getDatasets();
    const updated = [dataset, ...list];
    this.saveDatasets(updated);
    return dataset;
  }

  public addDatasetBatch(
    datasetId: string, 
    batchData: {
      batchName: string;
      sampleCount: number;
      annotationsCount: number;
      format: string;
      classes: string[];
      sensorType: string;
      notes?: string;
    }
  ): DatasetRecord {
    const list = this.getDatasets();
    const existing = list.find(d => d.id === datasetId);
    if (existing) {
      const updatedList = list.map(d => {
        if (d.id === datasetId) {
          const newFormats = Array.from(new Set([...(d.formats || []), batchData.format]));
          return {
            ...d,
            imagesCount: (d.imagesCount || 0) + batchData.sampleCount,
            annotationsCount: (d.annotationsCount || 0) + batchData.annotationsCount,
            classesCount: Math.max(d.classesCount || 0, batchData.classes.length),
            lastUpdated: new Date().toISOString().split('T')[0],
            formats: newFormats
          };
        }
        return d;
      });
      this.saveDatasets(updatedList);
      return updatedList.find(d => d.id === datasetId)!;
    } else {
      const newDs: DatasetRecord = {
        id: datasetId,
        name: batchData.batchName,
        version: 'v1.0',
        type: (batchData.sensorType.includes('SONAR') 
          ? 'SONAR_ACOUSTIC' 
          : batchData.sensorType.includes('SURFACE') 
            ? 'SURFACE_AERIAL' 
            : 'UNDERWATER_OPTICAL') as any,
        imagesCount: batchData.sampleCount,
        annotationsCount: batchData.annotationsCount,
        classesCount: batchData.classes.length || 5,
        trainValTestSplit: '70% / 15% / 15%',
        qualityScore: 95,
        lastUpdated: new Date().toISOString().split('T')[0],
        formats: [batchData.format]
      };
      const updated = [newDs, ...list];
      this.saveDatasets(updated);
      return newDs;
    }
  }

  // --- Alerts ---
  public getAlerts(): AlertRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
      const list: AlertRecord[] = data ? JSON.parse(data) : SAMPLE_ALERTS;
      if (!Array.isArray(list)) return SAMPLE_ALERTS;

      const seen = new Set<string>();
      const deduped: AlertRecord[] = [];
      let hadDuplicates = false;

      for (const a of list) {
        if (!a || typeof a !== 'object') continue;
        const item: AlertRecord = { ...a };
        if (!item.id || seen.has(item.id)) {
          hadDuplicates = true;
          item.id = `ALT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        }
        seen.add(item.id);
        deduped.push(item);
      }

      if (hadDuplicates && data) {
        localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return SAMPLE_ALERTS;
    }
  }

  public addAlert(alert: AlertRecord) {
    const list = this.getAlerts();
    const finalAlert: AlertRecord = { ...alert };
    if (!finalAlert.id) {
      finalAlert.id = `ALT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
    }
    const filtered = list.filter(a => a.id !== finalAlert.id);
    const updated = [finalAlert, ...filtered];
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
      const list: LiveStreamEvent[] = data ? JSON.parse(data) : INITIAL_LIVE_STREAM;
      if (!Array.isArray(list)) return INITIAL_LIVE_STREAM;

      const seen = new Set<string>();
      const deduped: LiveStreamEvent[] = [];
      let hadDuplicates = false;

      for (const ev of list) {
        if (!ev || typeof ev !== 'object') continue;
        const item: LiveStreamEvent = { ...ev };
        if (!item.id || seen.has(item.id)) {
          hadDuplicates = true;
          item.id = `LIVE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        }
        seen.add(item.id);
        deduped.push(item);
      }

      if (hadDuplicates && data) {
        localStorage.setItem(STORAGE_KEYS.LIVE_STREAM, JSON.stringify(deduped));
      }
      return deduped;
    } catch {
      return INITIAL_LIVE_STREAM;
    }
  }

  public addLiveEvent(event: LiveStreamEvent) {
    const list = this.getLiveStream();
    const finalEvent: LiveStreamEvent = { ...event };
    if (!finalEvent.id) {
      finalEvent.id = `LIVE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    }
    const filtered = list.filter(e => e.id !== finalEvent.id);
    const updated = [finalEvent, ...filtered].slice(0, 20); // keep last 20
    localStorage.setItem(STORAGE_KEYS.LIVE_STREAM, JSON.stringify(updated));
    this.notifyListeners();
  }

  // --- Sensor Simulator Trigger ---
  public triggerSimulationScan(type: 'SONAR' | 'DRONE' | 'CAMERA' | 'GPS' | 'FUSION'): DetectionRecord {
    const idNum = `${Date.now().toString(36)}-${Math.floor(1000 + Math.random() * 9000)}`;
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
export const storageService = marineStorage;
