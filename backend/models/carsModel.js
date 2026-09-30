import db from "../config/db.js";

// GET ALL CARS

export const getAllCars = async () => {
  const carsQuery = `
    SELECT 
      c.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', ci.id,
            'url', ci.image_url,
            'type', ci.image_type
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'
      ) AS images,

      (
        SELECT ci.image_url
        FROM car_images ci
        WHERE ci.car_id = c.id AND ci.image_type = 'primary'
        LIMIT 1
      ) AS primary_image

    FROM cars c
    LEFT JOIN car_images ci ON ci.car_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT 20;
  `;

  const result = await db.query(carsQuery);
  return result.rows;
};

// GET SINGLE CAR
export const getCarById = async (id) => {
  const carQuery = `
    SELECT 
      c.*,
      cs.power,
      cs.engine,
      cs.drive
    FROM cars c
    LEFT JOIN car_specs cs ON c.id = cs.car_id
    WHERE c.id = $1;
  `;

  const imagesQuery = `
    SELECT image_url 
    FROM car_images 
    WHERE car_id = $1;
  `;

  const car = await db.query(carQuery, [id]);
  const images = await db.query(imagesQuery, [id]);

  return {
    car: car.rows[0],
    images: images.rows
  };
};

// CREATE CAR
export const createCar = async (data) => {
  const {
    name,
    brand,
    type,
    category,
    year,
    price,
    power,
    engine,
    drive,
    images
  } = data;

  const carInsert = `
    INSERT INTO cars (name, brand, type, category, year, price)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING id;
  `;

  const carResult = await db.query(carInsert, [
    name,
    brand,
    type,
    category,
    year,
    price
  ]);

  const carId = carResult.rows[0].id;

  // specs
  await db.query(
    `INSERT INTO car_specs (car_id, power, engine, drive)
     VALUES ($1,$2,$3,$4)`,
    [carId, power, engine, drive]
  );

  // images
  if (images && images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      await db.query(
        `INSERT INTO car_images (car_id, image_url, is_primary)
         VALUES ($1,$2,$3)`,
        [carId, images[i], i === 0]
      );
    }
  }

  return carId;
};

export const saveCarImage = async (carId, imageUrl, imageType = "general") => {
  const query = `
    INSERT INTO car_images (car_id, image_url, image_type)
    VALUES ($1, $2, $3)
    RETURNING id, car_id, image_url, image_type;
  `;

  const result = await db.query(query, [
    carId,
    imageUrl,
    imageType
  ]);

  return result.rows[0];
};

const SAFE_CLEANUP_TIMESTAMP_FIELDS = [
  "deleted_at",
  "drafted_at",
  "updated_at",
  "created_at",
];

const DEFAULT_CLEANUP_STATUSES = ["Draft", "Deleted", "draft", "deleted"];

function normalizeCleanupStatuses(statuses = DEFAULT_CLEANUP_STATUSES) {
  if (!Array.isArray(statuses) || statuses.length === 0) {
    return DEFAULT_CLEANUP_STATUSES;
  }

  return statuses
    .filter((status) => typeof status === "string")
    .map((status) => status.trim())
    .filter(Boolean);
}

function normalizeCleanupOlderThanDays(value, fallback = 30) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

function normalizeCleanupTimestampField(field = "created_at") {
  if (SAFE_CLEANUP_TIMESTAMP_FIELDS.includes(field)) {
    return field;
  }

  return "created_at";
}

export const deleteCarImageRecordById = async ({
  imageId,
  statuses = DEFAULT_CLEANUP_STATUSES,
  olderThanDays = 30,
  timestampField = "created_at",
} = {}) => {
  const safeTimestampField = normalizeCleanupTimestampField(timestampField);
  const safeStatuses = normalizeCleanupStatuses(statuses);
  const safeOlderThanDays = normalizeCleanupOlderThanDays(olderThanDays);

  const query = `
    DELETE FROM car_images ci
    USING cars c
    WHERE ci.id = $1
      AND ci.car_id = c.id
      AND c.status = ANY($2)
      AND c.${safeTimestampField} < NOW() - ($3::int * INTERVAL '1 day')
    RETURNING ci.id, ci.car_id, ci.image_url;
  `;

  const result = await db.query(query, [imageId, safeStatuses, safeOlderThanDays]);

  return {
    deletedCount: result.rowCount,
    deletedRecords: result.rows,
  };
};

export const deleteCarImageRecords = async ({
  carId,
  statuses = DEFAULT_CLEANUP_STATUSES,
  olderThanDays = 30,
  timestampField = "created_at",
} = {}) => {
  const safeTimestampField = normalizeCleanupTimestampField(timestampField);
  const safeStatuses = normalizeCleanupStatuses(statuses);
  const safeOlderThanDays = normalizeCleanupOlderThanDays(olderThanDays);

  const query = `
    DELETE FROM car_images ci
    USING cars c
    WHERE ci.car_id = $1
      AND ci.car_id = c.id
      AND c.status = ANY($2)
      AND c.${safeTimestampField} < NOW() - ($3::int * INTERVAL '1 day')
    RETURNING ci.id, ci.car_id, ci.image_url;
  `;

  const result = await db.query(query, [carId, safeStatuses, safeOlderThanDays]);

  return {
    deletedCount: result.rowCount,
    deletedRecords: result.rows,
  };
};

export const removeCarImageLinks = deleteCarImageRecords;

export const markCarImagesCleaned = async () => ({
  updatedCount: 0,
  skipped: true,
  reason: "No image cleanup marker column is currently defined for car_images.",
});
