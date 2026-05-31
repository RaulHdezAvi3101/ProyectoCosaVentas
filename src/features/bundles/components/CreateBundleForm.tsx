"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { formatPriceMxn } from "@/lib/listings/format-price";

interface SellerListingOption {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrls: string[];
}

interface CreateBundleFormProps {
  listings: SellerListingOption[];
}

export function CreateBundleForm({ listings }: CreateBundleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [pickCount, setPickCount] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const selectedListings = useMemo(
    () => listings.filter((listing) => selectedIds.includes(listing.id)),
    [listings, selectedIds],
  );

  const individualTotal = selectedListings.reduce(
    (sum, listing) => sum + listing.price,
    0,
  );

  const priceCents = Math.round(Number.parseFloat(price.replace(",", ".")) * 100);
  const parsedPickCount = pickCount.trim()
    ? Number.parseInt(pickCount, 10)
    : null;
  const savings =
    Number.isFinite(priceCents) && priceCents > 0
      ? Math.max(0, individualTotal - priceCents)
      : 0;

  function toggleListing(listingId: string) {
    setSelectedIds((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const response = await fetch("/api/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priceCents,
          listingIds: selectedIds,
          pickCount: parsedPickCount,
        }),
      });

      const data = (await response.json()) as {
        bundle?: { id: string };
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo crear el bundle.");
        return;
      }

      router.push(data.bundle ? `/bundles/${data.bundle.id}` : "/profile/me");
      router.refresh();
    } catch {
      setError("No se pudo crear el bundle. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (listings.length < 2) {
    return (
      <Card>
        <p className="text-sm text-ink/70">
          Necesitas al menos 2 publicaciones activas para crear un bundle.{" "}
          <Link href="/sell" className="text-brand no-underline hover:underline">
            Publica más artículos
          </Link>
          .
        </p>
      </Card>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">
          Bundles
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Crear bundle o lote
        </h1>
        <p className="mt-2 text-ink/70">
          Agrupa artículos con precio especial. Opcionalmente define un lote
          parcial (elige N de M).
        </p>
      </div>

      <Card>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Título del bundle"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={120}
          />

          <Textarea
            label="Descripción"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            minLength={10}
            maxLength={4000}
            rows={4}
          />

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              Artículos incluidos ({selectedIds.length} seleccionados)
            </legend>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-ink/10 p-3">
              {listings.map((listing) => (
                <label
                  key={listing.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-surface/80"
                >
                  <Checkbox
                    name={`listing-${listing.id}`}
                    checked={selectedIds.includes(listing.id)}
                    onChange={() => toggleListing(listing.id)}
                    label=""
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">
                      {listing.title}
                    </span>
                    <span className="text-xs text-ink/60">
                      {listing.category} · {formatPriceMxn(listing.price)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Precio del bundle (MXN)"
              name="price"
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
            <Input
              label="Pick-N (opcional)"
              name="pickCount"
              type="number"
              min="1"
              max={Math.max(1, selectedIds.length - 1)}
              value={pickCount}
              onChange={(event) => setPickCount(event.target.value)}
              placeholder="Ej. 2 = elige 2 de M"
            />
          </div>

          {selectedIds.length >= 2 && Number.isFinite(priceCents) ? (
            <div className="rounded-xl border border-ink/10 bg-surface/60 p-4 text-sm">
              <p className="text-ink/60">Vista previa</p>
              <p>
                Suma individual:{" "}
                <span className="line-through">
                  {formatPriceMxn(individualTotal)}
                </span>
              </p>
              <p>
                Precio bundle:{" "}
                <strong className="text-brand">
                  {formatPriceMxn(priceCents)}
                </strong>
              </p>
              {savings > 0 ? (
                <p className="text-brand">Ahorro: {formatPriceMxn(savings)}</p>
              ) : null}
              {parsedPickCount !== null &&
              parsedPickCount >= 1 &&
              parsedPickCount < selectedIds.length ? (
                <p className="mt-2 text-ink/70">
                  Modo lote parcial: el comprador elige {parsedPickCount} de{" "}
                  {selectedIds.length}.
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? <FormError message={error} /> : null}

          <Button type="submit" disabled={loading || selectedIds.length < 2}>
            {loading ? "Creando…" : "Crear bundle"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
