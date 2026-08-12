import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <img
        src="/shipyard.png"
        alt="Shipyard"
        className="w-full h-full "
      />
    </div>
  );
}
