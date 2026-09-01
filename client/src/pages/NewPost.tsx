import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as postsApi from "../api/posts";
import { ApiError } from "../api/client";
import { RichTextEditor } from "../components/RichTextEditor";

export function NewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImages(Array.from(e.target.files ?? []));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      await postsApi.createPost(formData);
      // Land on the posts list with a success banner, instead of leaving the
      // user on the now-empty form — same UX fix as the original app.
      navigate("/posts?created=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem", maxWidth: 760 }}>
      <h1 className="display-6 mb-4">New post</h1>
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
              <RichTextEditor onChange={setContent} />
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
                Images{" "}
                <span
                  className="text-muted"
                  style={{ textTransform: "none", letterSpacing: "normal", fontWeight: 400 }}
                >
                  (optional)
                </span>
              </label>
              <input
                className="form-control"
                type="file"
                id="images"
                multiple
                onChange={handleImagesChange}
              />
              {images.length > 0 && (
                <div className="mt-3">
                  {images.map((file, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(file)}
                      className="img-thumbnail me-2 mb-2"
                      style={{ maxWidth: 150 }}
                      alt=""
                    />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary">
              Publish post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
