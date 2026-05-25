# ProyectoCosaVentas

Marketplace C2C de coleccionables.

- Especificación: [PRD.md](./PRD.md)
- **Fase 1 (mock UI):** UI estática — ver rutas en `web/src/mock/data.ts`
- **Fase 2 (real-time):** Socket.io + First to Claim en memoria (`web/server.ts`)
- **Fase 3 (local DB):** [web/PHASE3.md](./web/PHASE3.md) — PostgreSQL + Redis + auth local

```bash
# Desde la raíz del repo (recomendado)
npm run install:web
npm run dev

# O directamente en la app
cd web && npm ci && npm run dev
```

`npm ci` solo funciona donde existe `package-lock.json` — en este proyecto, dentro de `web/`, no en la raíz.

### Fase 3 — Entrega 1 (PostgreSQL + feed)

```bash
# Desde la raíz del repo
docker compose up -d
cd web && cp .env.example .env
npm run db:setup              # raíz: levanta Docker + migrate + seed
npm run dev                   # raíz, o cd web && npm run dev
```

Scripts en `web/package.json`:

| Script | Descripción |
|--------|-------------|
| `db:up` | `docker compose up -d` (Postgres + Redis) |
| `db:down` | Para contenedores |
| `db:migrate` | `prisma migrate dev` (desarrollo) |
| `db:seed` | Usuarios y listings desde el mock |
| `db:studio` | Prisma Studio |
| `db:setup` | up + migrate deploy + seed |

**Verificación Entrega 1:** tras `db:setup`, el feed en `/` muestra Charizard desde PostgreSQL (sin `DATA_SOURCE=mock`). Usuarios seed: `maria@local.dev` / `comprador@local.dev` → contraseña `demo1234`.

**Perfiles demo de reputación:**

| Perfil | URL | Login (vendedor) | Tier |
|--------|-----|------------------|------|
| Sofía — vendedor nuevo | `/profile/seller-3` | `sofia@local.dev` | `nuevo` (0 ventas) |
| Raúl — reputación baja | `/profile/seller-4` | `raul@local.dev` | `low` (score 142) |

Listings: `listing-sofia-nuevo`, `listing-raul-baja-rep` en el feed.

### Fase 3 — Entrega 2 (Redis lock + ClaimStore)

Requiere Entrega 1 (`db:setup`). Con Postgres + Redis activos y `USE_MEMORY_STORE=false`, First-to-Claim usa lock `SET NX` en Redis y persiste en PG.

**Verificación:** gana en `/listings/live-charizard/claim` → reinicia `npm run dev` → el listing sigue `locked` (PG + reconciliación Redis al arranque). Dos pestañas: solo un ganador.

### Fase 3 — Entrega 3 (auth local + sesiones en BD)

- Login: `/auth/login` — `maria@local.dev` / `demo1234` (vendedor)
- Registro: `/auth/register` — crea `User` y sesión en tabla `Session` (token opaco en cookie `cosaventas_session`)
- Logout: `POST /api/auth/logout` revoca la sesión actual; `POST /api/auth/logout-all` revoca todas las del usuario
- Rutas protegidas: `/sell/*`, `/seller/inbox` (middleware + cookie)
- Inbox usa la sesión del vendedor (ya no `?sellerId=`)
- Socket.io valida la cookie en el handshake; `claim:attempt` usa `userId` del servidor, no del cliente
- Claims con sesión; invitados solo si `ALLOW_GUEST_CLAIM=true` (poner `false` en producción / beta cerrada)
- Login y registro envían `legacyGuestId` desde `localStorage` para vincular intentos guest previos
- Perfil propio: bloque «Mi cuenta» con cerrar sesión
- Pago: `POST /api/orders/[slug]/pay` requiere sesión y que el usuario sea el ganador de la reserva
- Publicar: `/sell/preview` → POST `/api/listings`

**Variables:** `SESSION_SECRET` (≥32 caracteres), `ALLOW_GUEST_CLAIM` (`true` dev, `false` prod).

**Verificación:** login como María → inbox solo sus FTC; dos cuentas distintas para probar un solo ganador. Tras `db:migrate`, tabla `Session` en PostgreSQL.

### Fase 3 — Entrega 4 (BullMQ timer de pago)

- Cola `payment-expired` al ganar un FTC
- Worker en `server.ts` (mismo proceso)
- Sin pago: listing → `live`, Redis winner borrado, WS `listing:released`
- `POST /api/orders/[slug]/pay` cancela el job y marca `order.paid`
- UI: overlay «Liberado» + banner en inbox

**Prueba rápida:** en `web/.env` pon `PAYMENT_WINDOW_MS=60000` (1 min), reinicia `npm run dev`, gana un claim y espera — el listing vuelve a LIVE.

Detalle completo: [web/PHASE3.md](./web/PHASE3.md).
