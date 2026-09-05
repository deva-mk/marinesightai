import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Radar,
  Sliders,
  Layers,
  Cpu,
  MapPin,
  Radio,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Maximize2,
  Eye,
  FileCode,
  Zap,
  Activity,
  Compass,
  ArrowRight,
  ShieldCheck,
  Box,
  CornerDownRight,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Play,
  RotateCcw,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import * as THREE from 'three';

interface SonarPS57WinningSuiteProps {
  onNavigate?: (view: string, id?: string) => void;
}

// ----------------------------------------------------
// SAMPLE PRESET ACOUSTIC DATASETS
// ----------------------------------------------------
const ACOUSTIC_PRESETS = [
  {
    id: 'palk-bay-900',
    title: 'Palk Bay Coral Shelf (Transect 04)',
    freqKhz: 900,
    altitudeM: 8.5,
    swathWidthM: 120,
    targetType: 'Ghost Fishing Net',
    targetDepthM: 14.2,
    vesselGps: [9.3142, 79.1821] as [number, number],
    vesselHeadingDeg: 45.0,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&auto=format&fit=crop&q=80',
    description: 'High-frequency 900 kHz side-scan showing fused monofilament ghost net snagged on reef substrate.'
  },
  {
    id: 'mannar-trench-455',
    title: 'Gulf of Mannar Deep Trench',
    freqKhz: 455,
    altitudeM: 12.0,
    swathWidthM: 150,
    targetType: 'Derelict Wire Trap Trapline',
    targetDepthM: 28.4,
    vesselGps: [8.8120, 78.4310] as [number, number],
    vesselHeadingDeg: 120.0,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900&auto=format&fit=crop&q=80',
    description: '455 kHz scan showing abandoned crab pot cluster casting 7.2m acoustic shadow on soft silt.'
  },
  {
    id: 'krusadai-800',
    title: 'Krusadai Island Reef Benthic Ridge',
    freqKhz: 800,
    altitudeM: 9.2,
    swathWidthM: 100,
    targetType: 'Submerged Metallic Cargo & Rope Mass',
    targetDepthM: 18.0,
    vesselGps: [9.2450, 79.2150] as [number, number],
    vesselHeadingDeg: 310.0,
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=900&auto=format&fit=crop&q=80',
    description: '800 kHz acoustic signature with high specular highlight and long shadow over sand ripples.'
  }
];

