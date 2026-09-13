"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TRACKS, Track } from "../lib/music-data";
import { loadCustomTracks } from "../lib/custom-playlist";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

const STORAGE_KEY = "shipyard-fm-player-state";

interface PlayerState {
  trackIndex: number;
  currentTime: number;
  volume: number;
  isRepeat: boolean;
}

function loadPlayerState(): PlayerState | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (
      parsed &&
      typeof parsed.trackIndex === "number" &&
      !isNaN(parsed.trackIndex) &&
      parsed.trackIndex >= 0 &&
      parsed.trackIndex < TRACKS.length
    ) {
      return {
        trackIndex: parsed.trackIndex,
        currentTime: typeof parsed.currentTime === "number" && !isNaN(parsed.currentTime) ? parsed.currentTime : 0,
        volume: typeof parsed.volume === "number" && !isNaN(parsed.volume) ? parsed.volume : 70,
        isRepeat: Boolean(parsed.isRepeat),
      };
    }
  } catch (e) {
    // Return null on any error
  }
  return null;
}

function savePlayerState(state: PlayerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // Ignore quota/blocked errors
  }
}

type PlaylistMode = "default" | "custom";

interface MusicPlayerProps {
  playlistMode: PlaylistMode;
  onSwitchMode: (mode: PlaylistMode) => void;
  onOpenPanel: () => void;
}

