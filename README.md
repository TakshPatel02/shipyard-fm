# Shipyard FM

> **Built from nostalgia, runs on music.**

A cozy, time-aware developer workspace that shifts its background with the time of day — paired with a minimal, glassmorphic YouTube music player. No ads, no distractions. Just vibes and code.

**Live at:** [shipyard-fm.vercel.app](https://shipyard-fm.vercel.app)

![Shipyard FM — Website Preview](./public/website.png)

---

## Features

### Time-Aware Background

The background image changes automatically based on your **IST (Indian Standard Time)** time of day — no interaction needed. Each time slot has its own carefully curated scene:

| Time Slot   | Hours (IST)       | Vibe                    |
| ----------- | ----------------- | ----------------------- |
| Morning     | 05:00 - 10:59     | Warm, golden light      |
| Afternoon   | 11:00 - 15:59     | Bright, productive      |
| Evening     | 16:00 - 19:59     | Golden hour glow        |
| Night       | 20:00 - 23:59     | Cool, dark, focused     |
| Late Night  | 00:00 - 04:59     | Deep dark, late-night grind |

The transition happens automatically at each slot boundary — pixel-perfect and smooth. You can also click **"change image"** in the top-right to cycle through banners manually.

---

### YouTube Music Player

A sleek, floating music player at the bottom of the screen, powered by the **YouTube IFrame API**. It streams audio directly from YouTube — no downloads, no uploads, no storage costs.

**Controls:**

- **Play / Pause** — Start or stop the current track
- **Prev / Next** — Navigate between tracks in the playlist
- **Volume slider** — Fine-tune the audio level
- **Mute toggle** — Instantly silence and un-silence
- **Seek bar** — Click or drag to jump to any point in the track
- **Video toggle** — Click the spinning vinyl art to reveal/hide the actual YouTube video frame

**Background Audio Watchdog:** Even when you switch tabs or blur the browser window, Shipyard tries to keep your music playing uninterrupted. A background watchdog detects when Chrome or YouTube tries to pause a hidden-tab video and forces it to resume.

---

### Aesthetic and Design

- **Glassmorphism UI** — Frosted-glass panels with `backdrop-blur` and translucent borders
- **Radial vignette mask** — Images are softly dissolved into the black canvas at the edges
- **Monospace typography** — Entire UI uses `JetBrains Mono` for a coder-native feel
- **Animated vinyl** — The album thumbnail spins like a record when a track is playing
- **Pulse indicator** — A live green dot breathes in the player status bar
- **Responsive layout** — Works cleanly on mobile, tablet, and desktop

---

### Live IST Clock

A real-time clock in the top-left corner displays the current **Indian Standard Time** — always accurate, always ticking.

---

### YouTube Playlist Link

A direct link to the source YouTube playlist is always visible in the top-right corner for quick access.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/TakshPatel02/shipyard-fm.git
cd shipyard-fm

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| [Next.js 16](https://nextjs.org/) | React framework & routing |
| [React 19](https://react.dev/) | UI components |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) | Music streaming |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics |
| [Google Fonts](https://fonts.google.com/) | Inter + JetBrains Mono |

---

## Project Structure

```
shipyard/
├── app/
│   ├── components/
│   │   ├── Clock.tsx          # Live IST clock
│   │   └── MusicPlayer.tsx    # Full YouTube music player
│   ├── lib/
│   │   ├── music-data.ts      # Track list — add your songs here
│   │   └── banner-data.ts     # Time-slot background images & logic
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout + SEO metadata
│   └── page.tsx               # Main page
├── public/
│   ├── shipyard-1.webp        # Morning background
│   ├── shipyard-2.webp        # Afternoon background
│   ├── shipyard-3.webp        # Evening background
│   ├── shipyard-4.webp        # Night background
│   └── shipyard-5.webp        # Late night background
└── package.json
```

---

## Adding Your Own Music

All tracks are defined in [`app/lib/music-data.ts`](./app/lib/music-data.ts). Adding a new song is a 3-step process:

### Step 1 — Get the YouTube Video ID

Every YouTube video has a unique ID. You can grab it two ways:

**From the full URL:**

```
https://www.youtube.com/watch?v=9a4izd3Rvdw
                                 ^^^^^^^^^^^
                              This is the video ID
```

**From the share link:**

```
https://youtu.be/9a4izd3Rvdw
                 ^^^^^^^^^^^
              This is the video ID
```

### Step 2 — Add the Track to `music-data.ts`

Open [`app/lib/music-data.ts`](./app/lib/music-data.ts) and add a new entry to the `TRACKS` array:

```typescript
export const TRACKS: Track[] = [
  // ... existing tracks ...

  // Add your track here
  { id: "9a4izd3Rvdw", title: "Challa", artist: "Rabbi Shergill" },
];
```

Each track object has three fields:

| Field    | Type     | Description             |
| -------- | -------- | ----------------------- |
| `id`     | `string` | The YouTube video ID    |
| `title`  | `string` | The song name           |
| `artist` | `string` | The artist name         |

### Step 3 — Test Locally Before Pushing

> **WARNING: Not all YouTube videos can play inside an iframe.**
> YouTube restricts embedding for many videos due to licensing, artist settings, or regional restrictions.
> If a video is blocked, the player will automatically skip to the next track — but you won't know unless you test it first.

Always run the dev server and verify your song actually plays before pushing:

```bash
npm run dev
# Open http://localhost:3000 and navigate to your track
```

Once confirmed working, push your changes and deploy:

```bash
git add app/lib/music-data.ts
git commit -m "feat: add [Song Name] by [Artist]"
git push
```

---

## Inspiration

Shipyard was inspired by [saloon.wtf](https://saloon.wtf) — a beautiful ambient coding space. Built as a personal take on the same idea with a focus on Indian music and IST-aware backgrounds.

---

## Author

**Taksh Patel**
[takshpatel.vercel.app](https://takshpatel.vercel.app) · [@TakshPatel02](https://github.com/TakshPatel02)

---

## License

This project is open-source. Feel free to fork it, customize the track list, swap out the backgrounds, and make it your own cozy corner of the internet.