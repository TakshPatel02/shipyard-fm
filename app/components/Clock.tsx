"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${minutes}:${seconds} ${ampm}`);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeStr) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 font-mono text-xs text-white/90 shadow-md whitespace-nowrap shrink-0">
      <span className="text-white/40 font-mono text-[10px] tracking-wider shrink-0">FIG. 01</span>
      <span className="w-px h-3 bg-white/15 shrink-0" />
      <span className="tabular-nums tracking-wide whitespace-nowrap">{timeStr}</span>
    </div>
  );
}
