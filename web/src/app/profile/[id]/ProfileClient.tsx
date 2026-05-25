"use client";

import Image from "next/image";
import { useState } from "react";
import type { SessionUser } from "@/types/auth";
import type { Review, Seller } from "@/types/marketplace";
import { ProfileAccount } from "@/components/profile/ProfileAccount";
import { ScoreBadge } from "@/components/reputation/ScoreBadge";
import { ScoreSheet } from "@/components/reputation/ScoreSheet";
import { ReviewStars } from "@/components/reputation/ReviewStars";
import { SellerAlert } from "@/components/reputation/SellerAlert";
import { formatSellerActivitySummary } from "@/lib/reputation";
import { getSellerAlert } from "@/lib/seller-alerts";

export function ProfileClient({
  seller,
  reviews,
  sessionUser,
}: {
  seller: Seller;
  reviews: Review[];
  sessionUser?: SessionUser | null;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const sellerAlert = getSellerAlert(seller);
  const reviewList = Array.isArray(reviews) ? reviews : [];

  return (
    <>
      <div className="mt-6 flex flex-col items-center text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-accent-light">
          <Image src={seller.avatarUrl} alt={seller.name} fill className="object-cover" />
        </div>
        <h1 className="mt-4 text-xl font-bold">{seller.name}</h1>
        <p className="text-sm text-muted">{seller.handle}</p>
        <button type="button" onClick={() => setSheetOpen(true)} className="mt-4">
          <ScoreBadge score={seller.score} tier={seller.tier} />
        </button>
        <p className="mt-2 text-sm text-muted">{formatSellerActivitySummary(seller)}</p>
      </div>

      {sellerAlert && (
        <div className="mt-6">
          <SellerAlert alert={sellerAlert} />
        </div>
      )}

      {sessionUser && sessionUser.id === seller.id && (
        <ProfileAccount user={sessionUser} />
      )}

      <h2 className="mt-8 text-sm font-semibold">Reseñas recientes</h2>
      {reviewList.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-black/15 bg-white/60 px-4 py-6 text-center text-sm text-muted">
          Aún no hay reseñas de compradores.
        </p>
      ) : (
      <ul className="mt-3 space-y-3">
        {reviewList.map((r) => (
          <li
            key={r.id}
            className="flex gap-3 rounded-xl border border-black/10 bg-white p-3"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={r.imageUrl}
                alt={`Foto adjunta a reseña de ${r.buyer}`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {r.buyer}
                <ReviewStars rating={r.rating} />
              </p>
              <p className="text-xs text-muted">{r.date}</p>
              <p className="mt-1 text-sm">{r.text}</p>
            </div>
          </li>
        ))}
      </ul>
      )}

      <ScoreSheet
        seller={seller}
        reviews={reviewList}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
