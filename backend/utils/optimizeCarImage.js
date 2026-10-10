import sharp from "sharp";

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1200;
const WEBP_QUALITY = 80;

/**
 * Resize, compress and convert an uploaded image to WebP.
 *
 * @param {Buffer} inputBuffer
 * @returns {Promise<{
 *   buffer: Buffer,
 *   original: {
 *     format: string | null,
 *     width: number | null,
 *     height: number | null,
 *     bytes: number
 *   },
 *   optimized: {
 *     format: string,
 *     width: number | null,
 *     height: number | null,
 *     bytes: number
 *   }
 * }>}
 */
export async function optimizeCarImage(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer)) {
    throw new TypeError("The uploaded image must be provided as a Buffer.");
  }

  const originalMetadata = await sharp(inputBuffer).metadata();

  const optimizedBuffer = await sharp(inputBuffer)
    // Correct orientation from smartphone EXIF metadata.
    .rotate()
    // Resize large images while keeping the aspect ratio.
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    // Convert the image to WebP.
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
    })
    .toBuffer();

  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  return {
    buffer: optimizedBuffer,

    original: {
      format: originalMetadata.format || null,
      width: originalMetadata.width || null,
      height: originalMetadata.height || null,
      bytes: inputBuffer.length,
    },

    optimized: {
      format: optimizedMetadata.format || "webp",
      width: optimizedMetadata.width || null,
      height: optimizedMetadata.height || null,
      bytes: optimizedBuffer.length,
    },
  };
}
