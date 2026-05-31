"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { LiveBadge } from "@/components/ui/LiveBadge";
import {
  LiveOverlay,
  LockedOverlay,
  ReleasedOverlay,
} from "@/components/ui/Overlays";
import { useListingRoom } from "@/lib/socket/useListingRoom";
import { formatPriceMxn } from "@/lib/listings/format-price";
import { MARKETPLACE_PATH } from "@/lib/constants";
import type { Listing, Seller } from "@/types/marketplace";

interface ClaimRoomProps {
  listing: Listing;
  seller: Seller;
}

function formatDeadline(deadlineMs: number): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(deadlineMs));
}

export function ClaimRoom({ listing, seller }: ClaimRoomProps) {
  const [phrase, setPhrase] = useState("");
  const { connected, snapshot, lastResult, released, submitClaim } =
    useListingRoom(listing.id);

  const priceLabel = formatPriceMxn(
    Math.round(listing.price * 100),
    listing.currency,
  );

  const runtimeStatus = snapshot?.status ?? listing.status;
  const isLive = runtimeStatus === "live" && !released;
  const isLocked = runtimeStatus === "locked" && !released;
  const canSubmit =
    connected && isLive && phrase.trim().length > 0 && lastResult?.outcome !== "won";
  const viewerCount = snapshot?.viewers ?? 0;
  const showClaimForm = lastResult?.outcome !== "won";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    submitClaim(phrase);
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-8 pb-44 sm:pb-8">
      <nav className="mb-6 text-sm text-ink/60">
        <Link href={MARKETPLACE_PATH} className="text-brand no-underline hover:underline">
          Explorar
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/listings/${listing.id}`}
          className="text-brand no-underline hover:underline"
        >
          {listing.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">Reclamar</span>
      </nav>

      <Card className="mb-6">
        <div className="flex gap-4">
          {listing.imageUrls[0] ? (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
              <Image
                src={listing.imageUrls[0]}
                alt={listing.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                {listing.title}
              </h1>
              {isLive ? <LiveBadge size="sm" /> : null}
            </div>
            <p className="mt-1 text-sm text-ink/60">Vendedor: {seller.name}</p>
            <p className="mt-2 font-display text-xl font-semibold tabular-nums text-brand">
              {priceLabel}
            </p>
            <p className="mt-2 text-sm text-ink/60" aria-live="polite">
              {connected ? (
                <>
                  Conectado en vivo
                  {viewerCount > 0
                    ? ` · ${viewerCount} ${viewerCount === 1 ? "persona viendo" : "personas viendo"}`
                    : null}
                </>
              ) : (
                "Conectando…"
              )}
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-6 flex flex-col gap-4">
        {isLive ? (
          <LiveOverlay
            title="Primero en reclamar — activo"
            description="Escribe la frase exacta del vendedor. El primero en acertar gana la reserva."
          />
        ) : null}

        {isLocked && snapshot?.winner ? (
          <LockedOverlay
            title={`Ganador: ${snapshot.winner.displayName}`}
            description={
              snapshot.paymentDeadline
                ? `Plazo de pago: ${formatDeadline(snapshot.paymentDeadline)}`
                : "Reserva activa."
            }
          />
        ) : null}

        {released ? (
          <ReleasedOverlay
            title="Reserva liberada"
            description="El plazo de pago expiró o la publicación volvió a estar disponible."
          />
        ) : null}

        {lastResult?.outcome === "won" ? (
          <div className="rounded-xl border border-brand/20 bg-brand-muted px-4 py-3 text-sm text-ink">
            <p className="font-medium">¡Ganaste la reserva!</p>
            <p className="mt-1">
              Tienes hasta{" "}
              {lastResult.paymentDeadline
                ? formatDeadline(lastResult.paymentDeadline)
                : "pronto"}{" "}
              para completar el pago.
            </p>
            <Button
              href={`/checkout/${listing.id}`}
              variant="primary"
              className="mt-3 w-full"
            >
              Ir a pagar
            </Button>
          </div>
        ) : null}

        {lastResult?.outcome === "lost" ? (
          <FormError message="Alguien reclamó antes que tú. Sigue atento por si se libera." />
        ) : null}

        {lastResult?.outcome === "invalid" ? (
          <FormError message="Frase incorrecta. Revisa e intenta de nuevo." />
        ) : null}

        {!isLive && !isLocked && !released ? (
          <FormError message="Esta publicación no está en vivo para reclamar." />
        ) : null}
      </div>

      {showClaimForm ? (
        <form
          onSubmit={handleSubmit}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-surface/95 px-4 py-4 backdrop-blur-sm sm:static sm:mt-auto sm:border-t sm:px-0 sm:pt-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <Input
            label="Frase de reclamo"
            name="phrase"
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            placeholder="Escribe la frase exacta…"
            autoComplete="off"
            disabled={!isLive}
          />
          <Button
            type="submit"
            variant="primary"
            className="mt-4 min-h-12 w-full"
            disabled={!canSubmit}
          >
            Reclamar ahora
          </Button>
        </form>
      ) : null}
    </section>
  );
}
