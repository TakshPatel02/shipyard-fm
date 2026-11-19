"use client";

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/refs */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { TRACKS, Track } from "../lib/music-data";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

export function formatTime(seconds: number): string {
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

export type PlaylistMode = "default" | "custom";

interface UsePlayerProps {
  playlistMode: PlaylistMode;
  customTracks: Track[];
}

export function usePlayer({ playlistMode, customTracks }: UsePlayerProps) {
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
  const [status, setStatus] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackIndexRef = useRef<number>(trackIndex);
  const isPlayingRef = useRef<boolean>(false);
  const isUserPausedRef = useRef<boolean>(true);
  const userHasClickedPlayRef = useRef<boolean>(false);
  const isRepeatRef = useRef<boolean>(isRepeat);
  const volumeRef = useRef<number>(volume);
  const currentTimeRef = useRef<number>(0);
  const activeTracksRef = useRef<Track[]>(TRACKS);
  const navigationLockUntilRef = useRef<number>(0);

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

  const activeTracks = playlistMode === "default" ? TRACKS : customTracks;
  activeTracksRef.current = activeTracks;

  const currentTrack = activeTracks[trackIndex] ?? activeTracks[0] ?? TRACKS[0];

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
    navigationLockUntilRef.current = Date.now() + 900;
    trackIndexRef.current = nextIdx;
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
            let eventVideoId: string | undefined;
            try {
              eventVideoId = event.target?.getVideoData?.().video_id;
            } catch {
              eventVideoId = undefined;
            }
            const currentVideoId = activeTracksRef.current[trackIndexRef.current]?.id;
            if (
              event.data === YTState.ENDED &&
              eventVideoId &&
              currentVideoId &&
              eventVideoId !== currentVideoId
            ) {
              return;
            }
            if (
              event.data === YTState.ENDED &&
              Date.now() < navigationLockUntilRef.current
            ) {
              return;
            }
            if (event.data === YTState.PLAYING) {
              if (!userHasClickedPlayRef.current) {
                event.target.pauseVideo();
                isUserPausedRef.current = true;
                return;
              }
              setStatus("");
              setIsPlaying(true);
              isUserPausedRef.current = false;
              startProgressTracking();
            } else if (event.data === YTState.PAUSED) {
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
            let eventVideoId: string | undefined;
            try {
              eventVideoId = event.target?.getVideoData?.().video_id;
            } catch {
              eventVideoId = undefined;
            }
            const currentVideoId = activeTracksRef.current[trackIndexRef.current]?.id;
            if (eventVideoId && currentVideoId && eventVideoId !== currentVideoId) return;
            if (Date.now() < navigationLockUntilRef.current) return;
            console.warn("YouTube player error code:", event.data);
            setStatus("Skipped unavailable track");
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
    navigationLockUntilRef.current = Date.now() + 900;
    trackIndexRef.current = prevIdx;
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

  const goTo = useCallback((targetIndex: number) => {
    userHasClickedPlayRef.current = true;
    const tracks = activeTracksRef.current;
    if (!tracks.length) return;
    const wrappedIdx = ((targetIndex % tracks.length) + tracks.length) % tracks.length;
    navigationLockUntilRef.current = Date.now() + 900;
    trackIndexRef.current = wrappedIdx;
    setTrackIndex(wrappedIdx);
    savePlayerState({
      trackIndex: wrappedIdx,
      currentTime: 0,
      volume: volumeRef.current,
      isRepeat: isRepeatRef.current,
    });
    setCurrentTime(0);
    setDuration(0);
    setRepeatCount(0);
    isUserPausedRef.current = false;
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(tracks[wrappedIdx].id);
      setIsPlaying(true);
    }
  }, []);

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (playerRef.current && duration > 0) {
      const targetTime = (newProgress / 100) * duration;
      playerRef.current.seekTo(targetTime, true);
      setCurrentTime(targetTime);
    }
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        setRepeatCount(0);
      }
      return !prev;
    });
  };

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

  useEffect(() => {
    if (!playerRef.current || !isReady) return;

    try { playerRef.current.pauseVideo(); } catch { }
    setIsPlaying(false);
    isUserPausedRef.current = true;
    setTrackIndex(0);
    trackIndexRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
    setRepeatCount(0);

    if (playlistMode === "custom") {
      if (customTracks.length === 0) {
        return;
      }
      try { playerRef.current.cueVideoById(customTracks[0].id); } catch { }
    } else {
      try { playerRef.current.cueVideoById(TRACKS[0].id); } catch { }
    }
  }, [playlistMode, isReady]);

  useEffect(() => {
    if (playlistMode !== "custom" || !playerRef.current || !isReady) return;
    if (customTracks.length === 0) {
      try { playerRef.current.pauseVideo(); } catch { }
      setIsPlaying(false);
      isUserPausedRef.current = true;
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    const idx = Math.min(trackIndexRef.current, customTracks.length - 1);
    if (idx !== trackIndexRef.current) {
      setTrackIndex(0);
      trackIndexRef.current = 0;
    }
    try {
      playerRef.current.cueVideoById(customTracks[idx].id);
    } catch { }
    setIsPlaying(false);
    isUserPausedRef.current = true;
    setCurrentTime(0);
    setDuration(0);
  }, [customTracks, playlistMode, isReady]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  return {
    activeTracks,
    currentTime,
    currentTrack,
    duration,
    handleNextTrack,
    handlePlayPause,
    handlePrevTrack,
    handleSeekChange,
    handleVolumeChange,
    isMinimized,
    isMuted,
    isPlaying,
    isRepeat,
    progressPercent,
    repeatCount,
    setIsMinimized,
    setShowVideo,
    showVideo,
    toggleMute,
    toggleRepeat,
    trackIndex,
    volume,

    // Additive exports
    status,
    containerRef,
    goTo,
    playlist: activeTracks,
    index: trackIndex,
    track: currentTrack,
    play: () => {
      if (!playerRef.current || !isReady) return;
      userHasClickedPlayRef.current = true;
      isUserPausedRef.current = false;
      playerRef.current.playVideo();
    },
    pause: () => {
      if (!playerRef.current || !isReady) return;
      isUserPausedRef.current = true;
      playerRef.current.pauseVideo();
    },
    next: handleNextTrack,
    prev: handlePrevTrack,
    setVolume: (val: number) => {
      setVolume(val);
      if (playerRef.current && typeof playerRef.current.setVolume === "function") {
        playerRef.current.setVolume(val);
        setIsMuted(val === 0);
      }
    },
  };
}
