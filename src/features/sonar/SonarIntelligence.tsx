import React, { useState } from 'react';
import { 
  Radar, 
  UploadCloud, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Download, 
  Sparkles, 
  RefreshCw,
  FileCode,
  ArrowRight,
  Info
} from 'lucide-react';
import { DetectionRecord, IncidentRecord } from '../../types';
import { marineStorage } from '../../services/storage';

interface SonarIntelligenceProps {
  detections?: DetectionRecord[];
  onSelectDetection?: (id: string) => void;
  onNavigate: (view: string, id?: string) => void;
}

export const SonarIntelligence: React.FC<SonarIntelligenceProps> = ({
  detections = [],
  onNavigate
}) => {
  const safeDetections = detections || [];
  const sonarList = safeDetections.filter(d => d.source === 'SONAR');
  const defaultDetection: DetectionRecord = {
    id: 'GV-SONAR-DEMO',
    title: 'Acoustic Transect Object',
    category: 'Ghost Fishing Gear',
    source: 'SONAR',
    confidence: 0.94,
    qualityScore: 92,
    severity: 'CRITICAL',
    location: {
      lat: 10.9544,
      lng: 78.0815,
      depthMeters: 28.5,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Gulf Sector 4'
    },
    timestamp: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    processedImageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    status: 'Unverified',
    boundingBoxes: [
      { x: 140, y: 130, width: 270, height: 210, label: 'Ghost Net (94%)', confidence: 0.94 }
    ],
    estimatedDimensions: '18.4m x 7.6m',
    estimatedWeightKg: 380,
    acousticSignature: 'Acoustic highlight with elongated diffuse backscatter & 14m trailing shadow'
  };

  const [selectedDetection, setSelectedDetection] = useState<DetectionRecord>(
    sonarList[0] || safeDetections[0] || defaultDetection
  );
  
  // Interactive tuning parameters
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.65);
  const [iouThreshold, setIouThreshold] = useState<number>(0.45);
  const [contrastFactor, setContrastFactor] = useState<number>(1.25);
  const [noiseReduction, setNoiseReduction] = useState<boolean>(true);
  
  // Visual layer toggles
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showShadows, setShowShadows] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'SIDE_BY_SIDE' | 'RAW'>('OVERLAY');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Upload state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [supportedConversionNote, setSupportedConversionNote] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessing(true);
    setSupportedConversionNote(null);

    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    const specializedAcousticFormats = ['DAT', 'SL2', 'SL3', 'RSD', 'SVLOG', 'JSF', 'XTF'];

    if (specializedAcousticFormats.includes(ext)) {
      setSupportedConversionNote(`Parsed hydroacoustic binary container (${ext}). Extracted port/starboard acoustic channel packets & applied slant-range rasterization.`);
    }

    setTimeout(() => {
      // Simulate MarineSight AI acoustic detection execution
      const newSonarDetection: DetectionRecord = {
        id: `MSA-SONAR-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `Acoustic Transect Object (${file.name})`,
        category: 'Ghost Fishing Gear',
        source: 'SONAR',
        confidence: 0.93,
        qualityScore: 92,
        severity: 'CRITICAL',
        location: {
          lat: 10.9544,
          lng: 78.0815,
          depthMeters: 28.5,
          sector: 'Sector 4B - Gulf of Mannar',
          areaName: 'Active Acoustic Survey Track'
        },
        timestamp: new Date().toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
        processedImageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
        status: 'Unverified',
        boundingBoxes: [
          { x: 140, y: 130, width: 270, height: 210, label: 'Ghost Net (93%)', confidence: 0.93 },
          { x: 420, y: 220, width: 90, height: 85, label: 'Derelict Pot (88%)', confidence: 0.88 }
        ],
        estimatedDimensions: '18.4m x 7.6m',
        estimatedWeightKg: 380,
        acousticSignature: 'Acoustic highlight with elongated diffuse backscatter & 14m trailing shadow',
        aiExplanation: 'MarineSight AI Sonar-RF classifier detected high-frequency acoustic reverberation pattern matching commercial monofilament netting snagged on rock outcrop.',
        isDemo: true
      };

      marineStorage.addDetection(newSonarDetection);
      setSelectedDetection(newSonarDetection);
      setIsProcessing(false);
    }, 1200);
  };

  const handleVerify = () => {
    marineStorage.verifyDetection(selectedDetection.id);
    setSelectedDetection(prev => ({ ...prev, status: 'Verified' }));
  };

  const handleCreateIncident = () => {
    const newInc: IncidentRecord = {
      id: `INC-${Math.floor(9050 + Math.random() * 900)}`,
      title: `${selectedDetection.category} from Sonar Scan ${selectedDetection.id}`,
      category: selectedDetection.category,
      source: 'SONAR',
      severity: selectedDetection.severity,
      confidence: selectedDetection.confidence,
      status: 'NEW',
      location: selectedDetection.location,
      priorityScore: Math.round(selectedDetection.confidence * 95),
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      reportedBy: 'MarineSight AI Sonar Intelligence Analyst',
      notes: [`Created directly from Sonar Detection ${selectedDetection.id}. Acoustic signature: ${selectedDetection.acousticSignature || 'N/A'}`],
      imageUrl: selectedDetection.imageUrl,
      associatedDetectionIds: [selectedDetection.id],
      bioRiskLevel: selectedDetection.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      estimatedRemovalEffortHours: 10
    };
    marineStorage.addIncident(newInc);
    onNavigate('incidents', newInc.id);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Hydroacoustic Intelligence
            </span>
            <span className="text-xs text-[#736B5E]">Side-Scan Sonar Telemetry Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Sonar Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Side-scan acoustic preprocessing, slant-range correction, acoustic shadow analysis, and IoU/NMS classification.
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold transition-all shadow-sm shadow-[#FF6F59]/30 cursor-pointer">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Sonar Scan (.SL2, .JSF, .XTF, .PNG)</span>
          <input 
            type="file" 
            accept=".png,.jpg,.jpeg,.dat,.sl2,.sl3,.rsd,.svlog,.jsf,.xtf" 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Format Conversion Notice if specialized */}
      {supportedConversionNote && (
        <div className="p-4 rounded-2xl bg-[#4F6F52]/10 border border-[#4F6F52]/30 flex items-center gap-3">
          <FileCode className="w-5 h-5 text-[#4F6F52] shrink-0" />
          <p className="text-xs text-[#2A2A2A] font-medium leading-relaxed">
            {supportedConversionNote}
          </p>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Viewport & Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Viewport Card */}
          <div className="bg-[#1E2522] p-4 rounded-3xl border border-[#2D3934] shadow-md text-white">
            
            {/* Viewport Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2D3934] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#A3B899] font-bold">
                  {selectedDetection.id} • {selectedDetection.location.sector}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/40">
                  DEPTH: {selectedDetection.location.depthMeters || 28.5}m
                </span>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center gap-1.5 bg-[#141A17] p-1 rounded-xl border border-[#2D3934]">
                <button
                  onClick={() => setViewMode('OVERLAY')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'OVERLAY' ? 'bg-[#FF6F59] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  AI Overlay
                </button>
                <button
                  onClick={() => setViewMode('SIDE_BY_SIDE')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'SIDE_BY_SIDE' ? 'bg-[#4F6F52] text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Split Compare
                </button>
                <button
                  onClick={() => setViewMode('RAW')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    viewMode === 'RAW' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Raw Waterfall
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
                  className="p-1.5 rounded-lg bg-[#141A17] hover:bg-[#2D3934] text-gray-300"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
                  className="p-1.5 rounded-lg bg-[#141A17] hover:bg-[#2D3934] text-gray-300"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Image Render Stage */}
            <div className="relative my-4 rounded-2xl overflow-hidden bg-black/80 aspect-video flex items-center justify-center border border-[#2D3934]">
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 z-20 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-8 h-8 text-[#FF6F59] animate-spin" />
                  <p className="text-xs font-bold text-white">Running MarineSight AI Acoustic Filter...</p>
                  <p className="text-[11px] text-gray-400">Slant-Range Histogram Equalization in progress</p>
                </div>
              )}

              {/* Sonar Canvas View */}
              {viewMode === 'SIDE_BY_SIDE' ? (
                <div className="grid grid-cols-2 w-full h-full gap-1">
                  <div className="relative h-full">
                    <img 
                      src={selectedDetection.imageUrl} 
                      alt="Raw Sonar" 
                      className="w-full h-full object-cover filter contrast-100"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold text-gray-300">
                      RAW ACOUSTIC (BEFORE)
                    </div>
                  </div>
                  <div className="relative h-full">
                    <img 
                      src={selectedDetection.processedImageUrl || selectedDetection.imageUrl} 
                      alt="Processed Sonar" 
                      className="w-full h-full object-cover filter brightness-110 contrast-125"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#4F6F52]/90 text-[10px] font-bold text-white">
                      FILTERED + ENHANCED (AFTER)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <img 
                    src={selectedDetection.imageUrl} 
                    alt="Sonar Scan" 
                    className={`w-full h-full object-cover transition-all ${
                      noiseReduction ? 'brightness-105 contrast-125' : ''
                    }`}
                    style={{ transform: `scale(${zoomLevel})` }}
                  />

                  {/* Sonar sweep overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#4F6F52]/15 to-transparent pointer-events-none animate-scanline" />

                  {/* Bounding Box Overlays */}
                  {showBBoxes && selectedDetection.boundingBoxes && selectedDetection.boundingBoxes.map((box, bIdx) => (
                    <div
                      key={bIdx}
                      className="absolute border-2 border-[#FF6F59] bg-[#FF6F59]/15 rounded-lg pointer-events-none transition-all"
                      style={{
                        left: `${(box.x / 600) * 100}%`,
                        top: `${(box.y / 400) * 100}%`,
                        width: `${(box.width / 600) * 100}%`,
                        height: `${(box.height / 400) * 100}%`
                      }}
                    >
                      {showLabels && (
                        <div className="absolute -top-6 left-0 bg-[#FF6F59] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                          {box.label || `${selectedDetection.category} (${Math.round(selectedDetection.confidence * 100)}%)`}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Heatmap overlay toggle */}
                  {showHeatmap && (
                    <div className="absolute inset-0 bg-radial from-red-500/30 via-yellow-500/20 to-transparent pointer-events-none mix-blend-screen" />
                  )}
                </div>
              )}

              {/* Status Badge Over Canvas */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/80 px-3 py-1 rounded-xl text-[10px] font-mono border border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#4F6F52] animate-pulse" />
                <span>SNR: 18.7 dB • Slant-Range Factor: {contrastFactor}x</span>
              </div>
            </div>

            {/* Interactive Filter Sliders & Layer Switches */}
            <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2D3934] space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Confidence Threshold */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Confidence Filter</span>
                    <span className="text-[#FF6F59]">{Math.round(confidenceThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="0.95"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[#FF6F59] cursor-pointer"
                  />
                </div>

                {/* IoU / NMS Threshold */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>IoU / NMS Overlap</span>
                    <span className="text-[#4F6F52]">{iouThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="0.20"
                    max="0.80"
                    step="0.05"
                    value={iouThreshold}
                    onChange={(e) => setIouThreshold(parseFloat(e.target.value))}
                    className="w-full accent-[#4F6F52] cursor-pointer"
                  />
                </div>

                {/* Contrast Equalization */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Histogram Contrast</span>
                    <span className="text-white">{contrastFactor}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.0"
                    step="0.1"
                    value={contrastFactor}
                    onChange={(e) => setContrastFactor(parseFloat(e.target.value))}
                    className="w-full accent-gray-400 cursor-pointer"
                  />
                </div>

              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2D3934] text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showBBoxes} 
                    onChange={(e) => setShowBBoxes(e.target.checked)}
                    className="rounded accent-[#FF6F59]"
                  />
                  <span className="text-gray-300 font-semibold text-[11px]">Bounding Boxes</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showLabels} 
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="rounded accent-[#FF6F59]"
                  />
                  <span className="text-gray-300 font-semibold text-[11px]">Class Labels</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showHeatmap} 
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="rounded accent-[#FF6F59]"
                  />
                  <span className="text-gray-300 font-semibold text-[11px]">Acoustic Heatmap</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={noiseReduction} 
                    onChange={(e) => setNoiseReduction(e.target.checked)}
                    className="rounded accent-[#4F6F52]"
                  />
                  <span className="text-gray-300 font-semibold text-[11px]">Bilateral Noise Filter</span>
                </label>
              </div>

            </div>

          </div>

          {/* Sonar Transect Scans Selector */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E1D5] shadow-xs">
            <h3 className="font-extrabold text-sm text-[#2A2A2A] mb-3">Survey Transect Catalog</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sonarList.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedDetection(item)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    selectedDetection.id === item.id 
                      ? 'border-[#FF6F59] bg-[#FF6F59]/10 shadow-sm' 
                      : 'border-[#E8E1D5] hover:border-[#4F6F52]'
                  }`}
                >
                  <img src={item.imageUrl} alt="" className="w-full h-16 rounded-xl object-cover mb-2" />
                  <p className="font-mono text-[10px] font-bold text-[#2A2A2A] truncate">{item.id}</p>
                  <p className="text-[11px] font-bold text-[#FF6F59] truncate">{item.category}</p>
                  <p className="text-[10px] text-[#736B5E]">{Math.round(item.confidence * 100)}% Confidence</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Detection Intelligence Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-5">
            
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#736B5E]">{selectedDetection.id}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedDetection.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-[#FF6F59]/15 text-[#FF6F59]'
              }`}>
                {selectedDetection.severity} SEVERITY
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#2A2A2A] leading-snug">
                {selectedDetection.category}
              </h2>
              <p className="text-xs text-[#736B5E] mt-1">{selectedDetection.location.areaName}</p>
            </div>

            {/* Quality & Confidence Gauges */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
              <div>
                <span className="text-[10px] font-extrabold text-[#736B5E] uppercase tracking-wider">AI Confidence</span>
                <p className="text-2xl font-black text-[#FF6F59]">{Math.round(selectedDetection.confidence * 100)}%</p>
                <div className="w-full h-1.5 bg-[#E8E1D5] rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#FF6F59] rounded-full" style={{ width: `${selectedDetection.confidence * 100}%` }} />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-[#736B5E] uppercase tracking-wider">Quality Score</span>
                <p className="text-2xl font-black text-[#4F6F52]">{selectedDetection.qualityScore || 89}%</p>
                <div className="w-full h-1.5 bg-[#E8E1D5] rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#4F6F52] rounded-full" style={{ width: `${selectedDetection.qualityScore || 89}%` }} />
                </div>
              </div>
            </div>

            {/* Telemetry Detail Rows */}
            <div className="space-y-2 text-xs divide-y divide-[#F2EDE4]">
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Estimated Dimensions:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedDimensions || '16.5m x 8.2m'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Estimated Net Mass:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedWeightKg || 320} kg</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Benthic Depth:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.location.depthMeters || 28.5} meters</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Coordinates:</span>
                <span className="font-mono font-bold text-[#2A2A2A]">
                  {selectedDetection.location.lat.toFixed(4)}°N, {selectedDetection.location.lng.toFixed(4)}°E
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Verification Status:</span>
                <span className="font-bold text-[#FF6F59]">{selectedDetection.status}</span>
              </div>
            </div>

            {/* AI Explanation Callout */}
            <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
                <span>Why did the AI classify this?</span>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-relaxed">
                {selectedDetection.aiExplanation || 'Acoustic highlight with elongated diffuse backscatter consistent with nylon netting.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleVerify}
                  className="py-2.5 px-3 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Sonar</span>
                </button>

                <button
                  onClick={handleCreateIncident}
                  className="py-2.5 px-3 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-[#FF6F59]/30"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Create Incident</span>
                </button>
              </div>

              <button
                onClick={() => onNavigate('fusion')}
                className="w-full py-2.5 rounded-xl bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Fuse with Surface Drone Data</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
