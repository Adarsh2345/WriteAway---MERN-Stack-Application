import { Router } from "express";
import {
  getPostForm,
  createPost,
  getPosts,
  getPostById,
  getEditPostForm,
  updatePost,
  deletePost,
} from "../controllers/postControllers";
import upload from "../config/multer";
import { ensureAuthenticated } from "../middlewares/auth";

const postRoutes = Router();

// NOTE: /add must be registered before /:id, otherwise Express would treat
// "add" as an :id value.
postRoutes.get("/add", ensureAuthenticated, getPostForm);
postRoutes.post("/add", ensureAuthenticated, upload.array("images", 5), createPost);

postRoutes.get("/", getPosts);

postRoutes.get("/:id", getPostById);
postRoutes.get("/:id/edit", ensureAuthenticated, getEditPostForm);
postRoutes.put("/:id", ensureAuthenticated, upload.array("images", 5), updatePost);
postRoutes.delete("/:id", ensureAuthenticated, deletePost);

export default postRoutes;
