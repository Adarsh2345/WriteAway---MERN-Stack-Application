import { apiRequest } from "./client";
import type { Post, User } from "../types";

export function getProfile() {
  return apiRequest<{ user: User; posts: Post[]; postCount: number }>("/user/profile");
}

// Fields (username, email, bio) plus an optional profilePicture file all go
// into one FormData object, since a file upload requires multipart/form-data.
export function updateProfile(formData: FormData) {
  return apiRequest<{ user: User }>("/user/profile", { method: "PUT", formData });
}

export function deleteAccount() {
  return apiRequest<void>("/user/profile", { method: "DELETE" });
}
