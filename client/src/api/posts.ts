import { apiRequest } from "./client";
import type { Post, PostDetail, PostsListResponse } from "../types";

export interface PostsQuery {
  q?: string;
  tag?: string;
  page?: number;
}

export function getPosts(query: PostsQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.tag) params.set("tag", query.tag);
  if (query.page) params.set("page", String(query.page));
  const qs = params.toString();
  return apiRequest<PostsListResponse>(`/posts${qs ? `?${qs}` : ""}`);
}

export function getPost(id: string) {
  return apiRequest<{ post: PostDetail }>(`/posts/${id}`);
}

// title/content/tags/images all go into one FormData object since images
// require multipart/form-data — tags is a comma-separated string, parsed
// server-side, matching the original form's field shape.
export function createPost(formData: FormData) {
  return apiRequest<{ post: Post }>("/posts", { method: "POST", formData });
}

export function updatePost(id: string, formData: FormData) {
  return apiRequest<{ post: Post }>(`/posts/${id}`, { method: "PUT", formData });
}

export function deletePost(id: string) {
  return apiRequest<void>(`/posts/${id}`, { method: "DELETE" });
}
