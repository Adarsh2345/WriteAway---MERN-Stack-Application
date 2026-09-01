import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import sanitizeHtml from "sanitize-html";
import { Types } from "mongoose";
import File from "../models/File";
import Post from "../models/Post";
import cloudinary from "../config/cloudinary";

const MAX_TITLE_LENGTH = 150;
const MAX_CONTENT_LENGTH = 20000;
const POSTS_PER_PAGE = 9;

// The Quill editor produces rich-text HTML. We sanitize it before saving (and
// again defensively before rendering) so a post can't inject a <script> tag or
// other malicious markup — a classic stored-XSS risk with any "render raw HTML
// from user input" feature.
function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "u", "s"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt"],
      "*": ["style"],
    },
  });
}

// Comma-separated tags input -> a clean, lowercase, deduplicated array.
function parseTags(rawTags: string | undefined): string[] {
  if (!rawTags) return [];
  const tags = rawTags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(tags));
}

// upload.array() (used on both the create and update routes) always produces
// Express.Multer.File[], never the { [fieldname]: File[] } shape multer's types
// also allow for upload.fields() — so this narrowing is safe for this app.
function getUploadedFiles(req: Parameters<RequestHandler>[0]): Express.Multer.File[] {
  return (req.files as Express.Multer.File[] | undefined) ?? [];
}

// Rendering post form
export const getPostForm: RequestHandler = asyncHandler((req, res) => {
  res.render("newPost", {
    title: "Create Post",
    user: req.user,
    error: "",
    success: "",
    formValues: { title: "", content: "", tags: "" },
  });
});

// Creating new post
export const createPost: RequestHandler = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body as {
    title?: string;
    content?: string;
    tags?: string;
  };
  const files = getUploadedFiles(req);

  // Re-render the form with an error, but keep whatever the user already
  // typed (title, content, tags) so a validation failure doesn't wipe their
  // work — only the image picker can't be refilled (browsers don't allow
  // pre-populating a file input for security reasons), so that one field
  // does need to be re-selected if the user wants to retry with images.
  const renderError = (error: string) =>
    res.render("newPost", {
      title: "Create Post",
      user: req.user,
      error,
      success: "",
      formValues: { title: title ?? "", content: content ?? "", tags: tags ?? "" },
    });

  if (!title || !content) {
    return renderError("Title and content are required");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return renderError(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return renderError(`Content must be ${MAX_CONTENT_LENGTH} characters or fewer`);
  }

  // Images are optional — a post can be published as text-only.
  const images = await Promise.all(
    files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user!._id,
      });
      await newFile.save();
      return { url: newFile.url, public_id: newFile.public_id };
    })
  );

  const newPost = new Post({
    title,
    content: sanitizePostContent(content),
    author: req.user!._id,
    images,
    tags: parseTags(tags),
  });
  await newPost.save();

  res.redirect("/posts?created=1");
});

// Get all posts — supports free-text search (?q=), tag filtering (?tag=), and pagination (?page=)
export const getPosts: RequestHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const skip = (page - 1) * POSTS_PER_PAGE;

  const q = (req.query.q as string | undefined)?.trim();
  const tag = (req.query.tag as string | undefined)?.trim().toLowerCase();

  const filter: Record<string, unknown> = {};
  if (q) filter.$text = { $search: q };
  if (tag) filter.tags = tag;

  const [posts, totalCount, allTags] = await Promise.all([
    Post.find(filter)
      .populate("author", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(POSTS_PER_PAGE),
    Post.countDocuments(filter),
    Post.distinct("tags"),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

  res.render("posts", {
    title: "Posts",
    posts,
    user: req.user,
    success: req.query.created ? "Post created successfully." : "",
    error: "",
    totalCount,
    totalPages,
    currentPage: page,
    allTags,
    q: q || "",
    tag: tag || "",
  });
});

// Get post by id
export const getPostById: RequestHandler = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username",
      },
    });

  if (!post) {
    return res.status(404).render("error", {
      title: "Post Not Found",
      error: "Post not found",
      user: req.user,
    });
  }

  res.render("postDetails", {
    title: "Post",
    post,
    // The content was already sanitized when the post was created/edited, but
    // we sanitize again on the way out too — belt-and-suspenders, in case old
    // data was written before sanitization existed.
    sanitizedContent: sanitizePostContent(post.content),
    user: req.user,
    success: "",
    error: "",
  });
});

// Get edit post form
export const getEditPostForm: RequestHandler = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).render("error", {
      title: "Post Not Found",
      error: "Post not found",
      user: req.user,
    });
  }
  res.render("editPost", {
    title: "Edit Post",
    post,
    user: req.user,
    error: "",
    success: "",
  });
});

// Update post
export const updatePost: RequestHandler = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body as {
    title?: string;
    content?: string;
    tags?: string;
  };
  const files = getUploadedFiles(req);

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).render("error", {
      title: "Post Not Found",
      error: "Post not found",
      user: req.user,
    });
  }

  if (post.author.toString() !== req.user!._id.toString()) {
    return res.status(403).render("error", {
      title: "Not Authorized",
      error: "You are not authorized to edit this post",
      user: req.user,
    });
  }

  // Re-render with whatever the user just typed (not the saved values), so a
  // validation failure doesn't discard their edits.
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (tags !== undefined) post.tags = parseTags(tags);

  if (title && title.length > MAX_TITLE_LENGTH) {
    return res.render("editPost", {
      title: "Edit Post",
      post,
      user: req.user,
      error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer`,
      success: "",
    });
  }
  if (content && content.length > MAX_CONTENT_LENGTH) {
    return res.render("editPost", {
      title: "Edit Post",
      post,
      user: req.user,
      error: `Content must be ${MAX_CONTENT_LENGTH} characters or fewer`,
      success: "",
    });
  }

  // post.title/content/tags were already set above (to preserve user input
  // through the validation checks) — just sanitize the content now that it's
  // confirmed valid and about to be saved.
  post.content = sanitizePostContent(post.content);

  if (files.length > 0) {
    await Promise.all(post.images.map((image) => cloudinary.uploader.destroy(image.public_id)));
    post.images = await Promise.all(
      files.map(async (file) => {
        const newFile = new File({
          url: file.path,
          public_id: file.filename,
          uploaded_by: req.user!._id,
        });
        await newFile.save();
        return { url: newFile.url, public_id: newFile.public_id };
      })
    );
  }

  await post.save();
  res.redirect(`/posts/${post._id}`);
});

// Delete post
export const deletePost: RequestHandler = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).render("error", {
      title: "Post Not Found",
      error: "Post not found",
      user: req.user,
    });
  }
  if (post.author.toString() !== req.user!._id.toString()) {
    return res.status(403).render("error", {
      title: "Not Authorized",
      error: "You are not authorized to delete this post",
      user: req.user,
    });
  }

  await Promise.all(post.images.map((image) => cloudinary.uploader.destroy(image.public_id)));
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
});
