import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SellSectionHeader } from "@/features/sell/components/SellSectionHeader";
import { MIN_PHOTOS, MAX_PHOTOS } from "@/lib/camera/constants";

export default function SellCameraPage() {
  return (
    <section className="mx-auto max-w-xl px-6 py-10">
      <SellSectionHeader
        eyebrow="Permisos"
        title="Prepara tu cámara"
        description="Funciona en celular, tablet o PC con webcam. Solo pedimos acceso cuando pulses el botón — nunca antes."
      />

      <Card className="mt-8 space-y-3">
        <p className="font-medium text-ink">Antes de continuar:</p>
        <ul className="list-disc space-y-2 pl-5 text-ink/80">
          <li>Busca buena luz y un fondo neutro.</li>
          <li>Ten listo el producto frente a la cámara.</li>
          <li>
            En PC puedes usar webcam integrada o USB; en móvil, cámara trasera
            o frontal.
          </li>
          <li>
            Necesitarás entre {MIN_PHOTOS} y {MAX_PHOTOS} fotos desde distintos
            ángulos.
          </li>
        </ul>
      </Card>

      <div className="mt-8 flex flex-col gap-3">
        <Button href="/sell/camera/capture" className="w-full">
          Abrir cámara
        </Button>
        <Button href="/sell" variant="ghost" className="w-full">
          Volver
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-ink/50">
        Si rechazas el permiso, te mostraremos cómo habilitarlo en tu
        dispositivo.{" "}
        <Link
          href="/sell/camera/denied"
          className="text-brand no-underline hover:underline"
        >
          Ver instrucciones
        </Link>
      </p>
    </section>
  );
}
