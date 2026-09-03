import React from 'react';
import { Sparkles, Radio, Activity, Compass, Cpu, ShieldCheck } from 'lucide-react';

interface HeyneshTickerProps {
  detectionsCount: number;
  incidentsCount: number;
  activeMissionsCount: number;
}

export const HeyneshTicker: React.FC<HeyneshTickerProps> = ({
  detectionsCount,
  incidentsCount,
  activeMissionsCount
}) => {
  const tickerItems = [
    { icon: Radio, label: 'SYSTEM STATUS', val: 'REAL-TIME TELEMETRY ACTIVE', highlight: true },
    { icon: Compass, label: 'GEO SECTOR', val: 'GULF OF MANNAR & PALK STRAIT (10.954°N, 78.076°E)' },
    { icon: Activity, label: 'LIVE PIPELINE', val: `${detectionsCount} DETECTIONS LOGGED • ${incidentsCount} INCIDENTS` },
    { icon: Cpu, label: 'AI NEURAL ENGINE', val: 'YOLOv8-MARINE + SIDE-SCAN SONARNET ONLINE', highlight: true },
    { icon: ShieldCheck, label: 'OPS STATUS', val: `${activeMissionsCount} MISSIONS DISPATCHED • 0 GHOST DELAYS` },
    { icon: Sparkles, label: 'OBJECT CLASSIFICATION', val: 'BOUNDING BOX TELEMETRY & CONFIDENCE VERIFIED' },
  ];

  return (
    <div className="w-full bg-[#08090A] border-y border-[#20232A] overflow-hidden py-1.5 text-[11px] font-mono select-none flex items-center">
      <div className="flex shrink-0 items-center gap-2 px-3 py-0.5 bg-[#FFFF23] text-black font-extrabold text-[10px] tracking-wider uppercase rounded-r-md z-10 shadow-[0_0_12px_rgba(255,255,35,0.4)]">
        <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
        LIVE
      </div>

      <div className="relative flex overflow-x-hidden flex-1">
        <div className="flex animate-ticker whitespace-nowrap gap-8 items-center pl-4">
          {[...tickerItems, ...tickerItems].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="inline-flex items-center gap-2 text-white/75">
                <Icon className={`w-3 h-3 ${item.highlight ? 'text-[#FFFF23]' : 'text-white/40'}`} />
                <span className="font-bold text-[#FFFF23] text-[10px] tracking-wider uppercase">
                  {item.label}:
                </span>
                <span className="text-stone-300 font-medium">{item.val}</span>
                <span className="text-white/20 ml-2">/</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
