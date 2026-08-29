import React, { useState } from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Waves, 
  Wind, 
  Compass, 
  Layers, 
  Sparkles, 
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { RiskAssessment } from '../../types';

export const RiskPrediction: React.FC = () => {
  const [selectedArea, setSelectedArea] = useState('Sector 4B - Coral Sanctuary Shelf');

  const riskFactors = [
    { name: 'Tidal Eddy Recirculation', weight: '35%', score: 92, status: 'HIGH ACCUMULATION', desc: 'Clockwise hydrodynamic eddy traps floating debris indefinitely.' },
    { name: 'Commercial Fishing Density', weight: '25%', score: 88, status: 'ELEVATED ACTIVITY', desc: 'Frequent gillnet and trawler passage within 12nm boundary.' },
    { name: 'Bathymetric Coral Snag Index', weight: '20%', score: 94, status: 'CRITICAL HAZARD', desc: 'Sharp underwater pinnacles cause gear snagging and detachment.' },
    { name: 'Monsoon Seasonal Current Vector', weight: '20%', score: 76, status: 'MODERATE SHIFT', desc: 'Southwest monsoon surge accelerating polymer drift westward.' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 border border-red-200 uppercase">
              Predictive Hydrodynamics
            </span>
            <span className="text-xs text-[#736B5E]">7-Day Ocean Current & Drift Forecasting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Marine Risk Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Predictive modeling of ghost gear entrapment zones, hydrodynamic gyres, and coral reef entanglement risks.
          </p>
        </div>

        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD5C7] text-xs font-bold text-[#2A2A2A] focus:outline-none shadow-xs"
        >
          <option value="Sector 4B - Coral Sanctuary Shelf">Sector 4B - Coral Sanctuary Shelf</option>
          <option value="Sector 2A - Palk Bay Estuary">Sector 2A - Palk Bay Estuary</option>
          <option value="Sector 1C - Krusadai Island Outer Trench">Sector 1C - Krusadai Island Outer Trench</option>
        </select>
      </div>

      {/* Hero Score Gauge */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white via-white to-red-50 border-2 border-red-200 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white">
              CRITICAL RISK ZONE IDENTIFIED
            </span>
            <span className="text-xs font-bold text-[#736B5E]">Hydrodynamic Accumulation Rate: 4.8x baseline</span>
          </div>

          <h2 className="text-2xl font-black text-[#2A2A2A]">
            {selectedArea}
          </h2>

          <p className="text-xs text-[#5C5449] leading-relaxed">
            Persistent tidal gyres combined with rugged bathymetry create an <strong>87/100 risk</strong> of abandoned gear snagging endangered dugong and sea turtle populations.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-red-200 text-center shadow-xs">
          <span className="text-xs font-extrabold text-[#736B5E] uppercase tracking-wider">Ghost Gear Risk Index</span>
          <div className="text-5xl font-black text-red-600 my-2">87<span className="text-lg text-gray-400">/100</span></div>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
            HIGH CONVERGENCE RISK
          </span>
        </div>

      </div>

      {/* Factor Weights & Multi-Vector Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskFactors.map((rf, idx) => (
          <div key={idx} className="p-5 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-[#2A2A2A]">{rf.name}</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-[#F9F6F0] text-[#736B5E] border border-[#E8E1D5]">
                Weight: {rf.weight}
              </span>
            </div>

            <p className="text-xs text-[#5C5449]">{rf.desc}</p>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-red-600">{rf.status}</span>
                <span className="text-[#2A2A2A]">{rf.score} / 100</span>
              </div>
              <div className="w-full h-2 bg-[#F2EDE4] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${rf.score > 90 ? 'bg-red-600' : 'bg-[#FF6F59]'}`}
                  style={{ width: `${rf.score}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Drift Simulation Forecast */}
      <div className="p-6 rounded-3xl bg-[#F2EDE4] border border-[#DDD5C7] space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6F59]" />
          <h3 className="text-sm font-extrabold text-[#2A2A2A]">Next 72-Hour Oceanographic Drift Projection</h3>
        </div>
        <p className="text-xs text-[#5C5449] leading-relaxed">
          Tidal models suggest an incoming spring tide on May 18 will dislodge monofilament remnants from <strong>Sector 4B</strong> and transport them toward the <strong>Krusadai Coral Trench</strong> at a mean velocity of 1.4 knots. Recommended preemptive net retrieval before 08:00 UTC.
        </p>
      </div>

    </div>
  );
};
