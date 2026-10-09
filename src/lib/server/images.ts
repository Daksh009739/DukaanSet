import sharp from "sharp";
import { DomainError } from "./validation";
import type { SaleAttachment } from "../contracts";

export const MAX_IMAGE_BYTES = 2_097_152;
export async function decodePhoto(bytes: Buffer, mime: string): Promise<{ bytes: Buffer; mime: SaleAttachment["mime"] }> {
  const format = mime === "image/jpeg" ? "jpeg" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : null;
  if (!format) throw new DomainError("INVALID_CONTENT_TYPE", "Choose a JPEG, PNG, or WebP photo.", 415);
  const signature = format === "jpeg" ? bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : format === "png" ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (!signature || !bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new DomainError("INVALID_IMAGE", "The file does not contain a valid supported photo.");
  try {
    const image = sharp(bytes, { limitInputPixels: 16_000_000, failOn: "error" });
    const metadata = await image.metadata();
    if (metadata.format !== format || !metadata.width || !metadata.height || metadata.width > 8192 || metadata.height > 8192 || metadata.width * metadata.height > 16_000_000 || (metadata.pages ?? 1) > 1) throw new Error("Unsupported image dimensions or animation");
    // Full decoding rejects damaged images. Re-encoding removes EXIF/GPS and
    // trailing payloads rather than serving the original untrusted upload.
    const normalized = await image.rotate().toFormat(format).toBuffer();
    if (normalized.length > MAX_IMAGE_BYTES) throw new DomainError("BODY_TOO_LARGE", "Compress the photo below 2 MB before uploading.", 413);
    return { bytes: normalized, mime: mime as SaleAttachment["mime"] };
  } catch (error) {
    if (error instanceof DomainError) throw error;
    throw new DomainError("INVALID_IMAGE", "The photo is damaged or exceeds the supported image limits.");
  }
}
