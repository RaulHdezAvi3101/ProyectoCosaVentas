# Claim

First-to-Claim (Fase 3): lock Redis → transacción Prisma → Socket.io + BullMQ.

## Servidor

- `src/server/claim/` — lock, persistencia, frase, guests, reconcile
- `src/server/socket/` — `listing:join`, `claim:attempt`
- Cola `payment-expired` — libera reserva al expirar pago

## Cliente

- `src/lib/socket/useListingRoom.ts`
- `src/features/claim/components/ClaimRoom.tsx`
- Ruta `/listings/[slug]/claim`

## Simulación

```bash
# Reinicia `npm run dev` antes de probar
npx tsx scripts/simulate-claim.ts live-charizard "charizard psa9" 10
```

Ver gate en [docs/PHASE-3-FIRST-TO-CLAIM.md](../../docs/PHASE-3-FIRST-TO-CLAIM.md).
