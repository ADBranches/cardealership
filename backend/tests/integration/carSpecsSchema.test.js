import assert from "node:assert/strict";
import db from "../../config/db.js";
import { getAllCars, getCarById } from "../../models/carsModel.js";

const requiredColumns = {
  cars: ["vin", "make", "model", "type", "category", "mileage", "color", "condition", "updated_at"],
  car_specs: ["car_id", "power", "engine", "drive"],
  car_images: ["car_id", "image_url", "image_type"],
};

for (const [tableName, expectedColumns] of Object.entries(requiredColumns)) {
  const table = db.raw.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name=?").get(tableName);
  assert.ok(table?.sql, `${tableName} table must exist`);
  const columns = db.raw.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
  for (const column of expectedColumns) assert.ok(columns.includes(column), `${tableName}.${column} missing`);
}

const cars = await getAllCars();
assert.ok(Array.isArray(cars));
for (const car of cars) assert.ok(Array.isArray(car.images));

const firstCar = db.raw.prepare("SELECT id FROM cars ORDER BY id LIMIT 1").get();
if (firstCar) {
  const detail = await getCarById(firstCar.id);
  assert.equal(detail.car.id, firstCar.id);
  assert.ok(Array.isArray(detail.images));
}

console.log("CARS_SQLITE_PERSISTENCE_TEST=PASS");
