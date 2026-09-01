import path from "path";
import express, { Express } from "express";
import passport from "passport";
import MongoStore from "connect-mongo";
import methodOverride from "method-override";
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
}

// Builds the Express app without connecting to MongoDB or starting a listener,
// so it can be reused both by the real server entry point (app.ts) and by the
// test suite (which points it at an in-memory MongoDB instead).
export function createApp({ sessionSecret, mongodbUrl }: CreateAppOptions): Express {
  const app = express();

  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: mongodbUrl }),
    })
  );

  app.use(methodOverride("_method"));

  configurePassport(passport);
  app.use(passport.initialize());
  app.use(passport.session());

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));

  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/", (req, res) => {
    res.render("home", {
      user: req.user,
      error: "",
      title: "Home",
    });
  });

  app.use("/auth", authRoutes);
  app.use("/posts", postRoutes);
  app.use("/", commentRoutes);
  app.use("/user", userRoutes);

  app.use(errorHandler);

  return app;
}
