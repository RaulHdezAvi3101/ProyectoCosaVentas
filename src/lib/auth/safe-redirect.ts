import { MARKETPLACE_PATH } from "@/lib/constants";

const ALLOWED_REDIRECT_PREFIXES = [
  "/explore",
  "/listings/",
  "/sell",
  "/checkout/",
  "/profile/",
  "/seller/inbox",
] as const;

export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return MARKETPLACE_PATH;
  }

  const allowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(prefix),
  );

  return allowed ? path : MARKETPLACE_PATH;
}
