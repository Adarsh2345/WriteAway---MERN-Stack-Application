// Mirrors the shapes returned by the Express API (src/controllers on the
// backend). Kept intentionally plain — no class instances, just the JSON
// shape as-is.

export interface User {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  profilePicture?: {
    url: string;
    public_id: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PostImage {
  url: string;
  public_id: string;
}

// The shape returned in a posts list (GET /posts) — author is populated
// down to just { _id, username }, comments are not included here.
export interface Post {
  _id: string;
  title: string;
  content: string;
  author: { _id: string; username: string };
  images: PostImage[];
  tags: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  post: string;
  author: { _id: string; username: string };
  createdAt: string;
  updatedAt: string;
}

// The shape returned by GET /posts/:id — comments are populated with full
// Comment objects (author included), not just their IDs.
export interface PostDetail extends Omit<Post, "comments"> {
  comments: Comment[];
}

export interface PostsListResponse {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  allTags: string[];
}
