"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Listing } from "@/types/marketplace";

export function ListingDetailActions({
  listing,
  locked = false,
}: {
  listing: Listing;
  locked?: boolean;
}) {
  if (locked || listing.status === "locked") {
    return (
      <p className="mt-6 text-center text-sm text-muted">
        Artículo no disponible
      </p>
    );
  }

  if (listing.firstToClaim) {
    return (
      <Link
        href={`/listings/${listing.id}/claim`}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-semibold text-white"
      >
        <MessageCircle className="h-5 w-5" />
        Enviar frase para reclamar
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="mt-6 w-full rounded-full border border-black/15 py-4 text-sm font-semibold text-muted"
    >
      Contactar vendedor (próximamente)
    </button>
  );
}
