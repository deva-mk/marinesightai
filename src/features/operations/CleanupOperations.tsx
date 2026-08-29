import React, { useState } from 'react';
import { 
  Ship, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Plus, 
  Calendar, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Download,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { CleanupMission, MissionStatus } from '../../types';
import { marineStorage } from '../../services/storage';

interface CleanupOperationsProps {
  missions?: CleanupMission[];
  onNavigate: (view: string, id?: string) => void;
}

export const CleanupOperations: React.FC<CleanupOperationsProps> = ({ missions = [], onNavigate }) => {
  const safeMissions = missions || [];
  const defaultMission: CleanupMission = {
    id: 'MSN-DEMO',
    title: 'Operation Net-Sweep Beta',
    status: 'ACTIVE',
    teamName: 'Marine Salvage Unit Alpha',
    vesselName: 'RV Ocean-Guardian (Tamil Nadu Maritime)',
    leader: 'Commander Sarah Connor',
    targetIncidents: [],
    locationName: 'Sector 4B - Gulf of Mannar',
    scheduledDate: '2025-05-18',
    debrisCollectedKg: 420,
    highRiskResolvedCount: 3,
    routeCoordinates: [[10.954, 78.081]],
    notes: 'Mission underway with diver deployment.'
  };

  const [selectedMission, setSelectedMission] = useState<CleanupMission>(safeMissions[0] || defaultMission);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);

  // New Mission Form State
  const [newTitle, setNewTitle] = useState('');
  const [newVessel, setNewVessel] = useState('RV Ocean-Guardian (Tamil Nadu Maritime)');
  const [newLead, setNewLead] = useState('Commander Sarah Connor');
  const [newSector, setNewSector] = useState('Sector 4B - Gulf of Mannar');
  const [newDate, setNewDate] = useState('2025-05-18');

  const filteredMissions = safeMissions.filter(m => {
    if (statusFilter === 'ALL') return true;
    return m.status === statusFilter;
  });

  const handleStatusChange = (status: MissionStatus) => {
    if (!selectedMission) return;
    marineStorage.updateMissionStatus(selectedMission.id, status);
    setSelectedMission(prev => ({ ...prev, status }));
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    const newMission: CleanupMission = {
      id: `MSN-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle || 'Targeted Derelict Gear Retrieval',
      status: 'PLANNED',
      scheduledDate: newDate,
      vesselName: newVessel,
      teamName: 'Marine Salvage Squadron Alpha',
      leader: newLead,
      targetIncidents: ['INC-9042'],
      locationName: newSector,
      debrisCollectedKg: 0,
      highRiskResolvedCount: 1,
      beforePhoto: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
      afterPhoto: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
      routeCoordinates: [
        [10.954, 78.081],
        [10.956, 78.083],
        [10.952, 78.086]
      ],
      notes: 'Deployment authorized by Gulf of Mannar Biosphere Reserve Authority. Hydraulic winch primed.'
    };

    marineStorage.addMission(newMission);
    setSelectedMission(newMission);
    setShowNewModal(false);
    setNewTitle('');
  };

  const totalCollectedKg = missions
    .filter(m => m.status === 'COMPLETED')
    .reduce((acc, m) => acc + (m.debrisCollectedKg || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              Field Operations
            </span>
            <span className="text-xs text-[#736B5E]">Recovery Taskforces & Haul Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Cleanup Operations & Tonnage
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Coordinate recovery vessels, technical dive squads, hydraulic winches, and verifiable debris weigh-ins.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold transition-all shadow-sm shadow-[#FF6F59]/30"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Cleanup Mission</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
          <span className="text-[10px] font-extrabold text-[#736B5E] uppercase">Total Debris Recovered</span>
          <p className="text-2xl font-black text-[#4F6F52] mt-1">{totalCollectedKg} kg</p>
          <p className="text-[11px] text-[#8C8275]">Certified Tonnage</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
          <span className="text-[10px] font-extrabold text-[#736B5E] uppercase">Completed Missions</span>
          <p className="text-2xl font-black text-[#2A2A2A] mt-1">
            {missions.filter(m => m.status === 'COMPLETED').length}
          </p>
          <p className="text-[11px] text-[#8C8275]">100% Success Rate</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
          <span className="text-[10px] font-extrabold text-[#736B5E] uppercase">Active Vessels</span>
          <p className="text-2xl font-black text-[#FF6F59] mt-1">3 Vessels</p>
          <p className="text-[11px] text-[#8C8275]">Hydraulic & ROV equipped</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E8E1D5] shadow-xs">
          <span className="text-[10px] font-extrabold text-[#736B5E] uppercase">Habitats Restored</span>
          <p className="text-2xl font-black text-[#4F6F52] mt-1">4 Coral Sectors</p>
          <p className="text-[11px] text-[#8C8275]">Free of Ghost Webbing</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Mission List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-[#736B5E]">
            <span>Missions Ledger ({filteredMissions.length})</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-[#2A2A2A] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">Planned</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filteredMissions.map((m) => {
              const isSelected = selectedMission?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMission(m)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-white border-[#4F6F52] shadow-md ring-2 ring-[#4F6F52]/20' 
                      : 'bg-white border-[#E8E1D5] hover:border-[#DDD5C7] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-[#2A2A2A]">{m.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      m.status === 'COMPLETED' ? 'bg-[#4F6F52]/15 text-[#4F6F52]' :
                      m.status === 'ACTIVE' ? 'bg-[#FF6F59]/15 text-[#FF6F59] animate-pulse' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-[#2A2A2A]">{m.title}</h4>
                  <p className="text-[11px] text-[#736B5E] mt-0.5">{m.locationName} • {m.vesselName}</p>

                  <div className="mt-3 pt-2 border-t border-[#F2EDE4] flex items-center justify-between text-[10px] font-bold">
                    <span className="text-[#8C8275]">Scheduled: {m.scheduledDate}</span>
                    <span className="text-[#4F6F52]">
                      {m.debrisCollectedKg ? `${m.debrisCollectedKg} kg Collected` : 'Tonnage Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Mission Inspector & Before/After Evidence (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedMission ? (
            <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-6">
              
              {/* Mission Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#736B5E]">{selectedMission.id}</span>
                    <span className="text-xs text-[#8C8275]">• {selectedMission.scheduledDate}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#2A2A2A]">
                    {selectedMission.title}
                  </h2>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-1.5 bg-[#F9F6F0] p-1.5 rounded-2xl border border-[#E3DBD0]">
                  {(['PLANNED', 'ACTIVE', 'COMPLETED'] as MissionStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-extrabold transition-all ${
                        selectedMission.status === st 
                          ? 'bg-[#4F6F52] text-white shadow-xs' 
                          : 'text-[#736B5E] hover:text-[#2A2A2A]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Before & After Evidence Photo Comparison */}
              {(selectedMission.beforePhoto || selectedMission.afterPhoto) && (
                <div>
                  <h4 className="text-xs font-extrabold text-[#2A2A2A] uppercase tracking-wider mb-2">
                    Before & After Haul Evidence
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedMission.beforePhoto && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#E8E1D5]">
                        <img 
                          src={selectedMission.beforePhoto} 
                          alt="Before" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          BEFORE RECOVERY
                        </div>
                      </div>
                    )}
                    {selectedMission.afterPhoto && (
                      <div className="relative rounded-2xl overflow-hidden aspect-video border border-[#E8E1D5]">
                        <img 
                          src={selectedMission.afterPhoto} 
                          alt="After" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#4F6F52]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          CLEAN SEABED (AFTER)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Operational Detail Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold text-[#736B5E] uppercase">Vessel Assigned</span>
                  <p className="font-extrabold text-[#2A2A2A] mt-0.5 truncate">{selectedMission.vesselName}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold text-[#736B5E] uppercase">Dive Lead</span>
                  <p className="font-extrabold text-[#2A2A2A] mt-0.5">{selectedMission.leader}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                  <span className="text-[10px] font-bold text-[#736B5E] uppercase">Haul Weight</span>
                  <p className="font-black text-[#4F6F52] mt-0.5">{selectedMission.debrisCollectedKg || 0} kg</p>
                </div>
              </div>

              {/* Mission Notes */}
              <div className="p-4 rounded-2xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2A2A2A]">
                  <Sparkles className="w-3.5 h-3.5 text-[#4F6F52]" />
                  <span>Mission Tactical Briefing</span>
                </div>
                <p className="text-[11px] text-[#5C5449] leading-relaxed">
                  {typeof selectedMission.notes === 'string' ? selectedMission.notes : 'Technical diving team equipped with pneumatically powered net cutters and lift bags.'}
                </p>
              </div>

              {/* Route Waypoints */}
              <div>
                <h4 className="text-xs font-extrabold text-[#2A2A2A] uppercase tracking-wider mb-2">
                  Navigation Waypoints
                </h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {selectedMission.routeCoordinates?.map((pt, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-[#F9F6F0] border border-[#E8E1D5] text-[#2A2A2A] font-bold">
                      WP-{idx + 1}: {Array.isArray(pt) ? `${pt[0]}°N, ${pt[1]}°E` : ''}
                    </span>
                  ))}
                </div>
              </div>


            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#E8E1D5] text-center text-[#736B5E]">
              <p className="text-xs font-bold">Select a mission to inspect operations</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal to Plan New Mission */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 p-4 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowNewModal(false)} />
          
          <div className="relative w-full max-w-lg bg-[#F9F6F0] rounded-3xl border border-[#E3DBD0] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-extrabold text-[#2A2A2A]">Schedule New Cleanup Mission</h3>
            
            <form onSubmit={handleCreateMission} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5C5449] mb-1">Mission Codename / Objective</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Operation Deep Reef Ghost Net Haul"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#4F6F52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C5449] mb-1">Target Maritime Sector</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#4F6F52] focus:outline-none"
                >
                  <option value="Sector 4B - Gulf of Mannar">Sector 4B - Gulf of Mannar</option>
                  <option value="Sector 2A - Palk Bay Estuary">Sector 2A - Palk Bay Estuary</option>
                  <option value="Sector 1C - Coral Sanctuary">Sector 1C - Coral Sanctuary</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5C5449] mb-1">Assigned Vessel & Squad</label>
                <input
                  type="text"
                  value={newVessel}
                  onChange={(e) => setNewVessel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#4F6F52] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C5449] mb-1">Expedition Lead</label>
                  <input
                    type="text"
                    value={newLead}
                    onChange={(e) => setNewLead(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#4F6F52] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5C5449] mb-1">Deployment Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E3DBD0] text-xs focus:border-[#4F6F52] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#4F6F52] text-white text-xs font-bold hover:bg-[#3E5841]"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
