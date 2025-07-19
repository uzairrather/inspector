const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Debug log
console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_KEY ? "✓ set" : "❌ missing",
  api_secret: process.env.CLOUDINARY_SECRET ? "✓ set" : "❌ missing",
});

// Optional warning
if (!process.env.CLOUDINARY_CLOUD || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
  console.warn('⚠️ Cloudinary config incomplete. Check your .env file.');
}

module.exports = cloudinary;
