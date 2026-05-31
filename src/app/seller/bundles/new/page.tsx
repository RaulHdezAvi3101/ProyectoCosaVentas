import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/get-session";
import { listSellerListingsForBundle } from "@/features/bundles/create-bundle";
import { CreateBundleForm } from "@/features/bundles/components/CreateBundleForm";

export default async function NewBundlePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login?next=/seller/bundles/new");
  }

  const listings = await listSellerListingsForBundle(session.user.id);

  return <CreateBundleForm listings={listings} />;
}
