import { RequestHandler } from "express";
import asyncHandler from "express-async-handler";
import sanitizeHtml from "sanitize-html";
import Post, { IPost } from "../models/Post";
import File from "../models/File";
import cloudinary from "../config/cloudinary";

const MAX_TITLE_LENGTH = 150;
const MAX_CONTENT_LENGTH = 20000;
const POSTS_PER_PAGE = 9;

// The Quill editor produces rich-text HTML. We sanitize it before saving (and
// again defensively before every response that includes it) so a post can't
// inject a <script> tag or other malicious markup — a classic stored-XSS
// risk with any "render raw HTML from user input" feature.
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

// Fetches a post with its author and comments (each comment's own author too)
// populated, and its content sanitized — used by both getPostById and by
// addComment's response, so there's exactly one place that does this, not
// two copies that could drift out of sync.
export async function findPostWithComments(id: string): Promise<IPost | null> {
  const post = await Post.findById(id)
    .populate("author", "username")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username",
      },
    });

  if (!post) return null;

  post.content = sanitizePostContent(post.content);
  return post;
}

// Creating new post
export const createPost: RequestHandler = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body as {
    title?: string;
    content?: string;
    tags?: string;
  };
  const files = getUploadedFiles(req);

  const fail = (status: number, error: string): void => {
    res.status(status).json({ error });
  };

  if (!title || !content) {
    return fail(400, "Title and content are required");
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return fail(400, `Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return fail(400, `Content must be ${MAX_CONTENT_LENGTH} characters or fewer`);
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
  await newPost.populate("author", "username");

  res.status(201).json({ post: newPost });
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

  res.json({ posts, totalCount, totalPages, currentPage: page, allTags });
});

// Get post by id
export const getPostById: RequestHandler = asyncHandler(async (req, res) => {
  const post = await findPostWithComments(req.params.id);

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ post });
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
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.author.toString() !== req.user!._id.toString()) {
    res.status(403).json({ error: "You are not authorized to edit this post" });
    return;
  }

  if (title !== undefined) post.title = title;
  if (tags !== undefined) post.tags = parseTags(tags);

  if (title && title.length > MAX_TITLE_LENGTH) {
    res.status(400).json({ error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` });
    return;
  }
  if (content && content.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({ error: `Content must be ${MAX_CONTENT_LENGTH} characters or fewer` });
    return;
  }

  if (content !== undefined) {
    post.content = sanitizePostContent(content);
  }

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
  await post.populate("author", "username");

  res.json({ post });
});

// Delete post
export const deletePost: RequestHandler = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (post.author.toString() !== req.user!._id.toString()) {
    res.status(403).json({ error: "You are not authorized to delete this post" });
    return;
  }

  await Promise.all(post.images.map((image) => cloudinary.uploader.destroy(image.public_id)));
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).end();
});
