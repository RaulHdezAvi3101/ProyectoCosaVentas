import type { SessionUser } from "@/types/auth";

/** Evento del cliente para refrescar useSession tras login/registro. */
export const SESSION_REFRESH_EVENT = "cosaventas:session-refresh";

export function dispatchSessionRefresh(user?: SessionUser | null): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(SESSION_REFRESH_EVENT, { detail: { user } })
    );
  }
}
