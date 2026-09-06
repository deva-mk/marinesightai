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
  onOpenOceanExperience?: () => void;
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
  onOpenOceanExperience,
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
      title: 'COMMAND',
      items: [
        { 
          id: 'dashboard', 
          label: 'Marine Dashboard', 
          icon: LayoutDashboard,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER', 'CLEANUP_TEAM', 'VIEWER']
        }
      ]
    },
    {
      title: 'DETECTION PIPELINES',
      items: [
        { 
          id: 'sonar', 
          label: 'Sonar Intelligence', 
          icon: Radar,
          allowedRoles: ['ADMIN', 'RESEARCHER']
        },
        { 
          id: 'ps57', 
          label: 'PS 57 Sonar Suite', 
          icon: Sparkles, 
          badge: 'WINNING PS57', 
          badgeColor: 'bg-[#FFFF23] text-black',
          allowedRoles: ['ADMIN', 'RESEARCHER']
        },
        { 
          id: 'surface', 
          label: 'Surface Vision', 
          icon: Eye,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'CLEANUP_TEAM']
        },
        { 
          id: 'live', 
          label: 'Live Monitoring', 
          icon: Video, 
          badge: 'REALTIME',
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR']
        },
        { 
          id: 'fusion', 
          label: 'Multimodal Fusion', 
          icon: Layers, 
          badge: 'AI', 
          badgeColor: 'bg-[#FFFF23] text-black',
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER']
        }
      ]
    },
    {
      title: 'MAPS & INTELLIGENCE',
      items: [
        { 
          id: 'hotspots', 
          label: 'Pollution Hotspots', 
          icon: MapPin,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER', 'CLEANUP_TEAM', 'VIEWER']
        },
        { 
          id: 'risk', 
          label: 'Risk Prediction', 
          icon: TrendingUp,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER']
        },
        { 
          id: 'history', 
          label: 'Detection Timeline', 
          icon: History,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER']
        },
        { 
          id: 'analytics', 
          label: 'Marine Analytics', 
          icon: BarChart3,
          allowedRoles: ['ADMIN', 'RESEARCHER', 'MARINE_OPERATOR', 'VIEWER']
        }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { 
          id: 'incidents', 
          label: 'Incident Command', 
          icon: AlertTriangle, 
          badge: activeIncidents > 0 ? activeIncidents : undefined, 
          badgeColor: 'bg-red-500 text-white',
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'CLEANUP_TEAM']
        },
        { 
          id: 'cleanup', 
          label: 'Cleanup Missions', 
          icon: Ship, 
          badge: activeMissions > 0 ? activeMissions : undefined, 
          badgeColor: 'bg-[#2DD4BF] text-black',
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'CLEANUP_TEAM']
        },
        { 
          id: 'drones', 
          label: 'Drone Missions', 
          icon: Plane,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'CLEANUP_TEAM']
        },
        { 
          id: 'alerts', 
          label: 'Alerts Center', 
          icon: Bell, 
          badge: unreadAlerts > 0 ? unreadAlerts : undefined, 
          badgeColor: 'bg-[#FFFF23] text-black',
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'CLEANUP_TEAM']
        }
      ]
    },
    {
      title: 'AI ENGINE',
      items: [
        { 
          id: 'datasets', 
          label: 'Dataset Lab', 
          icon: Database,
          allowedRoles: ['ADMIN', 'RESEARCHER']
        },
        { 
          id: 'models', 
          label: 'Model Registry', 
          icon: Cpu,
          allowedRoles: ['ADMIN', 'RESEARCHER']
        }
      ]
    },
    {
      title: 'REPORTS & DATA',
      items: [
        { 
          id: 'reports', 
          label: 'Reports & Exports', 
          icon: FileText,
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER', 'CLEANUP_TEAM', 'VIEWER']
        }
      ]
    },
    {
      title: 'AUTHENTICATION',
      items: [
        { 
          id: 'auth', 
          label: isLoggedIn ? 'Account & Profile' : 'Login / Register', 
          icon: Key, 
          badge: isLoggedIn ? 'ACTIVE' : 'GUEST', 
          badgeColor: isLoggedIn ? 'bg-[#2DD4BF] text-black' : 'bg-[#FFFF23] text-black',
          allowedRoles: ['ADMIN', 'MARINE_OPERATOR', 'RESEARCHER', 'CLEANUP_TEAM', 'VIEWER']
        },
        { 
          id: 'users', 
          label: 'Team & Roles', 
          icon: Users, 
          allowedRoles: ['ADMIN'] 
        },
        { 
          id: 'settings', 
          label: 'System Settings', 
          icon: Settings,
          allowedRoles: ['ADMIN']
        }
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container in Heynesh style */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0C0D0E]/80 backdrop-blur-xl border-r border-[#20232A]/70 flex flex-col transition-transform duration-200 ease-in-out text-white select-none
        lg:static lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        
        {/* Header on mobile */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-[#20232A]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFFF23] text-black flex items-center justify-center font-black">
              <Waves className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">MARINESIGHT AI</span>
          </div>
          <button onClick={onCloseMobile} className="p-1.5 rounded-lg hover:bg-[#1A1C22] text-stone-400 hover:text-white">
            <X className="w-5 h-5" />
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
                <p className="px-3 text-[10px] font-mono font-bold text-stone-500 tracking-wider uppercase mb-1.5">
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
                        w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left group
                        ${isActive 
                          ? 'bg-[#FFFF23] text-black font-extrabold shadow-[0_0_15px_rgba(255,255,35,0.35)]' 
                          : 'text-stone-400 hover:bg-[#141518] hover:text-white hover:translate-x-0.5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-black' : 'text-stone-400 group-hover:text-[#FFFF23]'}`} />
                        <span className="tracking-tight">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-black ${item.badgeColor || 'bg-[#2DD4BF] text-black'}`}>
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

        {/* Bottom User Account Session Card in Heynesh style */}
        <div className="p-3 border-t border-[#20232A] bg-[#121316] m-2 rounded-2xl border space-y-2.5">
          <div 
            onClick={() => handleSelect('auth')}
            className="flex items-center justify-between gap-2 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt="" 
                className="w-8 h-8 rounded-xl object-cover border border-[#25282F] shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-[#FFFF23] transition-colors">
                    {currentUser.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLoggedIn ? 'bg-[#FFFF23] shadow-[0_0_6px_#FFFF23]' : 'bg-stone-500'}`} />
                  <p className="text-[10px] font-mono font-bold text-stone-400 uppercase truncate">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout / Login Action Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title="Log Out of Account"
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleLogin}
                title="Sign In to Account"
                className="p-1.5 rounded-lg text-[#FFFF23] hover:bg-[#FFFF23]/15 transition-colors shrink-0"
              >
                <LogIn className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Evaluator Role Switcher */}
          <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span>ACTIVE ROLE (RBAC):</span>
              <span className="font-bold text-[#FFFF23]">{currentUser.role}</span>
            </div>
            <select
              value={currentUser.role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                marineStorage.updateProfile({ role: newRole });
              }}
              className="w-full text-xs font-mono bg-[#0C0D0E] border border-white/15 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-[#FFFF23] cursor-pointer"
            >
              <option value="ADMIN">ADMIN (Full Directorate)</option>
              <option value="MARINE_OPERATOR">MARINE OPERATOR (Live Ops)</option>
              <option value="RESEARCHER">RESEARCHER (Sonar & Datasets)</option>
              <option value="CLEANUP_TEAM">CLEANUP TEAM (Response)</option>
              <option value="VIEWER">VIEWER (Read-Only Metrics)</option>
            </select>
          </div>

          {/* Return to Underwater Ocean Simulation Button */}
          {onOpenOceanExperience && (
            <button
              onClick={onOpenOceanExperience}
              className="w-full py-1.5 px-2 rounded-lg bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/30 text-[11px] font-mono text-teal-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Waves className="w-3.5 h-3.5" />
              <span>Ocean Simulation</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
};
