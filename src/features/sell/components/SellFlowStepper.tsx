"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const STEPS = [
  { id: "intro", label: "Inicio", paths: ["/sell"] },
  { id: "permissions", label: "Permisos", paths: ["/sell/camera"] },
  {
    id: "capture",
    label: "Fotos",
    paths: ["/sell/camera/capture", "/sell/camera/denied"],
  },
  { id: "publish", label: "Publicar", paths: ["/sell/preview"] },
] as const;

function getActiveStepIndex(pathname: string): number {
  const index = STEPS.findIndex((step) =>
    (step.paths as readonly string[]).includes(pathname),
  );
  return index >= 0 ? index : 0;
}

export function SellFlowStepper() {
  const pathname = usePathname();
  const activeIndex = getActiveStepIndex(pathname);

  return (
    <nav
      aria-label="Progreso de publicación"
      className="border-b border-ink/10 bg-card/60"
    >
      <ol className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-6 py-3">
        {STEPS.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-1 items-center gap-2 last:flex-none"
            >
              <div className="flex min-w-0 flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                    isComplete && "bg-brand text-brand-foreground",
                    isCurrent && "bg-accent text-accent-foreground ring-2 ring-accent/30 ring-offset-2 ring-offset-surface",
                    !isComplete && !isCurrent && "border border-ink/15 bg-surface text-ink/50",
                  )}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "truncate text-center text-xs font-medium sm:text-left sm:text-sm",
                    isCurrent ? "text-ink" : isComplete ? "text-brand" : "text-ink/50",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 ? (
                <div
                  aria-hidden
                  className={cn(
                    "mx-1 hidden h-px flex-1 sm:block",
                    index < activeIndex ? "bg-brand/40" : "bg-ink/10",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
