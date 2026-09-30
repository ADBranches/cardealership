import assert from "node:assert/strict";
import { buildVehicleFilterQuery, parseVehicleFilterQuery } from "../features/cars/utils/filterQuery";
import { MAX_PRICE_RANGE } from "../features/cars/utils/formatUGX";

assert.deepEqual(parseVehicleFilterQuery("brand=Toyota&year=2023&maxPrice=300000000"), {
  brand: "Toyota",
  year: "2023",
  maxPrice: 300000000,
});
assert.equal(parseVehicleFilterQuery("maxPrice=invalid").maxPrice, MAX_PRICE_RANGE);
assert.equal(parseVehicleFilterQuery("maxPrice=900000000").maxPrice, MAX_PRICE_RANGE);
assert.equal(buildVehicleFilterQuery({ brand: " BMW ", year: "2022", maxPrice: 250000000 }).toString(), "brand=BMW&year=2022&maxPrice=250000000");
assert.equal(buildVehicleFilterQuery({ brand: "", year: "", maxPrice: MAX_PRICE_RANGE }).toString(), "");
console.log(JSON.stringify({ suite: "vehicleFilterQuery", passed: 5, failed: 0, deepLinkRestored: true, invalidPriceRejected: true, resetClearsQuery: true }, null, 2));
