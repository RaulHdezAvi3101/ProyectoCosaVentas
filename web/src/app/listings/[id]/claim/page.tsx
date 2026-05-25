import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClaimPageShell } from "@/components/claim/ClaimPageShell";
import { ClaimPanel } from "@/components/claim/ClaimPanel";
import { ClaimLiveHeader } from "@/components/claim/ClaimLiveHeader";
import { getListingBySlug } from "@/lib/listings/queries";
import { primaryImageUrl } from "@/lib/marketplace/images";

export default async function ClaimPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingBySlug(params.id);
  if (!listing || !listing.firstToClaim) notFound();

  const showPhrase = listing.phrase && !listing.phraseHidden;

  return (
    <ClaimPageShell listingId={listing.id}>
      <main className="mx-auto flex min-h-screen max-w-lg flex-col">
        <header className="flex items-center gap-3 border-b border-black/10 px-4 py-3">
          <Link href={`/listings/${listing.id}`} className="rounded-full p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            <Image
              src={primaryImageUrl(listing.imageUrls)}
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{listing.title}</p>
            <ClaimLiveHeader />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 pb-48">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-accent px-4 py-2 text-sm text-white">
            ¡Hola! Envía la frase exacta para reclamar este artículo.
          </div>
          <div className="mr-auto max-w-[85%] rounded-2xl rounded-tl-sm border border-black/10 bg-white px-4 py-2 text-sm text-muted">
            {showPhrase
              ? "Tip: toca el chip de abajo para autocompletar la frase."
              : "La frase es secreta — escríbela exactamente como la conoces."}
          </div>
        </div>

        <ClaimPanel
          listingId={listing.id}
          phrase={showPhrase ? listing.phrase : undefined}
          phraseHidden={listing.phraseHidden}
        />
      </main>
    </ClaimPageShell>
  );
}
