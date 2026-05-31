import Image from "next/image";
import { cn } from "@/lib/cn";

export type LogoVariant = "brand" | "ink" | "inverse" | "accent";

const LOGO_SRC: Record<LogoVariant, string> = {
  brand: "/brand/mio_nombre_azul.svg",
  ink: "/brand/mio_nombre_negro.svg",
  inverse: "/brand/mio_nombre_blanco.svg",
  accent: "/brand/mio_nombre_naranja.svg",
};

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}

export function Logo({
  variant = "brand",
  className,
  priority = false,
}: LogoProps) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt="mio"
      width={144}
      height={64}
      priority={priority}
      className={cn("h-8 w-auto md:h-9", className)}
    />
  );
}
