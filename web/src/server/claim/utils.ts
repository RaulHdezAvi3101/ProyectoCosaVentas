export function normalizePhrase(phrase: string): string {
  return phrase.trim().toLowerCase();
}

export function phrasePreview(phrase: string): string {
  const normalized = normalizePhrase(phrase);
  return normalized.length > 24 ? `${normalized.slice(0, 24)}…` : normalized;
}
