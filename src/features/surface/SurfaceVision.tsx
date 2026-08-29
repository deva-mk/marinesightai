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
  Maximize2,
  Download,
  Filter,
  Cpu,
  Target,
  FileText
} from 'lucide-react';
import { DetectionRecord, IncidentRecord } from '../../types';
import { marineStorage } from '../../services/storage';
import { apiService } from '../../services/apiService';

interface SurfaceVisionProps {
  detections?: DetectionRecord[];
  onNavigate: (view: string, id?: string) => void;
}

interface PresetSample {
  name: string;
  filename: string;
  category: string;
  url: string;
  description: string;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    name: 'Marine Debris Field',
    filename: 'marine_debris.jpg',
    category: 'Plastic',
    url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    description: 'High-density polyethylene surface aggregation in tidal eddy'
  },
  {
    name: 'Ghost Net & Buoy Line',
    filename: 'ghost_net_aerial.jpg',
    category: 'Ghost Fishing Gear',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    description: 'Derelict synthetic gillnet with floating markers near coral reef'
  },
  {
    name: 'Styrofoam Float & Bottles',
    filename: 'coastal_styrofoam.jpg',
    category: 'Styrofoam',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop&q=80',
    description: 'Expanded polystyrene buoyant blocks and plastic containers'
  },
  {
    name: 'Polymer Oil Sheen',
    filename: 'oil_slick_estuary.jpg',
    category: 'Oil Slick',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    description: 'Surface tension dampening with hydrocarbon & microplastic slick'
  }
];

