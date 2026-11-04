"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Frame360, ProductColor } from "@/lib/types";

interface Product360ViewerProps {
  frames: Frame360[];
  productName: string;
  selectedColor?: ProductColor;
  isFallbackNotice?: boolean;
  locale?: "uz" | "ru" | "en";
}

export default function Product360Viewer({
  frames,
  productName,
  selectedColor,
  isFallbackNotice = false,
  locale = "uz",
}: Product360ViewerProps) {
  const safeFrames: Frame360[] =
    frames && frames.length > 0
      ? frames
      : [
          {
            angle: 0,
            imageUrl:
              "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85",
            label: `${productName} — 0°`,
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const startXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload 360 sequence frames
  useEffect(() => {
    let mounted = true;
    setLoadedCount(0);
    safeFrames.forEach((f) => {
      const img = new Image();
      img.src = f.imageUrl;
      img.onload = () => {
        if (mounted) setLoadedCount((prev) => prev + 1);
      };
      img.onerror = () => {
        if (mounted) setLoadedCount((prev) => prev + 1);
      };
    });
    return () => {
      mounted = false;
    };
  }, [frames]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeFrames.length);
    }, 260);
    return () => clearInterval(timer);
  }, [autoPlay, safeFrames.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoPlay(false);
    startXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 22) {
      const direction = deltaX > 0 ? 1 : -1;
      setCurrentIndex(
        (prev) => (prev + direction + safeFrames.length) % safeFrames.length
      );
      startXRef.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
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

  const currentFrame = safeFrames[currentIndex] || safeFrames[0];
  const progressPct = Math.min(
    100,
    Math.round((loadedCount / Math.max(1, safeFrames.length)) * 100)
  );

  // Simulated studio angle perspective transform for smooth 360 visual feedback across frames
  const angleRad = ((currentFrame.angle || 0) * Math.PI) / 180;
  const rotateYDeg = Math.sin(angleRad) * 14;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative select-none overflow-hidden bg-[#0E0E10] border border-white/10 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen"
          : "h-[520px] sm:h-[620px] w-full"
      } cursor-grab active:cursor-grabbing`}
    >
      {/* Top Studio Telemetry Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] tracking-widest uppercase text-white">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>360° STUDIO SEQUENCE</span>
          <span className="text-stone">| {currentFrame.angle}°</span>
        </div>

        {isFallbackNotice && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 text-[11px] text-ash">
            {locale === "uz"
              ? "3D model o'rniga 360° studiya rejimi faollashdi"
              : locale === "ru"
              ? "Активирован 360° режим (резерв 3D)"
              : "360° Sequence Fallback Active"}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {progressPct < 100 && (
        <div className="absolute inset-x-0 top-14 z-20 flex justify-center pointer-events-none">
          <div className="bg-black/80 border border-white/15 px-4 py-1.5 text-xs text-ash flex items-center gap-3">
            <span>360° kadrlar yuklanmoqda... {progressPct}%</span>
          </div>
        </div>
      )}

      {/* Main 360° Frame Viewport */}
      <div className="relative h-full w-full flex items-center justify-center overflow-hidden p-8">
        <div
          className="relative h-full w-full max-w-md flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(1100px) rotateY(${rotateYDeg}deg) scale(${zoom})`,
          }}
        >
          <img
            src={currentFrame.imageUrl}
            alt={currentFrame.label}
            draggable={false}
            className="max-h-full max-w-full object-contain shadow-2xl border border-white/10"
          />
          {selectedColor && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-color opacity-35 transition-colors duration-300"
              style={{ backgroundColor: selectedColor.hex }}
            />
          )}
        </div>

        {/* Studio Floor Degree Ring */}
        <div className="pointer-events-none absolute bottom-20 inset-x-10 flex flex-col items-center">
          <div className="w-64 sm:w-80 h-6 rounded-full border border-white/20 flex items-center justify-center text-[10px] tracking-[0.25em] text-stone uppercase bg-black/50 backdrop-blur-sm">
            ← Chapga / O&apos;ngga suring ({currentIndex + 1}/{safeFrames.length}) →
          </div>
        </div>
      </div>

      {/* Bottom Interactive Controls */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-2"
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + safeFrames.length) % safeFrames.length
              )
            }
            className="p-2 text-ash hover:text-white hover:bg-white/10 transition"
            title="Oldingi burchak"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-3 py-1.5 text-xs uppercase tracking-wider flex items-center gap-1.5 border transition ${
              autoPlay
                ? "bg-white text-black border-white"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
          >
            {autoPlay ? (
              <>
                <Pause className="w-3.5 h-3.5" /> To&apos;xtatish
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> 360° Aylantirish
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % safeFrames.length)
            }
            className="p-2 text-ash hover:text-white hover:bg-white/10 transition"
            title="Keyingi burchak"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Angle Scrubber Slider */}
        <div className="flex items-center gap-2 flex-1 max-w-xs mx-2">
          <input
            type="range"
            min={0}
            max={safeFrames.length - 1}
            value={currentIndex}
            onChange={(e) => {
              setAutoPlay(false);
              setCurrentIndex(Number(e.target.value));
            }}
            className="w-full accent-white cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.15).toFixed(2)))}
            className="p-2 text-ash hover:text-white hover:bg-white/10 transition"
            title="Uzoqlashtirish"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.75, +(z + 0.15).toFixed(2)))}
            className="p-2 text-ash hover:text-white hover:bg-white/10 transition"
            title="Yaqinlashtirish"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-ash hover:text-white hover:bg-white/10 transition"
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
