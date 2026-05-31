import exifr from "exifr";
import { EXIF_MAX_AGE_MS } from "@/server/media/config";
import { MediaError, MEDIA_ERROR_MESSAGES } from "@/server/media/errors";

function pickExifTimestamp(metadata: Record<string, unknown>): Date | null {
  const candidates = [
    metadata.DateTimeOriginal,
    metadata.CreateDate,
    metadata.ModifyDate,
    metadata.DateTime,
  ];

  for (const candidate of candidates) {
    if (candidate instanceof Date && !Number.isNaN(candidate.getTime())) {
      return candidate;
    }

    if (typeof candidate === "string") {
      const parsed = new Date(candidate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3"));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return null;
}

export async function assertFreshCaptureExif(buffer: Buffer): Promise<Date> {
  let metadata: Record<string, unknown> | null = null;

  try {
    metadata = (await exifr.parse(buffer, {
      pick: ["DateTimeOriginal", "CreateDate", "ModifyDate", "DateTime"],
    })) as Record<string, unknown> | null;
  } catch {
    metadata = null;
  }

  if (!metadata) {
    throw new MediaError(
      MEDIA_ERROR_MESSAGES.missingExif,
      422,
      "missing_exif",
    );
  }

  const capturedAt = pickExifTimestamp(metadata);

  if (!capturedAt) {
    throw new MediaError(
      MEDIA_ERROR_MESSAGES.missingExif,
      422,
      "missing_exif",
    );
  }

  const ageMs = Date.now() - capturedAt.getTime();

  if (ageMs < 0 || ageMs > EXIF_MAX_AGE_MS) {
    throw new MediaError(
      MEDIA_ERROR_MESSAGES.staleExif,
      422,
      "stale_exif",
    );
  }

  return capturedAt;
}
