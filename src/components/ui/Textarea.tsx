import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const fieldClassName =
  "rounded-xl border border-ink/15 bg-card px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/20";

export function Textarea({ label, id, className = "", ...props }: TextareaProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink/80">
          {label}
        </label>
      ) : null}
      <textarea
        id={fieldId}
        className={cn(fieldClassName, className)}
        {...props}
      />
    </div>
  );
}
