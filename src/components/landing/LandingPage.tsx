import React, { useState } from 'react';
import { 
  Waves, 
  Radar, 
  Eye, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Ship,
  Compass,
  Radio,
  Cpu,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ScrollytellingSection } from './ScrollytellingSection';
import { MagneticButton } from '../common/MagneticButton';
import { AnimatedLogo } from '../common/AnimatedLogo';
import { AmbientGradients } from '../common/AmbientGradients';
import { CustomCursor } from '../common/CustomCursor';
import { HeyneshTicker } from '../common/HeyneshTicker';
import { Faux3DMarineModel } from '../common/Faux3DMarineModel';
import { LiveWallpaper } from '../common/LiveWallpaper';
import { LiveWallpaperSelector } from '../common/LiveWallpaperSelector';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  const [selectedSpecTab, setSelectedSpecTab] = useState<'sonar' | 'vision' | 'fusion'>('sonar');

  return (
    <div className="min-h-screen bg-[#0C0D0E]/50 text-[#F3F3F3] relative selection:bg-[#FFFF23] selection:text-black">
      {/* 60FPS Live Ocean Wallpaper Background */}
      <LiveWallpaper />

      {/* Magnetic Cursor */}
      <CustomCursor />

      {/* Ambient Moving Glow Gradients */}
      <AmbientGradients intensity="subtle" />

      {/* Top Floating Glass Navigation */}
      <nav className="sticky top-0 z-40 bg-[#0C0D0E]/85 backdrop-blur-xl border-b border-[#20232A] px-6 lg:px-12 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Animated Logo with Vector Hover Morphing */}
          <AnimatedLogo size="md" />

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <LiveWallpaperSelector />

            <MagneticButton
              onClick={onOpenAuth}
              cursorText="LOGIN"
              className="px-4 py-2 rounded-xl bg-[#141518] hover:bg-[#1A1C22] border border-[#25282F] text-xs font-bold text-stone-300 hover:text-white transition-all"
            >
              Sign In
            </MagneticButton>

            <MagneticButton
              onClick={onEnterApp}
              cursorText="LAUNCH"
              liquidMorph={true}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFF23] text-black hover:bg-white text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(255,255,35,0.4)]"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MagneticButton>
          </div>

        </div>
      </nav>

      {/* Heynesh Infinite Marquee Ticker */}
      <HeyneshTicker
        detectionsCount={12}
        incidentsCount={4}
        activeMissionsCount={2}
      />

      {/* ================= HERO SECTION ================= */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto text-center z-10">
        
        {/* Animated Pill Badge with pulse */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16181D] border border-[#20232A] text-[#FFFF23] text-xs font-mono font-bold mb-6 shadow-[0_0_15px_rgba(255,255,35,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#FFFF23] animate-ping" />
          <span>Multimodal Hydroacoustic Sonar & Optical Vision Architecture</span>
        </div>

        {/* Display Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
          See the Invisible. <br className="hidden sm:block" />
          <span className="text-[#FFFF23] underline decoration-[#FFFF23]/40 underline-offset-8">
            Clean the Ocean.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-lg text-stone-400 max-w-3xl mx-auto leading-relaxed font-normal">
          MarineSight AI bridges dual-frequency side-scan acoustic sonar, aerial drone computer vision, and geospatial correlation to detect submerged ghost fishing nets, plastics, and benthic anomalies before marine biospheres collapse.
        </p>

        {/* Magnetic CTA Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            onClick={onEnterApp}
            cursorText="COMMAND"
            liquidMorph={true}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FFFF23] hover:bg-white text-black font-black text-sm shadow-[0_0_25px_rgba(255,255,35,0.45)] transition-all"
          >
            <span>Launch Live Intelligence Platform</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </MagneticButton>

          <MagneticButton
            onClick={() => {
              const el = document.getElementById('scrollytelling-experience');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            cursorText="SCROLL"
            strength={0.25}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#141518] hover:bg-[#1A1C22] border border-[#25282F] hover:border-[#FFFF23]/60 text-white font-bold text-sm transition-all"
          >
            <Radio className="w-4 h-4 text-[#FFFF23]" />
            <span>Scroll-Driven Tech Tour</span>
          </MagneticButton>
        </div>

        {/* Key Metrics Quick Band */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A] glass-morph-card text-left">
            <p className="text-2xl sm:text-3xl font-black text-[#FFFF23]">96.2%</p>
            <p className="text-xs font-mono text-stone-400 mt-1 uppercase">Acoustic & Vision mAP</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A] glass-morph-card text-left">
            <p className="text-2xl sm:text-3xl font-black text-[#2DD4BF]">455 kHz</p>
            <p className="text-xs font-mono text-stone-400 mt-1 uppercase">Side-Scan Sonar Chirp</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A] glass-morph-card text-left">
            <p className="text-2xl sm:text-3xl font-black text-white">&lt; 8.4 ms</p>
            <p className="text-xs font-mono text-stone-400 mt-1 uppercase">Edge YOLOv8 Latency</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A] glass-morph-card text-left">
            <p className="text-2xl sm:text-3xl font-black text-[#FFFF23]">600m</p>
            <p className="text-xs font-mono text-stone-400 mt-1 uppercase">Autonomous Depth Rating</p>
          </div>
        </div>

      </section>

      {/* ================= SCROLLYTELLING PINNED SECTION ================= */}
      <section id="scrollytelling-experience">
        <ScrollytellingSection onEnterApp={onEnterApp} />
      </section>

      {/* ================= FAUX 3D HARDWARE INTERACTIVE LAB ================= */}
      <section className="py-24 px-6 lg:px-12 bg-[#0C0D0E]/60 backdrop-blur-md border-t border-[#20232A]/60 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-[#FFFF23] text-black uppercase">
                  INSTRUMENTATION LAB
                </span>
                <span className="text-xs font-mono text-stone-400">Proteus AUV-6000 Deep Tow System</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Interactive 3D Submersible Telemetry
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
                Inspect physical transducer geometries, hydrodynamic fairings, and edge neural processing enclosures with full 360° mouse-drag and wireframe toggles.
              </p>
            </div>

            {/* Spec Filter Pills */}
            <div className="flex bg-[#141518] p-1 rounded-xl border border-[#25282F] self-start md:self-auto">
              {(['sonar', 'vision', 'fusion'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedSpecTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    selectedSpecTab === tab
                      ? 'bg-[#FFFF23] text-black font-black shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tab.toUpperCase()} SPEC
                </button>
              ))}
            </div>
          </div>

          {/* 3D Model Sandbox Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* 3D Model Display (8 cols) */}
            <div className="lg:col-span-8 h-[450px] sm:h-[520px]">
              <Faux3DMarineModel
                autoRotate={true}
                wireframeDefault={false}
                showControls={true}
              />
            </div>

            {/* Specs & Hardware Features (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              
              {selectedSpecTab === 'sonar' && (
                <div className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] glass-morph-card space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#FFFF23]/15 text-[#FFFF23]">
                      <Radar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Dual-Frequency Transducer</h4>
                      <p className="text-[11px] font-mono text-stone-400">455 kHz / 900 kHz Chirp</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Projects high-resolution acoustic acoustic fans up to 120m port and starboard. Penetrates extreme turbidity to extract geometric shadows of abandoned gill nets and traps.
                  </p>
                  <div className="pt-2 border-t border-[#20232A] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-stone-400">
                      <span>Horizontal Beamwidth:</span>
                      <span className="text-[#FFFF23] font-bold">0.5° Narrow Chirp</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Pulse Compression:</span>
                      <span className="text-white font-bold">Matched Filter</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedSpecTab === 'vision' && (
                <div className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] glass-morph-card space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF]">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Optical Micro-Gimbal & TPU</h4>
                      <p className="text-[11px] font-mono text-stone-400">4K HDR @ 120 FPS</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Integrated edge tensor core running YOLOv8-Marine object detection. Capable of classifying monofilament lines, floating buoys, and derelict ropes in real time.
                  </p>
                  <div className="pt-2 border-t border-[#20232A] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-stone-400">
                      <span>Inference Speed:</span>
                      <span className="text-[#2DD4BF] font-bold">8.4 ms</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Low-Light Sens:</span>
                      <span className="text-white font-bold">0.0001 Lux</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedSpecTab === 'fusion' && (
                <div className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] glass-morph-card space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/15 text-[#FFFF23]">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Spatial-Temporal Fusion Engine</h4>
                      <p className="text-[11px] font-mono text-stone-400">Graph Neural Network</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Combines bathymetric currents, seafloor acoustic highlights, and surface drone sighting coordinates into probabilistic threat matrices for autonomous dispatch.
                  </p>
                  <div className="pt-2 border-t border-[#20232A] space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-stone-400">
                      <span>Spatial Index:</span>
                      <span className="text-[#FFFF23] font-bold">Uber H3 Grid</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Correlation Drift:</span>
                      <span className="text-white font-bold">&lt; 3.2m Tolerance</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Launch Card */}
              <div className="p-5 rounded-3xl bg-[#141518] border border-[#25282F] space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FFFF23]" />
                  <span className="text-xs font-bold text-white">Ready for Operations</span>
                </div>
                <p className="text-xs text-stone-400 leading-normal">
                  Access the live dashboard to upload side-scan sonar recordings, evaluate drone images with YOLOv8, or dispatch cleanup missions.
                </p>
                <MagneticButton
                  onClick={onEnterApp}
                  cursorText="OPEN"
                  className="w-full py-2.5 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(255,255,35,0.3)]"
                >
                  Enter Operational Command
                </MagneticButton>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#0C0D0E]/60 backdrop-blur-md px-6 lg:px-12 border-t border-[#20232A]/60 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">MARINESIGHT AI</span>
            <span>— Multimodal Acoustic Sonar & Vision Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <button onClick={onEnterApp} className="hover:text-[#FFFF23] transition-colors">Command Dashboard</button>
            <button onClick={onOpenAuth} className="hover:text-[#FFFF23] transition-colors">Authentication</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
