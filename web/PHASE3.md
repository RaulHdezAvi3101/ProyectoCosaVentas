# Fase 3 — Fundación local (PostgreSQL + Redis + persistencia)

> **Objetivo:** Datos y First-to-Claim que sobreviven reinicios, lock atómico en Redis, usuarios locales (sin Clerk/Supabase cloud por ahora). Todo corre en Docker en tu máquina.

**Prerrequisito:** Fase 2 operativa (`npm run dev` con `server.ts` + Socket.io).

**Duración estimada:** 3–5 semanas (1 dev), en 4 entregas incrementales.

---

## Tabla de contenidos

1. [Qué resuelve vs Fase 2](#qué-resuelve-vs-fase-2)
2. [Stack local](#stack-local)
3. [Arquitectura](#arquitectura)
4. [Infra: Docker Compose](#infra-docker-compose)
5. [Schema PostgreSQL (Prisma)](#schema-postgresql-prisma)
6. [Contrato `ClaimStore`](#contrato-claimstore)
7. [Auth local (sin Clerk)](#auth-local-sin-clerk)
8. [API y rutas nuevas](#api-y-rutas-nuevas)
9. [Cambios en código existente](#cambios-en-código-existente)
10. [Estructura de carpetas](#estructura-de-carpetas)
11. [Variables de entorno](#variables-de-entorno)
12. [Scripts npm](#scripts-npm)
13. [Plan de implementación por entregas](#plan-de-implementación-por-entregas)
14. [Seed y migración desde mock](#seed-y-migración-desde-mock)
15. [Criterios de aceptación](#criterios-de-aceptación)
16. [Fuera de alcance (Fase 4+)](#fuera-de-alcance-fase-4)
17. [Riesgos](#riesgos)

---

## Qué resuelve vs Fase 2

| Problema Fase 2 | Solución Fase 3 |
|-----------------|-----------------|
| Reiniciar `npm run dev` pierde ganador e intentos | Persistir en PostgreSQL |
| Lock solo en `Map` (una instancia) | `Redis SET key NX EX` atómico |
| `guest_id` en localStorage sin cuenta | Tabla `users` + sesión cookie |
| Listings solo en `mock/data.ts` | CRUD en DB; feed lee Prisma |
| Timer 30 min solo visual | Job BullMQ en Redis libera listing |
| Frase en memoria del proceso | Columna `claim_phrase_hash` (bcrypt), nunca en cliente si oculta |

---

## Stack local

| Componente | Tecnología | Puerto default |
|------------|------------|----------------|
| App | Next 14 + `server.ts` (igual Fase 2) | 3000 |
| DB | PostgreSQL 16 | 5432 |
| Cache / lock / colas | Redis 7 | 6379 |
| ORM | Prisma 5 | — |
| Jobs | BullMQ 5 (worker en mismo repo) | — |
| Auth | Sesión HTTP-only + bcrypt (sin OAuth cloud) | — |

**No incluye en Fase 3:** Clerk, Supabase cloud, Conekta, Cloudflare R2, Fastify separado (opcional en Fase 4).

---

## Arquitectura

```mermaid
flowchart TB
  subgraph client [Browser]
    Pages[Next App Router]
    WSClient[Socket.io Client]
  end

  subgraph node [server.ts]
    NextHandler[Next HTTP]
    SocketIO[Socket.io]
    Worker[BullMQ Worker]
  end

  subgraph data [Local Docker]
    PG[(PostgreSQL)]
    Redis[(Redis)]
  end

  Pages --> NextHandler
  WSClient --> SocketIO
  NextHandler --> Prisma
  SocketIO --> ClaimService
  ClaimService --> Prisma
  ClaimService --> RedisLock
  Worker --> Prisma
  Worker --> Redis
  Prisma --> PG
  RedisLock --> Redis
  BullMQ --> Redis
```

**Flujo First-to-Claim (Fase 3):**

1. Cliente emite `claim:attempt` (igual Fase 2).
2. `ClaimService.tryClaim()`:
   - Valida frase contra hash en PG.
   - `SET listing:{id}:winner {userId} NX EX 1800` en Redis.
   - Si `NX` OK → transacción PG: `listing.status = locked`, insert `claim_attempt`, `reservation`.
   - Si `NX` falla → `lost`.
3. Broadcast `listing:locked` + persistencia ya reflejada en `GET /api/.../state`.
4. Job `payment-expired` (delay 30 min) → si no hay `order.paid` → `listing.status = live`, borrar clave Redis, emit WS `listing:released`.

---

## Infra: Docker Compose

Archivo nuevo: [`docker-compose.yml`](../docker-compose.yml) en la raíz `ProyectoCosaVentas/`.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: cosaventas
      POSTGRES_PASSWORD: cosaventas
      POSTGRES_DB: cosaventas
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

Comandos:

```bash
# Desde ProyectoCosaVentas/
docker compose up -d
docker compose ps
```

---

## Schema PostgreSQL (Prisma)

Archivo: `web/prisma/schema.prisma`

### Modelos

```prisma
enum ListingStatus {
  draft
  active
  live
  locked
  sold
}

enum UserRole {
  buyer
  seller
  admin
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  displayName   String
  handle        String   @unique
  avatarUrl     String?
  role          UserRole @default(buyer)
  createdAt     DateTime @default(now())
  listings      Listing[]       @relation("SellerListings")
  claimAttempts ClaimAttempt[]
  reservations  Reservation[]   @relation("WinnerReservations")
  sellerProfile SellerProfile?
}

model SellerProfile {
  id              String @id @default(cuid())
  userId          String @unique
  user            User   @relation(fields: [userId], references: [id])
  score           Int    @default(0)
  tier            String @default("nuevo")
  sales           Int    @default(0)
  positiveRate    Float  @default(0)
  onTimeShipping  Float  @default(0)
  memberSince     String
}

model Listing {
  id              String        @id @default(cuid())
  slug            String        @unique  // ej. live-charizard (URL estable)
  sellerId        String
  seller          User          @relation("SellerListings", fields: [sellerId], references: [id])
  title           String
  description     String
  priceCents      Int
  currency        String        @default("MXN")
  category        String
  condition       String
  imageUrls       String[]      // URLs mock o /uploads local en Fase 4
  status          ListingStatus @default(active)
  firstToClaim    Boolean       @default(false)
  claimPhraseHash String?       // bcrypt; null si no FTC
  phraseHidden    Boolean       @default(false)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  claimAttempts   ClaimAttempt[]
  reservations    Reservation[]
}

model ClaimAttempt {
  id          String   @id @default(cuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  phrasePreview String // truncado, no la frase completa
  isWinner    Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([listingId, createdAt])
}

model Reservation {
  id                String   @id @default(cuid())
  listingId         String   @unique
  listing           Listing  @relation(fields: [listingId], references: [id])
  winnerId          String
  winner            User     @relation("WinnerReservations", fields: [winnerId], references: [id])
  lockedAt          DateTime @default(now())
  paymentDeadlineAt DateTime
  releasedAt        DateTime?
  bullJobId         String?  // idempotencia BullMQ
}

model Order {
  id            String   @id @default(cuid())
  reservationId String   @unique
  status        String   @default("pending") // pending | paid | cancelled
  createdAt     DateTime @default(now())
  paidAt        DateTime?
}
```

### Notas de diseño

- **`slug`:** Mantener IDs de URL actuales (`live-charizard`) vía seed, no romper rutas de demo.
- **Frase:** Guardar `bcrypt.hash(phrase)`; comparar en servidor con `bcrypt.compare`. Nunca devolver frase en API si `phraseHidden`.
- **Viewers:** Siguen en Redis (`listing:{id}:viewers` INCR/DECR) — no hace falta persistir cada segundo en PG.
- **Reviews:** Quedan en mock o tabla mínima en Entrega 4; prioridad es listings + claim.

---

## Contrato `ClaimStore`

Abstraer [`src/server/claim-store.ts`](src/server/claim-store.ts) actual en una interfaz para poder testear y cambiar backends.

```typescript
// src/server/claim/claim-store.interface.ts
export interface ClaimStore {
  joinRoom(listingId: string): Promise<ListingStateSnapshot | null>;
  leaveRoom(listingId: string): Promise<void>;
  getState(listingId: string): Promise<ListingStateSnapshot | null>;
  tryClaim(input: TryClaimInput): Promise<ClaimAttemptResult>;
  getInboxForSeller(sellerId: string): Promise<InboxChat[]>;
  listingSupportsRealtime(listingId: string): Promise<boolean>;
}
```

### Implementación compuesta (producción local)

| Método | Redis | PostgreSQL |
|--------|-------|------------|
| `joinRoom` / `leaveRoom` | INCR/DECR viewers | — |
| `getState` | viewers + cache winner key | listing.status, reservation |
| `tryClaim` | `SET NX` winner | transacción attempt + reservation |
| `getInbox` | — | query `ClaimAttempt` |

Archivos:

- `src/server/claim/memory-claim-store.ts` — mover lógica actual (tests / fallback `USE_MEMORY_STORE=1`)
- `src/server/claim/redis-claim-store.ts` — lock NX
- `src/server/claim/prisma-claim-store.ts` — persistencia
- `src/server/claim/composite-claim-store.ts` — orquesta ambos
- `src/server/claim/index.ts` — export singleton `getClaimStore()`

`socket-handlers.ts` y API routes importan solo `getClaimStore()`, no el `Map` directo.

### Redis keys

| Key | TTL | Uso |
|-----|-----|-----|
| `listing:{slug}:winner` | 1800 s | userId ganador (lock NX) |
| `listing:{slug}:viewers` | — | contador entero |
| `bull:payment-expired:{reservationId}` | — | idempotencia job |

---

## Auth local (sin Clerk)

Enfoque mínimo para beta local:

1. **Registro / login** en `/auth/login` y `/auth/register` (form email + password).
2. **Sesión:** cookie `cosaventas_session` (httpOnly, sameSite=lax), valor = signed JWT o session id en Redis/DB.
3. **Librerías:** `bcryptjs`, `jose` (JWT) o `iron-session`.
4. **Middleware** [`middleware.ts`](middleware.ts): rutas protegidas `/sell/*`, `/seller/inbox` requieren sesión.
5. **Migración guest:** Si hay `cosaventas_guest_id` en localStorage, al registrarse vincular intentos previos por `guestId` → `userId` (columna opcional `legacyGuestId` en User o tabla puente).

### Usuarios seed (dev)

| Email | Password | Rol |
|-------|----------|-----|
| `maria@local.dev` | `demo1234` | seller (seller-1) |
| `comprador@local.dev` | `demo1234` | buyer |

Script `prisma/seed.ts` crea estos usuarios y listings equivalentes al mock.

**Socket.io:** En `listing:join` y `claim:attempt`, enviar `userId` de sesión si existe; si no, seguir permitiendo `guestId` solo en dev (`ALLOW_GUEST_CLAIM=true`).

---

## API y rutas nuevas

### REST (Route Handlers)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/listings` | Lista paginada (feed) |
| GET | `/api/listings/[slug]` | Detalle por slug |
| GET | `/api/listings/[slug]/state` | Ya existe; leer de `ClaimStore` |
| POST | `/api/listings` | Crear listing (auth seller) |
| PATCH | `/api/listings/[slug]` | Editar (owner) |
| GET | `/api/seller/inbox` | Ya existe; query Prisma |
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuario actual |

### Páginas App Router a tocar

| Ruta | Cambio |
|------|--------|
| `/` | `getListings()` desde Prisma |
| `/listings/[id]` | `id` = slug; datos PG + WS |
| `/listings/[id]/claim` | Requiere login opcional; `userId` en WS |
| `/seller/inbox` | Filtrar por `session.userId` |
| `/sell/preview` | POST crear listing (sin R2: URLs placeholder) |
| Nuevas `/auth/login`, `/auth/register` | Formularios |

---

## Cambios en código existente

| Archivo | Acción |
|---------|--------|
| [`src/server/claim-store.ts`](src/server/claim-store.ts) | Deprecar → delegar a `composite-claim-store` |
| [`src/server/socket-handlers.ts`](src/server/socket-handlers.ts) | `async` handlers; `await getClaimStore()` |
| [`src/mock/data.ts`](src/mock/data.ts) | Mantener solo para seed script y fallback dev |
| [`src/lib/identity/useGuestIdentity.ts`](src/lib/identity/useGuestIdentity.ts) | Combinar con `useSession()` |
| [`src/lib/socket/useListingRoom.ts`](src/lib/socket/useListingRoom.ts) | Enviar `userId` si hay sesión |
| [`server.ts`](server.ts) | Iniciar worker BullMQ en `prepare()` |
| [`package.json`](package.json) | deps: prisma, @prisma/client, ioredis, bullmq, bcryptjs, jose |

---

## Estructura de carpetas

```
ProyectoCosaVentas/
├── docker-compose.yml
└── web/
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   └── migrations/
    ├── src/
    │   ├── server/
    │   │   ├── claim/
    │   │   │   ├── claim-store.interface.ts
    │   │   │   ├── composite-claim-store.ts
    │   │   │   ├── redis-claim-store.ts
    │   │   │   └── index.ts
    │   │   ├── jobs/
    │   │   │   ├── payment-expired.worker.ts
    │   │   │   └── queues.ts
    │   │   ├── db.ts              # Prisma singleton
    │   │   ├── redis.ts           # ioredis singleton
    │   │   └── socket-handlers.ts
    │   ├── lib/
    │   │   ├── auth/
    │   │   │   ├── session.ts
    │   │   │   └── password.ts
    │   │   └── listings/
    │   │       └── queries.ts
    │   └── app/
    │       ├── api/auth/...
    │       └── auth/login, register/
    ├── .env.example
    └── PHASE3.md
```

---

## Variables de entorno

Archivo `web/.env.example`:

```env
DATABASE_URL="postgresql://cosaventas:cosaventas@localhost:5432/cosaventas"
REDIS_URL="redis://localhost:6379"
SESSION_SECRET="change-me-local-dev-only-min-32-chars"
ALLOW_GUEST_CLAIM="true"
USE_MEMORY_STORE="false"
NODE_ENV="development"
```

Copiar a `web/.env` (gitignored).

---

## Scripts npm

Añadir en `web/package.json`:

```json
{
  "scripts": {
    "db:up": "docker compose -f ../docker-compose.yml up -d",
    "db:down": "docker compose -f ../docker-compose.yml down",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

`prisma.seed` en package.json → `tsx prisma/seed.ts`.

Raíz [`package.json`](../package.json) opcional:

```json
"db:up": "docker compose up -d",
"db:setup": "npm run db:up && npm run db:migrate --prefix web && npm run db:seed --prefix web"
```

---

## Plan de implementación por entregas

### Entrega 1 — Infra + Prisma + seed (≈3–5 días)

- [ ] `docker-compose.yml` + `.env.example`
- [ ] Prisma schema + migración inicial
- [ ] `prisma/seed.ts`: users, seller profiles, listings (slugs = mock ids)
- [ ] `src/server/db.ts`, `src/lib/listings/queries.ts`
- [ ] Feed `/` y `/listings/[slug]` leen PG (mock como fallback si `DATABASE_URL` ausente)
- [ ] Scripts `db:*` documentados en README

**Verificación:** `npm run db:setup` → feed muestra Charizard desde PG.

---

### Entrega 2 — Redis lock + ClaimStore compuesto (≈5–7 días)

- [ ] `src/server/redis.ts`
- [ ] Interfaz `ClaimStore` + `composite-claim-store`
- [ ] Portar `tryClaim` a Redis NX + escritura PG en transacción
- [ ] Viewers en Redis (no en `Map`)
- [ ] API `state` e inbox async
- [ ] `socket-handlers` async
- [ ] Tests manuales: 2 pestañas + reiniciar servidor → ganador sigue en PG/Redis

**Verificación:** Reinicio Node → listing sigue `locked`; Redis vacío tras `docker compose down` requiere re-sync desde PG (script o leer reservation al boot).

---

### Entrega 3 — Auth local + protección rutas (≈4–6 días)

- [ ] `/auth/login`, `/auth/register`, API auth
- [ ] `middleware.ts` para seller routes
- [ ] `useSession` + ClaimPanel envía `userId`
- [ ] Inbox filtra por seller logueado
- [ ] POST `/api/listings` (crear borrador/live)
- [ ] Vincular guest → user opcional

**Verificación:** Login `maria@local.dev` → inbox solo sus listings; comprador B no puede “ganar” como mismo user A en dos browsers sin dos cuentas.

---

### Entrega 4 — BullMQ timer 30 min (≈3–5 días)

- [ ] Cola `payment-expired` al ganar
- [ ] Worker en `server.ts` (mismo proceso en local)
- [ ] Al expirar: `listing.status = live`, delete Redis winner, WS `listing:released`
- [ ] Checkout mock: `POST /api/orders/[id]/pay` marca paid y cancela job
- [ ] UI: overlay “liberado” + banner en inbox

**Verificación:** Job con delay corto en dev (`PAYMENT_WINDOW_MS=60000` env) libera listing automáticamente.

---

## Seed y migración desde mock

`prisma/seed.ts` debe reproducir:

| Mock id | slug | seller | FTC phrase |
|---------|------|--------|------------|
| `live-charizard` | `live-charizard` | maria | `charizard mx` |
| `listing-3` | `listing-3` | luis | `mewtwo gx` (hidden) |
| `listing-locked` | `listing-locked` | maria | locked + reservation seed |

Hash de frases en seed con mismo algoritmo que runtime.

**Estrategia de corte:** variable `DATA_SOURCE=db|mock` en servidor; por defecto `db` si `DATABASE_URL` responde.

---

## Criterios de aceptación

1. `docker compose up -d` + `npm run db:setup` + `npm run dev` sin pasos manuales extra.
2. Ganar en `/listings/live-charizard/claim` persiste en PG; reiniciar app mantiene estado locked.
3. Dos pestañas: solo un ganador; lock Redis evita doble winner bajo concurrencia simulada (script `curl` paralelo opcional).
4. Login seller ve inbox real desde `claim_attempts`.
5. Tras ventana de pago (configurable en dev), listing vuelve a `live` y WS notifica.
6. Frase oculta (`listing-3`) no aparece en HTML/JSON del cliente.

---

## Fuera de alcance (Fase 4+)

| Tema | Fase |
|------|------|
| Cámara `getUserMedia` + R2 | 4 |
| Conekta / escrow real | 5 |
| Clerk / Supabase cloud | Cuando salgas de local |
| Socket.io Redis adapter multi-instancia | Pre-producción |
| Typesense, reputación automática | 6 |
| DMs con historial completo | 4 o 6 |

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Redis y PG desincronizados tras crash | Al arrancar: reconciliar `locked` listings con clave Redis; job de sanidad |
| Prisma en hot-reload duplica conexiones | Singleton en `globalThis` (patrón Next) |
| BullMQ sin worker en prod | `server.ts` siempre importa worker en local |
| bcrypt lento en claim path | Comparar frase solo tras NX exitoso o pre-check en PG |

---

## Orden recomendado al implementar

```text
Entrega 1 → Entrega 2 → Entrega 3 → Entrega 4
     ↓           ↓           ↓           ↓
  Docker      Redis       Auth        BullMQ
  Prisma      Lock        Sessions    Timer
  Feed PG     WS async    CRUD        Release
```

Cuando apruebes este plan, la implementación puede empezar por **Entrega 1** sin tocar el plan file.
