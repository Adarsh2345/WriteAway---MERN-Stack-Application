import { apiRequest } from "./client";
import type { Comment, PostDetail } from "../types";

export function addComment(postId: string, content: string) {
  return apiRequest<{ comment: Comment; post: PostDetail }>(`/posts/${postId}/comments`, {
    method: "POST",
    body: { content },
  });
}

export function updateComment(id: string, content: string) {
  return apiRequest<{ comment: Comment }>(`/comments/${id}`, {
    method: "PUT",
    body: { content },
  });
}

export function deleteComment(id: string) {
  return apiRequest<void>(`/comments/${id}`, { method: "DELETE" });
}
