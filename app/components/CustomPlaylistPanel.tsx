"use client";

import { useState } from "react";
import { Track } from "../lib/music-data";
import { extractYouTubeId } from "../lib/custom-playlist";

interface Props {
  tracks: Track[];
  onTracksChange: (tracks: Track[]) => void;
  onClose: () => void;
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
    // Centered on screen with a subtle backdrop
    <div className="fixed inset-0 z-30 flex items-center justify-center px-4 pb-32 pointer-events-none">
      <div className="w-full max-w-2xl font-mono text-white backdrop-blur-xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] bg-[#0a0a0a]/96 rounded-2xl overflow-hidden pointer-events-auto">

        {/* Panel Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="text-zinc-400">CUSTOM PLAYLIST</span>
            {tracks.length > 0 && (
              <span className="text-zinc-600">
                · {String(tracks.length).padStart(2, "0")} TRACKS
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-white transition-colors cursor-pointer text-xs px-1"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Two-column body: Add Form | Track List */}
        <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-white/10">

          {/* Left: Add Track Form */}
          <div className="p-4 flex flex-col gap-3">
            <span className="text-[9px] tracking-widest uppercase text-zinc-600">ADD TRACK //</span>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="YouTube URL"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 transition-colors"
              />
              <input
                type="text"
                placeholder="Track name"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 transition-colors"
              />
              <input
                type="text"
                placeholder="Artist (optional)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900 border border-white/10 rounded px-2.5 py-1.5 text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>

            {error && (
              <span className="text-red-400 text-[10px] leading-relaxed">{error}</span>
            )}

            <button
              onClick={handleAdd}
              className="px-3 py-1.5 rounded bg-white text-black text-[10px] tracking-wider uppercase font-semibold hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer"
            >
              add track
            </button>
          </div>

          {/* Right: Playlist */}
          <div className="flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-white/10 text-[9px] tracking-widest uppercase text-zinc-600 shrink-0">
              PLAYLIST //
            </div>

            <div className="overflow-y-auto max-h-64">
              {tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 px-4">
                  <span className="text-zinc-700 text-xl">♪</span>
                  <span className="text-zinc-600 text-[11px] text-center leading-relaxed">
                    No tracks yet — add one from the left.
                  </span>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {tracks.map((track, idx) => (
                    <li
                      key={`${track.id}-${idx}`}
                      className="flex items-center justify-between px-4 py-2 group hover:bg-white/2 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-zinc-700 text-[9px] tabular-nums w-4 shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-zinc-200 text-[11px] truncate">{track.title}</span>
                        {track.artist && (
                          <span className="text-zinc-600 text-[10px] truncate hidden sm:inline shrink-0">
                            · {track.artist}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="text-zinc-700 hover:text-red-400 transition-colors text-[10px] ml-3 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                        title="Remove track"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
