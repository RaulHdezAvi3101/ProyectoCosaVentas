interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center gap-4 px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">
        Próximamente
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      {description ? (
        <p className="max-w-xl text-base text-ink/70">{description}</p>
      ) : null}
    </section>
  );
}