export const SurfaceVision: React.FC<SurfaceVisionProps> = ({ detections = [], onNavigate }) => {
  const safeDetections = detections || [];
  const surfaceDetections = safeDetections.filter(d => d.source === 'DRONE' || d.source === 'CAMERA');
  
  const [selectedDetection, setSelectedDetection] = useState<DetectionRecord>(
    surfaceDetections[0] || {
      id: 'GV-SURF-101',
      title: 'Surface Optical Detection (marine_debris.jpg)',
      category: 'Plastic',
      source: 'DRONE',
      confidence: 0.94,
      qualityScore: 95,
      severity: 'HIGH',
      location: {
        lat: 10.9582,
        lng: 78.0790,
        depthMeters: 0,
        sector: 'Sector 4A - North Transect',
        areaName: 'Surface Gyre Convergence Track'
      },
      timestamp: new Date().toISOString(),
      imageUrl: PRESET_SAMPLES[0].url,
      status: 'Unverified',
      boundingBoxes: [
        { x: 120, y: 130, width: 310, height: 210, label: 'Plastic (94%)', confidence: 0.94, category: 'Plastic' },
        { x: 440, y: 90, width: 110, height: 120, label: 'Bottle (88%)', confidence: 0.88, category: 'Bottle' }
      ],
      estimatedDimensions: '14.0m x 5.2m slick',
      estimatedWeightKg: 210,
      opticalSignature: 'Multispectral polymer reflection in 850nm NIR band with high specular contrast',
      aiExplanation: 'YOLOv9-SeaGuard identified high-density surface polymer aggregation aligned with tidal gyre convergence.',
    }
  );

  const [activeTab, setActiveTab] = useState<'IMAGE' | 'VIDEO_TRACK' | 'DRONE'>('IMAGE');
  const [modelId, setModelId] = useState<string>('yolo-v9-marine');
  const [confidenceSlider, setConfidenceSlider] = useState<number>(0.45);
  const [iouSlider, setIouSlider] = useState<number>(0.50);
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [videoFrameIndex, setVideoFrameIndex] = useState<number>(14);
  const [yoloTxt, setYoloTxt] = useState<string>('1 0.458333 0.587500 0.516667 0.525000\n0 0.825000 0.375000 0.183333 0.300000');
  const [inferenceMetrics, setInferenceMetrics] = useState<any>({
    modelName: 'MarineSight AI Surface-YOLOv9 SeaGuard',
    latencyMs: 14,
    throughputFps: 71,
    precision: 0.938,
    recall: 0.945,
    mAP50: 0.942,
    device: 'NVIDIA Jetson Orin Nano / WebAssembly TensorRT'
  });

  const runInferencePipeline = async (filename: string, imageDataUrl?: string, categoryHint?: string) => {
    setIsProcessing(true);
    try {
      const response = await apiService.processSurface({
        filename,
        source: 'DRONE',
        confidenceThreshold: confidenceSlider,
      });

      if (response && response.success && response.detection) {
        const det: DetectionRecord = {
          ...response.detection,
          imageUrl: imageDataUrl || response.detection.imageUrl,
          category: response.detection.category || categoryHint || 'Plastic'
        };

        if (imageDataUrl) {
          det.imageUrl = imageDataUrl;
        }

        marineStorage.addDetection(det);
        setSelectedDetection(det);
        if (response.yoloAnnotations) {
          setYoloTxt(response.yoloAnnotations);
        }
        if (response.inferenceMetrics) {
          setInferenceMetrics(response.inferenceMetrics);
        }
      }
    } catch (err) {
      console.warn('Real surface inference error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetSelect = async (preset: PresetSample) => {
    await runInferencePipeline(preset.filename, preset.url, preset.category);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      await runInferencePipeline(file.name, base64);
    };
    reader.readAsDataURL(file);
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
      reportedBy: 'MarineSight AI YOLOv9 Pipeline',
      notes: [`Generated from Surface Detection ${selectedDetection.id}`],
      imageUrl: selectedDetection.imageUrl,
      associatedDetectionIds: [selectedDetection.id],
      bioRiskLevel: selectedDetection.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      estimatedRemovalEffortHours: 6
    };
    marineStorage.addIncident(newInc);
    onNavigate('incidents', newInc.id);
  };

  const downloadYoloAnnotations = () => {
    const blob = new Blob([yoloTxt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDetection.id}_annotations.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredBoxes = (selectedDetection.boundingBoxes || []).filter(b => {
    const meetsConf = (b.confidence || selectedDetection.confidence) >= confidenceSlider;
    const meetsClass = classFilter === 'ALL' || (b.category || selectedDetection.category) === classFilter;
    return meetsConf && meetsClass;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              YOLO Inference Engine
            </span>
            <span className="text-xs text-[#736B5E]">YOLOv9-SeaGuard • TensorRT Edge Runtime</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Surface Vision & Drone Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Real-time optical object detection for plastic aggregations, ghost fishing nets, styrofoam floats, and polymer slicks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold transition-all shadow-sm shadow-[#4F6F52]/20 cursor-pointer">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Image (e.g. marine_debris.jpg)</span>
            <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      {/* Preset Imagery Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#FF6F59]" />
            <span className="text-xs font-bold text-[#2A2A2A]">Preset Test Transects & Real Debris Samples</span>
          </div>
          <span className="text-[10px] text-[#736B5E]">Click any sample to trigger real backend YOLO pipeline</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRESET_SAMPLES.map((preset) => (
            <button
              key={preset.filename}
              onClick={() => handlePresetSelect(preset)}
              disabled={isProcessing}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedDetection.title.includes(preset.filename)
                  ? 'border-[#4F6F52] bg-[#4F6F52]/10 shadow-sm ring-1 ring-[#4F6F52]'
                  : 'border-[#E8E1D5] hover:border-[#4F6F52]/50 bg-[#F9F6F0]'
              }`}
            >
              <div>
                <img src={preset.url} alt={preset.name} className="w-full h-20 rounded-xl object-cover mb-2" />
                <p className="text-xs font-bold text-[#2A2A2A] truncate">{preset.name}</p>
                <p className="font-mono text-[10px] text-[#4F6F52] font-semibold">{preset.filename}</p>
              </div>
              <span className="text-[10px] text-[#736B5E] mt-1 line-clamp-1">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls & Model Config Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E1D5] shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Model Select */}
        <div>
          <label className="text-[11px] font-bold text-[#736B5E] block mb-1 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#4F6F52]" />
            <span>Active YOLO Model</span>
          </label>
          <select
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="w-full p-2 bg-[#F9F6F0] border border-[#E8E1D5] rounded-xl text-xs font-bold text-[#2A2A2A] focus:outline-hidden"
          >
            <option value="yolo-v9-marine">YOLOv9-SeaGuard (High Precision mAP 0.942)</option>
            <option value="yolo-v8-marine">YOLOv8x-Marine Edge (Fast Latency 12ms)</option>
            <option value="yolo-v11-ocean">YOLOv11-OceanNet (Multispectral Aerial)</option>
          </select>
        </div>

        {/* Confidence Threshold */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-[#736B5E] mb-1">
            <span>Confidence Threshold</span>
            <span className="text-[#4F6F52]">{Math.round(confidenceSlider * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.95"
            step="0.05"
            value={confidenceSlider}
            onChange={(e) => setConfidenceSlider(parseFloat(e.target.value))}
            className="w-full accent-[#4F6F52] cursor-pointer"
          />
        </div>

        {/* IoU NMS Threshold */}
        <div>
          <div className="flex justify-between text-[11px] font-bold text-[#736B5E] mb-1">
            <span>NMS IoU Threshold</span>
            <span className="text-[#4F6F52]">{iouSlider.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.80"
            step="0.05"
            value={iouSlider}
            onChange={(e) => setIouSlider(parseFloat(e.target.value))}
            className="w-full accent-[#4F6F52] cursor-pointer"
          />
        </div>

        {/* Class Filter */}
        <div>
          <label className="text-[11px] font-bold text-[#736B5E] block mb-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#FF6F59]" />
            <span>Filter Target Class</span>
          </label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="w-full p-2 bg-[#F9F6F0] border border-[#E8E1D5] rounded-xl text-xs font-bold text-[#2A2A2A] focus:outline-hidden"
          >
            <option value="ALL">All Debris Classes (Plastic, Net, Styrofoam, Slick)</option>
            <option value="Plastic">Plastic</option>
            <option value="Ghost Fishing Gear">Ghost Fishing Gear / Nets</option>
            <option value="Styrofoam">Styrofoam</option>
            <option value="Oil Slick">Oil Slick / Chemical</option>
            <option value="Bottle">Plastic Bottle</option>
            <option value="Container">Container</option>
          </select>
        </div>
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
                <span className="text-xs font-bold text-[#736B5E]">
                  {filteredBoxes.length} Object{filteredBoxes.length !== 1 ? 's' : ''} Detected
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
                <button
                  onClick={downloadYoloAnnotations}
                  className="px-2.5 py-1 rounded-lg bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#2A2A2A] text-[11px] font-bold flex items-center gap-1"
                  title="Download YOLO .txt annotations"
                >
                  <Download className="w-3 h-3" />
                  <span>YOLO .txt</span>
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="relative my-4 aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="w-8 h-8 text-[#4F6F52] animate-spin" />
                  <p className="text-xs font-bold">Running YOLOv9-Marine Neural Inference...</p>
                  <span className="text-[10px] text-zinc-400">Extracting multispectral feature maps & bounding boxes</span>
                </div>
              )}

              <img 
                src={selectedDetection.imageUrl} 
                alt="Surface Vision" 
                className="w-full h-full object-cover"
              />

              {/* Bounding Box rendering */}
              {showBoxes && filteredBoxes.map((box, idx) => {
                const isNet = box.category === 'Ghost Fishing Gear' || box.label?.includes('Net');
                const isPlastic = box.category === 'Plastic' || box.label?.includes('Plastic');
                const boxColor = isNet ? 'border-[#FF6F59] bg-[#FF6F59]/20' : 'border-[#4F6F52] bg-[#4F6F52]/20';
                const tagBg = isNet ? 'bg-[#FF6F59]' : 'bg-[#4F6F52]';

                return (
                  <div
                    key={idx}
                    className={`absolute border-2 ${boxColor} rounded-lg transition-all`}
                    style={{
                      left: `${(box.x / 600) * 100}%`,
                      top: `${(box.y / 400) * 100}%`,
                      width: `${(box.width / 600) * 100}%`,
                      height: `${(box.height / 400) * 100}%`
                    }}
                  >
                    <div className={`absolute -top-6 left-0 ${tagBg} text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm whitespace-nowrap`}>
                      {box.label || `${box.category || selectedDetection.category} (${Math.round((box.confidence || selectedDetection.confidence) * 100)}%)`}
                    </div>
                  </div>
                );
              })}

              {/* Bottom Telemetry Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-3 py-1.5 rounded-xl text-white text-[10px] font-mono border border-white/10 flex items-center gap-3">
                <span>Alt: 35m AGL</span>
                <span>•</span>
                <span>GSD: 1.2 cm/px</span>
                <span>•</span>
                <span>Lat: {selectedDetection.location.lat.toFixed(4)}°N</span>
                <span>•</span>
                <span>Lng: {selectedDetection.location.lng.toFixed(4)}°E</span>
              </div>
            </div>

            {/* Inference Hardware Performance Bar */}
            <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="text-[#736B5E] text-[10px] block">Inference Latency</span>
                <span className="font-mono font-bold text-[#4F6F52]">{inferenceMetrics.latencyMs} ms</span>
              </div>
              <div>
                <span className="text-[#736B5E] text-[10px] block">Throughput</span>
                <span className="font-mono font-bold text-[#2A2A2A]">{inferenceMetrics.throughputFps} FPS</span>
              </div>
              <div>
                <span className="text-[#736B5E] text-[10px] block">Model mAP@0.50</span>
                <span className="font-mono font-bold text-[#4F6F52]">{inferenceMetrics.mAP50 * 100}%</span>
              </div>
              <div>
                <span className="text-[#736B5E] text-[10px] block">Target Device</span>
                <span className="font-mono font-bold text-[#736B5E] text-[10px] truncate">{inferenceMetrics.device}</span>
              </div>
            </div>

          </div>

          {/* Catalog of Surface Detections */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-xs">
            <h3 className="font-extrabold text-sm text-[#2A2A2A] mb-3">Logged Optical Transects</h3>
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
              <p className="text-xs text-[#736B5E] mt-1">{selectedDetection.location.areaName || selectedDetection.title}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Confidence Score:</span>
                <span className="font-bold text-[#4F6F52]">{Math.round(selectedDetection.confidence * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Estimated Mass:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedWeightKg || 210} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Dimensions:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedDimensions || '14.0m x 5.2m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#736B5E]">Optical Signature:</span>
                <span className="font-bold text-[#2A2A2A] text-right truncate max-w-[150px]">{selectedDetection.opticalSignature || 'Polymer NIR Reflectance'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
                <span>YOLO Detection Reasoning</span>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-relaxed">
                {selectedDetection.aiExplanation || 'YOLOv9-SeaGuard feature extractor identified surface polymer aggregation aligned with tidal gyre convergence.'}
              </p>
            </div>

            {/* YOLO Annotation Raw Preview */}
            <div className="p-3 rounded-2xl bg-[#2A2A2A] text-white space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-zinc-400">
                <span>YOLO Format Labels [cls, x_c, y_c, w, h]</span>
                <FileText className="w-3 h-3" />
              </div>
              <pre className="text-emerald-400 overflow-x-auto p-1 bg-black/40 rounded">
                {yoloTxt || '1 0.458333 0.587500 0.516667 0.525000'}
              </pre>
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
