import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({
  label,
  description,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const fieldId = id ?? props.name;

  return (
    <label
      htmlFor={fieldId}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg transition has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        className,
      )}
    >
      <input
        id={fieldId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink/25 text-brand focus:ring-2 focus:ring-brand/30 focus:ring-offset-2 focus:ring-offset-card"
        {...props}
      />
      <span className="min-w-0">
        <span className="block font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-sm text-ink/70">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
