/** Ruta post-login al propio perfil (no un vendedor fijo del seed). */
export const PROFILE_ME_PATH = "/profile/me";

/** Evita redirecciones abiertas: solo rutas relativas internas. */
export function safeRedirectPath(
  next: string | null | undefined,
  fallback = "/"
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/** Tras auth, envía al perfil del usuario autenticado si `next` es /profile/me. */
export function resolvePostAuthPath(
  next: string,
  userId: string | undefined
): string {
  if (next === PROFILE_ME_PATH && userId) {
    return `/profile/${userId}`;
  }
  return next;
}
