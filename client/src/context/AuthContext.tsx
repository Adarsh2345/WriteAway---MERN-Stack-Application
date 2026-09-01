import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import * as authApi from "../api/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load (and on every full page refresh), ask the server whether
  // the session cookie in the browser still corresponds to a logged-in user.
  // This is what makes "stay logged in after refresh" actually work — React
  // state alone would reset to logged-out on every reload.
  useEffect(() => {
    authApi
      .getMe()
      .then(({ user }) => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { user } = await authApi.login(email, password);
    setUser(user);
    return user;
  }

  async function register(username: string, email: string, password: string) {
    const { user } = await authApi.register(username, email, password);
    // Registering does not log the user in (matches the backend, which never
    // starts a session here) — the caller sends them to /login afterward.
    return user;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
