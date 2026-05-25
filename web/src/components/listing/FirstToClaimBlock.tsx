import { Zap } from "lucide-react";
import type { Listing } from "@/types/marketplace";

function resolvePhraseLabel(listing: Listing): string | null {
  if (!listing.firstToClaim || listing.status === "locked") return null;
  if (listing.phrase && !listing.phraseHidden) return listing.phrase;
  if (listing.phraseHidden) return "●●●●●●●●";
  return "secreta (no en catálogo demo)";
}

export function FirstToClaimBlock({ listing }: { listing: Listing }) {
  const phrase = resolvePhraseLabel(listing);
  if (!phrase) return null;

  return (
    <div className="mt-4 rounded-xl border border-accent/30 bg-accent-light p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-accent-dark">
        <Zap className="h-4 w-4" aria-hidden />
        First to Claim
      </div>
      <p className="mt-1 text-xs text-muted">
        Frase clave: <strong>{phrase}</strong>
      </p>
    </div>
  );
}
