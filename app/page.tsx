"use client";

import { useEffect, useState } from "react";
import LightBloom from "./components/LightBloom";

const GITHUB_REPOSITORY = "TakshPatel02/shipyard-fm";
const GITHUB_URL = `https://github.com/${GITHUB_REPOSITORY}`;
const PORTFOLIO_URL = "https://takshpatel.vercel.app";

export default function Home() {
  const [stars, setStars] = useState<number | null>(null);

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-text">
      <LightBloom
        style={{ position: "absolute", inset: 0, minWidth: "100%", minHeight: "100%" }}
        background="#050509"
        baseColor="#5B2EE6"
        accentColor="#8B6CFF"
        variant="shafts"
        direction="bottom"
        light={{ rise: 79, spread: 72 }}
        shafts={{ count: 17, amount: 70, drift: 79 }}
        finish={{ grain: 12, vignette: 25 }}
      />

      <div className="relative z-10 flex min-h-screen flex-col px-6 py-6 sm:px-10 sm:py-8">
        <header className="flex items-center justify-between">
          <span className="font-instrument-sans text-sm font-medium tracking-[0.18em] text-text/70 uppercase">
            Shipyard
          </span>
          <span className="font-instrument-sans text-xs tracking-[0.16em] text-muted uppercase">
            01 / 02
          </span>
        </header>

        <section className="flex flex-1 items-center justify-center py-24 text-center">
          <div className="max-w-3xl">
            <p className="mb-5 font-instrument-sans text-xs font-medium tracking-[0.28em] text-glow uppercase">
              A place to listen
            </p>
            <h1 className="font-fraunces text-6xl leading-none tracking-[-0.045em] text-text sm:text-8xl md:text-9xl">
              The Shipyard
            </h1>
            <p className="mx-auto mt-7 max-w-md font-fraunces text-xl leading-relaxed text-text/75 sm:text-2xl">
              Built from nostalgia. Runs on music.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/classic"
                className="inline-flex min-w-44 items-center justify-center rounded-full border border-border bg-surface/80 px-5 py-3 font-instrument-sans text-sm font-medium text-text transition-colors hover:border-glow hover:bg-surface"
              >
                The Original Room
              </a>
              <a
                href="/player"
                className="inline-flex min-w-44 items-center justify-center rounded-full bg-primary px-5 py-3 font-instrument-sans text-sm font-medium text-text shadow-[0_0_30px_rgba(91,46,230,0.35)] transition-colors hover:bg-glow"
              >
                Explore the New Player
              </a>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4 border-t border-border/70 pt-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/75 px-4 py-2 font-instrument-sans text-xs font-medium text-text transition-colors hover:border-glow hover:text-glow"
          >
            <span aria-hidden="true">★</span>
            <span>Star on GitHub</span>
            {stars !== null && <span className="text-muted">{stars}</span>}
          </a>
          <p className="font-instrument-sans text-xs tracking-wide text-muted">
            Built by{" "}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-text transition-colors hover:text-glow"
            >
              Taksh Patel
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
