import { Router } from "express";
import {
  getUserProfile,
  getEditProfileForm,
  updateUserProfile,
  deleteUserAccount,
} from "../controllers/userController";
import { ensureAuthenticated } from "../middlewares/auth";
import upload from "../config/multer";

const userRoutes = Router();

userRoutes.get("/profile", ensureAuthenticated, getUserProfile);
userRoutes.get("/edit", ensureAuthenticated, getEditProfileForm);
userRoutes.post("/delete", ensureAuthenticated, deleteUserAccount);
userRoutes.post("/edit", ensureAuthenticated, upload.single("profilePicture"), updateUserProfile);

export default userRoutes;
