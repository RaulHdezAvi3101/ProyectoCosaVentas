import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MARKETPLACE_PATH } from "@/lib/constants";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <Card className="rounded-2xl p-8 md:p-12">
        <div className="flex max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand">
              Marketplace C2C — México
            </p>
            <h1 className="font-display text-display-lg font-semibold tracking-tight text-ink md:text-display-xl">
              Compra y vende coleccionables con confianza
            </h1>
            <p className="text-lg text-ink/70">
              mio conecta compradores y vendedores con Primero en reclamar,
              reservas y reputación verificable.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={MARKETPLACE_PATH}>Explorar publicaciones</Button>
            <Button href="/sell" variant="secondary">
              Vender un artículo
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
