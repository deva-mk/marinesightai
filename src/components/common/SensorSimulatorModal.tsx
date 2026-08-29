import React, { useState } from 'react';
import { Radio, X, Radar, Eye, Plane, MapPin, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { marineStorage } from '../../services/storage';
import { DetectionRecord } from '../../types';

interface SensorSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetectionGenerated?: (detection: DetectionRecord) => void;
}

export const SensorSimulatorModal: React.FC<SensorSimulatorModalProps> = ({
  isOpen,
  onClose,
  onDetectionGenerated
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<DetectionRecord | null>(null);

  if (!isOpen) return null;

  const handleSimulate = (type: 'SONAR' | 'DRONE' | 'CAMERA' | 'GPS' | 'FUSION') => {
    setIsSimulating(true);
    setLastGenerated(null);

    setTimeout(() => {
      const result = marineStorage.triggerSimulationScan(type);
      setLastGenerated(result);
      setIsSimulating(false);
      if (onDetectionGenerated) onDetectionGenerated(result);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-[#F9F6F0] rounded-3xl shadow-2xl border border-[#E3DBD0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4F6F52]/15 text-[#4F6F52]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#2A2A2A]">Sensor Simulation Engine</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20">
                  SIMULATION ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#736B5E]">Inject realistic marine telemetry events without physical vessel hardware</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F2EDE4] text-[#5C5449]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold text-[#5C5449] uppercase tracking-wider">
            Select Sensor Trigger to Fire:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Sonar Trigger */}
            <button
              onClick={() => handleSimulate('SONAR')}
              disabled={isSimulating}
              className="p-4 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#FF6F59] hover:shadow-md text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59] group-hover:scale-110 transition-transform">
                  <Radar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2A2A2A] group-hover:text-[#FF6F59]">Side-Scan Sonar</h4>
                  <span className="text-[10px] text-[#736B5E]">Acoustic Backscatter</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-tight">
                Simulates submerged ghost net or derelict crab pot target on seafloor transect.
              </p>
            </button>

            {/* Drone Trigger */}
            <button
              onClick={() => handleSimulate('DRONE')}
              disabled={isSimulating}
              className="p-4 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#4F6F52] hover:shadow-md text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#4F6F52]/15 text-[#4F6F52] group-hover:scale-110 transition-transform">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2A2A2A] group-hover:text-[#4F6F52]">Aerial Drone Survey</h4>
                  <span className="text-[10px] text-[#736B5E]">Optical & NIR band</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-tight">
                Fires surface polymer slick detection along flight path coordinates.
              </p>
            </button>

            {/* Vessel Camera */}
            <button
              onClick={() => handleSimulate('CAMERA')}
              disabled={isSimulating}
              className="p-4 rounded-2xl bg-white border border-[#E8E1D5] hover:border-[#2A2A2A] hover:shadow-md text-left transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#2A2A2A] text-white group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2A2A2A]">Vessel Optical Vision</h4>
                  <span className="text-[10px] text-[#736B5E]">YOLOv8-Marine</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-tight">
                Generates discarded monofilament or floating plastic container detection.
              </p>
            </button>

            {/* Multimodal Fusion */}
            <button
              onClick={() => handleSimulate('FUSION')}
              disabled={isSimulating}
              className="p-4 rounded-2xl bg-white border border-[#FF6F59]/40 hover:border-[#FF6F59] hover:shadow-md text-left transition-all group bg-gradient-to-br from-white to-[#FF6F59]/5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#FF6F59] text-white group-hover:scale-110 transition-transform shadow-sm">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2A2A2A] group-hover:text-[#FF6F59]">Multimodal Fusion</h4>
                  <span className="text-[10px] text-[#FF6F59] font-bold">96% High-Confidence</span>
                </div>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-tight">
                Cross-correlates simultaneous Sonar seafloor + Aerial drone surface marker detection.
              </p>
            </button>

          </div>

          {/* Success Banner */}
          {lastGenerated && (
            <div className="mt-4 p-4 rounded-2xl bg-white border border-[#4F6F52] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#4F6F52]" />
                <span className="text-xs font-extrabold text-[#4F6F52]">
                  Detection Ingested: {lastGenerated.id}
                </span>
              </div>
              <p className="text-xs font-bold text-[#2A2A2A]">
                {lastGenerated.category} • Confidence: {Math.round(lastGenerated.confidence * 100)}%
              </p>
              <p className="text-[11px] text-[#736B5E] mt-0.5">
                Location: {lastGenerated.location.sector} ({lastGenerated.location.lat.toFixed(4)}°N, {lastGenerated.location.lng.toFixed(4)}°E)
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F2EDE4] border-t border-[#E8E1D5] flex items-center justify-between text-xs text-[#736B5E]">
          <span>Generated records are flagged as <span className="font-bold text-[#FF6F59]">DEMO DATA</span></span>
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] hover:bg-[#EAE4D9]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
