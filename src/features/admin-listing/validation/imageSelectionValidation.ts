import type {
  ListingImageType,
  SelectedListingImage,
} from "../types";

export const LISTING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const LISTING_ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

export type AcceptedListingImageType =
  (typeof LISTING_ACCEPTED_IMAGE_TYPES)[number];

export type ImageSelectionErrorCode =
  | "IMAGE_LIMIT_EXCEEDED"
  | "INVALID_IMAGE_TYPE"
  | "IMAGE_TOO_LARGE"
  | "DUPLICATE_IMAGE";

export type ImageSelectionIssue = {
  code: ImageSelectionErrorCode;
  fileName: string;
  message: string;
};

export type ImageSelectionResult = {
  accepted: File[];
  rejected: ImageSelectionIssue[];
};

export type ImageSelectionOptions = {
  maximumFiles: number;
  maximumFileSizeBytes?: number;
  acceptedMimeTypes?: readonly string[];
};

export function createImageFingerprint(file: File): string {
  return [
    file.name.trim().toLowerCase(),
    String(file.size),
    String(file.lastModified),
    file.type.trim().toLowerCase(),
  ].join(":");
}

export function isAcceptedImageMimeType(
  mimeType: string,
  acceptedMimeTypes: readonly string[] = LISTING_ACCEPTED_IMAGE_TYPES,
): boolean {
  return acceptedMimeTypes.includes(mimeType.trim().toLowerCase());
}

export function validateImageSelection(
  existingImages: readonly SelectedListingImage[],
  candidateFiles: readonly File[],
  options: ImageSelectionOptions,
): ImageSelectionResult {
  const maximumFiles = Math.max(0, Math.floor(options.maximumFiles));
  const maximumFileSizeBytes =
    options.maximumFileSizeBytes ?? LISTING_IMAGE_MAX_BYTES;
  const acceptedMimeTypes =
    options.acceptedMimeTypes ?? LISTING_ACCEPTED_IMAGE_TYPES;
  const accepted: File[] = [];
  const rejected: ImageSelectionIssue[] = [];
  const fingerprints = new Set(
    existingImages.map((image) => createImageFingerprint(image.file)),
  );

  for (const file of candidateFiles) {
    const fingerprint = createImageFingerprint(file);

    if (existingImages.length + accepted.length >= maximumFiles) {
      rejected.push({
        code: "IMAGE_LIMIT_EXCEEDED",
        fileName: file.name,
        message: "The configured image limit has been reached.",
      });
      continue;
    }

    if (!isAcceptedImageMimeType(file.type, acceptedMimeTypes)) {
      rejected.push({
        code: "INVALID_IMAGE_TYPE",
        fileName: file.name,
        message: "Choose a JPEG, PNG, WebP, HEIC, or HEIF image.",
      });
      continue;
    }

    if (file.size > maximumFileSizeBytes) {
      rejected.push({
        code: "IMAGE_TOO_LARGE",
        fileName: file.name,
        message: "Each image must be 5 MB or smaller.",
      });
      continue;
    }

    if (fingerprints.has(fingerprint)) {
      rejected.push({
        code: "DUPLICATE_IMAGE",
        fileName: file.name,
        message: "This image has already been selected.",
      });
      continue;
    }

    fingerprints.add(fingerprint);
    accepted.push(file);
  }

  return { accepted, rejected };
}

export function createSelectedListingImages(
  files: readonly File[],
  startingOrder: number,
  createIdentifier: (file: File, index: number) => string,
  createPreviewUrl: (file: File) => string,
): SelectedListingImage[] {
  const safeStartingOrder = Math.max(0, Math.floor(startingOrder));

  return files.map((file, index) => {
    const order = safeStartingOrder + index;
    const imageType: ListingImageType =
      order === 0 ? "primary" : "general";

    return {
      id: createIdentifier(file, index),
      file,
      order,
      imageType,
      previewUrl: createPreviewUrl(file),
    };
  });
}

export function normalizeSelectedImageOrder(
  images: readonly SelectedListingImage[],
): SelectedListingImage[] {
  return images.map((image, index) => ({
    ...image,
    order: index,
    imageType:
      index === 0 && image.imageType === "general"
        ? "primary"
        : image.imageType,
  }));
}
