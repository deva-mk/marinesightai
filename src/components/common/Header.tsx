import React, { useState, useEffect } from 'react';
import { 
  Waves, 
  Search, 
  Bell, 
  Bot, 
  Radio, 
  Download, 
  Trash2,
  RotateCcw, 
  ShieldCheck, 
  Menu, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Navigation,
  CheckCircle2,
  LogOut,
  LogIn,
  UserPlus,
  User,
  Key,
  ShieldAlert
} from 'lucide-react';
import { marineStorage, DEFAULT_ACCOUNTS } from '../../services/storage';
import { UserProfile, UserRole } from '../../types';
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
  
  const isLoggedIn = marineStorage.isLoggedIn() && currentUser.email !== 'guest@marinesight.public';

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

  const handleClearAllData = () => {
    if (confirm("Remove all detections, incidents, missions, and alerts to start with 0 predefined records?")) {
      marineStorage.clearAllData();
      setToastMsg("All predefined data cleared! System is at clean slate (0 records).");
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const handleLogout = () => {
    marineStorage.logout();
    setShowRoleDropdown(false);
    setToastMsg("You have successfully logged out of your account.");
    setTimeout(() => setToastMsg(null), 4000);
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
          // fallback to Tamil Nadu coast
          setUserCoords({ lat: 10.9541, lng: 78.0812 });
          setLocating(false);
          setToastMsg("Using Coastal Baseline Marine Coordinates (10.9541°N, 78.0812°E)");
          setTimeout(() => setToastMsg(null), 4000);
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0C0D0E]/95 backdrop-blur-md border-b border-[#20232A] px-4 lg:px-8 py-2.5 transition-all text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleMobile}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-[#1A1C22] transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-[#FFFF23]" />
          </button>

          <button 
            onClick={() => setActiveView?.('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFFF23] flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,35,0.4)] group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-[#FFFF23] transition-colors">
                  MARINESIGHT <span className="text-[#FFFF23]">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#FFFF23]/15 text-[#FFFF23] border border-[#FFFF23]/30">
                  AI PRO
                </span>
              </div>
              <p className="hidden md:block text-[10px] font-mono font-bold text-stone-400 tracking-wider uppercase">
                Acoustic & Optical Ocean Intelligence
              </p>
            </div>
          </button>
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#141518] border border-[#25282F] hover:border-[#FFFF23]/60 rounded-xl text-xs text-stone-300 shadow-inner transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-stone-400 group-hover:text-[#FFFF23] transition-colors" />
              <span>Search detections, sonar targets, missions, GPS...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[#1F2228] text-[10px] font-mono text-[#FFFF23] border border-[#2F323A]">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Action Bar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* GPS Coordinates Button */}
          <button
            onClick={handleLocateMe}
            title={userCoords ? `Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)}` : "Locate My Coordinates"}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141518] border border-[#25282F] text-xs font-mono text-[#2DD4BF] hover:border-[#2DD4BF] transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-[#FFFF23]' : ''}`} />
            <span className="hidden xl:inline">{userCoords ? 'GPS Locked' : 'Locate'}</span>
          </button>

          {/* Sensor Simulator */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141518] border border-[#25282F] text-stone-300 hover:text-white hover:border-[#2DD4BF] text-xs font-bold transition-all"
            title="Generate Sensor Detection Simulation"
          >
            <Radio className="w-3.5 h-3.5 text-[#2DD4BF] animate-pulse" />
            <span className="hidden sm:inline">Simulator</span>
          </button>

          {/* AI Copilot in Heynesh style */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFF23]/15 text-[#FFFF23] hover:bg-[#FFFF23] hover:text-black text-xs font-black tracking-wide uppercase transition-all border border-[#FFFF23]/40 shadow-[0_0_12px_rgba(255,255,35,0.25)]"
            title="Open MarineSight AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Copilot</span>
          </button>

          {/* Clear All Data Button (Wipe predefined) */}
          <button
            onClick={handleClearAllData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#141518] border border-[#25282F] hover:border-red-500/60 text-stone-300 hover:text-red-400 text-xs font-bold transition-colors"
            title="Wipe & Clear All Data to Clean Slate (0 records)"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden xl:inline">Clear Data</span>
          </button>

          {/* Download Project ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-extrabold tracking-wide transition-all shadow-[0_0_15px_rgba(255,255,35,0.3)] group"
            title="Download Complete Project as ZIP file"
          >
            <Download className={`w-3.5 h-3.5 ${isExportingZip ? 'animate-bounce' : 'group-hover:-translate-y-0.5'} transition-transform`} />
            <span className="hidden lg:inline">{isExportingZip ? 'Packing...' : 'ZIP'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-[#141518] border border-[#25282F] text-stone-300 hover:border-[#FFFF23] hover:text-white transition-colors"
            title="View Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFFF23] text-black text-[9px] font-black flex items-center justify-center animate-pulse">
                {alertsCount}
              </span>
            )}
          </button>

          {/* Direct Sign In Button when Logged Out */}
          {!isLoggedIn ? (
            <button
              onClick={() => {
                if (onOpenAuth) onOpenAuth();
                else setActiveView?.('auth');
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFFF23] text-black text-xs font-extrabold shadow-[0_0_15px_rgba(255,255,35,0.35)] hover:bg-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          ) : (
            /* Logged-In User Account & Role Switcher */
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#141518] border border-[#25282F] hover:border-[#FFFF23] shadow-sm transition-colors text-left"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-[#25282F]"
                />
                <div className="hidden xl:block">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-[#FFFF23] uppercase tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* Dropdown Menu */}
              {showRoleDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-[#121316] border border-[#25282F] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white"
                  onClick={() => setShowRoleDropdown(false)}
                >
                  <div className="px-4 py-2.5 border-b border-[#20232A] bg-[#0C0D0E]/80">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-extrabold text-white">{currentUser.name}</p>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#FFFF23]/20 text-[#FFFF23] border border-[#FFFF23]/40">
                        ONLINE
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFF23] text-black">
                        {currentUser.role}
                      </span>
                      <span className="text-[10px] text-stone-400 truncate">
                        {currentUser.organization}
                      </span>
                    </div>
                  </div>

                  {/* Switch Persona Fast Menu */}
                  <div className="px-3 py-2 border-b border-[#20232A]">
                    <p className="text-[10px] font-mono font-bold text-[#FFFF23] uppercase tracking-wider mb-1.5">
                      SWITCH PERSONA:
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {DEFAULT_ACCOUNTS.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            marineStorage.setCurrentUser(user);
                            setToastMsg(`Switched active account to ${user.name} (${user.role})`);
                            setTimeout(() => setToastMsg(null), 3000);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium text-left transition-colors ${
                            currentUser.role === user.role && currentUser.email === user.email
                              ? 'bg-[#FFFF23] text-black font-extrabold'
                              : 'hover:bg-[#1A1C22] text-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={user.avatarUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                            <div>
                              <p className="leading-tight text-xs">{user.name}</p>
                              <p className="text-[9px] text-stone-400">{user.role.replace('_', ' ')}</p>
                            </div>
                          </div>
                          {currentUser.role === user.role && currentUser.email === user.email && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation & Logout Links */}
                  <div className="px-3 pt-2 space-y-1">
                    <button
                      onClick={() => setActiveView?.('auth')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-[#1A1C22] transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-[#FFFF23]" />
                        <span>Account & Security Hub</span>
                      </div>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    </button>

                    <button
                      onClick={() => setActiveView?.('settings')}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium text-stone-300 hover:bg-[#1A1C22] transition-colors flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span>Profile & System Keys</span>
                    </button>

                    {/* Prominent Log Out Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors flex items-center justify-between mt-1"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                        <span>Log Out of Account</span>
                      </div>
                      <span className="text-[10px] text-red-400 font-semibold">End Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#141518] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#FFFF23]/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FFFF23] shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}
    </header>
  );
};
