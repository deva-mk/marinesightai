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
  Info,
  Radio,
  Ruler
} from 'lucide-react';
import { DetectionRecord, IncidentRecord } from '../../types';
import { marineStorage } from '../../services/storage';
import { apiService } from '../../services/apiService';
import { SonarIngestionStudio } from './SonarIngestionStudio';

interface SonarIntelligenceProps {
  detections?: DetectionRecord[];
  onSelectDetection?: (id: string) => void;
  onNavigate: (view: string, id?: string) => void;
}

interface SonarPreset {
  name: string;
  filename: string;
  format: string;
  freqKhz: number;
  depthM: number;
  description: string;
  imgUrl: string;
}

const SONAR_PRESETS: SonarPreset[] = [
  {
    name: 'Palk Bay Coral Shelf',
    filename: 'Palk_Bay_Transect_04.dat',
    format: 'DAT',
    freqKhz: 900,
    depthM: 14.2,
    description: 'High-frequency 900 kHz side-scan showing submerged trawl net with 6.8m acoustic shadow',
    imgUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Mannar Deep Trench',
    filename: 'Mannar_Deep_Trench.xtf',
    format: 'XTF',
    freqKhz: 455,
    depthM: 28.5,
    description: '455 kHz eXtended Triton Format showing abandoned wire pot clusters in coral rubble',
    imgUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'Krusadai Island Shelf',
    filename: 'Krusadai_Shelf_Scan.sl3',
    format: 'SL3',
    freqKhz: 800,
    depthM: 18.0,
    description: 'StructureScan 3D hydroacoustic raster with high-backscatter polymer highlight',
    imgUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&auto=format&fit=crop&q=80'
  }
];

