import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Waves, 
  ArrowRight, 
  Key, 
  LogOut, 
  Sparkles, 
  Shield, 
  Sliders, 
  Activity, 
  Radio, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Compass, 
  Cpu, 
  Ship, 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import { DEMO_USERS } from '../../data/sampleData';
import { UserProfile, UserRole } from '../../types';
import { marineStorage } from '../../services/storage';

interface AuthPageProps {
  onNavigate: (view: string, id?: string) => void;
}

// Predefined demo credentials with clear passwords and capabilities
export const PREDEFINED_ACCOUNTS = [
  {
    ...DEMO_USERS[0],
    password: 'admin123',
    clearanceLevel: 'Level 5 (Super Administrator)',
    capabilities: [
      'Full System Administration & Role RBAC',
      'YOLO Neural Architecture Training & Deployment',
      'Threshold Configuration & API Key Setup',
      'Incident Command & Maritime Vessel Dispatch',
    ],
    badgeColor: 'bg-[#FF6F59]/10 text-[#FF6F59] border-[#FF6F59]/20',
  },
  {
    ...DEMO_USERS[1],
    password: 'operator123',
    clearanceLevel: 'Level 4 (Field Fleet Commander)',
    capabilities: [
      'Side-Scan Sonar Telemetry Parsing (.DAT, .XTF)',
      'Drone Aerial Patrol Ingestion & Real-Time Stream',
      'Multimodal Fusion Co-Registration & Hotspot Logs',
      'Emergency Marine Salvage Unit Dispatch',
    ],
    badgeColor: 'bg-[#4F6F52]/10 text-[#4F6F52] border-[#4F6F52]/20',
  },
  {
    ...DEMO_USERS[2],
    password: 'researcher123',
    clearanceLevel: 'Level 3 (Marine Scientific Analyst)',
    capabilities: [
      'Acoustic Spectral Anomaly Analysis',
      'Lagrangian Hydrodynamic Drift Forecasting',
      'Dataset Lab Annotation Export (COCO/VOC/YOLO)',
      'Ecological Impact & MPA Risk Assessment',
    ],
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    ...DEMO_USERS[3],
    password: 'cleanup123',
    clearanceLevel: 'Level 3 (Response Squad Lead)',
    capabilities: [
      'Field Cleanup Mission Management & Logs',
      'Before / After Debris Recovery Verification',
      'Tonnage & High-Risk Tangle Removal Records',
      'Vessel Fuel & Hydraulic Winch Status Tracking',
    ],
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    ...DEMO_USERS[4],
    password: 'viewer123',
    clearanceLevel: 'Level 1 (Public Observer)',
    capabilities: [
      'Read-Only Marine Overview Dashboard',
      'Public Hotspot Map & Pollution Density View',
      'Detection Timeline Inspection',
      'Standard Summary Reports Browsing',
    ],
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
];

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(marineStorage.getCurrentUser());
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [emailInput, setEmailInput] = useState<string>('admin@marinesight.ai');
  const [passwordInput, setPasswordInput] = useState<string>('admin123');
  const [nameInput, setNameInput] = useState<string>('');
  const [roleInput, setRoleInput] = useState<UserRole>('ADMIN');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInstantSignIn = (account: typeof PREDEFINED_ACCOUNTS[0]) => {
    marineStorage.setCurrentUser({
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      organization: account.organization,
      avatarUrl: account.avatarUrl,
    });
    setCurrentUser(marineStorage.getCurrentUser());
    setEmailInput(account.email);
    setPasswordInput(account.password);
    showNotification(`Signed in as ${account.name} (${account.role})! Operational clearance active.`, 'success');
  };

  const handleAutofillCredentials = (account: typeof PREDEFINED_ACCOUNTS[0]) => {
    setEmailInput(account.email);
    setPasswordInput(account.password);
    setRoleInput(account.role);
    showNotification(`Filled predefined credentials for ${account.name} (${account.email})`, 'info');
  };

  const handleCopyCredentials = (account: typeof PREDEFINED_ACCOUNTS[0]) => {
    navigator.clipboard.writeText(`Email: ${account.email}\nPassword: ${account.password}`);
    setCopiedAccount(account.id);
    setTimeout(() => setCopiedAccount(null), 2500);
    showNotification(`Copied credentials for ${account.name} to clipboard`, 'info');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    const matchedPredefined = PREDEFINED_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matchedPredefined) {
      marineStorage.setCurrentUser({
        id: matchedPredefined.id,
        name: matchedPredefined.name,
        email: matchedPredefined.email,
        role: matchedPredefined.role,
        organization: matchedPredefined.organization,
        avatarUrl: matchedPredefined.avatarUrl,
      });
      setCurrentUser(marineStorage.getCurrentUser());
      showNotification(`Authenticated successfully as ${matchedPredefined.name}!`, 'success');
    } else {
      const newUser: UserProfile = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: nameInput.trim() || emailInput.split('@')[0] || 'Marine Specialist',
        email: emailInput.trim(),
        role: roleInput,
        organization: 'MarineSight AI Maritime Observatories',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      marineStorage.setCurrentUser(newUser);
      setCurrentUser(marineStorage.getCurrentUser());
      showNotification(`Account created & logged in as ${newUser.name} (${newUser.role})!`, 'success');
    }
  };

  const handleLogout = () => {
    // Switch to Guest / Viewer profile
    const guestUser = PREDEFINED_ACCOUNTS[4];
    marineStorage.setCurrentUser({
      id: guestUser.id,
      name: guestUser.name,
      email: guestUser.email,
      role: guestUser.role,
      organization: guestUser.organization,
      avatarUrl: guestUser.avatarUrl,
    });
    setCurrentUser(marineStorage.getCurrentUser());
    setEmailInput(PREDEFINED_ACCOUNTS[0].email);
    setPasswordInput(PREDEFINED_ACCOUNTS[0].password);
    setLogoutModalOpen(false);
    showNotification('You have logged out of your active session. Operating in Guest Viewer mode.', 'info');
  };

  const currentPredefined = PREDEFINED_ACCOUNTS.find((a) => a.email === currentUser.email) || {
    ...currentUser,
    password: '••••••••',
    clearanceLevel: `Level 2 (${currentUser.role})`,
    capabilities: [
      'Marine Intelligence Dashboard Access',
      'Real-Time Anomaly Monitoring',
      'Telemetry Review & Incident Reports',
    ],
    badgeColor: 'bg-[#FF6F59]/10 text-[#FF6F59] border-[#FF6F59]/20',
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 ${
          notification.type === 'success' 
            ? 'bg-[#2A2A2A] text-white border-[#4F6F52]' 
            : notification.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700'
            : 'bg-[#2A2A2A] text-[#F9F6F0] border-[#FF6F59]'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#4F6F52] shrink-0" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-5 h-5 text-[#FF6F59] shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Authentication Portal
            </span>
            <span className="text-xs text-[#736B5E]">Role-Based Access Control (RBAC) & Sessions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            MarineSight AI Access & Authentication Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] max-w-2xl">
            Sign in with predefined role accounts or custom credentials to operate sonar intelligence, drone missions, hydrodynamic drift modeling, and YOLO neural networks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#2A2A2A] text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#FF6F59]" />
            <span>Go to Dashboard</span>
          </button>
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E3DBD0] hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Active Session Status Bar */}
      <div className="bg-gradient-to-r from-white via-[#FBF9F5] to-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[#FF6F59] shadow-md shadow-[#FF6F59]/20 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#2A2A2A]">{currentUser.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${currentPredefined.badgeColor}`}>
                  {currentUser.role}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated & Active
                </span>
              </div>
              <p className="text-xs text-[#736B5E] font-medium">
                {currentUser.email} • <span className="text-[#2A2A2A]">{currentUser.organization}</span>
              </p>
              <p className="text-[11px] text-[#8C8275]">
                Clearance: <strong className="text-[#2A2A2A]">{currentPredefined.clearanceLevel}</strong> • Session Token: <span className="font-mono text-[#5C5449]">MS-AUTH-{currentUser.id.toUpperCase()}-2026</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('models')}
              className="px-3.5 py-2 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#FF6F59]/30"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>YOLO Training Studio</span>
            </button>
            <button
              onClick={() => onNavigate('sonar')}
              className="px-3.5 py-2 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#4F6F52]/30"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Sonar Console</span>
            </button>
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Predefined Credentials (Explicit, Highlighted & Scannable) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#FF6F59]" />
              <h2 className="text-lg font-extrabold text-[#2A2A2A]">
                Predefined Demo Accounts & Credentials
              </h2>
            </div>
            <p className="text-xs text-[#736B5E] mt-0.5">
              Click <strong>"1-Click Sign In"</strong> to authenticate immediately, or copy the predefined login and password.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#8C8275] bg-[#F2EDE4] px-2.5 py-1 rounded-lg">
            5 Pre-Configured Roles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {PREDEFINED_ACCOUNTS.map((account) => {
            const isCurrentlyActive = currentUser.email === account.email;
            const isCopied = copiedAccount === account.id;

            return (
              <div
                key={account.id}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
                  isCurrentlyActive
                    ? 'border-[#FF6F59] shadow-md ring-2 ring-[#FF6F59]/20'
                    : 'border-[#E8E1D5] hover:border-[#DDD5C7] shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${account.badgeColor}`}>
                      {account.role}
                    </span>
                    {isCurrentlyActive && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#FF6F59] bg-[#FF6F59]/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Current User
                      </span>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={account.avatarUrl}
                      alt={account.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#E3DBD0]"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#2A2A2A] leading-tight">{account.name}</h4>
                      <p className="text-[11px] text-[#736B5E] truncate max-w-[200px]">{account.organization}</p>
                    </div>
                  </div>

                  {/* Clearly Stated Predefined Credentials Box */}
                  <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-[#8C8275] uppercase">Predefined Email:</span>
                      <span className="font-mono font-bold text-[#2A2A2A] text-[11px] bg-white px-2 py-0.5 rounded border border-[#E3DBD0]">
                        {account.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-[#8C8275] uppercase">Predefined Password:</span>
                      <span className="font-mono font-bold text-[#FF6F59] text-[11px] bg-white px-2 py-0.5 rounded border border-[#E3DBD0]">
                        {account.password}
                      </span>
                    </div>
                  </div>

                  {/* Role Capabilities Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold text-[#8C8275] uppercase tracking-wider block">
                      Granted Permissions:
                    </span>
                    <ul className="space-y-1">
                      {account.capabilities.slice(0, 3).map((cap, cIdx) => (
                        <li key={cIdx} className="text-[11px] text-[#5C5449] flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52] shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#F2EDE4] flex items-center gap-2">
                  <button
                    onClick={() => handleInstantSignIn(account)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isCurrentlyActive
                        ? 'bg-[#4F6F52] text-white hover:bg-[#3E5841]'
                        : 'bg-[#FF6F59] text-white hover:bg-[#E0533D]'
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>{isCurrentlyActive ? 'Active Session' : '1-Click Sign In'}</span>
                  </button>

                  <button
                    onClick={() => handleAutofillCredentials(account)}
                    title="Fill Form with this account"
                    className="p-2 rounded-xl bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#2A2A2A] text-xs font-bold transition-colors"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyCredentials(account)}
                    title="Copy Email & Password"
                    className="p-2 rounded-xl bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#2A2A2A] text-xs font-bold transition-colors"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-[#4F6F52]" /> : <Copy className="w-4 h-4 text-[#736B5E]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Interactive Sign In / Register Form & Security Policies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sign In Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-4">
            <div>
              <h3 className="text-lg font-extrabold text-[#2A2A2A]">
                {mode === 'LOGIN' ? 'Sign In to Maritime Console' : 'Register New Personnel Profile'}
              </h3>
              <p className="text-xs text-[#736B5E] mt-0.5">
                {mode === 'LOGIN' 
                  ? 'Enter predefined credentials or custom credentials to authenticate.'
                  : 'Create a new operator account for field mission logs.'}
              </p>
            </div>

            <div className="flex bg-[#F2EDE4] p-1 rounded-xl">
              <button
                onClick={() => setMode('LOGIN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  mode === 'LOGIN' ? 'bg-[#FF6F59] text-white shadow-xs' : 'text-[#736B5E]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('REGISTER')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  mode === 'REGISTER' ? 'bg-[#FF6F59] text-white shadow-xs' : 'text-[#736B5E]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-[#5C5449] mb-1.5">Full Name & Title</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Commander Sarah Connor"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-medium focus:border-[#FF6F59] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#5C5449] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@marinesight.ai"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-medium focus:border-[#FF6F59] focus:bg-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#5C5449]">Password</label>
                <span className="text-[11px] text-[#8C8275]">Predefined: admin123 / operator123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C8275] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-medium focus:border-[#FF6F59] focus:bg-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8C8275] hover:text-[#2A2A2A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-bold text-[#5C5449] mb-1.5">Assigned Operational Role</label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-bold text-[#2A2A2A] focus:border-[#FF6F59] focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Super Administrator & AI Architect)</option>
                  <option value="MARINE_OPERATOR">MARINE_OPERATOR (Sonar & Drone Fleet Lead)</option>
                  <option value="RESEARCHER">RESEARCHER (Acoustics & Drift Modeling)</option>
                  <option value="CLEANUP_TEAM">CLEANUP_TEAM (Field Salvage Operations)</option>
                  <option value="VIEWER">VIEWER (Public Observer & Citizen Science)</option>
                </select>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-[#FF6F59]/30 transition-all hover:scale-[1.01]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{mode === 'LOGIN' ? 'Authenticate & Enter MarineSight AI' : 'Create Operational Account'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Clearance & Active Session Info Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D5] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4F6F52]" />
              <h3 className="text-base font-extrabold text-[#2A2A2A]">
                Security Architecture & RBAC Policies
              </h3>
            </div>

            <p className="text-xs text-[#5C5449] leading-relaxed">
              MarineSight AI enforces strict Role-Based Access Controls to safeguard sensitive hydroacoustic sonar transects, underwater archaeological anomaly records, and vessel dispatch telemetry.
            </p>

            <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8C8275]">Acoustic Encryption:</span>
                <span className="font-mono font-bold text-[#4F6F52]">AES-256 GCM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C8275]">Multi-Modal Fusion Core:</span>
                <span className="font-mono font-bold text-[#2A2A2A]">Bayesian Spatial-Temporal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C8275]">YOLO Inference Pipeline:</span>
                <span className="font-mono font-bold text-[#FF6F59]">CSPDarknet + RepNCSP</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8C8275]">Session Idle Timeout:</span>
                <span className="font-mono font-bold text-[#2A2A2A]">12 Hours Active</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F2EDE4] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2A2A2A]">Currently Signed In:</span>
              <span className="font-mono font-bold text-[#FF6F59]">{currentUser.email}</span>
            </div>

            <button
              onClick={() => setLogoutModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out / Terminate Active Session</span>
            </button>
          </div>
        </div>

      </div>

      {/* Logout Confirmation Dialog */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setLogoutModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E3DBD0] p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-[#2A2A2A]">Confirm Session Termination</h3>
              <p className="text-xs text-[#736B5E] mt-1">
                Are you sure you want to log out of <strong>{currentUser.name}</strong> ({currentUser.email})? You can switch to another predefined account at any time.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#2A2A2A] text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
