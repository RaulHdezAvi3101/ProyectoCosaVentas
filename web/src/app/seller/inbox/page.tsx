import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { SellerInboxClient } from "./SellerInboxClient";

export default async function SellerInboxPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/seller/inbox");
  }
  if (session.role !== UserRole.seller && session.role !== UserRole.admin) {
    redirect("/auth/login?next=/seller/inbox");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-4">
      <h1 className="text-xl font-bold">Mensajes</h1>
      <p className="text-sm text-muted">
        {session.displayName} · bandeja en tiempo real
      </p>
      <SellerInboxClient />
    </main>
  );
}
