import { Button } from "../../../app/components/ui/button";
import { Label } from "../../../app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../app/components/ui/select";
import type {
  ListingImageType,
  SelectedListingImage,
} from "../types";

type SelectedImageListProps = {
  images: SelectedListingImage[];
  onRemove: (imageId: string) => void;
  onMove: (imageId: string, direction: "up" | "down") => void;
  onImageTypeChange: (
    imageId: string,
    imageType: ListingImageType,
  ) => void;
};

const IMAGE_TYPE_LABELS: Record<ListingImageType, string> = {
  primary: "Primary",
  general: "General",
  front: "Front",
  rear: "Rear",
  interior: "Interior",
  engine: "Engine",
};

export function SelectedImageList({
  images,
  onRemove,
  onMove,
  onImageTypeChange,
}: SelectedImageListProps) {
  if (images.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No vehicle images selected.
      </p>
    );
  }

  return (
    <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {images.map((image, index) => {
        const typeInputId = "listing-image-type-" + image.id;

        return (
          <li
            key={image.id}
            className="min-w-0 rounded-lg border border-border bg-background p-4"
          >
            <div className="flex min-w-0 items-start gap-4">
              {image.previewUrl && (
                <img
                  src={image.previewUrl}
                  alt={"Preview of " + image.file.name}
                  className="h-24 w-28 shrink-0 rounded-md border object-cover"
                />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{image.file.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Position {index + 1} of {images.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={typeInputId}>Image type</Label>
              <Select
                value={image.imageType}
                onValueChange={(value) =>
                  onImageTypeChange(image.id, value as ListingImageType)
                }
              >
                <SelectTrigger id={typeInputId}>
                  <SelectValue placeholder="Choose image type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IMAGE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === 0}
                aria-label={"Move " + image.file.name + " earlier"}
                onClick={() => onMove(image.id, "up")}
              >
                Move earlier
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={index === images.length - 1}
                aria-label={"Move " + image.file.name + " later"}
                onClick={() => onMove(image.id, "down")}
              >
                Move later
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                aria-label={"Remove " + image.file.name}
                onClick={() => onRemove(image.id)}
              >
                Remove
              </Button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
