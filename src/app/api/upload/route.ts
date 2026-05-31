import type { NextRequest } from "next/server";
import { MediaError, MEDIA_ERROR_MESSAGES } from "@/server/media/errors";
import { MAX_UPLOAD_BYTES } from "@/server/media/config";
import { uploadListingImage } from "@/server/media/upload-service";
import {
  apiError,
  apiJson,
  handleApiError,
  requireApiSession,
} from "@/lib/api/route-helpers";

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(MEDIA_ERROR_MESSAGES.unauthorized);
  if (!auth.ok) {
    return auth.response;
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return apiError(MEDIA_ERROR_MESSAGES.missingFile, 400);
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return apiError(MEDIA_ERROR_MESSAGES.missingFile, 400);
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return apiError(MEDIA_ERROR_MESSAGES.tooLarge, 413);
  }

  try {
    const result = await uploadListingImage(auth.session.user.id, file);
    return apiJson(result);
  } catch (error) {
    return handleApiError(error, {
      logTag: "[upload]",
      fallbackMessage: MEDIA_ERROR_MESSAGES.uploadFailed,
      DomainError: MediaError,
      formatDomain: (domainError) => ({
        error: domainError.message,
        code: (domainError as MediaError).code,
      }),
    });
  }
}
