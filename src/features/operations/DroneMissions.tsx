import React, { useState } from 'react';
import { 
  Plane, 
  Battery, 
  Wifi, 
  MapPin, 
  Video, 
  Compass, 
  CheckCircle2, 
  Radio, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { DRONE_MISSIONS_DATA } from '../../data/sampleData';

export const DroneMissions: React.FC = () => {
  const [selectedDrone, setSelectedDrone] = useState(DRONE_MISSIONS_DATA[0]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4F6F52]/10 text-[#4F6F52] border border-[#4F6F52]/20 uppercase">
              UAV Aerial Squad
            </span>
            <span className="text-xs text-[#736B5E]">Autonomous Maritime Patrol Fleet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2A2A2A] tracking-tight">
            Drone Mission Command
          </h1>
          <p className="text-xs sm:text-sm text-[#736B5E] mt-1">
            Real-time telemetry, battery monitoring, and automated flight paths for ocean debris surveys.
          </p>
        </div>
      </div>

      {/* Drone Fleet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DRONE_MISSIONS_DATA.map((d) => {
          const isSelected = selectedDrone.id === d.id;
          return (
            <div
              key={d.id}
              onClick={() => setSelectedDrone(d)}
              className={`p-5 rounded-3xl border text-left cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-white border-[#4F6F52] shadow-md ring-2 ring-[#4F6F52]/20' 
                  : 'bg-white border-[#E8E1D5] hover:border-[#DDD5C7] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#4F6F52]/15 text-[#4F6F52]">
                    <Plane className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#2A2A2A]">{d.id}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  d.status === 'IN_FLIGHT' ? 'bg-[#FF6F59]/15 text-[#FF6F59] animate-pulse' :
                  d.status === 'RETURNING' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {d.status}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-[#2A2A2A]">{d.model}</h4>
              <p className="text-xs text-[#736B5E] mt-0.5">{d.sector}</p>

              <div className="mt-4 pt-3 border-t border-[#F2EDE4] grid grid-cols-3 gap-2 text-[10px] font-bold">
                <div>
                  <span className="text-[#8C8275] block">Battery</span>
                  <span className="text-[#4F6F52]">{d.battery}%</span>
                </div>
                <div>
                  <span className="text-[#8C8275] block">Altitude</span>
                  <span className="text-[#2A2A2A]">{d.altitudeMeters}m</span>
                </div>
                <div>
                  <span className="text-[#8C8275] block">Detections</span>
                  <span className="text-[#FF6F59]">{d.detectionsLogged} Sighted</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Drone Telemetry Deep Dive */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E1D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#2A2A2A]">
              Flight Path & Live Sensor Ingestion: {selectedDrone.id}
            </h3>
            <p className="text-xs text-[#736B5E]">
              Speed: {selectedDrone.speedKnots} knots • GSD: 1.4 cm/px • Optical Band: RGB + 850nm NIR
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#F9F6F0] text-xs font-mono font-bold text-[#2A2A2A] border border-[#E3DBD0]">
            SIGNAL STRENGTH: 98% (L-BAND SAT)
          </span>
        </div>

        {/* Flight Waypoints Grid */}
        <div className="p-4 rounded-2xl bg-[#F9F6F0] border border-[#E8E1D5]">
          <h4 className="text-xs font-extrabold text-[#2A2A2A] uppercase tracking-wider mb-2">
            Automated Flight Waypoints
          </h4>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {selectedDrone.flightPath.map((wp, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-white border border-[#E8E1D5] text-[#2A2A2A] font-bold">
                WP-{idx + 1}: {wp.lat}°N, {wp.lng}°E
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
