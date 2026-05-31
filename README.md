# mio (rebuild)

Marketplace C2C de coleccionables — México. Reconstrucción procedural desde cero con capas claras y sin deuda de iteraciones anteriores.

**Idioma UI:** español (México) · **Moneda:** MXN

## Documentación

### Fases de implementación

| Fase | Doc | Entrega |
|------|-----|---------|
| 0 | [docs/PHASE-0-SKELETON.md](docs/PHASE-0-SKELETON.md) | Monorepo, Docker, health, rutas placeholder |
| 1 | [docs/PHASE-1-AUTH-PROFILES.md](docs/PHASE-1-AUTH-PROFILES.md) | Auth cookie + perfiles |
| 2 | [docs/PHASE-2-LISTINGS-FEED.md](docs/PHASE-2-LISTINGS-FEED.md) | Listings + `/explore` |
| 3 | [docs/PHASE-3-FIRST-TO-CLAIM.md](docs/PHASE-3-FIRST-TO-CLAIM.md) | Redis lock + WebSockets |
| 4 | [docs/PHASE-4-CAMERA-PUBLISH.md](docs/PHASE-4-CAMERA-PUBLISH.md) | Cámara + R2 |
| 5 | [docs/PHASE-5-PAYMENTS-TIMERS.md](docs/PHASE-5-PAYMENTS-TIMERS.md) | Checkout + timers |
| 6 | [docs/PHASE-6-PRD-REMAINDER.md](docs/PHASE-6-PRD-REMAINDER.md) | DMs, reseñas, pasarela |

### Stack (fijo)

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

