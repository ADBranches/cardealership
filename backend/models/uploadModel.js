import db from "../config/db.js";

export const createCarImage = async ({ carId, imageUrl, imageType }) => {
  const result = await db.query(
    `INSERT INTO car_images (car_id, image_url, image_type)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [carId, imageUrl, imageType || "general"]
  );

  return result.rows[0];
};