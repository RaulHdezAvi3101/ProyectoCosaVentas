import { notFound, redirect } from "next/navigation";
import { ClaimRoom } from "@/features/claim/components/ClaimRoom";
import { getBySlug } from "@/features/listings/get-by-slug";

interface ClaimPageProps {
  params: { slug: string };
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  if (!params.slug) {
    notFound();
  }

  const detail = await getBySlug(params.slug);

  if (!detail) {
    notFound();
  }

  const { listing } = detail;

  if (!listing.firstToClaim) {
    redirect(`/listings/${listing.id}`);
  }

  if (listing.status !== "live") {
    redirect(`/listings/${listing.id}`);
  }

  return <ClaimRoom listing={listing} seller={detail.seller} />;
}
