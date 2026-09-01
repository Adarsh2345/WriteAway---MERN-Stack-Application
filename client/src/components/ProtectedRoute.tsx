import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Redirects to /login if nobody's logged in. This is UX only, exactly like
// the old EJS app hiding an edit/delete button for a non-owner — the real
// enforcement is always the API's ensureAuthenticated middleware, which
// rejects a request regardless of what this component does.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Wait for the initial /auth/me check to resolve before deciding —
  // otherwise a logged-in user would flash through the login page on every
  // refresh while that check is still in flight.
  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
