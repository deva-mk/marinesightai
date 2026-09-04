export type WallpaperTheme = 
  | 'SONAR_SWEEP' 
  | 'BIOLUMINESCENT_ABYSS' 
  | 'NEURAL_SENSOR_MESH' 
  | 'OCEANIC_CAUSTICS_WAVES';

export type WallpaperIntensity = 'subtle' | 'vibrant' | 'stealth';

export interface WallpaperConfig {
  theme: WallpaperTheme;
  intensity: WallpaperIntensity;
  enabled: boolean;
  interactiveMouse: boolean;
  speed: number; // 0.5 to 2.0
}

const STORAGE_KEY = 'ms_live_wallpaper_config';

export const WALLPAPER_THEMES: {
  id: WallpaperTheme;
  name: string;
  subtitle: string;
  iconName: string;
  primaryColor: string;
  badge: string;
  description: string;
}[] = [
  {
    id: 'SONAR_SWEEP',
    name: 'Abyssal Sonar Radar',
    subtitle: '455 kHz Side-Scan Acoustic Sweep',
    iconName: 'Radar',
    primaryColor: '#FFFF23',
    badge: 'Hydroacoustic',
    description: 'Rotating dual-frequency naval sonar sweep with bathymetric range rings, acoustic shadows, and pinging debris targets.'
  },
  {
    id: 'BIOLUMINESCENT_ABYSS',
    name: 'Bioluminescent Abyss',
    subtitle: 'Deep Sea Plankton & Bio-Glow Currents',
    iconName: 'Sparkles',
    primaryColor: '#2DD4BF',
    badge: 'Pelagic',
    description: 'Drifting glowing marine snow, bioluminescent plankton particles, and hydrodynamic fluid currents that react to your cursor.'
  },
  {
    id: 'NEURAL_SENSOR_MESH',
    name: 'AUV Neural Swarm Mesh',
    subtitle: 'Autonomous Sensor Data Fabric',
    iconName: 'Cpu',
    primaryColor: '#38BDF8',
    badge: 'Cyber-Marine',
    description: 'Interconnected underwater telemetry nodes exchanging encrypted acoustic packets with dynamic vector field physics.'
  },
  {
    id: 'OCEANIC_CAUSTICS_WAVES',
    name: 'Oceanic Fluid Caustics',
    subtitle: 'Deep Thermocline Wave Undulations',
    iconName: 'Waves',
    primaryColor: '#818CF8',
    badge: 'Oceanographic',
    description: 'Multi-layered undulating bathymetric wave ribbons with refractive ambient underwater light caustics and tidal drifts.'
  }
];

const DEFAULT_CONFIG: WallpaperConfig = {
  theme: 'SONAR_SWEEP',
  intensity: 'vibrant',
  enabled: true,
  interactiveMouse: true,
  speed: 1.0,
};

type Listener = (config: WallpaperConfig) => void;
const listeners: Set<Listener> = new Set();

export const wallpaperService = {
  getConfig(): WallpaperConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_CONFIG;
  },

  setConfig(config: Partial<WallpaperConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage error
    }
    listeners.forEach((fn) => fn(updated));
    return updated;
  },

  setTheme(theme: WallpaperTheme) {
    return this.setConfig({ theme, enabled: true });
  },

  setIntensity(intensity: WallpaperIntensity) {
    return this.setConfig({ intensity });
  },

  toggleEnabled() {
    const curr = this.getConfig();
    return this.setConfig({ enabled: !curr.enabled });
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
