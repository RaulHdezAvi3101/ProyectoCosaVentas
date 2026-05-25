import { cn } from "@/lib/utils";

export function FormError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-lg bg-coral-light px-3 py-2 text-sm text-coral-dark",
        className
      )}
    >
      {message}
    </p>
  );
}
