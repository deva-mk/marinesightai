import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [followerPos, setFollowerPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const targetPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const currentFollowerRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });

  useEffect(() => {
    // Check if device is touch-enabled
    if (window.matchMedia('(hover: none)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      const { clientX, clientY } = e;
      targetPosRef.current = { x: clientX, y: clientY };
      setPos({ x: clientX, y: clientY });

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'button, a, input, select, textarea, [role="button"], .hover-interactive, .cursor-pointer'
        );
        if (interactive) {
          setIsHovering(true);
          const customText = interactive.getAttribute('data-cursor-text');
          setCursorText(customText || null);
        } else {
          setIsHovering(false);
          setCursorText(null);
        }
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Smooth Lerp animation loop for the magnetic follower ring
    const animate = () => {
      const speed = 0.18; // smooth lag factor
      const tx = targetPosRef.current.x;
      const ty = targetPosRef.current.y;

      const cx = currentFollowerRef.current.x;
      const cy = currentFollowerRef.current.y;

      const nextX = cx + (tx - cx) * speed;
      const nextY = cy + (ty - cy) * speed;

      currentFollowerRef.current = { x: nextX, y: nextY };
      setFollowerPos({ x: nextX, y: nextY });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <aside
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none"
    >
      {/* Outer Magnetic Follower Ring (Heynesh style) */}
      <div
        style={{
          transform: `translate3d(${followerPos.x}px, ${followerPos.y}px, 0) translate(-50%, -50%) scale(${
            isClicked ? 0.8 : isHovering ? 1.6 : 1
          })`,
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s, border-color 0.2s',
          boxShadow: isHovering ? '0 0 24px rgba(255, 255, 35, 0.35)' : 'none'
        }}
        className={`absolute rounded-full flex items-center justify-center pointer-events-none ${
          isHovering
            ? 'w-12 h-12 border-2 border-[#FFFF23] bg-[#FFFF23]/15 backdrop-blur-[1px]'
            : 'w-9 h-9 border border-[#FFFF23]/70 bg-transparent'
        }`}
      >
        {cursorText && (
          <span className="text-[9px] font-black tracking-widest text-[#FFFF23] uppercase scale-90 select-none">
            {cursorText}
          </span>
        )}
      </div>

      {/* Inner Pinpoint Electric Dot */}
      <div
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scale(${
            isClicked ? 0.6 : isHovering ? 0 : 1
          })`,
          transition: 'transform 0.08s ease-out, opacity 0.15s'
        }}
        className="absolute w-2 h-2 rounded-full bg-[#FFFF23] pointer-events-none shadow-[0_0_8px_#FFFF23]"
      />
    </aside>
  );
};
