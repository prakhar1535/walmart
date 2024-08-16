"use client";

import App from "@/components/chatbot";
import ThreeDModelVisualizer from "@/components/ThreeDvisualizer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
      
        <ThreeDModelVisualizer/>
      </div>
    </main>
  );
}
