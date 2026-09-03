import React from 'react';

interface AmbientGradientsProps {
  className?: string;
  intensity?: 'subtle' | 'vibrant';
}

export const AmbientGradients: React.FC<AmbientGradientsProps> = ({
  className = '',
  intensity = 'subtle'
}) => {
  const isVibrant = intensity === 'vibrant';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 overflow-hidden z-0 select-none ${className}`}
    >
      {/* Orb 1: Electric Yellow glow top-right */}
      <div
        className={`absolute -top-[12%] -right-[10%] w-[550px] h-[550px] rounded-full bg-[#FFFF23] blur-[140px] mix-blend-screen animate-ambient-1 ${
          isVibrant ? 'opacity-25' : 'opacity-15'
        }`}
      />

      {/* Orb 2: Bio-cyan oceanic glow bottom-left */}
      <div
        className={`absolute top-[40%] -left-[15%] w-[620px] h-[620px] rounded-full bg-[#2DD4BF] blur-[160px] mix-blend-screen animate-ambient-2 ${
          isVibrant ? 'opacity-20' : 'opacity-10'
        }`}
      />

      {/* Orb 3: Deep Abyssal Blue glow center/bottom-right */}
      <div
        className={`absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-[#1D4ED8] blur-[150px] mix-blend-screen animate-ambient-3 ${
          isVibrant ? 'opacity-25' : 'opacity-15'
        }`}
      />

      {/* Subtle Noise / Film Grain texture overlay for editorial tactile feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};
