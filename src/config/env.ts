// Reads and validates the environment variables the app needs, once at startup,
// so a missing value fails fast with a clear message instead of surfacing later
// as a confusing runtime error (e.g. a mysterious Cloudinary or Mongo failure).

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  mongodbUrl: requireEnv("MONGODB_URL"),
  cloudinaryCloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: requireEnv("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: requireEnv("CLOUDINARY_API_SECRET"),
  // Session secret has a fallback so the app still boots for local/demo use
  // without a .env file, but this is only safe for development.
  sessionSecret: process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me",
  isProduction: process.env.NODE_ENV === "production",
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  // Only used in development, to allow the Vite dev server (a different
  // origin) to make cross-origin requests with credentials. Not needed in
  // production, where the built React app is served from this same process.
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

if (env.isProduction && !process.env.SESSION_SECRET) {
  console.warn(
    "WARNING: SESSION_SECRET is not set. Using an insecure default secret in production is unsafe — set SESSION_SECRET in your environment."
  );
}
