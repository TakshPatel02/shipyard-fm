import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classic Player",
  description: "The original time-shifting aesthetic coding room with curated music.",
};

export default function ClassicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
