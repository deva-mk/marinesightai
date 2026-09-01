import React from 'react';
import { 
  LayoutDashboard, 
  Radar, 
  Eye, 
  Video, 
  Layers, 
  MapPin, 
  TrendingUp, 
  History, 
  BarChart3, 
  AlertTriangle, 
  Ship, 
  Plane, 
  Bell, 
  Database, 
  Cpu, 
  FileText, 
  Users, 
  Settings,
  X,
  Sparkles,
  Waves,
  Key,
  ShieldCheck,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../../types';
import { marineStorage } from '../../services/storage';

interface SidebarProps {
  activeTab?: string;
  activeView?: string;
  onSelectTab?: (tab: string) => void;
  setActiveView?: (view: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  userRole?: UserRole;
  unreadAlertsCount?: number;
  incidentsCount?: number;
  missionsCount?: number;
  counts?: {
    activeIncidents?: number;
    activeMissions?: number;
    unreadAlerts?: number;
  };
}

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles?: UserRole[];
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  activeView,
  onSelectTab,
  setActiveView,
  collapsed = false,
  onToggleCollapse,
  isOpenMobile,
  mobileOpen,
  onCloseMobile,
  userRole = 'ADMIN',
  unreadAlertsCount = 0,
  incidentsCount = 0,
  missionsCount = 0,
  counts
}) => {
  const currentActive = activeView || activeTab || 'dashboard';
  const isMobileOpen = Boolean(isOpenMobile ?? mobileOpen);
  const currentUser = marineStorage.getCurrentUser();
  const isLoggedIn = marineStorage.isLoggedIn() && currentUser.email !== 'guest@marinesight.public';

  const activeIncidents = counts?.activeIncidents ?? incidentsCount ?? 0;
  const activeMissions = counts?.activeMissions ?? missionsCount ?? 0;
  const unreadAlerts = counts?.unreadAlerts ?? unreadAlertsCount ?? 0;

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Marine Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'DETECTION PIPELINES',
      items: [
        { id: 'sonar', label: 'Sonar Intelligence', icon: Radar },
        { id: 'surface', label: 'Surface Vision', icon: Eye },
        { id: 'live', label: 'Live Monitoring', icon: Video, badge: 'REALTIME' },
        { id: 'fusion', label: 'Multimodal Fusion', icon: Layers, badge: 'AI', badgeColor: 'bg-[#FF6F59] text-white' }
      ]
    },
    {
      title: 'INTELLIGENCE & MAPS',
      items: [
        { id: 'hotspots', label: 'Pollution Hotspots', icon: MapPin },
        { id: 'risk', label: 'Risk Prediction', icon: TrendingUp },
        { id: 'history', label: 'Detection Timeline', icon: History },
        { id: 'analytics', label: 'Marine Analytics', icon: BarChart3 }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'incidents', label: 'Incident Command', icon: AlertTriangle, badge: activeIncidents > 0 ? activeIncidents : undefined, badgeColor: 'bg-[#FF6F59] text-white' },
        { id: 'cleanup', label: 'Cleanup Missions', icon: Ship, badge: activeMissions > 0 ? activeMissions : undefined, badgeColor: 'bg-[#4F6F52] text-white' },
        { id: 'drones', label: 'Drone Missions', icon: Plane },
        { id: 'alerts', label: 'Alerts Center', icon: Bell, badge: unreadAlerts > 0 ? unreadAlerts : undefined, badgeColor: 'bg-[#FF6F59] text-white' }
      ]
    },
    {
      title: 'AI PLATFORM',
      items: [
        { id: 'datasets', label: 'Dataset Lab', icon: Database },
        { id: 'models', label: 'Model Registry', icon: Cpu }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'reports', label: 'Reports & Exports', icon: FileText }
      ]
    },
    {
      title: 'ACCOUNT & SECURITY',
      items: [
        { id: 'auth', label: isLoggedIn ? 'Account & Profile' : 'Login / Register', icon: Key, badge: isLoggedIn ? 'ACTIVE' : 'GUEST', badgeColor: isLoggedIn ? 'bg-[#4F6F52] text-white' : 'bg-[#FF6F59] text-white' },
        { id: 'users', label: 'Team & Roles', icon: Users, allowedRoles: ['ADMIN'] },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    }
  ];

  const handleSelect = (viewId: string) => {
    if (setActiveView) setActiveView(viewId);
    if (onSelectTab) onSelectTab(viewId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    marineStorage.logout();
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSelect('auth');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#F2EDE4] border-r border-[#E3DBD0] flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        
        {/* Header on mobile */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-[#E3DBD0]">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-[#FF6F59]" />
            <span className="font-extrabold text-sm tracking-tight text-[#2A2A2A]">MARINESIGHT AI</span>
          </div>
          <button onClick={onCloseMobile} className="p-1 rounded-lg hover:bg-[#E3DBD0]">
            <X className="w-5 h-5 text-[#5C5449]" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(item => 
              !item.allowedRoles || (item.allowedRoles as string[]).includes(userRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-extrabold text-[#8C8275] tracking-wider uppercase mb-1.5">
                  {section.title}
                </p>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentActive === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left
                        ${isActive 
                          ? 'bg-[#FF6F59] text-white shadow-sm shadow-[#FF6F59]/30 font-bold' 
                          : 'text-[#5C5449] hover:bg-[#EAE4D9] hover:text-[#2A2A2A]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#736B5E]'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${item.badgeColor || 'bg-[#4F6F52] text-white'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User Account Session Card with Logout/Login Trigger */}
        <div className="p-3 border-t border-[#E3DBD0] bg-[#ECE5D8]/80 m-2 rounded-2xl">
          <div 
            onClick={() => handleSelect('auth')}
            className="flex items-center justify-between gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt="" 
                className="w-8 h-8 rounded-xl object-cover border border-[#D5CCBE] shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-[#2A2A2A] truncate leading-tight group-hover:text-[#FF6F59] transition-colors">
                    {currentUser.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-[#4F6F52]' : 'bg-amber-500'}`} />
                  <p className="text-[10px] font-semibold text-[#736B5E] uppercase truncate">
                    {isLoggedIn ? currentUser.role.replace('_', ' ') : 'Guest Mode'}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout / Login Action Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title="Log Out of Account"
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                title="Sign In to Account"
                className="p-1.5 rounded-lg text-[#FF6F59] hover:bg-[#FF6F59]/10 transition-colors shrink-0"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};
