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
  Minimize2,
  ZoomIn, 
  ZoomOut, 
  Crosshair,
  Waves,
  Anchor,
  Tag,
  Search,
  Sliders,
  Filter,
  Eye,
  CheckCircle2,
  Info,
  Copy,
  ExternalLink,
  ChevronRight,
  Database,
  Camera,
  X,
  Map as MapIcon,
  Globe
} from 'lucide-react';
import { DetectionRecord, IncidentRecord, HotspotRecord, CleanupMission } from '../../types';
import { 
  MapLayerKey, 
  GOOGLE_MAP_LAYERS, 
  CROWDSOURCED_DEBRIS_POINTS, 
  NASA_IMPACT_ML_DATASET, 
  SCIENTIFIC_OCEAN_VARIABLES,
  CrowdsourcedDebrisPoint,
  NASAMLFeature
} from './oceanMapSolutionsData';

interface LeafletOceanMapProps {
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  hotspots?: HotspotRecord[];
  missions?: CleanupMission[];
  initialLayer?: MapLayerKey;
  onSelectTarget?: (type: string, id: string) => void;
  onNavigate?: (view: string, id?: string) => void;
}

// Key Geographical Maritime Places in Gulf of Mannar & Palk Bay
const GEOGRAPHIC_PLACES = [
  { name: 'Gulf of Mannar Marine Biosphere Core', lat: 9.2250, lng: 79.2450, type: 'sanctuary' as const, zoom: 14, desc: 'UNESCO Biosphere Reserve coral reef barrier & dugong sanctuary' },
  { name: 'Kurusadai Coral Reef Sanctuary', lat: 9.2450, lng: 79.2150, type: 'sanctuary' as const, zoom: 15, desc: 'Pristine live coral reef formations and benthic seagrass beds' },
  { name: 'Rameswaram Coastal Harbour & Pier', lat: 9.2880, lng: 79.3130, type: 'port' as const, zoom: 14, desc: 'Historic pilgrimage port, trawler berths, and active marine fleet' },
  { name: 'Pamban Sea Bridge & Marine Pass', lat: 9.2810, lng: 79.2060, type: 'station' as const, zoom: 15, desc: 'Centenary cantilever railway bridge & tidal ship transit channel' },
  { name: 'Dhanushkodi Sandspit Point', lat: 9.1770, lng: 79.4180, type: 'cape' as const, zoom: 14, desc: 'Southern tip facing Adam\'s Bridge with strong convergent ocean currents' },
  { name: 'Mandapam Marine Research Station', lat: 9.2790, lng: 79.1240, type: 'station' as const, zoom: 14, desc: 'ICAR-CMFRI Marine Fisheries and Acoustic Observatory Base' },
  { name: 'Shingle Island Coral Passage', lat: 9.2420, lng: 79.2380, type: 'sanctuary' as const, zoom: 15, desc: 'Sheltered lagoon with fringing reefs and rich marine biodiversity' },
  { name: 'Palk Bay North Convergence', lat: 9.3350, lng: 79.2800, type: 'cape' as const, zoom: 13, desc: 'Calm shallow northern bay prone to microplastic gyre collection' }
];

// Custom Google Maps-styled Pin Icons
const createGoogleMapsPin = (color: string, label?: string) => {
  return L.divIcon({
    className: 'custom-google-marker',
    html: `
      <div style="position: relative; width: 30px; height: 42px; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.45));">
        <svg width="30" height="42" viewBox="0 0 30 42" fill="none">
          <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="1.8"/>
          <circle cx="15" cy="14" r="6.5" fill="#FFFFFF"/>
          <circle cx="15" cy="14" r="3.5" fill="${color}"/>
        </svg>
        ${label ? `<span style="position: absolute; bottom: -18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; color: #FFFFFF; background: rgba(15,23,42,0.92); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.5);">${label}</span>` : ''}
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });
};

const createVesselIcon = (color: string, heading: number = 0, name: string = '') => {
  return L.divIcon({
    className: 'custom-vessel-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="transform: rotate(${heading}deg); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="width: 26px; height: 26px; background: #0F172A; border: 2px solid ${color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${color}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
        </div>
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 9px; font-weight: 700; color: #FFFFFF; background: rgba(15,23,42,0.85); padding: 1px 4px; border-radius: 3px; border: 1px solid ${color}80; margin-top: 2px; white-space: nowrap;">
          ${name}
        </span>
      </div>
    `,
    iconSize: [32, 48],
    iconAnchor: [16, 16]
  });
};

