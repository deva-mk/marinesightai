import React from 'react';
import { 
  Cpu, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Download,
  Layers
} from 'lucide-react';
import { AI_MODELS_DATA } from '../../data/sampleData';

export const ModelRegistry: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Neural Architecture
            </span>
            <span className="text-xs text-[#736B5E]">Edge & Cloud Model Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            AI Model Registry & Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Track mAP accuracy, inference latency, parameter counts, and deployment status across sonar, drone, and LLM copilot models.
          </p>
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_MODELS_DATA.map((m) => (
          <div key={m.id} className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4">
            
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
                m.status === 'ACTIVE' ? 'bg-[#4F6F52]/15 text-[#4F6F52]' : 'bg-gray-100 text-gray-700'
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

            <div className="pt-2 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#736B5E]">
              <span>Last retrained: {m.lastTrained}</span>
              <button className="text-xs font-bold text-[#FF6F59] hover:underline flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                <span>Export ONNX</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
