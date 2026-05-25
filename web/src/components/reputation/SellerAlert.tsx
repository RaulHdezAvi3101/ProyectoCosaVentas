import { AlertTriangle, Sparkles, type LucideIcon } from "lucide-react";
import type { SellerAlertInfo, SellerAlertKind } from "@/lib/seller-alerts";
import { cn } from "@/lib/utils";

interface SellerAlertProps {
  alert: SellerAlertInfo;
  compact?: boolean;
}

const VARIANTS: Record<
  SellerAlertKind,
  {
    Icon: LucideIcon;
    compactClass: string;
    fullClass: string;
    titleClass: string;
    role: "status" | "alert";
  }
> = {
  new: {
    Icon: Sparkles,
    compactClass: "bg-teal-light text-teal-dark",
    fullClass: "border-teal/30 bg-teal-light",
    titleClass: "text-teal-dark",
    role: "status",
  },
  low_reputation: {
    Icon: AlertTriangle,
    compactClass: "bg-amber-light text-amber-dark",
    fullClass: "border-amber/40 bg-amber-light",
    titleClass: "text-amber-dark",
    role: "alert",
  },
};

export function SellerAlert({ alert, compact }: SellerAlertProps) {
  const { Icon, compactClass, fullClass, titleClass, role } = VARIANTS[alert.kind];

  if (compact) {
    return (
      <p
        className={cn(
          "mt-2 flex items-start gap-1.5 rounded-lg px-2 py-1.5 text-[11px] leading-snug",
          compactClass
        )}
        role={role}
      >
        <Icon className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span>
          <strong>{alert.title}:</strong> {alert.message}
        </span>
      </p>
    );
  }

  return (
    <div className={cn("rounded-xl border p-4", fullClass)} role={role}>
      <div className={cn("flex items-center gap-2 text-sm font-semibold", titleClass)}>
        <Icon className="h-4 w-4" aria-hidden />
        {alert.title}
      </div>
      <p className="mt-2 text-sm text-ink/90">{alert.message}</p>
      <p className="mt-2 text-xs text-muted">{alert.hint}</p>
    </div>
  );
}
