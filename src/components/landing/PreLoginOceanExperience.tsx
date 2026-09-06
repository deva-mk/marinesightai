import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle2, ArrowRight, AlertTriangle, Eye, EyeOff,
  Cpu, Database, Ship, Activity, Radio, Scan, Sparkles,
  Compass, Layers, Info, Check, Lock, LogIn, Volume2, VolumeX,
  Waves, Target, Play, Pause, User, Mail, UserPlus, KeyRound,
  ShieldCheck, Key
} from 'lucide-react';
import { UserRole } from '../../types';
import { marineStorage, DEFAULT_ACCOUNTS } from '../../services/storage';
import { cryptoVault } from '../../services/cryptoVault';
import heroVisualImg from '../../assets/images/marinesight_hero_visual_1788692550361.jpg';
import { LiveOceanCanvas } from './LiveOceanCanvas';
import { oceanAudio } from './oceanAudio';

interface TargetMarker {
  id: string;
  name: string;
  category: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  riskColor: string;
  status: 'IDENTIFIED' | 'TARGETED' | 'RECOVERING' | 'SECURED';
  xPercent: number; // left position
  yPercent: number; // top position on image
  sonarEchoFreq: string;
  depthM: number;
  massKg: number;
  threatAssessment: string;
  interventionPlan: string;
}

interface PreLoginOceanExperienceProps {
  onCompleteLogin: (role: UserRole) => void;
  onSkipDirectlyToApp?: () => void;
}

const TARGET_MARKERS: TargetMarker[] = [
  {
    id: 'TGT-01',
    name: 'GHOST NET',
    category: 'Derelict Fishing Gear (Nylon Gillnet)',
    riskLevel: 'HIGH',
    riskColor: '#F59E0B',
    status: 'RECOVERING',
    xPercent: 18,
    yPercent: 70,
    sonarEchoFreq: '455 kHz (High Reflection)',
    depthM: 14.8,
    massKg: 850,
    threatAssessment: 'Active benthic strangulation hazard. Entangles endangered turtles, cetaceans, and destroys living coral polyps.',
    interventionPlan: 'Articulated AUV manipulator arm cutting anchor lines and hoisting net bundle into subsea payload container.'
  },
  {
    id: 'TGT-02',
    name: 'PLASTIC DEBRIS',
    category: 'Macro Polyethylene & PET Synthetics',
    riskLevel: 'MEDIUM',
    riskColor: '#2DD4BF',
    status: 'IDENTIFIED',
    xPercent: 36,
    yPercent: 76,
    sonarEchoFreq: '455 kHz (Diffuse Acoustic)',
    depthM: 16.2,
    massKg: 120,
    threatAssessment: 'Microplastic breakdown threat. Leaches endocrine disruptors and synthetic phthalates into the benthic food chain.',
    interventionPlan: 'Negative-pressure suction intake and robotic basket retrieval during secondary collection sweep.'
  },
  {
    id: 'TGT-03',
    name: 'CHEMICAL DRUM',
    category: 'Corroded Industrial Steel Vessel',
    riskLevel: 'CRITICAL',
    riskColor: '#EF4444',
    status: 'TARGETED',
    xPercent: 49,
    yPercent: 78,
    sonarEchoFreq: '455 kHz (Resonant Metal Peak)',
    depthM: 18.5,
    massKg: 340,
    threatAssessment: 'Benthic toxic chemical leakage danger. Wall thickness compromised by galvanic rust; immediate salvage required.',
    interventionPlan: 'Heavy-lift magnetic harness tethering with inflatable salvage buoy deployment to surface support craft.'
  },
  {
    id: 'TGT-04',
    name: 'CRAB TRAP',
    category: 'Abandoned Wire Mesh Ghost Pot',
    riskLevel: 'HIGH',
    riskColor: '#F59E0B',
    status: 'IDENTIFIED',
    xPercent: 64,
    yPercent: 74,
    sonarEchoFreq: '455 kHz (Geometric Grid Signature)',
    depthM: 15.9,
    massKg: 95,
    threatAssessment: 'Self-baiting mortality loop. Captured crustaceans perish, attracting predators in perpetual cycle of destruction.',
    interventionPlan: 'AUV claw crushing door latch mechanism to liberate benthic fauna, followed by retrieval to surface.'
  }
];

