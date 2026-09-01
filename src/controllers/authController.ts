import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import passport from "passport";
import User from "../models/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Tells the frontend whether anyone is currently logged in. Always returns
// 200 — this is a status check, not an authorization gate, so a logged-out
// visitor gets { user: null } rather than an error.
export const getMe: RequestHandler = asyncHandler((req, res) => {
  res.json({ user: req.user ?? null });
});

// Login logic
export const login: RequestHandler = asyncHandler(async (req, res, next) => {
  passport.authenticate(
    "local",
    (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message ?? "Login failed" });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.json({ user });
      });
    }
  )(req, res, next);
});

// Register logic
export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  const fail = (status: number, error: string): void => {
    res.status(status).json({ error });
  };

  if (!username || !email || !password) {
    return fail(400, "Username, email, and password are all required");
  }
  if (!EMAIL_REGEX.test(email)) {
    return fail(400, "Please enter a valid email address");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return fail(400, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    // Registering does not log the user in automatically (matches the
    // previous behavior, which never called req.logIn here) — the frontend
    // sends them to the login page after this.
    res.status(201).json({ user });
  } catch (error) {
    fail(400, (error as Error).message);
  }
});

// Logout
export const logout: RequestHandler = asyncHandler((req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(204).end();
  });
});
