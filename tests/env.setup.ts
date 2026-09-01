// Runs before any test file's imports, so modules that read process.env at
// import time (src/config/env.ts, and anything that imports it transitively,
// like config/cloudinary.ts) don't throw before the test app is even built.
// The real MONGODB_URL is swapped for an in-memory server's URI in setup.ts.
process.env.MONGODB_URL ||= "mongodb://localhost:27017/placeholder";
process.env.CLOUDINARY_CLOUD_NAME ||= "test-cloud";
process.env.CLOUDINARY_API_KEY ||= "test-key";
process.env.CLOUDINARY_API_SECRET ||= "test-secret";
process.env.SESSION_SECRET ||= "test-secret";
