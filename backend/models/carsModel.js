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
            'image_url', ci.image_url
          )
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'
      ) AS images
    FROM cars c
    LEFT JOIN car_images ci ON ci.car_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC;
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