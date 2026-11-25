"use client";

import { useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaCheck, FaCopy, FaDesktop } from "react-icons/fa6";

export default function MobilePlayerFallback() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(textarea);
      }
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-svh w-full overflow-x-hidden overflow-y-auto bg-[#07060B] font-instrument-sans text-[#F4F1EA]">
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 20%, rgba(139, 108, 255, 0.14) 0%, transparent 70%)",
        }}
      />

      {/* Top Back link */}
      <div className="relative z-10 px-5 pt-5">
        <Link
          href="/"
          aria-label="Back to homepage"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#F4F1EA]/75 transition-colors hover:text-[#F4F1EA] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glow"
        >
          <FaArrowLeft aria-hidden="true" className="text-xs" />
          <span>Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col px-5 pb-12 pt-6">
        {/* Badge */}
        <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-[#A9A4B8]">
          <FaDesktop aria-hidden="true" className="text-[11px] text-[#8b6cff]" />
          <span>Desktop Experience Preview</span>
        </div>

        {/* Looping Demo Video */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/12 bg-[#12101B] shadow-[0_20px_50px_rgba(0,0,0,0.65)]">
          <video
            src="/Demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="Shipyard desktop music player demo video"
            className="block h-auto w-full object-cover"
          />
        </div>

        {/* Explanation below the video */}
        <div className="mt-6 space-y-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-[#F4F1EA] leading-snug">
            Shipyard is built for laptops and desktops. Mobile browsers pause audio in the background.
          </h1>
          <p className="text-sm leading-relaxed text-[#A9A4B8]">
            Mobile operating systems suspend background tabs and embedded YouTube audio whenever you switch apps or lock your screen. Copy the link below to open the full interactive player on your laptop or desktop.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#F4F1EA] px-5 text-sm font-medium text-[#07060B] transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow sm:w-auto cursor-pointer"
          >
            {copied ? (
              <>
                <FaCheck aria-hidden="true" className="text-xs text-emerald-700" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <FaCopy aria-hidden="true" className="text-xs" />
                <span>Copy link</span>
              </>
            )}
          </button>

          <Link
            href="/"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/12 bg-[#14121C] px-5 text-sm font-medium text-[#F4F1EA] transition-colors hover:bg-[#1C1A26] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow sm:w-auto"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
