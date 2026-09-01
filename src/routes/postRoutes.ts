import { Router } from "express";
import { createPost, getPosts, getPostById, updatePost, deletePost } from "../controllers/postControllers";
import upload from "../config/multer";
import { ensureAuthenticated } from "../middlewares/auth";

const postRoutes = Router();

postRoutes.get("/", getPosts);
postRoutes.post("/", ensureAuthenticated, upload.array("images", 5), createPost);

postRoutes.get("/:id", getPostById);
postRoutes.put("/:id", ensureAuthenticated, upload.array("images", 5), updatePost);
postRoutes.delete("/:id", ensureAuthenticated, deletePost);

export default postRoutes;
