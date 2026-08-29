import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Search, 
  Bell, 
  Bot, 
  Radio, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Menu, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Navigation,
  CheckCircle2
} from 'lucide-react';
import { marineStorage } from '../../services/storage';
import { UserProfile, UserRole } from '../../types';
import { DEMO_USERS } from '../../data/sampleData';
import { downloadProjectZip } from '../../services/zipExport';
import confetti from 'canvas-confetti';

interface HeaderProps {
  currentUser: UserProfile;
  unreadAlertsCount?: number;
  unreadCount?: number;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenSimulator?: () => void;
  onOpenCopilot?: () => void;
  onOpenAuth?: () => void;
  onToggleSidebarMobile?: () => void;
  onToggleMobileMenu?: () => void;
  activeView?: string;
  setActiveView?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  unreadAlertsCount,
  unreadCount,
  onOpenSearch,
  onOpenNotifications,
  onOpenSimulator,
  onOpenCopilot,
  onOpenAuth,
  onToggleSidebarMobile,
  onToggleMobileMenu,
  setActiveView
}) => {
  const alertsCount = unreadAlertsCount ?? unreadCount ?? 0;
  const toggleMobile = onToggleSidebarMobile || onToggleMobileMenu;
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      await downloadProjectZip();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.1 } });
      setToastMsg("MarineSight AI Full Project ZIP Downloaded Successfully!");
      setTimeout(() => setToastMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleResetData = () => {
    if (confirm("Reset all MarineSight AI detections, incidents, and missions to original demo dataset?")) {
      marineStorage.initDefaults(true);
      setToastMsg("Demo data reset to clean baseline!");
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
          setToastMsg(`GPS Acquired: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
          setTimeout(() => setToastMsg(null), 4000);
        },
        () => {
          // fallback
          setUserCoords({ lat: 10.9541, lng: 78.0812 });
          setLocating(false);
          setToastMsg("Using Coastal Baseline Marine Coordinates (10.9541°N, 78.0812°E)");
          setTimeout(() => setToastMsg(null), 4000);
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F9F6F0]/95 backdrop-blur-md border-b border-[#E8E1D5] px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg text-[#2A2A2A] hover:bg-[#EFE9DD] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setActiveView?.('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6F59] to-[#E0533D] flex items-center justify-center text-white shadow-sm shadow-[#FF6F59]/30 group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-[#2A2A2A] group-hover:text-[#FF6F59] transition-colors">
                  MARINESIGHT <span className="text-[#FF6F59]">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20">
                  v2.4 AI PRO
                </span>
              </div>
              <p className="hidden md:block text-[10px] font-medium text-[#736B5E] tracking-wider uppercase">
                See the Invisible. Clean the Ocean.
              </p>
            </div>
          </button>
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-white/80 border border-[#E3DBD0] hover:border-[#FF6F59]/60 rounded-xl text-xs text-[#736B5E] shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#8C8275] group-hover:text-[#FF6F59] transition-colors" />
              <span>Search incidents, sonar targets, missions, GPS...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#F2EDE4] text-[10px] font-mono text-[#5C5449] border border-[#DDD5C7]">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Locate Me button */}
          <button
            onClick={handleLocateMe}
            title={userCoords ? `Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)}` : "Locate My Coordinates"}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/80 border border-[#E3DBD0] text-xs font-semibold text-[#4F6F52] hover:bg-[#4F6F52]/10 transition-colors shadow-sm"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-[#FF6F59]' : ''}`} />
            <span className="hidden xl:inline">{userCoords ? 'GPS Locked' : 'Locate Me'}</span>
          </button>

          {/* Sensor Simulator */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4F6F52]/15 text-[#4F6F52] hover:bg-[#4F6F52]/25 text-xs font-bold transition-colors border border-[#4F6F52]/30 shadow-sm"
            title="Generate Sensor Detection Simulation"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#4F6F52]" />
            <span className="hidden sm:inline">Simulator</span>
          </button>

          {/* AI Copilot */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6F59]/15 text-[#D94C36] hover:bg-[#FF6F59]/25 text-xs font-bold transition-colors border border-[#FF6F59]/30 shadow-sm"
            title="Open MarineSight AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>

          {/* Download Project ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-[#F9F6F0] hover:bg-[#1A1A1A] text-xs font-bold transition-all shadow-sm group"
            title="Download Complete Project as ZIP file"
          >
            <Download className={`w-3.5 h-3.5 ${isExportingZip ? 'animate-bounce' : 'group-hover:-translate-y-0.5'} transition-transform`} />
            <span className="hidden lg:inline">{isExportingZip ? 'Packing ZIP...' : 'Get Project ZIP'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-white/80 border border-[#E3DBD0] text-[#2A2A2A] hover:border-[#FF6F59] transition-colors shadow-sm"
            title="View Alerts & Notifications"
          >
            <Bell className="w-4 h-4 text-[#5C5449]" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF6F59] text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetData}
            className="p-2 rounded-lg bg-white/80 border border-[#E3DBD0] text-[#736B5E] hover:text-[#FF6F59] hover:border-[#FF6F59] transition-colors shadow-sm hidden sm:block"
            title="Reset All Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Role Switcher & Profile */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white border border-[#E3DBD0] hover:border-[#FF6F59] shadow-sm transition-colors text-left"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-[#E8E1D5]"
              />
              <div className="hidden xl:block">
                <p className="text-xs font-bold text-[#2A2A2A] leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-semibold text-[#FF6F59] uppercase tracking-wider">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C8275]" />
            </button>

            {/* Dropdown */}
            {showRoleDropdown && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white border border-[#E3DBD0] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowRoleDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-[#F2EDE4]">
                  <p className="text-xs font-bold text-[#2A2A2A]">{currentUser.name}</p>
                  <p className="text-[11px] text-[#736B5E] truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6F59]/10 text-[#FF6F59]">
                    Current Role: {currentUser.role}
                  </span>
                </div>

                <div className="px-3 py-1.5">
                  <p className="text-[10px] font-bold text-[#8C8275] uppercase tracking-wider mb-1">
                    Switch Demo Persona:
                  </p>
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => marineStorage.setCurrentUser(user)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                        currentUser.role === user.role
                          ? 'bg-[#FF6F59]/15 text-[#D94C36] font-bold'
                          : 'hover:bg-[#F9F6F0] text-[#2A2A2A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <div>
                          <p className="leading-tight">{user.name}</p>
                          <p className="text-[10px] text-[#736B5E]">{user.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {currentUser.role === user.role && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6F59]" />}
                    </button>
                  ))}
                </div>

                <div className="px-3 pt-2 border-t border-[#F2EDE4]">
                  <button
                    onClick={() => setActiveView('settings')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#5C5449] hover:bg-[#F2EDE4] transition-colors"
                  >
                    System Profile & Keys
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#2A2A2A] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#4F6F52] shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}
    </header>
  );
};
