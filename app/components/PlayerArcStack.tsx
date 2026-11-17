"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import type { Track } from "../lib/music-data";

// ─── Card dimensions ─────────────────────────────────────────────────────────
const CARD_W = 340;
const CARD_H = 212; // 16:10 aspect ratio matching reference

// ─── Right-side sweeping arc curve ───────────────────────────────────────────
// Anchored on the right screen edge (x=0 is right edge, negative x goes into screen).
// Equator (offset 0) bows farthest out to the left towards the center.
// Top cards (offset -1, -2) tilt clockwise (+15°, +30°), touching the right border.
// Bottom cards (offset +1, +2) tilt counter-clockwise (-15°, -30°), touching the right border and bottom edge.
type Offset = -3 | -2 | -1 | 0 | 1 | 2 | 3;

const SLOT: Record<
  Offset,
  { x: number; y: number; scale: number; rotate: number; opacity: number; zIndex: number }
> = {
  [-3]: { x:   20, y: -560, scale: 0.58, rotate:  42, opacity: 0,    zIndex: 1 },
  [-2]: { x:  -95, y: -390, scale: 0.74, rotate:  30, opacity: 0.40, zIndex: 4 },
  [-1]: { x: -210, y: -205, scale: 0.88, rotate:  15, opacity: 0.74, zIndex: 7 },
  [ 0]: { x: -280, y:    0, scale: 1.00, rotate:   0, opacity: 1.00, zIndex: 10 },
  [ 1]: { x: -210, y:  205, scale: 0.88, rotate: -15, opacity: 0.74, zIndex: 7 },
  [ 2]: { x:  -95, y:  390, scale: 0.74, rotate: -30, opacity: 0.40, zIndex: 4 },
  [ 3]: { x:   20, y:  560, scale: 0.58, rotate: -42, opacity: 0,    zIndex: 1 },
};

const OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as Offset[];

interface PlayerArcStackProps {
  tracks: Track[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
}

export default function PlayerArcStack({
  tracks,
  activeIndex,
  onIndexChange,
}: PlayerArcStackProps) {
  const count = tracks.length;

  // Stable ref for the latest active index
  const activeRef = useRef(activeIndex);
  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  // ─── Single-step scroll with momentum absorption ───────────────────────────
  useEffect(() => {
    if (count < 2) return;

    let isLocked = false;
    let unlockTimer: ReturnType<typeof setTimeout> | null = null;
    let momentumTimer: ReturnType<typeof setTimeout> | null = null;
    let accumulatedDelta = 0;
    const THRESHOLD = 24;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isLocked) {
        // Absorb trackpad momentum events
        if (momentumTimer) clearTimeout(momentumTimer);
        momentumTimer = setTimeout(() => {
          isLocked = false;
          accumulatedDelta = 0;
        }, 120);
        return;
      }

      accumulatedDelta += e.deltaY;

      if (Math.abs(accumulatedDelta) >= THRESHOLD) {
        isLocked = true;
        const dir = accumulatedDelta > 0 ? 1 : -1;
        accumulatedDelta = 0;

        const next = ((activeRef.current + dir) % count + count) % count;
        onIndexChange(next);

        // Lock for transition duration
        if (unlockTimer) clearTimeout(unlockTimer);
        unlockTimer = setTimeout(() => {
          if (!momentumTimer) {
            isLocked = false;
          }
        }, 420);

        if (momentumTimer) clearTimeout(momentumTimer);
        momentumTimer = setTimeout(() => {
          isLocked = false;
        }, 250);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (unlockTimer) clearTimeout(unlockTimer);
      if (momentumTimer) clearTimeout(momentumTimer);
    };
  }, [count, onIndexChange]);

  // ─── Keyboard arrow navigation ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.code === "ArrowUp" || e.code === "ArrowLeft") {
        e.preventDefault();
        onIndexChange(((activeRef.current - 1) % count + count) % count);
      } else if (e.code === "ArrowDown" || e.code === "ArrowRight") {
        e.preventDefault();
        onIndexChange(((activeRef.current + 1) % count + count) % count);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onIndexChange]);

  // ─── Fluid, organic spring transition for card motion along the curve ──────
  const transitionConfig = {
    type: "spring" as const,
    stiffness: 260,
    damping: 26,
    mass: 0.85,
  };

  return (
    <div
      className="absolute inset-0 flex items-center justify-end overflow-visible"
      aria-label="Track carousel"
      role="region"
    >
      {/* Anchor point at right edge (x=0), y=center */}
      <div className="relative pointer-events-none" style={{ width: 0, height: 0 }}>
        {OFFSETS.map((offset) => {
          const idx = ((activeIndex + offset) % count + count) % count;
          const track = tracks[idx];
          const cfg = SLOT[offset];
          const isActive = offset === 0;
          const isClickable = !isActive && cfg.opacity > 0;

          return (
            <motion.div
              key={idx}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isClickable ? `Switch to ${track.title}` : track.title}
              className="absolute overflow-hidden pointer-events-auto select-none"
              style={{
                width: CARD_W,
                height: CARD_H,
                borderRadius: 18,
                left: -CARD_W / 2,
                top: -CARD_H / 2,
                cursor: isClickable ? "pointer" : "default",
                zIndex: cfg.zIndex,
              }}
              animate={{
                x: cfg.x,
                y: cfg.y,
                scale: cfg.scale,
                rotate: cfg.rotate,
                opacity: cfg.opacity,
              }}
              transition={transitionConfig}
              whileHover={
                isClickable
                  ? { scale: cfg.scale * 1.03, opacity: Math.min(cfg.opacity + 0.15, 0.95) }
                  : undefined
              }
              onClick={() => {
                if (isClickable) onIndexChange(idx);
              }}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onIndexChange(idx);
                }
              }}
            >
              {/* YouTube Album Thumbnail */}
              <Image
                src={`https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                alt={track.title}
                fill
                className="object-cover pointer-events-none"
                sizes={`${CARD_W}px`}
                unoptimized
                priority={isActive}
                loading="eager"
              />

              {/* Dark veil for inactive cards */}
              <motion.div
                className="absolute inset-0 rounded-[18px] bg-black pointer-events-none"
                animate={{ opacity: isActive ? 0 : 0.44 }}
                transition={{ duration: 0.3 }}
              />

              {/* Subtle border highlight for inactive cards */}
              {!isActive && (
                <div className="absolute inset-0 rounded-[18px] border border-white/8 pointer-events-none" />
              )}

              {/* Active card premium rim and glow */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-[18px] pointer-events-none"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1.5px rgba(255,255,255,0.25), 0 32px 75px rgba(0,0,0,0.8), 0 0 45px rgba(139,108,255,0.24)",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
