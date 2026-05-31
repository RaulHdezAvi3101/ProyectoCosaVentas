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

interface LoginFormProps {
  nextPath?: string;
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar sesión.");
        return;
      }

      router.push(safeRedirectPath(nextPath));
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const registerHref = nextPath
    ? `/auth/register?next=${encodeURIComponent(nextPath)}`
    : "/auth/register";

  return (
    <Card className="mx-auto w-full max-w-md">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-ink">
            Iniciar sesión
          </h1>
          <p className="text-sm text-ink/70">
            Accede a tu cuenta para vender y comprar.
          </p>
        </div>

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
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <FormError message={error} />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Entrando…" : "Entrar"}
        </Button>

        <p className="text-center text-sm text-ink/70">
          ¿No tienes cuenta?{" "}
          <Link href={registerHref} className="font-medium text-brand">
            Crear cuenta
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
