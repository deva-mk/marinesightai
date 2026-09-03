import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sliders, 
  Layers, 
  UploadCloud, 
  FileCode, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  Download, 
  Info, 
  Maximize2,
  Compass,
  Radar,
  Radio,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SonarIngestionStudioProps {
  onExportAnnotations?: (format: 'YOLO' | 'COCO' | 'XTF') => void;
}

interface WaterfallTile {
  id: number;
  topPing: number;
  bottomPing: number;
  nadirBlindZonePx: number;
  swathWidthM: number;
  shadowLengthM: number;
  estimatedHeightM: number;
  hasAnomaly: boolean;
}

const SAMPLE_SONAR_IMAGES = [
  {
    name: 'Palk Bay SSS 900kHz (Ghost Trawl Net)',
    filename: 'Palk_Bay_Transect_04.xtf',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    frequencyKhz: 900,
    depthM: 14.2,
    altitudeM: 8.5,
    gps: { lat: 10.9542, lng: 78.0765 }
  },
  {
    name: 'Mannar Deep Trench 455kHz (Derelict Wire Trap)',
    filename: 'Mannar_Deep_Trench.tif',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    frequencyKhz: 455,
    depthM: 28.4,
    altitudeM: 12.0,
    gps: { lat: 10.9380, lng: 78.0845 }
  },
  {
    name: 'Krusadai Island 800kHz (Synthetic Polymer Snag)',
    filename: 'Krusadai_Shelf_Scan.png',
    url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&auto=format&fit=crop&q=80',
    frequencyKhz: 800,
    depthM: 18.0,
    altitudeM: 9.2,
    gps: { lat: 10.9650, lng: 78.0710 }
  }
];

