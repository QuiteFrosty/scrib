import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Cloudflare R2 is S3-compatible, so the AWS SDK works against it directly —
 * just point it at the account's R2 endpoint instead of an AWS region.
 */
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/** A time-limited URL the browser can PUT audio bytes to directly. */
export function presignUpload(key: string, contentType: string) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 60 * 10 }
  );
}

/** A time-limited URL for streaming a lecture's audio back for playback. */
export function presignDownload(key: string) {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), {
    expiresIn: 60 * 60,
  });
}

export async function deleteObject(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

/** Server-side fetch of the full audio file, for handing to Whisper. */
export async function downloadObject(key: string): Promise<Blob> {
  const result = await r2.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key })
  );
  const bytes = await result.Body!.transformToByteArray();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: result.ContentType });
}
