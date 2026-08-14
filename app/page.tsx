"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Clock from "./components/Clock";
import MusicPlayer from "./components/MusicPlayer";
import {
  BANNERS,
  getISTNow,
  indexForHour,
  msUntilNextSlot,
} from "./lib/banner-data";

const YOUTUBE_PLAYLIST_URL = "https://youtube.com/playlist?list=PLXR35Mhy4kZA&si=bkv8UyurhfmRPPVc";

export default function Home() {
  // Initialise with the correct time-based banner (no flash)
  const [current, setCurrent] = useState<number>(() =>
    indexForHour(getISTNow().getHours())
  );

  const slotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-switch exactly at each slot boundary ──────────────────────
  useEffect(() => {
    const arm = () => {
      const istNow = getISTNow();
      const idx = indexForHour(istNow.getHours());
      const delay = msUntilNextSlot(idx, istNow);

      slotTimerRef.current = setTimeout(() => {
        setCurrent(indexForHour(getISTNow().getHours()));
        arm(); // re-arm for the following slot
      }, delay);
    };

    arm();
    return () => {
      if (slotTimerRef.current) clearTimeout(slotTimerRef.current);
    };
  }, []);

  // ── Manual "Change Image" click handler ────────────────────────────
  const handleCycleImage = () => {
    setCurrent((prev) => (prev + 1) % BANNERS.length);
  };

  return (
    <main className="relative w-full h-screen overflow-hidden font-sans select-none bg-black">
      {/* Masked image layer with radial ellipse mask */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: "radial-gradient(ellipse 90% 88% at 50% 50%, black 48%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 88% at 50% 50%, black 48%, transparent 100%)",
        }}
      >
        {BANNERS.map((banner, i) => (
          <Image
            key={banner.src}
            src={banner.src}
            alt={banner.alt}
            fill
            priority={i === 0}
            sizes="100vw"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className={[
              "object-cover select-none pointer-events-none",
              "transition-opacity duration-700 ease-in-out",
              i === current ? "opacity-100" : "opacity-0",
            ].join(" ")}
            loading="eager"
          />
        ))}

        {/* Edge overlay for radial dissolve */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse 90% 88% at 50% 50%, transparent 70%, #000000 100%)",
          }}
        />
      </div>

      {/* Subtle Vignette Overlay for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10" />

      {/* 
        Top Header Bar:
        Clock on left.
        Buttons on right: stacked vertically on mobile / narrow viewports, side-by-side on desktop.
      */}
      <header className="absolute top-0 left-0 right-0 flex items-start justify-between p-4 sm:p-6 gap-3 z-20">
        {/* Top Left: Clock */}
        <div className="flex items-center shrink-0">
          <Clock />
        </div>

        {/* Top Right: Buttons (Stacks neatly on right on narrow screens) */}
        <nav className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Change Image Button */}
          <button
            onClick={handleCycleImage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 font-mono text-xs text-white/90 shadow-md hover:bg-black/75 hover:border-white/25 transition-all group cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Change Background Image"
          >
            <span className="text-white/40 font-mono text-[10px] tracking-wider shrink-0">BG // {current + 1}</span>
            <span className="w-px h-3 bg-white/15 shrink-0" />
            <span className="text-white/90 font-mono tracking-tight group-hover:text-white flex items-center gap-1.5 whitespace-nowrap">
              <span>change image</span>
              <svg
                className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-transform group-hover:rotate-180 duration-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M2.1 12a10 10 0 0 1 15-8.3l4.4 4.3M2.5 22v-6h6M21.9 12a10 10 0 0 1-15 8.3l-4.4-4.3" />
              </svg>
            </span>
          </button>

          {/* YouTube Playlist Link */}
          <a
            href={YOUTUBE_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 font-mono text-xs text-white/90 shadow-md hover:bg-black/75 hover:border-white/25 transition-all group whitespace-nowrap shrink-0"
            aria-label="Open YouTube Playlist"
          >
            <span className="text-white/40 font-mono text-[10px] tracking-wider shrink-0">SOURCE</span>
            <span className="w-px h-3 bg-white/15 shrink-0" />
            <span className="text-white/90 font-mono tracking-tight group-hover:text-white whitespace-nowrap">
              youtube playlist
            </span>
            <span className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0">
              ↗
            </span>
          </a>
        </nav>
      </header>

      {/* Bottom Center: Music Player Container */}
      <footer className="absolute bottom-6 left-0 right-0 flex justify-center px-4 z-20">
        <MusicPlayer />
      </footer>
    </main>
  );
}
