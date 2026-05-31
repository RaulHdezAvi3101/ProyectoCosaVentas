import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { getSession } from "@/features/auth/get-session";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";

interface RegisterPageProps {
  searchParams?: { next?: string };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await getSession();

  if (session) {
    redirect(safeRedirectPath(searchParams?.next));
  }

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-6xl items-center px-6 py-16">
      <RegisterForm nextPath={searchParams?.next} />
    </section>
  );
}
