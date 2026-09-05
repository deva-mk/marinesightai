import React, { useEffect, useRef, useState } from 'react';
import { 
  wallpaperService, 
  WallpaperConfig, 
  WallpaperTheme, 
  WALLPAPER_THEMES 
} from '../../services/wallpaperService';
import { 
  Radar, 
  Sparkles, 
  Cpu, 
  Waves, 
  X, 
  Maximize2, 
  Radio, 
  Eye, 
  Compass,
  Sliders,
  Volume2,
  Check
} from 'lucide-react';

interface LiveWallpaperProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  originalSize: number;
}

interface SonarTarget {
  x: number;
  y: number;
  size: number;
  label: string;
  depth: string;
  detectedTime: number;
  echoRadius: number;
}

interface MeshNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  id: string;
  isHub: boolean;
  pulse: number;
}

interface SignalPacket {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
}

export const LiveWallpaper: React.FC<LiveWallpaperProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [config, setConfig] = useState<WallpaperConfig>(() => wallpaperService.getConfig());
  const [fps, setFps] = useState<number>(60);
  
  const mouseRef = useRef<{ 
    x: number; 
    y: number; 
    active: boolean; 
    clickRipple: { x: number; y: number; r: number; alpha: number } | null;
    trail: { x: number; y: number; alpha: number }[];
  }>({
    x: -1000,
    y: -1000,
    active: false,
    clickRipple: null,
    trail: [],
  });

  // Subscribe to wallpaper service changes
  useEffect(() => {
    return wallpaperService.subscribe((newConfig) => {
      setConfig(newConfig);
    });
  }, []);

  // Handle ESC key to exit showcase mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && config.showcaseMode) {
        wallpaperService.setShowcaseMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.showcaseMode]);

  // Main animation canvas loop
  useEffect(() => {
    if (!config.enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Handle high DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
      if (mouseRef.current.trail.length < 15) {
        mouseRef.current.trail.push({ x: e.clientX, y: e.clientY, alpha: 0.8 });
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      mouseRef.current.clickRipple = {
        x: e.clientX,
        y: e.clientY,
        r: 8,
        alpha: 1.0,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Dynamic contrast & brightness factor
    const intensityFactor = config.intensity === 'ultra' ? 1.4 : config.intensity === 'vibrant' ? 1.15 : 0.85;
    const speedMultiplier = config.speed || 1.0;

    // --- State for SONAR_SWEEP ---
    let sonarAngle = 0;
    const sonarTargets: SonarTarget[] = [
      { x: width * 0.65, y: height * 0.35, size: 7, label: 'Ghost Net Mass #04', depth: '18.4m', detectedTime: 0, echoRadius: 0 },
      { x: width * 0.32, y: height * 0.68, size: 6, label: 'Submerged Crab Trap Line', depth: '24.1m', detectedTime: 0, echoRadius: 0 },
      { x: width * 0.78, y: height * 0.72, size: 8, label: 'Derelict Mooring Cable', depth: '31.2m', detectedTime: 0, echoRadius: 0 },
      { x: width * 0.28, y: height * 0.26, size: 6, label: 'Synthetic Polymer Drift', depth: '14.8m', detectedTime: 0, echoRadius: 0 },
      { x: width * 0.52, y: height * 0.82, size: 7, label: 'Benthic Debris Cluster', depth: '38.5m', detectedTime: 0, echoRadius: 0 },
      { x: width * 0.18, y: height * 0.45, size: 5, label: 'Acoustic Transponder P-9', depth: '12.0m', detectedTime: 0, echoRadius: 0 },
    ];

    // --- State for BIOLUMINESCENT_ABYSS ---
    const bioParticles: Particle[] = [];
    const bioColors = ['#2DD4BF', '#38BDF8', '#FFFF23', '#818CF8', '#34D399', '#F472B6'];
    for (let i = 0; i < 85; i++) {
      bioParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.2 - Math.random() * 0.45, // upward pelagic drift
        size: 2.5 + Math.random() * 4.5,
        originalSize: 2.5 + Math.random() * 4.5,
        color: bioColors[Math.floor(Math.random() * bioColors.length)],
        alpha: 0.4 + Math.random() * 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    // --- State for NEURAL_SENSOR_MESH ---
    const meshNodes: MeshNode[] = [];
    for (let i = 0; i < 46; i++) {
      meshNodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: i % 6 === 0 ? 5.5 : 3.0,
        id: i % 6 === 0 ? `HUB-${Math.floor(i / 6) + 1}` : `S-${i + 1}`,
        isHub: i % 6 === 0,
        pulse: Math.random() * Math.PI,
      });
    }

    const packets: SignalPacket[] = [];
    for (let i = 0; i < 12; i++) {
      const from = Math.floor(Math.random() * meshNodes.length);
      let to = Math.floor(Math.random() * meshNodes.length);
      while (to === from) to = Math.floor(Math.random() * meshNodes.length);
      packets.push({
        fromNode: from,
        toNode: to,
        progress: Math.random(),
        speed: 0.01 + Math.random() * 0.015,
        color: Math.random() > 0.4 ? '#2DD4BF' : '#FFFF23',
      });
    }

    // --- State for OCEANIC_CAUSTICS_WAVES ---
    let waveTime = 0;
    const bubbles: { x: number; y: number; r: number; vy: number; alpha: number }[] = [];
    for (let i = 0; i < 35; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.5 + Math.random() * 3.5,
        vy: 0.4 + Math.random() * 0.8,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }

    // FPS counter
    let lastFrameTime = performance.now();
    let frameCount = 0;

    // --- RENDER FUNCTIONS ---

    // 1. SONAR SWEEP RENDERER
    const renderSonar = () => {
      const sonarCenter = { x: width * 0.5, y: height * 0.48 };
      const sonarMaxRadius = Math.max(width, height) * 0.75;

      sonarAngle = (sonarAngle + 0.014 * speedMultiplier) % (Math.PI * 2);

      ctx.save();

      // Atmospheric Deep Sea Blue/Cyan glow in center
      const centerGlow = ctx.createRadialGradient(sonarCenter.x, sonarCenter.y, 10, sonarCenter.x, sonarCenter.y, sonarMaxRadius * 0.65);
      centerGlow.addColorStop(0, `rgba(13, 148, 136, ${0.12 * intensityFactor})`);
      centerGlow.addColorStop(0.5, `rgba(15, 23, 42, ${0.05 * intensityFactor})`);
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, width, height);

      // Radar Concentric Range Rings
      const ringDistances = [100, 220, 360, 520, 700, 920];
      const ringLabels = ['100m', '250m', '500m', '750m', '1000m', '1500m'];

      ringDistances.forEach((r, idx) => {
        // Main Ring Line
        ctx.beginPath();
        ctx.arc(sonarCenter.x, sonarCenter.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.28 * intensityFactor})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dashed Sub-Ring
        if (r > 100) {
          ctx.beginPath();
          ctx.setLineDash([4, 10]);
          ctx.arc(sonarCenter.x, sonarCenter.y, r - (ringDistances[idx] - (ringDistances[idx - 1] || 0)) / 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 35, ${0.18 * intensityFactor})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Distance Tag in Monospace
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = `rgba(45, 212, 191, ${0.75 * intensityFactor})`;
        ctx.fillText(`▲ ${ringLabels[idx]} RANGE`, sonarCenter.x + r - 48, sonarCenter.y - 8);
      });

      // Bearing Rays & Angle Markings
      const angleCount = 12;
      for (let i = 0; i < angleCount; i++) {
        const ang = (i / angleCount) * Math.PI * 2;
        const deg = Math.round((ang * 180) / Math.PI);

        ctx.beginPath();
        ctx.moveTo(sonarCenter.x, sonarCenter.y);
        ctx.lineTo(sonarCenter.x + Math.cos(ang) * sonarMaxRadius, sonarCenter.y + Math.sin(ang) * sonarMaxRadius);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.2 * intensityFactor})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Degree label at periphery
        const lx = sonarCenter.x + Math.cos(ang) * 420;
        const ly = sonarCenter.y + Math.sin(ang) * 420;
        ctx.font = '10px monospace';
        ctx.fillStyle = `rgba(255, 255, 35, ${0.6 * intensityFactor})`;
        ctx.fillText(`${deg.toString().padStart(3, '0')}°`, lx - 12, ly);
      }

      // Rotating Acoustic Sweep Beam with Luminous Gradient Fan
      const sweepSpan = Math.PI * 0.42; // 75 degree wide wedge
      const steps = 40;
      for (let i = 0; i < steps; i++) {
        const a = sonarAngle - (i / steps) * sweepSpan;
        const alpha = Math.pow(1 - i / steps, 1.4) * 0.35 * intensityFactor;

        ctx.beginPath();
        ctx.moveTo(sonarCenter.x, sonarCenter.y);
        ctx.arc(sonarCenter.x, sonarCenter.y, sonarMaxRadius, a, a + 0.025);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 35, ${alpha})`;
        ctx.fill();
      }

      // Bright Neon Leading Edge Beam
      ctx.beginPath();
      ctx.moveTo(sonarCenter.x, sonarCenter.y);
      ctx.lineTo(sonarCenter.x + Math.cos(sonarAngle) * sonarMaxRadius, sonarCenter.y + Math.sin(sonarAngle) * sonarMaxRadius);
      ctx.strokeStyle = '#FFFF23';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FFFF23';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sonar Targets Detection & Pinging
      sonarTargets.forEach((target) => {
        const dx = target.x - sonarCenter.x;
        const dy = target.y - sonarCenter.y;
        let targetAngle = Math.atan2(dy, dx);
        if (targetAngle < 0) targetAngle += Math.PI * 2;

        const angleDiff = (sonarAngle - targetAngle + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.1) {
          target.detectedTime = Date.now();
          target.echoRadius = target.size;
        }

        const elapsed = Date.now() - target.detectedTime;
        const isFresh = elapsed < 3500;
        const pingAlpha = isFresh ? Math.max(0, 1 - elapsed / 3500) * intensityFactor : 0.25 * intensityFactor;

        // Expanding echo acoustic wave rings
        if (isFresh) {
          target.echoRadius += 1.2 * speedMultiplier;
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.echoRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 35, ${pingAlpha * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Second echo ring
          if (target.echoRadius > 20) {
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.echoRadius - 15, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(45, 212, 191, ${pingAlpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Target marker blip
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
        ctx.fillStyle = isFresh ? '#FFFF23' : `rgba(45, 212, 191, ${0.5 * intensityFactor})`;
        ctx.shadowColor = isFresh ? '#FFFF23' : '#2DD4BF';
        ctx.shadowBlur = isFresh ? 20 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target HUD Callout Box & Label
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = isFresh ? '#FFFF23' : `rgba(45, 212, 191, ${0.7 * intensityFactor})`;
        ctx.fillText(`▲ ${target.label}`, target.x + 12, target.y - 8);
        ctx.font = '9px monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${isFresh ? 0.9 : 0.5 * intensityFactor})`;
        ctx.fillText(`DEPTH: ${target.depth} | RETURN: ${isFresh ? 'PULSE HIGH' : 'ACQ'}`, target.x + 12, target.y + 6);
      });

      // Towfish Mouse Cursor Reticle
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mDist = Math.hypot(mx - sonarCenter.x, my - sonarCenter.y);
        let mAngle = (Math.atan2(my - sonarCenter.y, mx - sonarCenter.x) * 180) / Math.PI;
        if (mAngle < 0) mAngle += 360;

        ctx.strokeStyle = '#2DD4BF';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(mx, my, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(mx - 32, my);
        ctx.lineTo(mx + 32, my);
        ctx.moveTo(mx, my - 32);
        ctx.lineTo(mx, my + 32);
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
        ctx.stroke();

        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = '#FFFF23';
        ctx.fillText(`SONAR TOWFISH [${(mDist * 1.2).toFixed(1)}m · ${mAngle.toFixed(0).padStart(3, '0')}°]`, mx + 32, my + 4);
      }

      ctx.restore();
    };

    // 2. BIOLUMINESCENT ABYSS RENDERER
    const renderBioluminescent = (time: number) => {
      ctx.save();

      // Atmospheric Deep Sea Bioluminescent Clouds
      const bgGrad1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time * 0.0006) * 120,
        height * 0.4 + Math.cos(time * 0.0005) * 90,
        40,
        width * 0.3,
        height * 0.4,
        width * 0.6
      );
      bgGrad1.addColorStop(0, `rgba(45, 212, 191, ${0.18 * intensityFactor})`);
      bgGrad1.addColorStop(0.6, `rgba(14, 165, 233, ${0.08 * intensityFactor})`);
      bgGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad1;
      ctx.fillRect(0, 0, width, height);

      const bgGrad2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(time * 0.0007) * 140,
        height * 0.65 + Math.sin(time * 0.0006) * 110,
        50,
        width * 0.75,
        height * 0.65,
        width * 0.65
      );
      bgGrad2.addColorStop(0, `rgba(255, 255, 35, ${0.12 * intensityFactor})`);
      bgGrad2.addColorStop(0.5, `rgba(99, 102, 241, ${0.08 * intensityFactor})`);
      bgGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad2;
      ctx.fillRect(0, 0, width, height);

      // Render Drifting Bioluminescent Plankton & Deep Sea Particles
      bioParticles.forEach((p) => {
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Interactive mouse eddy repulsion
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200 && dist > 1) {
            const force = (1 - dist / 200) * 3.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Boundary wrap
        if (p.y < -25) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }
        if (p.x < -25) p.x = width + 15;
        if (p.x > width + 25) p.x = -15;

        // Breathing bioluminescent pulse
        p.pulsePhase += p.pulseSpeed * speedMultiplier;
        const currentAlpha = Math.min(1.0, (p.alpha + Math.sin(p.pulsePhase) * 0.3) * intensityFactor);
        const currentSize = p.originalSize + Math.sin(p.pulsePhase) * 1.5;

        // Radiant Outer Glow Halo
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 5.5);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 5.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.globalAlpha = currentAlpha * 0.6;
        ctx.fill();

        // Intense Core Ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Mouse Sparkle Trail
      mouseRef.current.trail.forEach((t, idx) => {
        t.alpha -= 0.04;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3.5 * (1 - idx / 15), 0, Math.PI * 2);
        ctx.fillStyle = '#2DD4BF';
        ctx.shadowColor = '#FFFF23';
        ctx.shadowBlur = 10;
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      mouseRef.current.trail = mouseRef.current.trail.filter(t => t.alpha > 0);

      ctx.restore();
    };

    // 3. NEURAL SENSOR MESH RENDERER
    const renderNeuralMesh = () => {
      ctx.save();
      const maxDistance = 190;

      // Update node positions
      meshNodes.forEach((node) => {
        node.x += node.vx * speedMultiplier;
        node.y += node.vy * speedMultiplier;

        if (node.x < 30 || node.x > width - 30) node.vx *= -1;
        if (node.y < 30 || node.y > height - 30) node.vy *= -1;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - node.x;
          const dy = mouseRef.current.y - node.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 220 && dist > 2) {
            node.x += (dx / dist) * 0.8;
            node.y += (dy / dist) * 0.8;
          }
        }
      });

      // Draw connection vectors
      for (let i = 0; i < meshNodes.length; i++) {
        for (let j = i + 1; j < meshNodes.length; j++) {
          const n1 = meshNodes[i];
          const n2 = meshNodes[j];
          const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);

          if (dist < maxDistance) {
            const alpha = Math.pow(1 - dist / maxDistance, 1.2) * 0.65 * intensityFactor;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.isHub || n2.isHub ? `rgba(255, 255, 35, ${alpha * 1.3})` : `rgba(45, 212, 191, ${alpha})`;
            ctx.lineWidth = n1.isHub || n2.isHub ? 1.8 : 1.0;
            ctx.stroke();
          }
        }
      }

      // Draw mouse connection rays to nearby nodes
      if (mouseRef.current.active) {
        meshNodes.forEach((node) => {
          const dist = Math.hypot(node.x - mouseRef.current.x, node.y - mouseRef.current.y);
          if (dist < 240) {
            const alpha = (1 - dist / 240) * 0.75 * intensityFactor;
            ctx.beginPath();
            ctx.moveTo(mouseRef.current.x, mouseRef.current.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `rgba(255, 255, 35, ${alpha})`;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
        });
      }

      // Telemetry Signal Packets
      packets.forEach((packet) => {
        const from = meshNodes[packet.fromNode];
        const to = meshNodes[packet.toNode];
        if (!from || !to) return;

        packet.progress += packet.speed * speedMultiplier;
        if (packet.progress >= 1) {
          packet.progress = 0;
          packet.fromNode = packet.toNode;
          packet.toNode = Math.floor(Math.random() * meshNodes.length);
        }

        const px = from.x + (to.x - from.x) * packet.progress;
        const py = from.y + (to.y - from.y) * packet.progress;

        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = packet.color;
        ctx.shadowColor = packet.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Nodes with Halos & Labels
      meshNodes.forEach((node) => {
        node.pulse += 0.04 * speedMultiplier;
        const pulseScale = 1 + Math.sin(node.pulse) * 0.25;

        // Outer Halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3 * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = node.isHub ? `rgba(255, 255, 35, ${0.2 * intensityFactor})` : `rgba(45, 212, 191, ${0.15 * intensityFactor})`;
        ctx.fill();

        // Node Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = node.isHub ? '#FFFF23' : '#2DD4BF';
        ctx.shadowColor = node.isHub ? '#FFFF23' : '#2DD4BF';
        ctx.shadowBlur = node.isHub ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Hub ring
        if (node.isHub) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 4 * pulseScale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 35, ${0.5 * intensityFactor})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#FFFF23';
          ctx.fillText(`▲ ${node.id}`, node.x + 12, node.y + 3);
        }
      });

      ctx.restore();
    };

    // 4. OCEANIC CAUSTICS & VOLUMETRIC WAVES RENDERER
    const renderOceanicWaves = () => {
      ctx.save();
      waveTime += 0.01 * speedMultiplier;

      // Volumetric sunlight caustics beams piercing water
      const beamCount = 5;
      for (let b = 0; b < beamCount; b++) {
        const beamX = width * (0.15 + b * 0.2) + Math.sin(waveTime * 0.8 + b) * 60;
        const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 120, height);
        beamGrad.addColorStop(0, `rgba(45, 212, 191, ${0.18 * intensityFactor})`);
        beamGrad.addColorStop(0.4, `rgba(255, 255, 35, ${0.08 * intensityFactor})`);
        beamGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamX - 40, 0);
        ctx.lineTo(beamX + 80, 0);
        ctx.lineTo(beamX + 260, height);
        ctx.lineTo(beamX + 120, height);
        ctx.closePath();
        ctx.fill();
      }

      // Layered undulating sinusoidal waves
      const waveLayers = [
        { amplitude: 55, freq: 0.0016, speed: 1.0, yOffset: height * 0.35, color: `rgba(13, 148, 136, ${0.28 * intensityFactor})` },
        { amplitude: 70, freq: 0.0012, speed: -0.8, yOffset: height * 0.5, color: `rgba(45, 212, 191, ${0.22 * intensityFactor})` },
        { amplitude: 85, freq: 0.001, speed: 1.3, yOffset: height * 0.65, color: `rgba(56, 189, 248, ${0.2 * intensityFactor})` },
        { amplitude: 100, freq: 0.0008, speed: -1.0, yOffset: height * 0.8, color: `rgba(255, 255, 35, ${0.14 * intensityFactor})` },
      ];

      waveLayers.forEach((layer) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 10) {
          const y =
            layer.yOffset +
            Math.sin(x * layer.freq + waveTime * layer.speed) * layer.amplitude +
            Math.sin(x * layer.freq * 2.2 + waveTime * layer.speed * 1.4) * (layer.amplitude * 0.35);

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();

        // Wave Crest Highlight Line
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y =
            layer.yOffset +
            Math.sin(x * layer.freq + waveTime * layer.speed) * layer.amplitude +
            Math.sin(x * layer.freq * 2.2 + waveTime * layer.speed * 1.4) * (layer.amplitude * 0.35);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 35, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Rising ocean bubbles
      bubbles.forEach((b) => {
        b.y -= b.vy * speedMultiplier;
        b.x += Math.sin(waveTime + b.y * 0.02) * 0.5;

        if (b.y < -10) {
          b.y = height + 10;
          b.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${b.alpha * intensityFactor})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 1.2})`;
        ctx.fill();
      });

      ctx.restore();
    };

    // Click interactive acoustic ripple
    const renderClickRipple = () => {
      if (!mouseRef.current.clickRipple) return;
      const r = mouseRef.current.clickRipple;
      r.r += 4.5 * speedMultiplier;
      r.alpha -= 0.02 * speedMultiplier;

      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 35, ${Math.max(0, r.alpha * intensityFactor)})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FFFF23';
      ctx.shadowBlur = 15;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(45, 212, 191, ${Math.max(0, r.alpha * 0.8 * intensityFactor)})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      if (r.alpha <= 0) {
        mouseRef.current.clickRipple = null;
      }
    };

    // Main animation loop
    const loop = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Measure FPS
      frameCount++;
      const now = performance.now();
      if (now - lastFrameTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastFrameTime = now;
      }

      switch (config.theme) {
        case 'SONAR_SWEEP':
          renderSonar();
          break;
        case 'BIOLUMINESCENT_ABYSS':
          renderBioluminescent(time);
          break;
        case 'NEURAL_SENSOR_MESH':
          renderNeuralMesh();
          break;
        case 'OCEANIC_CAUSTICS_WAVES':
          renderOceanicWaves();
          break;
        default:
          renderSonar();
      }

      renderClickRipple();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [config]);

  if (!config.enabled) return null;

  const currentThemeObj = WALLPAPER_THEMES.find(t => t.id === config.theme) || WALLPAPER_THEMES[0];

  return (
    <>
      {/* Dynamic 60FPS Ocean Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ opacity: config.opacity ?? 0.95 }}
        className={`fixed inset-0 pointer-events-none select-none transition-opacity duration-500 ${
          config.showcaseMode ? 'z-50 pointer-events-auto cursor-crosshair' : 'z-0'
        } ${className}`}
      />

      {/* Cinematic Fullscreen Showcase HUD Overlay (When showcaseMode is true) */}
      {config.showcaseMode && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between p-6 select-none font-mono">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between pointer-events-auto bg-[#0C0D0E]/85 backdrop-blur-xl border border-[#20232A] rounded-2xl px-6 py-3.5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFFF23] text-black flex items-center justify-center font-black">
                <Radar className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">{currentThemeObj.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFFF23]/20 text-[#FFFF23] border border-[#FFFF23]/40">
                    CINEMATIC 60FPS
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 font-sans">{currentThemeObj.subtitle}</p>
              </div>
            </div>

            {/* Quick Theme Buttons in Showcase */}
            <div className="flex items-center gap-2">
              {WALLPAPER_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => wallpaperService.setTheme(theme.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    config.theme === theme.id
                      ? 'bg-[#FFFF23] text-black shadow-[0_0_12px_rgba(255,255,35,0.4)]'
                      : 'bg-[#141518] text-stone-400 hover:text-white border border-[#25282F]'
                  }`}
                >
                  {theme.name.split(' ')[0]}
                </button>
              ))}

              <button
                onClick={() => wallpaperService.setShowcaseMode(false)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#FF6F59] hover:bg-white text-white hover:text-black text-xs font-bold transition-all shadow-md ml-2"
                title="Exit Cinematic Mode (ESC)"
              >
                <X className="w-4 h-4" />
                <span>Exit Cinema (ESC)</span>
              </button>
            </div>
          </div>

          {/* Bottom Telemetry HUD */}
          <div className="flex items-center justify-between pointer-events-auto bg-[#0C0D0E]/85 backdrop-blur-xl border border-[#20232A] rounded-2xl px-6 py-3 shadow-2xl text-xs text-stone-400">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-white font-bold">HYDROACOUSTIC SENSORS: ONLINE</span>
              </span>
              <span>RENDER: {fps} FPS</span>
              <span>CURSOR: INTERACTIVE TOWFISH RADAR</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-stone-400 text-[11px]">Click anywhere to fire acoustic pulse shockwave</span>
              <button
                onClick={() => wallpaperService.setShowcaseMode(false)}
                className="text-[#FFFF23] underline font-bold"
              >
                Return to Dashboard →
              </button>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
