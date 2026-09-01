import { Link } from "react-router-dom";
import type { Post } from "../types";

export function PostCard({ post }: { post: Post }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        {post.images.length > 0 && (
          <img
            src={post.images[0].url}
            className="card-img-top"
            alt="Post"
            style={{ height: 190, objectFit: "cover", borderBottom: "1px solid var(--line)" }}
          />
        )}
        <div className="card-body d-flex flex-column">
          <h2 className="card-title h5">{post.title}</h2>
          <p className="text-muted mb-2">
            by {post.author.username} · {new Date(post.createdAt).toDateString()}
          </p>
          {post.tags.length > 0 && (
            <p className="mb-3">
              {post.tags.map((t) => (
                <Link key={t} to={`/posts?tag=${t}`} className="tag-chip">
                  {t}
                </Link>
              ))}
            </p>
          )}
          <Link to={`/posts/${post._id}`} className="btn btn-outline-light mt-auto align-self-start">
            Read post &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
