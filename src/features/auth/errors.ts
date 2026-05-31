export class AuthError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Correo o contraseña incorrectos.",
  emailTaken: "Ese correo ya está registrado.",
  handleTaken: "Ese nombre de usuario ya está en uso.",
  invalidInput: "Revisa los datos del formulario.",
  unauthorized: "Debes iniciar sesión.",
} as const;
