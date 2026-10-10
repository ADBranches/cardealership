import { apiRequest } from "../../../api/client";
import type { Vehicle, VehicleCondition, VehicleStatus } from "../types";

type ApiCarImage = {
  id?: number;
  url?: string;
  image_url?: string;
  type?: string;
  image_type?: string;
};

type ApiCar = {
  id: number;

  vin?: string | null;

  make?: string | null;
  model?: string | null;

  name?: string | null;
  type?: string | null;
  category?: string | null;

  year?: number | string | null;
  price?: number | string | null;

  mileage?: number | string | null;
  color?: string | null;

  condition?: string | null;
  status?: string | null;

  description?: string | null;

  power?: string | null;
  engine?: string | null;
  drive?: string | null;

  primary_image?: string | null;

  images?: ApiCarImage[];
};

type CarsApiResponse = {
  success?: boolean;
  count?: number;
  cars?: ApiCar[];
  car?: ApiCar;
  message?: string;
  error?: {
    message?: string;
  };
};

function normalizeCondition(value?: string | null): VehicleCondition {
  return value === "Used" ? "Used" : "New";
}

function normalizeStatus(value?: string | null): VehicleStatus {
  if (
    value === "Available" ||
    value === "Pending Test Drive" ||
    value === "Reserved" ||
    value === "Sold"
  ) {
    return value;
  }

  return "Available";
}

function getImageUrl(car: ApiCar): string {
  if (car.primary_image) {
    return car.primary_image;
  }

  const primaryImage = car.images?.find(
    (image) => image.type === "primary" || image.image_type === "primary",
  );

  if (primaryImage?.url) {
    return primaryImage.url;
  }

  if (primaryImage?.image_url) {
    return primaryImage.image_url;
  }

  const firstImage = car.images?.[0];

  return firstImage?.url ?? firstImage?.image_url ?? "";
}

function mapImages(images?: ApiCarImage[]) {
  if (!images) {
    return [];
  }

  return images
    .map((image) => {
      const url = image.url ?? image.image_url ?? "";

      return {
        id: image.id,
        url,
        type: image.type ?? image.image_type,
      };
    })
    .filter((image) => image.url);
}

function mapApiCar(car: ApiCar): Vehicle {
  const year = Number(car.year);
  const price = Number(car.price);

  const mileage =
    car.mileage === null || car.mileage === undefined || car.mileage === ""
      ? null
      : Number(car.mileage);

  return {
    id: Number(car.id),

    vin: car.vin ?? null,

    make: car.make?.trim() || "Unknown",

    model: car.model?.trim() || null,

    name: car.name?.trim() || "Unnamed Vehicle",

    type: car.type?.trim() || "Vehicle",

    category: car.category?.trim() || "luxury",

    year: Number.isFinite(year) ? year : 0,

    price: Number.isFinite(price) ? price : 0,

    mileage: mileage !== null && Number.isFinite(mileage) ? mileage : null,

    color: car.color ?? null,

    condition: normalizeCondition(car.condition),

    status: normalizeStatus(car.status),

    description: car.description ?? null,

    image: getImageUrl(car),

    images: mapImages(car.images),

    specs: {
      power: car.power?.trim() || "—",
      engine: car.engine?.trim() || "—",
      drive: car.drive?.trim() || "—",
    },
  };
}

async function readPayload(response: Response): Promise<CarsApiResponse> {
  try {
    return (await response.json()) as CarsApiResponse;
  } catch {
    throw new Error("The inventory server returned an invalid response.");
  }
}

export async function getCars(): Promise<Vehicle[]> {
  const response = await apiRequest("/api/cars", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        payload.message ??
        `Unable to load vehicles. Server returned ${response.status}.`,
    );
  }

  if (!Array.isArray(payload.cars)) {
    return [];
  }

  return payload.cars.map(mapApiCar);
}

export async function getCarById(id: number): Promise<Vehicle | undefined> {
  const response = await apiRequest(`/api/cars/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (response.status === 404) {
    return undefined;
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new Error(
      payload.error?.message ??
        payload.message ??
        `Unable to load vehicle. Server returned ${response.status}.`,
    );
  }

  if (!payload.car) {
    return undefined;
  }

  return mapApiCar(payload.car);
}
