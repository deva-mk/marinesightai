import React from 'react';
import { 
  Bell, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import { SystemAlert } from '../../types';
import { marineStorage } from '../../services/storage';

interface AlertsCenterProps {
  alerts?: SystemAlert[];
  onNavigate: (view: string, id?: string) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({ alerts = [], onNavigate }) => {
  const safeAlerts = alerts || [];

  const handleAcknowledge = (id: string) => {
    marineStorage.acknowledgeAlert(id);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase">
              Priority Alarms
            </span>
            <span className="text-xs text-[#736B5E]">Automated Hazard Broadcast Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            System Alerts & Critical Warnings
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Real-time notifications of critical ghost fishing gear threats, sensor offline warnings, and drift hazards.
          </p>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {safeAlerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              !alt.acknowledged
                ? 'bg-white border-red-200 shadow-md ring-2 ring-red-500/10'
                : 'bg-white/80 border-[#E8E1D5] opacity-75'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${
                alt.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                alt.severity === 'HIGH' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                'bg-amber-100 text-amber-700'
              }`}>
                {alt.severity === 'CRITICAL' ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#8C8275]">{alt.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    alt.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-[#FF6F59]/15 text-[#FF6F59]'
                  }`}>
                    {alt.severity} PRIORITY
                  </span>
                  <span className="text-[10px] text-[#736B5E] font-medium">• {alt.timestamp}</span>
                </div>

                <h4 className="text-sm font-extrabold text-[#2A2A2A]">{alt.title}</h4>
                <p className="text-xs text-[#5C5449] max-w-2xl leading-relaxed">{alt.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {!alt.acknowledged ? (
                <button
                  onClick={() => handleAcknowledge(alt.id)}
                  className="px-4 py-2 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Acknowledge
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-[#4F6F52]">
                  <CheckCircle2 className="w-4 h-4" /> Acknowledged
                </span>
              )}

              {alt.incidentId && (
                <button
                  onClick={() => onNavigate('incidents', alt.incidentId)}
                  className="px-3.5 py-2 rounded-xl bg-[#F9F6F0] hover:bg-[#F2EDE4] text-xs font-bold text-[#2A2A2A] border border-[#DDD5C7]"
                >
                  View Incident
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
