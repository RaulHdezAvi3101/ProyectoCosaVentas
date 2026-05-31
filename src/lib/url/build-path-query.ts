type QueryValue = string | number | undefined | null;

export function buildPathQuery(
  pathname: string,
  query: Record<string, QueryValue>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    params.set(key, String(value));
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
