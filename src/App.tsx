import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SensorSimulatorModal } from './components/common/SensorSimulatorModal';
import { GhostVisionCopilotModal } from './components/common/GhostVisionCopilotModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { PreLoginOceanExperience } from './components/landing/PreLoginOceanExperience';
import { CustomCursor } from './components/common/CustomCursor';
import { HeyneshTicker } from './components/common/HeyneshTicker';
import { LiveWallpaper } from './components/common/LiveWallpaper';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

// Feature Views
import { MainOverviewDashboard } from './features/dashboard/MainOverviewDashboard';
import { SonarIntelligence } from './features/sonar/SonarIntelligence';
import { SonarPS57WinningSuite } from './features/sonar/SonarPS57WinningSuite';
import { SurfaceVision } from './features/surface/SurfaceVision';
import { LiveSurfaceMonitoring } from './features/surface/LiveSurfaceMonitoring';
import { MultimodalFusion } from './features/fusion/MultimodalFusion';
import { HotspotMap } from './features/maps/HotspotMap';
import { RiskPrediction } from './features/intelligence/RiskPrediction';
import { DetectionHistory } from './features/intelligence/DetectionHistory';
import { IncidentCommand } from './features/operations/IncidentCommand';
import { CleanupOperations } from './features/operations/CleanupOperations';
import { DroneMissions } from './features/operations/DroneMissions';
import { AlertsCenter } from './features/operations/AlertsCenter';
import { ModelRegistry } from './features/ai/ModelRegistry';
import { DatasetLab } from './features/ai/DatasetLab';
import { MarineAnalytics } from './features/analytics/MarineAnalytics';
import { ReportsCenter } from './features/reports/ReportsCenter';
import { UserManagement } from './features/admin/UserManagement';
import { SystemSettings } from './features/admin/SystemSettings';
import { AuthPage } from './features/auth/AuthPage';

// State Service
import { marineStorage } from './services/storage';
import { 
  DetectionRecord, 
  IncidentRecord, 
  CleanupMission, 
  LiveStreamEvent, 
  SystemAlert,
  UserProfile,
  HotspotRecord
} from './types';

