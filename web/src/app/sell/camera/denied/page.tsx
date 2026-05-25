import Link from "next/link";
import { Settings } from "lucide-react";
import { PLATFORM_NAME } from "@/lib/marketplace/constants";

export default function CameraDeniedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Settings className="h-12 w-12 text-amber" />
        <h1 className="mt-6 text-xl font-bold">Permiso de cámara necesario</h1>
        <p className="mt-3 text-sm text-muted">
          Para publicar en {PLATFORM_NAME}, habilita la cámara en la configuración
          de tu dispositivo.
        </p>
        <ol className="mt-6 w-full max-w-xs space-y-2 text-left text-sm text-muted">
          <li>1. Abre <strong>Configuración</strong></li>
          <li>2. Safari → {PLATFORM_NAME} (o tu navegador)</li>
          <li>3. <strong>Cámara</strong> → Permitir</li>
        </ol>
      </div>
      <Link
        href="/sell/camera/capture"
        className="w-full rounded-full bg-accent py-4 text-center text-sm font-semibold text-white"
      >
        Reintentar
      </Link>
    </main>
  );
}
