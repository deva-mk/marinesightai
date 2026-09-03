import React, { useState, useEffect, useRef } from 'react';
import { 
  Radar, 
  Eye, 
  Compass, 
  Ship, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  ShieldAlert,
  Radio,
  Maximize2
} from 'lucide-react';
import { Faux3DMarineModel, Faux3DModelHandle } from '../common/Faux3DMarineModel';
import { MagneticButton } from '../common/MagneticButton';

interface ScrollytellingSectionProps {
  onEnterApp: () => void;
}

interface TimelineStep {
  step: number;
  phase: string;
  badge: string;
  title: string;
  desc: string;
  telemetry: { label: string; val: string }[];
  modelRotation: { rx: number; ry: number };
  subsystem: string;
  icon: React.ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    step: 1,
    phase: 'PHASE 01',
    badge: 'ACOUSTIC PROPAGATION',
    title: 'Subsea Acoustic Pulse Ingest',
    desc: 'High-frequency 455/900 kHz side-scan sonar penetrates zero-visibility waters, projecting dual-swath acoustic beam fans to detect submerged geometric shadows of derelict gear.',
    telemetry: [
      { label: 'Carrier Frequency', val: '455 kHz Chirp' },
      { label: 'Acoustic Swath', val: '120m Port / Starboard' },
      { label: 'Sampling Rate', val: '24 MS/s' }
    ],
    modelRotation: { rx: 0.1, ry: 1.6 },
    subsystem: 'sonar',
    icon: <Radar className="w-5 h-5 text-[#FFFF23]" />
  },
  {
    step: 2,
    phase: 'PHASE 02',
    badge: 'EDGE VISION INFERENCE',
    title: 'Optical Computer Vision & YOLOv8',
    desc: 'Multi-spectral aerial drone cameras and submersible optical gimbals stream 4K frames into an on-device YOLOv8 tensor core, isolating synthetic filaments and high-density polymers.',
    telemetry: [
      { label: 'Inference Latency', val: '8.4 ms (TensorRT)' },
      { label: 'mAP@50 Accuracy', val: '94.6%' },
      { label: 'Dynamic Exposure', val: 'HDR Low-Light' }
    ],
    modelRotation: { rx: 0.35, ry: 0.1 },
    subsystem: 'vision',
    icon: <Eye className="w-5 h-5 text-[#2DD4BF]" />
  },
  {
    step: 3,
    phase: 'PHASE 03',
    badge: 'SPATIAL RISK CORRELATION',
    title: 'Biosphere Hotspot Clustering',
    desc: 'Multimodal telemetry correlates with bathymetric currents and Marine Protected Area boundaries in the Gulf of Mannar, computing urgency scores and entanglement threats.',
    telemetry: [
      { label: 'Spatial Grid', val: 'H3 Sector Res-9' },
      { label: 'Habitat Priority', val: 'Coral Reef Biosphere' },
      { label: 'Tidal Drift Vector', val: '1.4 kts @ 142°' }
    ],
    modelRotation: { rx: -0.2, ry: -1.4 },
    subsystem: 'ballast',
    icon: <Compass className="w-5 h-5 text-[#FFFF23]" />
  },
  {
    step: 4,
    phase: 'PHASE 04',
    badge: 'AUTONOMOUS RECOVERY',
    title: 'Autonomous Interceptor Dispatch',
    desc: 'Automated retrieval missions generate GPS search corridors, vectoring cleanup vessels and ROV grappling arms to extract heavy ghost nets without harming delicate seafloor fauna.',
    telemetry: [
      { label: 'Haul Verified', val: '4,200 kg Recovered' },
      { label: 'Dispatch Lead', val: '< 18 Minutes' },
      { label: 'Autonomous Return', val: 'Waypoint Lock' }
    ],
    modelRotation: { rx: -0.1, ry: 3.2 },
    subsystem: 'thruster',
    icon: <Ship className="w-5 h-5 text-[#2DD4BF]" />
  }
];

