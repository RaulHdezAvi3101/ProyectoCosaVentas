import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Inicio
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-ink">Crear cuenta</h1>
      <p className="text-sm text-muted">
        Si reclamaste como invitado, vinculamos tus intentos al registrarte
      </p>
      <Suspense fallback={<p className="mt-6 text-sm text-muted">Cargando…</p>}>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}
