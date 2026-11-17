import type { Metadata } from "next";
import PlayerClient from "../components/PlayerClient";

export const metadata: Metadata = {
  title: "Player | Shipyard",
  description: "Curated ambient and lofi music player with modern arc carousel.",
};

export default function PlayerPage() {
  return <PlayerClient />;
}