export default function MusicPlayer({ playlistMode, onSwitchMode, onOpenPanel }: MusicPlayerProps) {
  const [customTracks, setCustomTracks] = useState<Track[]>([]);

  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [repeatCount, setRepeatCount] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackIndexRef = useRef<number>(trackIndex);
  const isPlayingRef = useRef<boolean>(false);
  const isUserPausedRef = useRef<boolean>(true);
  const userHasClickedPlayRef = useRef<boolean>(false);
  const isRepeatRef = useRef<boolean>(isRepeat);
  const volumeRef = useRef<number>(volume);
  const currentTimeRef = useRef<number>(0);
  // Ref so player callbacks always see the latest track list without stale closure
  const activeTracksRef = useRef<Track[]>(TRACKS);

  // Restore saved state after client hydration completes to avoid SSR mismatch
  useEffect(() => {
    const saved = loadPlayerState();
    if (saved) {
      setTrackIndex(saved.trackIndex);
      setVolume(saved.volume);
      setIsRepeat(saved.isRepeat);
      trackIndexRef.current = saved.trackIndex;
      volumeRef.current = saved.volume;
      isRepeatRef.current = saved.isRepeat;
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Derive the active track list from mode; keep ref in sync for callbacks
  const activeTracks = playlistMode === "default" ? TRACKS : customTracks;
  activeTracksRef.current = activeTracks;

  const currentTrack = activeTracks[trackIndex] ?? activeTracks[0] ?? TRACKS[0];

  // Helper to start timer tracking time
  const startProgressTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(cur);
          setDuration(dur);
          savePlayerState({
            trackIndex: trackIndexRef.current,
            currentTime: cur,
            volume: volumeRef.current,
            isRepeat: isRepeatRef.current,
          });
        } catch (e) { }
      }
    }, 500);
  };

  const stopProgressTracking = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Background Audio Watchdog:
  // If the user did NOT pause (isUserPausedRef.current === false) and tab is switched / blurred,
  // ensure YouTube player remains playing if Chrome/YouTube attempt a background pause.
  useEffect(() => {
    const watchdog = setInterval(() => {
      if (!isUserPausedRef.current && playerRef.current && typeof playerRef.current.getPlayerState === "function") {
        try {
          const state = playerRef.current.getPlayerState();
          const YTState = window.YT?.PlayerState;
          if (state === YTState?.PAUSED) {
            playerRef.current.playVideo();
          }
        } catch (err) { }
      }
    }, 300);

    const handleVisibilityOrBlur = () => {
      if (!isUserPausedRef.current && playerRef.current) {
        setTimeout(() => {
          try {
            const state = playerRef.current?.getPlayerState?.();
            const YTState = window.YT?.PlayerState;
            if (state !== YTState?.PLAYING && state !== YTState?.BUFFERING) {
              playerRef.current?.playVideo();
            }
          } catch (e) { }
        }, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrBlur);
    window.addEventListener("blur", handleVisibilityOrBlur);

    return () => {
      clearInterval(watchdog);
      document.removeEventListener("visibilitychange", handleVisibilityOrBlur);
      window.removeEventListener("blur", handleVisibilityOrBlur);
    };
  }, []);

  // Save state on pagehide (tab close / unload)
  useEffect(() => {
    const handlePageHide = () => {
      let liveTime = currentTimeRef.current;
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const t = playerRef.current.getCurrentTime();
          if (typeof t === "number" && !isNaN(t)) {
            liveTime = t;
          }
        } catch (e) { }
      }
      savePlayerState({
        trackIndex: trackIndexRef.current,
        currentTime: liveTime,
        volume: volumeRef.current,
        isRepeat: isRepeatRef.current,
      });
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  const handleNextTrack = useCallback(() => {
    userHasClickedPlayRef.current = true;
    const tracks = activeTracksRef.current;
    if (!tracks.length) return;
    // If repeat is on, replay the same track
    if (isRepeatRef.current) {
      setRepeatCount((prev) => prev + 1);
      setCurrentTime(0);
      savePlayerState({
        trackIndex: trackIndexRef.current,
        currentTime: 0,
        volume: volumeRef.current,
        isRepeat: isRepeatRef.current,
      });
      isUserPausedRef.current = false;
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    const nextIdx = (trackIndexRef.current + 1) % tracks.length;
    setTrackIndex(nextIdx);
    savePlayerState({
      trackIndex: nextIdx,
      currentTime: 0,
      volume: volumeRef.current,
      isRepeat: isRepeatRef.current,
    });
    setCurrentTime(0);
    setDuration(0);
    setRepeatCount(0);
    isUserPausedRef.current = false;
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(tracks[nextIdx].id);
      setIsPlaying(true);
    }
  }, []);

  // Initialize YouTube API and Player
  useEffect(() => {
    if (!hasHydrated) return;

    const initPlayer = () => {
      if (playerRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      const tracks = activeTracksRef.current;
      playerRef.current = new window.YT.Player("youtube-player-frame", {
        height: "180",
        width: "320",
        videoId: tracks[trackIndexRef.current]?.id || tracks[0]?.id || TRACKS[0].id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            try {
              const saved = loadPlayerState();
              event.target.setVolume(saved?.volume ?? 70);
              if (saved && typeof saved.currentTime === "number" && saved.currentTime > 0) {
                event.target.seekTo(saved.currentTime, true);
                event.target.pauseVideo();
                setCurrentTime(saved.currentTime);
              }
            } catch (err) { }
          },
          onStateChange: (event: any) => {
            const YTState = window.YT.PlayerState;
            if (event.data === YTState.PLAYING) {
              if (!userHasClickedPlayRef.current) {
                event.target.pauseVideo();
                isUserPausedRef.current = true;
                return;
              }
              setIsPlaying(true);
              isUserPausedRef.current = false;
              startProgressTracking();
            } else if (event.data === YTState.PAUSED) {
              // If background pause triggered by browser while user didn't request pause, force resume
              if (!isUserPausedRef.current && (document.hidden || !document.hasFocus())) {
                setTimeout(() => {
                  try {
                    playerRef.current?.playVideo();
                  } catch (e) { }
                }, 100);
              } else {
                setIsPlaying(false);
                stopProgressTracking();
              }
            } else if (event.data === YTState.ENDED) {
              setIsPlaying(false);
              stopProgressTracking();
              handleNextTrack();
            }
          },
          onError: (event: any) => {
            console.warn("YouTube player error code:", event.data);
            handleNextTrack();
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (existingCallback) existingCallback();
        initPlayer();
      };

      if (!document.getElementById("youtube-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      stopProgressTracking();
    };
  }, [hasHydrated, handleNextTrack]);

  const handlePlayPause = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    if (isPlayingRef.current) {
      isUserPausedRef.current = true;
      playerRef.current.pauseVideo();
    } else {
      userHasClickedPlayRef.current = true;
      isUserPausedRef.current = false;
      playerRef.current.playVideo();
    }
  }, [isReady]);

  const handlePrevTrack = useCallback(() => {
    userHasClickedPlayRef.current = true;
    const tracks = activeTracksRef.current;
    if (!tracks.length) return;
    const prevIdx = (trackIndexRef.current - 1 + tracks.length) % tracks.length;
    setTrackIndex(prevIdx);
    savePlayerState({
      trackIndex: prevIdx,
      currentTime: 0,
      volume: volumeRef.current,
      isRepeat: isRepeatRef.current,
    });
    setCurrentTime(0);
    setDuration(0);
    setRepeatCount(0);
    isUserPausedRef.current = false;
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(tracks[prevIdx].id);
      setIsPlaying(true);
    }
  }, []);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (playerRef.current && duration > 0) {
      const targetTime = (newProgress / 100) * duration;
      playerRef.current.seekTo(targetTime, true);
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    if (playerRef.current && typeof playerRef.current.setVolume === "function") {
      playerRef.current.setVolume(val);
      setIsMuted(val === 0);
    }
  };

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted || volume === 0) {
      playerRef.current.unMute();
      setIsMuted(false);
      setVolume(playerRef.current.getVolume() || 70);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleRepeat = () => {
    setIsRepeat((prev) => {
      if (prev) {
        // Turning repeat off — reset the counter
        setRepeatCount(0);
      }
      return !prev;
    });
  };

  // Set up Media Session API
  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { src: `https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`, sizes: "320x180", type: "image/jpeg" },
          { src: `https://img.youtube.com/vi/${currentTrack.id}/hqdefault.jpg`, sizes: "480x360", type: "image/jpeg" }
        ]
      });

      navigator.mediaSession.setActionHandler("play", () => {
        if (playerRef.current && typeof playerRef.current.playVideo === "function") {
          userHasClickedPlayRef.current = true;
          isUserPausedRef.current = false;
          playerRef.current.playVideo();
        }
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
          isUserPausedRef.current = true;
          playerRef.current.pauseVideo();
        }
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        handlePrevTrack();
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleNextTrack();
      });
    }
  }, [currentTrack, handleNextTrack, handlePrevTrack]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // Switch playlist mode: load custom tracks from storage, reset to track 0
  const handleSwitchMode = useCallback((mode: PlaylistMode) => {
    if (mode === "custom") {
      const stored = loadCustomTracks();
      setCustomTracks(stored);
      // Auto-open manage panel if no tracks yet
      if (stored.length === 0) onOpenPanel();
    }
    onSwitchMode(mode);
    setTrackIndex(0);
    trackIndexRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
    setRepeatCount(0);
    isUserPausedRef.current = true;
    if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
      try { playerRef.current.pauseVideo(); } catch { }
    }
    setIsPlaying(false);
  }, [onSwitchMode, onOpenPanel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNextTrack();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevTrack();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        toggleRepeat();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, handleNextTrack, handlePrevTrack, toggleMute]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center select-none relative w-full mx-auto px-2">
      {/* 
        YouTube Video Frame (Rendered with 320x180 dimensions in DOM).
        When showVideo is false, we keep it in DOM with subtle opacity to prevent Chromium from throttling background tab audio.
      */}
      <div
        className={`fixed z-40 transition-all duration-300 ${showVideo
            ? "bottom-6 right-6 w-70 h-39.5 opacity-100 scale-100"
            : "bottom-2 right-2 w-70 h-39.5 opacity-[0.01] pointer-events-none -z-10"
          }`}
      >
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-800 shadow-2xl bg-black group">
          <div id="youtube-player-frame" className="w-full h-full object-cover" />
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-2 right-2 bg-black/80 hover:bg-black text-zinc-400 hover:text-white px-2 py-0.5 rounded border border-zinc-800 transition-colors opacity-0 group-hover:opacity-100 font-mono text-[10px]"
            title="Hide video"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Single Persistent Morphing Player Card */}
      <div
        className={`relative z-10 mx-auto select-none font-mono text-white backdrop-blur-xl border border-white/10 shadow-[0_16px_50px_rgba(0,0,0,0.85)] bg-[#0a0a0a]/95 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isMinimized
            ? "w-auto max-w-105 rounded-[20px]"
            : "w-full max-w-155 rounded-2xl"
          }`}
      >
        {/* Minimized Content Layer */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center gap-3 px-3.5 ${isMinimized
              ? "max-h-12 py-1.5 opacity-100 scale-100 pointer-events-auto"
              : "max-h-0 py-0 opacity-0 scale-95 pointer-events-none overflow-hidden"
            }`}
        >
          {/* Micro Vinyl Disc */}
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20 bg-black shrink-0 flex items-center justify-center">
            <img
              src={`https://img.youtube.com/vi/${currentTrack.id}/hqdefault.jpg`}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? "animate-spin [animation-duration:9s]" : ""}`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-zinc-900 border border-white/40" />
          </div>

          {/* Track Info */}
          <div className="flex items-center gap-2 min-w-0 max-w-45 sm:max-w-65">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                }`}
            />
            <span className="text-xs text-white font-medium truncate">{currentTrack.title}</span>
            <span className="text-[10px] text-zinc-500 truncate hidden sm:inline">· {currentTrack.artist}</span>
          </div>

          {/* Repeat Tag */}
          {isRepeat && (
            <div className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-emerald-400 text-[10px] font-mono font-semibold shrink-0">
              {repeatCount > 0 ? `${repeatCount}×` : "1×"}
            </div>
          )}

          {/* Mini Play / Pause Button */}
          <button
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[9px] hover:bg-zinc-200 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <span className="w-px h-3 bg-white/10 shrink-0" />

          {/* Expand Button */}
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all text-[10px] uppercase tracking-wider cursor-pointer shrink-0"
            title="Expand full player"
          >
            <span>SHOW</span>
            <span className="text-[9px]">⤤</span>
          </button>
        </div>

        {/* Expanded Content Layer */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${!isMinimized
              ? "max-h-105 opacity-100 scale-100 pointer-events-auto"
              : "max-h-0 opacity-0 scale-95 pointer-events-none overflow-hidden"
            }`}
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 text-[10px] text-zinc-500 tracking-widest uppercase">
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                  }`}
              />
              <span className="text-zinc-400">01 / AUDIO STREAM</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular-nums text-zinc-400">
                {String(trackIndex + 1).padStart(2, "0")} / {String(activeTracks.length).padStart(2, "0")}
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span>FIG. 82</span>
              <span className="w-px h-3 bg-white/10" />
              {/* Hide / Minimize Button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all text-[9px] uppercase tracking-wider cursor-pointer"
                title="Hide / Minimize music player"
              >
                <span>HIDE</span>
                <span className="text-[8px]">⤓</span>
              </button>
            </div>
          </div>

          {/* Middle Main Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-white/10">

            {/* Left Grid: Framed Vinyl Disc */}
            <div
              onClick={() => setShowVideo(!showVideo)}
              className="p-3 sm:p-3.5 flex flex-col items-center justify-between gap-2 bg-black/40 cursor-pointer group hover:bg-white/2 transition-colors"
              title="Toggle video view"
            >
              <div className="w-full flex items-center justify-between text-[9px] text-zinc-600 tracking-widest uppercase">
                <span>VINYL</span>
                <span className="group-hover:text-zinc-400 transition-colors">⤢</span>
              </div>

              {/* Rotating Vinyl Record */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border border-white/20 bg-black shadow-xl shrink-0 flex items-center justify-center">
                {/* Vinyl Center Art */}
                <img
                  src={`https://img.youtube.com/vi/${currentTrack.id}/hqdefault.jpg`}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform ${isPlaying ? "animate-spin [animation-duration:9s]" : ""
                    }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`;
                  }}
                />

                {/* Concentric Vinyl Grooves (Monochrome Portfolio Style) */}
                <div className="absolute inset-0 rounded-full border-[5px] border-black/50 pointer-events-none" />
                <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-3.5 rounded-full border border-white/10 pointer-events-none" />

                {/* Center Spindle Hole */}
                <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-zinc-900 border border-white/30 flex items-center justify-center shadow-inner pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-black border border-white/40" />
                </div>

                {/* Subtle playing indicator pulse */}
                {isPlaying && (
                  <div className="absolute -inset-0.5 rounded-full border border-white/10 animate-ping [animation-duration:3s] pointer-events-none" />
                )}
              </div>

              <span className="text-[8px] text-zinc-500 tracking-widest uppercase">
                REC · {String(trackIndex + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Right Grid: Track Meta, Scrubber & Controls */}
            <div className="p-3.5 sm:p-4 flex flex-col justify-between gap-3">

              {/* Track Info */}
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[9px] text-zinc-500 tracking-widest uppercase">
                    TRACK //
                  </span>
                  <span className="text-[9px] text-zinc-500 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <h2 className="text-white font-semibold text-sm sm:text-base truncate mt-0.5 tracking-tight">
                  {currentTrack.title}
                </h2>
                <div className="flex items-baseline gap-1.5 truncate mt-1">
                  <span className="text-[9px] text-zinc-500 tracking-widest uppercase">
                    ARTIST //
                  </span>
                  <span className="text-zinc-400 text-xs truncate">
                    {currentTrack.artist}
                  </span>
                </div>
              </div>

              {/* Hairline Progress Scrubber */}
              <div className="relative w-full group/progress cursor-pointer pt-1">
                <div className="relative w-full h-0.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progressPercent}
                  onChange={handleSeekChange}
                  className="seek-slider"
                  title="Seek"
                />
              </div>

              {/* Controls Bar */}
              <div className="flex items-center justify-between pt-1 gap-2">

                {/* Transport Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevTrack}
                    aria-label="Previous Track"
                    className="px-2.5 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all text-[10px] tracking-wider uppercase active:scale-95 cursor-pointer"
                  >
                    prev
                  </button>

                  <button
                    onClick={handlePlayPause}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="px-3.5 py-1 rounded bg-white text-black font-semibold text-[10px] tracking-wider uppercase hover:bg-zinc-200 active:scale-95 transition-all shadow-sm cursor-pointer min-w-14.5 text-center"
                  >
                    {isPlaying ? "pause" : "play"}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    aria-label="Next Track"
                    className="px-2.5 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all text-[10px] tracking-wider uppercase active:scale-95 cursor-pointer"
                  >
                    next
                  </button>
                </div>

                {/* Repeat & Volume */}
                <div className="flex items-center gap-2">
                  {/* Repeat Button */}
                  <button
                    onClick={toggleRepeat}
                    aria-label={isRepeat ? "Disable Repeat" : "Enable Repeat"}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] tracking-wider uppercase transition-all active:scale-95 cursor-pointer ${isRepeat
                        ? "bg-zinc-800 border-white/30 text-white font-medium shadow-sm"
                        : "bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                      }`}
                    title={isRepeat ? `Repeat ON (${repeatCount} loops)` : "Enable Repeat"}
                  >
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    <span>loop</span>
                  </button>

                  {/* Repeat Count Tag */}
                  {isRepeat && (
                    <div
                      className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-emerald-400 text-[10px] font-mono font-semibold tracking-wider"
                      title={`Played on loop ${repeatCount} times`}
                    >
                      {repeatCount > 0 ? `${repeatCount}×` : "1×"}
                    </div>
                  )}

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol ml-1">
                    <button
                      onClick={toggleMute}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors text-[10px]"
                      title="Mute"
                    >
                      {isMuted || volume === 0 ? "🔇" : "🔊"}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="vol-slider w-12 sm:w-16 opacity-40 group-hover/vol:opacity-100 transition-opacity"
                      title="Volume"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar: YouTube Link & Loop Status */}
          <div className="px-4 py-1.5 border-t border-white/10 text-[10px] text-zinc-500 flex items-center justify-between">
            <div className="text-[9px] tracking-widest uppercase text-zinc-600 group-hover:text-zinc-400 transition-colors">
              SOURCE: YOUTUBE
            </div>
            <div className="flex items-center gap-1.5">
              {isRepeat ? (
                <span className="text-zinc-300">
                  LOOP · {repeatCount > 0 ? `${repeatCount} REPEATS` : "ACTIVE"}
                </span>
              ) : (
                <span className="text-zinc-600 tracking-widest uppercase text-[9px]">
                  STATUS: READY
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

