import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/Comment";
import Post from "../models/Post";
import { findPostWithComments } from "./postControllers";

const MAX_COMMENT_LENGTH = 1000;

// Add comment
export const addComment: RequestHandler = asyncHandler(async (req, res) => {
  const { content } = req.body as { content?: string };
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (!content || !content.trim()) {
    res.status(400).json({ error: "Comment cannot be empty" });
    return;
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    res.status(400).json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` });
    return;
  }

  const comment = new Comment({
    content,
    post: postId,
    author: req.user!._id,
  });
  await comment.save();

  post.comments.push(comment._id as typeof post.comments[number]);
  await post.save();
  await comment.populate("author", "username");

  // Return the refreshed, fully-populated post too, so the frontend can
  // update its comment list from this one response instead of needing a
  // second request.
  const refreshedPost = await findPostWithComments(postId);
  res.status(201).json({ comment, post: refreshedPost });
});

// Update comment
export const updateComment: RequestHandler = asyncHandler(async (req, res) => {
  const { content } = req.body as { content?: string };
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  if (comment.author.toString() !== req.user!._id.toString()) {
    res.status(403).json({ error: "You are not authorized to edit this comment" });
    return;
  }
  if (content && content.length > MAX_COMMENT_LENGTH) {
    res.status(400).json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` });
    return;
  }

  comment.content = content || comment.content;
  await comment.save();
  await comment.populate("author", "username");

  res.json({ comment });
});

// Delete comment
export const deleteComment: RequestHandler = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }
  if (comment.author.toString() !== req.user!._id.toString()) {
    res.status(403).json({ error: "You are not authorized to delete this comment" });
    return;
  }
  await Comment.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
