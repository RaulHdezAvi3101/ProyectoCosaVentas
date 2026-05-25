import Link from "next/link";
import { Camera, Shield } from "lucide-react";

export default function CameraOnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-light">
          <Camera className="h-10 w-10 text-accent-dark" />
        </div>
        <h1 className="mt-6 text-xl font-bold">¿Por qué pedimos la cámara?</h1>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Las fotos deben tomarse en el momento. Así evitamos fraudes con imágenes
          de internet y generamos confianza entre comprador y vendedor.
        </p>
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-teal-light p-4 text-left text-sm text-teal-dark">
          <Shield className="h-5 w-5 shrink-0" />
          <span>Sin acceso a galería en la versión final del producto.</span>
        </div>
      </div>
      <Link
        href="/sell/camera/capture"
        className="mb-4 w-full rounded-full bg-accent py-4 text-center text-sm font-semibold text-white"
      >
        Continuar
      </Link>
      <Link
        href="/sell/camera/denied"
        className="text-center text-xs text-muted underline"
      >
        (Demo) Ver pantalla de permiso denegado
      </Link>
    </main>
  );
}
