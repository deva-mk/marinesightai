import React, { useEffect, useRef, useState } from 'react';
import { wallpaperService, WallpaperConfig, WallpaperTheme } from '../../services/wallpaperService';

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
  const mouseRef = useRef<{ x: number; y: number; active: boolean; clickRipple: { x: number; y: number; r: number; alpha: number } | null }>({
    x: -1000,
    y: -1000,
    active: false,
    clickRipple: null,
  });

  // Subscribe to wallpaper service changes
  useEffect(() => {
    return wallpaperService.subscribe((newConfig) => {
      setConfig(newConfig);
    });
  }, []);

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
        r: 5,
        alpha: 1.0,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Global intensity multiplier
    const intensityFactor = config.intensity === 'vibrant' ? 1.0 : config.intensity === 'subtle' ? 0.6 : 0.35;
    const speedMultiplier = config.speed || 1.0;

    // --- State for SONAR_SWEEP ---
    let sonarAngle = 0;
    const sonarCenter = { x: width * 0.5, y: height * 0.48 };
    const sonarMaxRadius = Math.max(width, height) * 0.7;
    const sonarTargets: SonarTarget[] = [
      { x: sonarCenter.x + 180, y: sonarCenter.y - 120, size: 5, label: 'Ghost Net Mass #04', depth: '18.4m', detectedTime: 0, echoRadius: 0 },
      { x: sonarCenter.x - 240, y: sonarCenter.y + 140, size: 4, label: 'Submerged Crab Pot Array', depth: '24.1m', detectedTime: 0, echoRadius: 0 },
      { x: sonarCenter.x + 320, y: sonarCenter.y + 200, size: 6, label: 'Derelict Mooring Cable', depth: '31.2m', detectedTime: 0, echoRadius: 0 },
      { x: sonarCenter.x - 160, y: sonarCenter.y - 220, size: 4, label: 'Acoustic Shadow Anomaly', depth: '14.8m', detectedTime: 0, echoRadius: 0 },
      { x: sonarCenter.x + 80, y: sonarCenter.y + 280, size: 5, label: 'Benthic Entanglement Cluster', depth: '38.5m', detectedTime: 0, echoRadius: 0 },
      { x: sonarCenter.x - 380, y: sonarCenter.y - 60, size: 4, label: 'Hydrophone Beacon P-09', depth: '12.0m', detectedTime: 0, echoRadius: 0 },
    ];

    // --- State for BIOLUMINESCENT_ABYSS ---
    const bioParticles: Particle[] = [];
    const bioColors = ['#2DD4BF', '#38BDF8', '#FFFF23', '#818CF8', '#34D399'];
    for (let i = 0; i < 70; i++) {
      bioParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.15 - Math.random() * 0.35, // slow upward drift (planktonic current)
        size: 1.5 + Math.random() * 3.5,
        originalSize: 1.5 + Math.random() * 3.5,
        color: bioColors[Math.floor(Math.random() * bioColors.length)],
        alpha: 0.2 + Math.random() * 0.6,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
      });
    }

    // --- State for NEURAL_SENSOR_MESH ---
    const meshNodes: MeshNode[] = [];
    for (let i = 0; i < 42; i++) {
      meshNodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: i % 7 === 0 ? 4.5 : 2.5,
        id: `N-${i + 1}`,
        isHub: i % 7 === 0,
        pulse: Math.random() * Math.PI,
      });
    }

    const packets: SignalPacket[] = [];
    const spawnPacket = () => {
      if (meshNodes.length < 2) return;
      const from = Math.floor(Math.random() * meshNodes.length);
      let to = Math.floor(Math.random() * meshNodes.length);
      while (to === from) to = Math.floor(Math.random() * meshNodes.length);
      packets.push({
        fromNode: from,
        toNode: to,
        progress: 0,
        speed: 0.008 + Math.random() * 0.015,
        color: Math.random() > 0.4 ? '#2DD4BF' : '#FFFF23',
      });
    };

    for (let i = 0; i < 8; i++) spawnPacket();

    // --- State for OCEANIC_CAUSTICS_WAVES ---
    let waveTime = 0;

    // --- RENDER FUNCTIONS ---

    // 1. SONAR SWEEP RENDERER
    const renderSonar = (time: number) => {
      sonarCenter.x = width * 0.5;
      sonarCenter.y = height * 0.48;

      sonarAngle = (sonarAngle + 0.012 * speedMultiplier) % (Math.PI * 2);

      // Radar Concentric Range Rings
      const ringDistances = [120, 240, 360, 500, 680];
      const ringLabels = ['100m', '250m', '500m', '750m', '1000m'];

      ctx.save();
      ctx.lineWidth = 1;

      // Range rings
      ringDistances.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(sonarCenter.x, sonarCenter.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.08 * intensityFactor})`;
        ctx.stroke();

        // Dashed sub-ring
        ctx.beginPath();
        ctx.setLineDash([4, 12]);
        ctx.arc(sonarCenter.x, sonarCenter.y, r - 60, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 35, ${0.04 * intensityFactor})`;
        ctx.stroke();
        ctx.setLineDash([]);

        // Nautical Distance Label
        ctx.font = '9px monospace';
        ctx.fillStyle = `rgba(45, 212, 191, ${0.3 * intensityFactor})`;
        ctx.fillText(ringLabels[idx], sonarCenter.x + r - 35, sonarCenter.y - 6);
      });

      // Crosshairs & Bearing rays
      const angles = [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75];
      angles.forEach((ang) => {
        ctx.beginPath();
        ctx.moveTo(sonarCenter.x, sonarCenter.y);
        ctx.lineTo(sonarCenter.x + Math.cos(ang) * sonarMaxRadius, sonarCenter.y + Math.sin(ang) * sonarMaxRadius);
        ctx.strokeStyle = `rgba(45, 212, 191, ${0.06 * intensityFactor})`;
        ctx.stroke();
      });

      // Rotating Acoustic Sweep Beam with Phosphor Gradient Fan
      const sweepSpan = Math.PI * 0.35; // 63 degree wedge
      const steps = 32;
      for (let i = 0; i < steps; i++) {
        const a = sonarAngle - (i / steps) * sweepSpan;
        const alpha = (1 - i / steps) * 0.16 * intensityFactor;

        ctx.beginPath();
        ctx.moveTo(sonarCenter.x, sonarCenter.y);
        ctx.arc(sonarCenter.x, sonarCenter.y, sonarMaxRadius, a, a + 0.02);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 35, ${alpha})`;
        ctx.fill();
      }

      // Leading sharp sweep beam line
      ctx.beginPath();
      ctx.moveTo(sonarCenter.x, sonarCenter.y);
      ctx.lineTo(sonarCenter.x + Math.cos(sonarAngle) * sonarMaxRadius, sonarCenter.y + Math.sin(sonarAngle) * sonarMaxRadius);
      ctx.strokeStyle = `rgba(255, 255, 35, ${0.7 * intensityFactor})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#FFFF23';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sonar Targets Check & Ping
      sonarTargets.forEach((target) => {
        // Calculate angle to target
        const dx = target.x - sonarCenter.x;
        const dy = target.y - sonarCenter.y;
        let targetAngle = Math.atan2(dy, dx);
        if (targetAngle < 0) targetAngle += Math.PI * 2;

        // Check if sweep beam is hitting this target
        const angleDiff = (sonarAngle - targetAngle + Math.PI * 2) % (Math.PI * 2);
        if (angleDiff < 0.08) {
          target.detectedTime = Date.now();
          target.echoRadius = target.size;
        }

        const elapsed = Date.now() - target.detectedTime;
        const isFresh = elapsed < 2800;
        const pingAlpha = isFresh ? Math.max(0, 1 - elapsed / 2800) * intensityFactor : 0.08 * intensityFactor;

        // Expanding echo ring
        if (isFresh) {
          target.echoRadius += 0.8 * speedMultiplier;
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.echoRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 35, ${pingAlpha * 0.7})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Target blip point
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
        ctx.fillStyle = isFresh ? `rgba(255, 255, 35, ${pingAlpha})` : `rgba(45, 212, 191, ${0.15 * intensityFactor})`;
        ctx.shadowColor = '#FFFF23';
        ctx.shadowBlur = isFresh ? 12 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target telemetry tag
        if (isFresh && pingAlpha > 0.25) {
          ctx.font = '10px monospace';
          ctx.fillStyle = `rgba(255, 255, 35, ${pingAlpha})`;
          ctx.fillText(`▲ ${target.label} [${target.depth}]`, target.x + 10, target.y - 6);
        }
      });

      // Mouse Towfish Reticle
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mDist = Math.hypot(mx - sonarCenter.x, my - sonarCenter.y);
        let mAngle = (Math.atan2(my - sonarCenter.y, mx - sonarCenter.x) * 180) / Math.PI;
        if (mAngle < 0) mAngle += 360;

        ctx.strokeStyle = `rgba(45, 212, 191, ${0.25 * intensityFactor})`;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(mx, my, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '9px monospace';
        ctx.fillStyle = `rgba(45, 212, 191, ${0.55 * intensityFactor})`;
        ctx.fillText(`R: ${(mDist * 0.8).toFixed(1)}m | BRG: ${mAngle.toFixed(0).padStart(3, '0')}°`, mx + 26, my + 4);
      }

      ctx.restore();
    };

    // 2. BIOLUMINESCENT ABYSS RENDERER
    const renderBioluminescent = (time: number) => {
      ctx.save();

      // Soft deep-sea underwater ambient gradient pulses
      const bgGrad1 = ctx.createRadialGradient(
        width * 0.25 + Math.sin(time * 0.0004) * 80,
        height * 0.35 + Math.cos(time * 0.0003) * 60,
        20,
        width * 0.25,
        height * 0.35,
        width * 0.55
      );
      bgGrad1.addColorStop(0, `rgba(45, 212, 191, ${0.06 * intensityFactor})`);
      bgGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad1;
      ctx.fillRect(0, 0, width, height);

      const bgGrad2 = ctx.createRadialGradient(
        width * 0.75 + Math.cos(time * 0.0005) * 90,
        height * 0.65 + Math.sin(time * 0.0004) * 70,
        30,
        width * 0.75,
        height * 0.65,
        width * 0.6
      );
      bgGrad2.addColorStop(0, `rgba(255, 255, 35, ${0.04 * intensityFactor})`);
      bgGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGrad2;
      ctx.fillRect(0, 0, width, height);

      // Render drifting plankton & marine snow
      bioParticles.forEach((p) => {
        // Move with slow ocean drift
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        // Interactive mouse repulsion/eddy
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160 && dist > 1) {
            const force = (1 - dist / 160) * 1.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Wrap around borders
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        // Breathing pulse
        p.pulsePhase += p.pulseSpeed * speedMultiplier;
        const currentAlpha = (p.alpha + Math.sin(p.pulsePhase) * 0.2) * intensityFactor;
        const currentSize = p.originalSize + Math.sin(p.pulsePhase) * 0.8;

        // Bioluminescent Halo
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4.5);
        glow.addColorStop(0, p.color);
        glow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.globalAlpha = Math.max(0, currentAlpha * 0.45);
        ctx.fill();

        // Core bright ember
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, currentAlpha * 1.2);
        ctx.fill();
      });

      ctx.restore();
    };

    // 3. NEURAL SENSOR MESH RENDERER
    const renderNeuralMesh = () => {
      ctx.save();
      const maxDistance = 160;

      // Update node positions
      meshNodes.forEach((node) => {
        node.x += node.vx * speedMultiplier;
        node.y += node.vy * speedMultiplier;

        // Bounce walls
        if (node.x < 20 || node.x > width - 20) node.vx *= -1;
        if (node.y < 20 || node.y > height - 20) node.vy *= -1;

        // Mouse attraction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - node.x;
          const dy = mouseRef.current.y - node.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 2) {
            node.x += (dx / dist) * 0.5;
            node.y += (dy / dist) * 0.5;
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
            const alpha = (1 - dist / maxDistance) * 0.22 * intensityFactor;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n1.isHub || n2.isHub ? `rgba(255, 255, 35, ${alpha * 1.4})` : `rgba(45, 212, 191, ${alpha})`;
            ctx.lineWidth = n1.isHub || n2.isHub ? 1.2 : 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw telemetry signal packets traveling between nodes
      packets.forEach((packet, idx) => {
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
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = packet.color;
        ctx.shadowColor = packet.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Nodes
      meshNodes.forEach((node) => {
        node.pulse += 0.03 * speedMultiplier;
        const pulseScale = 1 + Math.sin(node.pulse) * 0.2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseScale, 0, Math.PI * 2);
        ctx.fillStyle = node.isHub ? `rgba(255, 255, 35, ${0.85 * intensityFactor})` : `rgba(45, 212, 191, ${0.65 * intensityFactor})`;
        ctx.fill();

        if (node.isHub) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.8 * pulseScale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 35, ${0.25 * intensityFactor})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      ctx.restore();
    };

    // 4. OCEANIC CAUSTICS & UNDULATING WAVES RENDERER
    const renderOceanicWaves = (time: number) => {
      ctx.save();
      waveTime += 0.008 * speedMultiplier;

      const waveLayers = [
        { amplitude: 45, frequency: 0.0018, speed: 1.0, yOffset: height * 0.35, color: `rgba(13, 148, 136, ${0.08 * intensityFactor})` },
        { amplitude: 60, frequency: 0.0014, speed: -0.7, yOffset: height * 0.5, color: `rgba(45, 212, 191, ${0.07 * intensityFactor})` },
        { amplitude: 75, frequency: 0.0012, speed: 1.2, yOffset: height * 0.65, color: `rgba(56, 189, 248, ${0.06 * intensityFactor})` },
        { amplitude: 90, frequency: 0.0009, speed: -0.9, yOffset: height * 0.8, color: `rgba(255, 255, 35, ${0.04 * intensityFactor})` },
      ];

      waveLayers.forEach((layer) => {
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 12) {
          // Complex sine summation for realistic water wave fluid motion
          const y =
            layer.yOffset +
            Math.sin(x * layer.frequency + waveTime * layer.speed) * layer.amplitude +
            Math.sin(x * layer.frequency * 2.1 + waveTime * layer.speed * 1.5) * (layer.amplitude * 0.3);

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = layer.color;
        ctx.fill();
      });

      // Ambient underwater caustic beams
      const beamCount = 4;
      for (let b = 0; b < beamCount; b++) {
        const beamX = width * (0.2 + b * 0.22) + Math.sin(waveTime + b) * 50;
        const beamGrad = ctx.createLinearGradient(beamX, 0, beamX + 80, height);
        beamGrad.addColorStop(0, `rgba(45, 212, 191, ${0.04 * intensityFactor})`);
        beamGrad.addColorStop(0.5, `rgba(255, 255, 35, ${0.02 * intensityFactor})`);
        beamGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(beamX - 30, 0);
        ctx.lineTo(beamX + 60, 0);
        ctx.lineTo(beamX + 220, height);
        ctx.lineTo(beamX + 110, height);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    // Click interactive water ripple
    const renderClickRipple = () => {
      if (!mouseRef.current.clickRipple) return;
      const r = mouseRef.current.clickRipple;
      r.r += 3.5 * speedMultiplier;
      r.alpha -= 0.02 * speedMultiplier;

      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 35, ${Math.max(0, r.alpha * intensityFactor)})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(45, 212, 191, ${Math.max(0, r.alpha * 0.7 * intensityFactor)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      if (r.alpha <= 0) {
        mouseRef.current.clickRipple = null;
      }
    };

    // Animation loop
    const loop = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      switch (config.theme) {
        case 'SONAR_SWEEP':
          renderSonar(time);
          break;
        case 'BIOLUMINESCENT_ABYSS':
          renderBioluminescent(time);
          break;
        case 'NEURAL_SENSOR_MESH':
          renderNeuralMesh();
          break;
        case 'OCEANIC_CAUSTICS_WAVES':
          renderOceanicWaves(time);
          break;
        default:
          renderSonar(time);
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

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 select-none transition-opacity duration-700 ${className}`}
    />
  );
};
