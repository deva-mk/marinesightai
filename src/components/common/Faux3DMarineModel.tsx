import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { 
  RotateCcw, 
  Layers, 
  Maximize2, 
  Crosshair, 
  Radio, 
  Eye, 
  Compass,
  Cpu,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface Faux3DMarineModelProps {
  scrollProgress?: number; // 0 to 1 scroll driven rotation
  autoRotate?: boolean;
  className?: string;
  wireframeDefault?: boolean;
  showControls?: boolean;
  onHotspotSelect?: (subsystem: string) => void;
}

export interface Faux3DModelHandle {
  setTargetRotation: (rx: number, ry: number) => void;
  resetView: () => void;
}

interface Hotspot {
  id: string;
  title: string;
  code: string;
  desc: string;
  pos: [number, number, number]; // 3D coordinates
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'sonar',
    title: 'Dual-Frequency Side-Scan Array',
    code: 'SS-455/900',
    desc: '455 kHz high-range search & 900 kHz millimeter-resolution seafloor acoustic imaging.',
    pos: [1.3, -0.2, 0.4]
  },
  {
    id: 'vision',
    title: 'Optical Micro-Gimbal & YOLOv8 TPU',
    code: 'OPT-4K-AI',
    desc: 'Low-light 4K stereoscopic optics with 120 FPS on-device tensor inference.',
    pos: [0, 0.5, 2.6]
  },
  {
    id: 'thruster',
    title: 'Vector Magnetic Direct-Drive',
    code: 'VEC-800W',
    desc: 'Cavitation-resistant dual magnetic thrusters for 12 knots surge & precise seabed hover.',
    pos: [0.7, 0, -2.4]
  },
  {
    id: 'ballast',
    title: 'Autonomous Variable Buoyancy',
    code: 'VBS-600M',
    desc: 'Closed-loop oil-displacement buoyancy engine rated to 600m depth rating.',
    pos: [-0.9, -0.3, -0.6]
  }
];

