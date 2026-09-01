import { Router } from "express";
import { getUserProfile, updateUserProfile, deleteUserAccount } from "../controllers/userController";
import { ensureAuthenticated } from "../middlewares/auth";
import upload from "../config/multer";

const userRoutes = Router();

userRoutes.get("/profile", ensureAuthenticated, getUserProfile);
userRoutes.put("/profile", ensureAuthenticated, upload.single("profilePicture"), updateUserProfile);
userRoutes.delete("/profile", ensureAuthenticated, deleteUserAccount);

export default userRoutes;
