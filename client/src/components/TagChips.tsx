import { Link } from "react-router-dom";

export function TagChips({ tags, activeTag, q }: { tags: string[]; activeTag?: string; q?: string }) {
  if (tags.length === 0) return null;

  return (
    <div>
      {tags.map((t) => (
        <Link
          key={t}
          to={`/posts?tag=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
          className={`tag-chip ${activeTag === t ? "active" : ""}`}
        >
          {t}
        </Link>
      ))}
    </div>
  );
}
