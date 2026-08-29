import React from 'react';
import { X, Bell, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, ExternalLink } from 'lucide-react';
import { AlertRecord } from '../../types';
import { marineStorage } from '../../services/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts?: AlertRecord[];
  onSelectIncident?: (id: string) => void;
  onNavigate?: (view: string, id?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts = [],
  onSelectIncident,
  onNavigate
}) => {
  if (!isOpen) return null;

  const safeAlerts = alerts || [];

  const handleMarkAllRead = () => {
    marineStorage.markAllAlertsRead();
  };

  const handleAlertClick = (alert: AlertRecord) => {
    marineStorage.markAlertRead(alert.id);
    if (alert.relatedIncidentId) {
      if (onSelectIncident) onSelectIncident(alert.relatedIncidentId);
      if (onNavigate) onNavigate('incidents', alert.relatedIncidentId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#F9F6F0] shadow-2xl flex flex-col z-50 border-l border-[#E3DBD0] animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#2A2A2A]">Alerts & System Feed</h3>
              <p className="text-xs text-[#736B5E]">{safeAlerts.filter(a => !(a as any).isRead && !(a as any).acknowledged).length} unread notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[#4F6F52] hover:underline"
            >
              Mark all read
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#F2EDE4] text-[#5C5449]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {safeAlerts.length === 0 ? (
            <div className="text-center py-12 text-[#8C8275]">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-[#4F6F52]" />
              <p className="text-sm font-semibold">No active marine alerts</p>
              <p className="text-xs mt-1">Telemetry grid operating normally</p>
            </div>
          ) : (
            safeAlerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isHigh = alert.severity === 'HIGH';

              return (
                <div
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={`
                    p-3.5 rounded-2xl border transition-all cursor-pointer text-left
                    ${alert.isRead ? 'bg-white/70 border-[#E8E1D5] opacity-80' : 'bg-white border-[#FF6F59]/40 shadow-sm'}
                    hover:border-[#FF6F59] hover:shadow-md
                  `}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isCrit ? (
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      ) : isHigh ? (
                        <AlertTriangle className="w-4 h-4 text-[#FF6F59] shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#4F6F52] shrink-0" />
                      )}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isCrit ? 'bg-red-100 text-red-700' : isHigh ? 'bg-[#FF6F59]/15 text-[#FF6F59]' : 'bg-[#4F6F52]/15 text-[#4F6F52]'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#8C8275]">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#2A2A2A] mb-1 leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-[#5C5449] leading-relaxed">
                    {alert.message}
                  </p>

                  {alert.relatedIncidentId && (
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-[#FF6F59] hover:underline">
                      <span>Inspect {alert.relatedIncidentId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
