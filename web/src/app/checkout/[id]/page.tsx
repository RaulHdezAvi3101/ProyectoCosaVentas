import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Shield, CreditCard, Building2, Store } from "lucide-react";
import { getListingBySlug } from "@/lib/listings/queries";
import { PLATFORM_NAME } from "@/lib/marketplace/constants";
import { formatPrice } from "@/lib/marketplace/format";
import { CheckoutPayButton } from "@/components/checkout/CheckoutPayButton";

export default async function CheckoutPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getListingBySlug(params.id);
  if (!listing) notFound();

  return (
    <main className="mx-auto max-w-lg px-4 py-4">
      <Link
        href={`/listings/${listing.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <h1 className="mt-4 text-xl font-bold">Pago simulado</h1>
      <p className="text-sm text-muted">{listing.title}</p>
      <p className="mt-2 text-2xl font-bold">
        {formatPrice(listing.price, listing.currency)}
      </p>

      <div className="mt-6 flex gap-3 rounded-xl border border-teal/30 bg-teal-light p-4 text-sm text-teal-dark">
        <Shield className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold">Fondos en garantía (escrow)</p>
          <p className="mt-1 text-xs opacity-90">
            Mock local: al pagar se cancela el timer de liberación automática.
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-sm font-semibold text-muted">Método de pago (UI)</h2>
      <ul className="mt-3 space-y-2">
        {[
          { icon: CreditCard, label: "Tarjeta Visa / MC / Amex" },
          { icon: Building2, label: "SPEI / transferencia" },
          { icon: Store, label: "OXXO Pay (48 h)" },
        ].map(({ icon: Icon, label }) => (
          <li key={label}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white p-4 text-left text-sm"
            >
              <Icon className="h-5 w-5 text-accent" />
              {label}
            </button>
          </li>
        ))}
      </ul>

      <CheckoutPayButton listingSlug={listing.id} />

      <p className="mt-4 text-center text-xs text-subtle">
        {PLATFORM_NAME} · Sin pasarela real (Fase 3)
      </p>
    </main>
  );
}
