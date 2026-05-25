"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Clock, Trophy } from "lucide-react";
import type { InboxChat } from "@/types/marketplace";
import { formatCountdown } from "@/lib/marketplace/countdown";
import { primaryImageUrl } from "@/lib/marketplace/images";

export function SellerInboxClient() {
  const [chats, setChats] = useState<InboxChat[]>([]);
  const [listingMeta, setListingMeta] = useState<
    Record<string, { imageUrl: string }>
  >({});
  const [, setTick] = useState(0);
  const fetchedSlugs = useRef(new Set<string>());

  useEffect(() => {
    const load = () => {
      fetch("/api/seller/inbox", { credentials: "include" })
        .then((res) => {
          if (res.status === 401) {
            window.location.href = "/auth/login?next=/seller/inbox";
            return null;
          }
          return res.json();
        })
        .then((data: { chats: InboxChat[] } | null) => {
          if (!data) return;
          setChats(data.chats ?? []);
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slugs = Array.from(new Set(chats.map((c) => c.listingId)));
    for (const slug of slugs) {
      if (fetchedSlugs.current.has(slug)) continue;
      fetchedSlugs.current.add(slug);

      fetch(`/api/listings/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((listing: { imageUrls?: string[] } | null) => {
          if (!listing?.imageUrls?.length) return;
          setListingMeta((prev) => ({
            ...prev,
            [slug]: { imageUrl: primaryImageUrl(listing.imageUrls!) },
          }));
        })
        .catch(() => {});
    }
  }, [chats]);

  useEffect(() => {
    const hasTimer = chats.some(
      (c) => c.status === "winner" && c.paymentDeadline
    );
    if (!hasTimer) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [chats]);

  const hasExpired = chats.some((c) => c.paymentExpired);

  return (
    <>
      {hasExpired && (
        <div className="mt-4 rounded-xl border border-coral/30 bg-coral-light px-4 py-3 text-sm text-coral-dark">
          Al menos un ganador no pagó a tiempo — el listing volvió a estar LIVE.
        </div>
      )}
      <ul className="mt-6 space-y-3">
        {chats.length === 0 && (
          <li className="rounded-xl border border-black/10 bg-white p-6 text-center text-sm text-muted">
            Aún no hay intentos de reclamo. Abre el listing LIVE en otra pestaña y
            envía la frase.
          </li>
        )}
        {chats.map((chat) => {
          const isWinner = chat.status === "winner" && !chat.paymentExpired;
          const expired = chat.paymentExpired;
          const thumb = listingMeta[chat.listingId]?.imageUrl;
          return (
            <li key={chat.id}>
              <Link
                href={`/listings/${chat.listingId}/claim`}
                className={`flex gap-3 rounded-xl border p-4 ${
                  expired
                    ? "border-coral/40 bg-coral-light"
                    : isWinner
                      ? "border-teal/40 bg-teal-light"
                      : "border-black/10 bg-white"
                }`}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5">
                  {thumb && (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{chat.name}</p>
                    {expired ? (
                      <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white">
                        EXPIRÓ
                      </span>
                    ) : isWinner ? (
                      <span className="flex items-center gap-1 rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-white">
                        <Trophy className="h-3 w-3" aria-hidden />
                        GANADOR
                      </span>
                    ) : (
                      <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] text-muted">
                        Llegó tarde
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">{chat.preview}</p>
                  {isWinner && chat.paymentDeadline && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-teal-dark">
                      <Clock className="h-3 w-3" aria-hidden />
                      Pago pendiente ·{" "}
                      {formatCountdown(chat.paymentDeadline)}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