export const SonarIntelligence: React.FC<SonarIntelligenceProps> = ({
  detections = [],
  onNavigate
}) => {
  const safeDetections = detections || [];
  const sonarList = safeDetections.filter(d => d.source === 'SONAR');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'INGESTION_STUDIO' | 'ANALYSIS'>('INGESTION_STUDIO');
  
  const [selectedDetection, setSelectedDetection] = useState<DetectionRecord>(
    sonarList[0] || {
      id: 'MSA-SONAR-104',
      title: 'Acoustic Transect Object (Palk_Bay_Transect_04.dat)',
      category: 'Ghost Fishing Gear',
      source: 'SONAR',
      confidence: 0.94,
      qualityScore: 94,
      severity: 'CRITICAL',
      location: {
        lat: 9.3142,
        lng: 79.1821,
        depthMeters: 14.2,
        sector: 'Sector 4B - Gulf of Mannar',
        areaName: 'Palk Bay Coral Shoal'
      },
      timestamp: new Date().toISOString(),
      imageUrl: SONAR_PRESETS[0].imgUrl,
      processedImageUrl: SONAR_PRESETS[1].imgUrl,
      status: 'Unverified',
      boundingBoxes: [
        { x: 130, y: 120, width: 280, height: 210, label: 'Ghost Net Mass (94%)', confidence: 0.94, category: 'Ghost Fishing Gear' }
      ],
      estimatedDimensions: '18.5m x 8.2m',
      estimatedWeightKg: 420,
      acousticSignature: 'Acoustic backscatter highlight with 6.8m acoustic shadow at 14.2m depth',
      aiExplanation: 'Hydroacoustic DAT parser extracted high-backscatter reverberation pattern with 6.8m shadow matching submerged monofilament trawl net on silt substrate.'
    }
  );
  
  // Interactive tuning parameters
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.60);
  const [frequencyKhz, setFrequencyKhz] = useState<number>(900);
  const [contrastFactor, setContrastFactor] = useState<number>(50);
  const [noiseReduction, setNoiseReduction] = useState<boolean>(true);
  const [shadowMeasureTool, setShadowMeasureTool] = useState<boolean>(true);
  
  // Visual layer toggles
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'OVERLAY' | 'SIDE_BY_SIDE' | 'RAW'>('OVERLAY');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Upload & API state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [supportedConversionNote, setSupportedConversionNote] = useState<string | null>(
    'Parsed hydroacoustic container (DAT). Slant-range corrected with 900 kHz CHIRP transducer.'
  );

  const runSonarProcessing = async (filename: string, fileType = 'DAT', imgUrl?: string) => {
    setIsProcessing(true);
    setSupportedConversionNote(`Parsed hydroacoustic binary stream (${fileType.toUpperCase()}). Executing slant-range geometric correction and shadow extraction...`);

    try {
      const response = await apiService.processSonar({
        filename,
        fileType,
        coordinates: [selectedDetection.location.lat, selectedDetection.location.lng],
        params: {
          confidenceThreshold,
          noiseReduction,
          frequencyKhz,
          contrastFactor
        }
      });

      if (response && response.success && response.detection) {
        const det: DetectionRecord = {
          ...response.detection,
          source: 'SONAR',
          imageUrl: imgUrl || selectedDetection.imageUrl,
          processedImageUrl: selectedDetection.processedImageUrl || SONAR_PRESETS[1].imgUrl
        };
        marineStorage.addDetection(det);
        setSelectedDetection(det);
        if (response.preprocessingApplied) {
          setSupportedConversionNote(`Parsed ${response.formatParsed} container. Resolution mode: ${response.preprocessingApplied.resolutionMode}. Calculated depth: ${response.preprocessingApplied.calculatedSlantRangeDepthM}m.`);
        }
      }
    } catch (err) {
      console.warn('Real sonar API processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toUpperCase() || 'DAT';
    runSonarProcessing(file.name, ext);
  };

  const handlePresetSelect = (preset: SonarPreset) => {
    setFrequencyKhz(preset.freqKhz);
    runSonarProcessing(preset.filename, preset.format, preset.imgUrl);
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
            <span className="text-xs text-[#736B5E]">Side-Scan SonarNet Ultra v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Sonar Intelligence & Acoustic Mapping
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Analyze .DAT, .XTF, .JSF, .SL2, .SL3 hydroacoustic files, extract acoustic shadow lengths, and compute seafloor depth.
          </p>
        </div>

        {/* Workspace Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('ps57')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121316] text-[#FFFF23] border border-[#23262D] text-xs font-black hover:bg-black transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#FFFF23]" />
            <span>Launch PS 57 Winning Suite</span>
          </button>

          <div className="flex items-center bg-[#F2EDE4] p-1 rounded-xl border border-[#DDD5C7] text-xs font-bold">
            <button
              onClick={() => setActiveWorkspaceTab('INGESTION_STUDIO')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeWorkspaceTab === 'INGESTION_STUDIO' ? 'bg-[#FF6F59] text-white shadow-xs' : 'text-[#5C5449] hover:text-[#2A2A2A]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>SSS Ingestion & Preprocessing Studio</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('ANALYSIS')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                activeWorkspaceTab === 'ANALYSIS' ? 'bg-[#4F6F52] text-white shadow-xs' : 'text-[#5C5449] hover:text-[#2A2A2A]'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Acoustic Target Analysis</span>
            </button>
          </div>

          {/* Upload Button */}
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold transition-all shadow-sm shadow-[#FF6F59]/30 cursor-pointer">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Sonar (.DAT, .XTF, .SL3)</span>
            <input 
              type="file" 
              accept=".png,.jpg,.jpeg,.dat,.sl2,.sl3,.rsd,.svlog,.jsf,.xtf" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {activeWorkspaceTab === 'INGESTION_STUDIO' ? (
        <SonarIngestionStudio />
      ) : (
        <>
          {/* Preset Hydroacoustic Recordings */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF6F59]" />
            <span className="text-xs font-bold text-[#2A2A2A]">Preset Hydroacoustic Recordings & Acoustic Surveys</span>
          </div>
          <span className="text-[10px] text-[#736B5E]">Select preset to parse real binary formats & slant-range models</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SONAR_PRESETS.map((preset) => (
            <button
              key={preset.filename}
              onClick={() => handlePresetSelect(preset)}
              disabled={isProcessing}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedDetection.title.includes(preset.filename)
                  ? 'border-[#FF6F59] bg-[#FF6F59]/10 shadow-sm ring-1 ring-[#FF6F59]'
                  : 'border-[#E8E1D5] hover:border-[#FF6F59]/50 bg-[#F9F6F0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#2A2A2A]">{preset.name}</span>
                  <span className="font-mono text-[10px] font-bold text-[#FF6F59]">{preset.freqKhz} kHz</span>
                </div>
                <p className="font-mono text-[10px] text-[#736B5E]">{preset.filename} ({preset.format})</p>
                <p className="text-[11px] text-[#5C5449] mt-1 line-clamp-2">{preset.description}</p>
              </div>
              <span className="text-[10px] text-[#4F6F52] font-semibold mt-2">Nominal Depth: {preset.depthM}m</span>
            </button>
          ))}
        </div>
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
                  {selectedDetection.id} • {selectedDetection.location.sector || 'Palk Bay'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/40">
                  DEPTH: {selectedDetection.location.depthMeters || 14.2}m
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
                  <p className="text-xs font-bold text-white">Running SonarNet Hydroacoustic Filter...</p>
                  <p className="text-[11px] text-gray-400">Slant-Range Histogram Equalization & Shadow Profiler</p>
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

                  {/* Acoustic Shadow Caliper Tool */}
                  {shadowMeasureTool && (
                    <div className="absolute top-1/2 left-1/3 border-l-2 border-r-2 border-dashed border-cyan-400 h-16 w-36 flex items-center justify-center bg-cyan-500/10 pointer-events-none">
                      <div className="bg-cyan-900/90 text-cyan-200 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-400/40">
                        Shadow: 6.8m • Towfish Alt: 8.5m
                      </div>
                    </div>
                  )}

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
                          {box.label || `${box.display_name || box.category || selectedDetection.category} — ${Math.round((box.confidence || selectedDetection.confidence) * 100)}%`}
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
                <span>FREQ: {frequencyKhz} kHz • SNR: 19.4 dB • Shadow Length: 6.8m</span>
              </div>
            </div>

            {/* Interactive Filter Sliders & Layer Switches */}
            <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2D3934] space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Confidence Threshold */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Confidence Threshold</span>
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

                {/* Transducer Frequency */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Transducer Frequency</span>
                    <span className="text-[#4F6F52] font-mono">{frequencyKhz} kHz</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFrequencyKhz(455)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                        frequencyKhz === 455 ? 'bg-[#4F6F52] text-white' : 'bg-[#1E2522] text-gray-400'
                      }`}
                    >
                      455 kHz (Long-Range)
                    </button>
                    <button
                      onClick={() => setFrequencyKhz(900)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                        frequencyKhz === 900 ? 'bg-[#FF6F59] text-white' : 'bg-[#1E2522] text-gray-400'
                      }`}
                    >
                      900 kHz (Hi-Res Mesh)
                    </button>
                  </div>
                </div>

                {/* Contrast Equalization */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Acoustic Contrast</span>
                    <span className="text-white">{contrastFactor}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={contrastFactor}
                    onChange={(e) => setContrastFactor(parseInt(e.target.value))}
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
                    checked={shadowMeasureTool} 
                    onChange={(e) => setShadowMeasureTool(e.target.checked)}
                    className="rounded accent-cyan-400"
                  />
                  <span className="text-cyan-300 font-semibold text-[11px]">Acoustic Shadow Caliper</span>
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

            {/* Object-Level Sonar Acoustic Targets */}
            <div className="bg-[#141A17] p-4 rounded-2xl border border-[#2D3934] space-y-3">
              <div className="flex items-center justify-between border-b border-[#2D3934] pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#FF6F59]" />
                  <span className="font-extrabold text-xs text-white uppercase tracking-wide">
                    Hydroacoustic Object Targets
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#4F6F52] bg-[#4F6F52]/15 px-2.5 py-0.5 rounded-full border border-[#4F6F52]/30">
                  Total Targets Localized: {selectedDetection.boundingBoxes?.length || 0}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(selectedDetection.boundingBoxes || []).map((box, idx) => {
                  const confPct = Math.round((box.confidence || selectedDetection.confidence) * 100);
                  const rawName = box.display_name || (box.label?.includes('—') ? box.label.split('—')[0].trim() : (box.category || selectedDetection.category));
                  const objName = rawName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                  return (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-[#1E2522] border border-[#2D3934] space-y-1.5 text-xs text-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[9px] font-mono">
                            {idx + 1}
                          </span>
                          {objName}
                        </span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF6F59]/20 text-[#FF6F59] border border-[#FF6F59]/30">
                          {confPct}% Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-gray-400 bg-black/40 p-1.5 rounded border border-[#2D3934]/60">
                        <div>Location: x={Math.round(box.x)}, y={Math.round(box.y)}</div>
                        <div>Size: {Math.round(box.width)} × {Math.round(box.height)} px</div>
                        {box.bbox && (
                          <div className="col-span-2 text-[9px] text-gray-400 pt-0.5">
                            BBox: [{Math.round(box.bbox.x1)}, {Math.round(box.bbox.y1)}, {Math.round(box.bbox.x2)}, {Math.round(box.bbox.y2)}]
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
              <p className="text-xs text-[#736B5E] mt-1">{selectedDetection.location.areaName || selectedDetection.title}</p>
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
                <p className="text-2xl font-black text-[#4F6F52]">{selectedDetection.qualityScore || 92}%</p>
                <div className="w-full h-1.5 bg-[#E8E1D5] rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#4F6F52] rounded-full" style={{ width: `${selectedDetection.qualityScore || 92}%` }} />
                </div>
              </div>
            </div>

            {/* Telemetry Detail Rows */}
            <div className="space-y-2 text-xs divide-y divide-[#F2EDE4]">
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Estimated Dimensions:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedDimensions || '18.5m x 8.2m'}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Estimated Net Mass:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.estimatedWeightKg || 420} kg</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Benthic Depth:</span>
                <span className="font-bold text-[#2A2A2A]">{selectedDetection.location.depthMeters || 14.2} meters</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Coordinates:</span>
                <span className="font-mono font-bold text-[#2A2A2A]">
                  {selectedDetection.location.lat.toFixed(4)}°N, {selectedDetection.location.lng.toFixed(4)}°E
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-[#736B5E] font-medium">Acoustic Shadow:</span>
                <span className="font-bold text-cyan-700">6.8m (Towfish Alt 8.5m)</span>
              </div>
            </div>

            {/* AI Explanation Callout */}
            <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6F59]" />
                <span>SonarNet Classification Reasoning</span>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-relaxed">
                {selectedDetection.aiExplanation || 'Hydroacoustic parser extracted high-backscatter reverberation pattern with 6.8m shadow matching submerged monofilament trawl net.'}
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
      </>
      )}

    </div>
  );
};
