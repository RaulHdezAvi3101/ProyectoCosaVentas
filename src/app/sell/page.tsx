import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MIN_PHOTOS, MAX_PHOTOS } from "@/lib/camera/constants";

const STEPS = [
  {
    title: "Toma fotos en vivo",
    description: "Entre 2 y 6 ángulos con tu cámara — sin galería ni archivos.",
  },
  {
    title: "Revisa y ordena",
    description: "Elige la portada y completa título, precio y descripción.",
  },
  {
    title: "Publica al marketplace",
    description: "Tu listing aparece en Explorar en cuanto confirmes.",
  },
] as const;

export default function SellPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">
        Vender
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        Publica con fotos reales
      </h1>
      <p className="mt-3 text-lg text-ink/70">
        En mio solo aceptamos imágenes tomadas en el momento con tu
        cámara — celular, tablet o webcam de PC. Así protegemos a compradores y
        vendedores de fotos robadas de internet.
      </p>

      <Card className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          ¿Por qué pedimos la cámara?
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/80">
          <li>Verificamos que el producto existe y es tuyo.</li>
          <li>Cada foto lleva marca de tiempo validada (máx. 10 min).</li>
          <li>Sin galería ni archivos descargados — solo captura en vivo.</li>
        </ul>
      </Card>

      <ol className="mt-8 space-y-4">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-ink">{step.title}</p>
              <p className="mt-0.5 text-sm text-ink/70">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/sell/camera" className="flex-1">
          Comenzar publicación
        </Button>
        <Button href="/explore" variant="secondary" className="flex-1">
          Ver marketplace
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-ink/50">
        Necesitas entre {MIN_PHOTOS} y {MAX_PHOTOS} fotos.{" "}
        <Link href="/profile/me" className="text-brand no-underline hover:underline">
          Revisa tu perfil
        </Link>
      </p>
    </section>
  );
}
