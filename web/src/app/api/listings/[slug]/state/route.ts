import { NextResponse } from "next/server";
import { getClaimStore } from "@/server/claim";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const store = await getClaimStore();

  if (!(await store.listingSupportsRealtime(slug))) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const state = await store.getState(slug);
  if (!state) {
    return NextResponse.json({ error: "No runtime state" }, { status: 404 });
  }

  return NextResponse.json(state);
}
