import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Rotate3d,
  Compass,
  Eye,
  Palette,
  Maximize2,
  RefreshCw,
  Sparkles,
  Layers,
} from 'lucide-react';
import { MaterialPreset, SpiralParameters, ViewSettings, WheelParameters } from '../types/cad';
import { generateHopUpDialCADModel, GeneratedCADModel } from '../utils/cadModelGenerator';

interface ThreeViewportProps {
  wheel: WheelParameters;
  spiral: SpiralParameters;
  viewSettings: ViewSettings;
  onUpdateViewSettings: (settings: Partial<ViewSettings>) => void;
  onExportSTL: () => void;
}

export const ThreeViewport: React.FC<ThreeViewportProps> = ({
  wheel,
  spiral,
  viewSettings,
  onUpdateViewSettings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Mesh refs
  const dialMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.LineSegments | null>(null);
  const gradientRibbonRef = useRef<THREE.Mesh | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);

  const isSoftwareGlRef = useRef<boolean>(false);
  const animFrameId = useRef<number>(0);
  const targetCameraPos = useRef<THREE.Vector3 | null>(null);
  const targetControlsTarget = useRef<THREE.Vector3 | null>(null);

  const [isComputingCSG, setIsComputingCSG] = useState(false);

  // Setup Three.js scene once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Detect software WebGL
    const glProbe = document.createElement('canvas').getContext('webgl2');
    if (glProbe) {
      const ext = glProbe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : glProbe.RENDERER;
      const gpu = String(glProbe.getParameter(param));
      glProbe.getExtension('WEBGL_lose_context')?.loseContext();
      isSoftwareGlRef.current = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    } else {
      isSoftwareGlRef.current = true;
    }

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0d10);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(24, -32, 28);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGlRef.current,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGlRef.current ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGlRef.current;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    canvasRef.current = renderer.domElement;

    // Room Environment for realistic PBR reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    keyLight.position.set(35, -25, 45);
    keyLight.castShadow = !isSoftwareGlRef.current;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    fillLight.position.set(-30, 20, 30);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(0, 40, 20);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.8);
    scene.add(hemiLight);

    // Subtle technical floor grid
    const grid = new THREE.GridHelper(60, 60, 0x38bdf8, 0x27272a);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.05;
    scene.add(grid);

    // Contact shadow ring below wheel
    const shadowGeo = new THREE.RingGeometry(0.1, 16, 64);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.z = -0.04;
    scene.add(shadowMesh);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGlRef.current;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0, 2);
    controls.maxDistance = 120;
    controls.minDistance = 6;
    controlsRef.current = controls;

    // Markers group for Start/End indicators
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation render loop
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      // Smooth camera transition if active
      if (targetCameraPos.current && targetControlsTarget.current) {
        camera.position.lerp(targetCameraPos.current, 0.08);
        controls.target.lerp(targetControlsTarget.current, 0.08);

        if (camera.position.distanceTo(targetCameraPos.current) < 0.1) {
          targetCameraPos.current = null;
          targetControlsTarget.current = null;
        }
      }

      if (viewSettings.autoRotate && dialMeshRef.current) {
        dialMeshRef.current.rotation.z += 0.005;
        if (wireframeMeshRef.current) wireframeMeshRef.current.rotation.z += 0.005;
        if (gradientRibbonRef.current) gradientRibbonRef.current.rotation.z += 0.005;
        if (markersGroupRef.current) markersGroupRef.current.rotation.z += 0.005;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Material builder helper based on preset
  const getMaterialForPreset = (preset: MaterialPreset) => {
    switch (preset) {
      case 'delrin_black':
        return new THREE.MeshStandardMaterial({
          color: 0x1f2126,
          roughness: 0.38,
          metalness: 0.05,
        });
      case 'gunmetal':
        return new THREE.MeshStandardMaterial({
          color: 0x5a6069,
          roughness: 0.22,
          metalness: 0.82,
        });
      case 'anodized_red':
        return new THREE.MeshStandardMaterial({
          color: 0xd92626,
          roughness: 0.18,
          metalness: 0.75,
        });
      case 'brass_gold':
        return new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.15,
          metalness: 0.92,
        });
      case 'neon_cad':
        return new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          roughness: 0.25,
          metalness: 0.6,
        });
      default:
        return new THREE.MeshStandardMaterial({
          color: 0x27272a,
          roughness: 0.35,
          metalness: 0.1,
        });
    }
  };

  // Re-generate CAD Model whenever geometry parameters change
  useEffect(() => {
    if (!sceneRef.current) return;
    setIsComputingCSG(true);

    const timer = setTimeout(() => {
      try {
        const scene = sceneRef.current;
        if (!scene) return;

        // Clean up previous meshes
        if (dialMeshRef.current) {
          scene.remove(dialMeshRef.current);
          dialMeshRef.current.geometry.dispose();
          if (Array.isArray(dialMeshRef.current.material)) {
            dialMeshRef.current.material.forEach((m) => m.dispose());
          } else {
            dialMeshRef.current.material.dispose();
          }
          dialMeshRef.current = null;
        }

        if (wireframeMeshRef.current) {
          scene.remove(wireframeMeshRef.current);
          wireframeMeshRef.current.geometry.dispose();
          (wireframeMeshRef.current.material as THREE.Material).dispose();
          wireframeMeshRef.current = null;
        }

        if (gradientRibbonRef.current) {
          scene.remove(gradientRibbonRef.current);
          gradientRibbonRef.current.geometry.dispose();
          (gradientRibbonRef.current.material as THREE.Material).dispose();
          gradientRibbonRef.current = null;
        }

        if (markersGroupRef.current) {
          while (markersGroupRef.current.children.length > 0) {
            const child = markersGroupRef.current.children[0] as THREE.Mesh;
            markersGroupRef.current.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
              else child.material.dispose();
            }
          }
        }

        // Generate new CAD Model
        const model: GeneratedCADModel = generateHopUpDialCADModel(wheel, spiral);

        // Main dial mesh
        const dialMat = getMaterialForPreset(viewSettings.materialPreset);
        const dialMesh = new THREE.Mesh(model.meshGeometry, dialMat);
        dialMesh.castShadow = !isSoftwareGlRef.current;
        dialMesh.receiveShadow = !isSoftwareGlRef.current;
        scene.add(dialMesh);
        dialMeshRef.current = dialMesh;

        // Wireframe edges overlay
        if (viewSettings.wireframe) {
          const wireGeo = new THREE.WireframeGeometry(model.meshGeometry);
          const wireMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            linewidth: 1,
            transparent: true,
            opacity: 0.35,
          });
          const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
          scene.add(wireMesh);
          wireframeMeshRef.current = wireMesh;
        }

        // Gradient visualization ribbon
        if (viewSettings.showGradient) {
          const gradMat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            depthWrite: true,
          });
          const ribbonMesh = new THREE.Mesh(model.gradientRibbonGeometry, gradMat);
          scene.add(ribbonMesh);
          gradientRibbonRef.current = ribbonMesh;
        }

        // Start & End 3D Marker spheres
        if (markersGroupRef.current) {
          const pinRadius = Math.min(0.7, spiral.grooveWidth * 0.35);

          // Start sphere (Blue)
          const startGeo = new THREE.SphereGeometry(pinRadius, 24, 24);
          const startMat = new THREE.MeshStandardMaterial({
            color: 0x2563eb,
            emissive: 0x1d4ed8,
            emissiveIntensity: 0.6,
            roughness: 0.2,
          });
          const startSphere = new THREE.Mesh(startGeo, startMat);
          startSphere.position.copy(model.startPoint);
          markersGroupRef.current.add(startSphere);

          // End sphere (Red)
          const endGeo = new THREE.SphereGeometry(pinRadius, 24, 24);
          const endMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0xdc2626,
            emissiveIntensity: 0.6,
            roughness: 0.2,
          });
          const endSphere = new THREE.Mesh(endGeo, endMat);
          endSphere.position.copy(model.endPoint);
          markersGroupRef.current.add(endSphere);
        }
      } catch (err) {
        console.error('Error generating CAD geometry:', err);
      } finally {
        setIsComputingCSG(false);
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [
    wheel.outerDiameter,
    wheel.innerDiameter,
    wheel.thickness,
    wheel.knurling,
    wheel.knurlCount,
    wheel.knurlDepth,
    wheel.conicalOuter,
    wheel.outerDiameterBottom,
    wheel.steppedBore,
    wheel.steppedBoreBottomDiameter,
    wheel.steppedBoreTopDiameter,
    wheel.steppedBoreHeight,
    spiral.revolutions,
    spiral.totalAngleDeg,
    spiral.startRadius,
    spiral.endRadius,
    spiral.startAngleDeg,
    spiral.grooveWidth,
    spiral.grooveDepth,
    spiral.capStyle,
    viewSettings.wireframe,
    viewSettings.showGradient,
    viewSettings.materialPreset,
  ]);

  // Camera preset handler
  const setCameraPreset = (preset: 'iso' | 'top' | 'bottom' | 'side') => {
    onUpdateViewSettings({ cameraPreset: preset });
    const dist = Math.max(30, wheel.outerDiameter * 1.8);

    if (preset === 'top') {
      targetCameraPos.current = new THREE.Vector3(0, 0.001, dist);
      targetControlsTarget.current = new THREE.Vector3(0, 0, wheel.thickness / 2);
    } else if (preset === 'bottom') {
      targetCameraPos.current = new THREE.Vector3(0, 0.001, -dist);
      targetControlsTarget.current = new THREE.Vector3(0, 0, wheel.thickness / 2);
    } else if (preset === 'side') {
      targetCameraPos.current = new THREE.Vector3(dist, 0, wheel.thickness / 2);
      targetControlsTarget.current = new THREE.Vector3(0, 0, wheel.thickness / 2);
    } else {
      // Iso Perspective
      targetCameraPos.current = new THREE.Vector3(dist * 0.6, -dist * 0.75, dist * 0.7);
      targetControlsTarget.current = new THREE.Vector3(0, 0, wheel.thickness / 2);
    }
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* CSG Loading Badge */}
      {isComputingCSG && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/90 border border-cyan-500/40 text-cyan-400 text-xs font-mono backdrop-blur-md shadow-xl z-20">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>CSG-Berechnung läuft...</span>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* Camera Presets */}
        <div className="flex items-center bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-lg p-1 shadow-lg">
          <button
            onClick={() => setCameraPreset('iso')}
            title="3D Isometrisch"
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              viewSettings.cameraPreset === 'iso'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3D
          </button>
          <button
            onClick={() => setCameraPreset('top')}
            title="Draufsicht (Oben)"
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              viewSettings.cameraPreset === 'top'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Oben
          </button>
          <button
            onClick={() => setCameraPreset('side')}
            title="Seitenansicht"
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              viewSettings.cameraPreset === 'side'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Seite
          </button>
          <button
            onClick={() => setCameraPreset('bottom')}
            title="Unterseite"
            className={`px-2.5 py-1 text-xs font-mono rounded ${
              viewSettings.cameraPreset === 'bottom'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Unten
          </button>
        </div>

        {/* Wireframe Toggle */}
        <button
          onClick={() => onUpdateViewSettings({ wireframe: !viewSettings.wireframe })}
          title="Drahtgittermodell (Wireframe)"
          className={`p-2 rounded-lg border backdrop-blur-md shadow-lg transition-colors ${
            viewSettings.wireframe
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Gradient Visualization Toggle */}
        <button
          onClick={() => onUpdateViewSettings({ showGradient: !viewSettings.showGradient })}
          title="Spiralverlauf farblich hervorheben (Blau -> Rot)"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border backdrop-blur-md shadow-lg text-xs font-mono transition-colors ${
            viewSettings.showGradient
              ? 'bg-gradient-to-r from-blue-500/20 to-red-500/20 border-blue-500/50 text-blue-300'
              : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-red-500 inline-block" />
          <span>Farbverlauf</span>
        </button>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900/85 border border-zinc-800/80 backdrop-blur-md shadow-2xl z-10 max-w-[94vw] overflow-x-auto">
        {/* Material finishes */}
        <div className="flex items-center gap-1.5 pr-3 border-r border-zinc-800">
          <Palette className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-mono text-zinc-400 mr-1 hidden sm:inline">Material:</span>
          {[
            { id: 'delrin_black', label: 'POM Schwarz', color: '#18181b' },
            { id: 'gunmetal', label: 'Titan Grau', color: '#64748b' },
            { id: 'anodized_red', label: 'CNC Rot', color: '#dc2626' },
            { id: 'brass_gold', label: 'Messing', color: '#d97706' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => onUpdateViewSettings({ materialPreset: m.id as MaterialPreset })}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-all ${
                viewSettings.materialPreset === m.id
                  ? 'bg-zinc-800 text-zinc-100 ring-1 ring-cyan-500/50 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: m.color }} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Auto Rotate */}
        <button
          onClick={() => onUpdateViewSettings({ autoRotate: !viewSettings.autoRotate })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
            viewSettings.autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Rotate3d className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Drehung</span>
        </button>

        {/* Markers Info */}
        <div className="flex items-center gap-2 pl-2 text-[10px] font-mono text-zinc-400 border-l border-zinc-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Start (r={spiral.startRadius.toFixed(1)}mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Ende (r={spiral.endRadius.toFixed(1)}mm)
          </span>
        </div>
      </div>
    </div>
  );
};
