import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shipyard-fm.vercel.app"),
  title: {
    default: "Shipyard | Cozy Coding Space with Music",
    template: "%s | Shipyard",
  },
  description:
    "Shipyard is a cozy, time-aware developer workspace that shifts with the time of day, paired with a minimal YouTube-playlist music player. Built by Taksh Patel, inspired by saloon.wtf.",
  keywords: [
    "Shipyard",
    "Taksh Patel",
    "Lofi Coding Room",
    "Ambient Music Player",
    "YouTube Playlist Player",
    "Developer Workspace",
    "Cozy Coding App",
    "Time-based Background",
    "Next.js Project",
    "saloon.wtf inspired",
  ],
  authors: [{ name: "Taksh Patel", url: "https://takshpatel.vercel.app" }],
  creator: "Taksh Patel",
  publisher: "Taksh Patel",
  category: "Technology",
  openGraph: {
    type: "website",
    url: "https://shipyard-fm.vercel.app",
    siteName: "Shipyard",
    title: "Shipyard | Cozy Coding Space with Music",
    description:
      "Shipyard is a cozy, time-aware developer workspace that shifts with the time of day, paired with a minimal YouTube-playlist music player.",
    images: [
      {
        url: "https://res.cloudinary.com/portfolioblog/image/upload/v1786714085/shipyard-og-image_oaussz.webp",
        width: 1920,
        height: 1080,
        alt: "Shipyard — Cozy Coding Space",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipyard | Cozy Coding Space with Music",
    description:
      "Shipyard is a cozy, time-aware developer workspace that shifts with the time of day, paired with a minimal YouTube-playlist music player.",
    images: [
      "https://res.cloudinary.com/portfolioblog/image/upload/v1786714085/shipyard-og-image_oaussz.webp",
    ],
    creator: "@TakshPatel02",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="h-full font-sans antialiased bg-black text-white selection:bg-white/20">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
