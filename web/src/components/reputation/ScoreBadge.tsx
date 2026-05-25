import { getScoreStyles, getTierLabel } from "@/lib/reputation";
import type { SellerTier } from "@/types/marketplace";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  tier: SellerTier;
  compact?: boolean;
}

export function ScoreBadge({ score, tier, compact }: ScoreBadgeProps) {
  const styles = getScoreStyles(score);

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
          styles.bg,
          styles.text,
          styles.ring
        )}
      >
        ✦ {getTierLabel(tier)} · {score}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ring-1",
        styles.bg,
        styles.text,
        styles.ring
      )}
    >
      ✦ {getTierLabel(tier)} · {score} pts
    </span>
  );
}