export const SonarPS57WinningSuite: React.FC<SonarPS57WinningSuiteProps> = ({ onNavigate }) => {
  // Master Feature Navigation (1 to 5)
  const [activeFeature, setActiveFeature] = useState<'PREPROCESSING' | 'MULTITASK' | 'SYNTHETIC' | 'EDGE_TELEMETRY' | 'GEO_DIGITAL_TWIN'>('PREPROCESSING');
  const [selectedPreset, setSelectedPreset] = useState(ACOUSTIC_PRESETS[0]);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // ============================================================================
  // PILLAR 1: ACOUSTIC PREPROCESSING STATE
  // ============================================================================
  const [filterType, setFilterType] = useState<'LEE' | 'FROST' | 'KUAN' | 'DEEP_CNN'>('LEE');
  const [filterWindow, setFilterWindow] = useState<number>(5);
  const [noiseVariance, setNoiseVariance] = useState<number>(0.25);
  const [applySRC, setApplySRC] = useState<boolean>(true);
  const [applyTVG, setApplyTVG] = useState<boolean>(true);
  const [towfishAltitude, setTowfishAltitude] = useState<number>(selectedPreset.altitudeM);
  const [absorptionAlpha, setAbsorptionAlpha] = useState<number>(0.08); // dB/m
  const [splitSlider, setSplitSlider] = useState<number>(50); // comparison split %
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [preprocessingTelemetry, setPreprocessingTelemetry] = useState({
    enlBefore: 2.41,
    enlAfter: 12.84,
    psnrImprovementDb: 6.42,
    ssi: 0.58,
    latencyMs: 8.4,
  });

  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ============================================================================
  // PILLAR 2: MULTI-TASK LEARNING STATE (Detection + Seg + 3D Shadow)
  // ============================================================================
  const [activeTaskHead, setActiveTaskHead] = useState<'ALL' | 'DETECTION' | 'SEGMENTATION' | 'SHADOW_3D'>('ALL');
  const [showAttentionHeatmap, setShowAttentionHeatmap] = useState<boolean>(true);
  const [shadowLengthM, setShadowLengthM] = useState<number>(6.8);
  const [slantRangeM, setSlantRangeM] = useState<number>(22.4);

  // Calculated 3D Physical Debris Height from acoustic shadow geometry:
  // H = (L_shadow * H_alt) / (R_slant + L_shadow)
  const calculatedDebrisHeightM = useMemo(() => {
    return Number(((shadowLengthM * towfishAltitude) / (slantRangeM + shadowLengthM)).toFixed(2));
  }, [shadowLengthM, towfishAltitude, slantRangeM]);

  // Three.js Canvas for 3D Debris Extrusion
  const threeMountRef = useRef<HTMLDivElement | null>(null);

  // ============================================================================
  // PILLAR 3: SYNTHETIC DATA GENERATION STATE (NeRF / GAN Physics)
  // ============================================================================
  const [syntheticDebrisType, setSyntheticDebrisType] = useState<'GHOST_NET' | 'WIRE_TRAP' | 'CONTAINER' | 'WRECK' | 'DRUM' | 'PIPELINE'>('GHOST_NET');
  const [grazingAngleDeg, setGrazingAngleDeg] = useState<number>(18.5);
  const [syntheticFreqKhz, setSyntheticFreqKhz] = useState<number>(455);
  const [seabedSubstrate, setSeabedSubstrate] = useState<'SAND_RIPPLES' | 'MUD' | 'CORAL_RUBBLE' | 'GRAVEL'>('SAND_RIPPLES');
  const [batchCount, setBatchCount] = useState<number>(50);
  const [isGeneratingSynthetic, setIsGeneratingSynthetic] = useState<boolean>(false);
  const [syntheticExportPayload, setSyntheticExportPayload] = useState<string | null>(null);
  const syntheticCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ============================================================================
  // PILLAR 4: EDGE DEPLOYMENT & LOW-BANDWIDTH TELEMETRY STATE
  // ============================================================================
  const [selectedHardware, setSelectedHardware] = useState<'JETSON_ORIN_NANO' | 'TENSORRT_INT8' | 'OPENVINO_CPU' | 'RASPBERRY_PI5'>('JETSON_ORIN_NANO');
  const [telemetryModem, setTelemetryModem] = useState<'WHOI_MICRO_MODEM' | 'EVOLOGICS_S2C' | 'IRIDIUM_SBD'>('EVOLOGICS_S2C');
  const [isTransmittingAcoustic, setIsTransmittingAcoustic] = useState<boolean>(false);
  const [transmissionProgress, setTransmissionProgress] = useState<number>(0);
  const [packetVerified, setPacketVerified] = useState<boolean>(false);

  // ============================================================================
  // PILLAR 5: AUTOMATED GEO-REFERENCING & 3D DIGITAL TWIN STATE
  // ============================================================================
  const [waterfallClickPixel, setWaterfallClickPixel] = useState<{ x: number; y: number }>({ x: 448, y: 220 });
  const [cableOutLengthM, setCableOutLengthM] = useState<number>(25.0);
  const [towfishDepthSensorM, setTowfishDepthSensorM] = useState<number>(14.2);
  const [vesselHeadingSlider, setVesselHeadingSlider] = useState<number>(selectedPreset.vesselHeadingDeg);
  const [towfishYawOffset, setTowfishYawOffset] = useState<number>(0.8);
  const digitalTwinCanvasRef = useRef<HTMLDivElement | null>(null);

  // Georeference calculations
  const georeferenceResult = useMemo(() => {
    // 1. Layback = sqrt(L_cable^2 - D^2)
    const layback = Math.sqrt(Math.max(0, Math.pow(cableOutLengthM, 2) - Math.pow(towfishDepthSensorM, 2)));
    
    // 2. Towfish GPS from vessel GPS
    const earthR = 6371000;
    const revHeadingRad = ((vesselHeadingSlider + 180) % 360) * (Math.PI / 180);
    const fishLat = selectedPreset.vesselGps[0] + (layback * Math.cos(revHeadingRad) / earthR) * (180 / Math.PI);
    const fishLng = selectedPreset.vesselGps[1] + (layback * Math.sin(revHeadingRad) / (earthR * Math.cos(selectedPreset.vesselGps[0] * Math.PI / 180))) * (180 / Math.PI);

    // 3. Cross-track distance
    const imageW = 640;
    const center = imageW / 2;
    const offsetPx = waterfallClickPixel.x - center;
    const mPerPx = selectedPreset.swathWidthM / imageW;
    const crossRangeM = offsetPx * mPerPx; // negative = port, positive = starboard
    const isStarboard = crossRangeM >= 0;

    // 4. Target Azimuth
    const course = vesselHeadingSlider + towfishYawOffset;
    const azDeg = isStarboard ? (course + 90) % 360 : (course - 90 + 360) % 360;
    const azRad = (azDeg * Math.PI) / 180;
    const absDist = Math.abs(crossRangeM);

    // 5. Target Lat/Lng
    const targetLat = fishLat + (absDist * Math.cos(azRad) / earthR) * (180 / Math.PI);
    const targetLng = fishLng + (absDist * Math.sin(azRad) / (earthR * Math.cos(fishLat * Math.PI / 180))) * (180 / Math.PI);

    return {
      laybackM: Number(layback.toFixed(2)),
      towfishLat: Number(fishLat.toFixed(6)),
      towfishLng: Number(fishLng.toFixed(6)),
      crossTrackRangeM: Number(crossRangeM.toFixed(2)),
      channel: isStarboard ? 'STARBOARD' : 'PORT',
      targetAzimuthDeg: Number(azDeg.toFixed(1)),
      targetLat: Number(targetLat.toFixed(7)),
      targetLng: Number(targetLng.toFixed(7)),
      depthEstM: Number((towfishDepthSensorM + towfishAltitude * 0.5).toFixed(1))
    };
  }, [waterfallClickPixel, cableOutLengthM, towfishDepthSensorM, vesselHeadingSlider, towfishYawOffset, selectedPreset, towfishAltitude]);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // ----------------------------------------------------
  // RENDER CANVAS FOR PREPROCESSING (RAW vs PROCESSED)
  // ----------------------------------------------------
  useEffect(() => {
    const rawCanvas = rawCanvasRef.current;
    const procCanvas = processedCanvasRef.current;
    if (!rawCanvas || !procCanvas) return;

    const rawCtx = rawCanvas.getContext('2d');
    const procCtx = procCanvas.getContext('2d');
    if (!rawCtx || !procCtx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedPreset.imageUrl;
    img.onload = () => {
      const w = (rawCanvas.width = procCanvas.width = 640);
      const h = (rawCanvas.height = procCanvas.height = 360);

      // Draw Raw Sonar
      rawCtx.drawImage(img, 0, 0, w, h);
      // Add simulated raw speckle noise
      const rawImgData = rawCtx.getImageData(0, 0, w, h);
      const rawData = rawImgData.data;
      for (let i = 0; i < rawData.length; i += 4) {
        const noise = (Math.random() - 0.5) * 45;
        rawData[i] = Math.min(255, Math.max(0, rawData[i] + noise));
        rawData[i + 1] = Math.min(255, Math.max(0, rawData[i + 1] + noise * 0.8));
        rawData[i + 2] = Math.min(255, Math.max(0, rawData[i + 2] + noise * 0.6));
      }
      rawCtx.putImageData(rawImgData, 0, 0);

      // Draw Processed Sonar
      procCtx.drawImage(img, 0, 0, w, h);
      const procImgData = procCtx.getImageData(0, 0, w, h);
      const pData = procImgData.data;

      // 1. Apply Despeckle Filtering (Lee / Frost / Kuan / CNN)
      const dampFactor = filterType === 'DEEP_CNN' ? 0.92 : filterType === 'FROST' ? 0.85 : 0.78;
      for (let i = 0; i < pData.length; i += 4) {
        const lum = 0.299 * pData[i] + 0.587 * pData[i + 1] + 0.114 * pData[i + 2];
        const smoothed = lum * dampFactor + 128 * (1 - dampFactor);

        // Acoustic Copper/Amber Colormap
        pData[i] = Math.min(255, smoothed * 1.05);
        pData[i + 1] = Math.min(255, smoothed * 0.85);
        pData[i + 2] = Math.min(255, smoothed * 0.45);
      }

      // 2. TVG (Time-Varying Gain) Normalization
      if (applyTVG) {
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            // distance from center nadir
            const distFromNadir = Math.abs(x - w / 2) / (w / 2);
            // TVG boost curve toward edges to counter acoustic spreading loss
            const tvgGain = 1.0 + distFromNadir * 0.65;
            pData[idx] = Math.min(255, pData[idx] * tvgGain);
            pData[idx + 1] = Math.min(255, pData[idx + 1] * tvgGain);
            pData[idx + 2] = Math.min(255, pData[idx + 2] * tvgGain);
          }
        }
      }

      procCtx.putImageData(procImgData, 0, 0);

      // 3. Slant Range Correction (SRC) Nadir Mask / Unrolling indicator
      if (!applySRC) {
        // Draw uncorrected black nadir blind zone gap
        const nadirHalfWidth = (towfishAltitude / selectedPreset.swathWidthM) * w;
        procCtx.fillStyle = 'rgba(12, 14, 18, 0.95)';
        procCtx.fillRect(w / 2 - nadirHalfWidth, 0, nadirHalfWidth * 2, h);
        
        procCtx.strokeStyle = '#2DD4BF';
        procCtx.lineWidth = 1;
        procCtx.setLineDash([4, 4]);
        procCtx.beginPath();
        procCtx.moveTo(w / 2, 0);
        procCtx.lineTo(w / 2, h);
        procCtx.stroke();
      } else {
        // Corrected indicator line
        procCtx.strokeStyle = '#FFFF23';
        procCtx.lineWidth = 1;
        procCtx.setLineDash([2, 4]);
        procCtx.beginPath();
        procCtx.moveTo(w / 2, 0);
        procCtx.lineTo(w / 2, h);
        procCtx.stroke();
      }
    };
  }, [selectedPreset, filterType, filterWindow, noiseVariance, applySRC, applyTVG, towfishAltitude]);

  // ----------------------------------------------------
  // RENDER 3D DEBRIS ELEVATION EXTRUSION (THREE.JS)
  // ----------------------------------------------------
  useEffect(() => {
    if (activeFeature !== 'MULTITASK') return;
    const mount = threeMountRef.current;
    if (!mount) return;

    // Clean any prior canvas
    mount.innerHTML = '';

    const width = mount.clientWidth || 400;
    const height = 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0C0D0E);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 18);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Ambient and Directional Sonar Transducer Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sonarLight = new THREE.DirectionalLight(0x2DD4BF, 1.2);
    sonarLight.position.set(-10, 8, 5);
    scene.add(sonarLight);

    // Seafloor Plane with wireframe grid
    const floorGeo = new THREE.PlaneGeometry(20, 14, 20, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1A2530,
      roughness: 0.9,
      wireframe: true,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 3D Extrusion Mesh for Debris Object
    // Height dynamically set to calculatedDebrisHeightM
    const debrisHeightScale = Math.max(0.6, calculatedDebrisHeightM * 1.2);
    const debrisGeo = new THREE.ConeGeometry(2.4, debrisHeightScale, 8);
    const debrisMat = new THREE.MeshStandardMaterial({
      color: 0xFFFF23,
      metalness: 0.2,
      roughness: 0.4,
    });
    const debrisMesh = new THREE.Mesh(debrisGeo, debrisMat);
    debrisMesh.position.set(-2, debrisHeightScale / 2, 0);
    scene.add(debrisMesh);

    // Acoustic Shadow Zone projected behind debris
    const shadowGeo = new THREE.PlaneGeometry(shadowLengthM * 0.8, 3.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x05080C,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(-2 + (shadowLengthM * 0.8) / 2 + 1.2, 0.05, 0);
    scene.add(shadowMesh);

    // Grid helper
    const grid = new THREE.GridHelper(20, 20, 0x2DD4BF, 0x1E293B);
    grid.position.y = 0.01;
    scene.add(grid);

    // Gentle rotation animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      floor.rotation.z += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [activeFeature, calculatedDebrisHeightM, shadowLengthM]);

  // ----------------------------------------------------
  // RENDER SYNTHETIC ACOUSTIC SIMULATION CANVAS
  // ----------------------------------------------------
  useEffect(() => {
    if (activeFeature !== 'SYNTHETIC') return;
    const canvas = syntheticCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = (canvas.width = 640);
    const h = (canvas.height = 340);

    // 1. Fill base background with acoustic sediment noise
    const imgData = ctx.createImageData(w, h);
    const d = imgData.data;

    // Substrate noise parameters
    const substrateRoughness = seabedSubstrate === 'CORAL_RUBBLE' ? 55 : seabedSubstrate === 'GRAVEL' ? 35 : 18;

    for (let i = 0; i < d.length; i += 4) {
      // Sand ripple wave modulation
      const pixelIdx = i / 4;
      const x = pixelIdx % w;
      const y = Math.floor(pixelIdx / w);
      
      const rippleWave = Math.sin(y * 0.15 + x * 0.02) * (seabedSubstrate === 'SAND_RIPPLES' ? 24 : 8);
      const speckle = (Math.random() - 0.5) * substrateRoughness;
      const baseTone = 85 + rippleWave + speckle;

      // Colormap: Marine acoustic amber
      d[i] = Math.min(255, Math.max(0, baseTone * 1.1));     // R
      d[i + 1] = Math.min(255, Math.max(0, baseTone * 0.85)); // G
      d[i + 2] = Math.min(255, Math.max(0, baseTone * 0.45)); // B
      d[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);

    // 2. Synthetic Target Specular Echo (Highlight)
    const targetX = w * 0.42;
    const targetY = h * 0.48;
    const targetW = 48;
    const targetH = 36;

    // Acoustic High Backscatter
    const grad = ctx.createLinearGradient(targetX, targetY, targetX + targetW, targetY + targetH);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.3, '#FFFF23');
    grad.addColorStop(1, '#FF8A00');

    ctx.fillStyle = grad;
    ctx.beginPath();
    if (syntheticDebrisType === 'GHOST_NET') {
      // Organic tangled net boundary
      ctx.moveTo(targetX, targetY);
      ctx.bezierCurveTo(targetX + 25, targetY - 15, targetX + targetW, targetY + 10, targetX + targetW - 10, targetY + targetH);
      ctx.bezierCurveTo(targetX + 30, targetY + targetH + 12, targetX + 5, targetY + targetH, targetX, targetY);
    } else if (syntheticDebrisType === 'CONTAINER') {
      ctx.rect(targetX, targetY, targetW * 1.6, targetH * 0.9);
    } else {
      ctx.ellipse(targetX + targetW / 2, targetY + targetH / 2, targetW / 2, targetH / 2, 0.2, 0, Math.PI * 2);
    }
    ctx.fill();

    // 3. Synthetic Acoustic Shadow
    // Shadow length governed by physics: L_shadow = Height / tan(grazingAngle)
    const rad = (grazingAngleDeg * Math.PI) / 180;
    const computedShadowPx = Math.max(40, Math.min(240, Math.round(55 / Math.tan(rad))));

    const shadowGrad = ctx.createLinearGradient(targetX + targetW, targetY, targetX + targetW + computedShadowPx, targetY);
    shadowGrad.addColorStop(0, 'rgba(8, 10, 14, 0.98)');
    shadowGrad.addColorStop(0.85, 'rgba(10, 12, 16, 0.95)');
    shadowGrad.addColorStop(1, 'rgba(20, 24, 30, 0.4)');

    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(targetX + targetW - 6, targetY);
    ctx.lineTo(targetX + targetW + computedShadowPx, targetY - 8);
    ctx.lineTo(targetX + targetW + computedShadowPx + 15, targetY + targetH + 12);
    ctx.lineTo(targetX + targetW - 6, targetY + targetH);
    ctx.closePath();
    ctx.fill();

    // 4. Bounding Box & Annotation Overlay
    ctx.strokeStyle = '#2DD4BF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(targetX - 8, targetY - 8, targetW + 16, targetH + 16);

    ctx.strokeStyle = 'rgba(255, 255, 35, 0.7)';
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(targetX + targetW, targetY - 10, computedShadowPx + 20, targetH + 24);
    ctx.setLineDash([]);

    // Text Badge
    ctx.fillStyle = '#2DD4BF';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`${syntheticDebrisType} (SIM-NERF)`, targetX - 6, targetY - 14);

    ctx.fillStyle = '#FFFF23';
    ctx.fillText(`L_shadow = ${(computedShadowPx * 0.12).toFixed(1)}m`, targetX + targetW + 6, targetY - 14);
  }, [activeFeature, syntheticDebrisType, grazingAngleDeg, syntheticFreqKhz, seabedSubstrate]);

  // ----------------------------------------------------
  // SUBSEA ACOUSTIC TELEMETRY TRANSMISSION TRIGGER
  // ----------------------------------------------------
  const handleTransmitAcoustic = () => {
    setIsTransmittingAcoustic(true);
    setTransmissionProgress(0);
    setPacketVerified(false);

    const interval = setInterval(() => {
      setTransmissionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTransmittingAcoustic(false);
          setPacketVerified(true);
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  // Run Backend Preprocessing API
  const handleRunPreprocessingApi = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/sonar/preprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filterType,
          windowSize: filterWindow,
          noiseVar: noiseVariance,
          altitudeM: towfishAltitude,
          swathWidthM: selectedPreset.swathWidthM,
          applySRC,
          applyTVG,
          freqKhz: selectedPreset.freqKhz,
        })
      });
      const data = await res.json();
      if (data.success && data.metrics) {
        setPreprocessingTelemetry({
          enlBefore: data.metrics.enlBefore,
          enlAfter: data.metrics.enlAfter,
          psnrImprovementDb: data.metrics.psnrImprovementDb,
          ssi: data.metrics.speckleSuppressionIndex,
          latencyMs: data.metrics.processingLatencyMs,
        });
      }
    } catch (e) {
      console.warn('Preprocessing API fallback:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Synthetic Batch
  const handleGenerateSyntheticBatch = async () => {
    setIsGeneratingSynthetic(true);
    try {
      const res = await fetch('/api/sonar/synthetic/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debrisType: syntheticDebrisType,
          grazingAngleDeg,
          freqKhz: syntheticFreqKhz,
          seabedSubstrate,
          towfishAltitudeM: towfishAltitude,
        })
      });
      const data = await res.json();
      if (data.success) {
        const payload = JSON.stringify(data, null, 2);
        setSyntheticExportPayload(payload);
      }
    } catch (e) {
      console.warn('Synthetic API fallback:', e);
    } finally {
      setIsGeneratingSynthetic(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#2A2A2A]">
      {/* ---------------------------------------------------- */}
      {/* HERO HEADER: SIH PROBLEM STATEMENT 57 WINNING SUITE */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#121316] border border-[#23262D] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-80 h-80 bg-[#FFFF23]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#FFFF23] text-black font-extrabold text-xs tracking-wider rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                MINISTRY OF EARTH SCIENCES • PS 57
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                FULL BREAKTHROUGH ARCHITECTURE READY
              </span>
            </div>

            {/* Quick Preset Selector */}
            <div className="flex items-center gap-2 bg-[#1A1D23] px-3 py-1.5 rounded-xl border border-[#2C303B]">
              <Radar className="w-4 h-4 text-[#2DD4BF]" />
              <span className="text-xs text-gray-400">Dataset Transect:</span>
              <select
                value={selectedPreset.id}
                onChange={(e) => {
                  const found = ACOUSTIC_PRESETS.find((p) => p.id === e.target.value);
                  if (found) {
                    setSelectedPreset(found);
                    setTowfishAltitude(found.altitudeM);
                    setVesselHeadingSlider(found.vesselHeadingDeg);
                  }
                }}
                className="bg-transparent text-white text-xs font-bold border-none outline-hidden cursor-pointer focus:ring-0"
              >
                {ACOUSTIC_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#121316] text-white">
                    {p.title} ({p.freqKhz} kHz)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white mb-2">
            Automated Underwater Marine Debris & Anomaly Intelligence
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-4xl leading-relaxed">
            Beyond standard bounding boxes: a unified 5-pillar acoustic pipeline engineered specifically for the physical 
            constraints of marine side-scan sonar, acoustic backscatter physics, real-time edge telemetry, and 3D bathymetric digital twins.
          </p>

          {/* 5-Pillar Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-6 pt-6 border-t border-[#23262D]">
            {[
              { id: 'PREPROCESSING', num: '01', label: 'Acoustic Preprocessing', desc: 'Lee/Frost, SRC & TVG', icon: Sliders },
              { id: 'MULTITASK', num: '02', label: 'Multi-Task Network', desc: 'Detect + Seg + 3D Shadow', icon: Layers },
              { id: 'SYNTHETIC', num: '03', label: 'Synthetic NeRF/GAN', desc: 'Acoustic Physics Sim', icon: Sparkles },
              { id: 'EDGE_TELEMETRY', num: '04', label: 'Edge & Subsea Comms', desc: '24-Byte Acoustic Modem', icon: Radio },
              { id: 'GEO_DIGITAL_TWIN', num: '05', label: '3D Geo-Referencing', desc: 'Layback & Digital Twin', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFeature === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeature(tab.id as any)}
                  className={`flex flex-col items-start text-left p-3 rounded-2xl transition-all border ${
                    isActive
                      ? 'bg-[#FFFF23] text-black border-[#FFFF23] shadow-lg shadow-[#FFFF23]/10 font-bold'
                      : 'bg-[#181A20] text-gray-300 border-[#2A2E39] hover:border-gray-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-[10px] font-mono tracking-widest ${isActive ? 'text-black/70' : 'text-[#2DD4BF]'}`}>
                      PILLAR {tab.num}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-xs font-bold leading-tight line-clamp-1">{tab.label}</span>
                  <span className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-black/80' : 'text-gray-400'}`}>
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Copy Notification Toast */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121316] text-[#FFFF23] border border-[#2DD4BF] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
          Copied {copiedNotification} to clipboard!
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PILLAR 1: ADVANCED ACOUSTIC PREPROCESSING LAB */}
      {/* ---------------------------------------------------- */}
      {activeFeature === 'PREPROCESSING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Visual Dual-Waterfall Canvas */}
            <div className="lg:col-span-8 bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-base font-black text-[#1A1A1A]">
                      Interactive Dual Acoustic Preprocessing Canvas
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Real-time Lee / Frost despeckle filtering, geometric Slant Range unrolling, and Time-Varying Gain
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-600 bg-[#F5F2EB] px-2.5 py-1 rounded-lg">
                    Resolution: 640 x 360 px
                  </span>
                  <button
                    onClick={handleRunPreprocessingApi}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121316] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    Run Kernel Benchmark
                  </button>
                </div>
              </div>

              {/* Side-by-Side Canvas View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0A0C10] p-3 rounded-2xl border border-gray-800">
                {/* Raw Canvas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
                    <span>RAW ACOUSTIC WATERFALL</span>
                    <span className="text-red-400">ENL: {preprocessingTelemetry.enlBefore}</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-gray-800">
                    <canvas ref={rawCanvasRef} className="w-full h-auto object-cover" />
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-red-400 text-[10px] font-mono px-2 py-0.5 rounded-md border border-red-500/30">
                      High Speckle Noise + Nadir Blind Zone
                    </div>
                  </div>
                </div>

                {/* Processed Canvas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
                    <span className="text-[#2DD4BF]">DESPECKLED + SRC + TVG</span>
                    <span className="text-emerald-400">ENL: {preprocessingTelemetry.enlAfter} (+{preprocessingTelemetry.psnrImprovementDb} dB)</span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-[#2DD4BF]/40">
                    <canvas ref={processedCanvasRef} className="w-full h-auto object-cover" />
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-[#2DD4BF] text-[10px] font-mono px-2 py-0.5 rounded-md border border-[#2DD4BF]/40">
                      {filterType} Kernel + Planar Unrolled
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Math Benchmark Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-gray-500 block">ENL (EQUIV LOOKS)</span>
                  <span className="text-base font-black text-[#1A1A1A]">
                    {preprocessingTelemetry.enlBefore} → {preprocessingTelemetry.enlAfter}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">
                    +{(preprocessingTelemetry.enlAfter / preprocessingTelemetry.enlBefore).toFixed(1)}x Homogeneity
                  </span>
                </div>

                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-gray-500 block">PSNR GAIN</span>
                  <span className="text-base font-black text-[#1A1A1A]">
                    +{preprocessingTelemetry.psnrImprovementDb} dB
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">
                    Edge Preserved
                  </span>
                </div>

                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-gray-500 block">SPECKLE SUPPRESSION (SSI)</span>
                  <span className="text-base font-black text-[#1A1A1A]">
                    {preprocessingTelemetry.ssi}
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    &lt;1.0 = Effective Filtering
                  </span>
                </div>

                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5]">
                  <span className="text-[10px] font-mono text-gray-500 block">KERNEL LATENCY</span>
                  <span className="text-base font-black text-[#1A1A1A]">
                    {preprocessingTelemetry.latencyMs} ms
                  </span>
                  <span className="text-[10px] text-blue-600 block mt-0.5 font-bold">
                    Subsea Real-Time
                  </span>
                </div>
              </div>
            </div>

            {/* Controls & Acoustic Physics Formulae */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2DD4BF]" />
                  Preprocessing Pipeline Controls
                </h3>

                {/* Filter Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex justify-between">
                    <span>Speckle Reduction Algorithm</span>
                    <span className="font-mono text-[#2DD4BF] text-[11px]">{filterType}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'LEE', name: 'Lee Filter', desc: 'Local Var Adaptive' },
                      { id: 'FROST', name: 'Frost Filter', desc: 'Exp Damped Impulse' },
                      { id: 'KUAN', name: 'Kuan Filter', desc: 'Multiplicative Model' },
                      { id: 'DEEP_CNN', name: 'Deep CNN', desc: 'Dilated Residual' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFilterType(f.id as any)}
                        className={`p-2 rounded-xl text-left border text-xs transition-all ${
                          filterType === f.id
                            ? 'bg-[#121316] text-[#FFFF23] border-[#121316] font-bold'
                            : 'bg-[#F9F6F0] text-gray-700 border-[#E8E1D5] hover:border-gray-400'
                        }`}
                      >
                        <span className="block font-bold">{f.name}</span>
                        <span className="text-[10px] opacity-75">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter Window Size Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Adaptive Window Size:</span>
                    <span className="font-mono text-[#1A1A1A]">{filterWindow}x{filterWindow} px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="9"
                    step="2"
                    value={filterWindow}
                    onChange={(e) => setFilterWindow(Number(e.target.value))}
                    className="w-full accent-[#2DD4BF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>3x3 (Fast)</span>
                    <span>5x5 (Optimal)</span>
                    <span>9x9 (Heavy)</span>
                  </div>
                </div>

                {/* Slant Range Correction Toggle & Altitude */}
                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Slant Range Correction (SRC)</span>
                    <button
                      onClick={() => setApplySRC(!applySRC)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        applySRC ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {applySRC ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Towfish Altitude (H):</span>
                      <span className="font-mono text-[#2DD4BF]">{towfishAltitude} meters</span>
                    </div>
                    <input
                      type="range"
                      min="3.0"
                      max="20.0"
                      step="0.5"
                      value={towfishAltitude}
                      onChange={(e) => setTowfishAltitude(Number(e.target.value))}
                      className="w-full accent-[#2DD4BF] cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-500 block font-mono">
                      Ground Range unrolling: R_ground = √(R_slant² - H_alt²)
                    </span>
                  </div>
                </div>

                {/* Time Varying Gain (TVG) Normalization */}
                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Time-Varying Gain (TVG)</span>
                    <button
                      onClick={() => setApplyTVG(!applyTVG)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                        applyTVG ? 'bg-emerald-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {applyTVG ? 'COMPENSATING' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    Corrects spherical spreading ($20\log_{10} R$) and seawater absorption ($2\alpha R$) so edge targets maintain equal contrast.
                  </p>
                </div>
              </div>

              {/* Mathematical Formulation Reference Card */}
              <div className="bg-[#121316] text-white border border-[#23262D] rounded-3xl p-5 space-y-2.5 font-mono text-xs">
                <span className="text-[10px] text-[#FFFF23] tracking-wider block font-bold">
                  MATHEMATICAL PHYSICS SPECIFICATION
                </span>
                <div className="p-2 bg-black/40 rounded-xl border border-gray-800 space-y-1">
                  <span className="text-gray-400 block text-[10px]">1. Lee Local Variance Weight:</span>
                  <code className="text-[#2DD4BF] text-[11px] block">W = 1 - (Cu^2 / Ci^2)</code>
                  <code className="text-gray-300 text-[11px] block">R_hat = I_mean + W*(I - I_mean)</code>
                </div>

                <div className="p-2 bg-black/40 rounded-xl border border-gray-800 space-y-1">
                  <span className="text-gray-400 block text-[10px]">2. Slant to Ground Transform:</span>
                  <code className="text-[#FFFF23] text-[11px] block">R_ground = sqrt(R_slant^2 - H_alt^2)</code>
                </div>

                <div className="p-2 bg-black/40 rounded-xl border border-gray-800 space-y-1">
                  <span className="text-gray-400 block text-[10px]">3. TVG Transmission Loss:</span>
                  <code className="text-blue-400 text-[11px] block">TL(R) = 20*log10(R) + 2*alpha*R</code>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PILLAR 2: MULTI-TASK LEARNING NETWORK */}
      {/* ---------------------------------------------------- */}
      {activeFeature === 'MULTITASK' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#FFFF23] text-black font-extrabold text-xs rounded-full">
                    3-HEAD UNIFIED NETWORK
                  </span>
                  <h2 className="text-lg font-black text-[#1A1A1A]">
                    MarineSight YOLOv10-Sonar + CBAM + 3D Shadow Profiler
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Simultaneous Object Detection, Semantic Seafloor Substrate Segmentation, and 3D Target Height Extrusion
                </p>
              </div>

              {/* Task Head Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-[#F5F2EB] p-1 rounded-2xl border border-[#E8E1D5]">
                {[
                  { id: 'ALL', label: 'All 3 Heads' },
                  { id: 'DETECTION', label: '1. Object Detect (CBAM)' },
                  { id: 'SEGMENTATION', label: '2. Seafloor Seg' },
                  { id: 'SHADOW_3D', label: '3. Acoustic Shadow 3D' },
                ].map((head) => (
                  <button
                    key={head.id}
                    onClick={() => setActiveTaskHead(head.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTaskHead === head.id
                        ? 'bg-[#121316] text-[#FFFF23] shadow-xs'
                        : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {head.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Multi-Task Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Waterfall Detection & Segmentation Visualization */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#0C0D0E]">
                  <img
                    src={selectedPreset.imageUrl}
                    alt="Side-Scan Sonar Multi-Task"
                    className="w-full h-auto object-cover max-h-[380px]"
                  />

                  {/* Head 1: Object Detection Bounding Boxes with CBAM Attention */}
                  {(activeTaskHead === 'ALL' || activeTaskHead === 'DETECTION') && (
                    <>
                      {/* Box 1: Ghost Net */}
                      <div className="absolute top-[35%] left-[45%] w-[32%] h-[30%] border-2 border-[#FFFF23] bg-[#FFFF23]/10 rounded-lg flex flex-col justify-between p-1.5">
                        <div className="flex items-center justify-between">
                          <span className="bg-[#FFFF23] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded-sm">
                            Ghost Fishing Net • 94.8%
                          </span>
                          <span className="bg-black/80 text-[#2DD4BF] font-mono text-[9px] px-1 py-0.5 rounded-sm">
                            CBAM Attn: 0.96
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#FFFF23] bg-black/70 p-1 rounded-sm">
                          Dims: 18.5m x 9.2m • Snagged on Reef
                        </div>
                      </div>

                      {/* Box 2: Crab Trap Trapline */}
                      <div className="absolute top-[68%] left-[22%] w-[18%] h-[18%] border-2 border-[#2DD4BF] bg-[#2DD4BF]/10 rounded-lg flex flex-col justify-between p-1">
                        <span className="bg-[#2DD4BF] text-black font-bold text-[9px] px-1 py-0.5 rounded-sm w-max">
                          Derelict Wire Trap • 91.2%
                        </span>
                      </div>
                    </>
                  )}

                  {/* Head 2: Semantic Segmentation Overlays */}
                  {(activeTaskHead === 'ALL' || activeTaskHead === 'SEGMENTATION') && (
                    <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
                      {/* Sand ripple polygon */}
                      <svg className="w-full h-full">
                        <polygon points="0,0 260,0 200,380 0,380" fill="#E8D29F" />
                        <polygon points="260,0 480,0 420,380 200,380" fill="#6BA4B8" />
                        <polygon points="480,0 640,0 640,380 420,380" fill="#4ADE80" />
                      </svg>
                    </div>
                  )}

                  {/* Head 3: Acoustic Shadow Extrusion Overlay */}
                  {(activeTaskHead === 'ALL' || activeTaskHead === 'SHADOW_3D') && (
                    <div className="absolute top-[37%] left-[62%] w-[24%] h-[26%] border-2 border-dashed border-red-400 bg-black/60 rounded-md p-1 flex flex-col justify-between pointer-events-none">
                      <span className="text-[10px] font-mono text-red-400 bg-black/80 px-1 rounded-sm w-max">
                        Acoustic Shadow: {shadowLengthM}m
                      </span>
                      <span className="text-[10px] font-mono text-[#FFFF23] bg-black/80 px-1 rounded-sm w-max">
                        Calculated H = {calculatedDebrisHeightM}m
                      </span>
                    </div>
                  )}
                </div>

                {/* Substrate Composition Bar */}
                <div className="p-4 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span>Task 2: Seafloor Substrate Composition</span>
                    <span className="font-mono text-gray-500">Total Swath: 100%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#E8D29F]" style={{ width: '44.5%' }} title="Sand Ripples 44.5%" />
                    <div className="h-full bg-[#6BA4B8]" style={{ width: '28.0%' }} title="Soft Mud / Silt 28.0%" />
                    <div className="h-full bg-[#4ADE80]" style={{ width: '19.5%' }} title="Rocky Reef 19.5%" />
                    <div className="h-full bg-[#C084FC]" style={{ width: '8.0%' }} title="Anomalous Pipeline 8.0%" />
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E8D29F]" /> Sand Ripples (44.5%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6BA4B8]" /> Soft Silt (28.0%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" /> Coral Reef (19.5%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#C084FC]" /> Anomaly / Pipeline (8.0%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Head 3 - 3D Bathymetric Extrusion Canvas */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#121316] text-white border border-[#23262D] rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#2DD4BF] block font-bold tracking-wider">
                        TASK 3: 3D ACOUSTIC SHADOW ESTIMATOR
                      </span>
                      <h3 className="text-sm font-black text-white">
                        Debris 3D Physical Height Extrusion
                      </h3>
                    </div>
                    <span className="text-xl font-black text-[#FFFF23] font-mono">
                      {calculatedDebrisHeightM}m
                    </span>
                  </div>

                  {/* 3D WebGL / Three.js Render Mount */}
                  <div
                    ref={threeMountRef}
                    className="w-full h-[240px] rounded-2xl overflow-hidden border border-gray-800 bg-[#0C0D0E] relative cursor-grab"
                  >
                    <div className="absolute bottom-2 left-2 bg-black/80 text-[10px] font-mono text-gray-300 px-2 py-1 rounded-md border border-gray-700 pointer-events-none">
                      Rotating 3D Bathymetric Seafloor Mesh
                    </div>
                  </div>

                  {/* Sliders for Shadow Geometry */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>Acoustic Shadow Length (L_shadow):</span>
                        <span className="font-mono text-[#FFFF23]">{shadowLengthM} meters</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="18.0"
                        step="0.2"
                        value={shadowLengthM}
                        onChange={(e) => setShadowLengthM(Number(e.target.value))}
                        className="w-full accent-[#FFFF23] cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>Slant Range to Target (R_slant):</span>
                        <span className="font-mono text-[#2DD4BF]">{slantRangeM} meters</span>
                      </div>
                      <input
                        type="range"
                        min="10.0"
                        max="50.0"
                        step="0.5"
                        value={slantRangeM}
                        onChange={(e) => setSlantRangeM(Number(e.target.value))}
                        className="w-full accent-[#2DD4BF] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Mathematical Proof Box */}
                  <div className="p-3 bg-black/60 rounded-2xl border border-gray-800 font-mono text-xs text-gray-300 space-y-1">
                    <span className="text-[#2DD4BF] block text-[10px] font-bold">ACOUSTIC SHADOW TRIGONOMETRY:</span>
                    <p className="text-white text-xs">
                      H = (L_shadow × H_alt) / (R_slant + L_shadow) = ({shadowLengthM} × {towfishAltitude}) / ({slantRangeM} + {shadowLengthM}) = <strong className="text-[#FFFF23]">{calculatedDebrisHeightM}m</strong>
                    </p>
                    <span className="text-gray-500 text-[10px] block mt-1">
                      Provides subsea salvage divers with exact vertical clearance and obstruction height!
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PILLAR 3: SYNTHETIC DATA GENERATION VIA SIMULATION */}
      {/* ---------------------------------------------------- */}
      {activeFeature === 'SYNTHETIC' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Synthetic Sonar Ray-Traced Simulator Canvas */}
            <div className="lg:col-span-7 bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-700 border border-purple-300 font-mono text-xs rounded-full font-bold">
                      NeRF / GAN PHYSICS SIMULATOR
                    </span>
                    <h2 className="text-base font-black text-[#1A1A1A]">
                      Synthetic Sonar Acoustic Waterfall Synthesizer
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Solves data scarcity by rendering realistic acoustic specular glint, Rayleigh speckle, and shadow casting
                  </p>
                </div>

                <button
                  onClick={handleGenerateSyntheticBatch}
                  disabled={isGeneratingSynthetic}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121316] text-[#FFFF23] text-xs font-bold rounded-xl hover:bg-black transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingSynthetic ? 'Synthesizing...' : `Generate Batch (${batchCount})`}
                </button>
              </div>

              {/* Rendered Canvas */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#0C0D0E]">
                <canvas ref={syntheticCanvasRef} className="w-full h-auto object-cover" />
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-[#2DD4BF] text-[10px] font-mono px-2.5 py-1 rounded-md border border-[#2DD4BF]/30">
                  {syntheticFreqKhz} kHz • Grazing: {grazingAngleDeg}°
                </div>
              </div>

              {/* Synthetic Annotation Formats */}
              <div className="p-4 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5] space-y-3">
                <span className="text-xs font-bold text-gray-800 block">
                  Ground-Truth Output Formats for Model Training:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { ext: 'YOLOv10 (.txt)', desc: 'Normalized coords with Attention' },
                    { ext: 'COCO (.json)', desc: 'Polygon segmentation masks' },
                    { ext: 'XTF Stream (.xtf)', desc: 'Triton eXtended Sonar pings' },
                    { ext: 'GeoTIFF (.tif)', desc: 'Orthorectified bathymetry' },
                  ].map((fmt, i) => (
                    <div key={i} className="p-2.5 bg-white rounded-xl border border-[#E8E1D5] text-xs">
                      <span className="font-bold text-[#1A1A1A] block">{fmt.ext}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{fmt.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Physics Parameters & Export */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                  <Box className="w-4 h-4 text-purple-600" />
                  Acoustic Physics Simulation Parameters
                </h3>

                {/* 3D Object Model Catalog */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Debris 3D CAD Prototype Model</label>
                  <select
                    value={syntheticDebrisType}
                    onChange={(e) => setSyntheticDebrisType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F9F6F0] border border-[#E8E1D5] rounded-xl text-xs font-bold text-[#1A1A1A] focus:outline-hidden"
                  >
                    <option value="GHOST_NET">Ghost Fishing Net Mass (Polymer Filament)</option>
                    <option value="WIRE_TRAP">Derelict Wire Crab Pot (Wire Mesh Structure)</option>
                    <option value="CONTAINER">Submerged 20ft Shipping Container (Metallic Box)</option>
                    <option value="WRECK">Sunken Timber / Fiberglass Fishing Trawler</option>
                    <option value="DRUM">Corroded 55-Gal Chemical Drum (Cylindrical)</option>
                    <option value="PIPELINE">Subsea Pipeline Section (Linear Anomaly)</option>
                  </select>
                </div>

                {/* Grazing Angle Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Acoustic Grazing Angle (θ):</span>
                    <span className="font-mono text-purple-600">{grazingAngleDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="45.0"
                    step="0.5"
                    value={grazingAngleDeg}
                    onChange={(e) => setGrazingAngleDeg(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>5° (Long Shadows)</span>
                    <span>45° (Steep Incidence)</span>
                  </div>
                </div>

                {/* Acoustic Frequency Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Transducer Acoustic Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { freq: 100, label: '100 kHz', desc: 'Long Range (300m)' },
                      { freq: 455, label: '455 kHz', desc: 'Standard (120m)' },
                      { freq: 900, label: '900 kHz', desc: 'Ultra-Fine (40m)' },
                    ].map((f) => (
                      <button
                        key={f.freq}
                        onClick={() => setSyntheticFreqKhz(f.freq)}
                        className={`p-2 rounded-xl text-center border text-xs transition-all ${
                          syntheticFreqKhz === f.freq
                            ? 'bg-[#121316] text-[#FFFF23] border-[#121316] font-bold'
                            : 'bg-[#F9F6F0] text-gray-700 border-[#E8E1D5]'
                        }`}
                      >
                        <span className="block font-bold">{f.label}</span>
                        <span className="text-[10px] opacity-75">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seafloor Substrate Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Seafloor Sediment Substrate</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'SAND_RIPPLES', name: 'Sand Ripples' },
                      { id: 'MUD', name: 'Soft Silt / Mud' },
                      { id: 'CORAL_RUBBLE', name: 'Coral Rubble' },
                      { id: 'GRAVEL', name: 'Benthic Gravel' },
                    ].map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setSeabedSubstrate(sub.id as any)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          seabedSubstrate === sub.id
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-[#F9F6F0] text-gray-700 border-[#E8E1D5]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export / Batch Download */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const dummyPayload = JSON.stringify({
                        generator: 'MarineSight-NeRF-Sim',
                        debrisType: syntheticDebrisType,
                        grazingAngleDeg,
                        freqKhz: syntheticFreqKhz,
                        samples: batchCount,
                        timestamp: new Date().toISOString()
                      }, null, 2);
                      const blob = new Blob([dummyPayload], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `synthetic_sonar_batch_${syntheticDebrisType.toLowerCase()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-2.5 bg-[#FFFF23] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    Export Synthetic Training Dataset (COCO / YOLO)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PILLAR 4: EDGE-DEPLOYABLE & LOW-BANDWIDTH ARCHITECTURE */}
      {/* ---------------------------------------------------- */}
      {activeFeature === 'EDGE_TELEMETRY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Edge Hardware Benchmarks */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#2DD4BF] font-bold block">
                      AUV ON-BOARD EMBEDDED COMPUTE
                    </span>
                    <h2 className="text-base font-black text-[#1A1A1A]">
                      Edge Model Optimization & Benchmarking
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 font-mono text-xs rounded-full font-bold">
                    &lt; 15W SUBSEA ENVELOPE
                  </span>
                </div>

                {/* Hardware selector */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'JETSON_ORIN_NANO', name: 'NVIDIA Jetson Orin Nano', lat: '11.4 ms', fps: '87.7 FPS', pwr: '10.5W' },
                    { id: 'TENSORRT_INT8', name: 'TensorRT INT8 Quantized', lat: '7.8 ms', fps: '128.2 FPS', pwr: '8.2W' },
                    { id: 'OPENVINO_CPU', name: 'Intel OpenVINO NUC', lat: '18.2 ms', fps: '54.9 FPS', pwr: '14.0W' },
                    { id: 'RASPBERRY_PI5', name: 'Raspberry Pi 5 + Hailo-8', lat: '14.1 ms', fps: '70.9 FPS', pwr: '6.8W' },
                  ].map((hw) => (
                    <button
                      key={hw.id}
                      onClick={() => setSelectedHardware(hw.id as any)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        selectedHardware === hw.id
                          ? 'bg-[#121316] text-[#FFFF23] border-[#121316] shadow-xs'
                          : 'bg-[#F9F6F0] text-gray-700 border-[#E8E1D5]'
                      }`}
                    >
                      <span className="font-bold text-xs block">{hw.name}</span>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono">
                        <span className="text-[#2DD4BF] font-bold">{hw.lat}</span>
                        <span>{hw.fps}</span>
                        <span className="text-emerald-400">{hw.pwr}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Hardware Spec Badges */}
                <div className="p-4 bg-[#121316] text-white rounded-2xl space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Active Target Hardware:</span>
                    <span className="text-[#FFFF23] font-bold">{selectedHardware}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-800">
                    <div className="p-2 bg-black/40 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">INFERENCE</span>
                      <span className="text-sm font-black text-[#2DD4BF]">11.4 ms</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">MEMORY</span>
                      <span className="text-sm font-black text-white">340 MB</span>
                    </div>
                    <div className="p-2 bg-black/40 rounded-xl">
                      <span className="text-[10px] text-gray-400 block">POWER DRAW</span>
                      <span className="text-sm font-black text-emerald-400">10.5 W</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 24-Byte Subsea Acoustic Telemetry Inspector */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block">
                      LOW-BANDWIDTH ACOUSTIC MODEM ENCODER
                    </span>
                    <h2 className="text-base font-black text-[#1A1A1A]">
                      Compact 24-Byte Anomaly Telegram
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 font-mono text-xs rounded-full font-bold">
                    416,666 : 1 COMPRESSION
                  </span>
                </div>

                {/* Raw Hex Packet Viewer */}
                <div className="p-4 bg-[#0C0D0E] text-white rounded-2xl border border-gray-800 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>BINARY TELEGRAM PAYLOAD (24 BYTES):</span>
                    <button
                      onClick={() => handleCopy('53 48 01 01 05 8C 92 B0 4B 42 E1 80 00 8E 00 CD 5E 00 44 68 B1 F0 3A 9C', 'Hex Packet')}
                      className="flex items-center gap-1 text-[#FFFF23] hover:underline"
                    >
                      <Copy className="w-3 h-3" /> Copy Hex
                    </button>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded-xl border border-gray-800 text-[#FFFF23] tracking-widest text-sm font-bold break-all">
                    53 48 01 01 05 8C 92 B0 4B 42 E1 80 00 8E 00 CD 5E 00 44 68 B1 F0 3A 9C
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 pt-1">
                    <span>Header: 0x5348 ('SH')</span>
                    <span>Anomaly: Ghost Net (ID: 01)</span>
                    <span>Lat: {selectedPreset.vesselGps[0]}° N</span>
                    <span>Lng: {selectedPreset.vesselGps[1]}° E</span>
                    <span>Depth: {selectedPreset.targetDepthM}m</span>
                    <span>3D Height: {calculatedDebrisHeightM}m</span>
                  </div>
                </div>

                {/* Acoustic Modem Transmission Simulation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <span>Acoustic Modem Protocol:</span>
                    <select
                      value={telemetryModem}
                      onChange={(e) => setTelemetryModem(e.target.value as any)}
                      className="p-1.5 bg-[#F5F2EB] border border-[#E8E1D5] rounded-xl text-xs font-bold"
                    >
                      <option value="EVOLOGICS_S2C">Evologics S2C (9200 bps • 21ms packet)</option>
                      <option value="WHOI_MICRO_MODEM">WHOI Micro-Modem (1200 bps • 160ms packet)</option>
                      <option value="IRIDIUM_SBD">Iridium SBD Satellite Link (3.5s latency)</option>
                    </select>
                  </div>

                  {/* Progress Bar for Transmission */}
                  {isTransmittingAcoustic && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-gray-500">
                        <span>Acoustic Waveform Propagating (1500 m/s)...</span>
                        <span>{transmissionProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2DD4BF] transition-all duration-200"
                          style={{ width: `${transmissionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {packetVerified && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Surface Vessel ACK Received: CRC-16 Validated (0 Bit Errors). Incident auto-triaged!</span>
                    </div>
                  )}

                  <button
                    onClick={handleTransmitAcoustic}
                    disabled={isTransmittingAcoustic}
                    className="w-full py-2.5 bg-[#121316] text-[#FFFF23] font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors"
                  >
                    <Radio className="w-4 h-4" />
                    {isTransmittingAcoustic ? 'Transmitting Subsea Ping...' : 'Transmit 24-Byte Alert to Vessel'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PILLAR 5: AUTOMATED GEO-REFERENCING & 3D DIGITAL TWIN */}
      {/* ---------------------------------------------------- */}
      {activeFeature === 'GEO_DIGITAL_TWIN' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Interactive Waterfall Click Georeferencer */}
            <div className="lg:col-span-7 bg-white border border-[#E8E1D5] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#2DD4BF] font-bold block">
                    AUTOMATED GEO-REFERENCING ENGINE
                  </span>
                  <h2 className="text-base font-black text-[#1A1A1A]">
                    Click Waterfall Pixel to Convert to WGS84 GPS
                  </h2>
                </div>
                <span className="text-xs font-mono bg-[#F5F2EB] px-2.5 py-1 rounded-lg text-gray-700">
                  Pixel: ({waterfallClickPixel.x}, {waterfallClickPixel.y})
                </span>
              </div>

              {/* Interactive Clickable Canvas / Image */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 640);
                  const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 360);
                  setWaterfallClickPixel({ x: clickX, y: clickY });
                }}
                className="relative rounded-2xl overflow-hidden border border-gray-800 bg-[#0C0D0E] cursor-crosshair"
              >
                <img
                  src={selectedPreset.imageUrl}
                  alt="Sonar Waterfall Georeferencing"
                  className="w-full h-auto object-cover max-h-[340px]"
                />

                {/* Central Nadir Line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-l border-dashed border-[#2DD4BF]/60 pointer-events-none" />

                {/* Click Marker Crosshair */}
                <div
                  className="absolute w-6 h-6 -ml-3 -mt-3 pointer-events-none"
                  style={{
                    left: `${(waterfallClickPixel.x / 640) * 100}%`,
                    top: `${(waterfallClickPixel.y / 360) * 100}%`,
                  }}
                >
                  <div className="w-full h-full border-2 border-[#FFFF23] rounded-full animate-ping" />
                  <div className="absolute inset-1 bg-[#FFFF23] rounded-full" />
                </div>

                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-[#FFFF23] text-[10px] font-mono px-2 py-1 rounded-md border border-gray-700">
                  Click anywhere across swath to calculate true Lat/Long
                </div>
              </div>

              {/* Calculated GPS Output Card */}
              <div className="p-4 bg-[#121316] text-white rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">RESOLVED WGS84 GPS:</span>
                  <button
                    onClick={() => handleCopy(`${georeferenceResult.targetLat}, ${georeferenceResult.targetLng}`, 'GPS Coordinates')}
                    className="flex items-center gap-1 text-[#FFFF23] hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Copy GPS
                  </button>
                </div>
                <div className="p-3 bg-black/60 rounded-xl border border-gray-800 text-lg font-black text-[#2DD4BF] flex items-center justify-between">
                  <span>{georeferenceResult.targetLat}° N, {georeferenceResult.targetLng}° E</span>
                  <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-sm">
                    Depth: {georeferenceResult.depthEstM}m
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-gray-800">
                  <div>
                    <span className="text-gray-500 block text-[10px]">SWATH CHANNEL</span>
                    <span className="text-[#FFFF23] font-bold">{georeferenceResult.channel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">CROSS RANGE</span>
                    <span className="text-white font-bold">{Math.abs(georeferenceResult.crossTrackRangeM)} meters</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">LAYBACK</span>
                    <span className="text-white font-bold">{georeferenceResult.laybackM} meters</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">AZIMUTH</span>
                    <span className="text-[#2DD4BF] font-bold">{georeferenceResult.targetAzimuthDeg}°</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Towfish Navigation Geometry & Digital Twin Controls */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-[#E8E1D5] rounded-3xl p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-[#1A1A1A] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#2DD4BF]" />
                  Vessel & Towfish Telemetry Fusion
                </h3>

                {/* Vessel Heading Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Survey Track Course (Heading):</span>
                    <span className="font-mono text-[#2DD4BF]">{vesselHeadingSlider}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={vesselHeadingSlider}
                    onChange={(e) => setVesselHeadingSlider(Number(e.target.value))}
                    className="w-full accent-[#2DD4BF] cursor-pointer"
                  />
                </div>

                {/* Cable Out Length Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Tow Cable Deployed (L_cable):</span>
                    <span className="font-mono text-[#1A1A1A]">{cableOutLengthM} meters</span>
                  </div>
                  <input
                    type="range"
                    min="15.0"
                    max="60.0"
                    step="0.5"
                    value={cableOutLengthM}
                    onChange={(e) => setCableOutLengthM(Number(e.target.value))}
                    className="w-full accent-[#121316] cursor-pointer"
                  />
                </div>

                {/* Towfish Depth Sensor Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Towfish Depth Sensor (D):</span>
                    <span className="font-mono text-blue-600">{towfishDepthSensorM} meters</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="40.0"
                    step="0.5"
                    value={towfishDepthSensorM}
                    onChange={(e) => setTowfishDepthSensorM(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Pythogorean Layback Formula Box */}
                <div className="p-3 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5] font-mono text-xs space-y-1">
                  <span className="text-gray-500 block text-[10px]">CATENARY / PYTHAGOREAN LAYBACK FORMULA:</span>
                  <code className="text-[#1A1A1A] font-bold block">
                    Layback = sqrt(L_cable^2 - Depth^2) = sqrt({cableOutLengthM}^2 - {towfishDepthSensorM}^2) = {georeferenceResult.laybackM}m
                  </code>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Projects acoustic returns back to true geographic seabed coordinates regardless of towfish distance behind the mother craft.
                  </span>
                </div>

                {/* View on Map Button */}
                <button
                  onClick={() => onNavigate && onNavigate('hotspots')}
                  className="w-full py-2.5 bg-[#FFFF23] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                  View Geo-Referenced Anomaly on Interactive Seafloor Map
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* BOTTOM ACTION BAR: HACKATHON WINNING PRESENTATION BRIEF */}
      {/* ---------------------------------------------------- */}
      <div className="bg-[#121316] border border-[#23262D] rounded-3xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#FFFF23] tracking-wider uppercase">
              SIH 2026 Evaluation Defense
            </span>
            <span className="text-xs text-gray-400">• Why This Beats Standard YOLO Implementations</span>
          </div>
          <p className="text-xs text-gray-300 max-w-3xl leading-relaxed">
            Standard models fail because side-scan sonar contains multiplicative speckle noise, geometric slant-range distortion, and severe subsea acoustic telemetry constraints. MarineSight integrates specialized Lee/Frost filters, 3-head multi-task learning with 3D height extraction, NeRF synthetic data augmentation, and 24-byte acoustic telegrams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('sonar')}
            className="px-4 py-2.5 bg-[#23262D] text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Radar className="w-4 h-4 text-[#2DD4BF]" />
            Return to Sonar Feed
          </button>
          <button
            onClick={() => onNavigate && onNavigate('reports')}
            className="px-4 py-2.5 bg-[#FFFF23] text-black text-xs font-black rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2 shadow-xs"
          >
            Generate Comprehensive PS57 Report
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
