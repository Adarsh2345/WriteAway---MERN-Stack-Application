import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as postsApi from "../api/posts";
import { ApiError } from "../api/client";
import { RichTextEditor } from "../components/RichTextEditor";
import type { PostDetail } from "../types";

export function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    postsApi.getPost(id).then(({ post }) => {
      setPost(post);
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags.join(", "));
    });
  }, [id]);

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(e.target.files ?? []));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError("");

    if (!title || !content.trim()) {
      setError("Please fill in both the title and content.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", tags);
    images.forEach((file) => formData.append("images", file));

    try {
      await postsApi.updatePost(id, formData);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  if (!post) return null;

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem", maxWidth: 760 }}>
      <h1 className="display-6 mb-4">Edit post</h1>
      <div className="card mb-5">
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Content</label>
              {/* Pre-filled from the post's saved, already-sanitized content —
                  same as the old app's Quill pre-fill on the edit page. */}
              <RichTextEditor initialValue={post.content} onChange={setContent} />
            </div>

            <div className="mb-3">
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                type="text"
                className="form-control"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="javascript, career, tutorial (comma-separated)"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="images" className="form-label">
                Images
              </label>
              <input
                type="file"
                className="form-control"
                id="images"
                multiple
                onChange={handleImagesChange}
              />
              <div className="form-text">Uploading new images replaces the existing ones.</div>
              <div className="mt-3">
                {post.images.map((image) => (
                  <img
                    key={image.public_id}
                    src={image.url}
                    alt="Post"
                    className="img-thumbnail me-2"
                    style={{ maxWidth: 150 }}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Save changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
