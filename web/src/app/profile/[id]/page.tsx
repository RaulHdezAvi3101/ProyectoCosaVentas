import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getReviewsForSeller, getSellerById } from "@/lib/listings/queries";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [seller, session, reviews] = await Promise.all([
    getSellerById(params.id),
    getSession(),
    getReviewsForSeller(params.id),
  ]);
  if (!seller) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-4">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted">
        <ArrowLeft className="h-4 w-4" />
        Inicio
      </Link>
      <ProfileClient
        seller={seller}
        reviews={reviews}
        sessionUser={session}
      />
    </main>
  );
}
