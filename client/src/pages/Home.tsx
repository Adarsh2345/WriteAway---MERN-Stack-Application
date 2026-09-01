import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="row justify-content-center text-center" style={{ padding: "6rem 0 4rem" }}>
        <div className="col-lg-8">
          <p
            className="text-uppercase mb-3"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              color: "var(--accent)",
            }}
          >
            A place for long-form thinking
          </p>
          <h1 className="display-4 mb-4" style={{ lineHeight: 1.1 }}>
            Write it down.
            <br />
            Make it count.
          </h1>
          <p
            className="lead mb-5"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--ink-soft)",
              maxWidth: "34rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            WriteAway is a simple home for your essays, notes, and ideas — with rich formatting,
            tags, and search, and nothing else getting in the way.
          </p>

          {user ? (
            <>
              <p className="mb-4" style={{ fontFamily: "var(--font-ui)", color: "var(--ink-faint)" }}>
                Welcome back, <strong style={{ color: "var(--ink)" }}>{user.username}</strong>.
              </p>
              <Link className="btn btn-primary btn-lg me-2" to="/posts/new">
                Start writing
              </Link>
              <Link className="btn btn-outline-light btn-lg" to="/profile">
                Your profile
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-primary btn-lg me-2" to="/register">
                Get started
              </Link>
              <Link className="btn btn-outline-light btn-lg" to="/posts">
                Browse posts
              </Link>
            </>
          )}
        </div>
      </div>

      <hr style={{ borderColor: "var(--line)", margin: "0 0 4rem" }} />

      <div className="row g-5 mb-5">
        <div className="col-md-4">
          <h3 className="h5 mb-2">Write freely</h3>
          <p className="text-muted" style={{ fontSize: "0.95rem" }}>
            A rich-text editor for formatting, images, and structure — without getting in the way
            of the words themselves.
          </p>
        </div>
        <div className="col-md-4">
          <h3 className="h5 mb-2">Get found</h3>
          <p className="text-muted" style={{ fontSize: "0.95rem" }}>
            Tag your posts and let full-text search do the rest, so nothing you write gets lost in
            the archive.
          </p>
        </div>
        <div className="col-md-4">
          <h3 className="h5 mb-2">Talk it through</h3>
          <p className="text-muted" style={{ fontSize: "0.95rem" }}>
            Readers can comment on what you publish — only you can edit or remove your own posts
            and comments.
          </p>
        </div>
      </div>

      <hr style={{ borderColor: "var(--line)", margin: "0 0 3rem" }} />

      <div className="row justify-content-center text-center mb-5">
        <div className="col-lg-6">
          <h2 className="h3 mb-3">Ready to publish your first post?</h2>
          {user ? (
            <Link to="/posts/new" className="btn btn-primary btn-lg">
              Create a post
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary btn-lg">
              Join WriteAway
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
