import bcrypt from "bcrypt";

const MAX_PHRASE_LENGTH = 256;

export function buildPhrasePreview(phrase: string): string {
  const trimmed = phrase.trim();
  if (trimmed.length <= 4) {
    return "****";
  }

  return `${trimmed.slice(0, 4)}…`;
}

export async function validateClaimPhrase(
  phrase: string,
  claimPhraseHash: string | null,
): Promise<boolean> {
  if (!claimPhraseHash) {
    return false;
  }

  const normalized = phrase.trim();
  if (!normalized || normalized.length > MAX_PHRASE_LENGTH) {
    return false;
  }

  return bcrypt.compare(normalized, claimPhraseHash);
}
