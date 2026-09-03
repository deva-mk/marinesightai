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
  Anchor,
  Tag
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

// Custom Leaflet SVG DivIcons in Heynesh Electric Theme
const createVesselIcon = (color: string, heading: number = 0) => {
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="transform: rotate(${heading}deg); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="width: 28px; height: 28px; background: #0C0D0E; border: 2px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color}80;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  const bg = severity === 'CRITICAL' ? '#FFFF23' : severity === 'HIGH' ? '#FF5555' : '#44EE77';
  const dotColor = severity === 'CRITICAL' ? '#000000' : '#FFFFFF';
  return L.divIcon({
    className: 'custom-debris-marker',
    html: `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background: ${bg}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background: ${bg}; border: 2px solid #000; box-shadow: 0 0 12px ${bg}90; display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></div>
        </div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

// Prominent Geographic Place Name Badge Icon
const createPlaceNameIcon = (name: string, type: 'port' | 'sanctuary' | 'station' | 'cape') => {
  const badgeColor = type === 'sanctuary' ? '#2DD4BF' : type === 'port' ? '#FFFF23' : '#A78BFA';
  const textColor = type === 'port' ? '#000000' : '#FFFFFF';
  return L.divIcon({
    className: 'custom-place-badge',
    html: `
      <div style="display: flex; align-items: center; gap: 5px; background: rgba(12, 13, 14, 0.92); border: 1.5px solid ${badgeColor}; padding: 3px 8px; border-radius: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); backdrop-filter: blur(4px); white-space: nowrap; pointer-events: auto;">
        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${badgeColor}; box-shadow: 0 0 8px ${badgeColor};"></span>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.3px;">
          ${name}
        </span>
      </div>
    `,
    iconAnchor: [0, 12]
  });
};

// Key Geographical Maritime Places
const GEOGRAPHIC_PLACES = [
  { name: 'Gulf of Mannar Marine Biosphere', lat: 10.9580, lng: 78.0780, type: 'sanctuary' as const },
  { name: 'Palk Bay North Convergence', lat: 10.9740, lng: 78.0690, type: 'cape' as const },
  { name: 'Mandapam Marine Research Station', lat: 10.9420, lng: 78.0620, type: 'station' as const },
  { name: 'Rameswaram Coastal Harbour & Pier', lat: 10.9280, lng: 78.0840, type: 'port' as const },
  { name: 'Dhanushkodi Sandspit Point', lat: 10.9150, lng: 78.0980, type: 'cape' as const },
  { name: 'Sanctuary Sector 4B Core', lat: 10.9541, lng: 78.0812, type: 'sanctuary' as const }
];

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
  const placeLabelsGroupRef = useRef<L.LayerGroup | null>(null);

  // Basemap options: 'places' (Voyager with explicit labels), 'dark' (CartoDB Dark with explicit labels), 'satellite' (Esri Hybrid with labels), 'ocean' (Esri with Reference)
  const [basemap, setBasemap] = useState<'places' | 'dark' | 'satellite' | 'ocean'>('places');
  const [showPlaceNames, setShowPlaceNames] = useState<boolean>(true);
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

      // Default Basemap: CartoDB Voyager with prominent places & labels
      const baseTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Dedicated Place Labels Tile Layer to guarantee labels are always on top
      const labelsTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        zIndex: 650
      }).addTo(map);

      (map as any)._baseTileLayer = baseTileLayer;
      (map as any)._labelsTileLayer = labelsTileLayer;

      // Layer group for dynamic markers and overlays
      const layers = L.layerGroup().addTo(map);
      layerGroupRef.current = layers;

      // Dedicated group for place name landmark badges
      const placeLabels = L.layerGroup().addTo(map);
      placeLabelsGroupRef.current = placeLabels;

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

  // Update Basemap Tiles and Place Labels
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Determine base and label URLs based on selected mode
    let baseTileUrl = '';
    let labelsTileUrl = '';

    if (basemap === 'places') {
      baseTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      labelsTileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png';
    } else if (basemap === 'dark') {
      baseTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      labelsTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png';
    } else if (basemap === 'satellite') {
      baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      labelsTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
    } else {
      // ocean
      baseTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
      labelsTileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}';
    }

    // Remove old base layer
    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }
    // Remove old labels layer
    if ((map as any)._labelsTileLayer) {
      map.removeLayer((map as any)._labelsTileLayer);
    }

    // Add updated base layer
    const newBaseLayer = L.tileLayer(baseTileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);
    (map as any)._baseTileLayer = newBaseLayer;

    // Add updated labels layer if enabled
    if (showPlaceNames) {
      const newLabelsLayer = L.tileLayer(labelsTileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
        zIndex: 650
      }).addTo(map);
      (map as any)._labelsTileLayer = newLabelsLayer;
    }
  }, [basemap, showPlaceNames]);

  // Update Geographic Place Name Badges on Map
  useEffect(() => {
    const group = placeLabelsGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (showPlaceNames) {
      GEOGRAPHIC_PLACES.forEach(place => {
        const marker = L.marker([place.lat, place.lng], {
          icon: createPlaceNameIcon(place.name, place.type),
          zIndexOffset: 500
        }).addTo(group);

        marker.bindPopup(`
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; color: #FFFFFF; background: #0C0D0E;">
            <b style="color: #FFFF23;">${place.name}</b><br/>
            <span style="color: #888;">Coordinates: ${place.lat.toFixed(4)}°N, ${place.lng.toFixed(4)}°E</span><br/>
            <span style="color: #2DD4BF;">Type: ${place.type.toUpperCase()}</span>
          </div>
        `);
      });
    }
  }, [showPlaceNames]);

  // Render Overlays: Hotspots, MPA Boundaries, Sonar Swaths, GPS Tracks
  useEffect(() => {
    const layers = layerGroupRef.current;
    if (!layers) return;

    layers.clearLayers();

    // 1. Marine Protected Area (MPA) Core Boundary
    const mpaCoords: [number, number][] = [
      [10.9420, 78.0650],
      [10.9680, 78.0720],
      [10.9620, 78.0920],
      [10.9380, 78.0840]
    ];
    L.polygon(mpaCoords, {
      color: '#2DD4BF',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#2DD4BF',
      fillOpacity: 0.08
    }).bindTooltip('Gulf of Mannar Marine Biosphere Core Boundary', { 
      sticky: true,
      className: 'custom-map-tooltip'
    }).addTo(layers);

    // 2. Hotspots Density Zones
    if (showDensityHeatmap) {
      hotspots.forEach(h => {
        const circle = L.circle([h.centerLat, h.centerLng], {
          radius: h.radiusMeters || 400,
          color: '#FFFF23',
          weight: 2,
          fillColor: '#FFFF23',
          fillOpacity: 0.18
        }).addTo(layers);

        circle.bindTooltip(`
          <b>${h.name}</b><br/>
          <span style="font-size: 11px;">Detections: ${h.detectionCount} | Risk Score: ${h.riskScore}/100</span>
        `, { sticky: true, className: 'custom-map-tooltip' });
      });
    }

    // 3. Side-Scan Sonar Swath Corridors
    if (showSonarSwaths) {
      const swath1: [number, number][] = [
        [10.9650, 78.0680],
        [10.9660, 78.0695],
        [10.9450, 78.0860],
        [10.9440, 78.0845]
      ];
      L.polygon(swath1, {
        color: '#FFFF23',
        fillColor: '#FFFF23',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4'
      }).bindTooltip('SSS Acoustic Swath Corridor: 455 kHz Dual-Frequency (120m Swath)', { 
        sticky: true,
        className: 'custom-map-tooltip'
      }).addTo(layers);
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
        color: '#FFFF23',
        weight: 3,
        opacity: 0.9
      }).addTo(layers);

      const sagarMarker = L.marker([10.9520, 78.0754], {
        icon: createVesselIcon('#FFFF23', 142)
      }).addTo(layers);
      sagarMarker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; color: #FFF; background: #0C0D0E;">
          <b style="color: #FFFF23;">RV Sagar Guardian</b><br/>
          <span style="color: #888;">Speed: 8.4 kts | Heading: 142° | Sonar: ACTIVE</span>
        </div>
      `);

      const trackVajra: [number, number][] = [
        [10.9400, 78.0580],
        [10.9420, 78.0680],
        [10.9450, 78.0790],
        [10.9490, 78.0890]
      ];
      L.polyline(trackVajra, {
        color: '#2DD4BF',
        weight: 2.5,
        dashArray: '5, 5',
        opacity: 0.85
      }).addTo(layers);

      const vajraMarker = L.marker([10.9450, 78.0790], {
        icon: createVesselIcon('#2DD4BF', 88)
      }).addTo(layers);
      vajraMarker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 4px; color: #FFF; background: #0C0D0E;">
          <b style="color: #2DD4BF;">Patrol Craft Vajra-2</b><br/>
          <span style="color: #888;">Speed: 14.2 kts | Heading: 088° | Mission: Intercept</span>
        </div>
      `);
    }

    // 5. Interactive Debris Detections & Incidents
    incidents.slice(0, 20).forEach(inc => {
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
      `, { direction: 'top', offset: [0, -10], className: 'custom-map-tooltip' });
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
            color: '#FFFF23',
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
    <div className="relative w-full h-[640px] rounded-2xl overflow-hidden border border-[#25282F] bg-[#0C0D0E] shadow-2xl flex flex-col">
      {/* Top Telemetry & Control Ribbon in Heynesh Style */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Real-time Geographic Telemetry */}
        <div className="bg-[#121316]/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-[#25282F] shadow-xl flex items-center gap-3 text-xs pointer-events-auto">
          <div className="flex items-center gap-1.5 font-mono text-[#FFFF23]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#FFFF23]" />
            <span className="font-extrabold tracking-wider">NAV-SYSTEM</span>
          </div>
          <div className="h-3 w-px bg-white/20" />
          <div className="font-mono text-[11px] text-stone-300">
            LAT: <span className="text-[#FFFF23] font-bold">{activeCoords.lat.toFixed(4)}°N</span>
          </div>
          <div className="font-mono text-[11px] text-stone-300">
            LNG: <span className="text-[#FFFF23] font-bold">{activeCoords.lng.toFixed(4)}°E</span>
          </div>
          <div className="h-3 w-px bg-white/20 hidden sm:block" />
          <div className="text-[11px] text-stone-400 hidden sm:flex items-center gap-1 font-mono">
            <Anchor className="w-3.5 h-3.5 text-[#FFFF23]" />
            <span>Palk Bay & Mannar Corridor</span>
          </div>
        </div>

        {/* Basemap & Place Labels Switcher */}
        <div className="bg-[#121316]/95 backdrop-blur-md text-white p-1.5 rounded-xl border border-[#25282F] shadow-xl flex items-center gap-1 text-xs pointer-events-auto">
          <button
            onClick={() => setBasemap('places')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-wide uppercase transition-all ${
              basemap === 'places' 
                ? 'bg-[#FFFF23] text-black shadow-[0_0_12px_rgba(255,255,35,0.4)]' 
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🗺️ Places
          </button>
          <button
            onClick={() => setBasemap('dark')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-wide uppercase transition-all ${
              basemap === 'dark' 
                ? 'bg-[#FFFF23] text-black shadow-[0_0_12px_rgba(255,255,35,0.4)]' 
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚡ Dark
          </button>
          <button
            onClick={() => setBasemap('satellite')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-wide uppercase transition-all ${
              basemap === 'satellite' 
                ? 'bg-[#FFFF23] text-black shadow-[0_0_12px_rgba(255,255,35,0.4)]' 
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🛰️ Sat
          </button>
          <button
            onClick={() => setBasemap('ocean')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-wide uppercase transition-all ${
              basemap === 'ocean' 
                ? 'bg-[#FFFF23] text-black shadow-[0_0_12px_rgba(255,255,35,0.4)]' 
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🌊 Ocean
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Place Names & Landmarks Toggle */}
          <button
            onClick={() => setShowPlaceNames(!showPlaceNames)}
            title="Toggle Place Names & Marine Landmarks"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              showPlaceNames 
                ? 'bg-[#2DD4BF] text-black shadow-[0_0_10px_rgba(45,212,191,0.4)]' 
                : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span className="hidden sm:inline">Labels</span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          <button
            onClick={() => setShowGpsTracks(!showGpsTracks)}
            title="Toggle Vessel GPS Tracks"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showGpsTracks ? 'bg-[#FFFF23] text-black' : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSonarSwaths(!showSonarSwaths)}
            title="Toggle Sonar Swath Corridors"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showSonarSwaths ? 'bg-[#2DD4BF] text-black' : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowDensityHeatmap(!showDensityHeatmap)}
            title="Toggle Anomaly Density Zones"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              showDensityHeatmap ? 'bg-[#FF5555] text-white' : 'text-stone-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas Mount */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Zoom & Recenter Controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => handleZoom(1)}
          className="w-9 h-9 rounded-xl bg-[#121316]/90 hover:bg-[#FFFF23] hover:text-black text-white border border-[#25282F] flex items-center justify-center shadow-lg transition-all"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="w-9 h-9 rounded-xl bg-[#121316]/90 hover:bg-[#FFFF23] hover:text-black text-white border border-[#25282F] flex items-center justify-center shadow-lg transition-all"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="w-9 h-9 rounded-xl bg-[#FFFF23] hover:bg-white text-black font-bold border border-[#25282F] flex items-center justify-center shadow-[0_0_15px_rgba(255,255,35,0.3)] transition-all"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Selected Target Drawer */}
      {selectedItem && (
        <div className="absolute bottom-6 left-4 z-[1000] max-w-sm bg-[#121316]/95 backdrop-blur-md text-white p-4 rounded-2xl border border-[#25282F] shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                selectedItem.severity === 'CRITICAL' ? 'bg-[#FFFF23] text-black' : 'bg-[#2DD4BF] text-black'
              }`}>
                {selectedItem.severity} TARGET
              </span>
              <h4 className="font-extrabold text-sm text-white mt-1.5">{selectedItem.title}</h4>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                {selectedItem.location?.lat.toFixed(4)}°N, {selectedItem.location?.lng.toFixed(4)}°E • Depth: {selectedItem.location?.depthMeters || 14}m
              </p>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-stone-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg bg-white/10"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-[#25282F] flex items-center gap-2">
            <button
              onClick={() => onNavigate && onNavigate('incidents', selectedItem.id)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-black tracking-wide text-center transition-all shadow-[0_0_12px_rgba(255,255,35,0.3)]"
            >
              View Incident Command
            </button>
            <button
              onClick={() => onNavigate && onNavigate('sonar')}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Sonar View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
