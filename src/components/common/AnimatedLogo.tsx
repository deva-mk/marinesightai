import React, { useState } from 'react';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* Animated SVG Icon Container */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-[#0C0D0E] border border-[#FFFF23] flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(255,255,35,0.3)] group-hover:shadow-[0_0_25px_rgba(255,255,35,0.6)] group-hover:scale-105`}
      >
        {/* Ambient liquid background glow */}
        <div
          className={`absolute inset-0 bg-[#FFFF23] transition-opacity duration-300 ${
            isHovered ? 'opacity-20' : 'opacity-10'
          }`}
        />

        {/* Sonar sweep line on hover */}
        <div
          className={`absolute inset-0 origin-center bg-gradient-to-tr from-transparent via-[#FFFF23]/25 to-transparent ${
            isHovered ? 'animate-sonar-sweep opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        />

        {/* Vector SVG Morphing Wave & Radar */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 relative z-10"
        >
          {/* Outer radar pulse circle */}
          <circle
            cx="18"
            cy="18"
            r="14"
            stroke="#FFFF23"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            className={`transition-transform duration-700 origin-center ${
              isHovered ? 'rotate-180 scale-110' : 'rotate-0'
            }`}
          />

          {/* Morphing acoustic wave vector 1 */}
          <path
            d={
              isHovered
                ? 'M7 21C11 15 15 25 21 16C25 10 27 19 29 17'
                : 'M7 18C10 14 14 22 18 18C22 14 26 22 29 18'
            }
            stroke="#FFFF23"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'd 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.3s'
            }}
          />

          {/* Morphing acoustic wave vector 2 (secondary harmonic) */}
          <path
            d={
              isHovered
                ? 'M9 14C12 20 16 11 20 19C24 23 26 14 27 15'
                : 'M9 22C12 25 15 20 18 22C21 24 24 19 27 22'
            }
            stroke={isHovered ? '#2DD4BF' : '#FFFF23'}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.75"
            style={{
              transition: 'd 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.3s'
            }}
          />

          {/* Center pinpoint acoustic transducer dot */}
          <circle
            cx="18"
            cy="18"
            r={isHovered ? 2.8 : 2}
            fill="#FFFF23"
            style={{
              transition: 'r 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>
      </div>

      {/* Typography */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-black tracking-tight text-white group-hover:text-[#FFFF23] transition-colors leading-none text-base">
            MARINESIGHT <span className="text-[#FFFF23]">AI</span>
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider uppercase bg-[#FFFF23]/15 text-[#FFFF23] border border-[#FFFF23]/30">
            PRO
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] font-mono font-bold text-stone-400 tracking-wider uppercase mt-0.5">
            Acoustic & Vision Platform
          </p>
        )}
      </div>
    </div>
  );
};
