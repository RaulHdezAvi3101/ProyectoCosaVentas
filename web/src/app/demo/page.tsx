import Link from "next/link";
import { DEMO_PHRASE, PLATFORM_NAME } from "@/lib/marketplace/constants";

const steps = [
  {
    n: 1,
    title: "Feed",
    href: "/",
    desc: "Tarjetas con badge LIVE y First to Claim.",
  },
  {
    n: 2,
    title: "Listing estrella",
    href: "/listings/live-charizard",
    desc: "Abre en 2 pestañas: contador «mirando» en tiempo real.",
  },
  {
    n: 3,
    title: "Reclamar (real-time)",
    href: "/listings/live-charizard/claim",
    desc: `Pestaña A: «${DEMO_PHRASE}» gana. Pestaña B (incógnito): pierde al instante.`,
  },
  {
    n: 4,
    title: "Pago simulado",
    href: "/checkout/live-charizard",
    desc: "Copy de escrow 72 h sin pasarela real.",
  },
  {
    n: 5,
    title: "Publicar",
    href: "/sell/camera",
    desc: "Onboarding cámara → viewfinder → preview (Fase 1 UI).",
  },
  {
    n: 6,
    title: "Inbox vendedor",
    href: "/seller/inbox",
    desc: "Ganador real + countdown 30 min desde el servidor.",
  },
  {
    n: 7,
    title: "Reputación",
    href: "/profile/seller-1",
    desc: "Score Elite · toca el badge para bottom-sheet.",
  },
  {
    n: 8,
    title: "Reclamado (seed)",
    href: "/listings/listing-locked",
    desc: "Listing pre-bloqueado en datos seed.",
  },
  {
    n: 9,
    title: "Vendedor nuevo",
    href: "/listings/listing-sofia-nuevo",
    desc: "Alerta teal: sin ventas ni historial verificado.",
  },
  {
    n: 10,
    title: "Baja reputación",
    href: "/listings/listing-raul-baja-rep",
    desc: "Alerta ámbar: score bajo y métricas de riesgo.",
  },
  {
    n: 11,
    title: "Perfil — vendedor nuevo",
    href: "/profile/seller-3",
    desc: "Sofía Primeras Ventas · tier Nuevo · 0 ventas · alerta teal.",
  },
  {
    n: 12,
    title: "Perfil — reputación baja",
    href: "/profile/seller-4",
    desc: "Raúl Outlet · tier Bajo · score 142 · reseñas mixtas.",
  },
];

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold">Guía de demo — Fase 2</h1>
      <p className="mt-2 text-sm text-muted">
        Recorrido sugerido para {PLATFORM_NAME} (~5 min). Requiere{" "}
        <code className="rounded bg-black/5 px-1">npm run dev</code> (servidor
        custom con Socket.io).
      </p>

      <div className="mt-4 rounded-lg border border-teal/30 bg-teal-light p-4 text-sm text-teal-dark">
        <strong>Prueba clave:</strong> dos pestañas en{" "}
        <Link href="/listings/live-charizard/claim" className="underline">
          claim
        </Link>
        . Usa ventana privada para un segundo comprador (otro{" "}
        <code className="rounded bg-black/5 px-1">guest_id</code>).
      </div>

      <ol className="mt-8 space-y-4">
        {steps.map((s) => (
          <li key={s.n} className="rounded-xl border border-black/10 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent-dark">
                {s.n}
              </span>
              <div>
                <Link href={s.href} className="font-semibold text-accent-dark underline">
                  {s.title}
                </Link>
                <p className="mt-1 text-sm text-muted">{s.desc}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 rounded-lg bg-amber-light p-4 text-xs text-amber-dark">
        <strong>Fase 2 incluye:</strong> WebSockets, lock atómico en servidor,
        contador LIVE. <strong>Pendiente:</strong> pagos Conekta, PostgreSQL,
        Redis en producción, push/email.
      </p>
    </main>
  );
}
