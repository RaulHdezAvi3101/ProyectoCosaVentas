import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/** Redirige al perfil del usuario con sesión activa. */
export default async function ProfileMePage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/profile/me");
  }
  redirect(`/profile/${session.id}`);
}
