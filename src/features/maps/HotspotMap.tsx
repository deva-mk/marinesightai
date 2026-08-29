import React, { useState } from 'react';
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
  Flame
} from 'lucide-react';
import { DetectionRecord, IncidentRecord, HotspotRecord, CleanupMission } from '../../types';

interface HotspotMapProps {
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  hotspots?: HotspotRecord[];
  missions?: CleanupMission[];
  onNavigate: (view: string, id?: string) => void;
}

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

  const defaultHotspot: HotspotRecord = {
    id: 'HS-DEFAULT',
    name: 'Gulf of Mannar Sector 4',
    sector: 'Sector 4',
    centerLat: 10.954,
    centerLng: 78.081,
    radiusMeters: 3200,
    detectionCount: 14,
    riskScore: 82,
    dominantCategory: 'Ghost Fishing Gear',
    recurrenceIndex: 8.4,
    currentVelocityKnots: 0.42,
    lastActivity: new Date().toISOString()
  };

  const [selectedTarget, setSelectedTarget] = useState<any>(safeHotspots[0] || defaultHotspot);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showDroneRoutes, setShowDroneRoutes] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 10.9541, lng: 78.0812 });
  const [locating, setLocating] = useState<boolean>(false);

  const handleLocateMe = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        () => {
          setUserLocation({ lat: 10.9541, lng: 78.0812 });
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
  };

  // Calculate Euclidean Distance in km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const filteredHotspots = hotspots.filter(h => {
    if (categoryFilter === 'ALL') return true;
    return h.dominantCategory === categoryFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Geospatial Operations
            </span>
            <span className="text-xs text-[#736B5E]">Gulf of Mannar Hydrographic Radar Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Pollution Hotspots & Navigation Map
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Spatial clustering, drone flight paths, distance estimation, and debris recurrence heatmap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLocateMe}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#4F6F52] hover:bg-[#F2EDE4] transition-all shadow-xs"
          >
            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin text-[#FF6F59]' : ''}`} />
            <span>{locating ? 'Acquiring GPS...' : 'Locate Me (GPS)'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8C8275]" />
            <span className="font-bold text-[#5C5449]">Filter Class:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] font-bold text-[#2A2A2A] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Ghost Fishing Gear">Ghost Fishing Gear</option>
              <option value="Plastic">Plastic</option>
              <option value="Fishing Line">Fishing Line</option>
              <option value="Metal Debris">Metal Debris</option>
              <option value="Marine Anomaly">Marine Anomaly</option>
            </select>
          </div>

          <label className="flex items-center gap-2 font-bold text-[#5C5449] cursor-pointer">
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={(e) => setShowHeatmap(e.target.checked)} 
              className="accent-[#FF6F59]"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#FF6F59]" /> Density Heatmap
            </span>
          </label>

          <label className="flex items-center gap-2 font-bold text-[#5C5449] cursor-pointer">
            <input 
              type="checkbox" 
              checked={showDroneRoutes} 
              onChange={(e) => setShowDroneRoutes(e.target.checked)} 
              className="accent-[#4F6F52]"
            />
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-[#4F6F52]" /> Drone Corridors
            </span>
          </label>
        </div>

        <div className="text-xs text-[#736B5E] font-medium">
          Showing <strong>{filteredHotspots.length}</strong> active hotspots • <strong>15</strong> incidents mapped
        </div>
      </div>

      {/* Main Map & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-[#18231E] rounded-3xl border border-[#273830] p-4 shadow-xl text-white relative min-h-[500px] flex flex-col justify-between overflow-hidden">
          
          {/* Top Floating Map Controls */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#4F6F52] animate-ping" />
              <span>RADAR GRID: 10.930°N - 10.980°N | 78.060°E - 78.100°E</span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-[10px] mr-2">Critical</span>
              <span className="w-2 h-2 rounded-full bg-[#FF6F59]" /> <span className="text-[10px] mr-2">High</span>
              <span className="w-2 h-2 rounded-full bg-[#4F6F52]" /> <span className="text-[10px]">Moderate</span>
            </div>
          </div>

          {/* Interactive Visual Map Canvas with SVG Hotspot Clusters */}
          <div className="relative w-full h-[420px] my-2 bg-[#121B17] rounded-2xl border border-[#273830] overflow-hidden">
            
            {/* Marine Grid Bathymetry Contour Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="marine-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#4F6F52" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#marine-grid)" />
              {/* Bathymetric depth curves */}
              <path d="M0,80 Q200,120 400,60 T800,100" fill="none" stroke="#A3B899" strokeWidth="1" strokeDasharray="3,3" />
              <path d="M0,180 Q250,220 500,140 T800,200" fill="none" stroke="#A3B899" strokeWidth="1" strokeDasharray="4,4" />
              <path d="M0,300 Q300,320 600,260 T800,320" fill="none" stroke="#A3B899" strokeWidth="1" />
            </svg>

            {/* Drone Flight Paths Overlay */}
            {showDroneRoutes && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline 
                  points="120,80 240,160 420,120 580,240 460,340 280,310 120,80" 
                  fill="none" 
                  stroke="#4F6F52" 
                  strokeWidth="2" 
                  strokeDasharray="6,6"
                />
                <circle cx="420" cy="120" r="4" fill="#4F6F52" />
              </svg>
            )}

            {/* Heatmap Overlay Simulation */}
            {showHeatmap && (
              <>
                <div className="absolute top-[30%] left-[45%] w-36 h-36 bg-red-500/20 rounded-full blur-2xl pointer-events-none animate-pulse-subtle" />
                <div className="absolute top-[20%] left-[25%] w-44 h-44 bg-[#FF6F59]/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute top-[55%] left-[60%] w-32 h-32 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />
              </>
            )}

            {/* User GPS Location Pin */}
            <div 
              className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
              title={`My GPS Location: ${userLocation.lat}°N, ${userLocation.lng}°E`}
            >
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-white animate-ping" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                YOU ARE HERE
              </div>
            </div>

            {/* Hotspots & Target Markers */}
            {filteredHotspots.map((hs, idx) => {
              // Normalized positioning simulation
              const posX = 20 + ((idx * 27) % 65);
              const posY = 20 + ((idx * 31) % 60);
              const isSelected = selectedTarget?.id === hs.id;

              return (
                <div
                  key={hs.id}
                  onClick={() => setSelectedTarget(hs)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group transition-all duration-200`}
                  style={{ left: `${posX}%`, top: `${posY}%` }}
                >
                  <div className={`p-2 rounded-2xl transition-all shadow-lg flex items-center justify-center ${
                    isSelected 
                      ? 'bg-[#FF6F59] text-white ring-4 ring-[#FF6F59]/40 scale-125' 
                      : hs.riskScore >= 85 
                      ? 'bg-red-600 text-white hover:scale-115' 
                      : 'bg-[#4F6F52] text-white hover:scale-110'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>

                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap border border-white/20 shadow-md">
                    {(hs.name || 'Hotspot').slice(0, 16)}... ({hs.detectionCount || 0})
                  </div>
                </div>
              );
            })}

          </div>

          {/* Bottom Floating Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 z-10 text-xs font-mono">
            <span className="text-[#A3B899]">
              DISTANCE TO SELECTED HOTSPOT: {getDistanceKm(userLocation.lat, userLocation.lng, selectedTarget?.centerLat || 10.954, selectedTarget?.centerLng || 78.081)} km
            </span>
            <span className="text-[#FF6F59] font-bold">
              EDDY VELOCITY: {selectedTarget?.currentVelocityKnots || 0.42} KTS
            </span>
          </div>

        </div>

        {/* Selected Hotspot Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedTarget ? (
            <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-5">
              
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#736B5E]">{selectedTarget.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedTarget.riskScore >= 85 ? 'bg-red-100 text-red-700' : 'bg-[#FF6F59]/15 text-[#FF6F59]'
                }`}>
                  RISK {selectedTarget.riskScore} / 100
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-[#2A2A2A] leading-snug">
                  {selectedTarget.name}
                </h3>
                <p className="text-xs text-[#736B5E] mt-1">{selectedTarget.sector} • Radius {selectedTarget.radiusMeters}m</p>
              </div>

              {/* Stats Box */}
              <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Dominant Threat:</span>
                  <span className="font-bold text-[#FF6F59]">{selectedTarget.dominantCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Detections in Hotspot:</span>
                  <span className="font-bold text-[#2A2A2A]">{selectedTarget.detectionCount} targets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Recurrence Index:</span>
                  <span className="font-bold text-[#4F6F52]">{selectedTarget.recurrenceIndex} / 10 (High)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#736B5E]">Coordinates:</span>
                  <span className="font-mono font-bold text-[#2A2A2A]">
                    {selectedTarget.centerLat.toFixed(4)}°N, {selectedTarget.centerLng.toFixed(4)}°E
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#E8E1D5]">
                  <span className="text-[#736B5E]">Distance to User:</span>
                  <span className="font-bold text-[#2A2A2A]">
                    {getDistanceKm(userLocation.lat, userLocation.lng, selectedTarget.centerLat, selectedTarget.centerLng)} km
                  </span>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>AI Hotspot Prediction</span>
                </div>
                <p className="text-[11px] text-[#5C5449] leading-relaxed">
                  Persistent tidal convergence continually accumulates buoyant polymer debris and ghost netting into this bathymetric trench. Priority for autonomous barrier containment.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('cleanup')}
                  className="w-full py-2.5 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Schedule Cleanup Mission Here</span>
                </button>

                <button
                  onClick={() => onNavigate('sonar')}
                  className="w-full py-2.5 rounded-xl bg-[#2A2A2A] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Radar className="w-3.5 h-3.5" />
                  <span>View Sonar Transects in Sector</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#E8E1D5] text-center text-[#736B5E]">
              <MapPin className="w-8 h-8 mx-auto text-[#8C8275] mb-2" />
              <p className="text-xs font-bold">Select a map marker to inspect debris telemetry</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
