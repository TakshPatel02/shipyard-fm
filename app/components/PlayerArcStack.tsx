"use client";

/**
 * PlayerArcStack — Right-side vertical card stack.
 *
 * Arc: all cards' RIGHT edges sit near the right border.
 * Active card extends furthest left; outer cards retract toward right.
 * Slight rotation per slot (wheel-like).
 * Tight vertical overlap, narrow horizontal spread.
 *
 * NOTE: No keyboard listener here — the player hook handles ArrowLeft/Right.
 * Adding one here would cause double-skip (both fire simultaneously).
 */

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { Track } from "../lib/music-data";

// ─── Card dimensions ──────────────────────────────────────────────────────────
const CARD_W = 330;
const CARD_H = 200;
const HALF_W = CARD_W / 2; // 165

// ─── Slot table ───────────────────────────────────────────────────────────────
// x: how far card center sits LEFT of the right-edge anchor (negative = left).
// Right edge of card = anchor + x + HALF_W ≈ 0 (flush with right border).
//
// HORIZONTAL SPREAD is intentionally narrow so cards don't jump far apart.
// The active card extends ~145px beyond flush; adjacent cards only 95px less.
//
// y: vertical stack with tight 95px step (cards overlap).
// rotate: gentle tilt like a wheel. Max ±10° at outer slots.

type Offset = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4;

// Arc geometry — quadratic curve so inner cards stay close, outer cards sweep back smoothly.
// Shifted toward the right side as requested.
const FLUSH     = -(HALF_W);       // right-edge flush = -165
const ACTIVE_X  = FLUSH - 155;     // active card center: -320 (shifted ~65px right compared to -385)
const ARC_CURVE = 22;              // smooth quadratic curve coefficient

function slotX(offset: number) {
  return ACTIVE_X + offset * offset * ARC_CURVE;
}

const SLOT: Record<
  Offset,
  { x: number; y: number; scale: number; rotate: number; opacity: number; zIndex: number }
> = {
  //  offset        x        y     scale   rotate   opacity  z
  [-4]: { x: slotX(4), y: -445, scale: 0.65, rotate: +34, opacity: 0.00, zIndex: 0  },
  [-3]: { x: slotX(3), y: -348, scale: 0.74, rotate: +24, opacity: 0.35, zIndex: 2  },
  [-2]: { x: slotX(2), y: -242, scale: 0.82, rotate: +15, opacity: 0.58, zIndex: 5  },
  [-1]: { x: slotX(1), y: -125, scale: 0.90, rotate:  +7, opacity: 0.82, zIndex: 8  },
  [ 0]: { x: slotX(0), y:    0, scale: 1.00, rotate:   0, opacity: 1.00, zIndex: 11 },
  [ 1]: { x: slotX(1), y: +125, scale: 0.90, rotate:  -7, opacity: 0.82, zIndex: 8  },
  [ 2]: { x: slotX(2), y: +242, scale: 0.82, rotate: -15, opacity: 0.58, zIndex: 5  },
  [ 3]: { x: slotX(3), y: +348, scale: 0.74, rotate: -24, opacity: 0.35, zIndex: 2  },
  [ 4]: { x: slotX(4), y: +445, scale: 0.65, rotate: -34, opacity: 0.00, zIndex: 0  },
};

const OFFSETS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as Offset[];

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
  const activeRef = useRef(activeIndex);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  // ─── Wheel: snappy single-step with momentum absorption ───────────────────
  // No keyboard handler here — the player hook already handles ArrowLeft/Right.
  // Adding one here would cause double-skip bugs.
  useEffect(() => {
    if (count < 2) return;

    let locked = false;
    let accumulated = 0;
    let lockTimer: ReturnType<typeof setTimeout> | null = null;
    let momentumTimer: ReturnType<typeof setTimeout> | null = null;
    const THRESHOLD   = 28;
    const LOCK_MS     = 420;
    const MOMENTUM_MS = 160;

    function step(dir: 1 | -1) {
      locked = true;
      accumulated = 0;
      const next = ((activeRef.current + dir) % count + count) % count;
      onIndexChange(next);
      if (lockTimer) clearTimeout(lockTimer);
      lockTimer = setTimeout(() => { locked = false; }, LOCK_MS);
    }

    function absorbMomentum() {
      if (momentumTimer) clearTimeout(momentumTimer);
      momentumTimer = setTimeout(() => {
        locked = false;
        accumulated = 0;
      }, MOMENTUM_MS);
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (locked) { absorbMomentum(); return; }
      accumulated += e.deltaY;
      if (Math.abs(accumulated) >= THRESHOLD) {
        step(accumulated > 0 ? 1 : -1);
        absorbMomentum();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (lockTimer)     clearTimeout(lockTimer);
      if (momentumTimer) clearTimeout(momentumTimer);
    };
  }, [count, onIndexChange]);

  // Spring: snappy but fluid
  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 30, mass: 0.75 };

  return (
    <div
      className="absolute inset-0 flex items-center justify-end overflow-visible"
      aria-label="Track carousel"
      role="region"
    >
      {/* Zero-size anchor at RIGHT edge, vertically centered */}
      <div className="relative pointer-events-none" style={{ width: 0, height: 0 }}>
        {OFFSETS.map((offset) => {
          const idx = ((activeIndex + offset) % count + count) % count;

          // Skip duplicate slots for small playlists
          if (count < OFFSETS.length) {
            const first = OFFSETS.find(
              (o) => ((activeIndex + o) % count + count) % count === idx
            );
            if (first !== offset) return null;
          }

          const track     = tracks[idx];
          const cfg       = SLOT[offset];
          const isActive  = offset === 0;
          const isVisible = cfg.opacity > 0;
          const isClickable = !isActive && isVisible;

          return (
            <motion.div
              key={idx}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isActive ? track.title : `Go to ${track.title}`}
              className="absolute overflow-hidden pointer-events-auto select-none"
              style={{
                width: CARD_W,
                height: CARD_H,
                borderRadius: 14,
                left: -HALF_W,
                top:  -(CARD_H / 2),
                cursor: isClickable ? "pointer" : "default",
              }}
              animate={{
                x:       cfg.x,
                y:       cfg.y,
                scale:   cfg.scale,
                rotate:  cfg.rotate,
                opacity: cfg.opacity,
                zIndex:  cfg.zIndex,
              }}
              transition={spring}
              whileHover={
                isClickable
                  ? { scale: cfg.scale * 1.04, opacity: Math.min(cfg.opacity + 0.18, 0.95) }
                  : undefined
              }
              onClick={() => { if (isClickable) onIndexChange(idx); }}
            >
              {/* Thumbnail */}
              <Image
                src={`https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                alt={track.title}
                fill
                className="object-cover pointer-events-none"
                sizes={`${CARD_W}px`}
                unoptimized
                priority={isActive}
              />

              {/* Dark veil for inactive cards */}
              <motion.div
                className="absolute inset-0 bg-black pointer-events-none"
                style={{ borderRadius: 14 }}
                animate={{ opacity: isActive ? 0 : 0.42 }}
                transition={{ duration: 0.3 }}
              />

              {/* Active: glowing rim */}
              {isActive && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: 14,
                    boxShadow: [
                      "inset 0 0 0 1.5px rgba(255,255,255,0.28)",
                      "0 20px 55px rgba(0,0,0,0.75)",
                      "0 0 36px rgba(139,108,255,0.22)",
                    ].join(", "),
                  }}
                />
              )}

              {/* Inactive: faint border */}
              {!isActive && isVisible && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: 14,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
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
