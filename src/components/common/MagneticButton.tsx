import React, { useRef, useState, useEffect } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number; // Pull intensity (default: 0.35)
  cursorText?: string;
  glowColor?: string;
  liquidMorph?: boolean;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.35,
  cursorText,
  glowColor = 'rgba(255, 255, 35, 0.4)',
  liquidMorph = false,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      data-cursor-text={cursorText}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${isHovered ? 1.03 : 1})`,
        transition: isHovered
          ? 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.25s, border-color 0.25s'
          : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s, border-color 0.3s',
        boxShadow: isHovered ? `0 10px 30px -5px ${glowColor}` : 'none'
      }}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer group ${
        liquidMorph && isHovered ? 'animate-liquid-morph' : ''
      } ${className}`}
      {...props}
    >
      {/* Liquid / Glass Morphic Ripple Layer */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        } bg-gradient-to-r from-white/10 via-white/20 to-transparent blur-xs`}
      />

      {/* Button Content with subtle counter-parallax */}
      <span
        style={{
          transform: `translate3d(${offset.x * 0.25}px, ${offset.y * 0.25}px, 0)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out'
        }}
        className="relative z-10 flex items-center justify-center gap-2"
      >
        {children}
      </span>
    </button>
  );
};
