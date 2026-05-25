"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListingRoomContext } from "@/lib/socket/listing-room-provider";

export type ClaimOutcome = "idle" | "processing" | "won" | "lost";

interface ClaimPanelProps {
  listingId: string;
  /** Solo cuando la frase es pública en el listing */
  phrase?: string;
  phraseHidden?: boolean;
}

export function ClaimPanel({
  listingId,
  phrase,
  phraseHidden,
}: ClaimPanelProps) {
  const [message, setMessage] = useState("");
  const [outcome, setOutcome] = useState<ClaimOutcome>("idle");
  const { attemptClaim, ready, isLocked, isLoggedIn, wasReleased } =
    useListingRoomContext();

  const displayPhrase =
    phrase && !phraseHidden ? phrase : phraseHidden ? "●●●●●●●●" : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !ready || isLocked) return;

    setOutcome("processing");
    attemptClaim(trimmed, (result) => {
      if (result.outcome === "won") {
        setOutcome("won");
      } else if (result.outcome === "lost") {
        setOutcome("lost");
      } else {
        setOutcome("idle");
      }
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/10 bg-white safe-bottom">
      {wasReleased && (
        <div className="border-b border-accent/30 bg-accent-light px-4 py-3 text-center text-sm text-accent-dark">
          ⏱️ Ventana de pago expirada — el artículo se liberó. Puedes intentar de
          nuevo.
        </div>
      )}
      {outcome === "won" && (
        <div className="border-b border-teal/20 bg-teal-light px-4 py-3 text-center text-sm text-teal-dark">
          🏆 ¡Lo conseguiste! Tienes <strong>30 min</strong> para pagar.
          <Link
            href={`/checkout/${listingId}`}
            className="mt-2 block font-semibold underline"
          >
            Ir a pagar →
          </Link>
        </div>
      )}
      {outcome === "lost" && (
        <div
          className={cn(
            "border-b border-coral/20 bg-coral-light px-4 py-3 text-center text-sm text-coral-dark",
            "animate-shake"
          )}
        >
          😔 Alguien fue más rápido. ¡Sigue intentando!
        </div>
      )}
      {outcome === "processing" && (
        <div className="flex items-center justify-center gap-2 border-b border-black/5 px-4 py-3 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Procesando…
        </div>
      )}

      <div className="mx-auto max-w-lg p-4">
        {!isLoggedIn && (
          <p className="mb-2 text-center text-xs text-muted">
            Reclamando como invitado ·{" "}
            <Link
              href={`/auth/login?next=/listings/${listingId}/claim`}
              className="font-semibold text-accent-dark underline"
            >
              Inicia sesión
            </Link>{" "}
            para vincular tu cuenta
          </p>
        )}
        <p className="mb-2 text-xs text-muted">Envía la frase clave al vendedor</p>
        {displayPhrase && phrase && (
          <button
            type="button"
            onClick={() => setMessage(phrase)}
            className="mb-3 rounded-full bg-accent-light px-3 py-1 text-xs font-medium text-accent-dark"
          >
            Usar frase: {displayPhrase}
          </button>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe la frase clave…"
            className="flex-1 rounded-full border border-black/15 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            disabled={outcome === "processing" || isLocked}
          />
          <button
            type="submit"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-white disabled:opacity-50"
            aria-label="Enviar"
            disabled={outcome === "processing" || isLocked}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        {isLocked && outcome === "idle" && (
          <p className="mt-3 text-center text-xs text-coral-dark">
            Este artículo ya fue reclamado.
          </p>
        )}
      </div>
    </div>
  );
}