export const ScrollytellingSection: React.FC<ScrollytellingSectionProps> = ({ onEnterApp }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<Faux3DModelHandle>(null);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [lineDashOffset, setLineDashOffset] = useState(1000);

  // Parallax scroll and timeline lock tracker
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = rect.top;
      const containerHeight = rect.height - window.innerHeight;

      if (containerHeight <= 0) return;

      // Calculate progress between 0 and 1
      const progress = Math.max(0, Math.min(1, -containerTop / containerHeight));
      setScrollProgress(progress);

      // Self-drawing line stroke dash offset (from 1000 to 0)
      const offset = 1000 - progress * 1000;
      setLineDashOffset(offset);

      // Determine active step index
      const stepIndex = Math.min(
        TIMELINE_STEPS.length - 1,
        Math.floor(progress * TIMELINE_STEPS.length)
      );
      setActiveStepIndex(stepIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update 3D model orientation when step changes
  useEffect(() => {
    const currentStep = TIMELINE_STEPS[activeStepIndex];
    if (modelRef.current && currentStep) {
      modelRef.current.setTargetRotation(
        currentStep.modelRotation.rx,
        currentStep.modelRotation.ry
      );
    }
  }, [activeStepIndex]);

  const activeStep = TIMELINE_STEPS[activeStepIndex];

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-[#0C0D0E] text-white"
      style={{ height: '360vh' }} // 3.6x screen height gives generous scroll runway for pinned scrollytelling
    >
      
      {/* ================= PARALLAX BACKGROUND LAYERS ================= */}
      
      {/* Parallax Layer 1 (Slowest - Bathymetric depth lines at 0.15x) */}
      <div 
        aria-hidden="true"
        style={{
          transform: `translate3d(0, ${scrollProgress * -80}px, 0)`
        }}
        className="pointer-events-none fixed inset-0 z-0 opacity-15 overflow-hidden"
      >
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M-100 150 C 300 120, 600 240, 900 180 C 1200 120, 1400 300, 1600 240" stroke="#FFFF23" strokeWidth="1" strokeDasharray="4 6" />
          <path d="M-100 350 C 250 420, 700 280, 1000 380 C 1300 480, 1500 320, 1600 360" stroke="#2DD4BF" strokeWidth="1.2" strokeDasharray="3 5" />
          <path d="M-100 580 C 400 620, 800 500, 1100 600 C 1350 700, 1500 550, 1600 620" stroke="#FFFF23" strokeWidth="1" strokeDasharray="6 8" />
          <path d="M-100 780 C 300 850, 700 720, 1050 820 C 1300 920, 1500 780, 1600 840" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Parallax Layer 2 (Mid-speed - Floating telemetry particles at 0.35x) */}
      <div 
        aria-hidden="true"
        style={{
          transform: `translate3d(0, ${scrollProgress * -160}px, 0)`
        }}
        className="pointer-events-none fixed inset-0 z-0 opacity-30 overflow-hidden"
      >
        <div className="absolute top-[20%] left-[12%] w-2 h-2 rounded-full bg-[#FFFF23] shadow-[0_0_10px_#FFFF23]" />
        <div className="absolute top-[35%] right-[18%] w-1.5 h-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]" />
        <div className="absolute top-[65%] left-[28%] w-2.5 h-2.5 rounded-full bg-[#FFFF23] shadow-[0_0_12px_#FFFF23]" />
        <div className="absolute top-[75%] right-[32%] w-1.5 h-1.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6]" />
      </div>

      {/* ================= STICKY PINNED SCROLLYTELLING VIEWPORT ================= */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-hidden z-10">
        
        {/* Top Header & Interactive Scroll Progress Readout */}
        <div className="flex items-center justify-between gap-4 border-b border-[#20232A] pb-4 bg-[#0C0D0E]/80 backdrop-blur-md rounded-2xl px-5 py-3">
          
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-[#FFFF23] text-black tracking-widest uppercase shadow-[0_0_12px_rgba(255,255,35,0.4)]">
              SCROLLYTELLING INTELLIGENCE
            </span>
            <span className="hidden sm:inline text-xs font-mono text-stone-400">
              Autonomous Deep-Sea Recovery Sequence
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Scroll progress meter */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-stone-400">PIPELINE ADVANCE</span>
              <div className="w-28 h-2 bg-[#1A1C22] rounded-full overflow-hidden border border-[#25282F]">
                <div 
                  className="h-full bg-[#FFFF23] transition-all duration-75 shadow-[0_0_8px_#FFFF23]"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-black text-[#FFFF23] w-9 text-right">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>

            {/* Magnetic Enter App Button */}
            <MagneticButton
              onClick={onEnterApp}
              cursorText="ENTER"
              liquidMorph={true}
              className="px-4 py-2 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(255,255,35,0.35)]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MagneticButton>
          </div>

        </div>

        {/* Main Pinned Stage: 2-Column Split (Left: Self-Drawing Line & Narrative | Right: Interactive Faux 3D Model) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center py-4 min-h-0">
          
          {/* Left Column: Pinned Narrative with Self-Drawing Timeline Line (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center relative z-20 space-y-6">
            
            {/* Self-Drawing Vector Line Track + Step Pills */}
            <div className="relative pl-10">
              
              {/* SVG Self-Drawing Path */}
              <svg 
                className="absolute left-3 top-2 bottom-2 w-6 h-[95%] pointer-events-none"
                viewBox="0 0 24 400"
                fill="none"
              >
                {/* Background track line */}
                <path 
                  d="M12 0 L12 400" 
                  stroke="#20232A" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                />
                
                {/* Active Self-Drawing SVG Line */}
                <path 
                  d="M12 0 L12 400" 
                  stroke="#FFFF23" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeDasharray="400"
                  strokeDashoffset={400 - scrollProgress * 400}
                  className="transition-all duration-75"
                  style={{ filter: 'drop-shadow(0 0 6px #FFFF23)' }}
                />
              </svg>

              {/* Step Markers & Indicators */}
              <div className="flex items-center gap-2 mb-3">
                {TIMELINE_STEPS.map((step, idx) => (
                  <button
                    key={step.step}
                    onClick={() => {
                      if (containerRef.current) {
                        const targetY = (containerRef.current.clientHeight - window.innerHeight) * (idx / (TIMELINE_STEPS.length - 1));
                        window.scrollTo({
                          top: containerRef.current.offsetTop + targetY,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      activeStepIndex === idx
                        ? 'bg-[#FFFF23] text-black shadow-[0_0_10px_rgba(255,255,35,0.5)] font-black scale-105'
                        : 'bg-[#141518] text-stone-400 hover:text-white border border-[#20232A]'
                    }`}
                  >
                    0{step.step}
                  </button>
                ))}
              </div>

              {/* Phase Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFF23]/15 border border-[#FFFF23]/30 text-[#FFFF23] text-xs font-mono font-black tracking-wider uppercase mb-2">
                {activeStep.icon}
                <span>{activeStep.phase} — {activeStep.badge}</span>
              </div>

              {/* Animated Heading that morphs per phase */}
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight transition-all duration-300">
                {activeStep.title}
              </h2>

              {/* Phase Narrative Description */}
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mt-2 font-medium transition-all duration-300">
                {activeStep.desc}
              </p>

              {/* Live Subsystem Telemetry Spec Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                {activeStep.telemetry.map((t, i) => (
                  <div 
                    key={i} 
                    className="p-3 rounded-xl bg-[#121316] border border-[#20232A] glass-morph-card"
                  >
                    <span className="text-[10px] font-mono text-stone-400 uppercase block">{t.label}</span>
                    <span className="text-xs font-mono font-bold text-[#FFFF23] mt-0.5 block">{t.val}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons with Magnetic Pull & Liquid Morph */}
              <div className="flex items-center gap-3 pt-4">
                <MagneticButton
                  onClick={onEnterApp}
                  cursorText="OPEN"
                  className="px-5 py-2.5 rounded-xl bg-[#FFFF23] text-black text-xs font-black tracking-wide uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,35,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inspect Live Sensor Stream</span>
                </MagneticButton>

                <MagneticButton
                  onClick={() => {
                    // Trigger wireframe pulse or orientation flip
                    if (modelRef.current) {
                      modelRef.current.setTargetRotation(
                        (Math.random() - 0.5) * 0.8,
                        Math.random() * Math.PI * 2
                      );
                    }
                  }}
                  strength={0.25}
                  className="px-4 py-2.5 rounded-xl bg-[#141518] hover:bg-[#1A1C22] border border-[#25282F] text-xs font-bold text-white transition-all"
                >
                  <Radio className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>Cycle Perspective</span>
                </MagneticButton>
              </div>

            </div>

          </div>

          {/* Right Column: Interactive Faux 3D Marine Towfish Display (7 cols) */}
          <div className="lg:col-span-7 h-[380px] sm:h-[480px] lg:h-[540px] relative z-20 flex flex-col justify-center">
            
            {/* 3D Model Display with Scroll Rotation & Mouse Inertia */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-[#20232A] shadow-2xl bg-radial from-[#121316] to-[#0C0D0E]">
              <Faux3DMarineModel
                ref={modelRef}
                scrollProgress={scrollProgress}
                autoRotate={false}
                wireframeDefault={false}
                showControls={true}
              />
            </div>

          </div>

        </div>

        {/* Bottom Scrollytelling Ribbon with Step Indicators */}
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono pt-2 border-t border-[#1C1E24]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFFF23] animate-ping" />
            <span className="text-stone-400">Scroll to advance through marine detection lifecycle</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Interactive Three.js WebGL Model</span>
            <span className="text-[#FFFF23] font-bold">STAGE {activeStepIndex + 1} OF {TIMELINE_STEPS.length}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
