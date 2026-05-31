const HANDLE_PATTERN = /^[a-z0-9_]{3,30}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeHandle(handle: string): string {
  return handle.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidHandle(handle: string): boolean {
  return HANDLE_PATTERN.test(handle);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidDisplayName(displayName: string): boolean {
  const trimmed = displayName.trim();
  return trimmed.length >= 2 && trimmed.length <= 60;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  handle: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function parseRegisterInput(body: unknown): RegisterInput {
  if (!body || typeof body !== "object") {
    throw new Error("invalid");
  }

  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? normalizeEmail(data.email) : "";
  const password = typeof data.password === "string" ? data.password : "";
  const displayName =
    typeof data.displayName === "string" ? data.displayName.trim() : "";
  const handle =
    typeof data.handle === "string" ? normalizeHandle(data.handle) : "";

  if (
    !isValidEmail(email) ||
    !isValidPassword(password) ||
    !isValidDisplayName(displayName) ||
    !isValidHandle(handle)
  ) {
    throw new Error("invalid");
  }

  return { email, password, displayName, handle };
}

export function parseLoginInput(body: unknown): LoginInput {
  if (!body || typeof body !== "object") {
    throw new Error("invalid");
  }

  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? normalizeEmail(data.email) : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (!isValidEmail(email) || password.length === 0) {
    throw new Error("invalid");
  }

  return { email, password };
}
