import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Waves, 
  Wind, 
  Compass, 
  Layers, 
  Sparkles, 
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  MapPin,
  Clock,
  Gauge
} from 'lucide-react';
import { RiskAssessment } from '../../types';
import { apiService } from '../../services/apiService';

export const RiskPrediction: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState('Sector 4B - Palk Bay Coral Shoal');
  const [debrisCategory, setDebrisCategory] = useState('Ghost Fishing Gear');
  const [debrisHistoryCount, setDebrisHistoryCount] = useState<number>(18);
  const [currentSpeedKnots, setCurrentSpeedKnots] = useState<number>(1.8);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(22);
  const [waveHeightM, setWaveHeightM] = useState<number>(1.4);
  const [simulationHours, setSimulationHours] = useState<number>(48);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const [riskData, setRiskData] = useState<any>({
    riskScore: 92,
    classification: 'CRITICAL',
    densityScore: 88,
    ghostGearRisk: 95,
    cleanupPriority: 94,
    recurrenceProbability: 91,
    explanation: 'High concentration of recurring ghost fishing gear snagged in close proximity to fragile coral bommies and dugong feeding corridors.',
    factors: [
      { name: 'Historical Debris Density', score: 88, impact: 'High concentration of recurring gear snagging' },
      { name: 'Ghost Gear Entanglement Potential', score: 95, impact: 'Lethal threat to turtles, dugongs, and cetaceans' },
      { name: 'Sensitive Habitat Proximity', score: 96, impact: 'Within 1.8km of Palk Bay Coral Shoal MPA' },
      { name: 'Hydrodynamic Current Convergence', score: 84, impact: 'Tidal gyre recirculates derelict nets in reef basin' },
    ]
  });

  const [driftData, setDriftData] = useState<any>({
    totalSpeedKnots: 1.42,
    headingDeg: 128,
    vectors: {
      current: { speedKnots: 1.8, directionDeg: 115, contributionPct: 58 },
      wind: { speedKmh: 22, directionDeg: 140, contributionPct: 32 },
      waveStokes: { waveHeightM: 1.4, contributionPct: 10 },
    },
    waypoints: [
      { stepHour: 0, timeLabel: '+0h', coordinates: [9.3148, 79.1828], uncertaintyRadiusM: 150, driftSpeedKnots: 1.42, headingDeg: 128, projectedCondition: 'Current Observed Position' },
      { stepHour: 1, timeLabel: '+1h', coordinates: [9.3175, 79.1852], uncertaintyRadiusM: 370, driftSpeedKnots: 1.42, headingDeg: 128, projectedCondition: 'Near-Surface Advection' },
      { stepHour: 6, timeLabel: '+6h', coordinates: [9.3240, 79.1945], uncertaintyRadiusM: 689, driftSpeedKnots: 1.42, headingDeg: 128, projectedCondition: 'Near-Surface Advection' },
      { stepHour: 12, timeLabel: '+12h', coordinates: [9.3298, 79.2040], uncertaintyRadiusM: 911, driftSpeedKnots: 1.42, headingDeg: 128, projectedCondition: 'Tidal Gyre Convergence' },
      { stepHour: 24, timeLabel: '+24h', coordinates: [9.3360, 79.2180], uncertaintyRadiusM: 1227, driftSpeedKnots: 1.42, headingDeg: 128, projectedCondition: 'Reef Crest Stranding Zone' },
      { stepHour: 48, timeLabel: '+48h', coordinates: [9.3450, 79.2390], uncertaintyRadiusM: 1674, driftSpeedKnots: 1.42, headingDeg: 128, projectedCondition: 'Coral Shelf Smothering' },
    ],
    landfallWarning: {
      vulnerableZone: 'Palk Bay Coral Shoal Reserve',
      impactEtaHour: 18,
      impactTimestamp: new Date(Date.now() + 18 * 3600000).toISOString(),
      proximityMeters: 320,
      severity: 'CRITICAL',
      action: 'Immediate deployment of interceptor craft and containment boom before coral reef crest entanglement.'
    }
  });

  const fetchRiskAndDrift = async () => {
    setIsCalculating(true);
    try {
      const riskRes = await apiService.predictRisk({
        coordinates: [9.3148, 79.1828],
        debrisHistoryCount,
        primaryCategory: debrisCategory
      });
      if (riskRes && riskRes.success) {
        setRiskData(riskRes);
      }

      const driftRes = await apiService.predictDrift({
        origin: [9.3148, 79.1828],
        debrisCategory,
        windSpeedKmh,
        currentSpeedKnots,
        waveHeightM,
        simulationHours
      });
      if (driftRes && driftRes.success) {
        setDriftData(driftRes);
      }
    } catch (err) {
      console.warn('Risk prediction calculation notice:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    fetchRiskAndDrift();
  }, [debrisCategory, debrisHistoryCount, currentSpeedKnots, windSpeedKmh, waveHeightM, simulationHours]);

  // Drift simulation playback loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && driftData.waypoints && driftData.waypoints.length > 0) {
      timer = setInterval(() => {
        setActiveStepIndex(prev => (prev + 1) % driftData.waypoints.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, driftData.waypoints]);

  const currentWp = driftData.waypoints?.[activeStepIndex] || driftData.waypoints?.[0];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase">
              Predictive Hydrodynamics & ML Risk
            </span>
            <span className="text-xs text-[#736B5E]">Eulerian-Lagrangian Advection + Multi-Vector Scoring</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Marine Risk & Hydrodynamic Drift Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Predictive modeling of ghost gear entrapment zones, hydrodynamic current drift trajectories, and MPA coral reef impact ETAs.
          </p>
        </div>

        <button
          onClick={fetchRiskAndDrift}
          disabled={isCalculating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2A2A2A] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
          <span>Re-Simulate Ocean Models</span>
        </button>
      </div>

      {/* Hero Score Gauge */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-white to-red-50 border-2 border-red-200 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white">
              {riskData.classification} RISK ZONE IDENTIFIED
            </span>
            <span className="text-xs font-bold text-[#736B5E]">
              Entanglement Risk: {riskData.ghostGearRisk}% • Recurrence Rate: {riskData.recurrenceProbability}%
            </span>
          </div>

          <h2 className="text-2xl font-black text-[#2A2A2A]">
            {selectedArea}
          </h2>

          <p className="text-xs text-[#5C5449] leading-relaxed">
            {riskData.explanation || 'Persistent tidal gyres combined with rugged coral bathymetry create critical risk of ghost fishing gear entanglement.'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-red-200 text-center shadow-xs">
          <span className="text-xs font-extrabold text-[#736B5E] uppercase tracking-wider">Marine Risk Score</span>
          <div className="text-5xl font-black text-red-600 my-2">
            {riskData.riskScore}<span className="text-lg text-gray-400">/100</span>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
            CLEANUP PRIORITY: {riskData.cleanupPriority}/100
          </span>
        </div>

      </div>

      {/* Interactive Oceanographic Simulation Parameters Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-[#4F6F52]" />
            <h3 className="text-sm font-extrabold text-[#2A2A2A]">Hydrodynamic Drift Physics Parameters</h3>
          </div>
          <span className="text-[11px] text-[#736B5E]">Coupled Ekman Wind + Tidal Current + Stokes Wave Drift</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Target Debris Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#736B5E]">Debris Category</label>
            <select
              value={debrisCategory}
              onChange={(e) => setDebrisCategory(e.target.value)}
              className="w-full p-2 bg-[#F9F6F0] border border-[#E8E1D5] rounded-xl font-bold text-[#2A2A2A] focus:outline-hidden"
            >
              <option value="Ghost Fishing Gear">Ghost Fishing Gear (Subsurface Drag)</option>
              <option value="Plastic">Floating Plastic / Bottles (High Windage)</option>
              <option value="Styrofoam">Styrofoam Buoyancy Float</option>
              <option value="Polymer Slick">Polymer Oil Slick</option>
            </select>
          </div>

          {/* Current Speed Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[#736B5E]">
              <span>Tidal Current Speed</span>
              <span className="text-[#4F6F52]">{currentSpeedKnots} knots</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="4.0"
              step="0.1"
              value={currentSpeedKnots}
              onChange={(e) => setCurrentSpeedKnots(parseFloat(e.target.value))}
              className="w-full accent-[#4F6F52] cursor-pointer"
            />
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[#736B5E]">
              <span>Wind Speed (10m AGL)</span>
              <span className="text-[#FF6F59]">{windSpeedKmh} km/h</span>
            </div>
            <input
              type="range"
              min="5"
              max="55"
              step="1"
              value={windSpeedKmh}
              onChange={(e) => setWindSpeedKmh(parseInt(e.target.value))}
              className="w-full accent-[#FF6F59] cursor-pointer"
            />
          </div>

          {/* Significant Wave Height */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-[#736B5E]">
              <span>Wave Height (Hs)</span>
              <span className="text-[#2A2A2A]">{waveHeightM} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={waveHeightM}
              onChange={(e) => setWaveHeightM(parseFloat(e.target.value))}
              className="w-full accent-[#2A2A2A] cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* Eulerian-Lagrangian Drift Trajectory Visualizer */}
      <div className="p-6 rounded-3xl bg-[#1E2522] text-white border border-[#2D3934] shadow-md space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2D3934]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#FF6F59]" />
            <h3 className="text-sm font-extrabold">Lagrangian Trajectory Simulation (+{simulationHours} Hours)</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Simulation' : 'Play Trajectory'}</span>
            </button>
            <span className="font-mono text-xs text-[#A3B899]">
              Net Drift: {driftData.totalSpeedKnots} kn @ {driftData.headingDeg}°
            </span>
          </div>
        </div>

        {/* Waypoints Time Scrubber */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {driftData.waypoints?.map((wp: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeStepIndex === idx
                  ? 'border-[#FF6F59] bg-[#FF6F59]/20 text-white ring-1 ring-[#FF6F59]'
                  : 'border-[#2D3934] bg-[#141A17] text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-[#FF6F59]">{wp.timeLabel}</span>
                <Clock className="w-3 h-3 text-gray-400" />
              </div>
              <p className="font-mono text-[10px] truncate">{wp.coordinates[0].toFixed(3)}°N, {wp.coordinates[1].toFixed(3)}°E</p>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{wp.projectedCondition}</p>
            </button>
          ))}
        </div>

        {/* Current Active Waypoint Detail & MPA Landfall Warning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-[#141A17] border border-[#2D3934] space-y-2 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Active Time-Step Telemetry ({currentWp?.timeLabel})</span>
            <div className="flex justify-between">
              <span className="text-gray-400">Position:</span>
              <span className="font-mono font-bold text-white">{currentWp?.coordinates[0]}°N, {currentWp?.coordinates[1]}°E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Drift Velocity:</span>
              <span className="font-mono font-bold text-[#4F6F52]">{currentWp?.driftSpeedKnots} knots</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trajectory Heading:</span>
              <span className="font-mono font-bold text-[#FF6F59]">{currentWp?.headingDeg}° (Southeast)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uncertainty Radius:</span>
              <span className="font-mono font-bold text-yellow-400">±{currentWp?.uncertaintyRadiusM} meters</span>
            </div>
          </div>

          {/* MPA Landfall Alert */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-extrabold">
              <AlertTriangle className="w-4 h-4" />
              <span>MPA Landfall & Stranding Warning</span>
            </div>
            <p className="text-gray-200">
              Vulnerable Zone: <strong className="text-white">{driftData.landfallWarning?.vulnerableZone}</strong>
            </p>
            <p className="text-gray-300">
              Impact ETA: <strong className="text-red-400">+{driftData.landfallWarning?.impactEtaHour} hours</strong> • Proximity: {driftData.landfallWarning?.proximityMeters}m
            </p>
            <p className="text-[11px] text-gray-300 italic">
              {driftData.landfallWarning?.action}
            </p>
          </div>

        </div>

      </div>

      {/* Factor Weights & Multi-Vector Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskData.factors?.map((rf: any, idx: number) => (
          <div key={idx} className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-[#2A2A2A]">{rf.name}</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#F9F6F0] text-[#736B5E] border border-[#E8E1D5]">
                Risk Score: {rf.score}/100
              </span>
            </div>

            <p className="text-xs text-[#5C5449]">{rf.impact}</p>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className={rf.score > 85 ? 'text-red-600' : 'text-[#FF6F59]'}>
                  {rf.score > 85 ? 'CRITICAL IMPACT' : 'ELEVATED HAZARD'}
                </span>
                <span className="text-[#2A2A2A]">{rf.score} / 100</span>
              </div>
              <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${rf.score > 90 ? 'bg-red-600' : 'bg-[#FF6F59]'}`}
                  style={{ width: `${rf.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
