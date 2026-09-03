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
  FileSpreadsheet,
  Plus,
  Crosshair
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
    <div className="space-y-6 pb-12 text-white">
      
      {/* Header Banner in Heynesh style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121316] p-6 rounded-3xl border border-[#20232A] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-[#FFFF23] text-black tracking-wider uppercase shadow-[0_0_10px_rgba(255,255,35,0.3)]">
              OPERATIONAL COMMAND
            </span>
            <span className="text-xs text-stone-400 font-mono">Gulf of Mannar & Palk Bay Sector Grid</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Marine Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Real-time acoustic sonar, optical drone vision, and automated cleanup mission dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          {/* Time range selector */}
          <div className="flex bg-[#0C0D0E] p-1 rounded-xl border border-[#25282F]">
            {(['7d', '30d', '90d', '1y'] as const).map((tr) => (
              <button
                key={tr}
                onClick={() => setTimeRange(tr)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  timeRange === tr 
                    ? 'bg-[#FFFF23] text-black shadow-xs font-black' 
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {tr.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-black tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(255,255,35,0.3)]"
          >
            <Radio className="w-3.5 h-3.5 text-black animate-pulse" />
            <span>Simulate Scan</span>
          </button>
        </div>
      </div>

      {/* Top KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Detections */}
        <div 
          onClick={() => onNavigate('history')}
          className="p-5 rounded-3xl bg-[#121316] border border-[#20232A] hover:border-[#FFFF23]/60 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Total Detections</span>
            <div className="p-2 rounded-xl bg-[#FFFF23]/15 text-[#FFFF23] group-hover:scale-110 transition-transform">
              <Radar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{totalDetections}</span>
            <span className="text-xs font-bold text-[#2DD4BF] flex items-center font-mono">
              ACTIVE <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">Across Maritime Sectors</p>
        </div>

        {/* 2. High Risk Debris */}
        <div 
          onClick={() => onNavigate('incidents')}
          className="p-5 rounded-3xl bg-[#121316] border border-[#20232A] hover:border-red-500/60 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">High Risk Debris</span>
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-400 tracking-tight">{highRiskDebris}</span>
            <span className="text-xs font-mono font-bold text-red-400">Critical Priority</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">Ghost nets & hazard items</p>
        </div>

        {/* 3. Active Incidents */}
        <div 
          onClick={() => onNavigate('incidents')}
          className="p-5 rounded-3xl bg-[#121316] border border-[#20232A] hover:border-[#FFFF23]/60 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Active Incidents</span>
            <div className="p-2 rounded-xl bg-[#FFFF23]/15 text-[#FFFF23] group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white tracking-tight">{activeIncidents}</span>
            <span className="text-xs font-mono font-bold text-[#FFFF23]">In Workflow</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">Assigned & In Progress</p>
        </div>

        {/* 4. Debris Removed (kg) */}
        <div 
          onClick={() => onNavigate('cleanup')}
          className="p-5 rounded-3xl bg-[#121316] border border-[#20232A] hover:border-[#2DD4BF]/60 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-stone-400 uppercase tracking-wider">Debris Recovered</span>
            <div className="p-2 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] group-hover:scale-110 transition-transform">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#2DD4BF] tracking-tight">{totalDebrisRemovedKg} kg</span>
            <span className="text-xs font-mono font-bold text-[#2DD4BF]">Haul Verified</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 font-mono">Logged from Missions</p>
        </div>

      </div>

      {/* Clean Slate / Zero Data State Banner if empty */}
      {totalDetections === 0 && (
        <div className="p-8 rounded-3xl bg-[#121316] border border-[#20232A] shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFFF23]/15 text-[#FFFF23] mx-auto flex items-center justify-center border border-[#FFFF23]/30 shadow-[0_0_20px_rgba(255,255,35,0.2)]">
            <Crosshair className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Clean Operational Slate</h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto mt-1">
              All predefined records have been wiped. Run object-level detection on surface photos, analyze acoustic sonar scans, or simulate sensor streams to begin logging live data.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('surface')}
              className="px-4 py-2 rounded-xl bg-[#FFFF23] text-black text-xs font-black tracking-wide uppercase hover:bg-white transition-all shadow-[0_0_15px_rgba(255,255,35,0.3)]"
            >
              Surface Vision Detection
            </button>
            <button
              onClick={() => onNavigate('sonar')}
              className="px-4 py-2 rounded-xl bg-[#1A1C22] text-white border border-[#25282F] hover:border-[#2DD4BF] text-xs font-bold transition-all"
            >
              Side-Scan Sonar Analysis
            </button>
            <button
              onClick={onOpenSimulator}
              className="px-4 py-2 rounded-xl bg-[#1A1C22] text-[#2DD4BF] border border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/10 text-xs font-bold transition-all"
            >
              Run Sensor Simulator
            </button>
          </div>
        </div>
      )}

      {/* Second Row: Live Detection Stream + Category Matrix + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Telemetry Detection Stream */}
        <div className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFFF23] animate-ping shadow-[0_0_8px_#FFFF23]" />
                <h3 className="font-extrabold text-sm text-white">Live Stream Ingest</h3>
              </div>
              <span className="text-[10px] font-mono font-black text-[#FFFF23] px-2 py-0.5 rounded bg-[#FFFF23]/15 border border-[#FFFF23]/30">
                REALTIME
              </span>
            </div>

            <div className="space-y-2.5">
              {safeLiveStream.length === 0 ? (
                <div className="py-8 text-center text-stone-500 text-xs font-mono">
                  No incoming live stream packets.
                </div>
              ) : (
                safeLiveStream.slice(0, 5).map((evt) => (
                  <div 
                    key={evt.id}
                    onClick={() => onNavigate('fusion')}
                    className="p-3 rounded-2xl bg-[#0C0D0E] hover:bg-[#1A1C22] border border-[#20232A] hover:border-[#FFFF23]/40 flex items-center justify-between cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold text-stone-500">{evt.timestamp}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FFFF23] text-black">
                        {evt.source}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{evt.category}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{evt.location}</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-[#FFFF23]">
                      {Math.round(evt.confidence * 100)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('live')}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#1A1C22] hover:bg-[#25282F] border border-[#25282F] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Open Real-Time Camera Radar</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FFFF23]" />
          </button>
        </div>

        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white mb-4">Debris Distribution by Class</h3>
            
            {topCategories.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs font-mono">
                No categorized debris yet. Upload an image to classify.
              </div>
            ) : (
              <div className="space-y-3">
                {topCategories.map(([cat, count], idx) => {
                  const pct = Math.round((Number(count) / (totalDetections || 1)) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-300">
                        <span>{cat}</span>
                        <span className="text-stone-400 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#0C0D0E] rounded-full overflow-hidden border border-[#20232A]">
                        <div 
                          className="h-full rounded-full bg-[#FFFF23] shadow-[0_0_8px_rgba(255,255,35,0.5)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#20232A] flex items-center justify-between text-xs text-stone-400">
            <span>Object Classification Engine: <strong className="text-[#FFFF23]">Active</strong></span>
            <button onClick={() => onNavigate('analytics')} className="font-bold text-[#FFFF23] hover:underline font-mono">
              View Analytics
            </button>
          </div>
        </div>

        {/* Sensor Source Comparison & Map Preview */}
        <div className="p-6 rounded-3xl bg-[#121316] border border-[#20232A] shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white mb-3">Multimodal Sensor Matrix</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-[#0C0D0E] border border-[#20232A]">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#FFFF23] uppercase">
                  <Radar className="w-3.5 h-3.5" /> Sonar Acoustic
                </div>
                <p className="text-xl font-black text-white mt-1">{sonarCount}</p>
                <p className="text-[10px] text-stone-400">Seafloor benthic</p>
              </div>

              <div className="p-3 rounded-2xl bg-[#0C0D0E] border border-[#20232A]">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#2DD4BF] uppercase">
                  <Eye className="w-3.5 h-3.5" /> Aerial & Optical
                </div>
                <p className="text-xl font-black text-white mt-1">{droneCameraCount}</p>
                <p className="text-[10px] text-stone-400">Surface & Drone</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0C0D0E] border border-[#25282F] text-left">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-[#FFFF23]" />
                <span className="text-xs font-bold text-white">Object-Level Telemetry</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-tight">
                High-precision bounding box coordinates with localized confidence scores across camera and acoustic feeds.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('hotspots')}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#FFFF23] hover:bg-white text-black text-xs font-black tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(255,255,35,0.3)]"
          >
            <Compass className="w-3.5 h-3.5 text-black" />
            <span>Open Pollution Hotspot Map</span>
          </button>
        </div>

      </div>

      {/* Recent Detections Data Table */}
      <div className="bg-[#121316] p-6 rounded-3xl border border-[#20232A] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-white">Recent Marine Detections</h3>
            <p className="text-xs text-stone-400">Real-time detection ledger across autonomous transducers & vision pipelines</p>
          </div>

          {/* Filter Pill */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#0C0D0E] border border-[#20232A] text-xs font-bold text-white focus:outline-none focus:border-[#FFFF23]"
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
            <thead className="bg-[#0C0D0E] text-stone-400 uppercase text-[10px] font-mono font-bold border-y border-[#20232A]">
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
            <tbody className="divide-y divide-[#20232A]">
              {filteredRecent.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500 font-mono text-xs">
                    No detections found. Use Surface Vision or Sonar to analyze live imagery.
                  </td>
                </tr>
              ) : (
                filteredRecent.map((d) => (
                  <tr key={d.id} className="hover:bg-[#181A20] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#FFFF23]">{d.id}</td>
                    <td className="py-3 px-3 font-bold text-white">{d.category}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFF23] text-black">
                        {d.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {Math.round(d.confidence * 100)}%
                    </td>
                    <td className="py-3 px-3 text-stone-400 font-mono">
                      {d.location.sector} {d.location.depthMeters ? `(${d.location.depthMeters}m)` : ''}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        d.severity === 'HIGH' ? 'bg-[#FFFF23]/20 text-[#FFFF23] border border-[#FFFF23]/30' :
                        d.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                        'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                      }`}>
                        {d.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-400">{d.status}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate(d.source === 'SONAR' ? 'sonar' : 'surface', d.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#1F2228] hover:bg-[#FFFF23] hover:text-black text-[11px] font-bold text-white transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
