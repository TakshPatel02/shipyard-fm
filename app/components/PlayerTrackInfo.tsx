"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Track } from "../lib/music-data";

interface PlayerTrackInfoProps {
  track: Track;
  trackIndex: number;
  totalTracks: number;
  status?: string;
}

export default function PlayerTrackInfo({
  track,
  trackIndex,
  totalTracks,
  status,
}: PlayerTrackInfoProps) {
  const prefersReducedMotion = useReducedMotion();

  const formattedIndex = String(trackIndex + 1).padStart(2, "0");
  const formattedTotal = String(Math.max(totalTracks, 1)).padStart(2, "0");

  return (
    <motion.div
      key={trackIndex}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col justify-center select-none max-w-full min-w-0"
    >
      {/* Track index / total */}
      <div className="font-mono text-xs uppercase tracking-[0.22em] text-[#A9A4B8]/60 mb-2.5">
        {formattedIndex} / {formattedTotal}
      </div>

      {/* Main track title: strictly one line */}
      <h1
        className="font-instrument-sans font-semibold text-[#F4F1EA] tracking-[-0.03em] truncate max-w-full"
        style={{ fontSize: "clamp(1.85rem, 3.2vw, 3.25rem)", lineHeight: 1.18 }}
        title={track.title}
      >
        {track.title}
      </h1>

      {/* Artist info */}
      <p
        className="mt-2 font-instrument-sans text-[#A9A4B8] text-sm md:text-base tracking-normal truncate max-w-full"
      >
        {track.artist || "Shipyard Selection"}
      </p>

      {/* Status or navigation hint */}
      <div className="mt-6 flex items-center gap-2">
        {status ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-glow bg-glow/10 border border-glow/20 px-2.5 py-1 rounded-md">
            {status}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A9A4B8]/40">
            Scroll or click card to browse
          </span>
        )}
      </div>
    </motion.div>
  );
}
