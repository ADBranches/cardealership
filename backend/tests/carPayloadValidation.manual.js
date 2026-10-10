import { validateCarPayloadContract } from "../middleware/validateCarPayload.js";

const testCases = [
  {
    name: "valid payload with numeric price, mileage, and year",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: 85000000,
      mileage: 50000,
      images: ["https://example.com/car.jpg"],
    },
    expectedValid: true,
  },
  {
    name: "reject price as text",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: "abc<script>",
      mileage: 50000,
    },
    expectedValid: false,
    expectedError: "Price must be a valid positive number.",
  },
  {
    name: "reject empty price",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: "",
      mileage: 50000,
    },
    expectedValid: false,
    expectedError: "Price is required.",
  },
  {
    name: "reject price less than or equal to zero",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: 0,
      mileage: 50000,
    },
    expectedValid: false,
    expectedError: "Price must be a valid positive number.",
  },
  {
    name: "reject mileage as text",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: 85000000,
      mileage: "not-mileage",
    },
    expectedValid: false,
    expectedError: "Mileage must be a valid non-negative number.",
  },
  {
    name: "reject mileage below zero",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: 85000000,
      mileage: -1,
    },
    expectedValid: false,
    expectedError: "Mileage must be a valid non-negative number.",
  },
  {
    name: "reject year as text",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: "bad-year",
      price: 85000000,
      mileage: 50000,
    },
    expectedValid: false,
    expectedError: "Year must be valid.",
  },
  {
    name: "reject missing required name",
    payload: {
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: 85000000,
      mileage: 50000,
    },
    expectedValid: false,
    expectedError: "name is required.",
  },
  {
    name: "reject malformed images payload",
    payload: {
      name: "Toyota Harrier",
      brand: "Toyota",
      type: "SUV",
      category: "luxury",
      year: 2024,
      price: 85000000,
      mileage: 50000,
      images: "not-an-array",
    },
    expectedValid: false,
    expectedError: "Images must be submitted as an array of image URLs.",
  },
];

let failed = 0;

for (const testCase of testCases) {
  const result = validateCarPayloadContract(testCase.payload);

  const validMatches = result.valid === testCase.expectedValid;
  const errorMatches =
    testCase.expectedError === undefined ||
    result.errors.includes(testCase.expectedError);

  if (!validMatches || !errorMatches) {
    failed += 1;
    console.error(`FAILED: ${testCase.name}`);
    console.error(JSON.stringify(result, null, 2));
  } else {
    console.log(`PASSED: ${testCase.name}`);
  }
}

if (failed > 0) {
  console.error(`${failed} payload validation test(s) failed.`);
  process.exit(1);
}

console.log("All payload validation manual tests passed.");
