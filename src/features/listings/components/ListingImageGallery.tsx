"use client";

import Image from "next/image";
import { useState } from "react";
import { LiveBadge } from "@/components/ui/LiveBadge";

interface ListingImageGalleryProps {
  title: string;
  imageUrls: string[];
  isLive: boolean;
}

export function ListingImageGallery({
  title,
  imageUrls,
  isLive,
}: ListingImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeUrl = imageUrls[activeIndex] ?? imageUrls[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
        {activeUrl ? (
          <Image
            key={activeUrl}
            src={activeUrl}
            alt={`${title} — foto ${activeIndex + 1}`}
            fill
            priority={activeIndex === 0}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
        ) : null}
        {isLive ? (
          <LiveBadge className="absolute left-4 top-4" />
        ) : null}
      </div>

      {imageUrls.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {imageUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-surface transition ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                index === activeIndex
                  ? "ring-2 ring-brand"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
