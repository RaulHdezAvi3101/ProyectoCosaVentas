"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MIN_PHOTOS } from "@/lib/camera/constants";

export function useMinPhotosGuard(
  photoCount: number,
  redirectTo = "/sell/camera/capture",
): boolean {
  const router = useRouter();

  useEffect(() => {
    if (photoCount < MIN_PHOTOS) {
      router.replace(redirectTo);
    }
  }, [photoCount, redirectTo, router]);

  return photoCount >= MIN_PHOTOS;
}
