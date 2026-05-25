import Image from "next/image";
import Link from "next/link";
import { GripVertical, RotateCcw } from "lucide-react";
import { SellPublishForm } from "@/components/sell/SellPublishForm";

import { SEED_IMAGES } from "@/lib/listings/seed-catalog";

const mockPhotos = [
  SEED_IMAGES.cardsA.replace("w=800", "w=400").replace("h=800", "h=400"),
  SEED_IMAGES.cardsB.replace("w=800", "w=400").replace("h=800", "h=400"),
];

export default function SellPreviewPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">Tus fotos</h1>
      <p className="text-sm text-muted">
        Arrastra para ordenar · la primera es la principal (placeholder Fase 3)
      </p>

      <ul className="mt-6 space-y-3">
        {mockPhotos.map((url, i) => (
          <li
            key={url}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-2"
          >
            <GripVertical className="h-5 w-5 text-subtle" />
            <div className="relative h-20 w-20 overflow-hidden rounded-lg">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Foto {i + 1}
                {i === 0 && (
                  <span className="ml-2 text-xs text-accent-dark">Principal</span>
                )}
              </p>
            </div>
            <Link
              href="/sell/camera/capture"
              className="flex items-center gap-1 text-xs text-muted"
            >
              <RotateCcw className="h-3 w-3" />
              Retomar
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-xl border border-accent/30 bg-accent-light p-4">
        <p className="text-xs font-semibold text-accent-dark">
          Publicar en vivo (PostgreSQL)
        </p>
        <p className="mt-1 text-xs text-muted">
          Requiere sesión de vendedor. Crea un listing LIVE con First to Claim.
        </p>
      </div>

      <SellPublishForm />
    </main>
  );
}
