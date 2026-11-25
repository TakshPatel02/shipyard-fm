# Shipyard FM

> **Built from nostalgia, runs on music.**

A cozy developer music space with two distinct rooms — the **Music Room** (`/player`) featuring a WebGL wave canvas, 3D arc track carousel, and mood-reactive accent colors, alongside **The Original Room** (`/classic`) with IST time-aware scenes — all powered by a minimal, ad-free YouTube IFrame audio engine.

**Live at:** [shipyard-fm.vercel.app](https://shipyard-fm.vercel.app)

---

## Demo

<video src="./public/Demo.mp4" controls autoplay loop muted playsinline width="100%"></video>

> If the video player doesn't render in your viewer, you can [watch `Demo.mp4` directly](./public/Demo.mp4).

![Shipyard FM — Classic Room Preview](./public/website.png)

---

## Why Shipyard (and not just a YouTube tab)?

If you already listen to music while coding, you're probably doing it in a YouTube tab. Shipyard exists because that tab is doing a lot more than just playing audio — and most of it, you don't need.

A regular YouTube tab loads the full video player, comments, engagement data, playlist metadata, and ads — even if you're just listening in the background. That adds up over time: in a 30-minute test with the same playlist, a YouTube tab climbed from ~348MB to 557MB+.

Shipyard's tab alone stays flat around ~52MB, but counting the YouTube iframe's own background process too (visible separately in Chrome's Task Manager), Shipyard's real combined footprint is closer to ~110–130MB — still roughly 4–5x lower than a full YouTube tab doing the same job. The gap exists because Shipyard's player uses the YouTube iframe purely for audio — none of the comments, video engagement data, or ad infrastructure ever load.

If you code with music on and don't want that RAM going to a browser tab instead of your IDE or build tools, this is what Shipyard is actually for.

---

## Two Rooms, One Playlist

### 1. Music Room (`/player`) — *Best on Desktop*

The redesigned player experience built for laptops and desktops:

- **3D Arc Stack Carousel** — Scroll-wheel and click-driven vertical arc of track cards with spring physics (`motion/react`) and category WebP artwork.
- **Mood-Reactive WebGL Background** — Powered by OGL (`PatternWaves`), the dot-wave shader and UI `--accent` color smoothly transition whenever the track category changes:
  - **Spiritual** (`#F5B335`) · **Love** (`#F43F6E`) · **Sad** (`#3B6FE0`) · **Energy** (`#E63946`) · **Chill** (`#2DD4BF`)
- **Minimal Player Controller** — Play/pause, next/prev, shuffle, repeat/loop, seek scrubber, mute toggle, and full-width volume slider anchored at the bottom-left.
- **Mobile Preview Fallback** — Because mobile OSes suspend background audio in browser tabs, visiting `/player` on a phone (`pointer: coarse` + narrow viewport) shows the looping `Demo.mp4` preview, an explanation, and a **Copy link** button to open on desktop later.

### 2. The Original Room (`/classic`)

The nostalgic time-aware coding room:

- **Time-Aware IST Backgrounds** — Automatically shifts between 5 curated scenes based on **IST (Indian Standard Time)**:

| Time Slot   | Hours (IST)   | Vibe                        |
| ----------- | ------------- | --------------------------- |
| Morning     | 05:00 - 10:59 | Warm, golden light          |
| Afternoon   | 11:00 - 15:59 | Bright, productive          |
| Evening     | 16:00 - 19:59 | Golden hour glow            |
| Night       | 20:00 - 23:59 | Cool, dark, focused         |
| Late Night  | 00:00 - 04:59 | Deep dark, late-night grind |

- **Floating Glassmorphic Player & Custom Playlists** — Spinning vinyl art, live IST clock, manual `"change image"` cycle, and support for switching between the default playlist and your own custom YouTube playlist.
- **Background Audio Watchdog** — Detects when a browser attempts to pause a hidden-tab iframe and resumes playback automatically.

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
| [Next.js 16](https://nextjs.org/) | React framework & App Router |
| [React 19](https://react.dev/) | UI components |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [OGL](https://github.com/oframe/ogl) | WebGL `PatternWaves` dot-wave background |
| [Motion](https://motion.dev/) | Spring physics & UI transitions (`motion/react`) |
| [React Icons](https://react-icons.github.io/react-icons/) | Crisp UI icons |
| [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) | Audio streaming |
| [Vercel Analytics](https://vercel.com/analytics) | Usage analytics |
| [Google Fonts](https://fonts.google.com/) | Instrument Sans, Inter, JetBrains Mono & Fraunces |

---

## Project Structure

```
shipyard/
├── app/
│   ├── classic/
│   │   ├── layout.tsx                 # Classic room metadata
│   │   └── page.tsx                   # Original time-aware room
│   ├── player/
│   │   └── page.tsx                   # Music Room route & metadata
│   ├── components/
│   │   ├── Clock.tsx                  # Live IST clock
│   │   ├── CustomPlaylistPanel.tsx    # Custom YouTube playlist manager
│   │   ├── LabelSlide.tsx             # Animated CTA button label
│   │   ├── MobilePlayerFallback.tsx   # Mobile Demo.mp4 preview + Copy link
│   │   ├── MusicPlayer.tsx            # Classic floating vinyl player
│   │   ├── PatternWaves.tsx           # OGL WebGL interactive wave canvas
│   │   ├── PlayerArcStack.tsx         # 3D arc track carousel
│   │   ├── PlayerClient.tsx           # Music Room client + mobile detection
│   │   └── PlayerController.tsx       # Music Room controls
│   ├── hooks/
│   │   └── player.ts                  # Shared YouTube IFrame player hook
│   ├── lib/
│   │   ├── banner-data.ts             # Time-slot background images & logic
│   │   ├── custom-playlist.ts         # Custom playlist storage helpers
│   │   └── music-data.ts              # Track list & categories
│   ├── globals.css                    # Global styles & @property --accent
│   ├── layout.tsx                     # Root layout + SEO metadata
│   └── page.tsx                       # Landing page
├── public/
│   ├── Demo.mp4                       # New player demo video
│   ├── thumbs/                        # Category WebP thumbnails
│   ├── shipyard-1.webp .. 5.webp      # Classic IST time-slot backgrounds
│   └── website.png                    # Classic preview image
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
  { id: "9a4izd3Rvdw", title: "Challa", artist: "Rabbi Shergill", category: "energy" },
];
```

Each track object has four fields:

| Field      | Type       | Description                                                        |
| ---------- | ---------- | ------------------------------------------------------------------ |
| `id`       | `string`   | The YouTube video ID                                               |
| `title`    | `string`   | The song name                                                      |
| `artist`   | `string`   | The artist name                                                    |
| `category` | `Category` | `"spiritual" \| "love" \| "sad" \| "energy" \| "chill"`            |

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
