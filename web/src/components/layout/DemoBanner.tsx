import Link from "next/link";

export function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-accent/20 bg-accent-light px-4 py-2 text-center text-xs text-accent-dark">
      <span className="font-semibold">Fase 3 — First to Claim (WS + DB)</span>
      <span className="mx-2 text-subtle">·</span>
      <Link href="/demo" className="underline underline-offset-2">
        Guía de demo
      </Link>
    </div>
  );
}
