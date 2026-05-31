import { notFound } from "next/navigation";
import { PlaceholderPage } from "@/components/PlaceholderPage";

function isDemoEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ENABLE_DEMO === "true"
  );
}

export default function DemoPage() {
  if (!isDemoEnabled()) {
    notFound();
  }

  return (
    <PlaceholderPage
      title="Guía demo"
      description="Escenarios de prueba documentados en docs/DATA-AND-SEED.md."
    />
  );
}
