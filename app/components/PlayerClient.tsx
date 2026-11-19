"use client";

import PatternWaves from "./PatternWaves";
import PlayerArcStack from "./PlayerArcStack";
import PlayerController from "./PlayerController";
import { usePlayer } from "../hooks/player";

export default function PlayerClient() {
  const {
    playlist,
    index,
    track,
    status,
    goTo,
    containerRef,
    isPlaying,
    handlePlayPause,
    handleNextTrack,
    handlePrevTrack,
    currentTime,
    duration,
    progressPercent,
    handleSeekChange,
    volume,
    isMuted,
    handleVolumeChange,
    toggleMute,
    isRepeat,
    repeatCount,
    toggleRepeat,
  } = usePlayer({
    playlistMode: "default",
    customTracks: [],
  });

  const handleShuffle = () => {
    if (playlist.length <= 1) return;
    let nextIdx = index;
    while (nextIdx === index) {
      nextIdx = Math.floor(Math.random() * playlist.length);
    }
    goTo(nextIdx);
  };

  return (
    <main className="relative h-svh min-h-svh w-full overflow-hidden bg-[#07060B] font-instrument-sans text-[#F4F1EA]">
      {/* 1) Canvas: absolute inset-0 z-0 container */}
      <div
        aria-hidden="true"
        className="pointer-events-auto absolute inset-0 z-0 overflow-hidden"
      >
        <PatternWaves
          preset="silk"
          color="#F4F1EA"
          backgroundColor="#07060B"
          mode="new"
          fade="edges"
          interactive
          cursorSize={50}
          cursorStrength={0.6}
          pattern="dot"
          wave="silk"
          spacing={9}
          markSize={0.95}
          depth={0.95}
          light={0}
          shine={0.8}
          contrast={1.2}
          speed={0.35}
          scale={1}
          direction={20}
          opacity={0.55}
          fadeSize={0.5}
          characters=".:-=+*#%@"
          intro
          paused={false}
          style={{ position: "absolute", inset: 0 }}
        />
      </div>

      {/* 2) Ambient Scrims */}
      {/* Left scrim behind player controls */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3/5 z-5"
        style={{
          background:
            "linear-gradient(to right, rgba(7,6,11,0.85) 0%, rgba(7,6,11,0.45) 45%, transparent 100%)",
        }}
        aria-hidden="true"
      />
      {/* Right scrim behind cards */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/5 z-5"
        style={{
          background:
            "linear-gradient(to left, rgba(7,6,11,0.7) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      {/* Bottom scrim */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 z-5"
        style={{
          background: "linear-gradient(to top, rgba(7,6,11,0.75) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* 3) Left Bottom Music Player Controller (Using home screen content margins) */}
      <div className="absolute bottom-10 left-4 z-20 pointer-events-auto sm:bottom-16 sm:left-8 md:bottom-16 md:left-16">
        {track && (
          <PlayerController
            track={track}
            trackIndex={index}
            totalTracks={playlist.length}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            onShuffle={handleShuffle}
            isRepeat={isRepeat}
            repeatCount={repeatCount}
            onToggleRepeat={toggleRepeat}
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            onSeekChange={handleSeekChange}
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onToggleMute={toggleMute}
            status={status}
          />
        )}
      </div>

      {/* 4) Right Arc Stack Panel: curve on right side, touching the right border */}
      <section
        aria-label="Track playlist carousel"
        className="absolute inset-y-0 right-0 w-[50%] lg:w-[48%] z-10 pointer-events-none flex items-center justify-end overflow-visible"
      >
        <div className="relative w-full h-full pointer-events-auto">
          {playlist.length > 0 && (
            <PlayerArcStack
              tracks={playlist}
              activeIndex={index}
              onIndexChange={goTo}
            />
          )}
        </div>
      </section>

      {/* 5) Hidden YouTube iframe container */}
      <div
        ref={containerRef}
        className="pointer-events-none fixed left-[-9999px] top-[-9999px] h-px w-px opacity-0"
        aria-hidden="true"
      >
        <div id="youtube-player-frame" />
      </div>
    </main>
  );
}
