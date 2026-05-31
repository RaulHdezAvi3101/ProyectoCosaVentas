import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/get-session";
import { CheckoutForm } from "@/features/checkout/components/CheckoutForm";
import { MARKETPLACE_PATH } from "@/lib/constants";
import {
  getCheckoutState,
  isPaymentDeadlineExpired,
} from "@/server/payment/get-checkout-state";

interface CheckoutPageProps {
  params: { slug: string };
}

function exploreRedirect(message: string): never {
  redirect(`${MARKETPLACE_PATH}?msg=${encodeURIComponent(message)}`);
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const session = await getSession();

  if (!session) {
    redirect(`/auth/login?next=${encodeURIComponent(`/checkout/${params.slug}`)}`);
  }

  const checkout = await getCheckoutState(params.slug);

  if (!checkout) {
    exploreRedirect("checkout-unavailable");
  }

  if (checkout.winnerId !== session.user.id) {
    exploreRedirect("not-winner");
  }

  if (
    checkout.orderStatus === "pending" &&
    isPaymentDeadlineExpired(checkout.paymentDeadline)
  ) {
    exploreRedirect("payment-expired");
  }

  if (checkout.orderStatus === "expired") {
    exploreRedirect("payment-expired");
  }

  return (
    <CheckoutForm
      listing={checkout.listing}
      seller={checkout.seller}
      paymentDeadline={checkout.paymentDeadline}
      initialOrderStatus={checkout.orderStatus}
      initialPaidAt={checkout.paidAt}
    />
  );
}
