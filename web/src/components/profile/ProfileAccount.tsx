"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import type { SessionUser } from "@/types/auth";
import { useSession } from "@/lib/auth/useSession";

const ROLE_LABELS: Record<SessionUser["role"], string> = {
  buyer: "Comprador",
  seller: "Vendedor",
  admin: "Administrador",
};

interface ProfileAccountProps {
  user: SessionUser;
}

export function ProfileAccount({ user }: ProfileAccountProps) {
  const router = useRouter();
  const { logout } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-accent/25 bg-accent-light/40 p-4">
      <h2 className="text-sm font-semibold">Mi cuenta</h2>
      <p className="mt-1 text-sm text-muted">{user.email}</p>
      <p className="text-xs text-muted">
        {user.handle} · {ROLE_LABELS[user.role]}
      </p>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        Cerrar sesión
      </button>
    </section>
  );
}
