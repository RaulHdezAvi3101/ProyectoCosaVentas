"use client";

import { Sparkles } from "lucide-react";

export function ReleasedOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-accent/90 px-6 text-center text-white">
      <Sparkles className="mb-3 h-10 w-10" />
      <p className="text-lg font-bold">¡Liberado!</p>
      <p className="mt-2 text-sm text-white/90">
        El ganador no pagó a tiempo. Ya puedes reclamar de nuevo.
      </p>
    </div>
  );
}
