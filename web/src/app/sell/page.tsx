import Link from "next/link";
import { Camera, ChevronRight } from "lucide-react";

export default function SellPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">Vender un artículo</h1>
      <p className="mt-2 text-sm text-muted">
        Flujo de publicación con cámara obligatoria (mock UI).
      </p>

      <Link
        href="/sell/camera"
        className="mt-8 flex items-center gap-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light">
          <Camera className="h-6 w-6 text-accent-dark" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Nueva publicación</p>
          <p className="text-xs text-muted">Fotos en vivo · First to Claim opcional</p>
        </div>
        <ChevronRight className="h-5 w-5 text-subtle" />
      </Link>
    </main>
  );
}
