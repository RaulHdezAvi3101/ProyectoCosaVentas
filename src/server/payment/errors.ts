export class PaymentError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export class CheckoutNotFoundError extends PaymentError {
  constructor() {
    super("No hay checkout disponible para esta publicación.", 404);
    this.name = "CheckoutNotFoundError";
  }
}

export class NotWinnerError extends PaymentError {
  constructor() {
    super("Solo el ganador puede completar el pago.", 403);
    this.name = "NotWinnerError";
  }
}

export class PaymentExpiredError extends PaymentError {
  constructor() {
    super("El plazo de pago expiró.", 410);
    this.name = "PaymentExpiredError";
  }
}

export class OrderNotPayableError extends PaymentError {
  constructor() {
    super("Esta orden ya no está pendiente de pago.", 409);
    this.name = "OrderNotPayableError";
  }
}

export class InvalidIdempotencyKeyError extends PaymentError {
  constructor() {
    super("Se requiere idempotency_key válido.", 400);
    this.name = "InvalidIdempotencyKeyError";
  }
}
