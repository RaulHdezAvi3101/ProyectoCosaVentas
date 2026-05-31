"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { MARKETPLACE_PATH } from "@/lib/constants";

export function useLogout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(MARKETPLACE_PATH);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { logout, loading };
}
