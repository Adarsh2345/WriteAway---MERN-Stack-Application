import { Link } from "react-router-dom";

export function ErrorPage({ message }: { message?: string }) {
  return (
    <div className="container text-center" style={{ paddingTop: "6rem", paddingBottom: "6rem" }}>
      <p
        className="text-muted mb-2"
        style={{
          fontFamily: "var(--font-ui)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.8rem",
        }}
      >
        Something went wrong
      </p>
      <h1 className="display-5 mb-4">{message ?? "Page not found"}</h1>
      <Link to="/" className="btn btn-primary">
        Back home
      </Link>
    </div>
  );
}
