import { NextResponse } from "next/server";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { markOrderPaidByListingSlug } from "@/server/jobs/mark-order-paid";
import { prisma } from "@/server/db";

/** `id` = slug del listing (misma URL que checkout) */
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!isSessionUser(session)) return session;

  const listing = await prisma.listing.findUnique({
    where: { slug: params.id },
    include: {
      reservations: {
        where: { releasedAt: null },
        take: 1,
      },
    },
  });

  const reservation = listing?.reservations[0];
  if (!reservation) {
    return NextResponse.json(
      { error: "No hay reserva activa para este listing" },
      { status: 400 }
    );
  }

  if (reservation.winnerId !== session.id) {
    return NextResponse.json(
      { error: "Solo el ganador puede registrar el pago" },
      { status: 403 }
    );
  }

  const result = await markOrderPaidByListingSlug(params.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "No se pudo registrar el pago" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, status: "paid" });
}
