export interface Banner {
  src: string;
  alt: string;
  slot: string;
}

export const BANNERS: Banner[] = [
  { src: "/shipyard-1.webp", alt: "Morning Scene - Shipyard", slot: "Morning" },
  { src: "/shipyard-2.webp", alt: "Afternoon Scene - Shipyard", slot: "Afternoon" },
  { src: "/shipyard-3.webp", alt: "Evening Scene - Shipyard", slot: "Evening" },
  { src: "/shipyard-4.webp", alt: "Night Scene - Shipyard", slot: "Night" },
  { src: "/shipyard-5.webp", alt: "Late Night Scene - Shipyard", slot: "Late Night" },
];

export const SLOT_END_HOURS = [11, 16, 20, 24, 5];

/** Returns a Date whose H/M/S reflects the current IST time */
export function getISTNow(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

/** Maps an IST hour (0–23) to the banner index that should be showing */
export function indexForHour(h: number): number {
  if (h >= 5 && h < 11) return 0;  // Morning   (05:00 – 10:59)
  if (h >= 11 && h < 16) return 1; // Afternoon (11:00 – 15:59)
  if (h >= 16 && h < 20) return 2; // Evening   (16:00 – 19:59)
  if (h >= 20) return 3;           // Night     (20:00 – 23:59)
  return 4;                        // Late Night(00:00 – 04:59)
}

/** Milliseconds from `istNow` until the end of `slotIdx`'s time window */
export function msUntilNextSlot(slotIdx: number, istNow: Date): number {
  const endHour = SLOT_END_HOURS[slotIdx];
  const target = new Date(istNow);
  if (endHour === 24) {
    target.setDate(target.getDate() + 1);
    target.setHours(0, 0, 0, 0);
  } else {
    target.setHours(endHour, 0, 0, 0);
    if (target <= istNow) target.setDate(target.getDate() + 1);
  }
  return target.getTime() - istNow.getTime();
}
