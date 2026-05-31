"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/Input";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { MARKETPLACE_PATH } from "@/lib/constants";

interface RegisterFormProps {
  nextPath?: string;
}

export function RegisterForm({ nextPath }: RegisterFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          handle,
          email,
          password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo crear la cuenta.");
        return;
      }

      router.push(safeRedirectPath(nextPath));
      router.refresh();
    } catch {
      setError("No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const loginHref = nextPath
    ? `/auth/login?next=${encodeURIComponent(nextPath)}`
    : "/auth/login";

  return (
    <Card className="mx-auto w-full max-w-md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Crear cuenta
          </h1>
          <p className="text-sm text-ink/70">
            Regístrate para publicar y comprar en mio.
          </p>
        </div>

        <Input
          label="Nombre para mostrar"
          name="displayName"
          autoComplete="name"
          required
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />

        <Input
          label="Usuario"
          name="handle"
          autoComplete="username"
          required
          pattern="[a-z0-9_]{3,30}"
          title="3–30 caracteres: letras minúsculas, números o guion bajo"
          value={handle}
          onChange={(event) => setHandle(event.target.value.toLowerCase())}
        />

        <Input
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <p className="text-xs text-ink/60">Mínimo 8 caracteres.</p>

        <FormError message={error} />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>

        <p className="text-center text-sm text-ink/70">
          ¿Ya tienes cuenta?{" "}
          <Link href={loginHref} className="font-medium text-brand">
            Iniciar sesión
          </Link>
        </p>

        <p className="text-center text-sm">
          <Link href={MARKETPLACE_PATH} className="text-ink/60 hover:text-brand">
            Volver a explorar
          </Link>
        </p>
      </form>
    </Card>
  );
}
