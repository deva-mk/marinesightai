import React, { useState } from 'react';
import { 
  DetectionRecord, 
  IncidentRecord, 
  CleanupMission, 
  LiveStreamEvent,
  DebrisCategory
} from '../../types';
import { 
  Radar, 
  Eye, 
  Layers, 
  AlertTriangle, 
  Ship, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowRight,
  Filter,
  Sparkles,
  Radio,
  Clock,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

interface MainOverviewDashboardProps {
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  missions?: CleanupMission[];
  liveStream?: LiveStreamEvent[];
  onNavigate: (view: string, targetId?: string) => void;
  onOpenSimulator: () => void;
}

export const MainOverviewDashboard: React.FC<MainOverviewDashboardProps> = ({
  detections = [],
  incidents = [],
  missions = [],
  liveStream = [],
  onNavigate,
  onOpenSimulator
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const safeDetections = detections || [];
  const safeIncidents = incidents || [];
  const safeMissions = missions || [];
  const safeLiveStream = liveStream || [];

  // KPI Calculations
  const totalDetections = safeDetections.length;
  const highRiskDebris = safeDetections.filter(d => d.severity === 'CRITICAL' || d.severity === 'HIGH').length;
  const activeIncidents = safeIncidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length;
  const totalDebrisRemovedKg = safeMissions
    .filter(m => m.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (curr.debrisCollectedKg || 0), 0);
  
  const sonarCount = safeDetections.filter(d => d.source === 'SONAR').length;
  const droneCameraCount = safeDetections.filter(d => d.source === 'DRONE' || d.source === 'CAMERA').length;
  const activeMissionsCount = safeMissions.filter(m => m.status === 'ACTIVE').length;

  // Category counts
  const categoryCounts = safeDetections.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories: [string, number][] = (Object.entries(categoryCounts) as [string, number][])
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5);

  // Filtered recent detections
  const filteredRecent = safeDetections.filter(d => {
    if (categoryFilter === 'ALL') return true;
    return d.category === categoryFilter;
  }).slice(0, 8);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Operational Command
            </span>
            <span className="text-xs text-[#736B5E]">Gulf of Mannar & Palk Bay Sector Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Marine Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Real-time acoustic sonar, aerial drone vision, and automated cleanup mission tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time range selector */}
          <div className="flex bg-[#F2EDE4] p-1 rounded-xl border border-[#DDD5C7]">
            {(['7d', '30d', '90d', '1y'] as const).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  timeRange === tr 
                    ? 'bg-[#FF6F59] text-white shadow-xs' 
                    : 'text-[#5C5449] hover:text-[#2A2A2A]'
                }`}
              >
                {tr.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4F6F52] hover:bg-[#3E5841] text-white text-xs font-bold transition-all shadow-sm shadow-[#4F6F52]/20"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Simulate Scan</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Detections */}
        <div 
          onClick={() => onNavigate('history')}
          className="p-5 rounded-3xl bg-white border border-[#E8E1D5] hover:border-[#FF6F59] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#736B5E] uppercase tracking-wider">Total Detections</span>
            <div className="p-2 rounded-xl bg-[#FF6F59]/10 text-[#FF6F59] group-hover:scale-110 transition-transform">
              <Radar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2A2A2A] tracking-tight">{totalDetections}</span>
            <span className="text-xs font-bold text-[#4F6F52] flex items-center">
              +14% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-[#8C8275] mt-1">Across 6 Maritime Sectors</p>
        </div>

        {/* 2. High Risk Debris */}
        <div 
          onClick={() => onNavigate('incidents')}
          className="p-5 rounded-3xl bg-white border border-[#E8E1D5] hover:border-red-500 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#736B5E] uppercase tracking-wider">High Risk Debris</span>
            <div className="p-2 rounded-xl bg-red-100 text-red-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600 tracking-tight">{highRiskDebris}</span>
            <span className="text-xs font-bold text-red-500">Critical Priority</span>
          </div>
          <p className="text-[11px] text-[#8C8275] mt-1">Ghost fishing nets & traps</p>
        </div>

        {/* 3. Active Incidents */}
        <div 
          onClick={() => onNavigate('incidents')}
          className="p-5 rounded-3xl bg-white border border-[#E8E1D5] hover:border-[#FF6F59] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#736B5E] uppercase tracking-wider">Active Incidents</span>
            <div className="p-2 rounded-xl bg-[#FF6F59]/15 text-[#FF6F59] group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2A2A2A] tracking-tight">{activeIncidents}</span>
            <span className="text-xs font-bold text-[#FF6F59]">In Workflow</span>
          </div>
          <p className="text-[11px] text-[#8C8275] mt-1">Assigned & In Progress</p>
        </div>

        {/* 4. Debris Removed (kg) */}
        <div 
          onClick={() => onNavigate('cleanup')}
          className="p-5 rounded-3xl bg-white border border-[#E8E1D5] hover:border-[#4F6F52] transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#736B5E] uppercase tracking-wider">Debris Recovered</span>
            <div className="p-2 rounded-xl bg-[#4F6F52]/15 text-[#4F6F52] group-hover:scale-110 transition-transform">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#4F6F52] tracking-tight">{totalDebrisRemovedKg} kg</span>
            <span className="text-xs font-bold text-[#4F6F52]">Haul Verified</span>
          </div>
          <p className="text-[11px] text-[#8C8275] mt-1">Over 10 Clean Missions</p>
        </div>

      </div>

      {/* Second Row: Live Detection Stream + Category Matrix + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Telemetry Detection Stream */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F6F52] animate-ping" />
                <h3 className="font-extrabold text-sm text-[#2A2A2A]">Live Detection Stream</h3>
              </div>
              <span className="text-[10px] font-bold text-[#4F6F52] px-2 py-0.5 rounded-full bg-[#4F6F52]/10">
                REALTIME
              </span>
            </div>

            <div className="space-y-2.5">
              {safeLiveStream.slice(0, 5).map((evt) => (
                <div 
                  key={evt.id}
                  onClick={() => onNavigate('fusion')}
                  className="p-3 rounded-2xl bg-[#F9F6F0] hover:bg-[#F2EDE4] border border-[#E8E1D5] flex items-center justify-between cursor-pointer transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono font-bold text-[#8C8275]">{evt.timestamp}</span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      evt.source === 'SONAR' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                      evt.source === 'DRONE' ? 'bg-[#4F6F52]/15 text-[#4F6F52]' :
                      evt.source === 'FUSION' ? 'bg-[#2A2A2A] text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {evt.source}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#2A2A2A] leading-tight">{evt.category}</p>
                      <p className="text-[10px] text-[#736B5E]">{evt.location}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#2A2A2A]">
                    {Math.round(evt.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('live')}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#F2EDE4] hover:bg-[#EAE4D9] text-xs font-bold text-[#2A2A2A] flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Real-Time Camera Radar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#2A2A2A] mb-4">Debris Distribution by Class</h3>
            
            <div className="space-y-3">
              {topCategories.map(([cat, count], idx) => {
                const pct = Math.round((Number(count) / (totalDetections || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2A2A2A]">
                      <span>{cat}</span>
                      <span className="text-[#736B5E]">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-[#FF6F59]' : idx === 1 ? 'bg-[#4F6F52]' : idx === 2 ? 'bg-[#2A2A2A]' : 'bg-[#D98E73]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-xs text-[#736B5E]">
            <span>Dominant: <strong className="text-[#FF6F59]">Ghost Fishing Gear</strong></span>
            <button onClick={() => onNavigate('analytics')} className="font-bold text-[#4F6F52] hover:underline">
              View Analytics
            </button>
          </div>
        </div>

        {/* Sensor Source Comparison & Map Preview */}
        <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#2A2A2A] mb-3">Multimodal Sensor Matrix</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#FF6F59] uppercase">
                  <Radar className="w-3.5 h-3.5" /> Sonar Acoustic
                </div>
                <p className="text-xl font-black text-[#2A2A2A] mt-1">{sonarCount}</p>
                <p className="text-[10px] text-[#736B5E]">Seafloor benthic</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#4F6F52] uppercase">
                  <Eye className="w-3.5 h-3.5" /> Aerial & Optical
                </div>
                <p className="text-xl font-black text-[#2A2A2A] mt-1">{droneCameraCount}</p>
                <p className="text-[10px] text-[#736B5E]">Surface & Drone</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#4F6F52]/10 to-[#FF6F59]/10 border border-[#4F6F52]/20 text-left">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-[#FF6F59]" />
                <span className="text-xs font-bold text-[#2A2A2A]">Multimodal Fusion Active</span>
              </div>
              <p className="text-[11px] text-[#5C5449] leading-tight">
                Correlating 14 paired sonar acoustic shadows with surface buoy coordinates.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('hotspots')}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Pollution Hotspot Map</span>
          </button>
        </div>

      </div>

      {/* Recent Detections Data Table */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#2A2A2A]">Recent Marine Detections</h3>
            <p className="text-xs text-[#736B5E]">Real-time detection ledger across autonomous transducers & vision pipelines</p>
          </div>

          {/* Filter Pill */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8C8275]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-bold text-[#2A2A2A] focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Ghost Fishing Gear">Ghost Fishing Gear</option>
              <option value="Plastic">Plastic</option>
              <option value="Derelict Crab Pot">Derelict Crab Pot</option>
              <option value="Fishing Net">Fishing Net</option>
              <option value="Tire">Tire</option>
              <option value="Metal Debris">Metal Debris</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] text-[#736B5E] uppercase text-[10px] font-extrabold border-y border-[#E8E1D5]">
              <tr>
                <th className="py-3 px-3">Detection ID</th>
                <th className="py-3 px-3">Debris Category</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3">Location & Depth</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {filteredRecent.map((d) => (
                <tr key={d.id} className="hover:bg-[#F9F6F0]/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#2A2A2A]">{d.id}</td>
                  <td className="py-3 px-3 font-bold text-[#2A2A2A]">{d.category}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      d.source === 'SONAR' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                      d.source === 'DRONE' ? 'bg-[#4F6F52]/15 text-[#4F6F52]' :
                      d.source === 'FUSION' ? 'bg-[#2A2A2A] text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {d.source}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-[#2A2A2A]">
                    {Math.round(d.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3 text-[#5C5449]">
                    {d.location.sector} {d.location.depthMeters ? `(${d.location.depthMeters}m)` : ''}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      d.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      d.severity === 'HIGH' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                      d.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-[#4F6F52]/15 text-[#4F6F52]'
                    }`}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#736B5E]">{d.status}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate(d.source === 'SONAR' ? 'sonar' : 'surface', d.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#F2EDE4] hover:bg-[#FF6F59] hover:text-white text-[11px] font-bold text-[#2A2A2A] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
