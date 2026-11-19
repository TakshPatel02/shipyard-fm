"use client";

import type { ChangeEvent } from "react";
import type { Track } from "../lib/music-data";
import { formatTime } from "../hooks/player";
import {
  FaPlay,
  FaPause,
  FaForwardStep,
  FaBackwardStep,
  FaShuffle,
  FaRepeat,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";

interface PlayerControllerProps {
  track: Track;
  trackIndex: number;
  totalTracks: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  isRepeat: boolean;
  repeatCount?: number;
  onToggleRepeat: () => void;
  currentTime: number;
  duration: number;
  progressPercent: number;
  onSeekChange: (e: ChangeEvent<HTMLInputElement>) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onToggleMute: () => void;
  status?: string;
}

export default function PlayerController({
  track,
  trackIndex,
  totalTracks,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onShuffle,
  isRepeat,
  repeatCount,
  onToggleRepeat,
  currentTime,
  duration,
  progressPercent,
  onSeekChange,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  status,
}: PlayerControllerProps) {
  const formattedIndex = String(trackIndex + 1).padStart(2, "0");
  const formattedTotal = String(Math.max(totalTracks, 1)).padStart(2, "0");
  const clampedProgress = Math.min(Math.max(progressPercent, 0), 100);

  return (
    <div className="w-85 sm:w-100 select-none text-[#F4F1EA]">
      {/* ── Track Heading & 01/24 Track Number (Baseline aligned) ── */}
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            className="font-instrument-sans font-bold text-2xl sm:text-[28px] text-[#F4F1EA] tracking-[-0.02em] truncate"
            title={track.title}
          >
            {track.title}
          </h2>
          <span className="shrink-0 font-mono text-xs text-[#A9A4B8]/70 tabular-nums">
            {formattedIndex} / {formattedTotal}
          </span>
        </div>
        <p className="mt-1 font-instrument-sans text-sm text-[#A9A4B8] truncate">
          {track.artist || "Shipyard Selection"}
        </p>
      </div>

      {/* ── Progress Scrubber ── */}
      <div className="mt-5 w-full">
        <div className="relative w-full h-3 flex items-center group cursor-pointer">
          <div className="w-full h-1 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-glow"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F4F1EA] shadow-md pointer-events-none group-hover:scale-125 transition-transform"
            style={{ left: `${clampedProgress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={clampedProgress}
            onChange={onSeekChange}
            className="seek-slider"
            aria-label="Seek track"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#A9A4B8]/70 mt-1 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* ── Main Controls Row ── */}
      <div className="mt-4 flex items-center justify-between px-2">
        <button
          type="button"
          onClick={onShuffle}
          className="text-[#A9A4B8]/60 hover:text-white transition-colors cursor-pointer p-1.5"
          title="Shuffle"
        >
          <FaShuffle className="text-sm sm:text-base" />
        </button>

        <button
          type="button"
          onClick={onPrev}
          className="text-[#F4F1EA]/80 hover:text-white transition-colors cursor-pointer p-1.5"
          title="Previous"
        >
          <FaBackwardStep className="text-base sm:text-lg" />
        </button>

        {/* Center Play/Pause Circle */}
        <button
          type="button"
          onClick={onPlayPause}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#F4F1EA] text-[#07060B] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <FaPause className="text-base sm:text-lg" />
          ) : (
            <FaPlay className="text-base sm:text-lg ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="text-[#F4F1EA]/80 hover:text-white transition-colors cursor-pointer p-1.5"
          title="Next"
        >
          <FaForwardStep className="text-base sm:text-lg" />
        </button>

        <button
          type="button"
          onClick={onToggleRepeat}
          className={`transition-colors cursor-pointer p-1.5 ${
            isRepeat ? "text-glow" : "text-[#A9A4B8]/60 hover:text-white"
          }`}
          title={isRepeat ? "Repeat ON" : "Enable Repeat"}
        >
          <FaRepeat className="text-sm sm:text-base" />
        </button>
      </div>

      {/* ── Bottom Row: Full-Width Voice / Volume Control ── */}
      <div className="mt-6 flex items-center gap-3 w-full">
        <button
          type="button"
          onClick={onToggleMute}
          className="text-[#A9A4B8]/80 hover:text-white transition-colors cursor-pointer p-1 shrink-0"
          title={isMuted || volume === 0 ? "Unmute" : "Mute"}
          aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <FaVolumeXmark className="text-base sm:text-lg text-rose-400" />
          ) : (
            <FaVolumeHigh className="text-base sm:text-lg" />
          )}
        </button>

        {/* Full-width volume track with interactive thumb */}
        <div className="relative flex-1 h-3 flex items-center group cursor-pointer">
          <div className="w-full h-1 sm:h-1.5 rounded-full bg-white/15 overflow-hidden group-hover:bg-white/20 transition-colors">
            <div
              className="h-full bg-white/90 rounded-full transition-all duration-75"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F4F1EA] shadow-md pointer-events-none group-hover:scale-125 transition-transform"
            style={{ left: `${isMuted ? 0 : volume}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={onVolumeChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="Volume control"
          />
        </div>

        <span className="text-xs font-mono text-[#A9A4B8]/80 tabular-nums w-8 text-right shrink-0">
          {isMuted ? "0%" : `${volume}%`}
        </span>
      </div>
    </div>
  );
}
