import express, { Express } from "express";
import cors from "cors";
import passport from "passport";
import MongoStore from "connect-mongo";
import session from "express-session";
import configurePassport from "./config/passport";
import postRoutes from "./routes/postRoutes";
import errorHandler from "./middlewares/errorHandler";
import commentRoutes from "./routes/commentRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

export interface CreateAppOptions {
  sessionSecret: string;
  mongodbUrl: string;
  isProduction: boolean;
  // Origin allowed to make cross-origin requests with cookies during local
  // development (the Vite dev server, on a different port than the API).
  // Not needed in production, where the built React app is served from this
  // same Express process — see app.ts's static-serving branch.
  clientUrl?: string;
}

// Builds the Express app without connecting to MongoDB or starting a listener,
// so it can be reused both by the real server entry point (app.ts) and by the
// test suite (which points it at an in-memory MongoDB instead).
export function createApp({
  sessionSecret,
  mongodbUrl,
  isProduction,
  clientUrl,
}: CreateAppOptions): Express {
  const app = express();

  if (!isProduction) {
    // In dev, the API (:3000) and the Vite dev server (:5173) are different
    // origins. credentials:true is required for the session cookie to be
    // sent/accepted cross-origin — and per the CORS spec, that means origin
    // can't be "*", it has to be this one specific, real origin.
    app.use(cors({ origin: clientUrl, credentials: true }));
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: mongodbUrl }),
      cookie: { secure: isProduction },
    })
  );

  configurePassport(passport);
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/auth", authRoutes);
  app.use("/posts", postRoutes);
  app.use("/", commentRoutes);
  app.use("/user", userRoutes);

  app.use(errorHandler);

  return app;
}
