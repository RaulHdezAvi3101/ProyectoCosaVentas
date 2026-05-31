import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getSession } from "@/features/auth/get-session";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

interface LoginPageProps {
  searchParams?: { next?: string };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession();

  if (session) {
    redirect(safeRedirectPath(searchParams?.next));
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-6xl items-center px-6 py-16">
      <LoginForm nextPath={searchParams?.next} />
    </section>
  );
}
