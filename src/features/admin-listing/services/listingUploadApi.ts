import { authenticatedApiRequest } from "../../../api/client";
import type {
  ListingUploadResult,
  ListingUploadService,
  SelectedListingImage,
} from "../types";

type ApiUploadResponse = {
  success?: boolean;
  message?: string;
  image?: {
    database?: {
      id?: number | string;
      car_id?: number | string;
      image_url?: string;
      image_type?: string;
    };
    cloudinary?: {
      publicId?: string;
      secureUrl?: string;
      resourceType?: string;
      format?: string;
      width?: number;
      height?: number;
      bytes?: number;
      createdAt?: string;
    };
    optimization?: {
      reductionPercentage?: number;
    };
  };
  error?: {
    code?: string;
    message?: string;
    status?: number;
    details?: unknown;
  };
};

function getErrorMessage(
  payload: ApiUploadResponse | null,
  fallback: string,
): string {
  return payload?.error?.message ?? payload?.message ?? fallback;
}

class LiveListingUploadService implements ListingUploadService {
  private uploadInFlight = false;

  async uploadImages(
    accessToken: string,
    listingId: string,
    images: SelectedListingImage[],
  ): Promise<ListingUploadResult> {
    if (this.uploadInFlight) {
      return {
        success: false,
        code: "UPLOAD_FAILED",
        message: "An image upload is already in progress.",
        items: [],
      };
    }

    if (!accessToken.trim()) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
        items: [],
      };
    }

    if (!listingId.trim()) {
      return {
        success: false,
        code: "VALIDATION_FAILED",
        message: "A listing identifier is required.",
        items: [],
      };
    }

    if (images.length === 0) {
      return {
        success: true,
        items: [],
        mock: false,
      };
    }

    this.uploadInFlight = true;

    try {
      const items = [];

      const sortedImages = [...images].sort(
        (first, second) => first.order - second.order,
      );

      for (const image of sortedImages) {
        const formData = new FormData();

        formData.append("image", image.file);
        formData.append("carId", listingId);
        formData.append("imageType", image.imageType);

        try {
          const response = await authenticatedApiRequest(
            "/api/cars/upload",
            accessToken,
            {
              method: "POST",
              body: formData,
            },
          );

          let responseBody: ApiUploadResponse | null = null;

          try {
            responseBody = (await response.json()) as ApiUploadResponse;
          } catch {
            responseBody = null;
          }

          if (response.status === 401) {
            items.push({
              imageId: image.id,
              order: image.order,
              success: false,
              message: getErrorMessage(
                responseBody,
                "Your session is no longer authorized.",
              ),
            });

            return {
              success: false,
              code: "UNAUTHORIZED",
              message: getErrorMessage(
                responseBody,
                "Your session is no longer authorized.",
              ),
              items,
            };
          }

          if (response.status === 403) {
            items.push({
              imageId: image.id,
              order: image.order,
              success: false,
              message: getErrorMessage(
                responseBody,
                "You do not have permission to upload vehicle images.",
              ),
            });

            return {
              success: false,
              code: "UNAUTHORIZED",
              message: getErrorMessage(
                responseBody,
                "You do not have permission to upload vehicle images.",
              ),
              items,
            };
          }

          if (response.status === 400 || response.status === 422) {
            items.push({
              imageId: image.id,
              order: image.order,
              success: false,
              message: getErrorMessage(
                responseBody,
                "The vehicle image could not be uploaded.",
              ),
            });

            return {
              success: false,
              code: "VALIDATION_FAILED",
              message: getErrorMessage(
                responseBody,
                "The vehicle image could not be uploaded.",
              ),
              items,
            };
          }

          if (!response.ok || responseBody?.success !== true) {
            items.push({
              imageId: image.id,
              order: image.order,
              success: false,
              message: getErrorMessage(
                responseBody,
                `Image upload failed with status ${response.status}.`,
              ),
            });

            return {
              success: false,
              code: "UPLOAD_FAILED",
              message: getErrorMessage(
                responseBody,
                "Vehicle image upload failed.",
              ),
              items,
            };
          }

          const secureUrl = responseBody.image?.cloudinary?.secureUrl;

          if (!secureUrl) {
            items.push({
              imageId: image.id,
              order: image.order,
              success: false,
              message:
                "The image was uploaded, but the API did not return its URL.",
            });

            return {
              success: false,
              code: "UPLOAD_FAILED",
              message:
                "The image was uploaded, but the API did not return its URL.",
              items,
            };
          }

          items.push({
            imageId: image.id,
            order: image.order,
            success: true,
            url: secureUrl,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to connect to the image upload API.";

          items.push({
            imageId: image.id,
            order: image.order,
            success: false,
            message,
          });

          return {
            success: false,
            code: "UPLOAD_FAILED",
            message,
            items,
          };
        }
      }

      return {
        success: true,
        items,
        mock: false,
      };
    } finally {
      this.uploadInFlight = false;
    }
  }
}

export function createListingUploadService(): ListingUploadService {
  return new LiveListingUploadService();
}
