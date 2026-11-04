"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import {
  Box,
  Download,
  Grid,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Sun,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Frame360,
  GarmentArchetype,
  Locale,
  ProductColor,
} from "@/lib/types";
import Product360Viewer from "./Product360Viewer";

interface Product3DViewerProps {
  archetype: GarmentArchetype;
  modelUrl?: string;
  has3dModel: boolean;
  frames360: Frame360[];
  productName: string;
  selectedColor: ProductColor;
  colors?: ProductColor[];
  onSelectColor?: (color: ProductColor) => void;
  locale?: Locale;
  compact?: boolean;
}

type StudioLightingMode = "EDITORIAL" | "WARM_ATELIER" | "HIGH_CONTRAST";

/**
 * Generates a procedural textile micro-weave bump texture on a canvas
 * so the 3D garment surface looks and reacts to light like real woven wool/cotton/leather.
 */
function useFabricTexture(archetype: GarmentArchetype) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 256, 256);

    const step = archetype === "tote" ? 6 : archetype === "hoodie" ? 4 : 3;
    for (let y = 0; y < 256; y += step) {
      for (let x = 0; x < 256; x += step) {
        const isWarp = ((x + y) / step) % 2 === 0;
        ctx.fillStyle = isWarp ? "#969696" : "#6b6b6b";
        ctx.fillRect(x, y, step - 1, step - 1);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(18, 18);
    return texture;
  }, [archetype]);
}

/**
 * External GLB/glTF model renderer when an external URL or local .glb blob is loaded
 */
function ExternalGlbModel({
  url,
  color,
  wireframe,
  groupRef,
  onLoaded,
  onError,
}: {
  url: string;
  color: ProductColor;
  wireframe: boolean;
  groupRef: React.RefObject<THREE.Group>;
  onLoaded: () => void;
  onError: () => void;
}) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (!active) return;
        const cloned = gltf.scene.clone(true);
        // Auto-center and normalize scale
        const box = new THREE.Box3().setFromObject(cloned);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.4 / maxDim;
        cloned.scale.setScalar(scale);
        cloned.position.set(
          -center.x * scale,
          -center.y * scale,
          -center.z * scale
        );
        setScene(cloned);
        onLoaded();
      },
      undefined,
      () => {
        if (!active) return;
        onError();
      }
    );
    return () => {
      active = false;
    };
  }, [url]);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.color.set(color.hex);
          mat.roughness = color.roughness ?? 0.75;
          mat.metalness = color.metalness ?? 0.08;
          mat.wireframe = wireframe;
          mesh.material = mat;
        }
      }
    });
  }, [scene, color, wireframe]);

  if (!scene) return null;
  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Architectural 3D Garment Mesh Sculptures for NNN BRAND Studio
 */
