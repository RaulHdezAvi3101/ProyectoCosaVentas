# SQL dumps (handoff)

Archivos generados por `npm run db:dump` desde `DATABASE_URL` en `.env`.

| Archivo | Contenido |
|---------|-----------|
| `mio-schema.sql` | Solo DDL (tablas, enums, índices) |
| `mio-data.sql` | Solo datos |
| `mio-full.sql` | Esquema + datos + `_prisma_migrations` |

## Uso

```bash
# Restaurar demo completo (base vacía)
psql "$DATABASE_URL" -f prisma/dumps/mio-full.sql

# o
npm run db:restore
```

Regenerar después de `npm run db:seed` si quieres actualizar el snapshot demo.

## Política

- No incluir dumps de instancias con datos de producción en el repositorio.
- `mio-full.sql` en este repo es **solo demo local** (password `demo1234`).
- Ver [docs/DATA-AND-SEED.md](../../docs/DATA-AND-SEED.md).
