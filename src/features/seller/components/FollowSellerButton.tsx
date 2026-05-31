"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FollowSellerButtonProps {
  sellerId: string;
  initialFollowing: boolean;
  disabled?: boolean;
}

export function FollowSellerButton({
  sellerId,
  initialFollowing,
  disabled = false,
}: FollowSellerButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  async function toggleFollow() {
    setLoading(true);
    setError(undefined);

    try {
      const response = await fetch(`/api/sellers/${sellerId}/follow`, {
        method: following ? "DELETE" : "POST",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo actualizar el seguimiento.");
        return;
      }

      setFollowing(!following);
      router.refresh();
    } catch {
      setError("No se pudo actualizar el seguimiento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={following ? "secondary" : "primary"}
        size="sm"
        disabled={disabled || loading}
        onClick={toggleFollow}
      >
        {loading ? "…" : following ? "Siguiendo" : "Seguir"}
      </Button>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
