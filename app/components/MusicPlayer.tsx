"use client";

import { useEffect, useRef, useState } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
}

export const TRACKS: Track[] = [
  { id: "9a4izd3Rvdw", title: "Challa", artist: "Rabbi Shergill" },
  { id: "TyMUY2CDrjc", title: "Haareya", artist: "Arijit Singh" },
  { id: "fdubeMFwuGs", title: "Ilahi", artist: "Arijit Singh" },
  { id: "XgdY_s1LsZc", title: "Haule Haule", artist: "Sukhwinder Singh" },
  { id: "c2gSzYLJ8sY", title: "Ishq Bulaava", artist: "Sanam Puri & Shipra Goyal" },
  { id: "VdyBtGaspss", title: "Chahun Main Ya Naa", artist: "Arijit Singh & Palak Muchhal" },
  { id: "0NFxcNheoLc", title: "Banjaara", artist: "Mohammed Irfan" },
  { id: "69pPYkGiEAQ", title: "Kisi Ki Muskurahaton Pe Ho Nisar", artist: "Mukesh" },
  { id: "hoNb6HuNmU0", title: "KHAIRIYAT", artist: "Arijit Singh" },
  { id: "VdyBtGaspss", title: "Chahun Main Ya Naa", artist: "Arijit Singh & Palak Muchhal" },
  { id: "5gwy0gcjIkI", title: "Tere Sang Yaara", artist: "Atif Aslam" },
  { id: "CxAWKewvooo", title: "Saude Bazi", artist: "Anupam Amod" },
  { id: "w9Qo6p4XsXE", title: "Ye Tune Kya Kiya", artist: "Javed Bashir" },
  { id: "c3aj-wR3uos", title: "Yeh Parda Hata Do", artist: "Mohammed Rafi & Asha Bhosle" },
  { id: "4QVu6Vo6Jhw", title: "Dhan Te Nan", artist: "Vishal Bhardwaj" },
  { id: "7vkW5PNBhDU", title: "Chalti Hai Kya 9 Se 12", artist: "Dev Negi & Neha Kakkar" },
  { id: "t2v3GDhEZno", title: "Pal Pal Dil Ke Paas", artist: "Kishore Kumar" },
  { id: "qoq8B8ThgEM", title: "Tujh Mein Rab Dikhta Hai", artist: "Roop Kumar Rathod" },
  { id: "DAYszemgPxc", title: "Main Agar Kahoon", artist: "Sonu Nigam & Shreya Ghoshal" },
  { id: "qpIdoaaPa6U", title: "Jeene Laga Hoon", artist: "Atif Aslam & Shreya Ghoshal" },
  { id: "a9Hxkc9YxGE", title: "Bulleya", artist: "Papon" },
  { id: "KQtMPONdxGs", title: "Tere Bina", artist: "Arijit Singh & Aakanksha Sharma" },
  { id: "jFmi69lb8sQ", title: "Hona Tha Pyar", artist: "Atif Aslam & Hadiqa Kiani" },
  { id: "kp-Bqr1Gtyw", title: "Sach Keh Raha Hai Deewana", artist: "KK" }
];

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

