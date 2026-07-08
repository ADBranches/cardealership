import { useEffect, useMemo, useState } from "react";
import type { AddCarFormValues } from "../../lib/adminInventory";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type FormErrors = Partial<Record<keyof AddCarFormValues, string>>;

const steps = [
  "Vehicle Identity",
  "Pricing & Usage",
  "Images",
  "Review",
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const initialValues: AddCarFormValues = {
  make: "",
  model: "",
  price: "",
  year: "",
  mileage: "",
  imageFile: null,
};

function isValidYear(value: string) {
  const year = Number(value);
  const currentYear = new Date().getFullYear() + 1;

  return Number.isInteger(year) && year >= 1900 && year <= currentYear;
}

function validateImageFile(file: File | null) {
  if (!file) {
    return "Please select at least one vehicle image.";
  }

  if (!file.type.startsWith("image/")) {
    return "Selected file must be an image.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Image must be under 5MB.";
  }

  return "";
}

function validateFields(values: AddCarFormValues, step?: number) {
  const nextErrors: FormErrors = {};

  const shouldValidateIdentity = step === undefined || step === 0;
  const shouldValidatePricing = step === undefined || step === 1;
  const shouldValidateImage = step === undefined || step === 2;

  if (shouldValidateIdentity) {
    if (!values.make.trim()) {
      nextErrors.make = "Make is required.";
    }

    if (!values.model.trim()) {
      nextErrors.model = "Model is required.";
    }

    if (!values.year.trim()) {
      nextErrors.year = "Year is required.";
    } else if (!isValidYear(values.year)) {
      nextErrors.year = "Year must be valid.";
    }
  }

  if (shouldValidatePricing) {
    const price = Number(values.price);
    const mileage = Number(values.mileage);

    if (!values.price.trim()) {
      nextErrors.price = "Price is required.";
    } else if (Number.isNaN(price) || price <= 0) {
      nextErrors.price = "Price must be greater than zero.";
    }

    if (!values.mileage.trim()) {
      nextErrors.mileage = "Mileage is required.";
    } else if (Number.isNaN(mileage) || mileage < 0) {
      nextErrors.mileage = "Mileage cannot be negative.";
    }
  }

  if (shouldValidateImage) {
    const imageError = validateImageFile(values.imageFile);

    if (imageError) {
      nextErrors.imageFile = imageError;
    }
  }

  return nextErrors;
}

function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${megabytes.toFixed(2)}MB`;
}

export function AddNewCarForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<AddCarFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const selectedFileName = useMemo(
    () => values.imageFile?.name ?? "No image selected yet",
    [values.imageFile]
  );

  useEffect(() => {
    if (!values.imageFile || !values.imageFile.type.startsWith("image/")) {
      setImagePreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(values.imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [values.imageFile]);

  function updateField<Field extends keyof AddCarFormValues>(
    field: Field,
    value: AddCarFormValues[Field]
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleImageChange(file: File | null) {
    updateField("imageFile", file);

    const imageError = validateImageFile(file);

    if (imageError) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        imageFile: imageError,
      }));
    }
  }

  function validateCurrentStep() {
    const nextErrors = validateFields(values, currentStep);
    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function validateEntireForm() {
    const nextErrors = validateFields(values);
    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function handleBack() {
    setErrors({});
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function handleSubmit() {
    if (!validateEntireForm()) {
      return;
    }

    // TODO: Connect this prepared payload to POST /api/cars once backend inventory creation is confirmed.
    // TODO: Connect image upload to POST /api/cars/upload once Ronald's upload endpoint is available.
    console.log("Prepared add-car form values:", values);

    setSubmitted(true);
  }

  function handleReset() {
    setValues(initialValues);
    setErrors({});
    setCurrentStep(0);
    setSubmitted(false);
    setImagePreviewUrl("");
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6 md:p-8">
      <div className="mb-8">
        <p className="text-primary text-sm font-bold tracking-[0.3em] mb-3 uppercase">
          Add Inventory
        </p>

        <h4 className="text-3xl font-bold mb-2">Add New Car</h4>

        <p className="text-muted-foreground">
          Use this multistep form to prepare a new vehicle listing. Backend
          submission will be connected after the inventory and image upload
          endpoints are confirmed.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-md border px-3 py-2 text-sm font-medium ${
              index === currentStep
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            Step {index + 1}: {step}
          </div>
        ))}
      </div>

      {submitted ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h5 className="text-2xl font-bold mb-2">Vehicle Draft Prepared</h5>
            <p className="text-muted-foreground mb-6">
              The listing form was validated successfully. Backend submission is
              still pending integration.
            </p>
            <Button
              type="button"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={handleReset}
            >
              Add Another Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {currentStep === 0 && (
            <div className="grid md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={values.make}
                  onChange={(event) => updateField("make", event.target.value)}
                  placeholder="Toyota"
                />
                {errors.make && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.make}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={values.model}
                  onChange={(event) => updateField("model", event.target.value)}
                  placeholder="Land Cruiser"
                />
                {errors.model && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.model}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={values.year}
                  onChange={(event) => updateField("year", event.target.value)}
                  placeholder="2024"
                />
                {errors.year && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.year}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  value={values.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  placeholder="85000000"
                />
                {errors.price && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  min="0"
                  value={values.mileage}
                  onChange={(event) =>
                    updateField("mileage", event.target.value)
                  }
                  placeholder="50000"
                />
                {errors.mileage && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.mileage}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="imageFile">Vehicle Picture</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0] ?? null)
                  }
                />

                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-medium">{selectedFileName}</p>

                  {values.imageFile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Size: {formatFileSize(values.imageFile.size)}
                    </p>
                  )}

                  {imagePreviewUrl && (
                    <img
                      src={imagePreviewUrl}
                      alt="Selected vehicle preview"
                      className="mt-4 h-40 w-full rounded-md object-cover border border-border"
                    />
                  )}
                </div>

                {errors.imageFile && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.imageFile}
                  </p>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Image upload will later connect to <code>POST /api/cars/upload</code>.
                For now, this step validates image type and keeps files under 5MB.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <Card>
              <CardContent className="p-6 space-y-3">
                <h5 className="text-xl font-bold">Review Vehicle Details</h5>

                <p>
                  <span className="font-semibold">Make:</span> {values.make}
                </p>
                <p>
                  <span className="font-semibold">Model:</span> {values.model}
                </p>
                <p>
                  <span className="font-semibold">Year:</span> {values.year}
                </p>
                <p>
                  <span className="font-semibold">Price:</span> {values.price}
                </p>
                <p>
                  <span className="font-semibold">Mileage:</span>{" "}
                  {values.mileage}
                </p>
                <p>
                  <span className="font-semibold">Image:</span>{" "}
                  {selectedFileName}
                </p>

                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Selected vehicle review preview"
                    className="mt-4 h-48 w-full rounded-md object-cover border border-border"
                  />
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-primary text-white hover:bg-primary/90"
                onClick={handleSubmit}
              >
                Prepare Vehicle Listing
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
