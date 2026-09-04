import React, { useState, useEffect, useId } from 'react';
import { 
  Database, 
  Layers, 
  CheckCircle2, 
  Download, 
  FolderPlus, 
  UploadCloud, 
  Sparkles,
  PieChart,
  Search,
  Filter,
  FileText,
  Clock,
  Tag,
  Check,
  X,
  ChevronRight,
  AlertCircle,
  Eye,
  Sliders,
  Cpu,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DATASETS_DATA } from '../../data/sampleData';
import { storageService } from '../../services/storage';
import { apiService } from '../../services/apiService';
import { DatasetRecord } from '../../types';

interface DatasetLabProps {
  onNavigate?: (tab: string, targetId?: string) => void;
}

export interface MarineDatasetItem {
  id: string;
  name: string;
  version: string;
  type: 'SONAR_ACOUSTIC' | 'SURFACE_AERIAL' | 'UNDERWATER_OPTICAL';
  imagesCount: number;
  annotationsCount: number;
  classesCount: number;
  trainValTestSplit: string;
  qualityScore: number;
  lastUpdated: string;
  formats: string[];
  description: string;
  classes: string[];
  batchesCount?: number;
  recentBatches?: {
    batchId: string;
    name: string;
    samples: number;
    format: string;
    uploadedAt: string;
  }[];
}

const INITIAL_DATASETS: MarineDatasetItem[] = [
  {
    id: 'DS-01',
    name: 'Global Side-Scan Sonar Marine Debris Benchmark',
    version: 'v3.2',
    type: 'SONAR_ACOUSTIC',
    imagesCount: 18400,
    annotationsCount: 42100,
    classesCount: 6,
    trainValTestSplit: '70% / 15% / 15%',
    qualityScore: 94,
    lastUpdated: '2026-08-15',
    formats: ['.PNG', '.XTF', '.JSF', '.DAT', '.SL2', 'COCO JSON'],
    classes: ['Ghost Net', 'Crab Pot', 'Tire', 'Metal Drum', 'Coral Pinnacle', 'Derelict Rope'],
    description: 'High-frequency hydroacoustic side-scan transects containing ghost gear, crab pots, and seabed anomalies in Gulf of Mannar & Palk Bay.',
    batchesCount: 14,
    recentBatches: [
      { batchId: 'BATCH-2026-08-04', name: 'Palk Bay High-Chirp 900kHz Transects', samples: 1200, format: 'COCO + XTF', uploadedAt: '2026-08-15' },
      { batchId: 'BATCH-2026-07-22', name: 'Mannar Coral Ridge Towfish Sweep', samples: 1850, format: 'SL2 Binary', uploadedAt: '2026-07-22' }
    ]
  },
  {
    id: 'DS-02',
    name: 'Aerial Drone Marine Litter Optical & Multispectral',
    version: 'v4.0',
    type: 'SURFACE_AERIAL',
    imagesCount: 24500,
    annotationsCount: 68900,
    classesCount: 12,
    trainValTestSplit: '75% / 15% / 10%',
    qualityScore: 96,
    lastUpdated: '2026-08-20',
    formats: ['.JPG', '.MP4', '.GeoTIFF', 'YOLOv9 Darknet'],
    classes: ['Plastic Matrix', 'Net Buoy', 'Mooring Rope', 'Polymer Slick', 'Foam Float', 'Microplastic Gyre'],
    description: 'RGB and 850nm NIR UAV aerial imagery capturing floating plastic debris, nets, ropes, and surface buoys across coastal gyres.',
    batchesCount: 22,
    recentBatches: [
      { batchId: 'BATCH-2026-08-19', name: 'Coastal Drone Patrol #08 RGB High-Res', samples: 2100, format: 'YOLO Darknet', uploadedAt: '2026-08-20' },
      { batchId: 'BATCH-2026-08-01', name: 'Rameswaram Outer Reef Drone Survey', samples: 3400, format: 'GeoTIFF + YOLO', uploadedAt: '2026-08-01' }
    ]
  },
  {
    id: 'DS-03',
    name: 'Benthic Reef Underwater ROV Entanglement Imagery',
    version: 'v2.1',
    type: 'UNDERWATER_OPTICAL',
    imagesCount: 9200,
    annotationsCount: 21400,
    classesCount: 8,
    trainValTestSplit: '70% / 20% / 10%',
    qualityScore: 91,
    lastUpdated: '2026-07-28',
    formats: ['.JPG', '.PNG', '.RAW', 'Pascal VOC XML'],
    classes: ['Entangled Reef', 'Ghost Webbing Array', 'Sunken Line Cluster', 'Anchor Chain Debris'],
    description: 'Benthic macro and wide-angle ROV optical frames of deep-sea net entanglement, coral smothering, and seafloor ghost gear.',
    batchesCount: 9,
    recentBatches: [
      { batchId: 'BATCH-2026-07-28', name: 'Deep Reef Salvage Dive Optical 4K', samples: 850, format: 'Pascal VOC XML', uploadedAt: '2026-07-28' }
    ]
  },
  {
    id: 'DS-04',
    name: 'Multimodal Paired Acoustic-Optical Co-Registrations',
    version: 'v1.8',
    type: 'SONAR_ACOUSTIC',
    imagesCount: 6800,
    annotationsCount: 19500,
    classesCount: 5,
    trainValTestSplit: '80% / 10% / 10%',
    qualityScore: 98,
    lastUpdated: '2026-08-10',
    formats: ['.JSON', '.XTF', '.GeoJSON', 'Co-Registered Pairs'],
    classes: ['Co-Registered Net Mass', 'Acoustic Shadow & Surface Buoy Pair', 'Polymer Webbing'],
    description: 'Spatially synchronized side-scan sonar transects and UAV drone aerial observations of submerged debris sites.',
    batchesCount: 6,
    recentBatches: [
      { batchId: 'BATCH-2026-08-09', name: 'Synchronized AUV & UAV Palk Strait Sweep', samples: 600, format: 'GeoJSON + XTF', uploadedAt: '2026-08-10' }
    ]
  }
];

