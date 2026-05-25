"use client";

import { useEffect } from "react";
import { X, Clock, CheckCircle2 } from "lucide-react";
import type { Review, Seller } from "@/types/marketplace";
import {
  formatOnTimeShipping,
  formatSellerActivitySummary,
} from "@/lib/reputation";
import { ReviewStars } from "./ReviewStars";
import { ScoreBadge } from "./ScoreBadge";
import Image from "next/image";

interface ScoreSheetProps {
  seller: Seller;
  reviews: Review[];
  open: boolean;
  onClose: () => void;
}

export function ScoreSheet({ seller, reviews, open, onClose }: ScoreSheetProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="score-sheet-title"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 safe-bottom"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-surface"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="score-sheet-title" className="text-lg font-semibold">
          Reputación
        </h2>
        <div className="mt-3">
          <ScoreBadge score={seller.score} tier={seller.tier} />
        </div>
        <p className="mt-2 text-sm text-muted">{formatSellerActivitySummary(seller)}</p>
        <ul className="mt-6 space-y-3 text-sm">
          <li className="flex items-center gap-3 rounded-lg bg-surface p-3">
            <Clock className="h-5 w-5 shrink-0 text-teal" aria-hidden />
            <span>{formatOnTimeShipping(seller)}</span>
          </li>
          <li className="flex items-center gap-3 rounded-lg bg-surface p-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-teal" aria-hidden />
            <span>
              Miembro desde <strong>{seller.memberSince}</strong>
            </span>
          </li>
        </ul>
        <h3 className="mt-6 text-sm font-semibold">Últimas reseñas</h3>
        {recentReviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aún no hay reseñas públicas.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {recentReviews.map((r) => (
              <li
                key={r.id}
                className="flex gap-3 rounded-lg border border-black/5 p-2"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={r.imageUrl}
                    alt={`Foto de reseña de ${r.buyer}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold">
                    {r.buyer}
                    <ReviewStars rating={r.rating} className="ml-1 text-[10px]" />
                  </p>
                  <p className="text-xs text-muted line-clamp-2">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
