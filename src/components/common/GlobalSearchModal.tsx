import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, AlertTriangle, Radar, Eye, Ship, MapPin, ArrowRight } from 'lucide-react';
import { DetectionRecord, IncidentRecord, CleanupMission, HotspotRecord } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  missions?: CleanupMission[];
  hotspots?: HotspotRecord[];
  onNavigate?: (view: string, targetId?: string) => void;
  onSelectResult?: (view: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  detections = [],
  incidents = [],
  missions = [],
  hotspots = [],
  onNavigate,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');

  const navigateTo = (view: string, targetId?: string) => {
    if (onNavigate) onNavigate(view, targetId);
    if (onSelectResult) onSelectResult(view, targetId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const safeIncidents = incidents || [];
  const safeDetections = detections || [];
  const safeMissions = missions || [];
  const safeHotspots = hotspots || [];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        incidents: safeIncidents.slice(0, 3),
        detections: safeDetections.slice(0, 3),
        missions: safeMissions.slice(0, 2),
        hotspots: safeHotspots.slice(0, 2)
      };
    }

    return {
      incidents: safeIncidents.filter(i => 
        i.id.toLowerCase().includes(q) || 
        i.title.toLowerCase().includes(q) || 
        i.category.toLowerCase().includes(q) ||
        (i.location?.areaName && i.location.areaName.toLowerCase().includes(q))
      ).slice(0, 5),
      detections: safeDetections.filter(d => 
        d.id.toLowerCase().includes(q) || 
        d.title.toLowerCase().includes(q) || 
        d.category.toLowerCase().includes(q) ||
        (d.location?.sector && d.location.sector.toLowerCase().includes(q))
      ).slice(0, 5),
      missions: safeMissions.filter(m => 
        m.id.toLowerCase().includes(q) || 
        m.title.toLowerCase().includes(q) || 
        (m.vesselName && m.vesselName.toLowerCase().includes(q))
      ).slice(0, 4),
      hotspots: safeHotspots.filter(h => 
        h.name.toLowerCase().includes(q) || 
        (h.sector && h.sector.toLowerCase().includes(q))
      ).slice(0, 4)
    };
  }, [query, safeIncidents, safeDetections, safeMissions, safeHotspots]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#F9F6F0] rounded-3xl shadow-2xl border border-[#E3DBD0] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="p-4 bg-white border-b border-[#E8E1D5] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FF6F59] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search detections, incidents, missions, sonar files, GPS..."
            className="w-full bg-transparent text-sm text-[#2A2A2A] placeholder-[#8C8275] focus:outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#8C8275] hover:text-[#2A2A2A]">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#F2EDE4] text-[10px] font-mono text-[#5C5449] border border-[#DDD5C7]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          
          {/* Incidents Section */}
          {results.incidents.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-[#8C8275] tracking-wider uppercase mb-2 px-1">
                Incidents ({results.incidents.length})
              </p>
              <div className="space-y-1.5">
                {results.incidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => {
                      navigateTo('incidents', inc.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#FF6F59]/10 border border-[#E8E1D5] hover:border-[#FF6F59] text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2A2A2A] group-hover:text-[#FF6F59]">
                            {inc.id}: {inc.title}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F2EDE4] text-[#5C5449]">
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#736B5E]">
                          {inc.category} • {inc.location.areaName} • Priority {inc.priorityScore}/100
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C8275] group-hover:text-[#FF6F59] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detections Section */}
          {results.detections.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-[#8C8275] tracking-wider uppercase mb-2 px-1">
                Raw Detections ({results.detections.length})
              </p>
              <div className="space-y-1.5">
                {results.detections.map((det) => (
                  <button
                    key={det.id}
                    onClick={() => {
                      navigateTo(det.source === 'SONAR' ? 'sonar' : 'surface', det.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#4F6F52]/10 border border-[#E8E1D5] hover:border-[#4F6F52] text-left transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#4F6F52]/15 text-[#4F6F52]">
                        {det.source === 'SONAR' ? <Radar className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2A2A2A] group-hover:text-[#4F6F52]">
                            {det.id}: {det.title}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF6F59]/10 text-[#FF6F59]">
                            {Math.round(det.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#736B5E]">
                          {det.source} • {det.category} • {det.location.sector}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C8275] group-hover:text-[#4F6F52] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Missions Section */}
          {results.missions.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-[#8C8275] tracking-wider uppercase mb-2 px-1">
                Cleanup Missions ({results.missions.length})
              </p>
              <div className="space-y-1.5">
                {results.missions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      navigateTo('cleanup', m.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#F2EDE4] border border-[#E8E1D5] text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#2A2A2A] text-white">
                        <Ship className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2A2A2A]">{m.id}: {m.title}</p>
                        <p className="text-[11px] text-[#736B5E]">{m.vesselName} • Status: {m.status}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C8275]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hotspots Section */}
          {results.hotspots.length > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-[#8C8275] tracking-wider uppercase mb-2 px-1">
                Hotspots ({results.hotspots.length})
              </p>
              <div className="space-y-1.5">
                {results.hotspots.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      navigateTo('hotspots', h.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#F2EDE4] border border-[#E8E1D5] text-left transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#FF6F59]/15 text-[#FF6F59]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2A2A2A]">{h.name} ({h.sector})</p>
                        <p className="text-[11px] text-[#736B5E]">{h.detectionCount} Detections • Risk Score: {h.riskScore}/100</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#8C8275]" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F2EDE4] border-t border-[#E8E1D5] flex items-center justify-between text-[11px] text-[#736B5E]">
          <span>Navigate with <kbd className="font-mono bg-white px-1 py-0.5 rounded border text-[#2A2A2A]">↑</kbd> <kbd className="font-mono bg-white px-1 py-0.5 rounded border text-[#2A2A2A]">↓</kbd></span>
          <span>MarineSight AI Search Index Active</span>
        </div>

      </div>
    </div>
  );
};
