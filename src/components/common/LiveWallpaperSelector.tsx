import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Radar, 
  Cpu, 
  Waves, 
  Sliders, 
  Check, 
  Power, 
  ChevronDown, 
  Play, 
  Pause,
  Sun,
  Eye,
  Zap
} from 'lucide-react';
import { 
  wallpaperService, 
  WallpaperConfig, 
  WallpaperTheme, 
  WALLPAPER_THEMES,
  WallpaperIntensity 
} from '../../services/wallpaperService';

interface LiveWallpaperSelectorProps {
  className?: string;
}

export const LiveWallpaperSelector: React.FC<LiveWallpaperSelectorProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<WallpaperConfig>(() => wallpaperService.getConfig());
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return wallpaperService.subscribe((newConfig) => {
      setConfig(newConfig);
    });
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const currentTheme = WALLPAPER_THEMES.find((t) => t.id === config.theme) || WALLPAPER_THEMES[0];

  const getThemeIcon = (id: WallpaperTheme) => {
    switch (id) {
      case 'SONAR_SWEEP':
        return <Radar className="w-4 h-4 text-[#FFFF23]" />;
      case 'BIOLUMINESCENT_ABYSS':
        return <Sparkles className="w-4 h-4 text-[#2DD4BF]" />;
      case 'NEURAL_SENSOR_MESH':
        return <Cpu className="w-4 h-4 text-[#38BDF8]" />;
      case 'OCEANIC_CAUSTICS_WAVES':
        return <Waves className="w-4 h-4 text-[#818CF8]" />;
      default:
        return <Radar className="w-4 h-4" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141518] hover:bg-[#1C1E24] border border-[#25282F] hover:border-[#FFFF23]/60 text-stone-200 hover:text-white text-xs font-bold transition-all shadow-xs group"
        title="Change Live Wallpaper Background"
      >
        <div className="relative">
          {getThemeIcon(config.theme)}
          {config.enabled && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFFF23] animate-ping" />
          )}
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          <span className="text-stone-400 font-normal">Wallpaper:</span>
          <span className="font-extrabold text-white group-hover:text-[#FFFF23] transition-colors max-w-[110px] truncate">
            {currentTheme.name.split(' ')[0]}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180 text-[#FFFF23]' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121316] border border-[#2A2E38] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#20232A] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFFF23]/10 border border-[#FFFF23]/30 flex items-center justify-center text-[#FFFF23]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Live Ocean Wallpaper</h4>
                <p className="text-[10px] font-mono text-stone-400">Dynamic 60FPS Maritime Visuals</p>
              </div>
            </div>

            {/* Enable/Disable toggle */}
            <button
              onClick={() => wallpaperService.toggleEnabled()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                config.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
              title={config.enabled ? 'Pause Wallpaper' : 'Enable Wallpaper'}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{config.enabled ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>

          {/* Wallpaper Modes Grid */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider block">
              Select Live Theme
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WALLPAPER_THEMES.map((theme) => {
                const isSelected = config.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      wallpaperService.setTheme(theme.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-[#181A20] border-[#FFFF23] shadow-[0_0_15px_rgba(255,255,35,0.15)]'
                        : 'bg-[#141518] border-[#22252D] hover:border-stone-500 text-stone-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {getThemeIcon(theme.id)}
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#FFFF23]" />
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight line-clamp-2">
                      {theme.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: Intensity & Speed */}
          <div className="p-3 rounded-xl bg-[#16181D] border border-[#22252D] space-y-3">
            
            {/* Intensity Selector */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-stone-300 uppercase">
                Glow Intensity
              </span>
              <div className="flex items-center gap-1">
                {(['stealth', 'subtle', 'vibrant'] as WallpaperIntensity[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => wallpaperService.setIntensity(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      config.intensity === mode
                        ? 'bg-[#FFFF23] text-black font-black'
                        : 'bg-[#20232A] text-stone-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-stone-300 uppercase">
                Simulation Velocity
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: '0.5x', val: 0.5 },
                  { label: '1.0x', val: 1.0 },
                  { label: '1.5x', val: 1.5 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => wallpaperService.setConfig({ speed: s.val })}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      (config.speed || 1.0) === s.val
                        ? 'bg-[#2DD4BF] text-black font-black'
                        : 'bg-[#20232A] text-stone-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-[#20232A] flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>Interactive: reacts to cursor movement & click</span>
            <span className="text-[#FFFF23]">Hardware Accelerated</span>
          </div>

        </div>
      )}
    </div>
  );
};
