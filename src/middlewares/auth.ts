import { RequestHandler } from "express";

// Guards a route behind "must be logged in". This is enforcement, not just a
// UX nicety — the React frontend also hides buttons/routes a logged-out user
// shouldn't see, but this check is what actually stops a crafted request.
export const ensureAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};
