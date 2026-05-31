import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-ink/80">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "rounded-xl border border-ink/15 bg-card px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/20",
          className,
        )}
        {...props}
      />
    </div>
  );
}
