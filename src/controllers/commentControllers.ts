import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/Comment";
import Post from "../models/Post";

const MAX_COMMENT_LENGTH = 1000;

// Add comment
export const addComment: RequestHandler = asyncHandler(async (req, res) => {
  const { content } = req.body as { content?: string };
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).render("error", {
      title: "Post Not Found",
      error: "Post not found",
      user: req.user,
    });
  }
  if (!content || !content.trim()) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Comment cannot be empty",
      success: "",
    });
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`,
      success: "",
    });
  }

  const comment = new Comment({
    content,
    post: postId,
    author: req.user!._id,
  });
  await comment.save();

  post.comments.push(comment._id as typeof post.comments[number]);
  await post.save();

  res.redirect(`/posts/${postId}`);
});

// Get comment form
export const getCommentForm: RequestHandler = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).render("error", {
      title: "Comment Not Found",
      error: "Comment not found",
      user: req.user,
    });
  }
  if (comment.author.toString() !== req.user!._id.toString()) {
    return res.status(403).render("error", {
      title: "Not Authorized",
      error: "You are not authorized to edit this comment",
      user: req.user,
    });
  }

  res.render("editComment", {
    title: "Comment",
    comment,
    user: req.user,
    error: "",
    success: "",
  });
});

// Update comment
export const updateComment: RequestHandler = asyncHandler(async (req, res) => {
  const { content } = req.body as { content?: string };
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).render("error", {
      title: "Comment Not Found",
      error: "Comment not found",
      user: req.user,
    });
  }
  if (comment.author.toString() !== req.user!._id.toString()) {
    return res.status(403).render("error", {
      title: "Not Authorized",
      error: "You are not authorized to edit this comment",
      user: req.user,
    });
  }
  if (content && content.length > MAX_COMMENT_LENGTH) {
    return res.render("editComment", {
      title: "Comment",
      comment,
      user: req.user,
      error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`,
      success: "",
    });
  }

  comment.content = content || comment.content;
  await comment.save();
  res.redirect(`/posts/${comment.post}`);
});

// Delete comment
export const deleteComment: RequestHandler = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).render("error", {
      title: "Comment Not Found",
      error: "Comment not found",
      user: req.user,
    });
  }
  if (comment.author.toString() !== req.user!._id.toString()) {
    return res.status(403).render("error", {
      title: "Not Authorized",
      error: "You are not authorized to delete this comment",
      user: req.user,
    });
  }
  await Comment.findByIdAndDelete(req.params.id);
  res.redirect(`/posts/${comment.post}`);
});