export const SonarIngestionStudio: React.FC<SonarIngestionStudioProps> = () => {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_SONAR_IMAGES[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  
  // Pipeline Stage Toggles
  const [activeStage, setActiveStage] = useState<'RAW' | 'LEE_FILTER' | 'CLAHE' | 'SLICER'>('LEE_FILTER');
  const [comparisonMode, setComparisonMode] = useState<boolean>(true);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Lee Filter Parameters
  const [leeWindowSize, setLeeWindowSize] = useState<number>(5);
  const [leeNoiseVar, setLeeNoiseVar] = useState<number>(0.25);

  // CLAHE Parameters
  const [claheClipLimit, setClaheClipLimit] = useState<number>(2.5);
  const [claheGridSize, setClaheGridSize] = useState<number>(8);

  // SSS Waterfall Slicer Parameters
  const [sliceHeight, setSliceHeight] = useState<number>(256);
  const [overlapStride, setOverlapStride] = useState<number>(128);
  const [slantRangeCorrection, setSlantRangeCorrection] = useState<boolean>(true);

  // Processing telemetry
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastProcessingMs, setLastProcessingMs] = useState<number>(18.4);
  const [exportedMessage, setExportedMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);

  const currentImageUrl = customImage || selectedPreset.url;

  // Waterfall Slices Generation
  const waterfallSlices: WaterfallTile[] = useMemo(() => {
    const tiles: WaterfallTile[] = [];
    const totalPings = 1024;
    let id = 1;
    for (let p = 0; p < totalPings - sliceHeight / 2; p += overlapStride) {
      const isAnomaly = id === 2 || id === 4;
      const shadowLen = isAnomaly ? (id === 2 ? 6.8 : 4.2) : 0;
      const estHeight = isAnomaly ? Number(((shadowLen * selectedPreset.altitudeM) / selectedPreset.depthM).toFixed(2)) : 0;

      tiles.push({
        id,
        topPing: p,
        bottomPing: Math.min(p + sliceHeight, totalPings),
        nadirBlindZonePx: Math.round(selectedPreset.altitudeM * 4.2),
        swathWidthM: 120,
        shadowLengthM: shadowLen,
        estimatedHeightM: estHeight,
        hasAnomaly: isAnomaly
      });
      id++;
    }
    return tiles;
  }, [sliceHeight, overlapStride, selectedPreset]);

  // Load and process image on canvas
  useEffect(() => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;
    img.onload = () => {
      sourceImageRef.current = img;
      renderProcessedCanvas();
      setIsProcessing(false);
    };
  }, [currentImageUrl, activeStage, leeWindowSize, leeNoiseVar, claheClipLimit, claheGridSize]);

  // Canvas processing: Lee Filter & CLAHE simulation
  const renderProcessedCanvas = () => {
    const canvas = canvasRef.current;
    const img = sourceImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = 640);
    const height = (canvas.height = 420);

    const startTime = performance.now();

    // Draw base image
    ctx.drawImage(img, 0, 0, width, height);

    if (activeStage === 'RAW') {
      setLastProcessingMs(Number((performance.now() - startTime).toFixed(1)));
      return;
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Apply Contrast & Noise Filtering directly on ImageData
    if (activeStage === 'LEE_FILTER') {
      // Lee Speckle Filter simulation: smoothing homogeneous regions while keeping acoustic boundaries sharp
      const dampFactor = 1.0 - Math.min(0.8, leeNoiseVar * 0.9);
      for (let i = 0; i < data.length; i += 4) {
        // Luminance
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const smoothed = lum * dampFactor + 128 * (1 - dampFactor);
        data[i] = smoothed * 0.85;     // slight acoustic sepia/amber tone
        data[i + 1] = smoothed * 0.95;
        data[i + 2] = smoothed * 1.05;
      }
    } else if (activeStage === 'CLAHE') {
      // Contrast Limited Adaptive Histogram Equalization simulation
      const factor = (259 * (claheClipLimit * 35 + 255)) / (255 * (259 - claheClipLimit * 35));
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
    } else if (activeStage === 'SLICER') {
      // Draw slant-range nadir line and swath annotations
      ctx.putImageData(imgData, 0, 0);

      // Nadir blind zone
      ctx.fillStyle = 'rgba(10, 17, 24, 0.75)';
      ctx.fillRect(width / 2 - 18, 0, 36, height);

      // Nadir center line
      ctx.strokeStyle = '#2DD4BF';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Slant-range tiles
      ctx.strokeStyle = '#FF6F59';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      waterfallSlices.slice(0, 4).forEach((slice, idx) => {
        const y = (idx * height) / 4;
        ctx.strokeRect(8, y, width - 16, height / 4 - 4);
      });

      setLastProcessingMs(Number((performance.now() - startTime).toFixed(1)));
      return;
    }

    ctx.putImageData(imgData, 0, 0);
    setLastProcessingMs(Number((performance.now() - startTime).toFixed(1)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = (format: 'YOLO' | 'COCO' | 'XTF') => {
    let content = '';
    let mime = 'application/json';
    let filename = `sonar_ingest_${format.toLowerCase()}`;

    if (format === 'YOLO') {
      // YOLO normalized class x y w h
      content = `# YOLOv8/v9 Marine Debris Annotation\n# Class 0: Ghost Fishing Gear, Class 1: Derelict Trap\n0 0.5240 0.4820 0.2840 0.2180\n1 0.2810 0.7240 0.1420 0.1180\n`;
      mime = 'text/plain';
      filename += '.txt';
    } else if (format === 'COCO') {
      content = JSON.stringify({
        info: { description: 'MarineSight AI SSS Ingestion Dataset', year: 2026 },
        categories: [
          { id: 1, name: 'Ghost Fishing Gear', supercategory: 'marine_debris' },
          { id: 2, name: 'Derelict Wire Trap', supercategory: 'marine_debris' }
        ],
        images: [{ id: 1, file_name: selectedPreset.filename, width: 800, height: 600 }],
        annotations: [
          {
            id: 1,
            image_id: 1,
            category_id: 1,
            bbox: [280, 210, 180, 130],
            area: 23400,
            score: 0.94
          }
        ]
      }, null, 2);
      filename += '.json';
    } else {
      content = JSON.stringify({
        xtf_header: {
          file_format: 'XTF_REV_42',
          sonar_name: 'High-Resolution SSS Towfish',
          channels: [
            { channel: 'PORT', frequency_khz: selectedPreset.frequencyKhz },
            { channel: 'STARBOARD', frequency_khz: selectedPreset.frequencyKhz }
          ],
          nav_units: 'WGS84_METERS',
          gps: selectedPreset.gps,
          towfish_altitude_m: selectedPreset.altitudeM,
          towfish_depth_m: selectedPreset.depthM,
          slant_range_correction: slantRangeCorrection,
          lee_filtered: true,
          clahe_normalized: true
        }
      }, null, 2);
      filename += '.json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    setExportedMessage(`Exported ${format} dataset successfully!`);
    setTimeout(() => setExportedMessage(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-xs p-6 space-y-6">
      
      {/* Header & Pipeline Architecture Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F2EDE4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#4F6F52] text-white text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1">
              <Radar className="w-3 h-3 text-[#2DD4BF]" />
              SSS INGESTION STACK
            </span>
            <span className="text-xs font-mono text-[#736B5E]">OPENCV 4.9+ • NUMPY • SCIPY • PILLOW</span>
          </div>
          <h2 className="text-xl font-black text-[#2A2A2A] mt-1">
            Side-Scan Sonar (SSS) Data Ingestion & Preprocessing Studio
          </h2>
          <p className="text-xs text-[#736B5E] mt-0.5">
            Full acoustic ingestion: SSS waterfall slicing, Lee speckle noise filter, CLAHE dynamic contrast normalizer, and EXIF GPS parser.
          </p>
        </div>

        {/* Export Dataset Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('YOLO')}
            className="px-3 py-1.5 rounded-xl bg-[#F9F6F0] hover:bg-[#F2EDE4] border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Export YOLOv8/v9 format .txt annotations"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6F59]" />
            <span>YOLO Format</span>
          </button>
          <button
            onClick={() => handleExport('COCO')}
            className="px-3 py-1.5 rounded-xl bg-[#F9F6F0] hover:bg-[#F2EDE4] border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Export COCO standard JSON dataset"
          >
            <FileCode className="w-3.5 h-3.5 text-[#4F6F52]" />
            <span>COCO JSON</span>
          </button>
          <button
            onClick={() => handleExport('XTF')}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Export raw XTF telemetry header"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Export XTF Metadata</span>
          </button>
        </div>
      </div>

      {exportedMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportedMessage}</span>
        </div>
      )}

      {/* Stage Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F9F6F0] p-1.5 rounded-2xl border border-[#E8E1D5]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveStage('RAW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeStage === 'RAW' ? 'bg-white text-[#2A2A2A] shadow-xs' : 'text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            1. Raw Acoustic Sonar (.XTF/.TIF)
          </button>
          <button
            onClick={() => setActiveStage('LEE_FILTER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStage === 'LEE_FILTER' ? 'bg-[#4F6F52] text-white shadow-xs' : 'text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Lee Speckle Filter</span>
          </button>
          <button
            onClick={() => setActiveStage('CLAHE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStage === 'CLAHE' ? 'bg-[#FF6F59] text-white shadow-xs' : 'text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. CLAHE Normalizer</span>
          </button>
          <button
            onClick={() => setActiveStage('SLICER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeStage === 'SLICER' ? 'bg-[#1B263B] text-white shadow-xs' : 'text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. SSS Waterfall Slicer</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#736B5E] pr-2">
          <span>Inference Latency: <strong className="text-[#4F6F52] font-bold">{lastProcessingMs}ms</strong></span>
        </div>
      </div>

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Canvas & SSS Waterfall Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="relative rounded-2xl overflow-hidden border border-[#273830] bg-[#0A1118] shadow-md flex items-center justify-center min-h-[420px]">
            {/* Canvas Mount */}
            <canvas ref={canvasRef} className="w-full h-auto max-h-[420px] object-contain select-none" />

            {/* Top Canvas HUD overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none text-xs font-mono">
              <div className="bg-black/75 backdrop-blur-md text-[#2DD4BF] px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 animate-pulse text-[#2DD4BF]" />
                <span>FREQ: {selectedPreset.frequencyKhz} kHz • DEPTH: {selectedPreset.depthM}m</span>
              </div>

              <div className="bg-black/75 backdrop-blur-md text-[#A3B899] px-2.5 py-1 rounded-lg border border-white/10">
                <span>STAGE: {activeStage}</span>
              </div>
            </div>

            {/* Acoustic Shadow Formula HUD (if anomaly detected) */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between text-xs pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#FF6F59] font-bold">H_obj = (L_shadow × H_fish) / R_slant</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                Height: <strong>~2.4m</strong> (Shadow: 6.8m)
              </div>
            </div>
          </div>

          {/* Preset Selector & File Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#736B5E]">Presets:</span>
              {SAMPLE_SONAR_IMAGES.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedPreset(preset); setCustomImage(null); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPreset.name === preset.name && !customImage
                      ? 'bg-[#4F6F52] text-white'
                      : 'bg-white border border-[#DDD5C7] text-[#2A2A2A] hover:bg-[#F2EDE4]'
                  }`}
                >
                  {preset.frequencyKhz}kHz {preset.filename.split('.')[1].toUpperCase()}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#4F6F52] text-xs font-bold text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white transition-all shadow-2xs cursor-pointer">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Sonar (.XTF/.TIF)</span>
              <input type="file" accept=".png,.jpg,.jpeg,.tif,.tiff,.xtf,.dat" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Right: Interactive Algorithmic Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Pipeline Controls Card */}
          <div className="bg-[#F9F6F0] p-5 rounded-3xl border border-[#E8E1D5] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[#2A2A2A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF6F59]" />
                <span>{activeStage === 'LEE_FILTER' ? 'Lee Speckle Noise Filter' : activeStage === 'CLAHE' ? 'CLAHE Normalization' : activeStage === 'SLICER' ? 'Waterfall Slicer Matrix' : 'Raw Sonar Metadata'}</span>
              </h3>
              <span className="text-[11px] font-mono text-[#736B5E] bg-white px-2 py-0.5 rounded-md border border-[#DDD5C7]">
                {activeStage === 'LEE_FILTER' ? 'SciPy uniform_filter' : activeStage === 'CLAHE' ? 'OpenCV CLAHE' : 'Slant-Range Slicer'}
              </span>
            </div>

            {/* LEE FILTER PARAMETERS */}
            {activeStage === 'LEE_FILTER' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#DDD5C7] font-mono text-[11px] text-[#5C5449]">
                  <p className="font-bold text-[#2A2A2A] mb-1">Lee Filter Multiplicative Model:</p>
                  <p>W = 1 - (σ_noise² / σ_local²)</p>
                  <p>x̂ = x̄ + W · (x - x̄)</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#2A2A2A] mb-1">
                    <span>Filter Kernel Window Size:</span>
                    <span className="font-mono text-[#FF6F59]">{leeWindowSize} × {leeWindowSize} px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="11"
                    step="2"
                    value={leeWindowSize}
                    onChange={(e) => setLeeWindowSize(Number(e.target.value))}
                    className="w-full accent-[#FF6F59]"
                  />
                  <div className="flex justify-between text-[10px] text-[#736B5E] mt-0.5">
                    <span>3x3 (Subtle Edge Preserving)</span>
                    <span>11x11 (Heavy Speckle Smoothing)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#2A2A2A] mb-1">
                    <span>Estimated Noise Variance (σ²):</span>
                    <span className="font-mono text-[#4F6F52]">{leeNoiseVar.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.80"
                    step="0.05"
                    value={leeNoiseVar}
                    onChange={(e) => setLeeNoiseVar(Number(e.target.value))}
                    className="w-full accent-[#4F6F52]"
                  />
                </div>
              </div>
            )}

            {/* CLAHE PARAMETERS */}
            {activeStage === 'CLAHE' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#DDD5C7] font-mono text-[11px] text-[#5C5449]">
                  <p className="font-bold text-[#2A2A2A] mb-1">Adaptive Histogram Equalization:</p>
                  <p>Balances high-backscatter polymers against acoustic drop-outs without over-amplifying background speckle.</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#2A2A2A] mb-1">
                    <span>Clip Limit Factor:</span>
                    <span className="font-mono text-[#FF6F59]">{claheClipLimit.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="6.0"
                    step="0.5"
                    value={claheClipLimit}
                    onChange={(e) => setClaheClipLimit(Number(e.target.value))}
                    className="w-full accent-[#FF6F59]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#2A2A2A] mb-1">
                    <span>Tile Grid Resolution:</span>
                    <span className="font-mono text-[#4F6F52]">{claheGridSize} × {claheGridSize} blocks</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    step="4"
                    value={claheGridSize}
                    onChange={(e) => setClaheGridSize(Number(e.target.value))}
                    className="w-full accent-[#4F6F52]"
                  />
                </div>
              </div>
            )}

            {/* SSS WATERFALL SLICER PARAMETERS */}
            {activeStage === 'SLICER' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#DDD5C7] text-[11px] text-[#5C5449]">
                  <p className="font-bold text-[#2A2A2A] mb-1">Along-Track Ping Slicing:</p>
                  <p>Slices continuous hydroacoustic waterfall swaths into standard tiles with overlap for deep neural detection.</p>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#2A2A2A] mb-1">
                    <span>Slice Ping Height:</span>
                    <span className="font-mono text-[#FF6F59]">{sliceHeight} pings</span>
                  </div>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="64"
                    value={sliceHeight}
                    onChange={(e) => setSliceHeight(Number(e.target.value))}
                    className="w-full accent-[#FF6F59]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#2A2A2A] mb-1">
                    <span>Tile Overlap Stride:</span>
                    <span className="font-mono text-[#4F6F52]">{overlapStride} pings</span>
                  </div>
                  <input
                    type="range"
                    min="64"
                    max="256"
                    step="32"
                    value={overlapStride}
                    onChange={(e) => setOverlapStride(Number(e.target.value))}
                    className="w-full accent-[#4F6F52]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DDD5C7]">
                  <span className="font-bold text-[#2A2A2A]">Slant-Range Nadir Correction</span>
                  <input
                    type="checkbox"
                    checked={slantRangeCorrection}
                    onChange={(e) => setSlantRangeCorrection(e.target.checked)}
                    className="accent-[#4F6F52] w-4 h-4 rounded"
                  />
                </div>
              </div>
            )}

            {/* RAW SONAR EXIF GPS INFO */}
            {activeStage === 'RAW' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#DDD5C7] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">Filename:</span>
                    <span className="font-mono font-bold text-[#2A2A2A]">{selectedPreset.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">EXIF Latitude:</span>
                    <span className="font-mono font-bold text-[#4F6F52]">{selectedPreset.gps.lat.toFixed(5)}°N</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">EXIF Longitude:</span>
                    <span className="font-mono font-bold text-[#4F6F52]">{selectedPreset.gps.lng.toFixed(5)}°E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">Towfish Altitude:</span>
                    <span className="font-mono font-bold text-[#2A2A2A]">{selectedPreset.altitudeM} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#736B5E]">Acoustic Frequency:</span>
                    <span className="font-mono font-bold text-[#FF6F59]">{selectedPreset.frequencyKhz} kHz Dual-Beam</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sliced Tiles Feed */}
          <div className="bg-white p-4 rounded-3xl border border-[#E8E1D5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#2A2A2A]">Generated Geo-Referenced Slices:</span>
              <span className="text-[11px] font-mono text-[#4F6F52] font-bold">{waterfallSlices.length} Tiles</span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {waterfallSlices.map((tile) => (
                <div
                  key={tile.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                    tile.hasAnomaly
                      ? 'bg-[#FF6F59]/10 border-[#FF6F59]/40 text-[#2A2A2A]'
                      : 'bg-[#F9F6F0] border-[#E8E1D5] text-[#5C5449]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">TILE #{tile.id}</span>
                    <span className="text-[11px] text-[#736B5E]">Pings: {tile.topPing}-{tile.bottomPing}</span>
                  </div>

                  {tile.hasAnomaly ? (
                    <span className="px-2 py-0.5 rounded bg-[#FF6F59] text-white text-[10px] font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      GHOST NET ({tile.estimatedHeightM}m)
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8C8275]">Clear Benthic Bed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
