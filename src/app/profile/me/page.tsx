import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/get-session";

export default async function ProfileMePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login?next=/profile/me");
  }

  redirect(`/profile/${session.user.id}`);
}