export const Faux3DMarineModel = forwardRef<Faux3DModelHandle, Faux3DMarineModelProps>(({
  scrollProgress = 0,
  autoRotate = true,
  className = '',
  wireframeDefault = false,
  showControls = true,
  onHotspotSelect
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(wireframeDefault);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [hotspotScreenPositions, setHotspotScreenPositions] = useState<{ [id: string]: { x: number; y: number; visible: boolean } }>({});

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const propellerLeftRef = useRef<THREE.Mesh | null>(null);
  const propellerRightRef = useRef<THREE.Mesh | null>(null);
  const sonarConeRef = useRef<THREE.Mesh | null>(null);

  // Mouse drag & tracking state
  const mousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: 0.8 });
  const currentRotationRef = useRef({ x: 0.2, y: 0.8 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    setTargetRotation: (rx: number, ry: number) => {
      targetRotationRef.current = { x: rx, y: ry };
    },
    resetView: () => {
      targetRotationRef.current = { x: 0.2, y: 0.8 };
    }
  }));

  // Setup Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffff23, 2.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2dd4bf, 2.2);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
    fillLight.position.set(0, -6, 6);
    scene.add(fillLight);

    // 5. Build High-Fidelity Autonomous Sonar Towfish / ROV Model
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Materials
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x14161B,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: wireframe
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xFFFF23,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xFFFF23,
      emissiveIntensity: 0.25,
      wireframe: wireframe
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x22242B,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: wireframe
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x2DD4BF,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
      emissive: 0x2DD4BF,
      emissiveIntensity: 0.4
    });

    // Submersible Main Fuselage Body
    const bodyGeom = new THREE.CylinderGeometry(0.85, 0.75, 4.2, 36, 16);
    bodyGeom.rotateX(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeom, hullMat);
    modelGroup.add(bodyMesh);

    // Hydrodynamic Fore Nose Cone
    const noseGeom = new THREE.ConeGeometry(0.85, 1.4, 36, 16);
    noseGeom.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeom, carbonMat);
    noseMesh.position.z = 2.8;
    modelGroup.add(noseMesh);

    // Acoustic Sonar Dome Lens (Nose tip)
    const domeGeom = new THREE.SphereGeometry(0.38, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeom.rotateX(Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeom, lensMat);
    domeMesh.position.z = 3.5;
    modelGroup.add(domeMesh);

    // Camera Sensor Turret / Gimbal Housing
    const turretGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.4, 18);
    const turretMesh = new THREE.Mesh(turretGeom, accentMat);
    turretMesh.position.set(0, 0.85, 2.0);
    modelGroup.add(turretMesh);

    const turretLensGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const turretLensMesh = new THREE.Mesh(turretLensGeom, lensMat);
    turretLensMesh.position.set(0, 0.95, 2.2);
    modelGroup.add(turretLensMesh);

    // Lateral Wings with Side-Scan Transducer Pods
    const wingGeom = new THREE.BoxGeometry(3.6, 0.08, 0.9);
    const wingMesh = new THREE.Mesh(wingGeom, carbonMat);
    wingMesh.position.set(0, -0.05, 0.2);
    modelGroup.add(wingMesh);

    // Port & Starboard Transducer Pods (Electric Yellow accents)
    const podGeom = new THREE.CylinderGeometry(0.2, 0.18, 1.4, 18);
    podGeom.rotateX(Math.PI / 2);

    const leftPod = new THREE.Mesh(podGeom, accentMat);
    leftPod.position.set(-1.8, -0.08, 0.2);
    modelGroup.add(leftPod);

    const rightPod = new THREE.Mesh(podGeom, accentMat);
    rightPod.position.set(1.8, -0.08, 0.2);
    modelGroup.add(rightPod);

    // Stabilizing Dorsal Fin
    const dorsalGeom = new THREE.BoxGeometry(0.08, 0.9, 0.8);
    const dorsalMesh = new THREE.Mesh(dorsalGeom, accentMat);
    dorsalMesh.position.set(0, 1.1, -1.5);
    modelGroup.add(dorsalMesh);

    // Ventral Keel Fin
    const keelGeom = new THREE.BoxGeometry(0.08, 0.6, 0.9);
    const keelMesh = new THREE.Mesh(keelGeom, carbonMat);
    keelMesh.position.set(0, -0.95, -1.4);
    modelGroup.add(keelMesh);

    // Twin Thruster Nacelles
    const nacelleGeom = new THREE.CylinderGeometry(0.32, 0.32, 1.0, 20);
    nacelleGeom.rotateX(Math.PI / 2);

    const leftNacelle = new THREE.Mesh(nacelleGeom, carbonMat);
    leftNacelle.position.set(-0.7, 0, -2.4);
    modelGroup.add(leftNacelle);

    const rightNacelle = new THREE.Mesh(nacelleGeom, carbonMat);
    rightNacelle.position.set(0.7, 0, -2.4);
    modelGroup.add(rightNacelle);

    // Propellers
    const propGeom = new THREE.BoxGeometry(0.55, 0.06, 0.04);
    const leftProp = new THREE.Mesh(propGeom, accentMat);
    leftProp.position.set(-0.7, 0, -2.95);
    modelGroup.add(leftProp);
    propellerLeftRef.current = leftProp;

    const rightProp = new THREE.Mesh(propGeom, accentMat);
    rightProp.position.set(0.7, 0, -2.95);
    modelGroup.add(rightProp);
    propellerRightRef.current = rightProp;

    // Sonar Beam Projection Cone (Wireframe downward acoustic pulse)
    const coneGeom = new THREE.ConeGeometry(2.4, 3.2, 16, 4, true);
    coneGeom.rotateX(-Math.PI);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xFFFF23,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const sonarCone = new THREE.Mesh(coneGeom, coneMat);
    sonarCone.position.set(0, -2.2, 0.5);
    modelGroup.add(sonarCone);
    sonarConeRef.current = sonarCone;

    // Subtle Seabed Depth Grid below the drone
    const gridHelper = new THREE.GridHelper(8, 16, 0xFFFF23, 0x25282F);
    gridHelper.position.y = -2.8;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Spin propellers
      if (propellerLeftRef.current && propellerRightRef.current) {
        propellerLeftRef.current.rotation.z += 12 * delta;
        propellerRightRef.current.rotation.z -= 12 * delta;
      }

      // Pulse downward sonar acoustic cone
      if (sonarConeRef.current) {
        const pulse = 0.14 + Math.sin(elapsedTime * 3) * 0.08;
        (sonarConeRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
        sonarConeRef.current.scale.set(
          1 + Math.sin(elapsedTime * 2) * 0.05,
          1,
          1 + Math.sin(elapsedTime * 2) * 0.05
        );
      }

      // Smooth damped rotation interpolation (lerp)
      if (isRotating && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.45;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = currentRotationRef.current.x + Math.sin(elapsedTime * 0.8) * 0.04;
        modelGroupRef.current.rotation.y = currentRotationRef.current.y;
        modelGroupRef.current.rotation.z = Math.sin(elapsedTime * 0.6) * 0.03;
        // Float hovering motion
        modelGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
      }

      // Update 2D Screen Positions of Hotspots for React overlay
      if (cameraRef.current && containerRef.current && modelGroupRef.current) {
        const newPositions: { [id: string]: { x: number; y: number; visible: boolean } } = {};
        const cWidth = containerRef.current.clientWidth;
        const cHeight = containerRef.current.clientHeight;

        HOTSPOTS.forEach(h => {
          const v = new THREE.Vector3(...h.pos);
          v.applyMatrix4(modelGroupRef.current!.matrixWorld);
          v.project(cameraRef.current!);

          const x = (v.x * 0.5 + 0.5) * cWidth;
          const y = (-(v.y * 0.5) + 0.5) * cHeight;
          const visible = v.z < 1.0; // In front of camera

          newPositions[h.id] = { x, y, visible };
        });
        setHotspotScreenPositions(newPositions);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update wireframe mode dynamically
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => {
            if ('wireframe' in m) m.wireframe = wireframe;
          });
        } else if ('wireframe' in mesh.material) {
          mesh.material.wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  // Scroll Progress Driven Rotation
  useEffect(() => {
    if (scrollProgress !== undefined && modelGroupRef.current) {
      // Rotate 360 degrees smoothly based on scroll
      const targetY = scrollProgress * Math.PI * 2.5;
      const targetX = 0.2 + Math.sin(scrollProgress * Math.PI) * 0.4;
      targetRotationRef.current.y = targetY;
      targetRotationRef.current.x = targetX;
    }
  }, [scrollProgress]);

  // Mouse drag & interaction handling
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Normalized device coordinates (-1 to 1) for subtle tilt when not dragging
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mousePosRef.current = { x: normX, y: normY };

    if (isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;

      // Clamp X tilt
      targetRotationRef.current.x = Math.max(-0.8, Math.min(0.8, targetRotationRef.current.x));

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleHotspotClick = (h: Hotspot) => {
    setActiveHotspot(activeHotspot?.id === h.id ? null : h);
    if (onHotspotSelect) onHotspotSelect(h.id);

    // Point camera towards hotspot smoothly
    if (h.id === 'sonar') targetRotationRef.current = { x: 0.1, y: 1.6 };
    if (h.id === 'vision') targetRotationRef.current = { x: 0.35, y: 0.1 };
    if (h.id === 'thruster') targetRotationRef.current = { x: -0.1, y: 3.2 };
    if (h.id === 'ballast') targetRotationRef.current = { x: -0.2, y: -1.4 };
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full min-h-[380px] select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl bg-[#0C0D0E]/80 border border-[#20232A] ${className}`}
    >
      {/* Background Radial Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,35,0.06),transparent_65%)]" />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-black bg-[#FFFF23] text-black tracking-widest uppercase shadow-[0_0_12px_rgba(255,255,35,0.4)]">
          3D HARDWARE TELEMETRY
        </span>
        <span className="text-xs font-mono text-stone-400">Proteus AUV-6000 Towfish</span>
      </div>

      {/* Interactive Subsystem Hotspot Pins */}
      {HOTSPOTS.map((h) => {
        const screenPos = hotspotScreenPositions[h.id];
        if (!screenPos || !screenPos.visible) return null;

        const isSelected = activeHotspot?.id === h.id;

        return (
          <div
            key={h.id}
            style={{
              transform: `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`,
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 30
            }}
            className="pointer-events-auto"
          >
            <button
              onClick={() => handleHotspotClick(h)}
              className="relative -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer flex items-center justify-center p-1"
            >
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                isSelected
                  ? 'bg-[#FFFF23] border-white scale-125 shadow-[0_0_15px_#FFFF23]'
                  : 'bg-[#121316] border-[#FFFF23] group-hover/pin:scale-115 shadow-[0_0_8px_rgba(255,255,35,0.3)]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-[#FFFF23]'}`} />
              </span>

              {/* Pin ripple pulse */}
              <span className="absolute inset-0 rounded-full bg-[#FFFF23] animate-ping opacity-30 pointer-events-none" />

              {/* Pin Code Label */}
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 rounded bg-[#0C0D0E]/90 border border-[#25282F] text-[9px] font-mono font-bold text-stone-300 pointer-events-none">
                {h.code}
              </span>
            </button>
          </div>
        );
      })}

      {/* Active Hotspot Info Card Flyout */}
      {activeHotspot && (
        <div className="absolute bottom-16 left-4 right-4 sm:right-auto sm:max-w-xs z-30 p-4 rounded-2xl bg-[#121316]/95 border border-[#FFFF23] backdrop-blur-xl shadow-[0_0_25px_rgba(255,255,35,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold text-[#FFFF23] uppercase tracking-wider">
              {activeHotspot.code}
            </span>
            <button
              onClick={() => setActiveHotspot(null)}
              className="text-stone-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>
          <h4 className="text-sm font-black text-white">{activeHotspot.title}</h4>
          <p className="text-xs text-stone-300 mt-1 leading-relaxed">{activeHotspot.desc}</p>
        </div>
      )}

      {/* Interactive Controls Toolbar */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          
          <div className="flex items-center gap-1.5 bg-[#0C0D0E]/90 p-1 rounded-xl border border-[#25282F]">
            {/* Auto Rotate Toggle */}
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                isRotating ? 'bg-[#FFFF23] text-black' : 'text-stone-400 hover:text-white'
              }`}
              title="Toggle Auto-Rotation"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Orbit</span>
            </button>

            {/* Wireframe Mode */}
            <button
              onClick={() => setWireframe(!wireframe)}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                wireframe ? 'bg-[#FFFF23] text-black' : 'text-stone-400 hover:text-white'
              }`}
              title="Toggle Holographic Wireframe"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wireframe</span>
            </button>

            {/* Reset Orientation */}
            <button
              onClick={() => {
                targetRotationRef.current = { x: 0.2, y: 0.8 };
                setActiveHotspot(null);
              }}
              className="p-1.5 rounded-lg text-xs font-mono text-stone-400 hover:text-white transition-colors"
              title="Reset 3D Perspective"
            >
              Reset
            </button>
          </div>

          <div className="text-[10px] font-mono text-stone-500 hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFFF23] animate-pulse" />
            <span>Interactive Drag & Cursor Tracking</span>
          </div>

        </div>
      )}

    </div>
  );
});

Faux3DMarineModel.displayName = 'Faux3DMarineModel';
