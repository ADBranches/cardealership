import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "../../../app/components/ui/button";
import type {
  ListingImageType,
  SelectedListingImage,
} from "../types";
import {
  createSelectedListingImages,
  LISTING_ACCEPTED_IMAGE_TYPES,
  normalizeSelectedImageOrder,
  validateImageSelection,
  type ImageSelectionIssue,
} from "../validation/imageSelectionValidation";
import { SelectedImageList } from "./SelectedImageList";

type AssetUploadStepProps = {
  images: SelectedListingImage[];
  maximumFiles: number;
  onImagesChange: (images: SelectedListingImage[]) => void;
};

export function moveSelectedImage(
  images: readonly SelectedListingImage[],
  imageId: string,
  direction: "up" | "down",
): SelectedListingImage[] {
  const currentIndex = images.findIndex((image) => image.id === imageId);

  if (currentIndex < 0) return [...images];

  const targetIndex =
    direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= images.length) {
    return [...images];
  }

  const movedImages = [...images];
  const currentImage = movedImages[currentIndex];
  movedImages[currentIndex] = movedImages[targetIndex];
  movedImages[targetIndex] = currentImage;

  return normalizeSelectedImageOrder(movedImages);
}

export function AssetUploadStep({
  images,
  maximumFiles,
  onImagesChange,
}: AssetUploadStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const identifierSequence = useRef(0);
  const [selectionIssues, setSelectionIssues] = useState<
    ImageSelectionIssue[]
  >([]);

  function createIdentifier(): string {
    identifierSequence.current += 1;
    return "listing-image-" + identifierSequence.current;
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const candidates = Array.from(event.target.files ?? []);
    const validation = validateImageSelection(images, candidates, {
      maximumFiles,
    });

    setSelectionIssues(validation.rejected);

    if (validation.accepted.length > 0) {
      const selectedImages = createSelectedListingImages(
        validation.accepted,
        images.length,
        () => createIdentifier(),
        (file) => URL.createObjectURL(file),
      );

      onImagesChange(
        normalizeSelectedImageOrder([...images, ...selectedImages]),
      );
    }

    event.target.value = "";
  }

  function handleRemove(imageId: string) {
    const image = images.find((item) => item.id === imageId);

    if (image?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(image.previewUrl);
    }

    onImagesChange(
      normalizeSelectedImageOrder(
        images.filter((item) => item.id !== imageId),
      ),
    );
    setSelectionIssues([]);
  }

  function handleMove(
    imageId: string,
    direction: "up" | "down",
  ) {
    onImagesChange(moveSelectedImage(images, imageId, direction));
  }

  function handleImageTypeChange(
    imageId: string,
    imageType: ListingImageType,
  ) {
    onImagesChange(
      images.map((image) =>
        image.id === imageId ? { ...image, imageType } : image,
      ),
    );
  }

  const normalizedMaximumFiles = Math.max(0, Math.floor(maximumFiles));
  const atLimit = images.length >= normalizedMaximumFiles;

  return (
    <fieldset className="space-y-6">
      <legend className="text-xl font-semibold">Vehicle images</legend>
      <p id="listing-images-description" className="text-sm text-muted-foreground">
        Choose image files, review their order, and assign descriptive image types. Uploading does not occur at this step.
      </p>

      <input
        ref={inputRef}
        id="listing-images"
        type="file"
        multiple
        accept={LISTING_ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        aria-describedby="listing-images-description listing-image-limit"
        onChange={handleFileSelection}
      />

      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Select vehicle images</p>
          <p id="listing-image-limit" className="text-sm text-muted-foreground">
            {images.length} of {normalizedMaximumFiles} selected. Each file must be 5 MB or smaller.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={atLimit}
          onClick={() => inputRef.current?.click()}
        >
          Choose images
        </Button>
      </div>

      {selectionIssues.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-4"
        >
          <p className="font-semibold">Some files were not selected</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {selectionIssues.map((issue, index) => (
              <li key={issue.fileName + issue.code + index}>
                {issue.fileName}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <SelectedImageList
        images={images}
        onRemove={handleRemove}
        onMove={handleMove}
        onImageTypeChange={handleImageTypeChange}
      />
    </fieldset>
  );
}
