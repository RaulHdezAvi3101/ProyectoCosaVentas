"use client";

import { Button } from "@/components/ui/Button";
import { useLogout } from "@/features/auth/components/use-logout";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { logout, loading } = useLogout();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      disabled={loading}
      onClick={logout}
    >
      {loading ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
