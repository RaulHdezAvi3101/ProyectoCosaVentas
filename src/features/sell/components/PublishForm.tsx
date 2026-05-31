"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FirstToClaimFields } from "@/features/sell/components/FirstToClaimFields";
import { PhotoGalleryGrid } from "@/features/sell/components/PhotoGalleryGrid";
import { PublishStickyBar } from "@/features/sell/components/PublishStickyBar";
import { SellSectionHeader } from "@/features/sell/components/SellSectionHeader";
import { useCaptureSession } from "@/features/sell/context/CaptureSessionContext";
import { useMinPhotosGuard } from "@/features/sell/hooks/use-min-photos-guard";
import { parseListingPriceMxn } from "@/features/sell/lib/parse-listing-price";
import { uploadCapturedPhotos } from "@/features/sell/lib/upload-captured-photos";
import {
  LISTING_CATEGORIES,
  LISTING_CONDITIONS,
} from "@/lib/camera/constants";
import { toErrorMessage } from "@/lib/errors/to-error-message";
import { MARKETPLACE_PATH } from "@/lib/constants";
import { formatPriceMxn } from "@/lib/listings/format-price";

export function PublishForm() {
  const router = useRouter();
  const { photos, removePhoto, reorderPhotos, startRetake, clearRetake } =
    useCaptureSession();
  const hasMinPhotos = useMinPhotosGuard(photos.length);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>(LISTING_CATEGORIES[0]);
  const [condition, setCondition] = useState<string>(LISTING_CONDITIONS[0]);
  const [firstToClaim, setFirstToClaim] = useState(false);
  const [claimPhrase, setClaimPhrase] = useState("");
  const [phraseHidden, setPhraseHidden] = useState(true);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const priceNumber = parseListingPriceMxn(price);
      if (priceNumber === null) {
        setError("Ingresa un precio válido en pesos.");
        return;
      }

      const imageUrls = await uploadCapturedPhotos(photos, setUploadProgress);
      setUploadProgress("Publicando…");

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priceCents: Math.round(priceNumber * 100),
          category,
          condition,
          imageUrls,
          firstToClaim,
          claimPhrase: firstToClaim ? claimPhrase : undefined,
          phraseHidden,
        }),
      });

      const data = (await response.json()) as {
        listing?: { id: string };
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "No se pudo publicar.");
        return;
      }

      router.push(data.listing ? `/listings/${data.listing.id}` : MARKETPLACE_PATH);
      router.refresh();
    } catch (cause) {
      setError(
        toErrorMessage(cause, "No se pudo publicar. Intenta de nuevo."),
      );
    } finally {
      setLoading(false);
      setUploadProgress(undefined);
    }
  }

  function navigateToCapture() {
    clearRetake();
    router.push("/sell/camera/capture");
  }

  if (!hasMinPhotos) {
    return null;
  }

  const parsedPrice = parseListingPriceMxn(price);
  const priceLabel =
    parsedPrice !== null
      ? formatPriceMxn(Math.round(parsedPrice * 100))
      : null;
  const stickySummary =
    title.trim() || `${photos.length} foto${photos.length === 1 ? "" : "s"}`;

  return (
    <section className="mx-auto max-w-3xl px-6 py-10 pb-32 sm:pb-10">
      <SellSectionHeader
        className="mb-8"
        eyebrow="Vista previa"
        title="Revisa y publica"
        description="Arrastra las fotos para cambiar el orden. La primera será la portada de tu publicación."
      />

      <PhotoGalleryGrid
        photos={photos}
        onReorder={reorderPhotos}
        onRemove={removePhoto}
        onRetake={(photoId) => {
          startRetake(photoId);
          router.push("/sell/camera/capture");
        }}
      />

      <Card>
        <form
          id="publish-listing-form"
          className="flex flex-col gap-5"
          onSubmit={handleSubmit}
        >
          <Input
            label="Título"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={120}
            placeholder="Ej. Charizard VMAX holo mint"
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
            placeholder="Detalla estado, incluye lo que viene en la caja, tiempos de envío…"
          />

          <Input
            label="Precio (MXN)"
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
              label="Condición"
              name="condition"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            >
              {LISTING_CONDITIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <FirstToClaimFields
            enabled={firstToClaim}
            onEnabledChange={setFirstToClaim}
            claimPhrase={claimPhrase}
            onClaimPhraseChange={setClaimPhrase}
            phraseHidden={phraseHidden}
            onPhraseHiddenChange={setPhraseHidden}
          />

          {error ? <FormError message={error} /> : null}
          {uploadProgress ? (
            <p className="text-sm text-ink/60" role="status">
              {uploadProgress}
            </p>
          ) : null}

          <div className="hidden flex-col gap-3 sm:flex sm:flex-row">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Publicando…" : "Publicar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={navigateToCapture}
            >
              Agregar más fotos
            </Button>
          </div>
        </form>
      </Card>

      <PublishStickyBar
        stickySummary={stickySummary}
        priceLabel={priceLabel}
        uploadProgress={uploadProgress}
        loading={loading}
        onAddMorePhotos={navigateToCapture}
      />
    </section>
  );
}
