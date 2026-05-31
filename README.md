# mio (rebuild)

Marketplace C2C de coleccionables — México. Reconstrucción procedural desde cero con capas claras y sin deuda de iteraciones anteriores.

**Idioma UI:** español (México) · **Moneda:** MXN

## Documentación

Toda la guía de implementación vive en [`docs/README.md`](docs/README.md).

| Documento | Propósito |
|-----------|-----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Capas, prohibiciones, `server.ts` |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | slug=id, un rol `user`, rutas |
| [docs/DATA-HANDOFF.md](docs/DATA-HANDOFF.md) | Modelo PostgreSQL, Redis, seed |
| [docs/SECURITY.md](docs/SECURITY.md) | Sesión, FTC, redirects |
| [docs/SOCKET-CONTRACT.md](docs/SOCKET-CONTRACT.md) | Eventos Socket.io |
| [PRD.md](PRD.md) | Requerimientos de producto |

## Fases de implementación

Implementar **una fase a la vez**. No avanzar sin confirmación explícita tras cerrar el *gate* de cada fase.

| Fase | Doc | Entrega |
|------|-----|---------|
| 0 | [docs/PHASE-0-SKELETON.md](docs/PHASE-0-SKELETON.md) | Monorepo, Docker, health, rutas placeholder |
| 1 | [docs/PHASE-1-AUTH-PROFILES.md](docs/PHASE-1-AUTH-PROFILES.md) | Auth cookie + perfiles |
| 2 | [docs/PHASE-2-LISTINGS-FEED.md](docs/PHASE-2-LISTINGS-FEED.md) | Listings + `/explore` |
| 3 | [docs/PHASE-3-FIRST-TO-CLAIM.md](docs/PHASE-3-FIRST-TO-CLAIM.md) | Redis lock + WebSockets |
| 4 | [docs/PHASE-4-CAMERA-PUBLISH.md](docs/PHASE-4-CAMERA-PUBLISH.md) | Cámara + R2 |
| 5 | [docs/PHASE-5-PAYMENTS-TIMERS.md](docs/PHASE-5-PAYMENTS-TIMERS.md) | Checkout + timers |
| 6 | [docs/PHASE-6-PRD-REMAINDER.md](docs/PHASE-6-PRD-REMAINDER.md) | DMs, reseñas, pasarela |

## Stack (fijo)

| Capa | Tecnología |
|------|------------|
| App | Next.js 14 App Router + TypeScript |
| Servidor | `server.ts` (Next + Socket.io + BullMQ worker) |
| BD | PostgreSQL 16 + Prisma 5 |
| Cache / locks | Redis 7 + ioredis |
| Jobs | BullMQ 5 |
| Auth v1 | Sesión HTTP-only (sin Clerk) |
| Real-time | Socket.io 4 |
| Estilos | Tailwind 3 (componentes propios, sin shadcn v1) |
| Imágenes | Cloudflare R2 |

## Comandos previstos (tras Fase 0 código)

```bash
docker compose up -d
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed    # o npm run db:restore
npm run dev
```

Ver [docs/ENV.md](docs/ENV.md) y [docs/DATA-AND-SEED.md](docs/DATA-AND-SEED.md).

## Estado actual

Solo documentación. El código de aplicación se implementa fase por fase según los docs anteriores.
