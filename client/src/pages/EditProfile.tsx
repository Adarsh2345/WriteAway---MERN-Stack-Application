import { useEffect, useState } from "react";
import * as usersApi from "../api/users";
import { ApiError } from "../api/client";

export function EditProfile() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [currentPictureUrl, setCurrentPictureUrl] = useState<string | undefined>();
  const [newPicture, setNewPicture] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    usersApi.getProfile().then(({ user }) => {
      setUsername(user.username);
      setEmail(user.email);
      setBio(user.bio ?? "");
      setCurrentPictureUrl(user.profilePicture?.url);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email) {
      setError("Username and Email are required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("bio", bio);
    if (newPicture) formData.append("profilePicture", newPicture);

    try {
      const { user } = await usersApi.updateProfile(formData);
      setCurrentPictureUrl(user.profilePicture?.url);
      setNewPicture(null);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  const previewUrl = newPicture ? URL.createObjectURL(newPicture) : undefined;

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem", maxWidth: 560 }}>
      <h1 className="display-6 mb-4">Edit profile</h1>
      <div className="card">
        <div className="card-body p-4">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="bio" className="form-label">
                Bio
              </label>
              <textarea
                className="form-control"
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="profilePicture" className="form-label">
                Profile picture
              </label>
              <input
                className="form-control"
                type="file"
                id="profilePicture"
                onChange={(e) => setNewPicture(e.target.files?.[0] ?? null)}
              />
              <div className="mt-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="rounded-circle"
                    style={{ width: 90, height: 90, objectFit: "cover", border: "1px solid var(--line)" }}
                  />
                ) : (
                  currentPictureUrl && (
                    <img
                      src={currentPictureUrl}
                      alt="Current profile"
                      className="rounded-circle"
                      style={{ width: 90, height: 90, objectFit: "cover", border: "1px solid var(--line)" }}
                    />
                  )
                )}
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
