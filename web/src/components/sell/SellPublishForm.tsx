"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormError } from "@/components/ui/FormError";

export function SellPublishForm() {
  const router = useRouter();
  const [title, setTitle] = useState("Carta demo First to Claim");
  const [description, setDescription] = useState(
    "Publicación de prueba desde el flujo de venta."
  );
  const [price, setPrice] = useState("1500");
  const [phrase, setPhrase] = useState("mi frase clave");
  const [firstToClaim, setFirstToClaim] = useState(true);
  const [phraseHidden, setPhraseHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError("Indica un precio válido mayor a 0");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          price: priceNum,
          category: "Pokémon",
          condition: "Mint",
          firstToClaim,
          phrase: firstToClaim ? phrase : undefined,
          phraseHidden,
          status: "live",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo publicar");
        return;
      }

      router.push(`/listings/${data.listing.slug}`);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handlePublish} className="mt-6 space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted">Título</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted">Precio (MXN)</label>
        <input
          type="number"
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={firstToClaim}
          onChange={(e) => setFirstToClaim(e.target.checked)}
        />
        First to Claim
      </label>

      {firstToClaim && (
        <>
          <div>
            <label className="text-xs font-semibold text-accent-dark">
              Frase clave
            </label>
            <input
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={phraseHidden}
              onChange={(e) => setPhraseHidden(e.target.checked)}
            />
            Ocultar frase en el listing
          </label>
        </>
      )}

      {error && <FormError message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Publicar listing LIVE
      </button>
    </form>
  );
}
