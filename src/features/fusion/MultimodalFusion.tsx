import React, { useState } from 'react';
import { 
  Layers, 
  Radar, 
  Eye, 
  Plane, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RefreshCw,
  Compass,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { DetectionRecord, IncidentRecord } from '../../types';
import { marineStorage } from '../../services/storage';

interface MultimodalFusionProps {
  detections?: DetectionRecord[];
  onNavigate: (view: string, id?: string) => void;
}

export const MultimodalFusion: React.FC<MultimodalFusionProps> = ({ detections = [], onNavigate }) => {
  const safeDetections = detections || [];
  const [isFusing, setIsFusing] = useState<boolean>(false);
  const [fusedResult, setFusedResult] = useState({
    id: 'FUSED-GV-1092',
    title: 'High-Density Ghost Fishing Gear & Surface Marker Matrix',
    combinedConfidence: 0.96,
    severity: 'CRITICAL' as const,
    spatialDeltaMeters: 3.4,
    temporalDeltaSeconds: 28,
    location: {
      lat: 10.9544,
      lng: 78.0815,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Marine Sanctuary Core Reef'
    },
    bioRiskScore: 94,
    recommendedAction: 'Immediate Tier 1 Diver Haul & Winch Deployment',
    aiExplanation: 'Cross-sensor spatial correlation identified high-contrast aerial buoy coordinates (Drone DM-101) directly aligned with a 28.5m seafloor diffuse acoustic shadow (Side-Scan Sonar Transect 04). Combined Bayesian likelihood confirms active ghost net entrapment with 96% certainty.'
  });

  const handleRunFusion = () => {
    setIsFusing(true);
    setTimeout(() => {
      setFusedResult({
        id: `FUSED-GV-${Math.floor(1000 + Math.random() * 9000)}`,
        title: 'Correlated Derelict Trap & Surface Buoy Line Array',
        combinedConfidence: 0.95,
        severity: 'CRITICAL',
        spatialDeltaMeters: 4.1,
        temporalDeltaSeconds: 42,
        location: {
          lat: 10.9510,
          lng: 78.0845,
          sector: 'Sector 4B - Gulf of Mannar',
          areaName: 'Outer Reef Channel'
        },
        bioRiskScore: 91,
        recommendedAction: 'Deploy Vessel RV Ocean-Guardian for Hydraulic Recovery',
        aiExplanation: 'Sonar acoustic shadow of submerged crab pot cluster joined with aerial drone optical sighting within 4.1m spatial radius.'
      });
      setIsFusing(false);
    }, 1000);
  };

  const handleCreateFusedIncident = () => {
    const newInc: IncidentRecord = {
      id: `INC-${Math.floor(9070 + Math.random() * 900)}`,
      title: fusedResult.title,
      category: 'Ghost Fishing Gear',
      source: 'FUSION',
      severity: fusedResult.severity,
      confidence: fusedResult.combinedConfidence,
      status: 'NEW',
      location: fusedResult.location,
      priorityScore: 96,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      reportedBy: 'MarineSight AI Multimodal Fusion Engine',
      notes: [fusedResult.aiExplanation, `Recommended: ${fusedResult.recommendedAction}`],
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
      associatedDetectionIds: ['GV-1024', 'GV-1026'],
      bioRiskLevel: 'CRITICAL',
      estimatedRemovalEffortHours: 12
    };

    marineStorage.addIncident(newInc);
    onNavigate('incidents', newInc.id);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Sensor Fusion Engine
            </span>
            <span className="text-xs text-[#736B5E]">Spatial-Temporal Cross Correlation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Multimodal Marine Fusion
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Synthesize side-scan sonar, aerial drone vision, vessel cameras, and GPS telemetry into unified high-confidence targets.
          </p>
        </div>

        <button
          onClick={handleRunFusion}
          disabled={isFusing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold transition-all shadow-sm shadow-[#FF6F59]/30"
        >
          {isFusing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>Re-Analyze Spatial Matches</span>
        </button>
      </div>

      {/* Sensor Contribution Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Sonar Card */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59]">
                <Radar className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-[#2A2A2A]">Side-Scan Sonar</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> MATCHED
            </span>
          </div>
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">Submerged Net Shadow (28.5m)</p>
          <p className="text-[11px] text-[#736B5E] mt-1">Acoustic Confidence: <strong>94%</strong></p>
        </div>

        {/* 2. Drone Card */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#4F6F52]/15 text-[#4F6F52]">
                <Plane className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-[#2A2A2A]">Aerial Drone Vision</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> MATCHED
            </span>
          </div>
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">Surface Buoy & Trawl Webbing</p>
          <p className="text-[11px] text-[#736B5E] mt-1">YOLO Confidence: <strong>89%</strong></p>
        </div>

        {/* 3. Vessel Optical Camera */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#2A2A2A] text-white">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-[#2A2A2A]">Vessel Camera</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> MATCHED
            </span>
          </div>
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">Trailing Monofilament Fiber</p>
          <p className="text-[11px] text-[#736B5E] mt-1">Optical Confidence: <strong>88%</strong></p>
        </div>

        {/* 4. GPS & Depth Telemetry */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59]">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-[#2A2A2A]">Geospatial Delta</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#FF6F59]">
              Δ {fusedResult.spatialDeltaMeters}m
            </span>
          </div>
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">High Spatial Coherence</p>
          <p className="text-[11px] text-[#736B5E] mt-1">Time Delta: <strong>{fusedResult.temporalDeltaSeconds}s</strong></p>
        </div>

      </div>

      {/* Main Fused High-Confidence Incident Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-white to-[#FF6F59]/10 border-2 border-[#FF6F59]/50 shadow-xl space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E1D5] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FF6F59] text-white">
                HIGH-CONFIDENCE FUSED TARGET
              </span>
              <span className="text-xs font-mono font-bold text-[#5C5449]">{fusedResult.id}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2A2A2A] leading-tight">
              {fusedResult.title}
            </h2>
            <p className="text-xs text-[#736B5E] mt-1">{fusedResult.location.areaName} ({fusedResult.location.sector})</p>
          </div>

          <div className="flex items-center gap-4 bg-[#F9F6F0] p-4 rounded-2xl border border-[#E8E1D5]">
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#736B5E] uppercase">Fused Confidence</p>
              <p className="text-3xl font-black text-[#FF6F59]">{Math.round(fusedResult.combinedConfidence * 100)}%</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FF6F59]/15 flex items-center justify-center text-[#FF6F59]">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Telemetry Detail Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold uppercase text-[10px]">Location Coordinates</span>
            <p className="font-mono text-sm font-bold text-[#2A2A2A] mt-1">
              {fusedResult.location.lat.toFixed(4)}°N, {fusedResult.location.lng.toFixed(4)}°E
            </p>
            <p className="text-[11px] text-[#736B5E] mt-0.5">Depth: 28.5 meters benthos</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold uppercase text-[10px]">Ecological Bio-Risk Score</span>
            <p className="text-sm font-black text-red-600 mt-1">
              {fusedResult.bioRiskScore} / 100 (CRITICAL RISK)
            </p>
            <p className="text-[11px] text-[#736B5E] mt-0.5">High entanglement danger for sea fauna</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold uppercase text-[10px]">Recommended Action</span>
            <p className="text-xs font-bold text-[#4F6F52] mt-1">
              {fusedResult.recommendedAction}
            </p>
          </div>
        </div>

        {/* Visual Explanation Callout */}
        <div className="p-5 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#2A2A2A]">
            <Sparkles className="w-4 h-4 text-[#FF6F59]" />
            <span>Multimodal Fusion Explanation Engine</span>
          </div>
          <p className="text-xs text-[#5C5449] leading-relaxed">
            {fusedResult.aiExplanation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            onClick={() => onNavigate('hotspots')}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] hover:bg-[#F2EDE4] transition-colors"
          >
            Locate on Hotspot Map
          </button>

          <button
            onClick={handleCreateFusedIncident}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-extrabold transition-all shadow-md shadow-[#FF6F59]/30"
          >
            <span>Create Priority Incident</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