export const App: React.FC = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [targetDetailId, setTargetDetailId] = useState<string | null>(null);
  const [isLanding, setIsLanding] = useState<boolean>(false);
  const [showOceanSimulation, setShowOceanSimulation] = useState<boolean>(() => {
    // Show on initial visit or if not logged in
    return !sessionStorage.getItem('marinesight_simulation_done');
  });

  // Modals & Drawers state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);
  const [copilotOpen, setCopilotOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Live Reactive Data State
  const [detections, setDetections] = useState<DetectionRecord[]>(marineStorage.getDetections());
  const [incidents, setIncidents] = useState<IncidentRecord[]>(marineStorage.getIncidents());
  const [missions, setMissions] = useState<CleanupMission[]>(marineStorage.getMissions());
  const [liveStream, setLiveStream] = useState<LiveStreamEvent[]>(marineStorage.getLiveStream());
  const [alerts, setAlerts] = useState<SystemAlert[]>(marineStorage.getAlerts());
  const [currentUser, setCurrentUser] = useState<UserProfile>(marineStorage.getCurrentUser());
  const [hotspots, setHotspots] = useState<HotspotRecord[]>(marineStorage.getHotspots());

  // Subscribe to storage updates
  useEffect(() => {
    const unsubscribe = marineStorage.subscribe(() => {
      setDetections(marineStorage.getDetections());
      setIncidents(marineStorage.getIncidents());
      setMissions(marineStorage.getMissions());
      setLiveStream(marineStorage.getLiveStream());
      setAlerts(marineStorage.getAlerts());
      setCurrentUser(marineStorage.getCurrentUser());
      setHotspots(marineStorage.getHotspots());
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (tab: string, targetId?: string) => {
    setActiveTab(tab);
    setTargetDetailId(targetId || null);
    setIsLanding(false);
    setShowOceanSimulation(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-login realistic underwater ocean cleanup simulation
  if (showOceanSimulation) {
    return (
      <PreLoginOceanExperience
        onCompleteLogin={(role) => {
          sessionStorage.setItem('marinesight_simulation_done', 'true');
          setShowOceanSimulation(false);
          setIsLanding(false);
          setActiveTab('dashboard');
        }}
        onSkipDirectlyToApp={() => {
          sessionStorage.setItem('marinesight_simulation_done', 'true');
          setShowOceanSimulation(false);
        }}
      />
    );
  }

  if (isLanding) {
    return (
      <div className="relative min-h-screen bg-[#0C0D0E]">
        <LiveWallpaper />
        <LandingPage
          onEnterApp={() => setIsLanding(false)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
      </div>
    );
  }

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  // RBAC Allowed tabs per role
  const ROLE_ALLOWED_TABS: Record<string, string[]> = {
    ADMIN: [
      'dashboard', 'sonar', 'ps57', 'surface', 'live', 'fusion', 
      'hotspots', 'risk', 'history', 'analytics', 'incidents', 
      'cleanup', 'drones', 'alerts', 'models', 'datasets', 
      'reports', 'auth', 'login', 'users', 'settings'
    ],
    MARINE_OPERATOR: [
      'dashboard', 'surface', 'live', 'fusion', 'hotspots', 
      'risk', 'history', 'incidents', 'cleanup', 'drones', 
      'alerts', 'analytics', 'reports', 'auth', 'login'
    ],
    RESEARCHER: [
      'dashboard', 'sonar', 'ps57', 'fusion', 'hotspots', 
      'risk', 'history', 'analytics', 'datasets', 'models', 
      'reports', 'auth', 'login'
    ],
    CLEANUP_TEAM: [
      'dashboard', 'incidents', 'cleanup', 'drones', 'alerts', 
      'hotspots', 'surface', 'reports', 'auth', 'login'
    ],
    VIEWER: [
      'dashboard', 'hotspots', 'analytics', 'reports', 'auth', 'login'
    ]
  };

  const isTabAllowedForRole = ROLE_ALLOWED_TABS[currentUser.role]?.includes(activeTab) ?? true;

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F3F3F3] flex flex-col font-sans selection:bg-[#FFFF23] selection:text-black relative">
      {/* 60FPS Live Ocean Wallpaper Background */}
      <LiveWallpaper />

      {/* Heynesh.com Custom Smooth Magnetic Cursor */}
      <CustomCursor />
      
      <div className="flex flex-1 relative overflow-hidden z-10">
        
        {/* Responsive Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => handleNavigate(tab)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          unreadAlertsCount={unreadAlertsCount}
          incidentsCount={incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length}
          missionsCount={missions.filter(m => m.status === 'ACTIVE').length}
          userRole={currentUser.role}
          onOpenOceanExperience={() => setShowOceanSimulation(true)}
        />

        {/* Main Content Area with translucent glass so Live Wallpaper shines through */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#0C0D0E]/40 backdrop-blur-xs">
          
          {/* Header */}
          <Header
            currentUser={currentUser}
            unreadCount={unreadAlertsCount}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenSimulator={() => setSimulatorOpen(true)}
            onOpenCopilot={() => setCopilotOpen(true)}
            onOpenAuth={() => setAuthModalOpen(true)}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            setActiveView={(tab) => handleNavigate(tab)}
          />

          {/* Heynesh.com Signature Real-Time Marquee Ticker */}
          <HeyneshTicker
            detectionsCount={detections.length}
            incidentsCount={incidents.length}
            activeMissionsCount={missions.filter(m => m.status === 'ACTIVE').length}
          />

          {/* Main View Router */}
          <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
            {!isTabAllowedForRole ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-[#0F172A]/90 border border-red-500/30 text-center max-w-xl mx-auto my-12 backdrop-blur-md shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black bg-red-950 text-red-300 border border-red-700/50 uppercase tracking-wider">
                  SECURITY CLEARANCE ENFORCED
                </span>
                <h2 className="text-xl font-black text-white mt-3">Access Denied for Role</h2>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed font-mono">
                  Your active role [<strong className="text-[#FFFF23]">{currentUser.role.replace('_', ' ')}</strong>] does not have clearance to view module [<strong>{activeTab.toUpperCase()}</strong>].
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    Return to Marine Dashboard
                  </button>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FFFF23] hover:bg-[#e6e61f] text-xs font-black text-black transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Switch Role Clearance</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
            {activeTab === 'dashboard' && (
              <MainOverviewDashboard
                detections={detections}
                incidents={incidents}
                missions={missions}
                liveStream={liveStream}
                onNavigate={handleNavigate}
                onOpenSimulator={() => setSimulatorOpen(true)}
              />
            )}

            {activeTab === 'sonar' && (
              <SonarIntelligence
                detections={detections}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'ps57' && (
              <SonarPS57WinningSuite
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'surface' && (
              <SurfaceVision
                detections={detections}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'live' && (
              <LiveSurfaceMonitoring />
            )}

            {activeTab === 'fusion' && (
              <MultimodalFusion
                detections={detections}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'hotspots' && (
              <HotspotMap
                detections={detections}
                incidents={incidents}
                hotspots={hotspots}
                missions={missions}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'risk' && (
              <RiskPrediction />
            )}

            {activeTab === 'history' && (
              <DetectionHistory
                detections={detections}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'incidents' && (
              <IncidentCommand
                incidents={incidents}
                onNavigate={handleNavigate}
                targetIncidentId={targetDetailId}
              />
            )}

            {activeTab === 'cleanup' && (
              <CleanupOperations
                missions={missions}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'drones' && (
              <DroneMissions />
            )}

            {activeTab === 'alerts' && (
              <AlertsCenter
                alerts={alerts}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'models' && (
              <ModelRegistry onNavigate={handleNavigate} />
            )}

            {activeTab === 'datasets' && (
              <DatasetLab onNavigate={handleNavigate} />
            )}

            {activeTab === 'analytics' && (
              <MarineAnalytics
                detections={detections}
                missions={missions}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsCenter
                detections={detections}
                incidents={incidents}
                missions={missions}
              />
            )}

            {(activeTab === 'auth' || activeTab === 'login') && (
              <AuthPage onNavigate={handleNavigate} />
            )}

            {activeTab === 'users' && (
              <UserManagement />
            )}

            {activeTab === 'settings' && (
              <SystemSettings />
            )}
              </>
            )}
          </main>

        </div>
      </div>

      {/* Global Modals & Drawers */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        alerts={alerts}
        onNavigate={handleNavigate}
      />

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        detections={detections}
        incidents={incidents}
        missions={missions}
        hotspots={hotspots}
        onNavigate={handleNavigate}
        onSelectResult={(tab, id) => handleNavigate(tab, id)}
      />

      <SensorSimulatorModal
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />

      <GhostVisionCopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        incidents={incidents}
        detections={detections}
        missions={missions}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />

    </div>
  );
};

export default App;

