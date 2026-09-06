import React, { useEffect, useRef } from 'react';
import { oceanAudio } from './oceanAudio';

interface TargetPing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Fish {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  type: 'clownfish' | 'bluetang' | 'chromis';
  size: number;
  wiggleAngle: number;
  wiggleSpeed: number;
  direction: 1 | -1;
  color: string;
}

interface Bubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  isThruster?: boolean;
}

interface SedimentParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface LiveOceanCanvasProps {
  sonarActive: boolean;
  selectedTargetId?: string;
  onTargetClick?: (id: string) => void;
  className?: string;
}

export const LiveOceanCanvas: React.FC<LiveOceanCanvasProps> = ({
  sonarActive,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initialize Bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 45; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4 + 0.15, // slight rightward current
        vy: -(Math.random() * 0.8 + 0.5),
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.4 + 0.2
      });
    }

    // Initialize Sediment Particles (Turbidity gradient: denser on left)
    const particles: SedimentParticle[] = [];
    for (let i = 0; i < 90; i++) {
      const isMurkySide = Math.random() < 0.7;
      const posX = isMurkySide ? Math.random() * width * 0.55 : Math.random() * width;
      particles.push({
        x: posX,
        y: Math.random() * height,
        vx: Math.random() * 0.3 + 0.1, // ocean current drift
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2 + 0.8,
        alpha: isMurkySide ? Math.random() * 0.5 + 0.2 : Math.random() * 0.25 + 0.05,
        color: isMurkySide ? 'rgba(180, 150, 110,' : 'rgba(210, 245, 255,'
      });
    }

    // Initialize Marine Life (Clownfish, Blue Tang, Schooling Chromis)
    const fishes: Fish[] = [
      // Clownfish (Lives around right coral reef: 65% - 88% X, 60% - 85% Y)
      {
        x: width * 0.74,
        y: height * 0.68,
        targetX: width * 0.78,
        targetY: height * 0.72,
        speed: 1.1,
        type: 'clownfish',
        size: 26,
        wiggleAngle: 0,
        wiggleSpeed: 0.18,
        direction: 1,
        color: '#FF6F00'
      },
      // Second smaller clownfish (mate)
      {
        x: width * 0.76,
        y: height * 0.72,
        targetX: width * 0.75,
        targetY: height * 0.70,
        speed: 0.9,
        type: 'clownfish',
        size: 19,
        wiggleAngle: 1.2,
        wiggleSpeed: 0.22,
        direction: -1,
        color: '#FF6F00'
      },
      // Blue Tang (Wider roaming in clear zone: 55% - 95% X, 35% - 65% Y)
      {
        x: width * 0.82,
        y: height * 0.48,
        targetX: width * 0.65,
        targetY: height * 0.52,
        speed: 1.4,
        type: 'bluetang',
        size: 32,
        wiggleAngle: 0.5,
        wiggleSpeed: 0.15,
        direction: -1,
        color: '#1D4ED8'
      }
    ];

    // School of 7 Chromis
    for (let i = 0; i < 7; i++) {
      fishes.push({
        x: width * 0.85 + (Math.random() - 0.5) * 60,
        y: height * 0.35 + (Math.random() - 0.5) * 40,
        targetX: width * 0.85,
        targetY: height * 0.35,
        speed: 1.6 + Math.random() * 0.5,
        type: 'chromis',
        size: 11,
        wiggleAngle: i * 0.4,
        wiggleSpeed: 0.28,
        direction: 1,
        color: '#34D399'
      });
    }

    // Dynamic Pings (Acoustic Sonar Echoes)
    const pings: TargetPing[] = [];

    // Sonar Beam sweep variable
    let sonarAngle = 0.35; // radians
    let sonarDirection = 1;
    let time = 0;

    // Thruster bubble emitter timer
    let thrusterTimer = 0;

    // Animation Loop
    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // -----------------------------------------------------------
      // 1. DYNAMIC VOLUMETRIC SUN CAUSTICS (Brighter on Restored Right)
      // -----------------------------------------------------------
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let i = 0; i < 5; i++) {
        const rayOffset = Math.sin(time * 0.7 + i * 1.5) * 35;
        const startX = width * (0.65 + i * 0.08) + rayOffset;
        const gradient = ctx.createLinearGradient(startX, 0, startX - 80, height * 0.85);
        gradient.addColorStop(0, 'rgba(45, 212, 191, 0.15)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 180, 0.06)');
        gradient.addColorStop(1, 'rgba(45, 212, 191, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX + 90, 0);
        ctx.lineTo(startX + 180 + rayOffset, height);
        ctx.lineTo(startX + 40 + rayOffset, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // -----------------------------------------------------------
      // 2. PROCEDURAL SWAYING KELP (Right Restored Zone)
      // -----------------------------------------------------------
      ctx.save();
      const kelpBases = [
        { x: width * 0.68, h: height * 0.28, color: '#047857' },
        { x: width * 0.71, h: height * 0.34, color: '#059669' },
        { x: width * 0.88, h: height * 0.30, color: '#065F46' },
        { x: width * 0.92, h: height * 0.36, color: '#10B981' }
      ];

      kelpBases.forEach((kelp, idx) => {
        ctx.strokeStyle = kelp.color;
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const baseY = height * 0.94;
        ctx.moveTo(kelp.x, baseY);

        const segments = 6;
        const segLen = kelp.h / segments;
        let curX = kelp.x;
        let curY = baseY;

        for (let s = 1; s <= segments; s++) {
          const sway = Math.sin(time * 1.2 + idx + s * 0.6) * (s * 3.2);
          const nextX = kelp.x + sway;
          const nextY = baseY - s * segLen;
          ctx.quadraticCurveTo(curX, curY, nextX, nextY);
          curX = nextX;
          curY = nextY;
        }
        ctx.stroke();

        // Small leaf fronds
        ctx.fillStyle = kelp.color;
        for (let s = 2; s <= segments; s += 2) {
          const sway = Math.sin(time * 1.2 + idx + s * 0.6) * (s * 3.2);
          const leafX = kelp.x + sway;
          const leafY = baseY - s * segLen;
          ctx.beginPath();
          ctx.ellipse(leafX + 7, leafY, 6, 2.5, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // -----------------------------------------------------------
      // 3. AUV 455 kHz ACOUSTIC SONAR SWEEP BEAM
      // -----------------------------------------------------------
      if (sonarActive) {
        // AUV Center coordinates (matches image hero location: ~48% X, 50% Y)
        const auvX = width * 0.485;
        const auvY = height * 0.495;

        // Oscillate sonar sweep angle
        sonarAngle += 0.009 * sonarDirection;
        if (sonarAngle > 0.95) sonarDirection = -1;
        if (sonarAngle < -0.15) sonarDirection = 1;

        const beamLength = height * 0.48;
        const beamSpread = 0.32; // Cone angle width
        const centerAngle = Math.PI * 0.5 + sonarAngle * 0.7;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Fan gradient
        const fanGrad = ctx.createRadialGradient(auvX, auvY, 10, auvX, auvY, beamLength);
        fanGrad.addColorStop(0, 'rgba(45, 212, 191, 0.45)');
        fanGrad.addColorStop(0.6, 'rgba(45, 212, 191, 0.14)');
        fanGrad.addColorStop(0.9, 'rgba(255, 255, 35, 0.22)');
        fanGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');

        ctx.fillStyle = fanGrad;
        ctx.beginPath();
        ctx.moveTo(auvX, auvY);
        ctx.arc(auvX, auvY, beamLength, centerAngle - beamSpread, centerAngle + beamSpread);
        ctx.closePath();
        ctx.fill();

        // Pulsing Acoustic Rings inside beam
        const pingDist = (time * 65) % beamLength;
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.55)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(auvX, auvY, pingDist, centerAngle - beamSpread, centerAngle + beamSpread);
        ctx.stroke();

        ctx.restore();
      }

      // -----------------------------------------------------------
      // 4. AUV PROPULSION THRUSTER CAVITATION / WASH BUBBLES
      // -----------------------------------------------------------
      thrusterTimer++;
      if (thrusterTimer % 4 === 0) {
        // Stern of AUV is around 42% X, 47% Y
        const thrusterX = width * 0.42;
        const thrusterY = height * 0.48;
        bubbles.push({
          x: thrusterX + (Math.random() - 0.5) * 12,
          y: thrusterY + (Math.random() - 0.5) * 8,
          vx: -(Math.random() * 1.6 + 0.8), // ejecting backwards
          vy: (Math.random() - 0.5) * 0.6 - 0.4,
          radius: Math.random() * 2.2 + 0.8,
          alpha: 0.65,
          isThruster: true
        });
      }

      // -----------------------------------------------------------
      // 5. UPDATE & RENDER BUBBLES
      // -----------------------------------------------------------
      ctx.save();
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.x += b.vx;
        b.y += b.vy;

        if (b.isThruster) {
          b.alpha -= 0.015;
          b.radius *= 1.01;
          if (b.alpha <= 0) {
            bubbles.splice(i, 1);
            continue;
          }
        } else {
          // Ambient ocean bubble: wrap around
          if (b.y < -10) {
            b.y = height + 10;
            b.x = Math.random() * width;
          }
          if (b.x > width + 10) b.x = -10;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * 0.9})`;
        ctx.fillStyle = `rgba(200, 245, 255, ${b.alpha * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Highlight shine on bubble
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // -----------------------------------------------------------
      // 6. UPDATE & RENDER DRIFTING SEDIMENT & TURBIDITY PARTICLES
      // -----------------------------------------------------------
      ctx.save();
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy + Math.sin(time + p.x * 0.01) * 0.15;

        if (p.x > width + 10) p.x = -5;
        if (p.y > height + 10) p.y = -5;
        if (p.y < -5) p.y = height + 5;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // -----------------------------------------------------------
      // 7. REALISTIC ANIMATED SWIMMING FISH
      // -----------------------------------------------------------
      ctx.save();
      fishes.forEach((fish) => {
        // Move towards target position smoothly
        const dx = fish.targetX - fish.x;
        const dy = fish.targetY - fish.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 15) {
          // Pick new wandering target within natural habitat bounds
          if (fish.type === 'clownfish') {
            fish.targetX = width * (0.68 + Math.random() * 0.22);
            fish.targetY = height * (0.58 + Math.random() * 0.22);
          } else if (fish.type === 'bluetang') {
            fish.targetX = width * (0.58 + Math.random() * 0.35);
            fish.targetY = height * (0.40 + Math.random() * 0.28);
          } else {
            // Chromis school
            const leaderX = width * 0.83 + Math.sin(time * 0.5) * 50;
            const leaderY = height * 0.36 + Math.cos(time * 0.6) * 35;
            fish.targetX = leaderX + (Math.random() - 0.5) * 40;
            fish.targetY = leaderY + (Math.random() - 0.5) * 25;
          }
        } else {
          fish.x += (dx / dist) * fish.speed;
          fish.y += (dy / dist) * fish.speed;
          fish.direction = dx > 0 ? 1 : -1;
        }

        fish.wiggleAngle += fish.wiggleSpeed;
        const tailWiggle = Math.sin(fish.wiggleAngle) * 0.35;

        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.scale(fish.direction, 1);

        if (fish.type === 'clownfish') {
          // ---------------- CLOWNFISH (Amphiprioninae) ----------------
          const L = fish.size;
          const H = L * 0.55;

          // Tail Fin
          ctx.save();
          ctx.rotate(tailWiggle);
          ctx.fillStyle = '#FF5500';
          ctx.beginPath();
          ctx.moveTo(-L * 0.5, 0);
          ctx.lineTo(-L * 0.85, -H * 0.55);
          ctx.quadraticCurveTo(-L * 0.7, 0, -L * 0.85, H * 0.55);
          ctx.closePath();
          ctx.fill();
          // Tail black edge
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Main Body (Vibrant Orange with smooth gradient)
          const grad = ctx.createLinearGradient(0, -H, 0, H);
          grad.addColorStop(0, '#FF8A00');
          grad.addColorStop(0.5, '#FF5500');
          grad.addColorStop(1, '#D03B00');
          ctx.fillStyle = grad;

          ctx.beginPath();
          ctx.ellipse(0, 0, L * 0.55, H * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();

          // 3 Distinctive White Bands with Black Outlines
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#050505';
          ctx.lineWidth = 1;

          // Band 1 (Head)
          ctx.beginPath();
          ctx.ellipse(L * 0.18, 0, L * 0.08, H * 0.52, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Band 2 (Mid-body)
          ctx.beginPath();
          ctx.ellipse(-L * 0.08, 0, L * 0.09, H * 0.54, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Band 3 (Tail Base)
          ctx.beginPath();
          ctx.ellipse(-L * 0.36, 0, L * 0.06, H * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Eye
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(L * 0.32, -H * 0.15, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0A0A0A';
          ctx.beginPath();
          ctx.arc(L * 0.33, -H * 0.15, 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Pectoral Fin flutter
          ctx.fillStyle = 'rgba(255, 120, 0, 0.8)';
          ctx.beginPath();
          ctx.ellipse(L * 0.05, H * 0.25, L * 0.18, H * 0.22, Math.sin(time * 8) * 0.3, 0, Math.PI * 2);
          ctx.fill();

        } else if (fish.type === 'bluetang') {
          // ---------------- BLUE TANG (Paracanthurus hepatus) ----------------
          const L = fish.size;
          const H = L * 0.6;

          // Vibrant Yellow Tail Fin
          ctx.save();
          ctx.rotate(tailWiggle * 0.8);
          ctx.fillStyle = '#FFFF23';
          ctx.beginPath();
          ctx.moveTo(-L * 0.5, 0);
          ctx.lineTo(-L * 0.9, -H * 0.5);
          ctx.lineTo(-L * 0.75, 0);
          ctx.lineTo(-L * 0.9, H * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#D97706';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();

          // Deep Blue Body
          const blueGrad = ctx.createLinearGradient(0, -H, 0, H);
          blueGrad.addColorStop(0, '#2563EB');
          blueGrad.addColorStop(0.5, '#1D4ED8');
          blueGrad.addColorStop(1, '#0F172A');
          ctx.fillStyle = blueGrad;

          ctx.beginPath();
          ctx.ellipse(0, 0, L * 0.58, H * 0.58, 0, 0, Math.PI * 2);
          ctx.fill();

          // Iconic Black Swirl Pattern
          ctx.fillStyle = '#090D16';
          ctx.beginPath();
          ctx.ellipse(-L * 0.05, -H * 0.18, L * 0.35, H * 0.28, -0.2, 0, Math.PI * 2);
          ctx.fill();

          // Yellow wedge inset on side
          ctx.fillStyle = '#FFFF23';
          ctx.beginPath();
          ctx.ellipse(-L * 0.35, 0, L * 0.12, H * 0.22, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eye
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(L * 0.36, -H * 0.16, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(L * 0.37, -H * 0.16, 1.3, 0, Math.PI * 2);
          ctx.fill();

        } else {
          // ---------------- CHROMIS REEF FISH ----------------
          const L = fish.size;
          ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, L, L * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          // Tail
          ctx.beginPath();
          ctx.moveTo(-L * 0.8, 0);
          ctx.lineTo(-L * 1.4, -L * 0.4);
          ctx.lineTo(-L * 1.4, L * 0.4);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });
      ctx.restore();

      // -----------------------------------------------------------
      // 8. INTERACTIVE ACOUSTIC PINGS
      // -----------------------------------------------------------
      ctx.save();
      for (let i = pings.length - 1; i >= 0; i--) {
        const p = pings[i];
        p.radius += 2.8;
        p.alpha -= 0.018;

        if (p.alpha <= 0 || p.radius >= p.maxRadius) {
          pings.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `${p.color} ${p.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `${p.color} ${p.alpha * 0.15})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Click handler to trigger interactive sonar wave
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      pings.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: 180,
        alpha: 0.9,
        color: 'rgba(45, 212, 191,'
      });

      oceanAudio.triggerSonarPing();
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [sonarActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair z-10 ${className}`}
      title="Click anywhere to trigger active 455 kHz Acoustic Sonar Ping"
    />
  );
};
