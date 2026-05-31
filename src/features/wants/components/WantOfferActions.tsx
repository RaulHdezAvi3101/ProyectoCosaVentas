"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

interface WantOfferActionsProps {
  wantSlug: string;
  offerId: string;
  disabled?: boolean;
}

export function WantOfferActions({
  wantSlug,
  offerId,
  disabled = false,
}: WantOfferActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string>();

  async function respond(action: "accept" | "reject") {
    setLoading(action);
    setError(undefined);

    try {
      const response = await fetch(
        `/api/wants/${wantSlug}/offers/${offerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo actualizar la oferta.");
        return;
      }

      router.refresh();
    } catch {
      setError("No se pudo actualizar la oferta.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={disabled || loading !== null}
          onClick={() => respond("accept")}
        >
          {loading === "accept" ? "…" : "Aceptar"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || loading !== null}
          onClick={() => respond("reject")}
        >
          {loading === "reject" ? "…" : "Rechazar"}
        </Button>
      </div>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
