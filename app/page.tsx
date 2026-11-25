"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { FaGithub, FaStar } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import LabelSlide from "./components/LabelSlide";
import PatternWaves from "./components/PatternWaves";

const GITHUB_REPOSITORY = "TakshPatel02/shipyard-fm";
const GITHUB_URL = `https://github.com/${GITHUB_REPOSITORY}`;

type PatternMode = "idle" | "classic" | "new";
type CyclePhase = "violet" | "amber";

const contentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.16, delayChildren: 0.08 }
  }
};

const contentItemVariants = {
  hidden: { opacity: 0, x: -22 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }
  }
};

const navbarVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.1, staggerChildren: 0.18 }
  }
};

const navbarItemVariants = {
  hidden: { opacity: 0, y: -18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const }
  }
};

function GitHubStarLink({ stars }: { stars: number | null }) {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Star Shipyard on GitHub"
      className="group inline-flex items-center gap-2.5 rounded-xl bg-[#24242A] px-4 py-2 font-instrument-sans text-sm font-medium text-text/90 transition-colors duration-200 hover:bg-[#2D2D35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
    >
      <FaGithub
        aria-hidden="true"
        className="text-[16px] text-text/90 transition-transform duration-200 group-hover:scale-110"
      />
      <span>Star</span>
      <FaStar aria-hidden="true" className="text-[13px] text-[#F2A65A]" />
      {stars !== null && (
        <span className="min-w-8 rounded-full bg-text/10 px-2.5 py-1 text-center text-xs leading-none text-muted">
          {stars}
        </span>
      )}
    </a>
  );
}

export default function Home() {
  const [stars, setStars] = useState<number | null>(null);
  const [mode, setMode] = useState<PatternMode>("idle");
  const [hasEntered, setHasEntered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const cycleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cyclePausedRef = useRef(false);
  const cyclePhaseRef = useRef<CyclePhase>("violet");

  useEffect(() => {
    if (prefersReducedMotion) {
      setHasEntered(true);
      return;
    }

    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [prefersReducedMotion]);

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

      <motion.header
        initial={prefersReducedMotion ? false : "hidden"}
        animate={hasEntered || prefersReducedMotion ? "visible" : "hidden"}
        variants={navbarVariants}
        className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-7 md:px-16"
      >
        <motion.span
          variants={navbarItemVariants}
          className="text-lg font-semibold tracking-[-0.01em] text-text"
        >
          Shipyard
        </motion.span>
        <motion.div variants={navbarItemVariants}>
          <GitHubStarLink stars={stars} />
        </motion.div>
      </motion.header>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        animate={hasEntered || prefersReducedMotion ? "visible" : "hidden"}
        variants={contentVariants}
        className="absolute bottom-10 left-4 z-10 max-w-140 sm:bottom-16 sm:left-8 md:bottom-16 md:left-16"
      >
        <motion.h1
            variants={contentItemVariants}
            className="text-[clamp(40px,6vw,88px)] font-semibold leading-[1.02] tracking-[-0.03em] text-[#F4F1EA]"
        >
            <span className="block whitespace-nowrap max-[479px]:whitespace-normal">Code at night.</span>
            <span className="block whitespace-nowrap max-[479px]:whitespace-normal">Press play.</span>
            <span className="block whitespace-nowrap max-[479px]:whitespace-normal">Keep shipping.</span>
        </motion.h1>
        <motion.p
          variants={contentItemVariants}
          className="mt-5 max-w-[40ch] text-[clamp(16px,1.5vw,20px)] leading-relaxed text-[#A9A4B8] text-balance"
        >
          A small music room for people who build. Two rooms to pick from, the same playlist in both.
        </motion.p>
        <motion.div
          variants={contentItemVariants}
          className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:items-start"
        >
          <div className="flex w-full flex-col items-start gap-1.5 sm:w-auto">
            <Link
              href="/player"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#F4F1EA] px-5 text-sm font-medium text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow sm:w-auto"
            >
              <LabelSlide>Enter the New Player</LabelSlide>
            </Link>
            <span className="pl-0.5 text-[11px] font-medium tracking-wide text-[#A9A4B8]/75">
              Best on desktop
            </span>
          </div>
          <Link
            href="/classic"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-[#14121C] px-5 text-sm font-medium text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow sm:w-auto"
          >
            <LabelSlide>The Original Room</LabelSlide>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
