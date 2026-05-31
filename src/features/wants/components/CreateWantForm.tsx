"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from "@/lib/camera/constants";

export function CreateWantForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(LISTING_CATEGORIES[0]);
  const [desiredCondition, setDesiredCondition] = useState<string>(
    LISTING_CONDITIONS[0],
  );
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    const priceNumber = Number.parseFloat(price.replace(",", "."));

    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setError("Ingresa un precio objetivo válido en pesos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/wants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          desiredCondition,
          targetPriceCents: Math.round(priceNumber * 100),
        }),
      });

      const data = (await response.json()) as {
        want?: { id: string };
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo publicar la búsqueda.");
        return;
      }

      router.push(data.want ? `/wants/${data.want.id}` : "/wants");
      router.refresh();
    } catch {
      setError("No se pudo publicar la búsqueda. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-wide text-brand">
          Want list
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Publicar lo que busco
        </h1>
        <p className="mt-2 text-ink/70">
          Describe el artículo, tu precio objetivo y el estado que aceptas. Los
          vendedores podrán hacerte ofertas directas.
        </p>
      </div>

      <Card>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="Qué busco"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={120}
            placeholder="Ej. Charizard VMAX rainbow mint"
          />

          <Textarea
            label="Descripción"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            minLength={10}
            maxLength={4000}
            rows={5}
            placeholder="Detalla edición, idioma, gradación aceptada, incluye caja…"
          />

          <Input
            label="Precio objetivo (MXN)"
            name="price"
            type="number"
            inputMode="decimal"
            min="1"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            placeholder="1500"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Categoría"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {LISTING_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>

            <Select
              label="Estado deseado"
              name="desiredCondition"
              value={desiredCondition}
              onChange={(event) => setDesiredCondition(event.target.value)}
            >
              {LISTING_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          {error ? <FormError message={error} /> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Publicando…" : "Publicar búsqueda"}
          </Button>
        </form>
      </Card>
    </section>
  );
}
