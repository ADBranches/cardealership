
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: ".env.development", quiet: true });
dotenv.config({ path: "backend/.env.development", quiet: true });


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

export default cloudinary;