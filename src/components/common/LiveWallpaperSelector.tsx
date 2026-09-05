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
  Maximize2,
  Eye,
  Zap,
  Activity
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
        return <Radar className="w-4 h-4 text-[#FFFF23]" />;
    }
  };

  const handleSelectTheme = (themeId: WallpaperTheme) => {
    wallpaperService.setTheme(themeId);
    const selected = WALLPAPER_THEMES.find(t => t.id === themeId);
    setToastMessage(`Switched to ${selected?.name || themeId}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLaunchCinematic = () => {
    setIsOpen(false);
    wallpaperService.setShowcaseMode(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button in Navigation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141518] hover:bg-[#1C1E24] border border-[#25282F] hover:border-[#FFFF23] text-stone-200 hover:text-white text-xs font-bold transition-all shadow-xs group"
        title="Live Ocean Wallpaper Controls"
      >
        <div className="relative flex items-center justify-center">
          {getThemeIcon(config.theme)}
          {config.enabled && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFFF23] animate-ping" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-stone-400 font-normal hidden sm:inline">Theme:</span>
          <span className="font-extrabold text-[#FFFF23] group-hover:text-white transition-colors max-w-[120px] truncate">
            {currentTheme.name.split(' ')[0]}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#FFFF23]' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-[#121316]/95 backdrop-blur-2xl border border-[#2A2E38] rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#20232A] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFFF23]/15 border border-[#FFFF23]/40 flex items-center justify-center text-[#FFFF23]">
                <Radar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Live Ocean Wallpaper</h4>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interactive 60FPS Maritime Engine</span>
                </div>
              </div>
            </div>

            {/* Power Toggle Button */}
            <button
              onClick={() => {
                const next = wallpaperService.toggleEnabled();
                setToastMessage(next.enabled ? "Live Wallpaper Activated!" : "Live Wallpaper Paused");
                setTimeout(() => setToastMessage(null), 2500);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                config.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
              title={config.enabled ? 'Pause Wallpaper Animation' : 'Enable Live Wallpaper'}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{config.enabled ? 'ONLINE' : 'PAUSED'}</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-2 rounded-xl bg-[#FFFF23]/15 border border-[#FFFF23]/40 text-[#FFFF23] text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Theme Selector Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                Select Background Pattern
              </label>
              <span className="text-[10px] text-stone-400 font-mono">4 Modes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WALLPAPER_THEMES.map((theme) => {
                const isSelected = config.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1D24] border-[#FFFF23] shadow-[0_0_18px_rgba(255,255,35,0.25)]'
                        : 'bg-[#141518] border-[#22252D] hover:border-stone-500 text-stone-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {getThemeIcon(theme.id)}
                        <span className={`text-xs font-bold ${isSelected ? 'text-white font-black' : 'text-stone-300'}`}>
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#FFFF23] text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-400 leading-tight">
                      {theme.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fullscreen Cinematic Showcase Launch Button */}
          <button
            onClick={handleLaunchCinematic}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFFF23] to-[#2DD4BF] text-black hover:opacity-90 text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_20px_rgba(255,255,35,0.3)] flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Open Cinematic Fullscreen View</span>
          </button>

          {/* Adjustments: Intensity & Visibility Slider */}
          <div className="p-3 rounded-xl bg-[#16181D] border border-[#22252D] space-y-3">
            
            {/* Glow Intensity Level */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-stone-300 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FFFF23]" />
                <span>Glow Level</span>
              </span>
              <div className="flex items-center gap-1">
                {(['subtle', 'vibrant', 'ultra'] as WallpaperIntensity[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => wallpaperService.setIntensity(mode)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                      config.intensity === mode
                        ? 'bg-[#FFFF23] text-black font-black shadow-[0_0_8px_rgba(255,255,35,0.4)]'
                        : 'bg-[#20232A] text-stone-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility Opacity Slider */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-stone-300 uppercase flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Visibility</span>
              </span>
              <div className="flex items-center gap-1">
                {[
                  { label: '50%', val: 0.5 },
                  { label: '75%', val: 0.75 },
                  { label: '100%', val: 1.0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => wallpaperService.setOpacity(item.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      (config.opacity ?? 0.95) === item.val
                        ? 'bg-[#2DD4BF] text-black font-black'
                        : 'bg-[#20232A] text-stone-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Velocity */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-stone-300 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#818CF8]" />
                <span>Speed</span>
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
                        ? 'bg-[#818CF8] text-black font-black'
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
            <span>Mouse interactive with towfish reticle</span>
            <span className="text-[#FFFF23] font-bold">Hardware Accelerated</span>
          </div>

        </div>
      )}
    </div>
  );
};
