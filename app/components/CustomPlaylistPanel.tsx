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
    // Positioned 10% from top, 5% from right
    <div className="fixed z-30 top-[10%] right-[5%] w-[80vw] max-w-4xl pointer-events-none">
      <div className="w-full font-mono text-white backdrop-blur-xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] bg-[#0a0a0a]/96 rounded-2xl overflow-hidden pointer-events-auto">

        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 text-xs tracking-widest uppercase">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-zinc-400 font-semibold">CUSTOM PLAYLIST</span>
            {tracks.length > 0 && (
              <span className="text-zinc-600">
                · {String(tracks.length).padStart(2, "0")} TRACKS
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors cursor-pointer text-sm px-2 py-1 rounded-md hover:bg-white/10"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Two-column body: Add Form | Track List */}
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] divide-y md:divide-y-0 md:divide-x divide-white/10 min-h-100">

          {/* Left: Add Track Form */}
          <div className="p-6 flex flex-col gap-4">
            <span className="text-[10px] tracking-widest uppercase text-zinc-500 font-semibold">ADD TRACK //</span>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="YouTube URL"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:bg-zinc-800 transition-all"
              />
              <input
                type="text"
                placeholder="Track name"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:bg-zinc-800 transition-all"
              />
              <input
                type="text"
                placeholder="Artist (optional)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:bg-zinc-800 transition-all"
              />
            </div>

            {error && (
              <span className="text-red-400 text-xs leading-relaxed mt-1">{error}</span>
            )}

            <button
              onClick={handleAdd}
              className="mt-auto px-4 py-3 rounded-lg bg-white text-black text-xs tracking-widest uppercase font-bold hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              add track
            </button>
          </div>

          {/* Right: Playlist */}
          <div className="flex flex-col min-h-0 bg-black/20">
            <div className="px-6 py-4 border-b border-white/10 text-[10px] tracking-widest uppercase text-zinc-500 font-semibold shrink-0">
              PLAYLIST //
            </div>

            <div className="overflow-y-auto flex-1">
              {tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-12 px-6">
                  <span className="text-zinc-700 text-3xl">♪</span>
                  <span className="text-zinc-500 text-sm text-center leading-relaxed">
                    No tracks yet — add one from the left.
                  </span>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {tracks.map((track, idx) => (
                    <li
                      key={`${track.id}-${idx}`}
                      className="flex items-center justify-between px-6 py-3.5 group hover:bg-white/4 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="text-zinc-600 text-xs tabular-nums w-5 shrink-0 font-medium">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-zinc-100 text-sm truncate font-medium">{track.title}</span>
                          {track.artist && (
                            <span className="text-zinc-500 text-xs truncate mt-0.5">
                              {track.artist}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(idx)}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-sm ml-4 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded hover:bg-red-400/10"
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
