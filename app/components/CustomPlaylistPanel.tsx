"use client";

import { useState } from "react";
import { Track } from "../lib/music-data";
import {
  extractYouTubeId,
  validateImportData,
  buildExportJson,
} from "../lib/custom-playlist";

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
  // Track addition state
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sub-view toggle for JSON Import & Export
  const [showBackup, setShowBackup] = useState(false);

  // Import / Export state
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exportJson = buildExportJson(tracks);

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

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(exportJson);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback for browsers / iframes restricting clipboard
      try {
        const textArea = document.createElement("textarea");
        textArea.value = exportJson;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      } catch {
        // Silently handle if both fail
      }
    }
  };

  const handleImport = (mode: "replace" | "append") => {
    setImportError(null);
    setImportSuccess(null);

    const trimmed = importText.trim();
    if (!trimmed) {
      setImportError("Please paste your JSON playlist data into the field.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      setImportError("Malformed JSON — check for syntax errors, missing brackets, or quotes.");
      return;
    }

    try {
      const payload = validateImportData(parsed);

      if (payload.tracks.length === 0) {
        setImportError("The imported payload does not contain any tracks.");
        return;
      }

      if (mode === "replace") {
        onTracksChange(payload.tracks);
        setImportSuccess(`Imported ${payload.tracks.length} tracks (replaced existing playlist).`);
      } else {
        // Append mode: avoid exact duplicate video IDs
        const existingIds = new Set(tracks.map((t) => t.id));
        const newTracks = payload.tracks.filter((t) => !existingIds.has(t.id));
        const duplicateCount = payload.tracks.length - newTracks.length;

        const updated = [...tracks, ...newTracks];
        onTracksChange(updated);

        if (newTracks.length === 0) {
          setImportSuccess("All tracks in this import are already in your playlist.");
        } else {
          setImportSuccess(
            `Appended ${newTracks.length} tracks${
              duplicateCount > 0 ? ` (${duplicateCount} duplicates skipped)` : ""
            }.`
          );
        }
      }
      setImportText("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Validation failed.";
      setImportError(message);
    }
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
            {showBackup && (
              <span className="ml-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300/80 text-[10px] tracking-wider">
                JSON TRANSFER
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Single button to switch between main track editor & Import/Export */}
            <button
              onClick={() => {
                setShowBackup((v) => !v);
                setImportError(null);
                setImportSuccess(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                showBackup
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.2)]"
                  : "border-white/8 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/5"
              }`}
              title={showBackup ? "Back to playlist editor" : "Import or export playlist data"}
            >
              <span className="text-xs">⇄</span>
              <span>{showBackup ? "Playlist View" : "Import / Export"}</span>
            </button>

            {/* Close button — prominent with hover feedback */}
            <button
              onClick={onClose}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/8 text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-150 cursor-pointer"
              title="Close panel"
            >
              <span className="text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-60 transition-opacity">close</span>
              <span className="text-xs leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* ── Panel Body: Toggle between Playlist Mode and Import/Export Mode ──────────────── */}
        {showBackup ? (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/8 min-h-100">
            {/* Left: Export (Copy JSON) */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-amber-400/70 font-semibold">
                    Export JSON //
                  </span>
                  <span className="text-zinc-600 text-[10px] tracking-widest uppercase">
                    {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
                  </span>
                </div>
                <div className="h-px bg-linear-to-r from-amber-500/20 via-white/5 to-transparent" />
              </div>

              <p className="text-zinc-500 text-xs leading-relaxed">
                Copy this JSON payload to backup your custom playlist or transfer it to another device.
              </p>

              <div className="relative flex-1 min-h-55">
                <textarea
                  readOnly
                  value={exportJson}
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  className="w-full h-full min-h-55 bg-zinc-950/80 border border-white/8 rounded-lg p-3.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-500/40 select-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2.5 rounded-lg text-[11px] tracking-[0.18em] uppercase font-bold transition-all duration-150 cursor-pointer flex items-center gap-2 ${
                    copied
                      ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                      : "bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.97] shadow-[0_0_20px_rgba(251,146,60,0.25)] hover:shadow-[0_0_28px_rgba(251,146,60,0.45)]"
                  }`}
                >
                  <span className="text-xs">{copied ? "✓" : "⎘"}</span>
                  <span>{copied ? "Copied to Clipboard!" : "Copy JSON Data"}</span>
                </button>
                <span className="text-zinc-600 text-[10px] tracking-wider uppercase">
                  Click text to select all
                </span>
              </div>
            </div>

            {/* Right: Import (Paste JSON) */}
            <div className="p-6 flex flex-col gap-4 bg-black/25">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-amber-400/70 font-semibold">
                    Import JSON //
                  </span>
                  <span className="text-zinc-600 text-[10px] tracking-widest uppercase">
                    v1 Schema
                  </span>
                </div>
                <div className="h-px bg-linear-to-r from-amber-500/20 via-white/5 to-transparent" />
              </div>

              <p className="text-zinc-500 text-xs leading-relaxed">
                Paste JSON data below to load tracks into your custom playlist.
              </p>

              <div className="relative flex-1 min-h-55">
                <textarea
                  placeholder={`{\n  "version": 1,\n  "tracks": [\n    {\n      "id": "9a4izd3Rvdw",\n      "title": "Challa",\n      "artist": "Rabbi Shergill"\n    }\n  ]\n}`}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError(null);
                    setImportSuccess(null);
                  }}
                  className="w-full h-full min-h-55 bg-zinc-950/80 border border-white/8 rounded-lg p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-500/40 focus:bg-zinc-950 focus:shadow-[0_0_0_1px_rgba(251,146,60,0.15)] resize-none leading-relaxed"
                />
              </div>

              {/* Inline Error */}
              {importError && (
                <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25">
                  <span className="text-red-400 text-xs font-bold mt-px">!</span>
                  <span className="text-red-300 text-xs leading-relaxed">{importError}</span>
                </div>
              )}

              {/* Inline Success */}
              {importSuccess && (
                <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
                  <span className="text-emerald-400 text-xs font-bold mt-px">✓</span>
                  <span className="text-emerald-300 text-xs leading-relaxed">{importSuccess}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={() => handleImport("replace")}
                  className="px-4 py-2.5 rounded-lg bg-amber-500 text-black text-[11px] tracking-[0.18em] uppercase font-bold
                             hover:bg-amber-400 active:scale-[0.97] transition-all duration-150 cursor-pointer
                             shadow-[0_0_20px_rgba(251,146,60,0.25)] hover:shadow-[0_0_28px_rgba(251,146,60,0.45)]"
                >
                  Replace Playlist
                </button>
                <button
                  onClick={() => handleImport("append")}
                  className="px-3.5 py-2.5 rounded-lg border border-white/10 text-zinc-300 text-[11px] tracking-[0.18em] uppercase font-semibold
                             hover:bg-white/5 hover:text-white hover:border-white/20 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                  title="Append tracks without deleting existing ones"
                >
                  + Append
                </button>
                {importText.trim() && (
                  <button
                    onClick={() => {
                      setImportText("");
                      setImportError(null);
                      setImportSuccess(null);
                    }}
                    className="ml-auto text-zinc-600 hover:text-zinc-400 text-[10px] tracking-widest uppercase transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Two-column body: Track Editor & Playlist ──────────────── */
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
        )}

        {/* ── Footer bar ──────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-2.5 border-t border-white/8 bg-black/20">
          <span className="text-zinc-700 text-[9px] tracking-widest uppercase">
            Shipyard // {showBackup ? "JSON Data Transfer" : "Custom Playlist"}
          </span>
          <span className="text-zinc-700 text-[9px] tracking-widest uppercase">
            {showBackup ? "Schema v1.0 • Paste / Copy Only" : "Tracks stored locally"}
          </span>
        </div>

      </div>
    </div>
  );
}
