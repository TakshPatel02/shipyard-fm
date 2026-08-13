import Clock from "./components/Clock";
import MusicPlayer from "./components/MusicPlayer";

const YOUTUBE_PLAYLIST_URL = "https://youtube.com/playlist?list=PLXR35Mhy4kZA&si=bkv8UyurhfmRPPVc";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden font-sans select-none">
      {/* Background Image */}
      <img
        src="/shipyard.png"
        alt="Shipyard Background"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-20">
        {/* Top Left: Clock */}
        <div className="flex items-center">
          <Clock />
        </div>

        {/* Top Right: YouTube Playlist Link (Portfolio Grid & Monospace Aesthetic) */}
        <nav className="flex items-center">
          <a
            href={YOUTUBE_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 font-mono text-xs text-white/90 shadow-md hover:bg-black/70 hover:border-white/25 transition-all group"
            aria-label="Open YouTube Playlist"
          >
            <span className="text-white/40 font-mono text-[10px] tracking-wider">SOURCE</span>
            <span className="w-px h-3 bg-white/15" />
            <span className="text-white/90 font-mono tracking-tight group-hover:text-white">
              youtube playlist
            </span>
            <span className="text-white/50 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
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
