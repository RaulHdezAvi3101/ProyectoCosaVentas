"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { SoldOverlay } from "@/components/ui/Overlays";
import { PaymentCountdown } from "@/features/checkout/components/PaymentCountdown";
import { formatPriceMxn } from "@/lib/listings/format-price";
import { MARKETPLACE_PATH } from "@/lib/constants";
import type { Listing, Seller } from "@/types/marketplace";
import type { CheckoutOrderStatus } from "@/features/checkout/types";

interface CheckoutFormProps {
  listing: Listing;
  seller: Seller;
  paymentDeadline: number;
  initialOrderStatus: CheckoutOrderStatus;
  initialPaidAt?: number;
}

export function CheckoutForm({
  listing,
  seller,
  paymentDeadline,
  initialOrderStatus,
  initialPaidAt,
}: CheckoutFormProps) {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paidAt, setPaidAt] = useState(initialPaidAt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(
    initialOrderStatus === "pending" && paymentDeadline <= Date.now(),
  );

  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const priceLabel = formatPriceMxn(
    Math.round(listing.price * 100),
    listing.currency,
  );

  const handleExpired = useCallback(() => {
    setExpired(true);
  }, []);

  async function handlePay() {
    if (submitting || orderStatus === "paid" || expired) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${listing.id}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotency_key: idempotencyKey }),
      });

      const payload = (await response.json()) as {
        error?: string;
        paidAt?: number;
      };

      if (!response.ok) {
        setError(payload.error ?? "No se pudo procesar el pago.");
        return;
      }

      setOrderStatus("paid");
      setPaidAt(payload.paidAt ?? Date.now());
      router.refresh();
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const isPending = orderStatus === "pending";
  const showPayActions = isPending && !expired;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-6 py-8 pb-32 sm:pb-8">
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
        <span className="text-ink/70">Pago</span>
      </nav>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        Completar pago
      </h1>
      <p className="mt-2 text-ink/70">
        Confirma tu compra antes de que expire el plazo de reserva.
      </p>

      {orderStatus === "paid" ? (
        <div className="mt-6">
          <SoldOverlay
            title="¡Pago confirmado!"
            description={
              paidAt
                ? `Pagado el ${new Intl.DateTimeFormat("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(paidAt))}.`
                : "Tu compra quedó registrada."
            }
          />
        </div>
      ) : null}

      <Card className="mt-6">
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
            <h2 className="font-display text-xl font-semibold text-ink">
              {listing.title}
            </h2>
            <p className="mt-1 text-sm text-ink/60">Vendedor: {seller.name}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-brand">
              {priceLabel}
            </p>
          </div>
        </div>
      </Card>

      {isPending ? (
        <PaymentCountdown
          className="mt-6"
          deadlineMs={paymentDeadline}
          onExpired={handleExpired}
        />
      ) : null}

      {error ? (
        <div className="mt-4">
          <FormError message={error} />
        </div>
      ) : null}

      {expired && isPending ? (
        <div className="mt-4">
          <FormError message="El plazo expiró. La publicación volverá a estar disponible pronto." />
        </div>
      ) : null}

      <div className="mt-auto hidden flex-col gap-3 pt-8 sm:flex">
        {orderStatus === "paid" ? (
          <>
            <Button href={`/listings/${listing.id}`} variant="primary" className="w-full">
              Ver publicación
            </Button>
            <Button href={MARKETPLACE_PATH} variant="secondary" className="w-full">
              Seguir explorando
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              disabled={submitting || expired}
              onClick={handlePay}
            >
              {submitting ? "Procesando…" : `Pagar ${priceLabel}`}
            </Button>
            <Button href={`/listings/${listing.id}`} variant="secondary" className="w-full">
              Volver a la publicación
            </Button>
          </>
        )}
      </div>

      {showPayActions ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(17,17,17,0.08)] backdrop-blur-sm sm:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          role="region"
          aria-label="Confirmar pago"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{listing.title}</p>
              <p className="text-lg font-semibold tabular-nums text-brand">
                {priceLabel}
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              className="min-h-12 shrink-0 px-5"
              disabled={submitting}
              onClick={handlePay}
            >
              {submitting ? "Procesando…" : "Pagar"}
            </Button>
          </div>
        </div>
      ) : null}

      {orderStatus === "paid" ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-ink/10 bg-card/95 px-4 py-3 backdrop-blur-sm sm:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Button href={`/listings/${listing.id}`} variant="primary" className="w-full">
            Ver publicación
          </Button>
          <Button href={MARKETPLACE_PATH} variant="secondary" className="w-full">
            Seguir explorando
          </Button>
        </div>
      ) : null}

      {isPending && expired ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-card/95 px-4 py-3 backdrop-blur-sm sm:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <Button href={MARKETPLACE_PATH} variant="primary" className="w-full">
            Seguir explorando
          </Button>
        </div>
      ) : null}
    </section>
  );
}
