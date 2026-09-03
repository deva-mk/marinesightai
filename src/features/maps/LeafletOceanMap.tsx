import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Compass, 
  Layers, 
  MapPin, 
  Navigation, 
  Ship, 
  AlertTriangle, 
  Radio, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  Crosshair,
  Waves,
  Anchor
} from 'lucide-react';
import { DetectionRecord, IncidentRecord, HotspotRecord, CleanupMission } from '../../types';

interface LeafletOceanMapProps {
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  hotspots?: HotspotRecord[];
  missions?: CleanupMission[];
  onSelectTarget?: (type: string, id: string) => void;
  onNavigate?: (view: string, id?: string) => void;
}

// Custom Leaflet SVG DivIcons
const createVesselIcon = (color: string, heading: number = 0) => {
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="transform: rotate(${heading}deg); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 28px; height: 28px; background: ${color}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

const createDebrisIcon = (severity: string) => {
  const bg = severity === 'CRITICAL' ? '#FF6F59' : severity === 'HIGH' ? '#E0533D' : '#4F6F52';
  return L.divIcon({
    className: 'custom-debris-marker',
    html: `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${bg}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${bg}; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: white;"></div>
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

export const LeafletOceanMap: React.FC<LeafletOceanMapProps> = ({
  detections = [],
  incidents = [],
  hotspots = [],
  missions = [],
  onSelectTarget,
  onNavigate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [basemap, setBasemap] = useState<'ocean' | 'dark' | 'satellite'>('ocean');
  const [showGpsTracks, setShowGpsTracks] = useState<boolean>(true);
  const [showSonarSwaths, setShowSonarSwaths] = useState<boolean>(true);
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(true);
  const [showMissionRoutes, setShowMissionRoutes] = useState<boolean>(true);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({ lat: 10.9542, lng: 78.0765 });
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Default focus: Gulf of Mannar & Palk Bay corridor
  const defaultCenter: [number, number] = [10.9542, 78.0765];
  const defaultZoom = 13;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: false,
        attributionControl: false
      });

      // Default Basemap: Esri World Ocean
      const tileUrl = basemap === 'dark' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : basemap === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      // Save tile layer reference on map instance
      (map as any)._baseTileLayer = tileLayer;

      // Layer group for dynamic markers and overlays
      const layers = L.layerGroup().addTo(map);
      layerGroupRef.current = layers;

      // Mousemove coordinate tracking
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setActiveCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5))
        });
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Basemap Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const tileUrl = basemap === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : basemap === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    (map as any)._baseTileLayer = newLayer;
  }, [basemap]);

  // Render Overlays: GPS Tracks, Sonar Swaths, Density, Incidents, Missions
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    // 1. Marine Protected Area (MPA) Coral Geofence
    const mpaCoords: [number, number][] = [
      [10.9650, 78.0650],
      [10.9720, 78.0820],
      [10.9580, 78.0950],
      [10.9450, 78.0750]
    ];
    L.polygon(mpaCoords, {
      color: '#4F6F52',
      fillColor: '#4F6F52',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 6'
    }).bindTooltip('Coral Reef Sanctuary Geofence (MPA Zone A)', { sticky: true }).addTo(layers);

    // 2. Anomaly Density Mapping (Heatmap Clusters)
    if (showDensityHeatmap) {
      hotspots.forEach(h => {
        const radius = (h.radiusKm || 0.6) * 1000;
        const color = h.severity === 'CRITICAL' ? '#FF6F59' : '#F4A261';

        L.circle([h.centerLat, h.centerLng], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: 0.22,
          weight: 1.5
        }).bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 11px; font-weight: 800; color: ${color}; text-transform: uppercase;">${h.name}</div>
            <div style="font-size: 12px; font-weight: 600; color: #2A2A2A; margin-top: 2px;">Anomaly Density: ${h.debrisCount || 12} items</div>
            <div style="font-size: 11px; color: #736B5E; margin-top: 2px;">Estimated Mass: ${h.estimatedWeightKg || 450} kg</div>
          </div>
        `).addTo(layers);
      });
    }

    // 3. Side-Scan Sonar (SSS) Swaths
    if (showSonarSwaths) {
      const swathPolygon: [number, number][] = [
        [10.9590, 78.0680],
        [10.9630, 78.0860],
        [10.9510, 78.0890],
        [10.9470, 78.0710]
      ];
      L.polygon(swathPolygon, {
        color: '#2DD4BF',
        fillColor: '#2DD4BF',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      }).bindTooltip('SSS Swath Corridor: 455 kHz Dual-Frequency Transect (120m Footprint)', { sticky: true }).addTo(layers);
    }

    // 4. Research Vessel GPS Tracks & Live Markers
    if (showGpsTracks) {
      const trackSagar: [number, number][] = [
        [10.9700, 78.0620],
        [10.9650, 78.0665],
        [10.9580, 78.0720],
        [10.9520, 78.0754],
        [10.9470, 78.0810]
      ];
      L.polyline(trackSagar, {
        color: '#FF6F59',
        weight: 3,
        opacity: 0.85
      }).addTo(layers);

      const sagarMarker = L.marker([10.9520, 78.0754], {
        icon: createVesselIcon('#FF6F59', 142)
      }).addTo(layers);
      sagarMarker.bindPopup(`
        <div style="font-family: sans-serif;">
          <b style="color: #FF6F59;">RV Sagar Guardian</b><br/>
          <span style="font-size: 11px; color: #555;">Survey Speed: 8.4 kts | Heading: 142° | Sonar: ACTIVE</span>
        </div>
      `);

      const trackVajra: [number, number][] = [
        [10.9400, 78.0580],
        [10.9420, 78.0680],
        [10.9450, 78.0790],
        [10.9490, 78.0890]
      ];
      L.polyline(trackVajra, {
        color: '#4F6F52',
        weight: 2.5,
        dashArray: '5, 5',
        opacity: 0.8
      }).addTo(layers);

      const vajraMarker = L.marker([10.9450, 78.0790], {
        icon: createVesselIcon('#4F6F52', 88)
      }).addTo(layers);
      vajraMarker.bindPopup(`
        <div style="font-family: sans-serif;">
          <b style="color: #4F6F52;">Patrol Craft Vajra-2</b><br/>
          <span style="font-size: 11px; color: #555;">Speed: 14.2 kts | Heading: 088° | Mission: Cleanup Escort</span>
        </div>
      `);
    }

    // 5. Interactive Debris Detections & Incidents
    incidents.slice(0, 15).forEach(inc => {
      const marker = L.marker([inc.location.lat, inc.location.lng], {
        icon: createDebrisIcon(inc.severity)
      }).addTo(layers);

      marker.on('click', () => {
        setSelectedItem(inc);
        if (onSelectTarget) onSelectTarget('incident', inc.id);
      });

      marker.bindTooltip(`
        <b>${inc.title}</b><br/>
        <span style="font-size: 10px;">Severity: ${inc.severity} | Depth: ${inc.location.depthMeters || 14}m</span>
      `, { direction: 'top', offset: [0, -10] });
    });

    // 6. Mission Routes
    if (showMissionRoutes) {
      missions.forEach(m => {
        if (m.status === 'ACTIVE') {
          const route: [number, number][] = [
            [m.startLocation?.lat || 10.9350, m.startLocation?.lng || 78.0620],
            [m.targetLocation?.lat || 10.9540, m.targetLocation?.lng || 78.0780]
          ];
          L.polyline(route, {
            color: '#3B82F6',
            weight: 3,
            dashArray: '4, 8'
          }).addTo(layers);
        }
      });
    }

  }, [incidents, hotspots, missions, showGpsTracks, showSonarSwaths, showDensityHeatmap, showMissionRoutes]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(defaultCenter, defaultZoom, { duration: 1.2 });
    }
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + delta);
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-[#E8E1D5] bg-[#0A1118] shadow-lg flex flex-col">
      {/* Top Telemetry & Layer Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Real-time Telemetry Card */}
        <div className="bg-[#1B263B]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/10 shadow-lg flex items-center gap-3 text-xs pointer-events-auto">
          <div className="flex items-center gap-1.5 font-mono text-[#2DD4BF]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#2DD4BF]" />
            <span className="font-bold">LEAFLET V1.9.4</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="font-mono text-[11px] text-white/80">
            LAT: <span className="text-white font-bold">{activeCoords.lat.toFixed(4)}°N</span>
          </div>
          <div className="font-mono text-[11px] text-white/80">
            LNG: <span className="text-white font-bold">{activeCoords.lng.toFixed(4)}°E</span>
          </div>
          <div className="h-3 w-px bg-white/20 hidden sm:block" />
          <div className="text-[11px] text-white/60 hidden sm:flex items-center gap-1">
            <Anchor className="w-3 h-3 text-[#FF6F59]" />
            <span>Palk Strait Bathymetric Corridor</span>
          </div>
        </div>

        {/* Quick Basemap & Layer Toggles */}
        <div className="bg-[#1B263B]/90 backdrop-blur-md text-white p-1.5 rounded-xl border border-white/10 shadow-lg flex items-center gap-1 text-xs pointer-events-auto">
          <button
            onClick={() => setBasemap('ocean')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              basemap === 'ocean' ? 'bg-[#FF6F59] text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Ocean
          </button>
          <button
            onClick={() => setBasemap('dark')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              basemap === 'dark' ? 'bg-[#FF6F59] text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => setBasemap('satellite')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              basemap === 'satellite' ? 'bg-[#FF6F59] text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Sat
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <button
            onClick={() => setShowGpsTracks(!showGpsTracks)}
            title="Toggle Vessel GPS Tracks"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showGpsTracks ? 'bg-[#4F6F52] text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSonarSwaths(!showSonarSwaths)}
            title="Toggle Sonar Swath Corridors"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showSonarSwaths ? 'bg-[#2DD4BF] text-stone-900' : 'text-white/50 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowDensityHeatmap(!showDensityHeatmap)}
            title="Toggle Anomaly Density Clusters"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showDensityHeatmap ? 'bg-[#F4A261] text-stone-900' : 'text-white/50 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas Mount */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Zoom & Compass Controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => handleZoom(1)}
          className="w-9 h-9 rounded-xl bg-[#1B263B]/90 hover:bg-[#1B263B] text-white border border-white/15 flex items-center justify-center shadow-lg transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="w-9 h-9 rounded-xl bg-[#1B263B]/90 hover:bg-[#1B263B] text-white border border-white/15 flex items-center justify-center shadow-lg transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="w-9 h-9 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white border border-white/15 flex items-center justify-center shadow-lg transition-all"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Selected Target Drawer */}
      {selectedItem && (
        <div className="absolute bottom-6 left-4 z-[1000] max-w-sm bg-[#1B263B]/95 backdrop-blur-md text-white p-4 rounded-2xl border border-white/15 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedItem.severity === 'CRITICAL' ? 'bg-[#FF6F59] text-white' : 'bg-[#4F6F52] text-white'
              }`}>
                {selectedItem.severity} ANOMALY
              </span>
              <h4 className="font-extrabold text-sm text-white mt-1.5">{selectedItem.title}</h4>
              <p className="text-[11px] text-white/70 mt-0.5">
                {selectedItem.location?.lat.toFixed(4)}°N, {selectedItem.location?.lng.toFixed(4)}°E • Depth: {selectedItem.location?.depthMeters || 14}m
              </p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-white/60 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('incidents', selectedItem.id)}
              className="flex-1 py-1.5 px-3 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold text-center transition-all"
            >
              View Incident Command
            </button>
            <button
              onClick={() => onNavigate && onNavigate('sonar')}
              className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Sonar View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