export default function MusicPlayer() {
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const trackIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isUserPausedRef = useRef<boolean>(true);

  useEffect(() => {
    trackIndexRef.current = trackIndex;
  }, [trackIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const currentTrack = TRACKS[trackIndex];

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
        } catch (e) {}
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
        } catch (err) {}
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
          } catch (e) {}
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

  // Initialize YouTube API and Player
  useEffect(() => {
    const initPlayer = () => {
      if (playerRef.current) return;
      if (!window.YT || !window.YT.Player) return;

      playerRef.current = new window.YT.Player("youtube-player-frame", {
        height: "180",
        width: "320",
        videoId: TRACKS[0].id,
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
              event.target.setVolume(70);
            } catch (err) {}
          },
          onStateChange: (event: any) => {
            const YTState = window.YT.PlayerState;
            if (event.data === YTState.PLAYING) {
              setIsPlaying(true);
              isUserPausedRef.current = false;
              startProgressTracking();
            } else if (event.data === YTState.PAUSED) {
              // If background pause triggered by browser while user didn't request pause, force resume
              if (!isUserPausedRef.current && (document.hidden || !document.hasFocus())) {
                setTimeout(() => {
                  try {
                    playerRef.current?.playVideo();
                  } catch (e) {}
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
  }, []);

  const handlePlayPause = () => {
    if (!playerRef.current || !isReady) return;
    if (isPlaying) {
      isUserPausedRef.current = true;
      playerRef.current.pauseVideo();
    } else {
      isUserPausedRef.current = false;
      playerRef.current.playVideo();
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (trackIndexRef.current + 1) % TRACKS.length;
    setTrackIndex(nextIdx);
    setCurrentTime(0);
    setDuration(0);
    isUserPausedRef.current = false;
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(TRACKS[nextIdx].id);
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => {
    const prevIdx = (trackIndexRef.current - 1 + TRACKS.length) % TRACKS.length;
    setTrackIndex(prevIdx);
    setCurrentTime(0);
    setDuration(0);
    isUserPausedRef.current = false;
    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
      playerRef.current.loadVideoById(TRACKS[prevIdx].id);
      setIsPlaying(true);
    }
  };

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

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      setVolume(playerRef.current.getVolume() || 70);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-2 select-none relative w-full max-w-140 mx-auto px-2">
      {/* 
        YouTube Video Frame (Rendered with 320x180 dimensions in DOM).
        When showVideo is false, we keep it in DOM with subtle opacity to prevent Chromium from throttling background tab audio.
      */}
      <div
        className={`fixed z-40 transition-all duration-300 ${
          showVideo
            ? "bottom-6 right-6 w-70 h-39.5 opacity-100 scale-100"
            : "bottom-2 right-2 w-70 h-39.5 opacity-[0.01] pointer-events-none -z-10"
        }`}
      >
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.8)] bg-black group">
          <div id="youtube-player-frame" className="w-full h-full object-cover" />
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white/80 p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 font-mono text-[10px]"
            title="Hide video"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Portfolio-Style Segmented Player Box */}
      <div className="relative z-10 w-full rounded-xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.75)] text-white overflow-hidden font-mono">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 border-b border-white/10 text-[10px] text-white/40 tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>PLAYER // AUDIO STREAM</span>
          </div>
          <span>FIG. 82</span>
        </div>

        {/* Middle Main Content Grid (Responsive Layout) */}
        <div className="flex flex-col sm:flex-row items-center p-3 sm:p-4 gap-3 sm:gap-4">
          
          {/* Top/Left Row on Mobile: Album Art + Track Meta */}
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0 flex-1">
            {/* Vinyl Cover Art */}
            <div
              onClick={() => setShowVideo(!showVideo)}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border border-white/20 shadow-md bg-black cursor-pointer group"
              title="Toggle video view"
            >
              <img
                src={`https://img.youtube.com/vi/${currentTrack.id}/hqdefault.jpg`}
                alt={currentTrack.title}
                className={`w-full h-full object-cover ${isPlaying ? "animate-spin [animation-duration:8s]" : ""}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentTrack.id}/mqdefault.jpg`;
                }}
              />
              <div className="absolute inset-0 m-auto w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-stone-900 border border-white/30 shadow-inner group-hover:scale-125 transition-transform" />
            </div>

            {/* Track Info & Progress */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="text-white/40 font-mono text-[10px] shrink-0">track //</span>
                <span className="text-white font-mono font-semibold text-xs sm:text-sm truncate">{currentTrack.title}</span>
              </div>
              <div className="flex items-baseline gap-1.5 truncate mt-0.5">
                <span className="text-white/40 font-mono text-[10px] shrink-0">artist //</span>
                <span className="text-white/70 font-mono text-xs truncate">{currentTrack.artist}</span>
              </div>

              {/* Progress Line */}
              <div className="relative w-full h-1 mt-2 rounded-full bg-white/15 overflow-hidden cursor-pointer">
                <div
                  className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
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

              {/* Time & Volume Row (Guaranteed No Wrap) */}
              <div className="flex items-center justify-between text-[10px] text-white/50 font-mono mt-1 whitespace-nowrap">
                <span className="tabular-nums shrink-0 whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button onClick={toggleMute} className="hover:text-white transition-colors" title="Mute">
                    {isMuted || volume === 0 ? "🔇" : "🔊"}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="vol-slider w-12 sm:w-16"
                    title="Volume"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Segmented Control Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-3">
            <button
              onClick={handlePrevTrack}
              aria-label="Previous Track"
              className="px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-mono shrink-0"
            >
              prev
            </button>

            <button
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="px-3.5 py-1.5 rounded-md bg-white text-black font-semibold text-xs font-mono shadow-md hover:bg-white/90 active:scale-95 transition-all shrink-0 min-w-14.5 text-center"
            >
              {isPlaying ? "pause" : "play"}
            </button>

            <button
              onClick={handleNextTrack}
              aria-label="Next Track"
              className="px-2.5 py-1.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white transition-all text-xs font-mono shrink-0"
            >
              next
            </button>
          </div>
        </div>

        {/* Bottom Footer inside Card */}
        <div className="px-3.5 sm:px-4 py-1.5 border-t border-white/10 text-[10px] text-white/40 font-mono flex items-center justify-between truncate">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span className="truncate">songs are playing using youtube</span>
          </div>
        </div>
      </div>
    </div>
  );
}
