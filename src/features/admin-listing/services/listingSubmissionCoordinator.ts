import type {
  CreateListingInput,
  ListingFieldErrors,
  ListingResult,
  ListingService,
  ListingUploadItemResult,
  ListingUploadService,
} from "../types";

export type SubmissionStage =
  | "idle"
  | "creating"
  | "uploading"
  | "complete"
  | "recoverable-failure"
  | "blocked";

export type SubmissionFailureCode =
  | "VALIDATION_FAILED"
  | "UNAUTHORIZED"
  | "SESSION_EXPIRED"
  | "MFA_REQUIRED"
  | "CONTRACT_UNAVAILABLE"
  | "LISTING_FAILED"
  | "UPLOAD_FAILED"
  | "NETWORK_FAILURE"
  | "SUBMISSION_IN_PROGRESS";

export type ListingSubmissionCheckpoint = {
  listingId?: string;
  uploadedImageIds: string[];
  failedImageIds: string[];
};

export type ListingSubmissionSuccess = {
  success: true;
  stage: "complete";
  listingId: string;
  message: string;
  checkpoint: ListingSubmissionCheckpoint;
  mock: boolean;
};

export type ListingSubmissionFailure = {
  success: false;
  stage: "recoverable-failure" | "blocked";
  code: SubmissionFailureCode;
  message: string;
  checkpoint: ListingSubmissionCheckpoint;
  fieldErrors?: ListingFieldErrors;
  retryable: boolean;
};

export type ListingSubmissionResult =
  | ListingSubmissionSuccess
  | ListingSubmissionFailure;

export type ListingSubmissionRequest = {
  accessToken: string;
  input: CreateListingInput;
  checkpoint?: ListingSubmissionCheckpoint;
};

export type ListingSubmissionCoordinatorOptions = {
  listingService: ListingService;
  uploadService: ListingUploadService;
};

export function createEmptySubmissionCheckpoint():
  ListingSubmissionCheckpoint {
  return {
    uploadedImageIds: [],
    failedImageIds: [],
  };
}

function normalizeCheckpoint(
  checkpoint?: ListingSubmissionCheckpoint,
): ListingSubmissionCheckpoint {
  return {
    listingId: checkpoint?.listingId,
    uploadedImageIds: [...new Set(
      checkpoint?.uploadedImageIds ?? [],
    )],
    failedImageIds: [...new Set(
      checkpoint?.failedImageIds ?? [],
    )],
  };
}

function mapListingFailure(
  result: Extract<ListingResult, { success: false }>,
  checkpoint: ListingSubmissionCheckpoint,
): ListingSubmissionFailure {
  const code: SubmissionFailureCode = result.code;
  const blocked =
    code === "UNAUTHORIZED" ||
    code === "MFA_REQUIRED" ||
    code === "CONTRACT_UNAVAILABLE";

  return {
    success: false,
    stage: blocked ? "blocked" : "recoverable-failure",
    code,
    message: result.message,
    checkpoint,
    fieldErrors: result.fieldErrors,
    retryable:
      code === "LISTING_FAILED" ||
      code === "VALIDATION_FAILED",
  };
}

function mapUploadItems(
  items: ListingUploadItemResult[],
  existing: ListingSubmissionCheckpoint,
): ListingSubmissionCheckpoint {
  const uploadedImageIds = new Set(existing.uploadedImageIds);
  const failedImageIds = new Set<string>();

  for (const item of items) {
    if (item.success) {
      uploadedImageIds.add(item.imageId);
    } else {
      failedImageIds.add(item.imageId);
    }
  }

  return {
    listingId: existing.listingId,
    uploadedImageIds: [...uploadedImageIds],
    failedImageIds: [...failedImageIds],
  };
}

export class ListingSubmissionCoordinator {
  private submissionInFlight = false;

  constructor(
    private readonly options:
      ListingSubmissionCoordinatorOptions,
  ) {}

  async submit(
    request: ListingSubmissionRequest,
  ): Promise<ListingSubmissionResult> {
    const checkpoint = normalizeCheckpoint(request.checkpoint);

    if (this.submissionInFlight) {
      return {
        success: false,
        stage: "blocked",
        code: "SUBMISSION_IN_PROGRESS",
        message: "A listing submission is already in progress.",
        checkpoint,
        retryable: false,
      };
    }

    if (!request.accessToken.trim()) {
      return {
        success: false,
        stage: "blocked",
        code: "UNAUTHORIZED",
        message: "Authentication is required.",
        checkpoint,
        retryable: false,
      };
    }

    this.submissionInFlight = true;

    try {
      let listingId = checkpoint.listingId;
      let listingMock = false;

      if (!listingId) {
        let listingResult: ListingResult;

        try {
          listingResult =
            await this.options.listingService.createListing(
              request.accessToken,
              request.input,
            );
        } catch {
          return {
            success: false,
            stage: "recoverable-failure",
            code: "NETWORK_FAILURE",
            message:
              "The vehicle could not be created because the request was interrupted.",
            checkpoint,
            retryable: true,
          };
        }

        if (!listingResult.success) {
          return mapListingFailure(listingResult, checkpoint);
        }

        listingId = listingResult.listingId;
        listingMock = listingResult.mock;
        checkpoint.listingId = listingId;
      }

      const pendingImages = request.input.images.filter(
        (image) =>
          !checkpoint.uploadedImageIds.includes(image.id),
      );

      if (pendingImages.length === 0) {
        return {
          success: true,
          stage: "complete",
          listingId,
          message: "Vehicle publication completed.",
          checkpoint: {
            ...checkpoint,
            failedImageIds: [],
          },
          mock: listingMock,
        };
      }

      try {
        const uploadResult =
          await this.options.uploadService.uploadImages(
            request.accessToken,
            listingId,
            pendingImages,
          );

        const nextCheckpoint = mapUploadItems(
          uploadResult.items,
          checkpoint,
        );

        if (!uploadResult.success) {
          return {
            success: false,
            stage: "recoverable-failure",
            code: uploadResult.code,
            message:
              "The vehicle was created, but one or more images still require upload.",
            checkpoint: nextCheckpoint,
            retryable:
              uploadResult.code === "UPLOAD_FAILED",
          };
        }

        return {
          success: true,
          stage: "complete",
          listingId,
          message: "Vehicle publication completed.",
          checkpoint: nextCheckpoint,
          mock: listingMock || uploadResult.mock,
        };
      } catch {
        return {
          success: false,
          stage: "recoverable-failure",
          code: "NETWORK_FAILURE",
          message:
            "The vehicle was created, but image uploading was interrupted.",
          checkpoint,
          retryable: true,
        };
      }
    } finally {
      this.submissionInFlight = false;
    }
  }
}

export function createListingSubmissionCoordinator(
  options: ListingSubmissionCoordinatorOptions,
): ListingSubmissionCoordinator {
  return new ListingSubmissionCoordinator(options);
}
