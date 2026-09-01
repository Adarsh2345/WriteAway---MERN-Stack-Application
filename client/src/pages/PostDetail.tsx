import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as postsApi from "../api/posts";
import * as commentsApi from "../api/comments";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import { ErrorPage } from "./ErrorPage";
import type { Comment, PostDetail as PostDetailType } from "../types";

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<PostDetailType | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    if (!id) return;
    postsApi
      .getPost(id)
      .then(({ post }) => setPost(post))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id]);

  if (notFound) return <ErrorPage message="Post not found" />;
  if (!post || !id) return null;

  const isOwner = user && user._id === post.author._id;

  async function handleDeletePost() {
    if (!confirm("Delete this post?")) return;
    await postsApi.deletePost(post!._id);
    navigate("/posts");
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { post: refreshed } = await commentsApi.addComment(post!._id, commentText);
    setPost(refreshed);
    setCommentText("");
  }

  function startEditingComment(comment: Comment) {
    setEditingCommentId(comment._id);
    setEditingText(comment.content);
  }

  async function saveComment(commentId: string) {
    await commentsApi.updateComment(commentId, editingText);
    setPost((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.map((c) =>
              c._id === commentId ? { ...c, content: editingText } : c
            ),
          }
        : prev
    );
    setEditingCommentId(null);
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm("Delete this comment?")) return;
    await commentsApi.deleteComment(commentId);
    setPost((prev) =>
      prev ? { ...prev, comments: prev.comments.filter((c) => c._id !== commentId) } : prev
    );
  }

  return (
    <article className="container" style={{ paddingTop: "3rem", maxWidth: 780 }}>
      <header className="mb-4">
        {post.tags.length > 0 && (
          <p className="mb-3">
            {post.tags.map((t) => (
              <Link key={t} to={`/posts?tag=${t}`} className="tag-chip">
                {t}
              </Link>
            ))}
          </p>
        )}
        <h1 className="display-5 mb-3">{post.title}</h1>
        <p className="text-muted">
          by <strong style={{ color: "var(--ink-soft)" }}>{post.author.username}</strong> ·{" "}
          {new Date(post.createdAt).toDateString()}
        </p>
      </header>

      {post.images.length > 0 && (
        <div className="mb-4">
          <img
            src={post.images[0].url}
            alt="Post"
            className="img-fluid"
            style={{ width: "100%", borderRadius: 4 }}
          />
        </div>
      )}

      <div className="post-content mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />

      {post.images.length > 1 && (
        <div className="row mb-4">
          {post.images.slice(1).map((image) => (
            <div key={image.public_id} className="col-md-6 mb-3">
              <img src={image.url} alt="Post" className="img-fluid" style={{ borderRadius: 4 }} />
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <div
          className="d-flex gap-2 mb-5"
          style={{ borderTop: "1px solid var(--line)", paddingTop: "1.5rem" }}
        >
          <Link to={`/posts/${post._id}/edit`} className="btn btn-outline-light">
            Edit post
          </Link>
          <button className="btn btn-danger" onClick={handleDeletePost}>
            Delete post
          </button>
        </div>
      )}

      <hr style={{ borderColor: "var(--line)", margin: "2rem 0" }} />

      <section>
        <h2 className="h4 mb-4">
          Comments <span className="text-muted">({post.comments.length})</span>
        </h2>

        {post.comments.length > 0 ? (
          <ul className="list-unstyled">
            {post.comments.map((comment) => {
              const isCommentOwner = user && user._id === comment.author._id;
              const isEditing = editingCommentId === comment._id;
              return (
                <li key={comment._id} className="mb-3 pb-3" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem" }}>
                        {comment.author.username}
                      </strong>
                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            className="form-control mb-2"
                            rows={2}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                          />
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => saveComment(comment._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="mb-0 mt-1">{comment.content}</p>
                      )}
                    </div>
                    {isCommentOwner && !isEditing && (
                      <div className="d-flex gap-2 flex-shrink-0 ms-3">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => startEditingComment(comment)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted">No comments yet.</p>
        )}

        {user ? (
          <form onSubmit={handleAddComment} className="mt-4">
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add comment
            </button>
          </form>
        ) : (
          <p className="text-muted">
            <Link to="/login">Log in</Link> to add a comment.
          </p>
        )}
      </section>
    </article>
  );
}
