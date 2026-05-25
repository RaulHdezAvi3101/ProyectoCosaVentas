import { NextResponse } from "next/server";
import { getListingBySlug } from "@/lib/listings/queries";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const listing = await getListingBySlug(params.slug);
  if (!listing) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(listing);
}
