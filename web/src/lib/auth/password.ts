import bcrypt from "bcryptjs";

const ROUNDS = 10;
/** Límite para evitar payloads enormes en bcrypt. */
export const MAX_PASSWORD_LENGTH = 128;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `La contraseña no puede superar ${MAX_PASSWORD_LENGTH} caracteres`;
  }
  return null;
}