function ProceduralGarmentMesh({
  archetype,
  color,
  wireframe,
  groupRef,
  onReady,
}: {
  archetype: GarmentArchetype;
  color: ProductColor;
  wireframe: boolean;
  groupRef: React.RefObject<THREE.Group>;
  onReady: () => void;
}) {
  const bumpTexture = useFabricTexture(archetype);

  useEffect(() => {
    onReady();
  }, [onReady]);

  const mainMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color.hex),
      roughness: color.roughness ?? 0.78,
      metalness: color.metalness ?? 0.06,
      bumpMap: bumpTexture || undefined,
      bumpScale: archetype === "tote" ? 0.008 : 0.015,
      wireframe,
      side: THREE.DoubleSide,
    });
  }, [color, bumpTexture, archetype, wireframe]);

  const trimMaterial = useMemo(() => {
    const trimColor = new THREE.Color(color.hex).offsetHSL(0, 0, -0.06);
    return new THREE.MeshStandardMaterial({
      color: trimColor,
      roughness: Math.max(0.25, (color.roughness ?? 0.7) - 0.12),
      metalness: (color.metalness ?? 0.08) + 0.08,
      wireframe,
    });
  }, [color, wireframe]);

  const hardwareMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#222326"),
      roughness: 0.25,
      metalness: 0.75,
      wireframe,
    });
  }, [wireframe]);

  const mannequinNeckMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1D1D20"),
      roughness: 0.4,
      metalness: 0.3,
      wireframe,
    });
  }, [wireframe]);

  // Subtle breathing float animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 1.2) * 0.025;
    }
  });

  if (archetype === "trousers") {
    return (
      <group ref={groupRef} position={[0, 0.05, 0]}>
        {/* Structured High-Rise Waistband */}
        <mesh
          position={[0, 1.08, 0]}
          material={trimMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.46, 0.48, 0.14, 36]} />
        </mesh>
        {/* Belt Loops */}
        {[-0.36, -0.18, 0, 0.18, 0.36].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 1.08, 0.45 * Math.cos(x * 1.5)]}
            material={hardwareMaterial}
          >
            <boxGeometry args={[0.03, 0.15, 0.02]} />
          </mesh>
        ))}
        {/* Pelvis / Upper Hip Block */}
        <mesh
          position={[0, 0.82, 0]}
          material={mainMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.48, 0.54, 0.42, 36]} />
        </mesh>
        {/* Left Wide-Leg Column */}
        <mesh
          position={[-0.24, -0.12, 0]}
          rotation={[0, 0, 0.025]}
          material={mainMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.25, 0.28, 1.65, 32]} />
        </mesh>
        {/* Right Wide-Leg Column */}
        <mesh
          position={[0.24, -0.12, 0]}
          rotation={[0, 0, -0.025]}
          material={mainMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.25, 0.28, 1.65, 32]} />
        </mesh>
        {/* Architectural Front Pleats (Left & Right) */}
        {[-0.28, -0.19, 0.19, 0.28].map((x, i) => (
          <mesh
            key={i}
            position={[x, 0.02, 0.24]}
            material={trimMaterial}
            castShadow
          >
            <boxGeometry args={[0.022, 1.75, 0.035]} />
          </mesh>
        ))}
        {/* Turn-up Cuffs */}
        <mesh position={[-0.26, -0.92, 0]} material={trimMaterial}>
          <cylinderGeometry args={[0.285, 0.285, 0.09, 32]} />
        </mesh>
        <mesh position={[0.26, -0.92, 0]} material={trimMaterial}>
          <cylinderGeometry args={[0.285, 0.285, 0.09, 32]} />
        </mesh>
      </group>
    );
  }

  if (archetype === "tote") {
    return (
      <group ref={groupRef} position={[0, -0.1, 0]}>
        {/* Main Sculpted Leather Body */}
        <mesh
          position={[0, 0, 0]}
          material={mainMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.45, 1.05, 0.48]} />
        </mesh>
        {/* Architectural Side Gusset Panels */}
        <mesh position={[-0.73, 0, 0]} material={trimMaterial} castShadow>
          <boxGeometry args={[0.04, 1.02, 0.44]} />
        </mesh>
        <mesh position={[0.73, 0, 0]} material={trimMaterial} castShadow>
          <boxGeometry args={[0.04, 1.02, 0.44]} />
        </mesh>
        {/* Reinforced Base Panel */}
        <mesh position={[0, -0.52, 0]} material={trimMaterial} castShadow>
          <boxGeometry args={[1.47, 0.06, 0.5]} />
        </mesh>
        {/* Front Vertical Seam Straps */}
        {[-0.36, 0.36].map((x, idx) => (
          <mesh key={idx} position={[x, 0.02, 0.245]} material={trimMaterial}>
            <boxGeometry args={[0.065, 1.02, 0.02]} />
          </mesh>
        ))}
        {/* Brushed Steel Buckles */}
        {[-0.36, 0.36].map((x, idx) => (
          <mesh
            key={idx}
            position={[x, 0.53, 0.22]}
            material={hardwareMaterial}
          >
            <torusGeometry args={[0.045, 0.012, 16, 24]} />
          </mesh>
        ))}
        {/* Top Leather Handles */}
        <mesh
          position={[0, 0.55, 0.16]}
          rotation={[0.12, 0, 0]}
          material={trimMaterial}
          castShadow
        >
          <torusGeometry args={[0.36, 0.028, 16, 48, Math.PI]} />
        </mesh>
        <mesh
          position={[0, 0.55, -0.16]}
          rotation={[-0.12, 0, 0]}
          material={trimMaterial}
          castShadow
        >
          <torusGeometry args={[0.36, 0.028, 16, 48, Math.PI]} />
        </mesh>
        {/* Minimalist Debossed NNN Plaque */}
        <mesh position={[0, 0.18, 0.248]} material={hardwareMaterial}>
          <boxGeometry args={[0.24, 0.07, 0.012]} />
        </mesh>
      </group>
    );
  }

  const isLongCoat = archetype === "overcoat" || archetype === "trench";
  const isHoodie = archetype === "hoodie";
  const isBlazer = archetype === "blazer";
  const isTurtleneck = archetype === "turtleneck";

  const torsoHeight = isLongCoat ? 1.88 : 1.24;
  const torsoY = isLongCoat ? -0.05 : 0.18;

  return (
    <group ref={groupRef}>
      {/* Atelier Mannequin Neck Stand */}
      <mesh position={[0, 1.05, 0]} material={mannequinNeckMaterial}>
        <cylinderGeometry args={[0.14, 0.17, 0.28, 28]} />
      </mesh>

      {/* Structured Shoulder Yoke */}
      <mesh
        position={[0, 0.82, 0]}
        scale={[1.45, 0.34, 0.65]}
        material={mainMaterial}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.52, 36, 24]} />
      </mesh>

      {/* Main Garment Torso Drape */}
      <mesh
        position={[0, torsoY, 0]}
        scale={[1, 1, 0.58]}
        material={mainMaterial}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            0.54,
            isLongCoat ? 0.64 : isHoodie ? 0.52 : 0.5,
            torsoHeight,
            40,
          ]}
        />
      </mesh>

      {/* Left Architectural Sleeve */}
      <group position={[-0.64, 0.76, 0]} rotation={[0.04, 0, 0.22]}>
        <mesh
          position={[0, -0.52, 0]}
          material={mainMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.17, 0.145, 1.15, 28]} />
        </mesh>
        {/* Cuff */}
        <mesh position={[0, -1.08, 0]} material={trimMaterial}>
          <cylinderGeometry args={[0.148, 0.142, 0.1, 28]} />
        </mesh>
      </group>

      {/* Right Architectural Sleeve */}
      <group position={[0.64, 0.76, 0]} rotation={[0.04, 0, -0.22]}>
        <mesh
          position={[0, -0.52, 0]}
          material={mainMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.17, 0.145, 1.15, 28]} />
        </mesh>
        {/* Cuff */}
        <mesh position={[0, -1.08, 0]} material={trimMaterial}>
          <cylinderGeometry args={[0.148, 0.142, 0.1, 28]} />
        </mesh>
      </group>

      {/* Collar / Hood / Lapel Details by Garment Archetype */}
      {isHoodie && (
        <group>
          {/* Self-Standing Double-Layered Hood */}
          <mesh
            position={[0, 1.04, -0.08]}
            rotation={[0.18, 0, 0]}
            material={mainMaterial}
            castShadow
          >
            <sphereGeometry
              args={[0.34, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.72]}
            />
          </mesh>
          <mesh
            position={[0, 0.94, 0.04]}
            rotation={[Math.PI / 2, 0, 0]}
            material={trimMaterial}
          >
            <torusGeometry args={[0.24, 0.045, 16, 36]} />
          </mesh>
          {/* Kangaroo / Architectural Front Pocket */}
          <mesh position={[0, -0.12, 0.3]} material={trimMaterial} castShadow>
            <boxGeometry args={[0.56, 0.28, 0.04]} />
          </mesh>
          {/* Heavyweight Ribbed Waist Hem */}
          <mesh
            position={[0, -0.44, 0]}
            scale={[1, 1, 0.58]}
            material={trimMaterial}
          >
            <cylinderGeometry args={[0.51, 0.49, 0.12, 36]} />
          </mesh>
        </group>
      )}

      {isTurtleneck && (
        <mesh
          position={[0, 0.98, 0]}
          material={trimMaterial}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.21, 0.23, 0.24, 32]} />
        </mesh>
      )}

      {(isLongCoat || isBlazer || archetype === "overshirt") && (
        <group>
          {/* Tailored Collar Stand */}
          <mesh
            position={[0, 0.93, -0.02]}
            rotation={[Math.PI / 2 + 0.15, 0, 0]}
            material={trimMaterial}
          >
            <torusGeometry args={[0.23, 0.042, 16, 32, Math.PI * 1.35]} />
          </mesh>
          {/* Left Peak Lapel */}
          <mesh
            position={[-0.14, 0.55, 0.31]}
            rotation={[0.04, -0.12, -0.22]}
            material={trimMaterial}
            castShadow
          >
            <boxGeometry args={[0.14, 0.62, 0.025]} />
          </mesh>
          {/* Right Peak Lapel */}
          <mesh
            position={[0.14, 0.55, 0.31]}
            rotation={[0.04, 0.12, 0.22]}
            material={trimMaterial}
            castShadow
          >
            <boxGeometry args={[0.14, 0.62, 0.025]} />
          </mesh>
          {/* Center Placket Seam */}
          <mesh
            position={[0, torsoY, 0.33]}
            material={trimMaterial}
            castShadow
          >
            <boxGeometry args={[0.06, torsoHeight * 0.88, 0.018]} />
          </mesh>
          {/* Horn Buttons (Double-breasted for Blazer, vertical for Overcoat/Overshirt) */}
          {isBlazer
            ? [-0.1, 0.1].map((bx) =>
                [0.18, -0.05, -0.28].map((by, idx) => (
                  <mesh
                    key={`${bx}-${idx}`}
                    position={[bx, by, 0.345]}
                    rotation={[Math.PI / 2, 0, 0]}
                    material={hardwareMaterial}
                  >
                    <cylinderGeometry args={[0.024, 0.024, 0.015, 20]} />
                  </mesh>
                ))
              )
            : [0.35, 0.08, -0.19, -0.46].map((by, idx) => (
                <mesh
                  key={idx}
                  position={[0, by, 0.345]}
                  rotation={[Math.PI / 2, 0, 0]}
                  material={hardwareMaterial}
                >
                  <cylinderGeometry args={[0.024, 0.024, 0.015, 20]} />
                </mesh>
              ))}
          {/* Welted Side Pockets */}
          {[-0.3, 0.3].map((px, idx) => (
            <mesh
              key={idx}
              position={[px, -0.08, 0.31]}
              rotation={[0, px > 0 ? -0.25 : 0.25, 0]}
              material={trimMaterial}
            >
              <boxGeometry args={[0.2, 0.045, 0.02]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default function Product3DViewer({
  archetype,
  modelUrl,
  has3dModel,
  frames360,
  productName,
  selectedColor,
  colors = [],
  onSelectColor,
  locale = "uz",
  compact = false,
}: Product3DViewerProps) {
  const [isReady, setIsReady] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [lighting, setLighting] = useState<StudioLightingMode>("EDITORIAL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [customGlbBlobUrl, setCustomGlbBlobUrl] = useState<string | null>(null);
  const [customGlbName, setCustomGlbName] = useState<string | null>(null);
  const [externalLoadError, setExternalLoadError] = useState(false);
  const [azimuthDeg, setAzimuthDeg] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const garmentGroupRef = useRef<THREE.Group>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If product does not have a 3D model, automatically fall back to 360-degree viewer!
  if (!has3dModel) {
    return (
      <Product360Viewer
        frames={frames360}
        productName={productName}
        selectedColor={selectedColor}
        isFallbackNotice={true}
        locale={locale}
      />
    );
  }

  const activeExternalUrl =
    customGlbBlobUrl ||
    (modelUrl &&
    !modelUrl.startsWith("/api/models/") &&
    (modelUrl.endsWith(".glb") || modelUrl.endsWith(".gltf")) &&
    !externalLoadError
      ? modelUrl
      : null);

  const handleZoom = (factor: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object as THREE.PerspectiveCamera;
    if (camera) {
      camera.position.multiplyScalar(factor);
      const dist = camera.position.length();
      if (dist < 1.8) camera.position.setLength(1.8);
      if (dist > 6.5) camera.position.setLength(6.5);
      controlsRef.current.update();
    }
  };

  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(!isFullscreen);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch {
        setIsFullscreen(false);
      }
    }
  };

  const handleUploadLocalGlb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setExternalLoadError(false);
    setCustomGlbBlobUrl(url);
    setCustomGlbName(file.name);
  };

  const handleExportGlb = () => {
    if (!garmentGroupRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      garmentGroupRef.current,
      (result) => {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], { type: "model/gltf-binary" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${selectedColor.id}.glb`;
          link.click();
        }
      },
      (err) => {
        console.error("GLB Export error:", err);
      },
      { binary: true }
    );
  };

  const cycleLighting = () => {
    setLighting((prev) =>
      prev === "EDITORIAL"
        ? "WARM_ATELIER"
        : prev === "WARM_ATELIER"
        ? "HIGH_CONTRAST"
        : "EDITORIAL"
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden border border-white/10 transition-colors duration-500 ${
        lighting === "WARM_ATELIER"
          ? "bg-gradient-to-b from-[#171614] via-[#11100F] to-[#0A0A0A]"
          : lighting === "HIGH_CONTRAST"
          ? "bg-black"
          : "bg-gradient-to-b from-[#141416] via-[#0D0D0F] to-[#080809]"
      } ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen"
          : compact
          ? "h-[440px] sm:h-[500px] w-full"
          : "h-[520px] sm:h-[640px] w-full"
      }`}
    >
      {/* Top Studio Telemetry Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2.5 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] tracking-widest uppercase text-white">
          <Box className="w-3.5 h-3.5 text-white" />
          <span>3D REAL-TIME STUDIO</span>
          <span className="text-stone">| {azimuthDeg}°</span>
          {customGlbName && (
            <span className="text-emerald-400 font-mono">
              ({customGlbName})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            onChange={handleUploadLocalGlb}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-black/75 hover:bg-white/15 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-[10px] tracking-widest uppercase text-ash hover:text-white flex items-center gap-1.5 transition"
            title="Kompyuterdan .GLB / .glTF 3D model yuklab ko'rish"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">.GLB Yuklash</span>
          </button>
          <button
            type="button"
            onClick={handleExportGlb}
            className="bg-black/75 hover:bg-white/15 backdrop-blur-md border border-white/15 px-2.5 py-1.5 text-[10px] tracking-widest uppercase text-ash hover:text-white flex items-center gap-1.5 transition"
            title="Ushbu 3D modelni .GLB formatida yuklab olish"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">.GLB Saqlash</span>
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {!isReady && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0A0A0A]/90 backdrop-blur-sm">
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-xs uppercase tracking-[0.25em] text-ash">
            3D Geometrik Model Yuklanmoqda...
          </p>
        </div>
      )}

      {/* Three.js / React Three Fiber Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.35, 3.35], fov: 40 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <ambientLight
          intensity={
            lighting === "HIGH_CONTRAST"
              ? 0.45
              : lighting === "WARM_ATELIER"
              ? 0.85
              : 0.75
          }
          color={lighting === "WARM_ATELIER" ? "#FFF5E4" : "#FFFFFF"}
        />
        <directionalLight
          position={[3.5, 5, 4]}
          intensity={lighting === "HIGH_CONTRAST" ? 2.4 : 1.75}
          color={lighting === "WARM_ATELIER" ? "#FFEBD2" : "#FFFFFF"}
          castShadow
        />
        <directionalLight
          position={[-4, 2.5, -3]}
          intensity={lighting === "HIGH_CONTRAST" ? 1.2 : 0.85}
          color="#C8D4E3"
        />
        <spotLight
          position={[0, 5.5, 1.5]}
          angle={0.5}
          penumbra={0.8}
          intensity={1.1}
        />

        <Suspense fallback={null}>
          {activeExternalUrl ? (
            <ExternalGlbModel
              url={activeExternalUrl}
              color={selectedColor}
              wireframe={wireframe}
              groupRef={garmentGroupRef}
              onLoaded={() => setIsReady(true)}
              onError={() => {
                setExternalLoadError(true);
                setIsReady(true);
              }}
            />
          ) : (
            <ProceduralGarmentMesh
              archetype={archetype}
              color={selectedColor}
              wireframe={wireframe}
              groupRef={garmentGroupRef}
              onReady={() => setIsReady(true)}
            />
          )}

          {/* Studio Turntable Pedestal Ring */}
          <group position={[0, -1.16, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <ringGeometry args={[0.78, 0.81, 64]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.22}
                side={THREE.DoubleSide}
              />
            </mesh>
            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.65}
              scale={4.5}
              blur={2.2}
              far={2.5}
            />
          </group>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={1.3}
          minDistance={1.85}
          maxDistance={5.8}
          minPolarAngle={0.28}
          maxPolarAngle={Math.PI - 0.35}
          onChange={(e) => {
            if (e?.target) {
              const az = e.target.getAzimuthalAngle();
              const deg = Math.round(((az * 180) / Math.PI + 360) % 360);
              setAzimuthDeg(deg);
            }
          }}
        />
      </Canvas>

      {/* Live Color Swatch Floating Selector inside 3D Viewport */}
      {colors.length > 0 && onSelectColor && (
        <div className="absolute left-4 bottom-20 z-20 flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-2">
          <span className="text-[10px] uppercase tracking-widest text-stone mr-1">
            Rang:
          </span>
          {colors.map((c) => {
            const active = c.id === selectedColor.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor(c)}
                className={`w-5 h-5 rounded-full transition transform ${
                  active
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110"
                    : "opacity-75 hover:opacity-100"
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.nameUz}
              />
            );
          })}
        </div>
      )}

      {/* Interactive Instruction Hint */}
      <div className="pointer-events-none absolute right-4 bottom-20 z-10 hidden md:flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-stone">
        <span>360° Aylantirish: Sichqoncha / Sensor</span>
      </div>

      {/* Bottom 3D Studio Control Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1.5 text-[11px] uppercase tracking-wider border transition flex items-center gap-1.5 ${
              autoRotate
                ? "bg-white text-black border-white font-medium"
                : "border-white/20 text-ash hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>360° Spin</span>
          </button>

          <button
            type="button"
            onClick={cycleLighting}
            className="px-2.5 py-1.5 text-[11px] uppercase tracking-wider border border-white/20 text-ash hover:text-white transition flex items-center gap-1.5"
            title="Studiya yoritish rejimini almashtirish"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lighting}</span>
          </button>

          <button
            type="button"
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 text-[11px] uppercase tracking-wider border transition flex items-center gap-1.5 ${
              wireframe
                ? "bg-white text-black border-white"
                : "border-white/20 text-ash hover:text-white"
            }`}
            title="3D Geometrik Setka (Wireframe)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mesh</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleZoom(1.18)}
            className="p-1.5 text-ash hover:text-white hover:bg-white/10 transition"
            title="Uzoqlashtirish (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.84)}
            className="p-1.5 text-ash hover:text-white hover:bg-white/10 transition"
            title="Yaqinlashtirish (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetCamera}
            className="p-1.5 text-ash hover:text-white hover:bg-white/10 transition"
            title="Kamerani dastlabki holatga qaytarish"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 text-ash hover:text-white hover:bg-white/10 transition"
            title="To'liq ekran"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
