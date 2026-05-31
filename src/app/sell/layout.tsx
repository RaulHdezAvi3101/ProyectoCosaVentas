import { headers } from "next/headers";
import { requireSession } from "@/features/auth/require-session";
import { SellFlowShell } from "@/features/sell/components/SellFlowShell";

export default async function SellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-pathname") ?? "/sell";
  await requireSession(pathname);
  return <SellFlowShell>{children}</SellFlowShell>;
}
