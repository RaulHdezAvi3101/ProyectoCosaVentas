interface RuleOfThirdsOverlayProps {
  hint: string;
}

export function RuleOfThirdsOverlay({ hint }: RuleOfThirdsOverlayProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
        aria-hidden
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="border border-white/20" />
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full bg-ink/70 px-4 py-1.5 text-center text-sm text-white">
        {hint}
      </p>
    </>
  );
}
