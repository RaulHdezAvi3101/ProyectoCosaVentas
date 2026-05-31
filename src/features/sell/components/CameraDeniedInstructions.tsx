"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SellSectionHeader } from "@/features/sell/components/SellSectionHeader";
import { detectCameraPlatform } from "@/lib/camera/platform";

const INSTRUCTIONS = {
  ios: {
    title: "Habilita la cámara en iOS",
    steps: [
      "Abre Configuración en tu iPhone o iPad.",
      "Ve a Safari → Cámara (o la app del navegador que uses).",
      "Selecciona «Permitir».",
      "Regresa a mio y vuelve a intentar.",
    ],
    hint: "Configuración → Safari → Cámara → Permitir",
  },
  android: {
    title: "Habilita la cámara en Android",
    steps: [
      "Abre Configuración del teléfono.",
      "Apps → tu navegador (Chrome, etc.).",
      "Permisos → Cámara → Permitir.",
      "Cierra y reabre la pestaña de mio.",
    ],
    hint: "Configuración → Apps → Navegador → Permisos → Cámara",
  },
  desktop: {
    title: "Habilita la cámara en tu PC",
    steps: [
      "Haz clic en el ícono de candado o cámara en la barra de direcciones del navegador.",
      "Permite el acceso a la cámara para este sitio.",
      "En Windows: Configuración → Privacidad → Cámara → permite acceso al navegador.",
      "En macOS: Preferencias del Sistema → Privacidad → Cámara → activa tu navegador.",
      "Si usas webcam USB, verifica que esté conectada y no la use otra app (Zoom, Teams).",
      "Recarga la página e intenta de nuevo.",
    ],
    hint: "Barra de direcciones → Permisos → Cámara → Permitir",
  },
} as const;

export function CameraDeniedInstructions() {
  const platform = detectCameraPlatform();
  const copy = INSTRUCTIONS[platform];

  return (
    <section className="mx-auto max-w-xl px-6 py-10">
      <SellSectionHeader
        eyebrow="Permiso requerido"
        title={copy.title}
        description="Para publicar en mio necesitas tomar fotos en tiempo real desde tu cámara — ya sea webcam en PC o cámara del celular. Sin acceso no podemos verificar que el producto es tuyo."
      />

      <Card className="mt-8">
        <ol className="list-decimal space-y-3 pl-5 text-ink/80">
          {copy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-6 rounded-lg bg-brand/5 px-4 py-3 text-sm text-brand">
          {copy.hint}
        </p>
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/sell/camera/capture" className="flex-1">
          Intentar de nuevo
        </Button>
        <Button href="/sell/camera" variant="secondary" className="flex-1">
          Volver al inicio
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-ink/50">
        ¿Necesitas ayuda?{" "}
        <Link href="/" className="text-brand no-underline hover:underline">
          Volver al inicio
        </Link>
      </p>
    </section>
  );
}
