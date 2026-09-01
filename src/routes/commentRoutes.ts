import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/auth";
import { addComment, updateComment, deleteComment } from "../controllers/commentControllers";

const commentRoutes = Router();

commentRoutes.post("/posts/:id/comments", ensureAuthenticated, addComment);
commentRoutes.put("/comments/:id", ensureAuthenticated, updateComment);
commentRoutes.delete("/comments/:id", ensureAuthenticated, deleteComment);

export default commentRoutes;
