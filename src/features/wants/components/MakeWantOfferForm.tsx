"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatPriceMxn } from "@/lib/listings/format-price";
import type { WantOffer } from "@/types/wants";

interface SellerListingOption {
  id: string;
  title: string;
  price: number;
}

interface MakeWantOfferFormProps {
  wantSlug: string;
  targetPrice: number;
  listings: SellerListingOption[];
  existingOffer?: WantOffer;
}

export function MakeWantOfferForm({
  wantSlug,
  targetPrice,
  listings,
  existingOffer,
}: MakeWantOfferFormProps) {
  const router = useRouter();
  const [price, setPrice] = useState(
    existingOffer
      ? String(existingOffer.price / 100)
      : String(targetPrice / 100),
  );
  const [message, setMessage] = useState(existingOffer?.message ?? "");
  const [listingSlug, setListingSlug] = useState(existingOffer?.listingId ?? "");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    const priceNumber = Number.parseFloat(price.replace(",", "."));

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("Ingresa un precio ofertado válido.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/wants/${wantSlug}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceCents: Math.round(priceNumber * 100),
          message,
          listingSlug: listingSlug || undefined,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo enviar la oferta.");
        return;
      }

      router.refresh();
    } catch {
      setError("No se pudo enviar la oferta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-1 font-display text-lg font-semibold text-ink">
        {existingOffer ? "Actualizar tu oferta" : "Hacer oferta directa"}
      </h2>
      <p className="mb-4 text-sm text-ink/70">
        Precio objetivo del comprador:{" "}
        <strong>{formatPriceMxn(targetPrice)}</strong>
      </p>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          label="Tu precio (MXN)"
          name="price"
          type="number"
          inputMode="decimal"
          min="1"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />

        {listings.length > 0 ? (
          <Select
            label="Vincular publicación (opcional)"
            name="listingSlug"
            value={listingSlug}
            onChange={(event) => setListingSlug(event.target.value)}
          >
            <option value="">Sin publicación vinculada</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title} — {formatPriceMxn(listing.price)}
              </option>
            ))}
          </Select>
        ) : (
          <p className="text-sm text-ink/60">
            No tienes publicaciones activas para vincular.{" "}
            <Link href="/sell" className="text-brand no-underline hover:underline">
              Publica un artículo
            </Link>
            .
          </p>
        )}

        <Textarea
          label="Mensaje al comprador"
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="Describe el artículo, tiempos de envío, negociación…"
        />

        {error ? <FormError message={error} /> : null}

        <Button type="submit" disabled={loading}>
          {loading
            ? "Enviando…"
            : existingOffer
              ? "Actualizar oferta"
              : "Enviar oferta"}
        </Button>
      </form>
    </Card>
  );
}
