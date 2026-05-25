"use client";

import Link from "next/link";
import { useState } from "react";
import { Grid3x3 } from "lucide-react";

export default function CapturePage() {
  const [shots, setShots] = useState(0);
  const maxShots = 2;

  return (
    <main className="relative mx-auto min-h-screen max-w-lg bg-ink">
      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-zinc-800 to-zinc-900">
        <div
          className="pointer-events-none absolute inset-8 border-2 border-white/40 rounded-lg"
          aria-hidden
        />
        <Grid3x3 className="pointer-events-none absolute inset-0 h-full w-full text-white/15" />
        <p className="absolute bottom-24 left-0 right-0 text-center text-xs text-white/80">
          Fondo neutro = más ventas
        </p>
        <p className="absolute top-4 left-4 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
          Mock viewfinder · {shots}/{maxShots} fotos
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 to-transparent pb-10 pt-16">
        <button
          type="button"
          onClick={() => setShots((s) => Math.min(s + 1, maxShots))}
          className="h-[72px] w-[72px] rounded-full border-4 border-white bg-white/20"
          aria-label="Capturar"
        />
        {shots >= maxShots ? (
          <Link
            href="/sell/preview"
            className="rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white"
          >
            Revisar fotos →
          </Link>
        ) : (
          <p className="text-xs text-white/70">Toca para capturar (simulado)</p>
        )}
        <Link href="/sell/camera" className="text-xs text-white/60 underline">
          Cancelar
        </Link>
      </div>
    </main>
  );
}
