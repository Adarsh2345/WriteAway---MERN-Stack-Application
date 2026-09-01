import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { createApp } from "../src/createApp";

let mongoServer: MongoMemoryServer;

// Spins up a real, ephemeral, local MongoDB for the test run so tests never
// touch the real Atlas cluster configured in .env and don't need network access.
export async function startTestApp() {
  mongoServer = await MongoMemoryServer.create();
  const mongodbUrl = mongoServer.getUri("writeaway-test");
  await mongoose.connect(mongodbUrl);

  const app = createApp({
    sessionSecret: "test-secret",
    mongodbUrl,
    isProduction: false,
    clientUrl: "http://localhost:5173",
  });
  return app;
}

export async function stopTestApp() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
