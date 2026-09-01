import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import passport from "passport";
import User from "../models/User";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// Render login page
export const getLogin: RequestHandler = asyncHandler((req, res) => {
  res.render("login", {
    title: "Login",
    error: "",
    user: req.user,
  });
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
        return res.render("login", {
          title: "Login",
          user: req.user,
          error: info?.message ?? "Login failed",
        });
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.redirect("/user/profile");
      });
    }
  )(req, res, next);
});

// Get register page
export const getRegister: RequestHandler = asyncHandler((req, res) => {
  res.render("register", {
    title: "Register",
    user: req.user,
    error: "",
  });
});

// Register logic
export const register: RequestHandler = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  const renderError = (error: string) =>
    res.render("register", { title: "Register", user: req.user, error });

  if (!username || !email || !password) {
    return renderError("Username, email, and password are all required");
  }
  if (!EMAIL_REGEX.test(email)) {
    return renderError("Please enter a valid email address");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return renderError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return renderError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.redirect("/auth/login");
  } catch (error) {
    renderError((error as Error).message);
  }
});

// Logout
export const logout: RequestHandler = asyncHandler((req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
});
