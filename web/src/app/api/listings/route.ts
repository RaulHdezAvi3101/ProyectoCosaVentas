import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { isSessionUser, requireSession } from "@/lib/auth/require-session";
import { createListingForSeller } from "@/lib/listings/create";

export async function POST(request: Request) {
  const session = await requireSession([UserRole.seller, UserRole.admin]);
  if (!isSessionUser(session)) return session;

  try {
    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const price = Number(body.price);
    const category = String(body.category ?? "Coleccionables").trim();
    const condition = String(body.condition ?? "Usado").trim();

    if (!title || !description || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Título, descripción y precio válidos son requeridos" },
        { status: 400 }
      );
    }

    if (price > 999_999) {
      return NextResponse.json(
        { error: "El precio máximo permitido es $999,999" },
        { status: 400 }
      );
    }

    const firstToClaim = Boolean(body.firstToClaim);
    if (firstToClaim && !String(body.phrase ?? "").trim()) {
      return NextResponse.json(
        { error: "Frase clave requerida para First to Claim" },
        { status: 400 }
      );
    }

    const allowedStatuses = new Set(["draft", "active", "live"]);
    const status =
      typeof body.status === "string" && allowedStatuses.has(body.status)
        ? (body.status as "draft" | "active" | "live")
        : undefined;

    const listing = await createListingForSeller(session.id, {
      title,
      description,
      price,
      category,
      condition,
      imageUrls: Array.isArray(body.imageUrls)
        ? body.imageUrls
            .filter((u: unknown) => typeof u === "string" && u.trim().length > 0)
            .map((u: string) => u.trim())
        : undefined,
      firstToClaim,
      phrase: body.phrase ? String(body.phrase) : undefined,
      phraseHidden: Boolean(body.phraseHidden),
      status,
    });

    return NextResponse.json({ listing: { id: listing.slug, slug: listing.slug } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear publicación";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
