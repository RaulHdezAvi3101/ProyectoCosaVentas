# Checkout (Fase 5)

| Pieza | Ubicación |
|-------|-----------|
| Estado checkout | `src/server/payment/get-checkout-state.ts` |
| Pago simulado | `src/server/payment/pay-order.ts` |
| Marcar vendido | `src/server/payment/mark-order-paid.ts` |
| UI | `src/features/checkout/components/` |
| Ruta | `/checkout/[slug]` |

Guards en page RSC: sesión, ganador, deadline no expirado.

API:

- `GET /api/checkout/[slug]`
- `POST /api/orders/[slug]/pay` — body `{ idempotency_key }`

Ledger futuro: [docs/LEDGER-DESIGN.md](../../docs/LEDGER-DESIGN.md).
