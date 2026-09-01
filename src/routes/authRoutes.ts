import { Router } from "express";
import { getMe, login, register, logout } from "../controllers/authController";

const authRoutes = Router();

authRoutes.get("/me", getMe);
authRoutes.post("/login", login);
authRoutes.post("/register", register);
authRoutes.post("/logout", logout);

export default authRoutes;
