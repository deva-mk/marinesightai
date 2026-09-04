import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { DetectionRecord, IncidentRecord, CleanupMission } from '../../types';

interface ReportsCenterProps {
  detections?: DetectionRecord[];
  incidents?: IncidentRecord[];
  missions?: CleanupMission[];
}

export const ReportsCenter: React.FC<ReportsCenterProps> = ({
  detections = [],
  incidents = [],
  missions = []
}) => {
  const safeDetections = detections || [];
  const safeIncidents = incidents || [];
  const safeMissions = missions || [];

  const [reportTitle, setReportTitle] = useState('MarineSight AI Marine Ecological Assessment Report');
  const [reportType, setReportType] = useState<'EXECUTIVE' | 'AUDIT' | 'CLEANUP'>('EXECUTIVE');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Category', 'Source', 'Confidence', 'Sector', 'Depth', 'Severity', 'Timestamp'];
    const rows = safeDetections.map(d => [
      d.id,
      d.category,
      d.source,
      `${Math.round(d.confidence * 100)}%`,
      `"${d.location?.sector || ''}"`,
      d.location?.depthMeters || 0,
      d.severity,
      d.timestamp
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MarineSight_AI_Detections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      platform: 'MarineSight AI Marine Intelligence v2.5',
      summary: {
        totalDetections: detections.length,
        totalIncidents: incidents.length,
        totalMissions: missions.length
      },
      detections,
      incidents,
      missions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MarineSight_AI_FullDataset_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              Regulatory Export
            </span>
            <span className="text-xs text-[#736B5E]">Standardized Maritime Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Reports & Data Export Center
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Generate executive compliance summaries, print official dive permits, or export telemetry datasets.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] hover:bg-[#F2EDE4] transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#4F6F52]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] hover:bg-[#F2EDE4] transition-all shadow-xs"
          >
            <FileCode className="w-4 h-4 text-[#FF6F59]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] text-white text-xs font-bold transition-all shadow-sm shadow-[#FF6F59]/30"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Preview Document Card */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E1D5] shadow-lg max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#2A2A2A] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#FF6F59]">MARINESIGHT AI MARINE INTELLIGENCE</span>
              <span className="text-xs text-[#736B5E]">| Ref: MSA-REP-2025-05</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2A2A2A] mt-1">
              Executive Marine Debris & Ghost Gear Brief
            </h2>
            <p className="text-xs text-[#736B5E] mt-1">
              Gulf of Mannar Biosphere Reserve & Palk Bay Sector Grid
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="font-bold text-[#2A2A2A]">Date: {new Date().toLocaleDateString()}</p>
            <p className="text-[#736B5E]">Classification: <strong>OPERATIONAL RESTRICTED</strong></p>
            <p className="text-[#736B5E]">Auth: Indian Maritime Coast Guard</p>
          </div>
        </div>

        {/* Executive Summary Paragraphs */}
        <div className="space-y-4 text-xs text-[#5C5449] leading-relaxed">
          <h3 className="font-extrabold text-sm text-[#2A2A2A] uppercase tracking-wider">
            1. Executive Assessment & Telemetry Summary
          </h3>
          <p>
            During the operational survey cycle, MarineSight AI autonomous side-scan sonar transducers and UAV aerial sweeps identified <strong>{detections.length} discrete debris anomalies</strong> across 6 maritime sectors. Of these targets, <strong>{detections.filter(d => d.severity === 'CRITICAL').length} represent critical ghost fishing nets</strong> entangling coral reefs in Sector 4B.
          </p>
          <p>
            Through multimodal sensor fusion, 14 seafloor acoustic shadows were successfully joined with surface buoy telemetry, eliminating false positives and yielding an estimated <strong>1,280 kg of recoverable monofilament and derelict crab pots</strong>.
          </p>
        </div>

        {/* Key Metrics Summary Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-[#2A2A2A] uppercase tracking-wider">
            2. Operational Metrics Overview
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
              <span className="text-[10px] font-bold text-[#736B5E] uppercase">Total Detections</span>
              <p className="text-xl font-black text-[#2A2A2A] mt-1">{detections.length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
              <span className="text-[10px] font-bold text-[#736B5E] uppercase">Critical Threats</span>
              <p className="text-xl font-black text-red-600 mt-1">{detections.filter(d => d.severity === 'CRITICAL').length}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
              <span className="text-[10px] font-bold text-[#736B5E] uppercase">Debris Recovered</span>
              <p className="text-xl font-black text-[#4F6F52] mt-1">1,280 kg</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
              <span className="text-[10px] font-bold text-[#736B5E] uppercase">AI Confidence Mean</span>
              <p className="text-xl font-black text-[#FF6F59] mt-1">94.2%</p>
            </div>
          </div>
        </div>

        {/* Priority Incident Table in Report */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm text-[#2A2A2A] uppercase tracking-wider">
            3. Critical Action Items
          </h3>

          <div className="border border-[#E8E1D5] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F6F0] text-[#736B5E] text-[10px] uppercase font-extrabold border-b border-[#E8E1D5]">
                <tr>
                  <th className="p-3">Incident ID</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EDE4]">
                {safeIncidents.slice(0, 4).map((inc) => (
                  <tr key={inc.id}>
                    <td className="p-3 font-mono font-bold text-[#2A2A2A]">{inc.id}</td>
                    <td className="p-3 font-medium text-[#2A2A2A]">{inc.title}</td>
                    <td className="p-3 text-[#5C5449]">{inc.location?.sector || ''}</td>
                    <td className="p-3 font-bold text-red-600">{inc.priorityScore} / 100</td>
                    <td className="p-3 font-semibold text-[#736B5E]">{inc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures & Certification Block */}
        <div className="pt-8 border-t border-[#E8E1D5] grid grid-cols-2 gap-8 text-xs text-[#5C5449]">
          <div>
            <p className="font-bold text-[#2A2A2A]">Chief Oceanographic Scientist</p>
            <div className="h-10 border-b border-dashed border-[#8C8275] my-2" />
            <p className="text-[11px] text-[#736B5E]">Dr. Aris Thorne, Ph.D. (Marine Ecology)</p>
          </div>

          <div>
            <p className="font-bold text-[#2A2A2A]">Operational Fleet Commander</p>
            <div className="h-10 border-b border-dashed border-[#8C8275] my-2" />
            <p className="text-[11px] text-[#736B5E]">Cmdr. Sarah Connor (Field Response)</p>
          </div>
        </div>

      </div>

    </div>
  );
};
