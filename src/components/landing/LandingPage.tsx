import React from 'react';
import { 
  Waves, 
  Radar, 
  Eye, 
  Layers, 
  TrendingUp, 
  Ship, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Cpu, 
  FileText, 
  Navigation,
  Download
} from 'lucide-react';
import { downloadProjectZip } from '../../services/zipExport';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2A2A2A]">
      
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F9F6F0]/90 backdrop-blur-md border-b border-[#E8E1D5] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6F59] to-[#E0533D] flex items-center justify-center text-white shadow-md shadow-[#FF6F59]/30">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#2A2A2A]">
                GHOST<span className="text-[#FF6F59]">VISION</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20">
                Acoustic & Vision Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadProjectZip()}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] hover:bg-[#F2EDE4] transition-all shadow-xs"
            >
              <Download className="w-4 h-4 text-[#FF6F59]" />
              <span>Download Project ZIP</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] hover:border-[#FF6F59] transition-all shadow-xs"
            >
              Sign In
            </button>

            <button
              onClick={onEnterApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6F59] text-white hover:bg-[#E0533D] text-xs font-extrabold transition-all shadow-sm shadow-[#FF6F59]/30 group"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-20 max-w-7xl mx-auto text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6F59]/10 border border-[#FF6F59]/20 text-[#D94C36] text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Marine Debris & Underwater Anomaly Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#2A2A2A] max-w-5xl mx-auto leading-[1.1]">
          See the Invisible. <br className="hidden sm:block" />
          <span className="text-[#FF6F59]">Clean the Ocean.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#5C5449] max-w-3xl mx-auto leading-relaxed font-medium">
          MarineSight AI bridges side-scan acoustic sonar, aerial drone computer vision, and geospatial correlation to detect submerged ghost nets, plastic gyres, and underwater hazards before marine habitats collapse.
        </p>

        {/* CTA Group */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnterApp}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FF6F59] hover:bg-[#E0533D] text-white font-extrabold text-sm shadow-lg shadow-[#FF6F59]/30 transition-all hover:scale-102"
          >
            <span>Launch Live Intelligence Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => downloadProjectZip()}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-[#DDD5C7] hover:border-[#2A2A2A] text-[#2A2A2A] font-bold text-sm shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-[#4F6F52]" />
            <span>Get Source Code (.ZIP)</span>
          </button>
        </div>

        {/* Key Metrics Banner */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-[#FF6F59]">96.2%</p>
            <p className="text-xs font-bold text-[#5C5449] mt-1">Fusion mAP Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-[#4F6F52]">50+</p>
            <p className="text-xs font-bold text-[#5C5449] mt-1">Acoustic & Vision Targets</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-[#2A2A2A]">1,280 kg</p>
            <p className="text-xs font-bold text-[#5C5449] mt-1">Ghost Gear Recovered</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
            <p className="text-2xl sm:text-3xl font-black text-[#FF6F59]">100%</p>
            <p className="text-xs font-bold text-[#5C5449] mt-1">Deployable Cloud Ready</p>
          </div>
        </div>

      </section>

      {/* Technology Flowchart Architecture Section */}
      <section className="py-16 bg-[#F2EDE4] border-y border-[#E3DBD0] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-extrabold text-[#FF6F59] tracking-widest uppercase mb-2">
              SYSTEM ARCHITECTURE
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A]">
              End-to-End Multimodal Marine Intelligence Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-[#736B5E] mt-2">
              From raw hydroacoustic transducer frequencies to drone telemetry and automated diver dispatch.
            </p>
          </div>

          {/* Visual Interactive Flowchart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Sonar Pipeline */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#FF6F59]/15 text-[#FF6F59]">
                  <Radar className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#2A2A2A]">1. Hydroacoustic Sonar</h4>
                  <span className="text-[11px] text-[#736B5E]">Side-Scan Sonar (.SL2, .JSF, .XTF)</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-[#5C5449]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>Bilateral noise & slant-range correction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>Acoustic shadow & highlight segmentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>Random Forest + Sonar-YOLO crab/net classifier</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Surface Vision */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#4F6F52]/15 text-[#4F6F52]">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#2A2A2A]">2. Surface Optical Vision</h4>
                  <span className="text-[11px] text-[#736B5E]">Drones & Vessel Cameras</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-[#5C5449]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>YOLOv8-Marine object detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>Multi-frame tracking & velocity vectors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>Surface polymer slick & line recognition</span>
                </li>
              </ul>
            </div>

            {/* Column 3: Fusion & Operations */}
            <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#2A2A2A] text-white">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#2A2A2A]">3. Multimodal Fusion</h4>
                  <span className="text-[11px] text-[#736B5E]">Spatial-Temporal Graph Engine</span>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-[#5C5449]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Correlates seafloor acoustic shadow + aerial buoy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Predicts eddy accumulation & risk scores</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Automates cleanup taskforce dispatch</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#F9F6F0] px-6 lg:px-12 border-t border-[#E8E1D5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736B5E]">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[#FF6F59]" />
            <span className="font-bold text-[#2A2A2A]">MarineSight AI Marine Intelligence</span>
            <span>— AI Marine Debris & Underwater Anomaly Platform</span>
          </div>

          <div className="flex items-center gap-4 font-semibold">
            <button onClick={onEnterApp} className="hover:text-[#FF6F59]">Dashboard</button>
            <button onClick={() => downloadProjectZip()} className="hover:text-[#FF6F59]">Download ZIP</button>
            <button onClick={onOpenAuth} className="hover:text-[#FF6F59]">Sign In</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
