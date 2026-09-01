import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./createApp";
import { env } from "./config/env";

const app = createApp({
  sessionSecret: env.sessionSecret,
  mongodbUrl: env.mongodbUrl,
  isProduction: env.isProduction,
  clientUrl: env.clientUrl,
});

mongoose
  .connect(env.mongodbUrl)
  .then(() => {
    console.log("Database connected...");
    app.listen(env.port, () => {
      console.log(`Server is running on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed:", error.message);
  });
