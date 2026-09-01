import { ErrorRequestHandler } from "express";
import { env } from "../config/env";

// Always log the real error server-side. Only show the real message to the
// user in development — in production, a generic message avoids leaking
// internals (stack traces, database details, etc.) to whoever hit the error.
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(err);

  const status = (err as { status?: number }).status || 500;
  const message = env.isProduction
    ? "Something went wrong. Please try again later."
    : err.message;

  res.status(status);
  res.render("error", {
    title: "Error",
    error: message,
    user: req.user,
  });
};

export default errorHandler;
