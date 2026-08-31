import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Download,
  Layers,
  Sliders,
  Play,
  RotateCcw,
  TrendingUp,
  Target
} from 'lucide-react';
import { AI_MODELS_DATA } from '../../data/sampleData';
import { YoloTrainingStudio } from './YoloTrainingStudio';
import { apiService } from '../../services/apiService';

interface ModelRegistryProps {
  onNavigate?: (view: string) => void;
}

export const ModelRegistry: React.FC<ModelRegistryProps> = ({ onNavigate }) => {
  const [viewMode, setViewMode] = useState<'REGISTRY' | 'TRAINING'>('REGISTRY');
  const [models, setModels] = useState(AI_MODELS_DATA);
  const [activeYoloStatus, setActiveYoloStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiService.getYoloStatus();
        if (res.success && res.activeModel) {
          setActiveYoloStatus(res.activeModel);
        }
      } catch (e) {
        console.warn('Could not fetch active YOLO model status:', e);
      }
    };
    fetchStatus();
  }, []);

  const handleDeployedModel = (newDeployed: any) => {
    setActiveYoloStatus(newDeployed);
    setModels((prev) =>
      prev.map((m) =>
        m.id === 'yolo-v9-seaguard'
          ? {
              ...m,
              name: newDeployed.name,
              mapScore: newDeployed.map50,
              precision: newDeployed.precision,
              latencyMs: newDeployed.latencyMs,
              lastTrained: 'Just now (Fine-Tuned)',
              status: 'ACTIVE',
            }
          : m
      )
    );
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Neural Architecture & YOLO Studio
            </span>
            <span className="text-xs text-[#736B5E]">Edge & Cloud Model Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            AI Model Registry & Training Lab
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1 max-w-2xl">
            Monitor deployed weights, evaluate mAP accuracy and latency benchmarks, or train custom YOLO models for enhanced detection clarity.
          </p>
        </div>

        {/* View Switcher Button */}
        <div className="flex items-center gap-2 bg-[#F2EDE4] p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode('REGISTRY')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'REGISTRY'
                ? 'bg-[#FF6F59] text-white shadow-xs'
                : 'text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Model Benchmarks</span>
          </button>
          <button
            onClick={() => setViewMode('TRAINING')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'TRAINING'
                ? 'bg-[#FF6F59] text-white shadow-xs'
                : 'text-[#736B5E] hover:text-[#2A2A2A]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Train YOLO Model</span>
          </button>
        </div>
      </div>

      {/* Active Deployed YOLO Banner */}
      {activeYoloStatus && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#4F6F52]/10 via-white to-[#4F6F52]/10 border border-[#4F6F52]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4F6F52] text-white flex items-center justify-center shadow-xs shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#2A2A2A]">{activeYoloStatus.name}</h3>
                <span className="text-[10px] font-bold bg-[#4F6F52] text-white px-2 py-0.5 rounded-full">
                  LIVE INFERENCE ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#736B5E]">
                Accuracy: <strong className="text-[#2A2A2A]">{activeYoloStatus.map50}% mAP@50</strong> • Latency: <strong className="text-[#2A2A2A]">{activeYoloStatus.latencyMs}ms</strong> • Version: {activeYoloStatus.version}
              </p>
            </div>
          </div>

          <button
            onClick={() => setViewMode('TRAINING')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Fine-Tune Weights</span>
          </button>
        </div>
      )}

      {/* Main Content Area: Registry or Training Studio */}
      {viewMode === 'TRAINING' ? (
        <YoloTrainingStudio 
          onDeploySuccess={handleDeployedModel}
          onNavigate={onNavigate}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick Action Callout */}
          <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#2A2A2A]">Train a New YOLO Checkpoint</h3>
              <p className="text-xs text-[#736B5E]">
                Improve detection clarity, boost bounding box IoU accuracy, and eliminate false positives from ambient marine waves.
              </p>
            </div>
            <button
              onClick={() => setViewMode('TRAINING')}
              className="px-4 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-extrabold shadow-sm flex items-center gap-2 transition-all shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Launch YOLO Training Studio</span>
            </button>
          </div>

          {/* Model Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((m) => (
              <div key={m.id} className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4 hover:border-[#DDD5C7] transition-all">
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-[#2A2A2A]">{m.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F9F6F0] text-[#736B5E] border border-[#E8E1D5]">
                        {m.version}
                      </span>
                    </div>
                    <p className="text-xs text-[#736B5E] mt-0.5">{m.architecture}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                    m.status === 'ACTIVE' ? 'bg-[#4F6F52]/15 text-[#4F6F52] border border-[#4F6F52]/30' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {m.status}
                  </span>
                </div>

                {/* Performance Gauges */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5] text-xs">
                  <div>
                    <span className="text-[10px] text-[#736B5E] uppercase font-bold">mAP Accuracy</span>
                    <p className="text-lg font-black text-[#FF6F59] mt-0.5">{m.mapScore}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#736B5E] uppercase font-bold">Latency</span>
                    <p className="text-lg font-black text-[#4F6F52] mt-0.5">{m.latencyMs}ms</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#736B5E] uppercase font-bold">Precision</span>
                    <p className="text-lg font-black text-[#2A2A2A] mt-0.5">{m.precision}%</p>
                  </div>
                </div>

                {/* Target Classes Supported */}
                <div>
                  <span className="text-[10px] font-extrabold text-[#736B5E] uppercase tracking-wider block mb-1.5">
                    Trained Debris Classes ({m.classesSupported.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {m.classesSupported.map((c, cIdx) => (
                      <span key={cIdx} className="px-2 py-0.5 rounded-lg bg-[#F2EDE4] text-[11px] font-medium text-[#2A2A2A]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#736B5E]">
                  <span>Last retrained: {m.lastTrained}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewMode('TRAINING')}
                      className="text-xs font-bold text-[#FF6F59] hover:underline flex items-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Retrain</span>
                    </button>
                    <button 
                      onClick={() => {
                        const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`MarineSight AI Exported Weights (${m.id})\nArchitecture: ${m.architecture}\nmAP@50: ${m.mapScore}%\nPrecision: ${m.precision}%`);
                        const dl = document.createElement('a');
                        dl.setAttribute('href', dataStr);
                        dl.setAttribute('download', `${m.id}_weights.onnx`);
                        dl.click();
                        dl.remove();
                      }}
                      className="text-xs font-bold text-[#736B5E] hover:text-[#2A2A2A] flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ONNX</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

