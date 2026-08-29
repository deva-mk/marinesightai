import React, { useState } from 'react';
import { 
  Sliders, 
  Key, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu,
  Layers
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const [minConfidence, setMinConfidence] = useState(0.60);
  const [autoIncidentThreshold, setAutoIncidentThreshold] = useState(0.85);
  const [bioRiskWeight, setBioRiskWeight] = useState(0.40);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#2A2A2A] text-white uppercase">
              Configuration
            </span>
            <span className="text-xs text-[#736B5E]">AI & Telemetry System Parameters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            System & Model Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Fine-tune side-scan sonar detection cutoffs, YOLO confidence boundaries, and Gemini Copilot reasoning thresholds.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F6F52] text-white text-xs font-bold shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parameters Saved</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Detection Sensitivity Tuning */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#2A2A2A]">
            <Sliders className="w-4 h-4 text-[#FF6F59]" />
            <h3>AI Detection & Ingestion Sensitivity</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#2A2A2A]">
                <span>Minimum Confidence Cutoff</span>
                <span className="text-[#FF6F59]">{Math.round(minConfidence * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.90"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-full accent-[#FF6F59] cursor-pointer"
              />
              <p className="text-[11px] text-[#736B5E]">Detections below this score are discarded as acoustic or optical background noise.</p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#2A2A2A]">
                <span>Auto-Incident Generation Threshold</span>
                <span className="text-[#4F6F52]">{Math.round(autoIncidentThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.98"
                step="0.02"
                value={autoIncidentThreshold}
                onChange={(e) => setAutoIncidentThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#4F6F52] cursor-pointer"
              />
              <p className="text-[11px] text-[#736B5E]">Fused detections exceeding this confidence automatically create dispatch incidents.</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold shadow-md shadow-[#FF6F59]/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save System Parameters</span>
          </button>
        </div>

      </form>

    </div>
  );
};
