import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Navigation, 
  Radar, 
  Eye, 
  Plane, 
  Ship, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Compass, 
  ChevronRight,
  Sparkles,
  Flame,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Maximize2,
  Download,
  Share2,
  Calendar,
  Radio,
  Sliders,
  Anchor,
  Compass as CompassIcon,
  Navigation2,
  Waves,
  Target,
  LocateFixed,
  Map as MapIcon
} from 'lucide-react';
import { DetectionRecord, IncidentRecord, HotspotRecord, CleanupMission, DroneMission } from '../../types';
import { SAMPLE_DRONE_MISSIONS } from '../../data/sampleData';

interface HotspotMapProps {
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  hotspots?: HotspotRecord[];
  missions?: CleanupMission[];
  onNavigate: (view: string, id?: string) => void;
}

// Marine Sector presets for rapid focal zooming
interface SectorPreset {
  id: string;
  name: string;
  code: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  description: string;
}

const SECTOR_PRESETS: SectorPreset[] = [
  {
    id: 'ALL',
    name: 'Auto-Fit All Sectors (Full Coastal Corridor)',
    code: 'OVERALL',
    minLat: 10.9250,
    maxLat: 10.9850,
    minLng: 78.0550,
    maxLng: 78.1050,
    description: 'Dynamic auto-framing of all marine hotspots, sonar detections, and aerial observations.'
  },
  {
    id: 'SEC-4B',
    name: 'Sector 4B - Sanctuary Coral Core',
    code: 'SEC-4B',
    minLat: 10.9450,
    maxLat: 10.9620,
    minLng: 78.0730,
    maxLng: 78.0890,
    description: 'High-density ghost net hotspot with critical benthic marine life entanglement risks.'
  },
  {
    id: 'SEC-4A',
    name: 'Sector 4A - Palk Strait Convergence',
    code: 'SEC-4A',
    minLat: 10.9520,
    maxLat: 10.9680,
    minLng: 78.0700,
    maxLng: 78.0880,
    description: 'Strong tidal surface rips and microplastic vortex accumulating buoyant polymers.'
  },
  {
    id: 'SEC-5',
    name: 'Sector 5 - Anchorage Deep Trench',
    code: 'SEC-5',
    minLat: 10.9300,
    maxLat: 10.9480,
    minLng: 78.0800,
    maxLng: 78.0990,
    description: 'Deep bathymetric sand shelf with industrial metal containers and heavy vessel debris.'
  },
  {
    id: 'SEC-3',
    name: 'Sector 3 - Outer Barrier Pinnacles',
    code: 'SEC-3',
    minLat: 10.9550,
    maxLat: 10.9720,
    minLng: 78.0670,
    maxLng: 78.0830,
    description: 'Shallow reef crest subject to discarded longlines and monofilament snagging.'
  },
  {
    id: 'SEC-2',
    name: 'Sector 2 - Heritage Shoals',
    code: 'SEC-2',
    minLat: 10.9630,
    maxLat: 10.9800,
    minLng: 78.0600,
    maxLng: 78.0760,
    description: 'Historical shallow navigation channel with submerged timber anomalies.'
  }
];

