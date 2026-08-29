import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  User, 
  Ship, 
  Filter, 
  Sparkles, 
  MapPin, 
  Layers, 
  ArrowRight,
  Edit,
  Plus
} from 'lucide-react';
import { IncidentRecord, IncidentStatus } from '../../types';
import { marineStorage } from '../../services/storage';

interface IncidentCommandProps {
  incidents?: IncidentRecord[];
  onNavigate: (view: string, id?: string) => void;
  targetIncidentId?: string | null;
}

export const IncidentCommand: React.FC<IncidentCommandProps> = ({
  incidents = [],
  onNavigate,
  targetIncidentId
}) => {
  const safeIncidents = incidents || [];
  const defaultIncident: IncidentRecord = {
    id: 'INC-DEMO',
    title: 'Ghost Net Entanglement Threat',
    category: 'Ghost Fishing Gear',
    source: 'SONAR',
    severity: 'CRITICAL',
    confidence: 0.94,
    status: 'NEW',
    location: {
      lat: 10.9544,
      lng: 78.0815,
      sector: 'Sector 4B - Gulf of Mannar',
      areaName: 'Marine Sanctuary Core Reef'
    },
    priorityScore: 92,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    reportedBy: 'MarineSight AI Sonar Intelligence Analyst',
    notes: ['Initial telemetry logged.'],
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    associatedDetectionIds: [],
    bioRiskLevel: 'CRITICAL',
    estimatedRemovalEffortHours: 4.5
  };

  const [selectedIncident, setSelectedIncident] = useState<IncidentRecord>(
    (targetIncidentId && safeIncidents.find(i => i.id === targetIncidentId)) || safeIncidents[0] || defaultIncident
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [newNote, setNewNote] = useState<string>('');

  const filteredIncidents = safeIncidents.filter(inc => {
    if (statusFilter === 'ALL') return true;
    return inc.status === statusFilter;
  });

  const handleUpdateStatus = (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    marineStorage.updateIncidentStatus(selectedIncident.id, newStatus);
    setSelectedIncident(prev => ({ ...prev, status: newStatus }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedIncident) return;
    marineStorage.addIncidentNote(selectedIncident.id, newNote);
    setSelectedIncident(prev => ({
      ...prev,
      notes: [...(prev.notes || []), newNote]
    }));
    setNewNote('');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Incident Workflow
            </span>
            <span className="text-xs text-[#736B5E]">Autonomous Triage & Response Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Incident Command Center
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Manage, verify, and dispatch cleanup task forces for verified ghost gear and hazardous debris.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8C8275]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-bold text-[#2A2A2A] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Incidents</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Incident List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-[#736B5E]">
            <span>Active Incidents ({filteredIncidents.length})</span>
            <span>Sorted by Priority Score</span>
          </div>

          <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-white border-[#FF6F59] shadow-md ring-2 ring-[#FF6F59]/20' 
                      : 'bg-white border-[#E8E1D5] hover:border-[#DDD5C7] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#2A2A2A]">{inc.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      inc.severity === 'HIGH' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                      'bg-[#4F6F52]/15 text-[#4F6F52]'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-[#2A2A2A] leading-snug line-clamp-1">
                    {inc.title}
                  </h4>

                  <p className="text-[11px] text-[#736B5E] mt-0.5">{inc.location.areaName}</p>

                  <div className="mt-3 pt-2 border-t border-[#F2EDE4] flex items-center justify-between text-[10px] font-bold">
                    <span className="text-[#8C8275]">Priority Score: <strong className="text-[#2A2A2A]">{inc.priorityScore}</strong></span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      inc.status === 'RESOLVED' ? 'bg-[#4F6F52]/15 text-[#4F6F52]' :
                      inc.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      inc.status === 'ASSIGNED' ? 'bg-amber-100 text-amber-700' : 'bg-[#FF6F59]/15 text-[#FF6F59]'
                    }`}>
                      {inc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident Detail & Action Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedIncident ? (
            <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-6">
              
              {/* Top Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#736B5E]">{selectedIncident.id}</span>
                    <span className="text-xs text-[#8C8275]">• Source: {selectedIncident.source}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#2A2A2A]">
                    {selectedIncident.title}
                  </h2>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5 bg-[#F9F6F0] p-1.5 rounded-2xl border border-[#E3DBD0]">
                  {(['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all ${
                        selectedIncident.status === st 
                          ? 'bg-[#FF6F59] text-white shadow-xs' 
                          : 'text-[#736B5E] hover:text-[#2A2A2A]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo & Spatial Map Preview */}
              {selectedIncident.imageUrl && (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-[#E8E1D5]">
                  <img 
                    src={selectedIncident.imageUrl} 
                    alt={selectedIncident.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-xl text-white text-xs font-mono">
                    {selectedIncident.location.sector} • Depth: {selectedIncident.location.depthMeters || 0}m
                  </div>
                </div>
              )}

              {/* Detail Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold text-[#736B5E] uppercase">Severity</span>
                  <p className="font-extrabold text-[#2A2A2A] mt-0.5">{selectedIncident.severity}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold text-[#736B5E] uppercase">Assigned Taskforce</span>
                  <p className="font-extrabold text-[#4F6F52] mt-0.5">{selectedIncident.assignedTo || 'Unassigned'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold text-[#736B5E] uppercase">Estimated Removal</span>
                  <p className="font-extrabold text-[#2A2A2A] mt-0.5">{selectedIncident.estimatedRemovalEffortHours || 8} Hours</p>
                </div>
              </div>

              {/* Operational Log & Notes Feed */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-[#2A2A2A] uppercase tracking-wider">
                  Operational Response Log
                </h4>

                <div className="space-y-2">
                  {selectedIncident.notes?.map((n, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F9F6F0] border border-[#E8E1D5] text-xs text-[#5C5449]">
                      {n}
                    </div>
                  ))}
                </div>

                {/* Add Note Input */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add operational dispatch log / diver note..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#E3DBD0] text-xs font-medium focus:border-[#FF6F59] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-4 py-2 rounded-xl bg-[#2A2A2A] hover:bg-black text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Post Note
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E1D5]">
                <button
                  onClick={() => onNavigate('hotspots')}
                  className="px-4 py-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#EAE4D9] text-xs font-bold text-[#2A2A2A] flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#FF6F59]" />
                  <span>Show on Marine Map</span>
                </button>

                <button
                  onClick={() => onNavigate('cleanup')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Deploy Cleanup Mission</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#E8E1D5] text-center text-[#736B5E]">
              <p className="text-xs font-bold">Select an incident from the list to manage operations</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
