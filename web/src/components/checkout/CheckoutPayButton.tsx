"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { FormError } from "@/components/ui/FormError";

export function CheckoutPayButton({ listingSlug }: { listingSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handlePay() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/${listingSlug}/pay`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al pagar");
        return;
      }
      setDone(true);
      router.push(`/listings/${listingSlug}`);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="mt-8 rounded-xl bg-teal-light px-4 py-3 text-center text-sm text-teal-dark">
        Pago registrado. El listing sigue reservado para ti.
      </p>
    );
  }

  return (
    <>
      {error && <FormError message={error} className="mt-4" />}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-teal py-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Simular pago exitoso
      </button>
    </>
  );
}
