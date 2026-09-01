import { Link } from "react-router-dom";

interface Props {
  totalPages: number;
  currentPage: number;
  q?: string;
  tag?: string;
}

export function Pagination({ totalPages, currentPage, q, tag }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Posts pagination" className="mt-3">
      <ul className="pagination justify-content-center">
        {pages.map((p) => (
          <li key={p} className={`page-item ${p === currentPage ? "active" : ""}`}>
            <Link
              className="page-link"
              to={`/posts?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}${
                tag ? `&tag=${encodeURIComponent(tag)}` : ""
              }`}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
