import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { SensorSimulatorModal } from './components/common/SensorSimulatorModal';
import { GhostVisionCopilotModal } from './components/common/GhostVisionCopilotModal';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './components/landing/LandingPage';
import { CustomCursor } from './components/common/CustomCursor';
import { HeyneshTicker } from './components/common/HeyneshTicker';

// Feature Views
import { MainOverviewDashboard } from './features/dashboard/MainOverviewDashboard';
import { SonarIntelligence } from './features/sonar/SonarIntelligence';
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
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLanding) {
    return (
      <LandingPage
        onEnterApp={() => setIsLanding(false)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />
    );
  }

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-[#0C0D0E] text-[#F3F3F3] flex flex-col font-sans selection:bg-[#FFFF23] selection:text-black">
      {/* Heynesh.com Custom Smooth Magnetic Cursor */}
      <CustomCursor />
      
      <div className="flex flex-1 relative overflow-hidden">
        
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
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#0C0D0E]">
          
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
              <DatasetLab />
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

