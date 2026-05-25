export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  if (!email) return "Email requerido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email no válido";
  }
  return null;
}

export function normalizeHandle(handle: string): string {
  const trimmed = handle.trim().toLowerCase();
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export function validateHandle(handle: string): string | null {
  const normalized = normalizeHandle(handle);
  if (normalized.length < 3 || normalized.length > 32) {
    return "El usuario debe tener entre 2 y 31 caracteres (sin contar @)";
  }
  if (!/^@[a-z0-9_]+$/.test(normalized)) {
    return "Solo letras minúsculas, números y guión bajo";
  }
  return null;
}