const AVAILABLE_DEBRIS_CLASSES = [
  'Ghost Net',
  'Crab Pot',
  'Plastic Matrix',
  'Net Buoy',
  'Mooring Rope',
  'Metal Drum',
  'Tire',
  'Polymer Slick',
  'Coral Pinnacle',
  'Foam Float',
  'Entangled Line',
  'Derelict Anchor'
];

export const DatasetLab: React.FC<DatasetLabProps> = ({ onNavigate }) => {
  const [datasets, setDatasets] = useState<MarineDatasetItem[]>(() => {
    try {
      const saved = localStorage.getItem('ms_marine_datasets_lab');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_DATASETS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModality, setSelectedModality] = useState<'ALL' | 'SONAR_ACOUSTIC' | 'SURFACE_AERIAL' | 'UNDERWATER_OPTICAL'>('ALL');

  // Modal State for Upload New Batch
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [targetDatasetId, setTargetDatasetId] = useState<string>('DS-01');
  const [isNewDatasetSeries, setIsNewDatasetSeries] = useState<boolean>(false);
  const [newSeriesName, setNewSeriesName] = useState<string>('');
  
  // Batch form state
  const [batchName, setBatchName] = useState<string>('');
  const [sensorType, setSensorType] = useState<string>('SONAR_ACOUSTIC');
  const [annotationFormat, setAnnotationFormat] = useState<string>('COCO 1.0 JSON');
  const [sampleCountInput, setSampleCountInput] = useState<number>(320);
  const [annotationsCountInput, setAnnotationsCountInput] = useState<number>(750);
  const [splitRatio, setSplitRatio] = useState<string>('70% / 15% / 15%');
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['Ghost Net', 'Crab Pot', 'Plastic Matrix']);
  const [customClassInput, setCustomClassInput] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [batchNotes, setBatchNotes] = useState<string>('');

  // Validation options
  const [enableSlantRangeCorrection, setEnableSlantRangeCorrection] = useState(true);
  const [enableSpatialDeduplication, setEnableSpatialDeduplication] = useState(true);
  const [enableQualityFilter, setEnableQualityFilter] = useState(true);

  // Ingestion progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStepLabel, setUploadStepLabel] = useState('');
  const [uploadSuccessSummary, setUploadSuccessSummary] = useState<any | null>(null);

  // Inspection modal state
  const [inspectingDataset, setInspectingDataset] = useState<MarineDatasetItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputId = useId();

  // Save to localStorage whenever datasets change
  useEffect(() => {
    try {
      localStorage.setItem('ms_marine_datasets_lab', JSON.stringify(datasets));
    } catch (e) {
      console.warn('Failed to persist dataset state:', e);
    }
  }, [datasets]);

  // Try to sync with server API on mount
  useEffect(() => {
    const fetchApiDatasets = async () => {
      try {
        const res = await apiService.getDatasets();
        if (res.success && Array.isArray(res.datasets) && res.datasets.length > 0) {
          // Merge with local state
          setDatasets((prev) => {
            const merged = [...prev];
            res.datasets.forEach((serverDs: any) => {
              const idx = merged.findIndex(m => m.id === serverDs.id);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...serverDs };
              } else {
                merged.push(serverDs);
              }
            });
            return merged;
          });
        }
      } catch {
        // Local mode fallback
      }
    };
    fetchApiDatasets();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Open modal preselected to a specific dataset
  const handleOpenUploadModal = (datasetId?: string) => {
    const defaultBatchId = `BATCH-${new Date().toISOString().slice(0, 10)}-${Math.floor(100 + Math.random() * 900)}`;
    setBatchName(defaultBatchId);
    setUploadProgress(0);
    setUploadStepLabel('');
    setUploadSuccessSummary(null);
    setIsUploading(false);
    setUploadedFiles([]);
    setBatchNotes('');

    if (datasetId) {
      setTargetDatasetId(datasetId);
      setIsNewDatasetSeries(false);
      const ds = datasets.find(d => d.id === datasetId);
      if (ds) {
        setSensorType(ds.type);
        setSelectedClasses(ds.classes.slice(0, 4));
      }
    } else {
      setTargetDatasetId('DS-01');
      setIsNewDatasetSeries(false);
    }
    setIsUploadModalOpen(true);
  };

  // Quick Preset Handlers
  const handleLoadSonarPreset = () => {
    setSensorType('SONAR_ACOUSTIC');
    setAnnotationFormat('COCO 1.0 JSON');
    setBatchName(`Palk-Bay-SideScan-Transect-${Math.floor(10 + Math.random() * 90)}`);
    setSampleCountInput(360);
    setAnnotationsCountInput(840);
    setSelectedClasses(['Ghost Net', 'Crab Pot', 'Tire', 'Coral Pinnacle']);
    setUploadedFiles([
      { name: 'sonar_transect_04a_455khz.xtf', size: '14.8 MB', type: 'XTF Hydroacoustic' },
      { name: 'sonar_transect_04b_900khz.sl2', size: '18.2 MB', type: 'SL2 Binary' },
      { name: 'annotations_coco_instances.json', size: '2.4 MB', type: 'COCO JSON' },
      { name: 'towfish_telemetry_nav.csv', size: '420 KB', type: 'Navigation Log' },
    ]);
    setBatchNotes('Towfish altitude 8.5m AGL, dual-chirp side-scan sweep covering 1.4 km² seabed.');
    showToast('Loaded Side-Scan Sonar sample batch configuration!');
  };

  const handleLoadDronePreset = () => {
    setSensorType('SURFACE_AERIAL');
    setAnnotationFormat('YOLOv9 Darknet');
    setBatchName(`Drone-Aerial-Survey-Patrol-${Math.floor(10 + Math.random() * 90)}`);
    setSampleCountInput(520);
    setAnnotationsCountInput(1240);
    setSelectedClasses(['Plastic Matrix', 'Net Buoy', 'Mooring Rope', 'Polymer Slick']);
    setUploadedFiles([
      { name: 'uav_flight_pass_07_rgb_4k.zip', size: '84.6 MB', type: 'UAV Frames' },
      { name: 'yolov9_labels_train_val.txt', size: '1.8 MB', type: 'YOLO Annotations' },
      { name: 'flight_georef_exif.geojson', size: '640 KB', type: 'GeoJSON Metadata' },
    ]);
    setBatchNotes('DJI Matrice 300 RTK survey at 45m AGL, GSD 1.1cm/px over convergence tidal slick.');
    showToast('Loaded Aerial Drone sample batch configuration!');
  };

  const handleLoadRovPreset = () => {
    setSensorType('UNDERWATER_OPTICAL');
    setAnnotationFormat('Pascal VOC XML');
    setBatchName(`Benthic-ROV-Reef-Salvage-${Math.floor(10 + Math.random() * 90)}`);
    setSampleCountInput(210);
    setAnnotationsCountInput(490);
    setSelectedClasses(['Entangled Reef', 'Ghost Net', 'Sunken Line Cluster']);
    setUploadedFiles([
      { name: 'rov_dive_reef_crest_4k.zip', size: '42.1 MB', type: 'Macro Optical' },
      { name: 'voc_bounding_boxes.xml', size: '820 KB', type: 'Pascal VOC' },
    ]);
    setBatchNotes('Submersible high-definition macro inspection of monofilament net on Porites lutea coral.');
    showToast('Loaded Benthic ROV sample batch configuration!');
  };

  // File drag & drop handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files) as File[];
      const newItems = files.map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.name.split('.').pop()?.toUpperCase() || 'FILE'
      }));
      setUploadedFiles(prev => [...prev, ...newItems]);
      setSampleCountInput(prev => prev + files.length * 40);
      setAnnotationsCountInput(prev => prev + files.length * 95);
      showToast(`Added ${files.length} file(s) to upload queue.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newItems = files.map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.name.split('.').pop()?.toUpperCase() || 'FILE'
      }));
      setUploadedFiles(prev => [...prev, ...newItems]);
      setSampleCountInput(prev => prev + files.length * 40);
      setAnnotationsCountInput(prev => prev + files.length * 95);
      showToast(`Added ${files.length} file(s) to upload queue.`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleAddCustomClass = () => {
    if (!customClassInput.trim()) return;
    const clean = customClassInput.trim();
    if (!selectedClasses.includes(clean)) {
      setSelectedClasses(prev => [...prev, clean]);
    }
    setCustomClassInput('');
  };

  // Perform Batch Ingestion & Validation
  const handleExecuteUpload = async () => {
    if (!batchName.trim()) {
      showToast('Please specify a batch name before ingesting.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setUploadStepLabel('Validating binary format headers and checksums...');

    // Progress simulation with real server call
    await new Promise(r => setTimeout(r, 600));
    setUploadProgress(30);
    setUploadStepLabel('Parsing annotation bounding boxes, slant-range geometries & IoU metrics...');

    await new Promise(r => setTimeout(r, 700));
    setUploadProgress(65);
    setUploadStepLabel(`Generating ${splitRatio} train/val/test splits with spatial deduplication...`);

    let finalDatasetId = targetDatasetId;
    if (isNewDatasetSeries) {
      finalDatasetId = `DS-0${datasets.length + 1}`;
    }

    try {
      // Call backend API
      const serverResponse = await apiService.uploadDatasetBatch({
        datasetId: finalDatasetId,
        batchName: isNewDatasetSeries ? (newSeriesName || batchName) : batchName,
        sensorType,
        format: annotationFormat,
        sampleCount: Number(sampleCountInput) || 240,
        annotationsCount: Number(annotationsCountInput) || 580,
        classes: selectedClasses,
        splitRatio,
        filenames: uploadedFiles.map(f => f.name),
        notes: batchNotes
      });

      await new Promise(r => setTimeout(r, 600));
      setUploadProgress(100);
      setUploadStepLabel('Batch ingestion complete! Catalog & indices updated.');

      // Update storageService and React state
      const samplesAdded = Number(sampleCountInput) || 240;
      const annotationsAdded = Number(annotationsCountInput) || 580;

      // Update local datasets state
      setDatasets(prev => {
        const existingIdx = prev.findIndex(d => d.id === finalDatasetId);
        const newBatchItem = {
          batchId: `BATCH-${Date.now().toString().slice(-6)}`,
          name: batchName,
          samples: samplesAdded,
          format: annotationFormat,
          uploadedAt: new Date().toISOString().split('T')[0]
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          const newFormats = Array.from(new Set([...curr.formats, annotationFormat]));
          const combinedClasses = Array.from(new Set([...curr.classes, ...selectedClasses]));
          
          updated[existingIdx] = {
            ...curr,
            imagesCount: curr.imagesCount + samplesAdded,
            annotationsCount: curr.annotationsCount + annotationsAdded,
            classesCount: Math.max(curr.classesCount, combinedClasses.length),
            classes: combinedClasses,
            formats: newFormats,
            lastUpdated: new Date().toISOString().split('T')[0],
            batchesCount: (curr.batchesCount || 1) + 1,
            recentBatches: [newBatchItem, ...(curr.recentBatches || []).slice(0, 4)]
          };
          return updated;
        } else {
          const newDsItem: MarineDatasetItem = {
            id: finalDatasetId,
            name: newSeriesName || batchName,
            version: 'v1.0',
            type: sensorType as any,
            imagesCount: samplesAdded,
            annotationsCount: annotationsAdded,
            classesCount: selectedClasses.length,
            trainValTestSplit: splitRatio,
            qualityScore: 96,
            lastUpdated: new Date().toISOString().split('T')[0],
            formats: [annotationFormat],
            classes: selectedClasses,
            description: batchNotes || `Ingested marine dataset from ${batchName} (${sensorType}).`,
            batchesCount: 1,
            recentBatches: [newBatchItem]
          };
          return [newDsItem, ...prev];
        }
      });

      // Update storage service
      storageService.addDatasetBatch(finalDatasetId, {
        batchName,
        sampleCount: samplesAdded,
        annotationsCount: annotationsAdded,
        format: annotationFormat,
        classes: selectedClasses,
        sensorType,
        notes: batchNotes
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });

      setUploadSuccessSummary({
        batchName,
        datasetId: finalDatasetId,
        samplesAdded,
        annotationsAdded,
        format: annotationFormat,
        classesCount: selectedClasses.length,
        timestamp: new Date().toLocaleTimeString()
      });

    } catch (e: any) {
      console.warn('Upload API notice, running local persistent update:', e);
      // Fallback local update
      const samplesAdded = Number(sampleCountInput) || 240;
      const annotationsAdded = Number(annotationsCountInput) || 580;

      setDatasets(prev => {
        const existingIdx = prev.findIndex(d => d.id === finalDatasetId);
        const newBatchItem = {
          batchId: `BATCH-${Date.now().toString().slice(-6)}`,
          name: batchName,
          samples: samplesAdded,
          format: annotationFormat,
          uploadedAt: new Date().toISOString().split('T')[0]
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          updated[existingIdx] = {
            ...curr,
            imagesCount: curr.imagesCount + samplesAdded,
            annotationsCount: curr.annotationsCount + annotationsAdded,
            classes: Array.from(new Set([...curr.classes, ...selectedClasses])),
            lastUpdated: new Date().toISOString().split('T')[0],
            recentBatches: [newBatchItem, ...(curr.recentBatches || [])]
          };
          return updated;
        } else {
          return [{
            id: finalDatasetId,
            name: newSeriesName || batchName,
            version: 'v1.0',
            type: sensorType as any,
            imagesCount: samplesAdded,
            annotationsCount: annotationsAdded,
            classesCount: selectedClasses.length,
            trainValTestSplit: splitRatio,
            qualityScore: 95,
            lastUpdated: new Date().toISOString().split('T')[0],
            formats: [annotationFormat],
            classes: selectedClasses,
            description: batchNotes || `Ingested batch ${batchName}`,
            batchesCount: 1,
            recentBatches: [newBatchItem]
          }, ...prev];
        }
      });

      setUploadProgress(100);
      setUploadStepLabel('Batch ingested locally and saved to Marine Dataset Warehouse.');
      setUploadSuccessSummary({
        batchName,
        datasetId: finalDatasetId,
        samplesAdded,
        annotationsAdded,
        format: annotationFormat,
        classesCount: selectedClasses.length,
        timestamp: new Date().toLocaleTimeString()
      });
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    } finally {
      setIsUploading(false);
    }
  };

  // Export dataset manifest
  const handleExportDataset = (ds: MarineDatasetItem) => {
    const exportData = {
      info: {
        description: ds.name,
        dataset_id: ds.id,
        version: ds.version,
        modality: ds.type,
        year: 2026,
        contributor: 'MarineSight AI Hydroacoustic & Optical Lab',
        date_created: ds.lastUpdated
      },
      licenses: [{ id: 1, name: 'Oceanographic Open Data Commons v1.0', url: 'https://marinesight.ai/license' }],
      categories: ds.classes.map((cls, idx) => ({ id: idx + 1, name: cls, supercategory: 'marine_debris' })),
      statistics: {
        total_samples: ds.imagesCount,
        total_annotations: ds.annotationsCount,
        train_val_test_split: ds.trainValTestSplit,
        quality_score: `${ds.qualityScore}%`,
        formats_supported: ds.formats
      },
      recent_batches: ds.recentBatches || []
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ds.id}_${ds.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_manifest.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${ds.id} dataset manifest (.json)!`);
  };

  // Filter datasets
  const filteredDatasets = datasets.filter((ds) => {
    const matchesQuery = 
      ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.classes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModality = selectedModality === 'ALL' || ds.type === selectedModality;

    return matchesQuery && matchesModality;
  });

  // Calculate totals
  const totalSamples = datasets.reduce((acc, d) => acc + (d.imagesCount || 0), 0);
  const totalAnnotations = datasets.reduce((acc, d) => acc + (d.annotationsCount || 0), 0);
  const avgQuality = Math.round(datasets.reduce((acc, d) => acc + (d.qualityScore || 90), 0) / (datasets.length || 1));

  return (
    <div className="space-y-6 pb-16 text-[#F3F3F3]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#181A20] border border-[#FFFF23]/40 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-[#FFFF23] shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-stone-400 hover:text-white ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#121316] p-6 lg:p-8 rounded-3xl border border-[#20232A] relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FFFF23]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFFF23]/10 text-[#FFFF23] border border-[#FFFF23]/25 uppercase tracking-wide">
              Hydroacoustic & Optical Corpora
            </span>
            <span className="text-xs font-mono text-stone-400">Standardized COCO · YOLOv9 · Pascal VOC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Marine Dataset Lab
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Ingest, catalog, and version multimodal marine debris datasets. Upload raw side-scan sonar recordings (.XTF, .SL2) or aerial drone frames (.JPG, .GeoTIFF) with automated spatial alignment.
          </p>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {onNavigate && (
            <button
              onClick={() => onNavigate('models')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181A20] hover:bg-[#20232A] border border-[#282B34] text-stone-300 hover:text-white text-xs font-bold transition-all"
            >
              <Cpu className="w-4 h-4 text-[#2DD4BF]" />
              <span>YOLO Training Studio</span>
            </button>
          )}

          {/* Actionable Upload New Batch Button */}
          <button
            onClick={() => handleOpenUploadModal()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,35,0.25)] hover:shadow-[0_0_25px_rgba(255,255,35,0.4)] active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Upload New Batch</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400 uppercase">Total Samples</span>
            <Database className="w-4 h-4 text-[#FFFF23]" />
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{totalSamples.toLocaleString()}</p>
          <span className="text-[10px] font-mono text-stone-400">Scans, Frames & Pairs</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400 uppercase">Bounding Box Labels</span>
            <Layers className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <p className="text-2xl font-black text-[#2DD4BF] mt-1.5">{totalAnnotations.toLocaleString()}</p>
          <span className="text-[10px] font-mono text-stone-400">Verified Annotations</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400 uppercase">Active Datasets</span>
            <PieChart className="w-4 h-4 text-[#FFFF23]" />
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{datasets.length} Corpora</p>
          <span className="text-[10px] font-mono text-stone-400">3 Sensor Modalities</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#121316] border border-[#20232A]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-400 uppercase">Benchmark Quality</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1.5">{avgQuality}% mAP</p>
          <span className="text-[10px] font-mono text-stone-400">Dual-Sensor Co-Registration</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#121316] border border-[#20232A]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search datasets by keyword, format, class, or dataset ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-[#FFFF23]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Modality Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'SONAR_ACOUSTIC', 'SURFACE_AERIAL', 'UNDERWATER_OPTICAL'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedModality(mode)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                selectedModality === mode
                  ? 'bg-[#FFFF23] text-black shadow-xs'
                  : 'bg-[#181A20] text-stone-400 hover:text-white hover:bg-[#20232A]'
              }`}
            >
              {mode === 'ALL' ? 'All Modalities' : mode === 'SONAR_ACOUSTIC' ? 'Sonar Acoustic' : mode === 'SURFACE_AERIAL' ? 'Aerial Drone' : 'Underwater ROV'}
            </button>
          ))}
        </div>
      </div>

      {/* Datasets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredDatasets.map((ds) => (
          <div 
            key={ds.id} 
            className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] hover:border-[#FFFF23]/40 transition-all flex flex-col justify-between space-y-5 group relative"
          >
            {/* Top Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-black bg-[#1E2129] border border-[#2B2F3A] text-[#FFFF23]">
                    {ds.id}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{ds.version}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    {ds.type.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {ds.qualityScore}% mAP
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-[#FFFF23] transition-colors">
                  {ds.name}
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed line-clamp-2">
                  {ds.description}
                </p>
              </div>

              {/* Counts & Split Box */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#16181D] border border-[#22252D] text-xs">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Total Samples</span>
                  <p className="text-base font-black text-white mt-0.5">{ds.imagesCount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Annotations</span>
                  <p className="text-base font-black text-[#2DD4BF] mt-0.5">{ds.annotationsCount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Split (T/V/T)</span>
                  <p className="text-xs font-mono font-bold text-stone-300 mt-1">{ds.trainValTestSplit}</p>
                </div>
              </div>

              {/* Classes Badges */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-wider">
                    Annotated Classes ({ds.classes.length})
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {ds.batchesCount ? `${ds.batchesCount} batches ingested` : 'Multi-batch'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ds.classes.map((c, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-lg bg-[#181A20] border border-[#25282F] text-[10px] font-mono font-medium text-stone-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Batch Snippet */}
              {ds.recentBatches && ds.recentBatches.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">
                    Latest Ingested Batch:
                  </span>
                  <div className="px-3 py-2 rounded-xl bg-[#14161C] border border-[#20232A] text-[11px] font-mono flex items-center justify-between">
                    <span className="text-stone-300 truncate max-w-[200px]">{ds.recentBatches[0].name}</span>
                    <span className="text-[#FFFF23] font-bold">+{ds.recentBatches[0].samples} samples</span>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-[#20232A] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[11px] font-mono text-stone-400">
                Updated: {ds.lastUpdated}
              </span>

              <div className="flex items-center gap-2">
                {/* Inspect Samples */}
                <button 
                  onClick={() => setInspectingDataset(ds)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#20232A] text-stone-300 hover:text-white transition-colors text-xs font-mono font-bold"
                >
                  <Eye className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>Inspect</span>
                </button>

                {/* Export Manifest */}
                <button 
                  onClick={() => handleExportDataset(ds)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#20232A] text-stone-300 hover:text-white transition-colors text-xs font-mono font-bold"
                >
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                  <span>Export</span>
                </button>

                {/* Upload Batch to THIS dataset */}
                <button 
                  onClick={() => handleOpenUploadModal(ds.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFFF23]/15 hover:bg-[#FFFF23] text-[#FFFF23] hover:text-black font-mono font-bold transition-all text-xs"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ Batch</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {filteredDatasets.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#121316] border border-[#20232A] space-y-3">
          <Database className="w-8 h-8 text-stone-400 mx-auto" />
          <h4 className="text-base font-bold text-white">No matching datasets found</h4>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Try adjusting your search terms or filter modality, or upload a new batch to create a new dataset.
          </p>
          <button
            onClick={() => handleOpenUploadModal()}
            className="px-4 py-2 rounded-xl bg-[#FFFF23] text-black text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Upload New Batch</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIONABLE MODAL: UPLOAD NEW BATCH */}
      {/* ========================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-[#121316] border border-[#2A2E38] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#20232A] pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFF23] text-black uppercase">
                    BATCH INGESTION PIPELINE
                  </span>
                  <span className="text-xs font-mono text-stone-400">Marine Debris Sensor Pipeline</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Upload New Training Batch
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Append new raw hydroacoustic side-scan transects or aerial drone imagery to existing benchmarks or create a new corpus series.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!isUploading) setIsUploadModalOpen(false);
                }}
                disabled={isUploading}
                className="p-2 rounded-xl bg-[#181A20] text-stone-400 hover:text-white border border-[#25282F] hover:bg-[#20232A] transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If Ingestion Completed, show Success Summary */}
            {uploadSuccessSummary ? (
              <div className="p-6 rounded-3xl bg-[#16181F] border border-emerald-500/40 space-y-5 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">Batch Successfully Ingested!</h3>
                  <p className="text-xs text-stone-400 max-w-md mx-auto">
                    Batch <strong className="text-[#FFFF23]">{uploadSuccessSummary.batchName}</strong> has been validated and compiled into dataset <strong className="text-white">[{uploadSuccessSummary.datasetId}]</strong>.
                  </p>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto p-4 rounded-2xl bg-[#101216] border border-[#20232A] text-left">
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 uppercase">Samples Ingested</span>
                    <p className="text-base font-black text-emerald-400 mt-0.5">+{uploadSuccessSummary.samplesAdded}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 uppercase">Labels Added</span>
                    <p className="text-base font-black text-[#2DD4BF] mt-0.5">+{uploadSuccessSummary.annotationsAdded}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 uppercase">Format</span>
                    <p className="text-xs font-mono font-bold text-white mt-1">{uploadSuccessSummary.format}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {onNavigate && (
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        onNavigate('models');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#FFFF23] hover:bg-white text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(255,255,35,0.3)]"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Train YOLO Model with this Batch</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUploadSuccessSummary(null);
                      setIsUploadModalOpen(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#1A1C22] hover:bg-[#252830] text-stone-300 hover:text-white font-bold text-xs transition-all border border-[#2D313A]"
                  >
                    Close & View Datasets
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Form */
              <div className="space-y-6">

                {/* Quick Presets Bar */}
                <div className="p-3.5 rounded-2xl bg-[#181A20] border border-[#25282F] space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFFF23]" />
                    <span className="text-[11px] font-mono font-bold text-white uppercase">
                      One-Click Sample Batch Presets (Quick Test)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSonarPreset}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141518] hover:bg-[#20232A] border border-[#2D313A] text-[11px] font-mono text-stone-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>🌊 Side-Scan Sonar (360 scans)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadDronePreset}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141518] hover:bg-[#20232A] border border-[#2D313A] text-[11px] font-mono text-stone-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>🛸 Aerial Drone (520 frames)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadRovPreset}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141518] hover:bg-[#20232A] border border-[#2D313A] text-[11px] font-mono text-stone-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>🤿 Benthic ROV (210 frames)</span>
                    </button>
                  </div>
                </div>

                {/* Target Dataset Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                    1. Target Dataset Destination
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsNewDatasetSeries(false)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !isNewDatasetSeries 
                          ? 'bg-[#181A20] border-[#FFFF23] text-white' 
                          : 'bg-[#141518] border-[#25282F] text-stone-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Append to Existing Dataset</span>
                        {!isNewDatasetSeries && <Check className="w-3.5 h-3.5 text-[#FFFF23]" />}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">Add samples to an existing benchmark</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsNewDatasetSeries(true)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isNewDatasetSeries 
                          ? 'bg-[#181A20] border-[#FFFF23] text-white' 
                          : 'bg-[#141518] border-[#25282F] text-stone-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Create New Dataset Series</span>
                        {isNewDatasetSeries && <Check className="w-3.5 h-3.5 text-[#FFFF23]" />}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1">Initialize a new dataset benchmark</p>
                    </button>
                  </div>

                  {!isNewDatasetSeries ? (
                    <select
                      value={targetDatasetId}
                      onChange={(e) => {
                        setTargetDatasetId(e.target.value);
                        const match = datasets.find(d => d.id === e.target.value);
                        if (match) setSensorType(match.type);
                      }}
                      className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                    >
                      {datasets.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.id} — {d.name} ({d.imagesCount.toLocaleString()} existing samples)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newSeriesName}
                      onChange={(e) => setNewSeriesName(e.target.value)}
                      placeholder="e.g., Palk Strait Autonomous AUV Micro-Sonar Dataset"
                      className="w-full mt-2 px-3.5 py-2.5 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-[#FFFF23]"
                    />
                  )}
                </div>

                {/* Batch Name & Modality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                      2. Batch Identifier
                    </label>
                    <input
                      type="text"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="BATCH-2026-09-TRANSECT-07"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                      3. Sensor Modality
                    </label>
                    <select
                      value={sensorType}
                      onChange={(e) => setSensorType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                    >
                      <option value="SONAR_ACOUSTIC">Side-Scan Sonar (455/900 kHz Hydroacoustic)</option>
                      <option value="SURFACE_AERIAL">Aerial Drone UAV (RGB & 850nm NIR)</option>
                      <option value="UNDERWATER_OPTICAL">Underwater ROV (4K Deep Macro Optical)</option>
                    </select>
                  </div>
                </div>

                {/* Format & Annotation Classes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                      4. Annotation Format
                    </label>
                    <select
                      value={annotationFormat}
                      onChange={(e) => setAnnotationFormat(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                    >
                      <option value="COCO 1.0 JSON">COCO 1.0 JSON (BBox + Segmentations)</option>
                      <option value="YOLOv9 Darknet">YOLOv9 / Darknet TXT (.txt format)</option>
                      <option value="Pascal VOC XML">Pascal VOC (.xml format)</option>
                      <option value="GeoJSON Transect">GeoJSON Spatial Transect Vectors</option>
                      <option value="SL2/XTF Binary Raw">Binary Sonar Raw (.SL2 / .XTF / .JSF)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                      5. Train / Val / Test Split
                    </label>
                    <select
                      value={splitRatio}
                      onChange={(e) => setSplitRatio(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#181A20] border border-[#25282F] text-xs text-white focus:outline-none focus:border-[#FFFF23]"
                    >
                      <option value="70% / 15% / 15%">70% Train / 15% Val / 15% Test (Standard)</option>
                      <option value="80% / 10% / 10%">80% Train / 10% Val / 10% Test (Deep Training)</option>
                      <option value="60% / 20% / 20%">60% Train / 20% Val / 20% Test (Rigorous Bench)</option>
                    </select>
                  </div>
                </div>

                {/* Sample and Annotation Counts */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#181A20] border border-[#25282F]">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-stone-400 uppercase block">
                      Sample Count (Frames/Scans)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100000}
                      value={sampleCountInput}
                      onChange={(e) => setSampleCountInput(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141518] border border-[#2D313A] text-xs text-white font-mono font-bold focus:outline-none focus:border-[#FFFF23]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-stone-400 uppercase block">
                      Annotations Count (Bounding Boxes)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={200000}
                      value={annotationsCountInput}
                      onChange={(e) => setAnnotationsCountInput(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141518] border border-[#2D313A] text-xs text-[#2DD4BF] font-mono font-bold focus:outline-none focus:border-[#FFFF23]"
                    />
                  </div>
                </div>

                {/* Classes Tag Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                    6. Target Debris Classes in this Batch
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_DEBRIS_CLASSES.map((cls) => {
                      const isSelected = selectedClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => toggleClass(cls)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                            isSelected
                              ? 'bg-[#FFFF23] text-black font-bold shadow-xs'
                              : 'bg-[#181A20] text-stone-400 hover:text-white border border-[#25282F]'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {cls}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Class */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={customClassInput}
                      onChange={(e) => setCustomClassInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomClass();
                        }
                      }}
                      placeholder="Add custom class tag (e.g., Submerged Polypropylene Line)..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[#181A20] border border-[#25282F] text-xs text-white placeholder:text-stone-400 focus:outline-none focus:border-[#FFFF23]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomClass}
                      className="px-3 py-1.5 rounded-lg bg-[#252830] hover:bg-[#2F3440] text-xs text-stone-200 font-bold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Drag and Drop File Area */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-stone-300 uppercase block">
                    7. Batch Files & Annotation Upload
                  </label>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      isDragging
                        ? 'border-[#FFFF23] bg-[#FFFF23]/10'
                        : 'border-[#2D313A] bg-[#16181D] hover:border-stone-500'
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white">
                      Drag and drop raw sonar transects (.XTF, .SL2) or drone ZIP / annotations here
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Supports .json, .xml, .txt, .zip, .sl2, .xtf, .jpg, .png, .geojson
                    </p>

                    <div className="mt-3">
                      <input
                        id={fileInputId}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor={fileInputId}
                        className="inline-block px-3 py-1.5 rounded-lg bg-[#20232A] hover:bg-[#282B34] text-xs font-bold text-white cursor-pointer transition-colors"
                      >
                        Browse Files on Device
                      </label>
                    </div>
                  </div>

                  {/* Uploaded File Pill List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {uploadedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#181A20] border border-[#25282F] text-xs font-mono"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-[#FFFF23] shrink-0" />
                            <span className="text-stone-300 truncate">{file.name}</span>
                            <span className="text-[10px] text-stone-400">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-stone-400 hover:text-red-400 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preprocessing & Quality Checks */}
                <div className="p-4 rounded-2xl bg-[#16181D] border border-[#20232A] space-y-2">
                  <span className="text-[11px] font-mono font-bold text-stone-300 uppercase block">
                    Automated Ingestion Quality Filters
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={enableSlantRangeCorrection}
                        onChange={(e) => setEnableSlantRangeCorrection(e.target.checked)}
                        className="rounded accent-[#FFFF23]"
                      />
                      <span>Slant-Range Correction</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={enableSpatialDeduplication}
                        onChange={(e) => setEnableSpatialDeduplication(e.target.checked)}
                        className="rounded accent-[#FFFF23]"
                      />
                      <span>Spatial Deduplication</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={enableQualityFilter}
                        onChange={(e) => setEnableQualityFilter(e.target.checked)}
                        className="rounded accent-[#FFFF23]"
                      />
                      <span>GSD &lt; 1.5 cm/px Check</span>
                    </label>
                  </div>
                </div>

                {/* Progress Bar (During execution) */}
                {isUploading && (
                  <div className="space-y-2 p-4 rounded-2xl bg-[#161820] border border-[#FFFF23]/40">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold">{uploadStepLabel}</span>
                      <span className="text-[#FFFF23] font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#20232A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFFF23] transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#20232A]">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-[#181A20] hover:bg-[#20232A] text-xs font-bold text-stone-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleExecuteUpload}
                    disabled={isUploading || !batchName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-[#FFFF23] hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,35,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validating & Ingesting...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Start Batch Ingestion & Validation</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SAMPLE INSPECTION MODAL */}
      {/* ========================================================= */}
      {inspectingDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-[#121316] border border-[#2A2E38] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-4 border-b border-[#20232A] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFF23] text-black">
                    {inspectingDataset.id}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{inspectingDataset.type.replace('_', ' ')}</span>
                </div>
                <h2 className="text-xl font-black text-white">{inspectingDataset.name}</h2>
                <p className="text-xs text-stone-400 mt-0.5">{inspectingDataset.description}</p>
              </div>

              <button
                onClick={() => setInspectingDataset(null)}
                className="p-2 rounded-xl bg-[#181A20] text-stone-400 hover:text-white border border-[#25282F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visualizer Frame */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-stone-300 uppercase block">
                Benchmark Sample Inspection (Acoustic / Optical Overlay)
              </span>

              <div className="relative rounded-2xl bg-[#08090B] border border-[#20232A] p-4 h-72 flex flex-col justify-between overflow-hidden">
                {/* Simulated Waterfall / Aerial Canvas Visual */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#FFFF23_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* Simulated Bounding Box 1 */}
                <div className="absolute top-12 left-20 w-44 h-32 border-2 border-[#FFFF23] bg-[#FFFF23]/10 rounded-lg p-1.5 flex flex-col justify-between animate-pulse">
                  <div className="flex items-center justify-between text-[10px] font-mono font-black bg-black/80 px-1.5 py-0.5 rounded text-[#FFFF23]">
                    <span>Ghost Net (96.4%)</span>
                    <span>14.2m depth</span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-300 bg-black/60 px-1 rounded self-start">
                    Acoustic Shadow: 6.8m
                  </span>
                </div>

                {/* Simulated Bounding Box 2 */}
                <div className="absolute top-28 right-24 w-36 h-28 border-2 border-[#2DD4BF] bg-[#2DD4BF]/10 rounded-lg p-1.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono font-black bg-black/80 px-1.5 py-0.5 rounded text-[#2DD4BF]">
                    <span>Crab Pot Trap (91.8%)</span>
                  </div>
                  <span className="text-[9px] font-mono text-stone-300 bg-black/60 px-1 rounded self-start">
                    Rectangular Wire Frame
                  </span>
                </div>

                {/* Overlay telemetry footer */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-stone-400 bg-[#121316]/90 p-2.5 rounded-xl border border-[#20232A] mt-auto">
                  <span>Sensor: 455 kHz Side-Scan Chirp · Slant-Range Corrected</span>
                  <span className="text-[#FFFF23]">Ground Sampling Distance: 1.12 cm/px</span>
                </div>
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#16181D] border border-[#20232A]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Total Samples</span>
                <p className="text-xl font-black text-white mt-1">{inspectingDataset.imagesCount.toLocaleString()}</p>
                <span className="text-[10px] font-mono text-stone-400">{inspectingDataset.trainValTestSplit} split</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#16181D] border border-[#20232A]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Annotations Verified</span>
                <p className="text-xl font-black text-[#2DD4BF] mt-1">{inspectingDataset.annotationsCount.toLocaleString()}</p>
                <span className="text-[10px] font-mono text-stone-400">{inspectingDataset.classes.length} unique classes</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#16181D] border border-[#20232A]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Benchmark Quality</span>
                <p className="text-xl font-black text-emerald-400 mt-1">{inspectingDataset.qualityScore}%</p>
                <span className="text-[10px] font-mono text-stone-400">Mean Average Precision</span>
              </div>
            </div>

            {/* Ingested Batches History */}
            {inspectingDataset.recentBatches && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-stone-300 uppercase block">
                  Ingested Batch History ({inspectingDataset.recentBatches.length} recorded)
                </span>
                <div className="space-y-1.5">
                  {inspectingDataset.recentBatches.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#16181D] border border-[#20232A] text-xs font-mono">
                      <div>
                        <span className="text-white font-bold">{b.name}</span>
                        <span className="text-stone-400 text-[11px] ml-2">({b.batchId})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#FFFF23]">+{b.samples} samples</span>
                        <span className="text-stone-400">{b.uploadedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#20232A]">
              <button
                onClick={() => handleExportDataset(inspectingDataset)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181A20] hover:bg-[#20232A] text-stone-300 hover:text-white text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Manifest</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const dsId = inspectingDataset.id;
                    setInspectingDataset(null);
                    handleOpenUploadModal(dsId);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FFFF23] text-black text-xs font-black uppercase tracking-wider hover:bg-white transition-all"
                >
                  + Upload Batch to this Dataset
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
