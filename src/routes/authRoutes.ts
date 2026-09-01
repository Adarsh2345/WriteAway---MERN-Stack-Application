import { Router } from "express";
import { getLogin, login, getRegister, register, logout } from "../controllers/authController";

const authRoutes = Router();

authRoutes.get("/login", getLogin);
authRoutes.post("/login", login);
authRoutes.get("/register", getRegister);
authRoutes.post("/register", register);
authRoutes.get("/logout", logout);

export default authRoutes;
