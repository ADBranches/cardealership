import { authenticatedApiRequest } from "../../../api/client";
import type {
  CreateListingInput,
  ListingResult,
  ListingService,
} from "../types";

type ApiCreateCarResponse = {
  success?: boolean;
  data?: {
    id?: number | string;
  };
  car?: {
    id?: number | string;
  };
  id?: number | string;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
};

function getErrorMessage(
  payload: ApiCreateCarResponse | null,
  fallback: string,
): string {
  return payload?.error?.message ?? payload?.message ?? fallback;
}

function mapFieldErrors(details: unknown): Record<string, string> | undefined {
  if (!Array.isArray(details)) {
    return undefined;
  }

  const fieldErrors: Record<string, string> = {};

  for (const detail of details) {
    if (
      typeof detail === "object" &&
      detail !== null &&
      "field" in detail &&
      "message" in detail &&
      typeof detail.field === "string" &&
      typeof detail.message === "string"
    ) {
      fieldErrors[detail.field] = detail.message;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

class LiveListingService implements ListingService {
  async createListing(
    token: string,
    input: CreateListingInput,
  ): Promise<ListingResult> {
    if (!token.trim()) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
      };
    }

    const { draft } = input;

    const payload = {
      vin: draft.vin.trim(),
      make: draft.make.trim(),
      model: draft.model.trim(),
      name: draft.name.trim(),
      type: draft.type.trim(),
      category: draft.category,
      year: Number(draft.year),
      price: Number(draft.price),
      mileage: Number(draft.mileage),
      color: draft.color.trim(),
      condition: draft.condition,
      status: draft.status,
      power: draft.power.trim(),
      engine: draft.engine.trim(),
      drive: draft.drive,
    };

    try {
      const response = await authenticatedApiRequest("/api/cars", token, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseBody: ApiCreateCarResponse | null = null;

      try {
        responseBody = (await response.json()) as ApiCreateCarResponse;
      } catch {
        responseBody = null;
      }

      if (response.status === 401) {
        return {
          success: false,
          code: "UNAUTHORIZED",
          message: getErrorMessage(
            responseBody,
            "Your session is no longer authorized.",
          ),
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          code: "MFA_REQUIRED",
          message: getErrorMessage(
            responseBody,
            "You do not have permission to create vehicle listings.",
          ),
        };
      }

      if (response.status === 400 || response.status === 422) {
        return {
          success: false,
          code: "VALIDATION_FAILED",
          message: getErrorMessage(
            responseBody,
            "The vehicle information could not be validated.",
          ),
          fieldErrors: mapFieldErrors(responseBody?.error?.details),
        };
      }

      if (!response.ok) {
        return {
          success: false,
          code: "LISTING_FAILED",
          message: getErrorMessage(
            responseBody,
            `Vehicle creation failed with status ${response.status}.`,
          ),
        };
      }

      const listingId =
        responseBody?.data?.id ?? responseBody?.car?.id ?? responseBody?.id;

      if (listingId === undefined || listingId === null) {
        return {
          success: false,
          code: "LISTING_FAILED",
          message:
            "The vehicle was created, but the API did not return a vehicle ID.",
        };
      }

      return {
        success: true,
        listingId: String(listingId),
        message: "Vehicle listing created successfully.",
        mock: false,
      };
    } catch (error) {
      return {
        success: false,
        code: "LISTING_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Unable to connect to the vehicle API.",
      };
    }
  }
}

export function createListingService(): ListingService {
  return new LiveListingService();
}
