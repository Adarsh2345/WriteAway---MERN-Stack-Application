import { apiRequest } from "./client";
import type { User } from "../types";

export function getMe() {
  return apiRequest<{ user: User | null }>("/auth/me");
}

export function login(email: string, password: string) {
  return apiRequest<{ user: User }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function register(username: string, email: string, password: string) {
  return apiRequest<{ user: User }>("/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
}

export function logout() {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}
