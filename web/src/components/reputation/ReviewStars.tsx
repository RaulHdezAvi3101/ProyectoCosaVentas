export function ReviewStars({
  rating,
  className = "ml-1 text-amber-dark",
}: {
  rating: number;
  className?: string;
}) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)));
  return (
    <span className={className} aria-label={`${clamped} de 5`}>
      {"★".repeat(clamped)}
      {"☆".repeat(5 - clamped)}
    </span>
  );
}
