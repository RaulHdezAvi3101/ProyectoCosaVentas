"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { Card } from "@/components/ui/Card";
import { ListingSellerMeta } from "@/features/listings/components/ListingSellerMeta";
import { cn } from "@/lib/cn";
import { formatPriceMxn } from "@/lib/listings/format-price";
import type { Listing } from "@/types/marketplace";

interface FeaturedProductsCarouselProps {
  listings: Listing[];
}

interface CarouselMetrics {
  slideStep: number;
  maxIndex: number;
  maxTranslate: number;
  visibleSlides: number;
}

function FeaturedSlide({ listing }: { listing: Listing }) {
  const coverUrl = listing.imageUrls[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block w-36 shrink-0 no-underline sm:w-40"
    >
      <Card className="overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <div className="relative aspect-square bg-surface">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={listing.title}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink/40">
              Sin imagen
            </div>
          )}
          {listing.status === "live" ? (
            <LiveBadge size="sm" className="absolute left-1.5 top-1.5" />
          ) : null}
        </div>
        <div className="p-2.5">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-ink/60">
            {listing.category}
          </p>
          <h3 className="font-display line-clamp-2 text-xs font-semibold leading-snug text-ink group-hover:text-brand">
            {listing.title}
          </h3>
          {listing.seller ? (
            <ListingSellerMeta
              seller={listing.seller}
              size="sm"
              className="mt-1"
            />
          ) : null}
          <p className="mt-1 font-display text-sm font-semibold tabular-nums text-brand">
            {formatPriceMxn(Math.round(listing.price * 100), listing.currency)}
          </p>
        </div>
      </Card>
    </Link>
  );
}

function computeCarouselMetrics(
  trackScrollWidth: number,
  containerWidth: number,
  slideWidth: number,
  gap: number,
  total: number,
): CarouselMetrics {
  const slideStep = slideWidth + gap;
  if (slideStep <= 0 || total === 0) {
    return { slideStep: 0, maxIndex: 0, maxTranslate: 0, visibleSlides: 1 };
  }
  const maxTranslate = Math.max(0, trackScrollWidth - containerWidth);
  const visibleSlides = Math.max(1, Math.floor((containerWidth + gap) / slideStep));
  const maxIndex = Math.max(0, total - visibleSlides);
  return { slideStep, maxIndex, maxTranslate, visibleSlides };
}

function getTranslateX(
  index: number,
  maxIndex: number,
  slideStep: number,
  maxTranslate: number,
): number {
  if (slideStep <= 0) return 0;
  if (index >= maxIndex) return maxTranslate;
  return index * slideStep;
}

export function FeaturedProductsCarousel({
  listings,
}: FeaturedProductsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [metrics, setMetrics] = useState<CarouselMetrics>({
    slideStep: 0,
    maxIndex: 0,
    maxTranslate: 0,
    visibleSlides: 1,
  });
  const total = listings.length;
  const { slideStep, maxIndex, maxTranslate } = metrics;
  const pageCount = maxIndex + 1;
  const canNavigate = pageCount > 1 && slideStep > 0;

  useEffect(() => {
    const trackEl = trackRef.current;
    const containerEl = containerRef.current;
    if (!trackEl || !containerEl) return;

    function measure() {
      if (!trackEl || !containerEl) return;
      const first = trackEl.firstElementChild as HTMLElement | null;
      if (!first || first.offsetWidth === 0) return;
      const styles = getComputedStyle(trackEl);
      const gap = Number.parseFloat(styles.gap || styles.columnGap || "12");
      const next = computeCarouselMetrics(
        trackEl.scrollWidth,
        containerEl.clientWidth,
        first.offsetWidth,
        gap,
        listings.length,
      );
      setMetrics(next);
      setIndex((current) => Math.min(current, next.maxIndex));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(trackEl);
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [listings]);

  const goTo = useCallback(
    (next: number) => {
      if (!canNavigate) return;
      setIndex(((next % pageCount) + pageCount) % pageCount);
    },
    [canNavigate, pageCount],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  const translateX = getTranslateX(index, maxIndex, slideStep, maxTranslate);

  if (total === 0) {
    return null;
  }

  return (
    <section className="mb-8" aria-label="Productos destacados">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand">
            Destacados
          </p>
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            Lo más buscado
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="min-w-[3rem] text-center text-xs tabular-nums text-ink/60"
            aria-live="polite"
          >
            {index + 1} / {pageCount}
          </span>
          <button
            type="button"
            onClick={goPrev}
            disabled={!canNavigate}
            aria-disabled={!canNavigate}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-ink/10 bg-card text-sm text-ink/70 transition hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNavigate}
            aria-disabled={!canNavigate}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-ink/10 bg-card text-sm text-ink/70 transition hover:bg-surface hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Siguiente"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-ink/5 bg-card/50 p-3"
      >
        <div
          ref={trackRef}
          className="flex gap-3 transition-transform duration-300 ease-out"
          style={{
            transform:
              slideStep > 0 ? `translateX(-${translateX}px)` : undefined,
          }}
        >
          {listings.map((listing) => (
            <FeaturedSlide key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      {canNavigate ? (
        <div
          className="mt-2 flex justify-center gap-1.5"
          role="tablist"
          aria-label="Posición del carrusel"
        >
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir a la página ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index
                  ? "w-4 bg-brand"
                  : "w-1.5 bg-ink/20 hover:bg-ink/35",
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
