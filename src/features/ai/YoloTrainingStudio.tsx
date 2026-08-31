import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Zap, 
  TrendingUp, 
  Download, 
  Check, 
  Target, 
  Eye, 
  Activity, 
  AlertTriangle, 
  Database, 
  ShieldCheck,
  Terminal,
  ArrowRight,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { AI_MODELS_DATA, DATASETS_DATA } from '../../data/sampleData';
import confetti from 'canvas-confetti';

interface YoloTrainingStudioProps {
  onDeploySuccess?: (deployedModel: any) => void;
  onNavigate?: (view: string) => void;
}

export const YoloTrainingStudio: React.FC<YoloTrainingStudioProps> = ({ onDeploySuccess, onNavigate }) => {
  // Config state
  const [architecture, setArchitecture] = useState<string>('yolov9-marine');
  const [selectedDataset, setSelectedDataset] = useState<string>('DS-MAR-01');
  const [epochs, setEpochs] = useState<number>(50);
  const [batchSize, setBatchSize] = useState<number>(16);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [imageSize, setImageSize] = useState<number>(640);
  const [optimizer, setOptimizer] = useState<string>('adamw');
  const [augmentations, setAugmentations] = useState<string[]>([
    'mosaic', 
    'mixup', 
    'hsv_jitter', 
    'random_flip'
  ]);

  // Training execution state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [trainedModelResult, setTrainedModelResult] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployedModel, setDeployedModel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'training' | 'validation' | 'metrics' | 'deploy'>('training');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleAugmentation = (aug: string) => {
    setAugmentations((prev) =>
      prev.includes(aug) ? prev.filter((a) => a !== aug) : [...prev, aug]
    );
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStartTraining = async () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainedModelResult(null);
    setActiveTab('training');
    
    const logs: string[] = [
      `[INFO] Initializing YOLO Marine Neural Fine-Tuning Pipeline...`,
      `[CONFIG] Architecture: ${architecture.toUpperCase()} | Backbone: CSPDarknet-RepNCSP`,
      `[DATASET] Ingesting annotations from ${selectedDataset} (12,400 Marine Debris bounding boxes)`,
      `[CUDA] Target Hardware: NVIDIA Jetson Orin / TensorRT Float16 acceleration enabled`,
      `[AUGMENT] Active Transforms: ${augmentations.join(', ')}`,
      `[START] Optimizer: ${optimizer.toUpperCase()} | Initial LR: ${learningRate} | Epochs: ${epochs}`,
    ];
    setTrainingLogs(logs);

    try {
      // Fetch full training telemetry from backend
      const res = await apiService.trainYoloModel({
        architecture,
        datasetId: selectedDataset,
        epochs,
        batchSize,
        learningRate,
        imageSize,
        optimizer,
        augmentations,
      });

      if (res.success && res.trainedModel) {
        const fullModel = res.trainedModel;
        const telemetry = fullModel.telemetryHistory || [];

        // Animate progression through epochs for realistic user feedback
        const stepInterval = Math.max(30, Math.min(100, Math.floor(2500 / epochs)));
        
        let ep = 1;
        const timer = setInterval(() => {
          if (ep <= epochs) {
            setCurrentEpoch(ep);
            const currentTelemetry = telemetry[ep - 1] || telemetry[telemetry.length - 1];
            
            if (ep % Math.max(1, Math.floor(epochs / 8)) === 0 || ep === epochs) {
              setTrainingLogs((prev) => [
                ...prev,
                `Epoch ${ep}/${epochs}: box_loss=${currentTelemetry.boxLoss} | cls_loss=${currentTelemetry.clsLoss} | dfl_loss=${currentTelemetry.dflLoss} | mAP@50=${(currentTelemetry.map50 * 100).toFixed(1)}% | lr=${currentTelemetry.learningRate}`
              ]);
            }
            ep++;
          } else {
            clearInterval(timer);
            setIsTraining(false);
            setTrainedModelResult(fullModel);
            setTrainingLogs((prev) => [
              ...prev,
              `[SUCCESS] Training converged! Final mAP@50: ${fullModel.metrics.map50}% | Precision: ${fullModel.metrics.precision}% | Recall: ${fullModel.metrics.recall}%`,
              `[EXPORT] Checkpoint saved: ${fullModel.weightsArtifacts.ptFileName} (${(fullModel.weightsArtifacts.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB)`
            ]);
            confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            showToast(`YOLO model fine-tuning complete! mAP@50 reached ${fullModel.metrics.map50}%`);
          }
        }, stepInterval);
      }
    } catch (err: any) {
      setIsTraining(false);
      setTrainingLogs((prev) => [...prev, `[ERROR] Training pipeline failed: ${err.message}`]);
      showToast(`Training error: ${err.message}`);
    }
  };

  const handleDeployModel = async () => {
    if (!trainedModelResult) return;
    setIsDeploying(true);

    try {
      const res = await apiService.deployYoloModel({
        runId: trainedModelResult.runId,
        modelName: trainedModelResult.modelName,
        map50: trainedModelResult.metrics.map50,
        precision: trainedModelResult.metrics.precision,
        recall: trainedModelResult.metrics.recall,
        latencyMs: trainedModelResult.metrics.latencyMs,
      });

      if (res.success) {
        setDeployedModel(res.activeModel);
        if (onDeploySuccess) onDeploySuccess(res.activeModel);
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
        showToast(`Model ${res.activeModel.name} deployed to live inference!`);
      }
    } catch (e: any) {
      showToast(`Deployment error: ${e.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#2A2A2A] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#4F6F52] shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              YOLO Marine Studio
            </span>
            <span className="text-xs text-[#736B5E]">Neural Network Training & Fine-Tuning</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Train YOLO Model for High-Clarity Marine Predictions
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Train custom YOLOv8, YOLOv9, and YOLOv11 architectures on marine debris, ghost fishing gear, and acoustic side-scan datasets to maximize detection clarity and precision.
          </p>
        </div>

        {deployedModel && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#4F6F52]/10 border border-[#4F6F52]/30 text-[#4F6F52] text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#4F6F52]" />
            <span>Active in Live Detection: {deployedModel.name}</span>
          </div>
        )}
      </div>

      {/* Studio Grid: Hyperparameter Configuration vs Interactive Live Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Hyperparameters & Dataset Selection */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Architecture Selector */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#2A2A2A]">
              <Cpu className="w-4 h-4 text-[#FF6F59]" />
              <h3>1. Neural Architecture & Backbone</h3>
            </div>

            <div className="space-y-2">
              {[
                { id: 'yolov9-marine', name: 'YOLOv9-SeaGuard (Recommended)', desc: 'RepNCSPELAN4 + Dual Attention for underwater netting & small plastics', badge: 'High Accuracy' },
                { id: 'yolov11-oceannet', name: 'YOLOv11-OceanNet Edge', desc: 'Ultra-fast inference (106 FPS) optimized for drone catapult feeds', badge: 'Fastest' },
                { id: 'yolo-acoustic-sonar', name: 'YOLO-AcousticNet v3', desc: 'Specialized for side-scan sonar reverberation & acoustic void shadows', badge: 'Sonar Net' },
                { id: 'yolov8x-marine', name: 'YOLOv8x-Marine Pro', desc: 'Dense CSPDarknet backbone with multi-scale feature pyramid (FPN)', badge: 'Heavy Scale' }
              ].map((arch) => (
                <label
                  key={arch.id}
                  className={`flex items-start justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    architecture === arch.id
                      ? 'border-[#FF6F59] bg-[#FF6F59]/5 shadow-xs'
                      : 'border-[#E8E1D5] hover:border-[#DDD5C7] bg-[#F9F6F0]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="radio"
                      name="architecture"
                      checked={architecture === arch.id}
                      onChange={() => setArchitecture(arch.id)}
                      className="mt-1 accent-[#FF6F59]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#2A2A2A] block">{arch.name}</span>
                      <span className="text-[11px] text-[#736B5E] block leading-tight">{arch.desc}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-white border border-[#E3DBD0] text-[#FF6F59]">
                    {arch.badge}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Dataset Selector */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#2A2A2A]">
              <Database className="w-4 h-4 text-[#4F6F52]" />
              <h3>2. Training Dataset</h3>
            </div>

            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-bold text-[#2A2A2A] focus:border-[#FF6F59] focus:outline-none"
            >
              {DATASETS_DATA.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.name} ({ds.sampleCount} samples • {ds.classes.length} classes)
                </option>
              ))}
            </select>

            <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] text-xs space-y-1">
              <span className="text-[10px] font-extrabold text-[#8C8275] uppercase">Classes included:</span>
              <div className="flex flex-wrap gap-1">
                {['Ghost Fishing Gear', 'Plastic & Polystyrene', 'Derelict Crab Traps', 'Buoys & Floats', 'Oil Sheens'].map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white text-[10px] font-medium text-[#2A2A2A] border border-[#E3DBD0]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hyperparameter Sliders */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#2A2A2A]">
              <Sliders className="w-4 h-4 text-[#FF6F59]" />
              <h3>3. Training Hyperparameters</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-[#2A2A2A]">
                  <span>Epochs:</span>
                  <span className="text-[#FF6F59] font-mono">{epochs} Epochs</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="10"
                  value={epochs}
                  onChange={(e) => setEpochs(Number(e.target.value))}
                  className="w-full accent-[#FF6F59] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C5449] mb-1">Batch Size</label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F6F0] border border-[#E3DBD0] font-bold text-xs"
                  >
                    <option value={8}>8 (Low VRAM)</option>
                    <option value={16}>16 (Balanced)</option>
                    <option value={32}>32 (Fast)</option>
                    <option value={64}>64 (Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5C5449] mb-1">Image Size (px)</label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#F9F6F0] border border-[#E3DBD0] font-bold text-xs"
                  >
                    <option value={640}>640 x 640 (Standard)</option>
                    <option value={1280}>1280 x 1280 (High Detail)</option>
                  </select>
                </div>
              </div>

              {/* Augmentations Checkboxes */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-[#5C5449]">Data Augmentations for Clear Predictions</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mosaic', label: 'Mosaic (4-image mix)' },
                    { id: 'mixup', label: 'MixUp Alpha Blend' },
                    { id: 'hsv_jitter', label: 'Underwater HSV Jitter' },
                    { id: 'random_flip', label: 'Random Flip & Scale' },
                  ].map((aug) => (
                    <button
                      key={aug.id}
                      type="button"
                      onClick={() => toggleAugmentation(aug.id)}
                      className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                        augmentations.includes(aug.id)
                          ? 'bg-[#4F6F52]/10 border-[#4F6F52] text-[#4F6F52]'
                          : 'bg-[#F9F6F0] border-[#E8E1D5] text-[#736B5E]'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${augmentations.includes(aug.id) ? 'text-[#4F6F52]' : 'text-transparent border border-gray-400 rounded-full'}`} />
                      <span>{aug.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Training Button */}
            <button
              onClick={handleStartTraining}
              disabled={isTraining}
              className={`w-full py-3 rounded-2xl text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all ${
                isTraining
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#FF6F59] hover:bg-[#E0533D] shadow-[#FF6F59]/30 hover:scale-[1.01]'
              }`}
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Training YOLO Model (Epoch {currentEpoch}/{epochs})...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Train YOLO Model ({epochs} Epochs)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right: Live Training Console, Loss Graphs & Validation Results */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Sub-tab Navigation */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-[#E8E1D5] shadow-xs gap-1">
            {[
              { id: 'training', label: 'Live Training Console' },
              { id: 'validation', label: 'Prediction Clarity Comparison' },
              { id: 'metrics', label: 'mAP Loss Curves' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === t.id
                    ? 'bg-[#FF6F59] text-white shadow-xs'
                    : 'text-[#736B5E] hover:text-[#2A2A2A]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Terminal & Epoch Stream */}
          {activeTab === 'training' && (
            <div className="space-y-4">
              {/* Epoch Progress Indicator */}
              <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-[#2A2A2A] text-sm">
                      {isTraining ? `Training Epoch ${currentEpoch} of ${epochs}` : trainedModelResult ? 'Training Run Completed' : 'Ready for Training'}
                    </span>
                    <p className="text-[11px] text-[#736B5E]">
                      {isTraining ? 'Backpropagation & gradient updates active on Jetson Orin Nano' : trainedModelResult ? `Trained model weights ready for deployment.` : 'Click "Train YOLO Model" to start fine-tuning.'}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-sm text-[#FF6F59]">
                    {epochs > 0 ? `${Math.round((currentEpoch / epochs) * 100)}%` : '0%'}
                  </span>
                </div>

                <div className="w-full bg-[#F2EDE4] rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#FF6F59] to-[#4F6F52] h-full transition-all duration-200"
                    style={{ width: `${(currentEpoch / epochs) * 100}%` }}
                  />
                </div>
              </div>

              {/* Terminal Logs Output */}
              <div className="p-5 rounded-3xl bg-[#1E1E1E] text-white font-mono text-xs shadow-md border border-[#333] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#333] text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#FF6F59]" />
                    <span>YOLOv9 Training Output Stream</span>
                  </div>
                  <span className="text-[#4F6F52] flex items-center gap-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#4F6F52] animate-pulse" />
                    {isTraining ? 'TRAINING ACTIVE' : 'IDLE'}
                  </span>
                </div>

                <div className="h-64 overflow-y-auto space-y-1 text-[11px] text-gray-300 font-mono pr-2">
                  {trainingLogs.length === 0 ? (
                    <p className="text-gray-500 italic py-8 text-center">
                      Configure parameters and click "Train YOLO Model" to stream real-time training telemetry, loss convergence, and mAP metrics.
                    </p>
                  ) : (
                    trainingLogs.map((log, idx) => (
                      <p key={idx} className={log.includes('[SUCCESS]') ? 'text-[#4F6F52] font-bold' : log.includes('[ERROR]') ? 'text-rose-400' : 'text-gray-300'}>
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>

              {/* Post-Training Actions Banner */}
              {trainedModelResult && (
                <div className="p-6 rounded-3xl bg-white border-2 border-[#4F6F52] shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#4F6F52]" />
                        <h4 className="font-extrabold text-base text-[#2A2A2A]">
                          {trainedModelResult.modelName} Ready!
                        </h4>
                      </div>
                      <p className="text-xs text-[#736B5E] mt-0.5">
                        Validation mAP@50 reached <strong>{trainedModelResult.metrics.map50}%</strong> (Precision: {trainedModelResult.metrics.precision}%, Recall: {trainedModelResult.metrics.recall}%).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeployModel}
                        disabled={isDeploying}
                        className="px-4 py-2.5 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>{isDeploying ? 'Deploying...' : 'Deploy to Live Pipeline'}</span>
                      </button>

                      <button
                        onClick={() => {
                          const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`MarineSight AI YOLO Model Weights (${trainedModelResult.runId})\nArchitecture: ${trainedModelResult.architecture}\nmAP@50: ${trainedModelResult.metrics.map50}%\nPrecision: ${trainedModelResult.metrics.precision}%\nArtifact: ${trainedModelResult.weightsArtifacts.ptFileName}`);
                          const dl = document.createElement('a');
                          dl.setAttribute('href', dataStr);
                          dl.setAttribute('download', trainedModelResult.weightsArtifacts.ptFileName);
                          dl.click();
                          dl.remove();
                          showToast(`Exported ${trainedModelResult.weightsArtifacts.ptFileName}`);
                        }}
                        className="p-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#E8E1D5] text-[#2A2A2A] text-xs font-bold transition-colors"
                        title="Download Weights (.pt)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Prediction Clarity Comparison (Before vs After Training) */}
          {activeTab === 'validation' && (
            <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-[#2A2A2A]">
                  Prediction Clarity: Untrained Baseline vs. Fine-Tuned YOLO
                </h3>
                <p className="text-xs text-[#736B5E] mt-0.5">
                  See how fine-tuning on marine datasets sharpens bounding boxes, eliminates false alarms on wave foam, and increases confidence.
                </p>
              </div>

              {/* Side-by-side visual comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Before: Baseline Model */}
                <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#736B5E]">Default Generic Model</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">mAP: 71.4%</span>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DDD5C7] bg-black">
                    <img 
                      src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80" 
                      alt="Baseline Prediction" 
                      className="w-full h-full object-cover opacity-80"
                    />
                    {/* Weak noisy bounding box */}
                    <div className="absolute left-[20%] top-[25%] w-[55%] h-[50%] border-2 border-dashed border-amber-400 bg-amber-400/10 rounded">
                      <span className="absolute -top-5 left-0 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Object? (62%)
                      </span>
                    </div>
                    {/* False positive box on wave */}
                    <div className="absolute right-[10%] top-[10%] w-[25%] h-[25%] border border-dashed border-rose-400 bg-rose-400/10 rounded">
                      <span className="absolute -top-5 left-0 bg-rose-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">
                        False Positive (51%)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#736B5E]">
                    Loose bounding coordinates, high false-positive rate on ambient wave crests, low confidence.
                  </p>
                </div>

                {/* After: Fine-Tuned YOLO */}
                <div className="p-4 rounded-2xl bg-[#F9F6F0] border-2 border-[#4F6F52] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#4F6F52]">Trained Marine YOLO (Fine-Tuned)</span>
                    <span className="text-[10px] font-extrabold text-white bg-[#4F6F52] px-2 py-0.5 rounded">mAP: 96.8%</span>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden border border-[#4F6F52]/40 bg-black">
                    <img 
                      src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80" 
                      alt="Fine-Tuned Prediction" 
                      className="w-full h-full object-cover"
                    />
                    {/* Crisp tight bounding box */}
                    <div className="absolute left-[24%] top-[30%] w-[48%] h-[42%] border-2 border-[#FF6F59] bg-[#FF6F59]/20 rounded-md shadow-lg">
                      <span className="absolute -top-6 left-0 bg-[#FF6F59] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                        Ghost Fishing Gear (96.8%)
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#2A2A2A] font-medium">
                    Tight pixel-accurate bounds, wave foam completely suppressed, high confidence class classification.
                  </p>
                </div>

              </div>

              {/* Class Accuracy Improvements Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-[#8C8275] uppercase tracking-wider block">
                  Class Detection Precision Improvements:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { name: 'Ghost Fishing Gear', before: '74%', after: '97.4%', gain: '+23.4%' },
                    { name: 'Surface Plastic', before: '78%', after: '96.1%', gain: '+18.1%' },
                    { name: 'Derelict Crab Traps', before: '69%', after: '94.8%', gain: '+25.8%' },
                    { name: 'Polymer Oil Slicks', before: '65%', after: '92.5%', gain: '+27.5%' },
                    { name: 'Marker Buoys', before: '82%', after: '98.1%', gain: '+16.1%' },
                    { name: 'Wave Foam Rejection', before: '42%', after: '99.2%', gain: '+57.2%' },
                  ].map((stat, sIdx) => (
                    <div key={sIdx} className="p-2.5 rounded-xl bg-white border border-[#E8E1D5] text-xs">
                      <span className="text-[10px] font-bold text-[#736B5E] block truncate">{stat.name}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[#8C8275] line-through text-[11px]">{stat.before}</span>
                        <span className="font-extrabold text-[#4F6F52] text-xs">{stat.after}</span>
                        <span className="text-[10px] font-bold text-[#FF6F59] bg-[#FF6F59]/10 px-1 rounded">{stat.gain}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Tab 3: mAP Loss Curves */}
          {activeTab === 'metrics' && (
            <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#2A2A2A]">
                    mAP@50 & Loss Convergence Curves
                  </h3>
                  <p className="text-xs text-[#736B5E]">
                    Tracking box loss, class loss, and mAP@50 progression over epochs
                  </p>
                </div>
                <span className="text-xs font-bold text-[#4F6F52] bg-[#4F6F52]/10 px-2.5 py-1 rounded-full">
                  Validation Loss: 0.0412
                </span>
              </div>

              {/* Visual convergence graph representation */}
              <div className="h-56 bg-[#F9F6F0] rounded-2xl border border-[#E8E1D5] p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-[#736B5E] font-mono">
                  <span>mAP@50: 96.8% (Target: &gt;90%)</span>
                  <span>Box Loss: 0.028 (Min: 0.015)</span>
                </div>

                {/* SVG Graph rendering */}
                <svg className="w-full h-36 overflow-visible" viewBox="0 0 500 120">
                  <defs>
                    <linearGradient id="gradMap" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4F6F52" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#4F6F52" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#E3DBD0" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#E3DBD0" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="500" y2="90" stroke="#E3DBD0" strokeDasharray="3 3" />

                  {/* Loss curve (dropping) */}
                  <path
                    d="M 0 20 Q 120 70 250 95 T 500 108"
                    fill="none"
                    stroke="#FF6F59"
                    strokeWidth="3"
                  />

                  {/* mAP Curve (rising) */}
                  <path
                    d="M 0 105 Q 120 50 250 25 T 500 12"
                    fill="none"
                    stroke="#4F6F52"
                    strokeWidth="3"
                  />
                  <path
                    d="M 0 105 Q 120 50 250 25 T 500 12 L 500 120 L 0 120 Z"
                    fill="url(#gradMap)"
                  />
                </svg>

                <div className="flex items-center justify-between text-[10px] font-bold text-[#8C8275] uppercase">
                  <span>Epoch 1</span>
                  <span>Epoch {Math.floor(epochs / 2)}</span>
                  <span>Epoch {epochs} (Converged)</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#4F6F52]" />
                  <span>mAP@50 Score (Higher is Better)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF6F59]" />
                  <span>Bounding Box Loss (Lower is Better)</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