export const PreLoginOceanExperience: React.FC<PreLoginOceanExperienceProps> = ({
  onCompleteLogin,
  onSkipDirectlyToApp
}) => {
  const [selectedTarget, setSelectedTarget] = useState<TargetMarker | null>(TARGET_MARKERS[0]);
  const [sonarSweepActive, setSonarSweepActive] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [cameraDriftActive, setCameraDriftActive] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'SIGN_IN' | 'SIGN_UP' | 'DEMO_ROLES'>('SIGN_IN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  
  // Sign In state
  const [loginEmail, setLoginEmail] = useState<string>('admin@marinesight.ai');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState<'IDLE' | 'CHECKING' | 'FOUND' | 'NEW'>('IDLE');
  const [loginNotice, setLoginNotice] = useState<{ text: string; type: 'info' | 'warn' | 'success' | 'error' } | null>(null);

  // Sign Up state
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupRole, setSignupRole] = useState<UserRole>('MARINE_OPERATOR');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState<string>('');
  const [signupShowPassword, setSignupShowPassword] = useState<boolean>(false);
  const [signupOrg, setSignupOrg] = useState<string>('Marine Coastal Surveillance Command');

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [showStoryGuide, setShowStoryGuide] = useState<boolean>(false);
  const [showHUDOverlay, setShowHUDOverlay] = useState<boolean>(true);

  // Dynamic Live Telemetry Variables
  const [liveDepth, setLiveDepth] = useState<number>(14.82);
  const [liveDecibels, setLiveDecibels] = useState<number>(-41.6);
  const [liveCurrent, setLiveCurrent] = useState<number>(1.44);

  // Live Micro-Fluctuations for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDepth(prev => +(14.8 + (Math.sin(Date.now() / 1500) * 0.08)).toFixed(2));
      setLiveDecibels(prev => +(-41.0 + (Math.cos(Date.now() / 1200) * 2.4)).toFixed(1));
      setLiveCurrent(prev => +(1.42 + (Math.sin(Date.now() / 2000) * 0.06)).toFixed(2));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Auto-pulse targets
  const [pulseIdx, setPulseIdx] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIdx((prev) => (prev + 1) % TARGET_MARKERS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    const muted = oceanAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  const checkEnteredEmail = (emailToCheck: string) => {
    const cleanEmail = emailToCheck.trim().toLowerCase();
    setLoginError(null);
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setEmailCheckStatus('IDLE');
      return;
    }
    
    setEmailCheckStatus('CHECKING');
    const isRegistered = marineStorage.isEmailRegistered(cleanEmail);
    if (isRegistered) {
      const user = marineStorage.getUserByEmail(cleanEmail);
      setEmailCheckStatus('FOUND');
      setLoginNotice({
        text: `✓ Registered account verified (${user?.name || cleanEmail}). Enter your password to sign in.`,
        type: 'success'
      });
    } else {
      setEmailCheckStatus('NEW');
      setLoginNotice({
        text: `⚠️ "${cleanEmail}" is not registered yet. Switching to Sign Up to create your account!`,
        type: 'warn'
      });
      // Auto-switch to Sign Up with email prefilled
      setSignupEmail(cleanEmail);
      if (!signupName) {
        const inferred = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setSignupName(inferred);
      }
      setModalMode('SIGN_UP');
    }
  };

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    const acc = DEFAULT_ACCOUNTS.find(a => a.role === role);
    if (acc) {
      setLoginEmail(acc.email);
      setLoginPassword(acc.password);
    }
  };

  const handleRoleQuickLogin = (role: UserRole) => {
    const acc = DEFAULT_ACCOUNTS.find(a => a.role === role) || DEFAULT_ACCOUNTS[0];
    const res = marineStorage.login(acc.email, acc.password);
    if (res.success) {
      onCompleteLogin(role);
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError('Please enter your email address.');
      return;
    }

    // Check if email is registered in system
    const isRegistered = marineStorage.isEmailRegistered(cleanEmail);
    if (!isRegistered) {
      // Auto-switch to Sign Up
      setLoginNotice({
        text: `⚠️ Operator email "${cleanEmail}" not found. Please enter your name, role, and password to create an account!`,
        type: 'warn'
      });
      setSignupEmail(cleanEmail);
      if (!signupName) {
        const inferred = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setSignupName(inferred);
      }
      setModalMode('SIGN_UP');
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter the password you created for this account.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    setTimeout(() => {
      const res = marineStorage.login(cleanEmail, loginPassword);
      setLoginLoading(false);
      if (res.success && res.user) {
        onCompleteLogin(res.user.role);
      } else {
        setLoginError(res.message || 'Invalid password. Please enter the password you created for this account.');
      }
    }, 350);
  };

  const handleFormSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!cleanName) {
      setLoginError('Please enter your full name or operator callsign.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setLoginError('Password must be at least 4 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setLoginError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoginLoading(true);
    setLoginError(null);

    setTimeout(() => {
      const res = marineStorage.register({
        name: cleanName,
        email: cleanEmail,
        role: signupRole,
        password: signupPassword,
        organization: signupOrg.trim() || 'MarineSight AI Environmental Operations'
      });
      setLoginLoading(false);

      if (res.success && res.user) {
        setLoginNotice({
          text: `Account created & encrypted successfully for ${res.user.name}! Entering mission workspace...`,
          type: 'success'
        });
        setTimeout(() => {
          onCompleteLogin(signupRole);
        }, 500);
      } else {
        setLoginError(res.message || 'Registration failed. Please check your credentials.');
      }
    }, 400);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#020A12] text-white select-none font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* CINEMATIC HERO BACKGROUND VISUAL                    */}
      {/* ---------------------------------------------------- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroVisualImg}
          alt="MarineSight AI Autonomous Ocean Restoration Visual"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center transform transition-transform duration-1000 ${
            cameraDriftActive ? 'animate-subsea-drift' : 'scale-100'
          }`}
          style={{
            filter: 'contrast(1.06) brightness(0.98)'
          }}
        />

        {/* Cinematic Vignette & Ambient Depth Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020A12] via-transparent to-[#020A12]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020A12]/90 via-transparent to-[#020A12]/60" />

        {/* Dynamic Light Caustics Overlay */}
        <div 
          className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none animate-caustics"
          style={{
            backgroundImage: `
              radial-gradient(circle at 75% 20%, rgba(45, 212, 191, 0.4) 0%, transparent 60%),
              radial-gradient(circle at 25% 40%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)
            `
          }}
        />
      </div>

      {/* ---------------------------------------------------- */}
      {/* DYNAMIC 60FPS LIVE OCEAN ANIMATION LAYER (CANVAS)    */}
      {/* ---------------------------------------------------- */}
      <LiveOceanCanvas 
        sonarActive={sonarSweepActive} 
        selectedTargetId={selectedTarget?.id}
        onTargetClick={(id) => {
          const t = TARGET_MARKERS.find(m => m.id === id);
          if (t) setSelectedTarget(t);
        }}
      />

      {/* ---------------------------------------------------- */}
      {/* TOP BAR: BRANDING & LIVE SCENE CONTROLS              */}
      {/* ---------------------------------------------------- */}
      <header className="relative z-30 pt-5 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Exact Hero Branding */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFFF23] text-black flex items-center justify-center font-black shadow-lg shadow-[#FFFF23]/20">
              <Compass className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-widest text-white flex items-center gap-2 drop-shadow-md">
                MARINESIGHT AI
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 tracking-wider">
                  PS-57 LIVE SCENE
                </span>
              </h1>
            </div>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-semibold tracking-wider text-[#E8E1D5] uppercase drop-shadow-sm">
            SEE THE OCEAN. UNDERSTAND THE RISK. RESTORE THE FUTURE.
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] font-mono text-[#2DD4BF]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
              <span className="tracking-widest uppercase font-bold">AUTONOMOUS MARINE INTELLIGENCE</span>
            </span>
            <span className="text-stone-500">•</span>
            <span className="text-[#FFFF23] flex items-center gap-1 font-bold">
              <Waves className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE CURRENT: {liveCurrent} kts (218° SW)</span>
            </span>
          </div>
        </div>

        {/* Live Scene Controls & Login Gateway Trigger */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-end sm:self-auto">
          {/* Hydrophone Audio Toggle */}
          <button
            onClick={handleToggleAudio}
            title={isAudioMuted ? "Enable Subsea Hydrophone Ambiance" : "Mute Hydrophone Ambiance"}
            className={`px-3 py-2 rounded-xl border text-xs font-mono backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md ${
              !isAudioMuted 
                ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] text-[#2DD4BF] animate-pulse' 
                : 'bg-black/60 hover:bg-black/80 border-white/15 text-stone-400 hover:text-white'
            }`}
          >
            {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5 text-[#2DD4BF]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isAudioMuted ? 'Audio: Muted' : 'Hydrophone: Live'}</span>
          </button>

          {/* Sonar Sweep Toggle */}
          <button
            onClick={() => setSonarSweepActive(!sonarSweepActive)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md ${
              sonarSweepActive 
                ? 'bg-black/70 border-[#2DD4BF]/40 text-[#2DD4BF]' 
                : 'bg-black/60 border-white/15 text-stone-400'
            }`}
          >
            {sonarSweepActive ? <Play className="w-3 h-3 text-[#2DD4BF]" /> : <Pause className="w-3 h-3" />}
            <span>Sonar: {sonarSweepActive ? 'Sweeping' : 'Paused'}</span>
          </button>

          {/* Camera Drift Toggle */}
          <button
            onClick={() => setCameraDriftActive(!cameraDriftActive)}
            className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/15 text-stone-300 hover:text-white font-mono text-xs backdrop-blur-md transition-all hidden md:flex items-center gap-1.5 shadow-md"
          >
            <Activity className={`w-3.5 h-3.5 ${cameraDriftActive ? 'text-[#FFFF23]' : 'text-stone-400'}`} />
            <span>Gimbal: {cameraDriftActive ? 'Drifting' : 'Locked'}</span>
          </button>

          {/* Mission Concept */}
          <button
            onClick={() => setShowStoryGuide(!showStoryGuide)}
            className="px-3 py-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/15 text-stone-300 hover:text-white font-mono text-xs backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md"
          >
            <Info className="w-3.5 h-3.5 text-[#FFFF23]" />
            <span>Concept</span>
          </button>

          {/* Prominent Login Trigger */}
          <button
            id="open-login-button"
            onClick={() => setShowLoginModal(true)}
            className="px-5 py-2 rounded-xl bg-[#FFFF23] hover:bg-[#e6e61f] text-black font-extrabold text-xs tracking-wider transition-all shadow-xl shadow-[#FFFF23]/25 flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>OPEN LOGIN / ACCESS</span>
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* STORY GUIDE POPUP (IF TOGGLED)                       */}
      {/* ---------------------------------------------------- */}
      {showStoryGuide && (
        <div className="relative z-40 max-w-4xl mx-auto w-full px-4 sm:px-8 mt-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-5 rounded-2xl bg-[#0B1522]/95 border border-[#2DD4BF]/40 backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFFF23]" />
                Continuous Autonomous Transformation Narrative (Left to Right)
              </h3>
              <button 
                onClick={() => setShowStoryGuide(false)}
                className="text-stone-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              This interactive live underwater scene captures the dynamic transformation of MarineSight AI:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-black/40 border border-red-500/30">
                <span className="text-red-400 font-bold block mb-1">1. POLLUTED OCEAN</span>
                <span className="text-stone-400 text-[10px]">Ghost nets, plastic heap, rusted drums, murky sediment.</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-amber-500/30">
                <span className="text-amber-400 font-bold block mb-1">2. AI DETECTION</span>
                <span className="text-stone-400 text-[10px]">455 kHz dual-swath acoustic sweep scanning seafloor.</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-[#FFFF23]/30">
                <span className="text-[#FFFF23] font-bold block mb-1">3. RISK IDENTIFIED</span>
                <span className="text-stone-400 text-[10px]">Chemical drums prioritized as CRITICAL threat.</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-[#2DD4BF]/30">
                <span className="text-[#2DD4BF] font-bold block mb-1">4. AUV RESPONDS</span>
                <span className="text-stone-400 text-[10px]">Autonomous vehicle thrusters maneuvering to target.</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-teal-500/30">
                <span className="text-teal-300 font-bold block mb-1">5. DEBRIS RECOVERED</span>
                <span className="text-stone-400 text-[10px]">Robotic claw hoists ghost net into onboard storage.</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold block mb-1">6. HEALTHY OCEAN</span>
                <span className="text-stone-400 text-[10px]">100% clarity, coral revived, clownfish & blue tang thrive.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* INTERACTIVE AR TARGET OVERLAYS ON SEABED             */}
      {/* ---------------------------------------------------- */}
      {showHUDOverlay && (
        <div className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 pointer-events-none">
          
          {/* Subtle Environmental Water Clarity Indicators (Left & Right) */}
          <div className="absolute top-10 left-4 sm:left-8 pointer-events-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/70 border border-red-500/40 backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-stone-300">BENTHIC POLLUTED ZONE</span>
              <span className="font-bold text-red-400 border-l border-white/10 pl-2">WATER CLARITY: 30%</span>
            </div>
          </div>

          <div className="absolute top-10 right-4 sm:right-8 pointer-events-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/70 border border-emerald-500/40 backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-stone-300">RESTORED REEF ZONE</span>
              <span className="font-bold text-emerald-300 border-l border-white/10 pl-2">CLARITY: 100% (LIVE FAUNA)</span>
            </div>
          </div>

          {/* Interactive Click Tip Hint */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-auto hidden sm:block">
            <div className="px-3 py-1 rounded-full bg-[#0E1726]/80 border border-[#2DD4BF]/30 backdrop-blur-md text-[10px] font-mono text-stone-300 flex items-center gap-2">
              <Target className="w-3 h-3 text-[#2DD4BF] animate-spin" />
              <span>Click anywhere in water to trigger live 455 kHz Acoustic Sonar Ripple</span>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SCIENTIFIC TELEMETRY PANEL NEAR AUV                 */}
          {/* ---------------------------------------------------- */}
          <div 
            className="absolute top-[28%] left-1/2 -translate-x-1/2 sm:translate-x-[-120%] pointer-events-auto animate-in fade-in zoom-in-95 duration-500"
          >
            <div className="w-64 sm:w-72 p-4 rounded-2xl bg-[#0A111E]/85 border border-[#2DD4BF]/50 backdrop-blur-xl shadow-2xl text-xs font-mono space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#2DD4BF]/20 pb-2">
                <div className="flex items-center gap-2 font-bold text-white tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-[#2DD4BF] animate-pulse" />
                  <span>MARINESIGHT AI</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 font-bold">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">AUV STATUS:</span>
                  <span className="text-[#2DD4BF] font-black flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
                    PROPULSION ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">CURRENT DEPTH:</span>
                  <span className="text-white font-bold">{liveDepth} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">ACOUSTIC FREQ:</span>
                  <span className="text-[#FFFF23] font-bold">455 kHz (Echo: {liveDecibels} dB)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">TARGETS DETECTED:</span>
                  <span className="text-white font-bold">04 Classified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">PRIMARY INTERVENTION:</span>
                  <span className="text-amber-400 font-bold">GHOST NET (RETRIEVING)</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <span className="text-stone-400">FAUNA STATUS:</span>
                  <span className="text-emerald-400 font-bold">Clownfish & Blue Tang Active</span>
                </div>
              </div>

              <div className="pt-1.5 text-[10px] text-stone-400 text-center flex items-center justify-center gap-1.5 border-t border-white/5">
                <Scan className="w-3 h-3 text-[#2DD4BF]" />
                <span>Dual-Swath Side-Scan Stream Online</span>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* AR TARGET MARKERS (THE 4 SCIENTIFIC DETECTIONS)      */}
          {/* ---------------------------------------------------- */}
          <div className="absolute inset-0 pointer-events-none">
            {TARGET_MARKERS.map((target, idx) => {
              const isSelected = selectedTarget?.id === target.id;
              const isPulsing = pulseIdx === idx;

              return (
                <div
                  key={target.id}
                  style={{
                    left: `${target.xPercent}%`,
                    top: `${target.yPercent}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  className="absolute pointer-events-auto cursor-pointer group"
                  onClick={() => setSelectedTarget(target)}
                >
                  {/* Outer Targeting Reticle */}
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'scale-120' : 'hover:scale-110'
                  }`}>
                    {/* Pulsing Sonar Ring */}
                    <div 
                      className={`absolute w-12 h-12 rounded-full border border-dashed transition-all pointer-events-none ${
                        target.riskLevel === 'CRITICAL' ? 'border-red-400 animate-spin' :
                        target.riskLevel === 'HIGH' ? 'border-amber-400 animate-spin' : 'border-teal-400 animate-spin'
                      } ${isPulsing ? 'opacity-100' : 'opacity-60'}`}
                      style={{ animationDuration: '8s' }}
                    />

                    {/* Scientific Corner Target Brackets */}
                    <div className="w-8 h-8 relative flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/80" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/80" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/80" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/80" />
                      
                      {/* Center Pip */}
                      <div 
                        className="w-2.5 h-2.5 rounded-full shadow-lg"
                        style={{ backgroundColor: target.riskColor }}
                      />
                    </div>

                    {/* Minimalist Floating Label */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-black backdrop-blur-md shadow-lg flex items-center gap-1 border ${
                        target.riskLevel === 'CRITICAL' 
                          ? 'bg-red-950/90 text-red-200 border-red-500/60' 
                          : target.riskLevel === 'HIGH'
                          ? 'bg-amber-950/90 text-amber-200 border-amber-500/60'
                          : 'bg-teal-950/90 text-teal-200 border-teal-500/60'
                      }`}>
                        <span>{target.name}</span>
                        <span className="opacity-60">—</span>
                        <span>{target.riskLevel} RISK</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ---------------------------------------------------- */}
          {/* SELECTED TARGET SCIENTIFIC INSPECTION HUD CARD      */}
          {/* ---------------------------------------------------- */}
          {selectedTarget && (
            <div 
              className="absolute bottom-20 left-4 sm:left-8 pointer-events-auto max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <div className="p-4 rounded-2xl bg-[#09111D]/95 border border-white/15 backdrop-blur-xl shadow-2xl text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 font-mono">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: selectedTarget.riskColor }}
                    />
                    <span className="font-black text-white text-xs">{selectedTarget.name}</span>
                    <span 
                      className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                      style={{ 
                        backgroundColor: `${selectedTarget.riskColor}25`,
                        color: selectedTarget.riskColor,
                        border: `1px solid ${selectedTarget.riskColor}60`
                      }}
                    >
                      {selectedTarget.riskLevel}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedTarget(null)}
                    className="text-stone-400 hover:text-white font-mono text-[10px]"
                  >
                    ✕ Dismiss
                  </button>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <p className="text-stone-300 font-sans text-xs">
                    {selectedTarget.threatAssessment}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[10px] text-stone-400">
                    <div>
                      <span>DEPTH: </span>
                      <strong className="text-white">{selectedTarget.depthM} m</strong>
                    </div>
                    <div>
                      <span>EST. MASS: </span>
                      <strong className="text-white">{selectedTarget.massKg} kg</strong>
                    </div>
                    <div className="col-span-2">
                      <span>ACOUSTIC ECHO: </span>
                      <strong className="text-[#2DD4BF]">{selectedTarget.sonarEchoFreq}</strong>
                    </div>
                  </div>
                  <div className="pt-1 text-[10px] text-emerald-300 font-sans flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Intervention:</strong> {selectedTarget.interventionPlan}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* BOTTOM CONTROL & RESTORATION SUMMARY DOCK            */}
      {/* ---------------------------------------------------- */}
      <footer className="relative z-30 p-4 sm:p-5 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-[#060D17]/90 backdrop-blur-2xl">
        
        {/* Environmental Telemetry Metrics */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Autonomous Recovery</span>
            <span className="font-black text-sm text-[#2DD4BF] flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />
              Ghost Net (Secured)
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div>
            <span className="text-stone-400 block text-[10px] uppercase">Seafloor Targets</span>
            <span className="font-black text-sm text-[#FFFF23]">
              04 Classified
            </span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden md:block" />

          <div className="hidden md:block">
            <span className="text-stone-400 block text-[10px] uppercase">Live Marine Ecosystem</span>
            <span className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Clownfish & Blue Tang Restored
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onSkipDirectlyToApp && (
            <button
              onClick={onSkipDirectlyToApp}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white font-semibold text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <span>Direct Dashboard</span>
            </button>
          )}

          <button
            onClick={() => setShowLoginModal(true)}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFFF23] to-[#2DD4BF] hover:from-[#e6e61f] hover:to-[#26b4a2] text-black font-extrabold text-xs tracking-wider transition-all shadow-xl shadow-[#FFFF23]/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>AUTHENTICATE & ENTER MARINESIGHT AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* ROLE-BASED LOGIN MODAL / WORKSPACE ACCESS GATEWAY    */}
      {/* ---------------------------------------------------- */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setShowLoginModal(false)}
          />

          <div className="relative w-full max-w-4xl bg-[#09111D] border border-[#2DD4BF]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            {/* Modal Header & Navigation Tabs */}
            <div className="p-5 sm:p-6 bg-[#0E1726] border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFFF23] text-black flex items-center justify-center font-black shadow-md">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      MarineSight AI Access Control
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#2DD4BF]" />
                        ZERO-KNOWLEDGE ENCRYPTED
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400 font-mono">
                      Intelligent verification • Salted SHA-256 Hashing • PII Redaction
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                <button
                  type="button"
                  onClick={() => { setModalMode('SIGN_IN'); setLoginError(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalMode === 'SIGN_IN'
                      ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20 font-black'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                  {emailCheckStatus === 'FOUND' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-950" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setModalMode('SIGN_UP'); setLoginError(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalMode === 'SIGN_UP'
                      ? 'bg-[#FFFF23] text-black shadow-md shadow-[#FFFF23]/20 font-black'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account / Sign Up</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/20 text-black uppercase">
                    Encrypted
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setModalMode('DEMO_ROLES'); setLoginError(null); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto ${
                    modalMode === 'DEMO_ROLES'
                      ? 'bg-white/20 text-white font-black'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quick Demo Roles</span>
                  <span className="sm:hidden">Roles</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Intelligent Notification / Alert Banner */}
              {loginNotice && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-2.5 animate-in fade-in ${
                  loginNotice.type === 'warn'
                    ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                    : loginNotice.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                    : 'bg-blue-950/50 border-blue-500/50 text-blue-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {loginNotice.type === 'warn' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{loginNotice.text}</span>
                  </div>
                  <button 
                    onClick={() => setLoginNotice(null)}
                    className="text-stone-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Error Banner */}
              {loginError && (
                <div className="p-3.5 rounded-2xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 1: SIGN IN (WITH AUTOMATIC EMAIL VERIFICATION)   */}
              {/* ==================================================== */}
              {modalMode === 'SIGN_IN' && (
                <div className="space-y-5">
                  <div className="bg-[#050B14] border border-white/10 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <LogIn className="w-4 h-4 text-[#2DD4BF]" />
                          Sign In with Registered Account
                        </h3>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                          Enter your email to verify account registration status
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-stone-400">
                        Zero-Knowledge Auth
                      </span>
                    </div>

                    <form onSubmit={handleFormLogin} className="space-y-4">
                      {/* Email Field with Automatic Check */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-stone-300">
                            Clearance Email Address
                          </label>
                          <button
                            type="button"
                            onClick={() => checkEnteredEmail(loginEmail)}
                            className="text-[11px] font-mono text-[#2DD4BF] hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Scan className="w-3 h-3" />
                            <span>Verify Email Status</span>
                          </button>
                        </div>

                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => {
                              setLoginEmail(e.target.value);
                              setEmailCheckStatus('IDLE');
                            }}
                            onBlur={() => {
                              if (loginEmail && loginEmail.includes('@')) {
                                checkEnteredEmail(loginEmail);
                              }
                            }}
                            placeholder="operator@marinesight.ai"
                            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#2DD4BF] font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => checkEnteredEmail(loginEmail)}
                            className="absolute right-2 top-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-[10px] font-mono transition-colors"
                          >
                            Check
                          </button>
                        </div>

                        <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                          <Info className="w-3 h-3 text-[#2DD4BF]" />
                          <span>If your email is not registered, system will automatically direct you to Sign Up.</span>
                        </p>
                      </div>

                      {/* Password Field */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-stone-300">
                            Account Access Password
                          </label>
                          <span className="text-[10px] font-mono text-stone-500">
                            Password set during account registration
                          </span>
                        </div>

                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#2DD4BF]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300"
                          >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Encryption Security Guarantee Notice */}
                      <div className="p-3 rounded-xl bg-[#0F172A]/80 border border-white/10 text-[11px] text-stone-300 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">Cryptographic Zero-Knowledge Vault Active</p>
                          <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">
                            Passwords are never stored in plain text. SHA-256 salted hashes and encrypted client-side isolation guarantee your personal contact details are completely hidden from other users.
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSignupEmail(loginEmail);
                            setModalMode('SIGN_UP');
                          }}
                          className="text-xs text-stone-400 hover:text-[#FFFF23] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>New operator? Create an account instead</span>
                        </button>

                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#26b4a2] text-black font-extrabold text-xs tracking-wider transition-all shadow-md shadow-[#2DD4BF]/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loginLoading ? 'Verifying...' : 'Sign In & Launch Workspace'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Predefined Test Accounts Quick Fill */}
                  <div className="p-4 rounded-2xl bg-[#09111D] border border-white/10">
                    <p className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>Quick Test Predefined Accounts:</span>
                      <span className="text-stone-500 font-normal">Click to auto-fill</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {DEFAULT_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setLoginEmail(acc.email);
                            setLoginPassword(acc.password || 'admin123');
                            setEmailCheckStatus('FOUND');
                            setLoginNotice({
                              text: `Loaded credentials for ${acc.name} (${acc.role}). Click "Sign In" to proceed!`,
                              type: 'info'
                            });
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors cursor-pointer"
                        >
                          <span className="block text-[11px] font-bold text-white truncate">{acc.name}</span>
                          <span className="block text-[9px] font-mono text-[#2DD4BF] uppercase">{acc.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 2: CREATE ACCOUNT / SIGN UP (ENCRYPTED FIELDS)   */}
              {/* ==================================================== */}
              {modalMode === 'SIGN_UP' && (
                <div className="space-y-5">
                  <div className="bg-[#050B14] border border-[#FFFF23]/40 rounded-2xl p-5 sm:p-6 shadow-xl shadow-[#FFFF23]/5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-[#FFFF23]" />
                          Create New Encrypted Operator Account
                        </h3>
                        <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                          Enter your details. Credentials will be encrypted with SHA-256 and salted hashing.
                        </p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFF23]/20 text-[#FFFF23] border border-[#FFFF23]/40 font-bold">
                        AES-256 & SHA-256
                      </span>
                    </div>

                    <form onSubmit={handleFormSignup} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-stone-300 mb-1.5">
                            Full Name / Operator Callsign <span className="text-[#FFFF23]">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                            <input
                              type="text"
                              required
                              value={signupName}
                              onChange={(e) => setSignupName(e.target.value)}
                              placeholder="e.g. Commander Sarah Connor"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                            />
                          </div>
                        </div>

                        {/* 2. Email Address */}
                        <div>
                          <label className="block text-xs font-bold text-stone-300 mb-1.5">
                            Operator Email Address <span className="text-[#FFFF23]">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                            <input
                              type="email"
                              required
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              placeholder="sarah.connor@marinesight.ai"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFFF23] font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Operational Clearance Role */}
                      <div>
                        <label className="block text-xs font-bold text-stone-300 mb-1.5">
                          Assigned Operational Clearance Role <span className="text-[#FFFF23]">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { role: 'ADMIN' as UserRole, label: 'Admin', clearance: 'Lvl 5 (Director)', color: 'border-purple-500/40 text-purple-300' },
                            { role: 'MARINE_OPERATOR' as UserRole, label: 'Operator', clearance: 'Lvl 4 (Fleet Lead)', color: 'border-[#2DD4BF]/40 text-[#2DD4BF]' },
                            { role: 'RESEARCHER' as UserRole, label: 'Researcher', clearance: 'Lvl 3 (Scientist)', color: 'border-blue-500/40 text-blue-300' },
                            { role: 'CLEANUP_TEAM' as UserRole, label: 'Cleanup', clearance: 'Lvl 3 (Salvage)', color: 'border-amber-500/40 text-amber-300' },
                            { role: 'VIEWER' as UserRole, label: 'Viewer', clearance: 'Lvl 1 (Public)', color: 'border-stone-500/40 text-stone-300' }
                          ].map((item) => (
                            <button
                              key={item.role}
                              type="button"
                              onClick={() => setSignupRole(item.role)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                signupRole === item.role
                                  ? 'bg-white/15 border-[#FFFF23] ring-1 ring-[#FFFF23]'
                                  : 'bg-[#0F172A] border-white/10 hover:border-white/20'
                              }`}
                            >
                              <span className="text-xs font-bold text-white">{item.label}</span>
                              <span className={`text-[9px] font-mono ${item.color} mt-1`}>{item.clearance}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Password and Confirm Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-300 mb-1.5">
                            Create Secure Password <span className="text-[#FFFF23]">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                            <input
                              type={signupShowPassword ? 'text' : 'password'}
                              required
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              placeholder="Minimum 4 characters"
                              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                            />
                            <button
                              type="button"
                              onClick={() => setSignupShowPassword(!signupShowPassword)}
                              className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300"
                            >
                              {signupShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-300 mb-1.5">
                            Confirm Password <span className="text-[#FFFF23]">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                            <input
                              type={signupShowPassword ? 'text' : 'password'}
                              required
                              value={signupConfirmPassword}
                              onChange={(e) => setSignupConfirmPassword(e.target.value)}
                              placeholder="Re-type password"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Privacy & Encryption Guarantee Card */}
                      <div className="p-4 rounded-2xl bg-[#09111D] border border-emerald-500/30 text-xs text-stone-300 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-emerald-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Guaranteed Confidentiality & Zero-Knowledge Encryption</span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          • Your password will be salted with your unique email and transformed into a SHA-256 cryptographic hash before storing.<br />
                          • Your personal contact details and private credentials are automatically masked from all other operators and public observers.
                        </p>
                      </div>

                      {/* Submit and Switch */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setModalMode('SIGN_IN')}
                          className="text-xs text-stone-400 hover:text-[#2DD4BF] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Already registered? Sign In with existing password</span>
                        </button>

                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFFF23] to-[#2DD4BF] hover:from-[#e6e61f] hover:to-[#26b4a2] text-black font-black text-xs tracking-wider transition-all shadow-lg shadow-[#FFFF23]/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loginLoading ? 'Encrypting & Creating...' : 'Create Encrypted Account & Launch'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* TAB 3: DEMO ROLES (QUICK ONE-CLICK TESTING)          */}
              {/* ==================================================== */}
              {modalMode === 'DEMO_ROLES' && (
                <div className="space-y-4">
                  <p className="text-xs font-mono font-bold text-[#2DD4BF] uppercase tracking-wider">
                    Instant Clearance Roles (1-Click Test Access):
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* 1. ADMIN */}
                    <div
                      onClick={() => handleSelectRole('ADMIN')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedRole === 'ADMIN'
                          ? 'bg-[#1E293B] border-[#FFFF23] shadow-lg shadow-[#FFFF23]/10 ring-1 ring-[#FFFF23]'
                          : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20 hover:bg-[#1E293B]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/30">
                            CLEARANCE LVL 5
                          </span>
                          <Cpu className="w-4 h-4 text-stone-400" />
                        </div>
                        <h4 className="text-sm font-black text-white">ADMIN</h4>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          Full administrative command over AUV fleet, AI model weights, and operations.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400">All Modules Unlocked</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRoleQuickLogin('ADMIN'); }}
                          className="px-2.5 py-1 rounded-lg bg-[#FFFF23] hover:bg-[#e6e61f] text-black font-bold text-[11px] transition-colors"
                        >
                          Enter as Admin
                        </button>
                      </div>
                    </div>

                    {/* 2. MARINE OPERATOR */}
                    <div
                      onClick={() => handleSelectRole('MARINE_OPERATOR')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'MARINE_OPERATOR'
                          ? 'bg-[#1E293B] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10 ring-1 ring-[#2DD4BF]'
                          : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20 hover:bg-[#1E293B]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30">
                            CLEARANCE LVL 4
                          </span>
                          <Eye className="w-4 h-4 text-stone-400" />
                        </div>
                        <h4 className="text-sm font-black text-white">MARINE OPERATOR</h4>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          Live surface optical feed monitoring, drone patrols, and anomaly alarms.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400">Surface & Drones</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRoleQuickLogin('MARINE_OPERATOR'); }}
                          className="px-2.5 py-1 rounded-lg bg-[#2DD4BF] hover:bg-[#26b4a2] text-black font-bold text-[11px] transition-colors"
                        >
                          Enter as Operator
                        </button>
                      </div>
                    </div>

                    {/* 3. RESEARCHER */}
                    <div
                      onClick={() => handleSelectRole('RESEARCHER')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'RESEARCHER'
                          ? 'bg-[#1E293B] border-[#60A5FA] shadow-lg shadow-[#60A5FA]/10 ring-1 ring-[#60A5FA]'
                          : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20 hover:bg-[#1E293B]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30">
                            CLEARANCE LVL 3
                          </span>
                          <Database className="w-4 h-4 text-stone-400" />
                        </div>
                        <h4 className="text-sm font-black text-white">RESEARCHER</h4>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          Accessing side-scan sonar transects, PS57 acoustic datasets, and YOLO fine-tuning.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400">Sonar & Datasets</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRoleQuickLogin('RESEARCHER'); }}
                          className="px-2.5 py-1 rounded-lg bg-[#60A5FA] hover:bg-[#3b82f6] text-black font-bold text-[11px] transition-colors"
                        >
                          Enter as Researcher
                        </button>
                      </div>
                    </div>

                    {/* 4. CLEANUP TEAM */}
                    <div
                      onClick={() => handleSelectRole('CLEANUP_TEAM')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'CLEANUP_TEAM'
                          ? 'bg-[#1E293B] border-[#F59E0B] shadow-lg shadow-[#F59E0B]/10 ring-1 ring-[#F59E0B]'
                          : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20 hover:bg-[#1E293B]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                            CLEARANCE LVL 3
                          </span>
                          <Ship className="w-4 h-4 text-stone-400" />
                        </div>
                        <h4 className="text-sm font-black text-white">CLEANUP TEAM</h4>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          Vessel dispatch, salvage missions, and debris recovery verification.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400">Missions & Salvage</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRoleQuickLogin('CLEANUP_TEAM'); }}
                          className="px-2.5 py-1 rounded-lg bg-[#F59E0B] hover:bg-[#d97706] text-black font-bold text-[11px] transition-colors"
                        >
                          Enter as Cleanup
                        </button>
                      </div>
                    </div>

                    {/* 5. VIEWER */}
                    <div
                      onClick={() => handleSelectRole('VIEWER')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'VIEWER'
                          ? 'bg-[#1E293B] border-[#A78BFA] shadow-lg shadow-[#A78BFA]/10 ring-1 ring-[#A78BFA]'
                          : 'bg-[#0F172A]/70 border-white/10 hover:border-white/20 hover:bg-[#1E293B]/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/30">
                            CLEARANCE LVL 1
                          </span>
                          <Activity className="w-4 h-4 text-stone-400" />
                        </div>
                        <h4 className="text-sm font-black text-white">VIEWER</h4>
                        <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                          Public overview, marine environmental health reports, and hotspot trends.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-stone-400">Public Metrics</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRoleQuickLogin('VIEWER'); }}
                          className="px-2.5 py-1 rounded-lg bg-[#A78BFA] hover:bg-[#8b5cf6] text-black font-bold text-[11px] transition-colors"
                        >
                          Enter as Viewer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#050B14] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                MarineSight AI Cryptographic Vault • SHA-256 & AES-256 Redaction Active
              </span>
              <button
                onClick={() => setShowLoginModal(false)}
                className="hover:text-white underline cursor-pointer"
              >
                Back to Ocean Hero Visual
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
