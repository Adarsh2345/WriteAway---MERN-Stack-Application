import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import Post from "../models/Post";
import File from "../models/File";
import Comment from "../models/Comment";
import cloudinary from "../config/cloudinary";

// Get user profile
export const getUserProfile: RequestHandler = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }

  const posts = await Post.find({ author: req.user!._id }).sort({ createdAt: -1 });

  res.render("profile", {
    title: "Profile",
    user,
    posts,
    error: "",
    postCount: posts.length,
  });
});

// Get edit profile form
export const getEditProfileForm: RequestHandler = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!._id).select("-password");
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
    success: "",
  });
});

// Update profile
export const updateUserProfile: RequestHandler = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body as {
    username?: string;
    email?: string;
    bio?: string;
  };
  const user = await User.findById(req.user!._id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.bio = bio || user.bio;

  // multer's single-file upload puts the file on req.file (not req.files)
  const file = req.file;
  if (file) {
    if (user.profilePicture?.public_id) {
      await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
    const newFile = new File({
      url: file.path,
      public_id: file.filename,
      uploaded_by: req.user!._id,
    });
    await newFile.save();
    user.profilePicture = { url: newFile.url, public_id: newFile.public_id };
  }

  await user.save();
  res.render("editProfile", {
    title: "Edit Profile",
    user,
    error: "",
    success: "Profile updated successfully",
  });
});

// Delete user account
export const deleteUserAccount: RequestHandler = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!._id);
  if (!user) {
    return res.render("login", {
      title: "Login",
      user: req.user,
      error: "User not found",
    });
  }

  if (user.profilePicture?.public_id) {
    await cloudinary.uploader.destroy(user.profilePicture.public_id);
  }

  // Delete all posts created by the user, and their associated images/comments.
  const posts = await Post.find({ author: req.user!._id });
  for (const post of posts) {
    for (const image of post.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
  }

  await Comment.deleteMany({ author: req.user!._id });

  const files = await File.find({ uploaded_by: req.user!._id });
  for (const file of files) {
    await cloudinary.uploader.destroy(file.public_id);
  }

  await User.findByIdAndDelete(req.user!._id);
  res.redirect("/auth/register");
});
