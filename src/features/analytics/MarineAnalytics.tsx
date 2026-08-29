import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Filter, 
  Download, 
  Layers, 
  Ship,
  Radar,
  Eye
} from 'lucide-react';
import { DetectionRecord, CleanupMission } from '../../types';

interface MarineAnalyticsProps {
  detections?: DetectionRecord[];
  missions?: CleanupMission[];
}

export const MarineAnalytics: React.FC<MarineAnalyticsProps> = ({ detections = [], missions = [] }) => {
  const safeDetections = detections || [];
  const safeMissions = missions || [];
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('30d');

  // Month-by-month recovery data simulation
  const monthlyRecovery = [
    { month: 'Jan', sonarDetections: 12, visionDetections: 18, kgCollected: 180 },
    { month: 'Feb', sonarDetections: 15, visionDetections: 22, kgCollected: 240 },
    { month: 'Mar', sonarDetections: 19, visionDetections: 29, kgCollected: 310 },
    { month: 'Apr', sonarDetections: 24, visionDetections: 35, kgCollected: 420 },
    { month: 'May', sonarDetections: 28, visionDetections: 41, kgCollected: 510 },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20 uppercase">
              Analytical Metrics
            </span>
            <span className="text-xs text-[#736B5E]">Historical Trends & Ecological Impact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Marine Analytics & Recovery Trends
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Analyze multi-sensor detection volumes, monthly tonnage removed, and hotspot persistence rates.
          </p>
        </div>

        <div className="flex bg-[#F2EDE4] p-1 rounded-xl border border-[#DDD5C7]">
          {(['30d', '90d', '1y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                timeframe === tf ? 'bg-[#FF6F59] text-white shadow-xs' : 'text-[#736B5E] hover:text-[#2A2A2A]'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Recovery Trend Bars */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#2A2A2A]">
              Monthly Debris Recovery Volume (kg) vs AI Detection Count
            </h3>
            <p className="text-xs text-[#736B5E]">Comparing benthic sonar hits against recovered tonnage</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#4F6F52]" />
              <span className="text-[#5C5449]">Debris Removed (kg)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#FF6F59]" />
              <span className="text-[#5C5449]">Sonar Detections</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart Render */}
        <div className="h-64 flex items-end justify-between gap-4 pt-8 border-b border-[#E8E1D5] px-4">
          {monthlyRecovery.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full max-w-[48px] flex items-end gap-1.5 h-full">
                {/* Debris kg bar */}
                <div 
                  className="w-1/2 bg-[#4F6F52] rounded-t-lg transition-all group-hover:brightness-110"
                  style={{ height: `${(item.kgCollected / 600) * 100}%` }}
                  title={`${item.kgCollected} kg collected`}
                />
                {/* Sonar bar */}
                <div 
                  className="w-1/2 bg-[#FF6F59] rounded-t-lg transition-all group-hover:brightness-110"
                  style={{ height: `${(item.sonarDetections / 35) * 100}%` }}
                  title={`${item.sonarDetections} sonar detections`}
                />
              </div>
              <span className="text-xs font-bold text-[#736B5E]">{item.month}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold">Average Monthly Recovery:</span>
            <p className="text-xl font-black text-[#4F6F52] mt-0.5">332 kg / month</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold">Sonar-to-Haul Conversion:</span>
            <p className="text-xl font-black text-[#FF6F59] mt-0.5">91.4% Verified</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
            <span className="text-[#736B5E] font-bold">Coral Recovery Index:</span>
            <p className="text-xl font-black text-[#2A2A2A] mt-0.5">+38% Biodiversity</p>
          </div>
        </div>
      </div>

    </div>
  );
};
