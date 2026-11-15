"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import LabelSlide from "./components/LabelSlide";
import PatternWaves from "./components/PatternWaves";

const GITHUB_REPOSITORY = "TakshPatel02/shipyard-fm";
const GITHUB_URL = `https://github.com/${GITHUB_REPOSITORY}`;

type PatternMode = "idle" | "classic" | "new";
type CyclePhase = "violet" | "amber";

function GitHubStarLink({ stars }: { stars: number | null }) {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2 font-instrument-sans text-xs font-medium text-text/90 backdrop-blur-md transition-[filter,transform,border-color] hover:-translate-y-px hover:brightness-110 hover:border-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
    >
      <span>Star on GitHub</span>
      {stars !== null && <span className="text-muted">{stars}</span>}
      <span aria-hidden="true" className="text-sm leading-none">
        ★
      </span>
    </a>
  );
}

export default function Home() {
  const [stars, setStars] = useState<number | null>(null);
  const [mode, setMode] = useState<PatternMode>("idle");
  const prefersReducedMotion = useReducedMotion();
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cyclePausedRef = useRef(false);
  const cyclePhaseRef = useRef<CyclePhase>("violet");

  useEffect(() => {
    const loadStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}`);
        if (!response.ok) return;
        const repository = (await response.json()) as { stargazers_count?: number };
        if (typeof repository.stargazers_count === "number") {
          setStars(repository.stargazers_count);
        }
      } catch {
        // The link remains useful when the GitHub API is unavailable.
      }
    };

    void loadStars();
  }, []);

  useEffect(() => {
    const isTouchDevice =
      window.matchMedia?.("(hover: none), (pointer: coarse)").matches ?? false;
    if (prefersReducedMotion || isTouchDevice) return;

    const clearCycleTimer = () => {
      if (cycleTimerRef.current) {
        clearTimeout(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
    };

    const scheduleCycle = (delay: number) => {
      clearCycleTimer();
      if (document.hidden || cyclePausedRef.current) return;

      cycleTimerRef.current = setTimeout(() => {
        cycleTimerRef.current = null;
        if (document.hidden || cyclePausedRef.current) return;
        cyclePhaseRef.current = cyclePhaseRef.current === "violet" ? "amber" : "violet";
        setMode(cyclePhaseRef.current === "violet" ? "new" : "classic");
        scheduleCycle(6000);
      }, delay);
    };

    scheduleCycle(6000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearCycleTimer();
      } else if (!cyclePausedRef.current) {
        scheduleCycle(2000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearCycleTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <main className="relative h-svh min-h-svh overflow-hidden bg-background font-instrument-sans text-text">
      <div
        aria-hidden="true"
        className="pointer-events-auto absolute inset-0 z-0 overflow-hidden bg-background"
      >
        <PatternWaves
          preset="silk"
          color="#F4F1EA"
          backgroundColor="#07060B"
          mode={mode}
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
          opacity={1}
          fadeSize={0.5}
          characters=".:-=+*#%@"
          intro
          paused={false}
          style={{ position: "absolute", inset: 0 }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-5 bg-[linear-gradient(to_top,#07060B_0%,rgba(7,6,11,0.85)_30%,rgba(7,6,11,0.4)_55%,transparent_80%),linear-gradient(to_right,rgba(7,6,11,0.8)_0%,transparent_55%)]" />

      <header className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-7 md:px-16">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-text">Shipyard</span>
        <GitHubStarLink stars={stars} />
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-10 left-4 z-10 max-w-140 sm:bottom-16 sm:left-8 md:left-16"
      >
        <h1 className="text-[clamp(40px,6vw,88px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[#F4F1EA]">
          <span className="block whitespace-nowrap max-[479px]:whitespace-normal">Code at night.</span>
          <span className="block whitespace-nowrap max-[479px]:whitespace-normal">Press play.</span>
          <span className="block whitespace-nowrap max-[479px]:whitespace-normal">Keep shipping.</span>
        </h1>
        <p className="mt-5 max-w-[40ch] text-[clamp(16px,1.5vw,20px)] leading-relaxed text-[#A9A4B8] text-balance">
          A small music room for people who build. Two rooms to pick from, the same playlist in both.
        </p>
        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/player"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#F4F1EA] px-5 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow sm:w-auto"
          >
            <LabelSlide>Enter the New Player</LabelSlide>
          </Link>
          <Link
            href="/classic"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-[#14121C] px-5 text-sm font-medium text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow sm:w-auto"
          >
            <LabelSlide>The Original Room</LabelSlide>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
