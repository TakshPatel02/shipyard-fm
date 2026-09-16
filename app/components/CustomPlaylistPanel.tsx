"use client";

import { useState } from "react";
import { Track } from "../lib/music-data";
import { extractYouTubeId } from "../lib/custom-playlist";

interface Props {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
  onClose: () => void;
}

// Inline YouTube wordmark icon for URL field affordance
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function CustomPlaylistPanel({ tracks, onTracksChange, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setError(null);
    const id = extractYouTubeId(url.trim());
    if (!id) {
      setError("Invalid URL — paste a youtube.com or youtu.be link.");
      return;
    }
    if (!title.trim()) {
      setError("Track name is required.");
      return;
    }
    const updated = [...tracks, { id, title: title.trim(), artist: artist.trim() }];
    onTracksChange(updated);
    setUrl("");
    setTitle("");
    setArtist("");
  };

  const handleRemove = (idx: number) => {
    const updated = tracks.filter((_, i) => i !== idx);
    onTracksChange(updated);
  };

  return (
    /* Positioned 10% from top, 5% from right — panel-enter for scale/fade in */
    <div className="fixed z-30 top-[10%] right-[5%] w-[80vw] max-w-4xl pointer-events-none">
      <div className="panel-enter w-full font-mono text-white backdrop-blur-2xl border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.95)] bg-[#0a0a0a]/97 rounded-2xl overflow-hidden pointer-events-auto">

        {/* ── Panel Header ────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/8">
          <div className="flex items-center gap-3">
            {/* Amber status dot */}
            <span className="w-2 h-2 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            <span className="text-[11px] tracking-[0.18em] uppercase text-zinc-300 font-semibold">
              Custom Playlist
            </span>
            <span className="text-zinc-700 text-[10px] tracking-widest">// FIG. 01</span>
            {tracks.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400/80 text-[10px] tracking-wider">
                {String(tracks.length).padStart(2, "0")} TRACKS
              </span>
            )}
          </div>

          {/* Close button — prominent with amber hover */}
          <button
            onClick={onClose}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-150 cursor-pointer"
            title="Close panel"
          >
            <span className="text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-60 transition-opacity">close</span>
            <span className="text-xs leading-none">✕</span>
          </button>
        </div>

        {/* ── Two-column body ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] divide-y md:divide-y-0 md:divide-x divide-white/8 min-h-100">

          {/* Left: Add Track Form */}
          <div className="p-6 flex flex-col gap-5">

            {/* Section header */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] tracking-[0.18em] uppercase text-amber-400/70 font-semibold">
                Add Track //
              </span>
              <div className="h-px bg-linear-to-r from-amber-500/20 via-white/5 to-transparent" />
            </div>

            <div className="flex flex-col gap-3">
              {/* URL field with YouTube icon */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <YouTubeIcon className="w-3.5 h-3.5 text-red-500/50" />
                </div>
                <input
                  type="text"
                  placeholder="Paste YouTube URL"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full bg-zinc-900/80 border border-white/8 rounded-lg pl-8 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:bg-zinc-900 focus:shadow-[0_0_0_1px_rgba(251,146,60,0.15)] transition-all duration-150"
                />
              </div>

              <input
                type="text"
                placeholder="Track name *"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900/80 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:bg-zinc-900 focus:shadow-[0_0_0_1px_rgba(251,146,60,0.15)] transition-all duration-150"
              />
              <input
                type="text"
                placeholder="Artist (optional)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900/80 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:bg-zinc-900 focus:shadow-[0_0_0_1px_rgba(251,146,60,0.15)] transition-all duration-150"
              />
            </div>

            {/* Inline error */}
            {error && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/8 border border-red-500/20">
                <span className="text-red-400/80 text-xs mt-px">!</span>
                <span className="text-red-400/80 text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {/* Add button — amber primary */}
            <button
              onClick={handleAdd}
              className="mt-auto px-4 py-2.5 rounded-lg bg-amber-500 text-black text-[11px] tracking-[0.18em] uppercase font-bold
                         hover:bg-amber-400 active:scale-[0.97] transition-all duration-150 cursor-pointer
                         shadow-[0_0_20px_rgba(251,146,60,0.25)] hover:shadow-[0_0_28px_rgba(251,146,60,0.45)]"
            >
              + Add Track
            </button>
          </div>

          {/* Right: Playlist */}
          <div className="flex flex-col min-h-0 bg-black/25">

            {/* Section header */}
            <div className="px-6 pt-5 pb-3 shrink-0">
              <span className="text-[11px] tracking-[0.18em] uppercase text-amber-400/70 font-semibold">
                Playlist //
              </span>
              <div className="mt-1.5 h-px bg-linear-to-r from-amber-500/20 via-white/5 to-transparent" />
            </div>

            <div className="overflow-y-auto flex-1 px-0">
              {tracks.length === 0 ? (
                /* Empty state with pulsing note */
                <div className="flex flex-col items-center justify-center h-full gap-4 py-16 px-6">
                  <span className="note-pulse text-4xl select-none" aria-hidden="true">♪</span>
                  <div className="text-center">
                    <p className="text-zinc-500 text-sm leading-relaxed">No tracks yet.</p>
                    <p className="text-zinc-700 text-xs mt-1">Paste a YouTube link on the left to get started.</p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-white/4">
                  {tracks.map((track, idx) => (
                    <li
                      key={`${track.id}-${idx}`}
                      className="flex items-center justify-between px-6 py-3.5 group hover:bg-amber-500/4 transition-colors duration-100"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Index number */}
                        <span className="text-zinc-700 text-[10px] tabular-nums w-5 shrink-0 font-medium group-hover:text-amber-500/50 transition-colors">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        {/* Amber accent bar on hover */}
                        <span className="w-px h-7 bg-white/5 group-hover:bg-amber-500/30 transition-colors shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-zinc-100 text-sm truncate font-medium">{track.title}</span>
                          {track.artist && (
                            <span className="text-zinc-600 text-xs truncate mt-0.5 group-hover:text-zinc-500 transition-colors">
                              {track.artist}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="opacity-0 group-hover:opacity-100 ml-4 p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer shrink-0"
                        title="Remove track"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

        {/* ── Footer bar ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-2.5 border-t border-white/8 bg-black/20">
          <span className="text-zinc-700 text-[9px] tracking-widest uppercase">Shipyard // Custom Playlist</span>
          <span className="text-zinc-700 text-[9px] tracking-widest uppercase">Tracks stored locally</span>
        </div>

      </div>
    </div>
  );
}
