import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Filter, 
  Search, 
  Radar, 
  Eye, 
  Plane, 
  Layers, 
  Download, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DetectionRecord } from '../../types';

interface DetectionHistoryProps {
  detections?: DetectionRecord[];
  onNavigate: (view: string, id?: string) => void;
}

export const DetectionHistory: React.FC<DetectionHistoryProps> = ({ detections = [], onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const safeDetections = detections || [];

  const filtered = safeDetections.filter(d => {
    const matchesSearch = 
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.location?.sector && d.location.sector.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = sourceFilter === 'ALL' || d.source === sourceFilter;
    const matchesSeverity = severityFilter === 'ALL' || d.severity === severityFilter;

    return matchesSearch && matchesSource && matchesSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              Audit & Timeline
            </span>
            <span className="text-xs text-[#736B5E]">Historical Telemetry Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Detection History & Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Searchable log of all sonar, drone, and camera detections with historical recurrence analysis.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-[#E8E1D5] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8275]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, debris class, or sector..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] text-xs font-medium focus:border-[#FF6F59] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] font-bold text-[#2A2A2A] focus:outline-none"
          >
            <option value="ALL">All Sensors</option>
            <option value="SONAR">Side-Scan Sonar</option>
            <option value="DRONE">Aerial Drone</option>
            <option value="CAMERA">Vessel Camera</option>
            <option value="FUSION">Multimodal Fusion</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] font-bold text-[#2A2A2A] focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

      </div>

      {/* Timeline Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F0] text-[#736B5E] uppercase text-[10px] font-extrabold border-b border-[#E8E1D5]">
              <tr>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Target ID</th>
                <th className="py-3.5 px-4">Debris Category</th>
                <th className="py-3.5 px-4">Sensor Source</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Sector & Depth</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#F9F6F0]/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[#736B5E]">
                    {new Date(d.timestamp).toLocaleDateString()} {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2A2A2A]">{d.id}</td>
                  <td className="py-3.5 px-4 font-bold text-[#2A2A2A]">{d.category}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      d.source === 'SONAR' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                      d.source === 'DRONE' ? 'bg-[#4F6F52]/15 text-[#4F6F52]' :
                      d.source === 'FUSION' ? 'bg-[#2A2A2A] text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {d.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#2A2A2A]">{Math.round(d.confidence * 100)}%</td>
                  <td className="py-3.5 px-4 text-[#5C5449]">
                    {d.location.sector} {d.location.depthMeters ? `(${d.location.depthMeters}m)` : ''}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      d.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      d.severity === 'HIGH' ? 'bg-[#FF6F59]/15 text-[#FF6F59]' :
                      'bg-[#4F6F52]/15 text-[#4F6F52]'
                    }`}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigate(d.source === 'SONAR' ? 'sonar' : 'surface', d.id)}
                      className="px-3 py-1 rounded-lg bg-[#F2EDE4] hover:bg-[#FF6F59] hover:text-white text-xs font-bold text-[#2A2A2A] transition-colors"
                    >
                      View
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
