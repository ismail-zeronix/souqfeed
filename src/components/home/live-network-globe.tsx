"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export function hexToGlobeColor(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

interface UaeMarker {
  location: [number, number];
  baseSize: number;
}

// Real UAE emirates/cities — not a stand-in for real geo-analytics (none
// exists yet). Dubai carries four closely-spaced points (the trading
// districts already used as mock location names elsewhere — Bur Dubai,
// Deira, Al Fahidi, Al Rigga), the rest are the other six emirates, so the
// cluster of activity is genuinely UAE-wide, not fabricated global reach.
const UAE_MARKERS: UaeMarker[] = [
  { location: [25.2528, 55.2928], baseSize: 0.1 }, // Bur Dubai
  { location: [25.2697, 55.3094], baseSize: 0.08 }, // Deira
  { location: [25.2631, 55.2972], baseSize: 0.06 }, // Al Fahidi
  { location: [25.2654, 55.3188], baseSize: 0.06 }, // Al Rigga
  { location: [24.4539, 54.3773], baseSize: 0.09 }, // Abu Dhabi
  { location: [25.3463, 55.4209], baseSize: 0.07 }, // Sharjah
  { location: [25.4052, 55.5136], baseSize: 0.05 }, // Ajman
  { location: [24.2075, 55.7447], baseSize: 0.05 }, // Al Ain
  { location: [25.7895, 55.9432], baseSize: 0.05 }, // Ras Al Khaimah
  { location: [25.1288, 56.3265], baseSize: 0.05 }, // Fujairah
];

const GOLD_MARKER = hexToGlobeColor("#E8B968");
const GOLD_GLOW = hexToGlobeColor("#C98A3A");
const DEEP_GREEN = hexToGlobeColor("#062015");
const ROTATION_SPEED = 0.0026;

export function LiveNetworkGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let phi = 2.0; // initial rotation offset so the UAE faces forward on load
    let elapsed = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: 900,
      height: 900,
      phi,
      theta: 0.32,
      scale: 1.7, // zoom in hard — a full-world view would make the UAE a speck
      dark: 1,
      diffuse: 1.4,
      mapSamples: 20000,
      mapBrightness: 3.2,
      baseColor: DEEP_GREEN,
      markerColor: GOLD_MARKER,
      glowColor: GOLD_GLOW,
      markers: UAE_MARKERS.map((marker) => ({
        location: marker.location,
        size: marker.baseSize,
      })),
    });

    if (prefersReducedMotion) {
      return () => globe.destroy();
    }

    let animationFrameId: number;
    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      const delta = lastTimestamp === null ? 16 : timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      elapsed += delta;
      phi += ROTATION_SPEED;

      // Gentle per-marker "breathing" pulse — reads as live activity across
      // the network rather than a static set of pins.
      const pulsedMarkers = UAE_MARKERS.map((marker, index) => ({
        location: marker.location,
        size: marker.baseSize + 0.025 * Math.sin(elapsed / 450 + index * 1.4),
      }));

      globe.update({ phi, markers: pulsedMarkers });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="aspect-square w-full max-w-[320px]"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
