"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { dispatchSessionRefresh } from "@/lib/auth/session-events";
import { validatePasswordStrength } from "@/lib/auth/password";
import {
  resolvePostAuthPath,
  safeRedirectPath,
} from "@/lib/auth/safe-redirect";
import { validateEmail, validateHandle } from "@/lib/auth/validation";
import { FormError } from "@/components/ui/FormError";

const GUEST_ID_KEY = "cosaventas_guest_id";

type Mode = "login" | "register";

interface AuthFormProps {
  mode: Mode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeRedirectPath(searchParams.get("next"));

  const [email, setEmail] = useState(
    mode === "login" ? "maria@local.dev" : ""
  );
  const [password, setPassword] = useState(
    mode === "login" ? "demo1234" : ""
  );
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email.trim().toLowerCase());
    if (emailError) {
      setError(emailError);
      return;
    }

    if (mode === "register") {
      const handleError = validateHandle(handle);
      if (handleError) {
        setError(handleError);
        return;
      }
      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setLoading(true);

    try {
      const legacyGuestId =
        typeof window !== "undefined"
          ? localStorage.getItem(GUEST_ID_KEY)
          : null;

      const normalizedEmail = email.trim().toLowerCase();

      const url =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: normalizedEmail, password, legacyGuestId }
          : {
              email: normalizedEmail,
              password,
              displayName,
              handle,
              legacyGuestId,
            };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        return;
      }

      if (typeof window !== "undefined" && legacyGuestId) {
        localStorage.removeItem(GUEST_ID_KEY);
      }
      const destination = resolvePostAuthPath(next, data.user?.id);
      dispatchSessionRefresh(data.user ?? null);
      router.push(destination);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {mode === "register" && (
        <>
          <div>
            <label className="text-xs font-semibold text-muted">
              Nombre para mostrar
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder="Ana Colecciones"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted">Usuario</label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              placeholder="@ana_colecciones"
            />
          </div>
        </>
      )}

      <div>
        <label className="text-xs font-semibold text-muted">Email</label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted">Contraseña</label>
        <input
          type="password"
          required
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      {error && <FormError message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link
              href={`/auth/register?next=${encodeURIComponent(next)}`}
              className="font-semibold text-accent-dark underline"
            >
              Regístrate
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link
              href={`/auth/login?next=${encodeURIComponent(next)}`}
              className="font-semibold text-accent-dark underline"
            >
              Inicia sesión
            </Link>
          </>
        )}
      </p>

      {mode === "login" && (
        <p className="rounded-xl border border-accent/20 bg-accent-light p-3 text-xs text-muted">
          Elite: <strong>maria@local.dev</strong> · Nuevo:{" "}
          <strong>sofia@local.dev</strong> · Bajo: <strong>raul@local.dev</strong>{" "}
          / <strong>demo1234</strong>
          <br />
          Comprador: <strong>comprador@local.dev</strong> /{" "}
          <strong>demo1234</strong>
        </p>
      )}
    </form>
  );
}
