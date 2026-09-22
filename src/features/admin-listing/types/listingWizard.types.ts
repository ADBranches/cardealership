import type { VehicleCondition, VehicleDrive, VehicleStatus } from "../../cars/types";

export type ListingWizardStep = "core-details" | "specifications" | "assets" | "review";
export type ListingCategory = "luxury" | "sport";
export type ListingImageType = "primary" | "general" | "front" | "rear" | "interior" | "engine";

export interface ListingDraft {
  vin: string;
  make: string;
  model: string;
  name: string;
  type: string;
  category: ListingCategory;
  year: string;
  price: string;
  mileage: string;
  color: string;
  condition: VehicleCondition;
  status: VehicleStatus;
  power: string;
  engine: string;
  drive: VehicleDrive;
}

export interface SelectedListingImage {
  id: string;
  file: File;
  order: number;
  imageType: ListingImageType;
  previewUrl?: string;
}

export type ListingFieldErrors = Partial<Record<keyof ListingDraft | "images", string>>;

export interface CreateListingInput {
  draft: ListingDraft;
  images: SelectedListingImage[];
}

export type ListingErrorCode = "VALIDATION_FAILED" | "UNAUTHORIZED" | "MFA_REQUIRED" | "CONTRACT_UNAVAILABLE" | "LISTING_FAILED";

export type ListingResult =
  | { success: true; listingId: string; message: string; mock: boolean }
  | { success: false; code: ListingErrorCode; message: string; fieldErrors?: ListingFieldErrors };

export interface ListingService {
  createListing(accessToken: string, input: CreateListingInput): Promise<ListingResult>;
}

export type UploadErrorCode = "VALIDATION_FAILED" | "UNAUTHORIZED" | "CONTRACT_UNAVAILABLE" | "UPLOAD_FAILED";

export interface ListingUploadItemResult {
  imageId: string;
  order: number;
  success: boolean;
  url?: string;
  message?: string;
}

export type ListingUploadResult =
  | { success: true; items: ListingUploadItemResult[]; mock: boolean }
  | { success: false; code: UploadErrorCode; message: string; items: ListingUploadItemResult[] };

export interface ListingUploadService {
  uploadImages(accessToken: string, listingId: string, images: SelectedListingImage[]): Promise<ListingUploadResult>;
}
