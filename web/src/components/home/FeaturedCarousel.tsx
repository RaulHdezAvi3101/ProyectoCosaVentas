"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Listing } from "@/types/marketplace";
import { formatPrice } from "@/lib/marketplace/format";
import { primaryImageUrl } from "@/lib/marketplace/images";

const DRAG_THRESHOLD_PX = 10;

export function FeaturedCarousel({ listings }: { listings: Listing[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el || listings.length === 0) return;
    const slideWidth = el.clientWidth;
    if (slideWidth <= 0) return;
    const index = Math.round(el.scrollLeft / slideWidth);
    setActiveIndex(Math.min(Math.max(0, index), listings.length - 1));
  }, [listings.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateActiveIndex, { passive: true });

    const ro = new ResizeObserver(() => updateActiveIndex());
    ro.observe(el);
    updateActiveIndex();

    return () => {
      el.removeEventListener("scroll", updateActiveIndex);
      ro.disconnect();
    };
  }, [updateActiveIndex]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const slideWidth = el.clientWidth;
      if (slideWidth <= 0) return;
      const clamped = Math.min(Math.max(0, index), listings.length - 1);
      el.scrollTo({
        left: clamped * slideWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
      setActiveIndex(clamped);
    },
    [listings.length, reducedMotion],
  );

  const scrollByDirection = useCallback(
    (direction: -1 | 1) => {
      scrollToIndex(activeIndex + direction);
    },
    [activeIndex, scrollToIndex],
  );

  const onSlidePointerDown = (clientX: number) => {
    dragRef.current = { active: true, moved: false, startX: clientX };
  };

  const onSlidePointerMove = (clientX: number) => {
    if (!dragRef.current.active) return;
    if (Math.abs(clientX - dragRef.current.startX) >= DRAG_THRESHOLD_PX) {
      dragRef.current.moved = true;
    }
  };

  const onSlidePointerEnd = () => {
    dragRef.current.active = false;
  };

  const onSlideClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved) {
      e.preventDefault();
    }
    dragRef.current.moved = false;
  };

  if (listings.length === 0) return null;

  return (
    <section className="mb-6" aria-label="Productos destacados">
      <div className="relative w-full">
        <div
          ref={scrollRef}
          className={`scrollbar-none flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch] ${reducedMotion ? "" : "scroll-smooth"}`}
        >
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="w-full shrink-0 grow-0 basis-full snap-center snap-always"
            >
              <Link
                href={`/listings/${listing.id}`}
                className="block"
                draggable={false}
                onPointerDown={(e) => onSlidePointerDown(e.clientX)}
                onPointerMove={(e) => onSlidePointerMove(e.clientX)}
                onPointerUp={onSlidePointerEnd}
                onPointerCancel={onSlidePointerEnd}
                onClick={onSlideClick}
              >
                <article className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:border-accent/40">
                  <div className="relative aspect-[16/9] lg:aspect-[2/1]">
                    <Image
                      src={primaryImageUrl(listing.imageUrls)}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 1280px"
                      priority={listing.id === listings[0]?.id}
                      draggable={false}
                    />
                    {listing.status === "live" && (
                      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-white animate-pulseLive">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        LIVE
                      </span>
                    )}
                    {listing.status === "locked" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                        Reclamado
                      </span>
                    )}
                    {listing.firstToClaim && listing.status !== "locked" && (
                      <span className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-dark">
                        <Zap className="h-3.5 w-3.5" />
                        First to Claim
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-base font-semibold text-ink lg:text-lg">
                      {listing.title}
                    </p>
                    <p className="mt-1 text-lg font-bold text-ink">
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>

        {listings.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scrollByDirection(-1)}
              disabled={activeIndex === 0}
              className="absolute left-2 top-[calc(50%-2rem)] z-10 hidden -translate-y-1/2 rounded-full border border-black/10 bg-white/90 p-2 shadow-sm transition hover:bg-white disabled:opacity-40 lg:block"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-ink" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection(1)}
              disabled={activeIndex === listings.length - 1}
              className="absolute right-2 top-[calc(50%-2rem)] z-10 hidden -translate-y-1/2 rounded-full border border-black/10 bg-white/90 p-2 shadow-sm transition hover:bg-white disabled:opacity-40 lg:block"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 text-ink" />
            </button>

            <div className="mt-3 flex justify-center gap-1.5">
              {listings.map((listing, i) => (
                <button
                  key={listing.id}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-6 bg-accent"
                      : "w-2 bg-black/20 hover:bg-black/30"
                  }`}
                  aria-label={`Ir al destacado ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
