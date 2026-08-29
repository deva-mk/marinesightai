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
  Zap,
  Activity,
  Sliders
} from 'lucide-react';
import { DetectionRecord, IncidentRecord } from '../../types';
import { marineStorage } from '../../services/storage';
import { apiService } from '../../services/apiService';

interface MultimodalFusionProps {
  detections?: DetectionRecord[];
  onNavigate: (view: string, id?: string) => void;
}

export const MultimodalFusion: React.FC<MultimodalFusionProps> = ({ detections = [], onNavigate }) => {
  const safeDetections = detections || [];
  const [isFusing, setIsFusing] = useState<boolean>(false);
  const [selectedCandidates, setSelectedCandidates] = useState({
    sonarId: 'MSA-SONAR-104',
    droneId: 'GV-SURF-101',
    maxSpatialDistanceM: 200,
  });

  const [fusedResult, setFusedResult] = useState<any>({
    fusedId: 'FUSED-MSA-9102',
    targetCategory: 'Ghost Fishing Gear',
    combinedConfidence: 0.98,
    priority: 'Critical',
    coordinates: [9.3148, 79.1828],
    spatialMatchDistanceM: 14.5,
    sensorSignals: {
      sonar: {
        detected: true,
        confidence: 0.94,
        shadowLengthM: 6.8,
        note: 'Submerged monofilament net cluster casting 6.8m acoustic shadow at 14.2m depth.',
      },
      drone: {
        detected: true,
        confidence: 0.92,
        altitudeM: 35,
        note: 'Aerial multi-spectral polymer reflectance in 850nm NIR band with high specular contrast.',
      },
      camera: {
        detected: true,
        confidence: 0.88,
        surfaceVis: 'High',
        note: 'Surface tension dampening and buoy float array co-located with tidal gyre.',
      },
      gps: {
        lat: 9.3148,
        lng: 79.1828,
        accuracyMeters: 1.8,
      },
    },
    aiExplanation: 'Multimodal Marine Fusion established spatial-temporal co-registration (Δd = 14.5m). Subsurface acoustic shadow aligns with aerial multi-spectral surface sighting, raising combined Bayesian confidence to 98%.',
    recommendation: 'Immediate dispatch of RV Sagar Guardian salvage unit with heavy hydraulic cutters.',
  });

  const handleRunFusion = async () => {
    setIsFusing(true);
    try {
      const response = await apiService.analyzeFusion({
        sonarTarget: {
          detected: true,
          confidence: 0.94,
          depthMeters: 14.2,
          shadowLengthM: 6.8,
          coords: [9.3142, 79.1821]
        },
        droneTarget: {
          detected: true,
          confidence: 0.92,
          altitudeM: 35,
          coords: [9.3155, 79.1834]
        },
        cameraTarget: {
          detected: true,
          confidence: 0.88,
          coords: [9.3149, 79.1825]
        }
      });

      if (response && response.success && response.fusion) {
        setFusedResult(response.fusion);
      }
    } catch (err) {
      console.warn('Real fusion API error:', err);
    } finally {
      setIsFusing(false);
    }
  };

  const handleCreateFusedIncident = () => {
    const newInc: IncidentRecord = {
      id: `INC-${Math.floor(9070 + Math.random() * 900)}`,
      title: `Fused High-Risk Target: ${fusedResult.targetCategory} (${fusedResult.fusedId})`,
      category: fusedResult.targetCategory || 'Ghost Fishing Gear',
      source: 'FUSION',
      severity: fusedResult.priority === 'Critical' ? 'CRITICAL' : 'HIGH',
      confidence: fusedResult.combinedConfidence,
      status: 'NEW',
      location: {
        lat: fusedResult.coordinates?.[0] || 9.3148,
        lng: fusedResult.coordinates?.[1] || 79.1828,
        depthMeters: 14.2,
        sector: 'Sector 4B - Palk Bay',
        areaName: 'Palk Bay Coral Shoal'
      },
      priorityScore: Math.round((fusedResult.combinedConfidence || 0.95) * 100),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      reportedBy: 'MarineSight AI Multimodal Fusion Engine v1.8',
      notes: [fusedResult.aiExplanation, `Action: ${fusedResult.recommendation}`],
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
      associatedDetectionIds: ['GV-SURF-101', 'MSA-SONAR-104'],
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
              Bayesian Fusion Engine
            </span>
            <span className="text-xs text-[#736B5E]">Spatial-Temporal Haversine Co-Registration</span>
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
          <span>Run Bayesian Co-Registration</span>
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
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">Subsurface Shadow ({fusedResult.sensorSignals?.sonar?.shadowLengthM || 6.8}m)</p>
          <p className="text-[11px] text-[#736B5E] mt-1">
            Confidence: <strong>{Math.round((fusedResult.sensorSignals?.sonar?.confidence || 0.94) * 100)}%</strong>
          </p>
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
          <p className="text-[11px] text-[#736B5E] mt-1">
            YOLO Confidence: <strong>{Math.round((fusedResult.sensorSignals?.drone?.confidence || 0.92) * 100)}%</strong>
          </p>
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
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">Surface Poly Sheen</p>
          <p className="text-[11px] text-[#736B5E] mt-1">
            Optical Confidence: <strong>{Math.round((fusedResult.sensorSignals?.camera?.confidence || 0.88) * 100)}%</strong>
          </p>
        </div>

        {/* 4. GPS & Spatial Delta */}
        <div className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59]">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold text-[#2A2A2A]">Geospatial Delta</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#FF6F59]">
              Δ {fusedResult.spatialMatchDistanceM || 14.5}m
            </span>
          </div>
          <p className="text-xs font-bold text-[#2A2A2A] mt-2">High Spatial Coherence</p>
          <p className="text-[11px] text-[#736B5E] mt-1">Haversine Distance: <strong>&lt; 20m</strong></p>
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
              <span className="text-xs font-mono font-bold text-[#5C5449]">{fusedResult.fusedId}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2A2A2A] leading-tight">
              {fusedResult.targetCategory} Spatial Co-Registration
            </h2>
            <p className="text-xs text-[#736B5E] mt-1">Palk Bay Coral Shoal (9.3148°N, 79.1828°E)</p>
          </div>

          <div className="flex items-center gap-4 bg-[#F9F6F0] p-4 rounded-2xl border border-[#E8E1D5]">
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#736B5E] uppercase">Fused Confidence</p>
              <p className="text-3xl font-black text-[#FF6F59]">{Math.round((fusedResult.combinedConfidence || 0.98) * 100)}%</p>
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
              {(fusedResult.coordinates?.[0] || 9.3148).toFixed(4)}°N, {(fusedResult.coordinates?.[1] || 79.1828).toFixed(4)}°E
            </p>
            <p className="text-[11px] text-[#736B5E] mt-0.5">Depth: 14.2 meters seabed</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold uppercase text-[10px]">Ecological Bio-Risk</span>
            <p className="text-sm font-black text-red-600 mt-1">
              CRITICAL HAZARD
            </p>
            <p className="text-[11px] text-[#736B5E] mt-0.5">High entanglement danger for sea turtles & dugongs</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold uppercase text-[10px]">Operational Recommendation</span>
            <p className="text-xs font-bold text-[#4F6F52] mt-1">
              {fusedResult.recommendation}
            </p>
          </div>
        </div>

        {/* Visual Explanation Callout */}
        <div className="p-5 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#2A2A2A]">
            <Sparkles className="w-4 h-4 text-[#FF6F59]" />
            <span>Multimodal Geo-Fusion Scientific Explanation</span>
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