export const HotspotMap: React.FC<HotspotMapProps> = ({
  detections = [],
  incidents = [],
  hotspots = [],
  missions = [],
  onNavigate
}) => {
  const safeHotspots = hotspots || [];
  const safeDetections = detections || [];
  const safeIncidents = incidents || [];
  const safeMissions = missions || [];

  // Default initial hotspot
  const defaultHotspot: HotspotRecord = safeHotspots[0] || {
    id: 'HS-01',
    name: 'Mannar Sanctuary Benthic Gyre',
    sector: 'Sector 4B',
    centerLat: 10.9541,
    centerLng: 78.0812,
    radiusMeters: 450,
    detectionCount: 19,
    dominantCategory: 'Ghost Fishing Gear',
    riskScore: 94,
    recurrenceIndex: 9.2,
    lastActivity: new Date().toISOString(),
    currentVelocityKnots: 0.42
  };

  // State Management
  const [selectedTarget, setSelectedTarget] = useState<any>(defaultHotspot);
  const [selectedTargetType, setSelectedTargetType] = useState<'HOTSPOT' | 'INCIDENT' | 'DETECTION' | 'CUSTOM'>('HOTSPOT');
  const [activeSector, setActiveSector] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [mapStyle, setMapStyle] = useState<'NAUTICAL' | 'SATELLITE' | 'HEATMAP' | 'BATHYMETRY'>('NAUTICAL');
  
  // Layer Toggles
  const [layerHotspots, setLayerHotspots] = useState<boolean>(true);
  const [layerIncidents, setLayerIncidents] = useState<boolean>(true);
  const [layerDetections, setLayerDetections] = useState<boolean>(false);
  const [layerDroneCorridors, setLayerDroneCorridors] = useState<boolean>(true);
  const [layerCleanupVessels, setLayerCleanupVessels] = useState<boolean>(true);
  const [layerDensityHeatmap, setLayerDensityHeatmap] = useState<boolean>(true);
  const [layerBathymetryGrid, setLayerBathymetryGrid] = useState<boolean>(true);

  // User GPS & Custom Pin State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; isLiveGPS: boolean; accuracy?: number }>({ 
    lat: 10.9541, 
    lng: 78.0812,
    isLiveGPS: false 
  });
  const [customPin, setCustomPin] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isManualInputOpen, setIsManualInputOpen] = useState<boolean>(false);
  const [manualLat, setManualLat] = useState<string>('10.9541');
  const [manualLng, setManualLng] = useState<string>('78.0812');

  // Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Geographic Bounding Box computation (auto-frames all loaded items)
  const bounds = useMemo(() => {
    if (activeSector !== 'ALL') {
      const preset = SECTOR_PRESETS.find(s => s.id === activeSector);
      if (preset) {
        return {
          minLat: preset.minLat,
          maxLat: preset.maxLat,
          minLng: preset.minLng,
          maxLng: preset.maxLng
        };
      }
    }

    // Dynamic bounding calculation covering all loaded items + user position
    const allLats: number[] = [];
    const allLngs: number[] = [];

    safeHotspots.forEach(h => {
      allLats.push(h.centerLat);
      allLngs.push(h.centerLng);
    });

    safeIncidents.forEach(inc => {
      allLats.push(inc.location.lat);
      allLngs.push(inc.location.lng);
    });

    safeDetections.forEach(det => {
      allLats.push(det.location.lat);
      allLngs.push(det.location.lng);
    });

    if (userLocation.isLiveGPS) {
      allLats.push(userLocation.lat);
      allLngs.push(userLocation.lng);
    }

    if (customPin) {
      allLats.push(customPin.lat);
      allLngs.push(customPin.lng);
    }

    if (allLats.length === 0 || allLngs.length === 0) {
      return {
        minLat: 10.9250,
        maxLat: 10.9850,
        minLng: 78.0550,
        maxLng: 78.1050
      };
    }

    const minL = Math.min(...allLats);
    const maxL = Math.max(...allLats);
    const minG = Math.min(...allLngs);
    const maxG = Math.max(...allLngs);

    const latMargin = Math.max(0.008, (maxL - minL) * 0.15);
    const lngMargin = Math.max(0.008, (maxG - minG) * 0.15);

    return {
      minLat: minL - latMargin,
      maxLat: maxL + latMargin,
      minLng: minG - lngMargin,
      maxLng: maxG + lngMargin
    };
  }, [activeSector, safeHotspots, safeIncidents, safeDetections, userLocation, customPin]);

  // Precise Coordinate Projection Formula (lat/lng -> % X/Y on SVG canvas)
  const project = (lat: number, lng: number) => {
    const latSpan = bounds.maxLat - bounds.minLat;
    const lngSpan = bounds.maxLng - bounds.minLng;
    
    // X is longitude (left to right)
    const xPct = ((lng - bounds.minLng) / (lngSpan || 0.001)) * 100;
    // Y is latitude (top is maxLat, bottom is minLat)
    const yPct = ((bounds.maxLat - lat) / (latSpan || 0.001)) * 100;

    return {
      x: Math.max(-5, Math.min(105, xPct)),
      y: Math.max(-5, Math.min(105, yPct))
    };
  };

  // Convert canvas pixel position to exact geographical Latitude & Longitude
  const pixelToLatLon = (pixelX: number, pixelY: number, width: number, height: number) => {
    const xPct = Math.max(0, Math.min(1, pixelX / width));
    const yPct = Math.max(0, Math.min(1, pixelY / height));

    const latSpan = bounds.maxLat - bounds.minLat;
    const lngSpan = bounds.maxLng - bounds.minLng;

    const lat = bounds.maxLat - (yPct * latSpan);
    const lng = bounds.minLng + (xPct * lngSpan);

    return {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5))
    };
  };

  // Convert click on SVG canvas back into accurate geographical Latitude & Longitude
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { lat, lng } = pixelToLatLon(clickX, clickY, rect.width, rect.height);

    setCustomPin({ lat, lng });
    setSelectedTarget({
      id: `INSPECT-${lat.toFixed(3)}-${lng.toFixed(3)}`,
      name: `Geospatial Marine Inspection Target`,
      sector: activeSector === 'ALL' ? 'Coastal Transect' : activeSector,
      centerLat: lat,
      centerLng: lng,
      radiusMeters: 250,
      detectionCount: safeDetections.filter(d => getDistanceKm(lat, lng, d.location.lat, d.location.lng) < 1.0).length,
      dominantCategory: 'Survey Target',
      riskScore: 72,
      recurrenceIndex: 6.8,
      lastActivity: new Date().toISOString(),
      currentVelocityKnots: 0.45
    });
    setSelectedTargetType('CUSTOM');
  };

  // Live mouse hover coordinate tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { lat, lng } = pixelToLatLon(x, y, rect.width, rect.height);
    setHoverCoord({ lat, lng });
  };

  // GPS Acquisition
  const handleLocateMe = () => {
    setLocating(true);
    setGpsError(null);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          setUserLocation({ 
            lat, 
            lng, 
            isLiveGPS: true,
            accuracy: Math.round(pos.coords.accuracy)
          });
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation access fallback to station coordinates:', err.message);
          setUserLocation({ 
            lat: 10.9541, 
            lng: 78.0812, 
            isLiveGPS: false 
          });
          setGpsError('Browser GPS restricted. Defaulted to Vessel RV Poseidon Anchor station (10.9541°N, 78.0812°E).');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setUserLocation({ lat: 10.9541, lng: 78.0812, isLiveGPS: false });
      setGpsError('Geolocation is not supported in this environment. Using Vessel RV Poseidon Anchor.');
      setLocating(false);
    }
  };

  const handleApplyManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserLocation({ lat, lng, isLiveGPS: true, accuracy: 10 });
      setIsManualInputOpen(false);
      setGpsError(null);
    }
  };

  // Focus and center on target
  const handleFocusTarget = () => {
    setZoomLevel(1.75);
  };

  // Distance Calculation (Haversine formula in KM & NM)
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  // True Navigational Bearing Calculation (Degrees & Compass Heading)
  const getBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
    const x = 
      Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
      Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    brng = (brng + 360) % 360;
    
    const compassHeadings = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const compassIndex = Math.round(brng / 22.5) % 16;
    return {
      degrees: Math.round(brng),
      cardinal: compassHeadings[compassIndex]
    };
  };

  // Convert decimal degrees to formatted DMS (Degrees Minutes Seconds)
  const toDMS = (deg: number, isLat: boolean) => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1);
    const direction = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  };

  // Filtered Lists
  const filteredHotspots = useMemo(() => {
    return safeHotspots.filter(h => {
      if (categoryFilter !== 'ALL' && h.dominantCategory !== categoryFilter) return false;
      if (severityFilter === 'CRITICAL' && h.riskScore < 85) return false;
      if (severityFilter === 'HIGH' && (h.riskScore < 75 || h.riskScore >= 85)) return false;
      if (severityFilter === 'MEDIUM' && h.riskScore >= 75) return false;
      return true;
    });
  }, [safeHotspots, categoryFilter, severityFilter]);

  const filteredIncidents = useMemo(() => {
    return safeIncidents.filter(inc => {
      if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
      return true;
    });
  }, [safeIncidents, categoryFilter, severityFilter]);

  const filteredDetections = useMemo(() => {
    return safeDetections.filter(det => {
      if (categoryFilter !== 'ALL' && det.category !== categoryFilter) return false;
      if (severityFilter !== 'ALL' && det.severity !== severityFilter) return false;
      return true;
    });
  }, [safeDetections, categoryFilter, severityFilter]);

  // Target coordinates for distance/bearing calculations
  const targetLat = selectedTarget?.centerLat ?? selectedTarget?.location?.lat ?? 10.9541;
  const targetLng = selectedTarget?.centerLng ?? selectedTarget?.location?.lng ?? 78.0812;
  const distKm = getDistanceKm(userLocation.lat, userLocation.lng, targetLat, targetLng);
  const distNm = (distKm * 0.539957).toFixed(2);
  const bearing = getBearing(userLocation.lat, userLocation.lng, targetLat, targetLng);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#FF6F59]" />
              Geospatial Hydrographic Navigation & Hotspots
            </span>
            <span className="text-xs text-[#736B5E] font-mono">
              Datum: WGS 84 • Dynamic Adaptive Marine Projection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight flex items-center gap-2">
            High-Precision Marine Hotspots & Spatial Coordinates
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1 max-w-3xl">
            Auto-framing geospatial projection, dynamic Lat/Lng coordinate resolution, bathymetric debris density, active salvage tracking, and real-time distance/bearing telemetry.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#4F6F52] text-xs font-bold text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all shadow-xs cursor-pointer"
            title="Acquire live GPS coordinates or center vessel location"
          >
            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin text-[#FF6F59]' : ''}`} />
            <span>{locating ? 'Acquiring GPS...' : userLocation.isLiveGPS ? 'GPS Locked' : 'Locate Me (GPS)'}</span>
          </button>

          <button
            onClick={() => setIsManualInputOpen(!isManualInputOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F9F6F0] border border-[#DDD5C7] text-xs font-bold text-[#5C5449] hover:bg-[#F2EDE4] transition-all shadow-xs cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-[#8C8275]" />
            <span>Set Coordinates</span>
          </button>

          <button
            onClick={() => onNavigate('cleanup')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6F59] text-white text-xs font-bold hover:bg-[#E85D48] transition-all shadow-xs cursor-pointer"
          >
            <Ship className="w-4 h-4" />
            <span>Dispatch Cleanup Mission</span>
          </button>
        </div>
      </div>

      {/* Manual Coordinates Input Drawer if opened */}
      {isManualInputOpen && (
        <form onSubmit={handleApplyManualLocation} className="p-4 bg-[#F2EDE4] rounded-2xl border border-[#DDD5C7] flex flex-wrap items-center justify-between gap-4 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-[#FF6F59]" />
            <span className="font-bold text-[#2A2A2A]">Manually Set Vessel / Operator Latitude & Longitude:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[#736B5E] font-mono">LAT:</span>
              <input
                type="number"
                step="0.0001"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD5C7] font-mono font-bold text-xs"
                placeholder="10.9541"
                required
              />
              <span className="text-xs font-bold text-[#736B5E]">°N</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[#736B5E] font-mono">LNG:</span>
              <input
                type="number"
                step="0.0001"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                className="w-28 px-2.5 py-1.5 rounded-lg bg-white border border-[#DDD5C7] font-mono font-bold text-xs"
                placeholder="78.0812"
                required
              />
              <span className="text-xs font-bold text-[#736B5E]">°E</span>
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 bg-[#4F6F52] hover:bg-[#3E5841] text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Update Coordinates
            </button>
            <button
              type="button"
              onClick={() => setIsManualInputOpen(false)}
              className="px-3 py-1.5 bg-white border border-[#DDD5C7] text-[#5C5449] font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* GPS Status Message if any */}
      {gpsError && (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button 
            onClick={() => setGpsError(null)} 
            className="text-[11px] font-bold underline cursor-pointer text-amber-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sector Preset Focus Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-[#5C5449] flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-[#8C8275]" /> Sector Focal Views:
        </span>
        {SECTOR_PRESETS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSector(sec.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeSector === sec.id
                ? 'bg-[#2A2A2A] text-white shadow-xs scale-105'
                : 'bg-[#F9F6F0] text-[#5C5449] hover:bg-[#F2EDE4] border border-[#E8E1D5]'
            }`}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Layer and Filter Controls Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-[#5C5449] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#8C8275]" /> Layers:
          </span>

          <label className="flex items-center gap-1.5 font-semibold text-[#2A2A2A] cursor-pointer hover:text-[#FF6F59]">
            <input 
              type="checkbox" 
              checked={layerHotspots} 
              onChange={(e) => setLayerHotspots(e.target.checked)} 
              className="accent-[#FF6F59] rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#FF6F59]" /> Hotspots ({filteredHotspots.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 font-semibold text-[#2A2A2A] cursor-pointer hover:text-red-600">
            <input 
              type="checkbox" 
              checked={layerIncidents} 
              onChange={(e) => setLayerIncidents(e.target.checked)} 
              className="accent-red-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-600" /> Incidents ({filteredIncidents.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 font-semibold text-[#2A2A2A] cursor-pointer hover:text-blue-600">
            <input 
              type="checkbox" 
              checked={layerDetections} 
              onChange={(e) => setLayerDetections(e.target.checked)} 
              className="accent-blue-600 rounded"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> All Detections ({filteredDetections.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 font-semibold text-[#2A2A2A] cursor-pointer hover:text-[#4F6F52]">
            <input 
              type="checkbox" 
              checked={layerDroneCorridors} 
              onChange={(e) => setLayerDroneCorridors(e.target.checked)} 
              className="accent-[#4F6F52] rounded"
            />
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-[#4F6F52]" /> Drone Patrols
            </span>
          </label>

          <label className="flex items-center gap-1.5 font-semibold text-[#2A2A2A] cursor-pointer hover:text-[#FF6F59]">
            <input 
              type="checkbox" 
              checked={layerCleanupVessels} 
              onChange={(e) => setLayerCleanupVessels(e.target.checked)} 
              className="accent-[#FF6F59] rounded"
            />
            <span className="flex items-center gap-1">
              <Ship className="w-3.5 h-3.5 text-[#4F6F52]" /> Salvage Vessels ({safeMissions.length})
            </span>
          </label>

          <label className="flex items-center gap-1.5 font-semibold text-[#2A2A2A] cursor-pointer hover:text-amber-600">
            <input 
              type="checkbox" 
              checked={layerDensityHeatmap} 
              onChange={(e) => setLayerDensityHeatmap(e.target.checked)} 
              className="accent-amber-500 rounded"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Debris Density Heatmap
            </span>
          </label>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#8C8275]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] font-bold text-[#2A2A2A] focus:outline-hidden text-xs"
            >
              <option value="ALL">All Categories</option>
              <option value="Ghost Fishing Gear">Ghost Fishing Gear</option>
              <option value="Plastic">Plastic Debris</option>
              <option value="Fishing Line">Fishing Line / Rope</option>
              <option value="Metal Debris">Metal / Drums</option>
              <option value="Derelict Crab Pot">Crab Pots / Traps</option>
              <option value="Marine Anomaly">Marine Anomalies</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              value={mapStyle}
              onChange={(e) => setMapStyle(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-[#2A2A2A] text-white font-bold focus:outline-hidden text-xs"
            >
              <option value="NAUTICAL">Nautical Hydro Chart</option>
              <option value="SATELLITE">Satellite Optical</option>
              <option value="BATHYMETRY">Seafloor Bathymetry</option>
              <option value="HEATMAP">Pure Thermal Heatmap</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Dynamic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0F1713] rounded-3xl border border-[#273830] p-4 shadow-xl text-white relative min-h-[600px] flex flex-col justify-between overflow-hidden">
          
          {/* Top Floating Radar Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 z-20">
            <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F6F52] animate-pulse" />
              <span className="font-bold text-[#A3B899]">
                BOUNDS: {bounds.minLat.toFixed(4)}°N - {bounds.maxLat.toFixed(4)}°N | {bounds.minLng.toFixed(4)}°E - {bounds.maxLng.toFixed(4)}°E
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#DDD5C7] transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="px-1.5 text-xs font-mono font-bold text-white">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#DDD5C7] transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); setActiveSector('ALL'); }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#FF6F59] transition-colors cursor-pointer"
                title="Reset Auto-Fit View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Scaled Coordinate Map Container */}
          <div 
            ref={mapContainerRef}
            onClick={handleMapClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverCoord(null)}
            className={`relative w-full h-[480px] my-3 rounded-2xl border border-[#273830] overflow-hidden cursor-crosshair select-none ${
              mapStyle === 'SATELLITE' 
                ? 'bg-[#0B1D28]' 
                : mapStyle === 'BATHYMETRY' 
                ? 'bg-[#081510]' 
                : 'bg-[#121B17]'
            }`}
          >
            
            {/* Navigational Coordinate Grid Ticks (Latitude / Longitude) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Latitude Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const latVal = bounds.maxLat - pct * (bounds.maxLat - bounds.minLat);
                return (
                  <div 
                    key={`lat-${i}`} 
                    className="absolute left-0 right-0 border-b border-emerald-500/15 text-[9px] font-mono text-emerald-400/50 pl-2 flex justify-between pr-2"
                    style={{ top: `${pct * 100}%` }}
                  >
                    <span>{latVal.toFixed(4)}°N ({toDMS(latVal, true)})</span>
                    <span>100m Bathy Depth</span>
                  </div>
                );
              })}

              {/* Longitude Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
                const lngVal = bounds.minLng + pct * (bounds.maxLng - bounds.minLng);
                return (
                  <div 
                    key={`lng-${i}`} 
                    className="absolute top-0 bottom-0 border-r border-emerald-500/15 text-[9px] font-mono text-emerald-400/50 pt-1 text-center"
                    style={{ left: `${pct * 100}%` }}
                  >
                    <span className="bg-black/50 px-1 rounded">{lngVal.toFixed(4)}°E</span>
                  </div>
                );
              })}
            </div>

            {/* Depth Bathymetric Contour Curves */}
            {layerBathymetryGrid && (
              <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="gyre-center" cx="55%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#FF6F59" stopOpacity="0.25" />
                    <stop offset="50%" stopColor="#4F6F52" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#gyre-center)" />
                {/* 10m isobath */}
                <path d="M0,60 C250,90 400,30 800,80" fill="none" stroke="#68D391" strokeWidth="1.2" strokeDasharray="4,4" />
                {/* 25m isobath */}
                <path d="M0,160 C200,210 500,120 800,180" fill="none" stroke="#48BB78" strokeWidth="1.2" strokeDasharray="3,3" />
                {/* 50m isobath */}
                <path d="M0,280 C320,330 600,230 800,300" fill="none" stroke="#38A169" strokeWidth="1.5" />
                {/* Sanctuary Coral Reef Outline */}
                <polygon points="340,140 480,120 540,220 460,280 320,240" fill="rgba(79, 111, 82, 0.15)" stroke="#A3B899" strokeWidth="1" strokeDasharray="2,2" />
              </svg>
            )}

            {/* Multi-Gaussian Debris Density Heatmap */}
            {layerDensityHeatmap && (
              <div className="absolute inset-0 pointer-events-none">
                {filteredHotspots.map((hs) => {
                  const pos = project(hs.centerLat, hs.centerLng);
                  const isHigh = hs.riskScore >= 85;
                  return (
                    <div
                      key={`heat-${hs.id}`}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all ${
                        isHigh ? 'bg-red-500/25 animate-pulse' : 'bg-[#FF6F59]/20'
                      }`}
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: `${Math.max(60, hs.radiusMeters / 4)}px`,
                        height: `${Math.max(60, hs.radiusMeters / 4)}px`
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Drone Flight Path Corridors Overlay with Real Lat/Lng Waypoints */}
            {layerDroneCorridors && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {SAMPLE_DRONE_MISSIONS.map((dm) => {
                  const pointsStr = dm.flightPath
                    .map(coord => {
                      const p = project(coord[0], coord[1]);
                      return `${p.x * (mapContainerRef.current?.clientWidth || 800) / 100},${p.y * 480 / 100}`;
                    })
                    .join(' ');

                  return (
                    <g key={dm.id}>
                      <polyline
                        points={pointsStr}
                        fill="none"
                        stroke="#48BB78"
                        strokeWidth="2"
                        strokeDasharray="6,4"
                      />
                      {dm.flightPath.map((coord, idx) => {
                        const p = project(coord[0], coord[1]);
                        return (
                          <circle
                            key={`wp-${dm.id}-${idx}`}
                            cx={`${p.x}%`}
                            cy={`${p.y}%`}
                            r="3"
                            fill="#68D391"
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Cleanup Salvage Vessel Real Positions */}
            {layerCleanupVessels && safeMissions.map((msn) => {
              const startCoords = msn.routeCoordinates?.[0] || [10.9500, 78.0800];
              const pos = project(startCoords[0], startCoords[1]);
              return (
                <div
                  key={`vessel-${msn.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget(msn);
                    setSelectedTargetType('INCIDENT');
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  title={`${msn.vesselName} (${msn.teamName}) - ${msn.status}`}
                >
                  <div className="p-1.5 rounded-full bg-[#4F6F52] text-white border-2 border-white shadow-lg flex items-center justify-center animate-bounce duration-1000">
                    <Ship className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-white/20">
                    {msn.vesselName || 'Salvage Vessel'}
                  </div>
                </div>
              );
            })}

            {/* Individual Detections Pins (if layer active) */}
            {layerDetections && filteredDetections.slice(0, 30).map((det) => {
              const pos = project(det.location.lat, det.location.lng);
              const isSelected = selectedTarget?.id === det.id;
              return (
                <div
                  key={`det-${det.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget(det);
                    setSelectedTargetType('DETECTION');
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-15 cursor-pointer group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  title={`${det.title} [${det.category}]`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-transform ${
                    isSelected ? 'bg-blue-400 scale-150 ring-2 ring-blue-300' : 'bg-blue-500 hover:scale-125'
                  }`} />
                </div>
              );
            })}

            {/* Incidents Critical Pins (if layer active) */}
            {layerIncidents && filteredIncidents.map((inc) => {
              const pos = project(inc.location.lat, inc.location.lng);
              const isSelected = selectedTarget?.id === inc.id;
              return (
                <div
                  key={`inc-${inc.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTarget(inc);
                    setSelectedTargetType('INCIDENT');
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  title={`INCIDENT ${inc.id}: ${inc.title}`}
                >
                  <div className={`p-1.5 rounded-xl transition-all shadow-lg flex items-center justify-center ${
                    isSelected 
                      ? 'bg-red-500 text-white ring-4 ring-red-400 scale-125' 
                      : inc.severity === 'CRITICAL' 
                      ? 'bg-red-600 text-white hover:scale-115' 
                      : 'bg-amber-500 text-white hover:scale-110'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden group-hover:block absolute top-7 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap border border-red-500/40">
                    {inc.id}: {inc.category}
                  </div>
                </div>
              );
            })}

            {/* Hotspot True Radius Rings & Geographic Pins */}
            {layerHotspots && filteredHotspots.map((hs) => {
              const pos = project(hs.centerLat, hs.centerLng);
              const isSelected = selectedTarget?.id === hs.id;
              const isCritical = hs.riskScore >= 85;

              return (
                <React.Fragment key={`hs-grp-${hs.id}`}>
                  {/* True Scaled Radius Circle */}
                  <div
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border pointer-events-none transition-all ${
                      isSelected 
                        ? 'border-[#FF6F59] bg-[#FF6F59]/10' 
                        : isCritical 
                        ? 'border-red-500/40 bg-red-500/5' 
                        : 'border-[#4F6F52]/40 bg-[#4F6F52]/5'
                    }`}
                    style={{
                      left: `${pos.x}%`,
                      top: `${pos.y}%`,
                      width: `${Math.max(40, hs.radiusMeters / 6)}px`,
                      height: `${Math.max(40, hs.radiusMeters / 6)}px`
                    }}
                  />

                  {/* Hotspot Map Pin Marker */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTarget(hs);
                      setSelectedTargetType('HOTSPOT');
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-25 cursor-pointer group"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className={`p-2 rounded-2xl transition-all shadow-xl flex items-center justify-center ${
                      isSelected 
                        ? 'bg-[#FF6F59] text-white ring-4 ring-[#FF6F59]/50 scale-125' 
                        : isCritical 
                        ? 'bg-red-600 text-white hover:scale-115' 
                        : 'bg-[#4F6F52] text-white hover:scale-110'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap border border-white/20 shadow-md">
                      {hs.name.slice(0, 18)} ({hs.detectionCount})
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Custom Inspected Pin (if user clicked) */}
            {customPin && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                style={{ left: `${project(customPin.lat, customPin.lng).x}%`, top: `${project(customPin.lat, customPin.lng).y}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center shadow-2xl animate-pulse">
                  <Crosshair className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="absolute top-7 left-1/2 -translate-x-1/2 bg-purple-900 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                  {customPin.lat.toFixed(4)}°N, {customPin.lng.toFixed(4)}°E
                </div>
              </div>
            )}

            {/* Real User GPS Position Pin */}
            {(() => {
              const userPos = project(userLocation.lat, userLocation.lng);
              return (
                <div 
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
                  style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
                  title={`Your Position: ${userLocation.lat}°N, ${userLocation.lng}°E (${userLocation.isLiveGPS ? 'Live GPS' : 'Vessel Anchor'})`}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-blue-500/40 animate-ping absolute" />
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
                      <Navigation2 className="w-3 h-3 rotate-45" />
                    </div>
                  </div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-blue-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-blue-400">
                    {userLocation.isLiveGPS ? 'LIVE GPS' : 'YOU ARE HERE'}
                  </div>
                </div>
              );
            })()}

            {/* Floating Live Cursor Coordinate Badge */}
            {hoverCoord && (
              <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-[10px] font-mono text-emerald-400 z-30 pointer-events-none flex items-center gap-1.5">
                <Crosshair className="w-3 h-3 text-[#FF6F59]" />
                <span>CURSOR: {hoverCoord.lat.toFixed(5)}°N, {hoverCoord.lng.toFixed(5)}°E ({toDMS(hoverCoord.lat, true)})</span>
              </div>
            )}

          </div>

          {/* Bottom Floating Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10 text-xs font-mono bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-[#A3B899] flex items-center gap-1">
                <CompassIcon className="w-3.5 h-3.5 text-[#FF6F59]" />
                BEARING: <strong className="text-white">{bearing.degrees}° ({bearing.cardinal})</strong>
              </span>
              <span className="text-[#A3B899]">
                DISTANCE: <strong className="text-white">{distKm} km</strong> ({distNm} NM)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#DDD5C7]">
                LAT: <strong className="text-white">{toDMS(targetLat, true)}</strong> | LNG: <strong className="text-white">{toDMS(targetLng, false)}</strong>
              </span>
              <span className="text-[#FF6F59] font-bold">
                DRIFT: {selectedTarget?.currentVelocityKnots || 0.42} KTS
              </span>
            </div>
          </div>

        </div>

        {/* Selected Target Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedTarget ? (
            <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#736B5E]">
                    {selectedTarget.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F2EDE4] text-[#5C5449] uppercase">
                    {selectedTargetType}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  (selectedTarget.riskScore || selectedTarget.priorityScore || 80) >= 85 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-[#FF6F59]/15 text-[#FF6F59] border border-[#FF6F59]/20'
                }`}>
                  RISK {selectedTarget.riskScore || selectedTarget.priorityScore || 80} / 100
                </span>
              </div>

              {/* Title & Sector */}
              <div>
                <h3 className="text-xl font-extrabold text-[#2A2A2A] leading-snug">
                  {selectedTarget.name || selectedTarget.title}
                </h3>
                <p className="text-xs text-[#736B5E] mt-1">
                  {selectedTarget.sector || selectedTarget.location?.sector || 'Coastal Marine Zone'} • 
                  {selectedTarget.radiusMeters ? ` Radius ${selectedTarget.radiusMeters}m` : ' Point Target'}
                </p>
              </div>

              {/* Detailed Geodetic Coordinates & Navigational Telemetry Card */}
              <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#E8E1D5]">
                  <span className="text-[#736B5E] font-medium">Exact Coordinates (Decimal):</span>
                  <span className="font-mono font-bold text-[#2A2A2A]">
                    {targetLat.toFixed(5)}°N, {targetLng.toFixed(5)}°E
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#736B5E] font-medium">DMS Format:</span>
                  <span className="font-mono text-[11px] font-bold text-[#5C5449]">
                    {toDMS(targetLat, true)}, {toDMS(targetLng, false)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#736B5E] font-medium">Distance from Vessel / GPS:</span>
                  <span className="font-bold text-[#2A2A2A]">
                    {distKm} km <span className="text-[10px] text-[#736B5E]">({distNm} NM)</span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#736B5E] font-medium">Compass Heading:</span>
                  <span className="font-bold text-[#FF6F59]">
                    {bearing.degrees}° ({bearing.cardinal})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#736B5E] font-medium">Dominant Threat Class:</span>
                  <span className="font-bold text-[#2A2A2A]">
                    {selectedTarget.dominantCategory || selectedTarget.category || 'Ghost Fishing Gear'}
                  </span>
                </div>

                {selectedTarget.detectionCount !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#736B5E] font-medium">Clustered Debris Items:</span>
                    <span className="font-bold text-[#4F6F52]">{selectedTarget.detectionCount} targets</span>
                  </div>
                )}
              </div>

              {/* AI Prediction & Bathymetric Trajectory Note */}
              <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Hydrodynamic Convergence Assessment</span>
                </div>
                <p className="text-[11px] text-[#5C5449] leading-relaxed">
                  Tidal Rip current at {selectedTarget.currentVelocityKnots || 0.42} kts drives continuous debris aggregation. Recommend rapid containment barrier placement or surface skimming prior to ebb tide.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleFocusTarget}
                  className="w-full py-2.5 rounded-xl bg-[#2A2A2A] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Focus Target on Map</span>
                </button>

                <button
                  onClick={() => onNavigate('cleanup', selectedTarget.id)}
                  className="w-full py-2.5 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Dispatch Cleanup Vessel Here</span>
                </button>

                <button
                  onClick={() => onNavigate('drone')}
                  className="w-full py-2 rounded-xl bg-[#F9F6F0] hover:bg-[#F2EDE4] border border-[#DDD5C7] text-[#5C5449] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Deploy Drone Recon Corridor</span>
                </button>

                <button
                  onClick={() => onNavigate('incidents', selectedTarget.id)}
                  className="w-full py-2 rounded-xl bg-white border border-[#DDD5C7] text-[#5C5449] hover:bg-[#F2EDE4] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Create / Link Incident Record</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#E8E1D5] text-center text-[#736B5E] space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-[#8C8275]" />
              <p className="text-xs font-bold">Select any hotspot, incident, or click the map canvas to inspect live telemetry</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
