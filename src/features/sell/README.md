# Sell

Publicación con cámara en tiempo real y upload a R2 (Fase 4).

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/sell` | Intro + CTA |
| `/sell/camera` | Onboarding permisos |
| `/sell/camera/capture` | Viewfinder + captura |
| `/sell/camera/denied` | Instrucciones por SO |
| `/sell/preview` | Galería + formulario publicación |

## Módulos

- `context/CaptureSessionContext.tsx` — fotos en memoria durante el flujo
- `components/CameraViewfinder.tsx` — `getUserMedia` + canvas
- `components/PublishForm.tsx` — upload + `POST /api/listings`

## API

- `POST /api/upload` — multipart JPEG, validación EXIF (&lt; 10 min)
- `POST /api/listings` — sesión requerida; frase FTC → bcrypt en servidor

## Cliente cámara

Ver `src/lib/camera/` — compresión ≤ 800 KB, EXIF inyectado al capturar.

## Storage

R2 si `R2_*` está configurado; si no, `public/uploads/listings/{userId}/`.
