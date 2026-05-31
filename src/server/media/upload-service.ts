import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Config, isR2Configured } from "@/server/media/config";
import { MediaError, MEDIA_ERROR_MESSAGES } from "@/server/media/errors";
import { assertFreshCaptureExif } from "@/server/media/exif-validator";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  const config = getR2Config();
  if (!config) {
    throw new MediaError(
      MEDIA_ERROR_MESSAGES.uploadFailed,
      500,
      "r2_not_configured",
    );
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

async function uploadToR2(
  userId: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const config = getR2Config();
  if (!config) {
    throw new MediaError(
      MEDIA_ERROR_MESSAGES.uploadFailed,
      500,
      "r2_not_configured",
    );
  }

  const key = `listings/${userId}/${randomUUID()}.jpg`;
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${config.publicUrl}/${key}`;
}

async function uploadToLocal(
  userId: string,
  buffer: Buffer,
): Promise<string> {
  const relativeDir = path.join("uploads", "listings", userId);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const filename = `${randomUUID()}.jpg`;
  const absolutePath = path.join(absoluteDir, filename);
  await writeFile(absolutePath, buffer);

  return `/${relativeDir.replace(/\\/g, "/")}/${filename}`;
}

export interface UploadImageResult {
  url: string;
  capturedAt: string;
  storage: "r2" | "local";
}

export async function uploadListingImage(
  userId: string,
  file: File,
): Promise<UploadImageResult> {
  if (file.type !== "image/jpeg") {
    throw new MediaError(
      MEDIA_ERROR_MESSAGES.invalidType,
      415,
      "invalid_type",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const capturedAt = await assertFreshCaptureExif(buffer);

  const url = isR2Configured()
    ? await uploadToR2(userId, buffer, file.type)
    : await uploadToLocal(userId, buffer);

  return {
    url,
    capturedAt: capturedAt.toISOString(),
    storage: isR2Configured() ? "r2" : "local",
  };
}