const createPlaceLabelIcon = (name: string, type: 'sanctuary' | 'port' | 'station' | 'cape') => {
  const badgeColor = type === 'sanctuary' ? '#10B981' : type === 'port' ? '#38BDF8' : '#F59E0B';
  return L.divIcon({
    className: 'custom-place-badge',
    html: `
      <div style="display: flex; align-items: center; gap: 5px; background: rgba(15, 23, 42, 0.94); border: 1.5px solid ${badgeColor}; padding: 3px 8px; border-radius: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.5); backdrop-filter: blur(4px); white-space: nowrap; cursor: pointer;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: ${badgeColor}; box-shadow: 0 0 6px ${badgeColor};"></span>
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.2px;">
          ${name}
        </span>
      </div>
    `,
    iconAnchor: [15, 12]
  });
};

export const LeafletOceanMap: React.FC<LeafletOceanMapProps> = ({
  detections = [],
  incidents = [],
  hotspots = [],
  missions = [],
  initialLayer = 'google_hybrid',
  onSelectTarget,
  onNavigate
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const debrisGroupRef = useRef<L.LayerGroup | null>(null);
  const scientificGroupRef = useRef<L.LayerGroup | null>(null);
  const mlFeaturesGroupRef = useRef<L.LayerGroup | null>(null);
  const placesGroupRef = useRef<L.LayerGroup | null>(null);

  // Active Google Maps Layer
  const [activeLayer, setActiveLayer] = useState<MapLayerKey>(initialLayer);
  
  // Layer Toggles
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showDebrisMarkers, setShowDebrisMarkers] = useState<boolean>(true);
  const [showVessels, setShowVessels] = useState<boolean>(true);
  const [showCurrentsAndSST, setShowCurrentsAndSST] = useState<boolean>(true);
  const [showNASAFeatures, setShowNASAFeatures] = useState<boolean>(false);
  const [showPlaces, setShowPlaces] = useState<boolean>(true);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Google Maps Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Map state & inspect drawer
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number }>({ lat: 9.2600, lng: 79.2600 });
  const [zoomLevel, setZoomLevel] = useState<number>(13);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showStreetWaterView, setShowStreetWaterView] = useState<boolean>(false);
  const [selectedTargetItem, setSelectedTargetItem] = useState<{
    title: string;
    category: string;
    lat: number;
    lng: number;
    depthM?: number;
    notes?: string;
    verifiedBy?: string;
    photoUrl?: string;
    raw?: any;
  } | null>(null);

  // Accurate Gulf of Mannar & Palk Bay coordinates
  const defaultCenter: [number, number] = [9.2550, 79.2500];
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

      // Default to Google Hybrid Satellite tiles
      const baseTileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      (map as any)._baseTileLayer = baseTileLayer;

      // Create layer groups
      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;

      const debrisGroup = L.layerGroup().addTo(map);
      debrisGroupRef.current = debrisGroup;

      const scientificGroup = L.layerGroup().addTo(map);
      scientificGroupRef.current = scientificGroup;

      const mlGroup = L.layerGroup().addTo(map);
      mlFeaturesGroupRef.current = mlGroup;

      const placesGroup = L.layerGroup().addTo(map);
      placesGroupRef.current = placesGroup;

      // Mousemove coordinates
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setActiveCoords({
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4))
        });
      });

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
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

  // Update Basemap Tiles based on Selected Google Maps Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    let tileUrl = '';

    if (activeLayer === 'google_hybrid') {
      // Google Hybrid: Satellite imagery + road/place labels
      tileUrl = showLabels
        ? 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
        : 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
    } else if (activeLayer === 'google_roadmap') {
      // Google Standard Roadmap: Classic clean Google Maps road & waterway view
      tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    } else if (activeLayer === 'google_terrain') {
      // Google Physical Terrain: Contours and shaded relief
      tileUrl = 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
    } else if (activeLayer === 'nautical_ocean') {
      // Esri World Ocean Basemap: Specialized marine bathymetry
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
    }

    if ((map as any)._baseTileLayer) {
      map.removeLayer((map as any)._baseTileLayer);
    }

    const newBaseLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    (map as any)._baseTileLayer = newBaseLayer;

  }, [activeLayer, showLabels]);

  // Render Geographic Places & Landmarks
  useEffect(() => {
    const group = placesGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (showPlaces) {
      GEOGRAPHIC_PLACES.forEach(place => {
        const marker = L.marker([place.lat, place.lng], {
          icon: createPlaceLabelIcon(place.name, place.type),
          zIndexOffset: 300
        }).addTo(group);

        marker.on('click', () => {
          setSelectedTargetItem({
            title: place.name,
            category: place.type.toUpperCase() + ' LANDMARK',
            lat: place.lat,
            lng: place.lng,
            notes: place.desc,
            photoUrl: place.type === 'sanctuary' 
              ? 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80'
          });
        });
      });
    }
  }, [showPlaces]);

  // Render Debris Sightings & Detections
  useEffect(() => {
    const group = debrisGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (showDebrisMarkers) {
      // 1. Crowdsourced Debris Points (in real Gulf of Mannar waters)
      CROWDSOURCED_DEBRIS_POINTS.forEach(pt => {
        const isNet = pt.debrisType.includes('Fishing') || pt.debrisType.includes('Gear');
        const color = isNet ? '#EF4444' : pt.debrisType.includes('PET') ? '#F59E0B' : '#10B981';

        const marker = L.marker([pt.lat, pt.lng], {
          icon: createGoogleMapsPin(color, pt.debrisType.split(' ')[0]),
          zIndexOffset: 500
        }).addTo(group);

        marker.on('click', () => {
          setSelectedTargetItem({
            title: pt.debrisType,
            category: 'DEBRIS SIGHTING',
            lat: pt.lat,
            lng: pt.lng,
            depthM: pt.depthEstMeters,
            notes: pt.notes,
            verifiedBy: pt.verifiedBy,
            photoUrl: isNet 
              ? 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=500&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80',
            raw: pt
          });
          if (onSelectTarget) onSelectTarget('debris', pt.id);
        });
      });

      // 2. Incident detections
      incidents.slice(0, 15).forEach(inc => {
        const marker = L.marker([inc.location.lat, inc.location.lng], {
          icon: createGoogleMapsPin(inc.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B', inc.severity),
          zIndexOffset: 600
        }).addTo(group);

        marker.on('click', () => {
          setSelectedTargetItem({
            title: inc.title,
            category: inc.severity + ' INCIDENT',
            lat: inc.location.lat,
            lng: inc.location.lng,
            depthM: inc.location.depthMeters || 12,
            notes: inc.description,
            verifiedBy: 'MarineSight AI Auto-Detection',
            raw: inc
          });
          if (onSelectTarget) onSelectTarget('incident', inc.id);
        });
      });
    }
  }, [showDebrisMarkers, incidents, onSelectTarget]);

  // Render Research Vessels, AIS Tracks & Hotspots
  useEffect(() => {
    const group = layersGroupRef.current;
    if (!group) return;

    group.clearLayers();

    // 1. Marine Biosphere Core Boundary Polygon (Gulf of Mannar)
    const mpaCoords: [number, number][] = [
      [9.2800, 79.1300],
      [9.2900, 79.2200],
      [9.2600, 79.3500],
      [9.1700, 79.4300],
      [9.1500, 79.3700],
      [9.2100, 79.2000]
    ];
    L.polygon(mpaCoords, {
      color: '#10B981',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#10B981',
      fillOpacity: 0.08
    }).bindTooltip('Gulf of Mannar Marine National Park Sanctuary Core', {
      sticky: true
    }).addTo(group);

    // 2. Research Vessels with Live AIS Tracks
    if (showVessels) {
      // RV Sagar Guardian track
      const trackSagar: [number, number][] = [
        [9.2850, 79.1600],
        [9.2780, 79.1950],
        [9.2680, 79.2200],
        [9.2550, 79.2350]
      ];
      L.polyline(trackSagar, {
        color: '#38BDF8',
        weight: 3,
        opacity: 0.85
      }).addTo(group);

      const sagarMarker = L.marker([9.2550, 79.2350], {
        icon: createVesselIcon('#38BDF8', 142, 'RV Sagar Guardian'),
        zIndexOffset: 800
      }).addTo(group);

      sagarMarker.on('click', () => {
        setSelectedTargetItem({
          title: 'RV Sagar Guardian (IMO 9428511)',
          category: 'RESEARCH VESSEL',
          lat: 9.2550,
          lng: 79.2350,
          notes: 'Acoustic survey active. Side-Scan Sonar deployed at 18m depth. Speed: 7.8 knots, Heading: 142° SE.',
          verifiedBy: 'Coastal AIS Live Feed',
          photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=80'
        });
      });

      // Patrol Craft Vajra-2 track
      const trackVajra: [number, number][] = [
        [9.2100, 79.3100],
        [9.2220, 79.2880],
        [9.2300, 79.2700]
      ];
      L.polyline(trackVajra, {
        color: '#10B981',
        weight: 2.5,
        dashArray: '5, 5',
        opacity: 0.8
      }).addTo(group);

      const vajraMarker = L.marker([9.2300, 79.2700], {
        icon: createVesselIcon('#10B981', 88, 'Patrol Vajra-2'),
        zIndexOffset: 790
      }).addTo(group);

      vajraMarker.on('click', () => {
        setSelectedTargetItem({
          title: 'Marine Warden Fast Patrol Vajra-2',
          category: 'COASTAL PATROL',
          lat: 9.2300,
          lng: 79.2700,
          notes: 'Routine coral barrier enforcement & net recovery support. Speed: 14.5 knots, Heading: 088° E.',
          verifiedBy: 'Tamil Nadu Marine Police Feed',
          photoUrl: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?w=500&auto=format&fit=crop&q=80'
        });
      });
    }

    // 3. Hotspot density zones
    hotspots.forEach(h => {
      const circle = L.circle([h.centerLat, h.centerLng], {
        radius: h.radiusMeters || 500,
        color: '#F59E0B',
        weight: 1.5,
        fillColor: '#F59E0B',
        fillOpacity: 0.15
      }).addTo(group);

      circle.bindTooltip(`<b>${h.name}</b><br/>Risk Score: ${h.riskScore}/100`, { sticky: true });
    });

  }, [showVessels, hotspots]);

  // Render Scientific Variables (Bathymetric Isobaths, SST & Current Streamlines)
  useEffect(() => {
    const group = scientificGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (showCurrentsAndSST) {
      // 1. Bathymetric Depth Isobaths (-5m, -10m, -20m, -40m)
      SCIENTIFIC_OCEAN_VARIABLES.bathymetricIsobaths.forEach(iso => {
        L.polyline(iso.points, {
          color: iso.color,
          weight: 2,
          opacity: 0.8
        }).bindTooltip(`Depth Isobath: -${iso.depth}m Seafloor Contour`, { sticky: true }).addTo(group);
      });

      // 2. SST Thermal Gradient Polygons
      SCIENTIFIC_OCEAN_VARIABLES.thermalZones.forEach(zone => {
        const poly = L.polygon(zone.coords, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(group);

        poly.bindTooltip(`<b>${zone.label}</b><br/>SST: ${zone.tempC}`, { sticky: true });
      });

      // 3. Ocean Current Velocity Vectors
      SCIENTIFIC_OCEAN_VARIABLES.currentVectors.forEach(vec => {
        const arrowIcon = L.divIcon({
          className: 'current-arrow',
          html: `
            <div style="transform: rotate(${vec.directionDeg}deg); width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; opacity: 0.85;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        L.marker([vec.lat, vec.lng], { icon: arrowIcon, zIndexOffset: 200 })
          .bindTooltip(`Current: ${vec.directionDeg}° @ ${vec.speedKnots} kts | SST: ${vec.sstCelsius}°C`, { sticky: true })
          .addTo(group);
      });
    }
  }, [showCurrentsAndSST]);

  // Render NASA IMPACT ML Training Polygons
  useEffect(() => {
    const group = mlFeaturesGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (showNASAFeatures) {
      NASA_IMPACT_ML_DATASET.forEach(feat => {
        const ring = feat.geometry.coordinates[0];
        const color = feat.properties.trainingSplit === 'TRAIN' ? '#EF4444' : '#10B981';

        const poly = L.polygon(ring, {
          color: color,
          weight: 2,
          dashArray: '4, 4',
          fillColor: color,
          fillOpacity: 0.25
        }).addTo(group);

        poly.on('click', () => {
          setSelectedTargetItem({
            title: feat.properties.label,
            category: 'NASA ML ANNOTATION (' + feat.properties.trainingSplit + ')',
            lat: feat.bbox[0],
            lng: feat.bbox[1],
            notes: `Sensor: ${feat.properties.sensor} | IoU: ${feat.properties.iou} | ${feat.properties.spectralIndex}. ${feat.properties.notes}`,
            verifiedBy: 'NASA IMPACT ML Training Set',
            photoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
            raw: feat
          });
        });
      });
    }
  }, [showNASAFeatures]);

  // Navigation handlers
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

  const handleFlyToPlace = (place: typeof GEOGRAPHIC_PLACES[0]) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], place.zoom, { duration: 1.4 });
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, { duration: 1.5 });
          }
        },
        () => {
          setIsLocating(false);
          // Fallback to Rameswaram coastal observation station
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(defaultCenter, defaultZoom, { duration: 1.2 });
          }
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(defaultCenter, defaultZoom);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.parentElement?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filtered search results
  const filteredPlaces = searchQuery.trim() === '' 
    ? GEOGRAPHIC_PLACES.slice(0, 5)
    : GEOGRAPHIC_PLACES.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/60 bg-[#0F172A] shadow-2xl flex flex-col ${isFullscreen ? 'h-screen' : 'h-[720px]'}`}>
      
      {/* 1. TOP-LEFT: GOOGLE MAPS SEARCH & EXPLORE BAR */}
      <div className="absolute top-3 left-3 z-[1000] w-full max-w-sm sm:max-w-md pointer-events-auto">
        <div className="relative bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/70 p-1.5 transition-all">
          <div className="flex items-center gap-2 px-2.5 py-1">
            <Search className="w-4 h-4 text-sky-500 shrink-0" />
            <input
              id="google-maps-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search Gulf of Mannar, Rameswaram, Dhanushkodi..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none font-sans"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
            <button
              onClick={handleLocateMe}
              title="Your location"
              className="text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 p-1"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-sky-500' : ''}`} />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && (
            <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 max-h-60 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                Explore Marine Locations & Sanctuaries
              </div>
              {filteredPlaces.map((pl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleFlyToPlace(pl)}
                  className="w-full px-2.5 py-1.5 text-left flex items-start gap-2.5 hover:bg-sky-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      {pl.name}
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold">
                        {pl.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {pl.desc}
                    </div>
                  </div>
                </button>
              ))}
              <div className="px-2.5 py-1 text-right">
                <button 
                  onClick={() => setIsSearchFocused(false)} 
                  className="text-[11px] text-sky-600 dark:text-sky-400 font-medium hover:underline"
                >
                  Close Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. TOP-RIGHT: GOOGLE MAPS LAYER SWITCHER & FILTERS */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2 pointer-events-auto">
        
        {/* Layer Switcher Bar (Google Map Style: [Satellite] [Map] [Terrain] [Nautical]) */}
        <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/70 p-1 flex items-center gap-1">
          
          <button
            id="google-layer-hybrid"
            onClick={() => setActiveLayer('google_hybrid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLayer === 'google_hybrid'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title="Google Hybrid Satellite: High-resolution satellite imagery with coastal labels"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            id="google-layer-roadmap"
            onClick={() => setActiveLayer('google_roadmap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLayer === 'google_roadmap'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title="Google Standard Roadmap: Clean vector view with ports and roads"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          <button
            id="google-layer-terrain"
            onClick={() => setActiveLayer('google_terrain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLayer === 'google_terrain'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title="Google Physical Terrain: Topographic contours & shaded bathymetry"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          <button
            id="google-layer-nautical"
            onClick={() => setActiveLayer('nautical_ocean')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeLayer === 'nautical_ocean'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title="Nautical Ocean Chart: Seafloor depth isobaths and navigational fairways"
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Nautical</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* More Layers & Overlays Button */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`p-1.5 rounded-xl text-xs transition-colors ${
              showLayerMenu ? 'bg-sky-100 dark:bg-slate-700 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
            }`}
            title="Toggle Overlays (Debris, Vessels, Currents, NASA ML)"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Overlays Drawer */}
        {showLayerMenu && (
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/70 p-3 w-64 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="font-bold text-slate-800 dark:text-slate-100 pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span>Map Overlays & Telemetry</span>
              <button onClick={() => setShowLayerMenu(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Place Labels</span>
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Marine Debris Points</span>
              <input
                type="checkbox"
                checked={showDebrisMarkers}
                onChange={(e) => setShowDebrisMarkers(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">AIS Vessels & Tracks</span>
              <input
                type="checkbox"
                checked={showVessels}
                onChange={(e) => setShowVessels(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">Ocean Currents & SST</span>
              <input
                type="checkbox"
                checked={showCurrentsAndSST}
                onChange={(e) => setShowCurrentsAndSST(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-slate-700 dark:text-slate-300 font-medium">NASA ML Polygons</span>
              <input
                type="checkbox"
                checked={showNASAFeatures}
                onChange={(e) => setShowNASAFeatures(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded"
              />
            </label>
          </div>
        )}

      </div>

      {/* 3. MAP CANVAS MOUNT */}
      <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* 4. BOTTOM-LEFT: GOOGLE MAPS COORDINATE & SECTOR HUD */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-3 text-xs pointer-events-auto">
        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold font-mono">
          <Anchor className="w-3.5 h-3.5" />
          <span>GULF OF MANNAR & PALK BAY</span>
        </div>
        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
          <span>{activeCoords.lat.toFixed(4)}° N, {activeCoords.lng.toFixed(4)}° E</span>
        </div>
        <div className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          Zoom: {zoomLevel}
        </div>
      </div>

      {/* 5. BOTTOM-RIGHT: GOOGLE MAPS FLOATING CONTROLS (Pegman, Geolocation, Zoom In/Out, Fullscreen) */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-center gap-2 pointer-events-auto">
        
        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Google Maps Pegman / Water Deck View Button */}
        <button
          onClick={() => setShowStreetWaterView(!showStreetWaterView)}
          className={`w-10 h-10 rounded-xl border shadow-lg flex items-center justify-center transition-all cursor-pointer ${
            showStreetWaterView
              ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-amber-400/40'
              : 'bg-white dark:bg-[#1E293B] hover:bg-amber-50 dark:hover:bg-slate-700 text-amber-500 border-slate-200 dark:border-slate-700'
          }`}
          title="Street / Water Deck View (Panoramic Coastal Eye)"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Locate Me / GPS Button */}
        <button
          onClick={handleLocateMe}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-sky-50 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center transition-all cursor-pointer"
          title="Center on Your Position / Station"
        >
          <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-pulse' : ''}`} />
        </button>

        {/* Stacked Google Maps Zoom Controls (+ / -) */}
        <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col">
          <button
            onClick={() => handleZoom(1)}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="w-10 h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Google Maps Distance Scale Bar */}
        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow flex items-center gap-1.5">
          <div className="w-8 h-1 bg-slate-500 border-x border-slate-800" />
          <span>{zoomLevel >= 15 ? '500 m' : zoomLevel >= 13 ? '2 km' : '10 km'}</span>
        </div>

      </div>

      {/* 6. GOOGLE MAPS PLACE / TARGET CARD (WHEN A MARKER IS CLICKED) */}
      {selectedTargetItem && (
        <div className="absolute top-16 left-3 sm:left-4 z-[1000] w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-left-2">
          
          {/* Header Image preview */}
          {selectedTargetItem.photoUrl && (
            <div className="relative h-32 w-full bg-slate-800 overflow-hidden">
              <img 
                src={selectedTargetItem.photoUrl} 
                alt={selectedTargetItem.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedTargetItem(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500 text-white">
                  {selectedTargetItem.category}
                </span>
                {selectedTargetItem.depthM !== undefined && (
                  <span className="text-[10px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded">
                    Depth: {selectedTargetItem.depthM}m
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-4">
            {!selectedTargetItem.photoUrl && (
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500 text-white">
                  {selectedTargetItem.category}
                </span>
                <button
                  onClick={() => setSelectedTargetItem(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {selectedTargetItem.title}
            </h3>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>{selectedTargetItem.lat.toFixed(4)}° N, {selectedTargetItem.lng.toFixed(4)}° E</span>
            </div>

            {selectedTargetItem.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60">
                "{selectedTargetItem.notes}"
              </p>
            )}

            {selectedTargetItem.verifiedBy && (
              <div className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Verified: {selectedTargetItem.verifiedBy}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-2">
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('incidents');
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 text-center"
              >
                Directions / Intercept
              </button>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(`${selectedTargetItem.lat}, ${selectedTargetItem.lng}`);
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center gap-1"
                title="Copy Coordinates"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 7. STREET / WATER DECK VIEW OVERLAY (PEGMAN 360° PREVIEW) */}
      {showStreetWaterView && (
        <div className="absolute inset-x-4 bottom-16 sm:inset-auto sm:right-16 sm:bottom-4 z-[1000] w-full max-w-sm sm:max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-amber-400 overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
          <div className="relative h-44 w-full bg-slate-900">
            <img 
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=700&auto=format&fit=crop&q=80" 
              alt="Marine Water Deck View" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
            <button
              onClick={() => setShowStreetWaterView(false)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center text-xs font-bold"
            >
              ✕
            </button>
            <div className="absolute top-2 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-400 text-black text-[10px] font-bold">
              <Camera className="w-3 h-3" />
              <span>COASTAL WATER DECK VIEW (360° CORRIDOR)</span>
            </div>
            <div className="absolute bottom-2 left-3 right-3 text-white">
              <div className="text-xs font-bold">Pamban Channel & Kurusadai Reef Pass</div>
              <div className="text-[10px] text-slate-300 font-mono">Camera: Forward Mast HD • Live Optical Telemetry</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Heading: 142° SE • Sea State 2 (Calm)</span>
            <button 
              onClick={() => setShowStreetWaterView(false)}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              Close View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
