import type {
  ListingUploadResult,
  ListingUploadService,
  SelectedListingImage,
} from "../types";
import { isListingMockMode } from "./listingApi";

export type ListingUploadOptions = {
  mockMode?: boolean;
  isProduction?: boolean;
  failImageId?: string;
};

class ProvisionalListingUploadService implements ListingUploadService {
  constructor(private readonly options: ListingUploadOptions = {}) {}

  async uploadImages(
    accessToken: string,
    listingId: string,
    images: SelectedListingImage[],
  ): Promise<ListingUploadResult> {
    if (!accessToken.trim()) {
      return { success: false, code: "UNAUTHORIZED", message: "Authentication is required.", items: [] };
    }

    if (!listingId.trim()) {
      return { success: false, code: "VALIDATION_FAILED", message: "A listing identifier is required.", items: [] };
    }

    const mockMode = this.options.mockMode ?? isListingMockMode(
      undefined,
      this.options.isProduction ?? import.meta.env.PROD,
    );

    if (!mockMode) {
      return { success: false, code: "CONTRACT_UNAVAILABLE", message: "Live batch upload remains blocked.", items: [] };
    }

    const items = [...images]
      .sort((first, second) => first.order - second.order)
      .map((image) => ({
        imageId: image.id,
        order: image.order,
        success: image.id !== this.options.failImageId,
        ...(image.id === this.options.failImageId
          ? { message: "Synthetic upload failure." }
          : { url: "synthetic://listing-image/" + image.id }),
      }));

    return items.every((item) => item.success)
      ? { success: true, items, mock: true }
      : { success: false, code: "UPLOAD_FAILED", message: "A synthetic upload failed.", items };
  }
}

export function createListingUploadService(
  options: ListingUploadOptions = {},
): ListingUploadService {
  if ((options.isProduction ?? import.meta.env.PROD) && options.mockMode) {
    throw new Error("Mock listing upload service is disabled in production.");
  }

  return new ProvisionalListingUploadService(options);
}
