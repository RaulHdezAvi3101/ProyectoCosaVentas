import { requireSession } from "@/features/auth/require-session";

export default async function SellerInboxLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession("/seller/inbox");
  return children;
}
