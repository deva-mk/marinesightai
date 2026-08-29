import React, { useState } from 'react';
import { 
  Eye, 
  Plane, 
  UploadCloud, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { DetectionRecord, IncidentRecord } from '../../types';
import { marineStorage } from '../../services/storage';

interface SurfaceVisionProps {
  detections?: DetectionRecord[];
  onNavigate: (view: string, id?: string) => void;
}

export const SurfaceVision: React.FC<SurfaceVisionProps> = ({ detections = [], onNavigate }) => {
  const safeDetections = detections || [];
  const surfaceDetections = safeDetections.filter(d => d.source === 'DRONE' || d.source === 'CAMERA');
  const defaultDetection: DetectionRecord = {
    id: 'GV-SURF-DEMO',
    title: 'Surface Optical Detection',
    category: 'Plastic',
    source: 'DRONE',
    confidence: 0.91,
    qualityScore: 94,
    severity: 'HIGH',
    location: {
      lat: 10.9582,
      lng: 78.0790,
      depthMeters: 0,
      sector: 'Sector 4A - North Transect',
      areaName: 'Surface Gyre Convergence Track'
    },
    timestamp: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    status: 'Unverified',
    boundingBoxes: [
      { x: 120, y: 150, width: 220, height: 180, label: 'Plastic Cluster (91%)', confidence: 0.91 }
    ]
  };

  const [selectedDetection, setSelectedDetection] = useState<DetectionRecord>(
    surfaceDetections[0] || safeDetections[0] || defaultDetection
  );

  const [activeTab, setActiveTab] = useState<'IMAGE' | 'VIDEO_TRACK' | 'DRONE'>('IMAGE');
  const [confidenceSlider, setConfidenceSlider] = useState<number>(0.50);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [videoFrameIndex, setVideoFrameIndex] = useState<number>(14);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setTimeout(() => {
      const newSurfaceDet: DetectionRecord = {
        id: `GV-SURF-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Surface Optical Detection (${file.name})`,
        category: 'Plastic',
        source: 'DRONE',
        confidence: 0.91,
        qualityScore: 94,
        severity: 'HIGH',
        location: {
          lat: 10.9582,
          lng: 78.0790,
          depthMeters: 0,
          sector: 'Sector 4A - North Transect',
          areaName: 'Surface Gyre Convergence Track'
        },
        timestamp: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
        status: 'Unverified',
        boundingBoxes: [
          { x: 110, y: 140, width: 320, height: 210, label: 'Plastic Matrix (91%)', confidence: 0.91 }
        ],
        estimatedDimensions: '14.0m x 5.2m slick',
        estimatedWeightKg: 210,
        opticalSignature: 'Multispectral polymer reflection in 850nm NIR band',
        aiExplanation: 'YOLOv8-Marine model segmented surface polymer aggregation with 91% confidence.',
        isDemo: true
      };

      marineStorage.addDetection(newSurfaceDet);
      setSelectedDetection(newSurfaceDet);
      setIsProcessing(false);
    }, 1000);
  };

  const handleCreateIncident = () => {
    const newInc: IncidentRecord = {
      id: `INC-${Math.floor(9060 + Math.random() * 900)}`,
      title: `Surface Debris: ${selectedDetection.category} (${selectedDetection.id})`,
      category: selectedDetection.category,
      source: selectedDetection.source,
      severity: selectedDetection.severity,
      confidence: selectedDetection.confidence,
      status: 'NEW',
      location: selectedDetection.location,
      priorityScore: Math.round(selectedDetection.confidence * 88),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      reportedBy: 'MarineSight AI YOLOv8-Marine Pipeline',
      notes: [`Generated from Surface Detection ${selectedDetection.id}`],
      imageUrl: selectedDetection.imageUrl,
      associatedDetectionIds: [selectedDetection.id],
      bioRiskLevel: selectedDetection.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      estimatedRemovalEffortHours: 6
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              Computer Vision
            </span>
            <span className="text-xs text-[#736B5E]">YOLOv8-Marine Optical & Aerial Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Surface Vision & Drone Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Detect, classify, and track floating plastics, discarded ropes, and ghost gear surface markers in real-time.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold transition-all shadow-sm shadow-[#4F6F52]/20 cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Drone Image / Footage</span>
          <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-[#E8E1D5] pb-2">
        <button
          onClick={() => setActiveTab('IMAGE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'IMAGE' ? 'bg-[#FF6F59] text-white shadow-xs' : 'bg-white text-[#736B5E] hover:bg-[#F2EDE4]'
          }`}
        >
          High-Res Aerial Imagery
        </button>
        <button
          onClick={() => setActiveTab('VIDEO_TRACK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'VIDEO_TRACK' ? 'bg-[#4F6F52] text-white shadow-xs' : 'bg-white text-[#736B5E] hover:bg-[#F2EDE4]'
          }`}
        >
          Video Multi-Frame Tracking
        </button>
        <button
          onClick={() => onNavigate('live')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2A2A2A] text-white hover:bg-black shadow-xs flex items-center gap-1.5"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Launch Live Webcam Radar</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Viewport (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D5] shadow-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EDE4]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#2A2A2A]">{selectedDetection.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52]">
                  {selectedDetection.source} SENSOR
                </span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-[#5C5449] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showBoxes} 
                    onChange={(e) => setShowBoxes(e.target.checked)} 
                    className="accent-[#FF6F59]"
                  />
                  <span>YOLO Bounding Boxes</span>
                </label>
              </div>
            </div>

            {/* Stage */}
            <div className="relative my-4 aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 z-20 flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="w-8 h-8 text-[#4F6F52] animate-spin" />
                  <p className="text-xs font-bold">YOLOv8-Marine Inference Processing...</p>
                </div>
              )}

              <img 
                src={selectedDetection.imageUrl} 
                alt="Surface Vision" 
                className="w-full h-full object-cover"
              />

              {/* Bounding Box */}
              {showBoxes && selectedDetection.boundingBoxes && selectedDetection.boundingBoxes.map((box, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-[#4F6F52] bg-[#4F6F52]/15 rounded-lg"
                  style={{
                    left: `${(box.x / 600) * 100}%`,
                    top: `${(box.y / 400) * 100}%`,
                    width: `${(box.width / 600) * 100}%`,
                    height: `${(box.height / 400) * 100}%`
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-[#4F6F52] text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                    {box.label || `${selectedDetection.category} (${Math.round(selectedDetection.confidence * 100)}%)`}
                  </div>
                </div>
              ))}

              {/* Bottom Telemetry Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-xl text-white text-[10px] font-mono border border-white/10">
                Altitude: 35m AGL • GSD: 1.2 cm/pixel • Lat: {selectedDetection.location.lat.toFixed(4)}°N
              </div>
            </div>

            {/* Video Multi-Frame Bar if in VIDEO_TRACK */}
            {activeTab === 'VIDEO_TRACK' && (
              <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#2A2A2A]">
                  <span>Frame Tracker Timeline (Track ID: TRK-482)</span>
                  <span className="font-mono text-[#4F6F52]">Frame {videoFrameIndex} / 60</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={videoFrameIndex}
                  onChange={(e) => setVideoFrameIndex(parseInt(e.target.value))}
                  className="w-full accent-[#4F6F52] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#736B5E]">
                  <span>00:00:00 (Entry)</span>
                  <span>Drift: 215° @ 0.8 knots</span>
                  <span>00:00:06 (Exit)</span>
                </div>
              </div>
            )}

          </div>

          {/* Catalog of Surface Detections */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-xs">
            <h3 className="font-extrabold text-sm text-[#2A2A2A] mb-3">Surface & Drone Sightings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {surfaceDetections.slice(0, 4).map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDetection(d)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    selectedDetection.id === d.id ? 'border-[#4F6F52] bg-[#4F6F52]/10 shadow-sm' : 'border-[#E8E1D5]'
                  }`}
                >
                  <img src={d.imageUrl} alt="" className="w-full h-16 rounded-xl object-cover mb-2" />
                  <p className="font-mono text-[10px] font-bold text-[#2A2A2A]">{d.id}</p>
                  <p className="text-[11px] font-bold text-[#4F6F52] truncate">{d.category}</p>
                  <p className="text-[10px] text-[#736B5E]">{Math.round(d.confidence * 100)}% Confidence</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Intelligence Side Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#736B5E]">{selectedDetection.id}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/15 text-[#4F6F52]">
                {selectedDetection.severity} SEVERITY
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#2A2A2A] leading-snug">
                {selectedDetection.category}
              </h2>
              <p className="text-xs text-[#736B5E] mt-1">{selectedDetection.location.areaName}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Estimated Mass:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedWeightKg || 190} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Sensor Type:</span>
                <span className="font-bold text-[#4F6F52]">{selectedDetection.source} Vision</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Optical Signature:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.opticalSignature || 'Polymer NIR Reflectance'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
                <span>YOLO AI Reasoning</span>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-relaxed">
                {selectedDetection.aiExplanation || 'High-confidence polymer cluster detected floating in surface tidal convergence.'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCreateIncident}
                className="w-full py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-[#FF6F59]/30"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Create Incident Record</span>
              </button>

              <button
                onClick={() => onNavigate('fusion')}
                className="w-full py-2.5 rounded-xl bg-[#2A2A2A] hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Correlate with Seafloor Sonar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
