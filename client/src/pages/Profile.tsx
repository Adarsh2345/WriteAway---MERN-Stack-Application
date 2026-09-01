import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as usersApi from "../api/users";
import { useAuth } from "../context/AuthContext";
import type { Post, User } from "../types";

export function Profile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    usersApi.getProfile().then((data) => {
      setProfile(data.user);
      setPosts(data.posts);
      setPostCount(data.postCount);
    });
  }, [authUser]);

  async function handleDeleteAccount() {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    await usersApi.deleteAccount();
    await logout();
    navigate("/register");
  }

  if (!profile) return null;

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card">
            <div className="card-body text-center p-4">
              {profile.profilePicture?.url ? (
                <img
                  src={profile.profilePicture.url}
                  className="rounded-circle mb-3"
                  style={{ width: 120, height: 120, objectFit: "cover", border: "1px solid var(--line)" }}
                  alt="Profile"
                />
              ) : (
                <div
                  className="rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center"
                  style={{
                    width: 120,
                    height: 120,
                    backgroundColor: "var(--accent-tint)",
                    fontFamily: "var(--font-display)",
                    fontSize: "2.5rem",
                    color: "var(--accent)",
                  }}
                >
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="h4 mb-1">{profile.username}</h1>
              <p className="text-muted mb-3">{profile.email}</p>
              {profile.bio && (
                <p className="mb-3" style={{ fontFamily: "var(--font-body)" }}>
                  {profile.bio}
                </p>
              )}
              <p className="text-muted mb-4">
                Joined {new Date(profile.createdAt).toDateString()} · {postCount} post
                {postCount === 1 ? "" : "s"}
              </p>
              <Link to="/profile/edit" className="btn btn-outline-light w-100 mb-2">
                Edit profile
              </Link>
              <button className="btn btn-danger w-100" onClick={handleDeleteAccount}>
                Delete account
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <h2
            className="h5 mb-3 text-muted"
            style={{
              fontFamily: "var(--font-ui)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.85rem",
            }}
          >
            Your posts
          </h2>
          <div className="row">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="col-md-6 mb-4">
                  <div className="card h-100">
                    {post.images.length > 0 && (
                      <img
                        src={post.images[0].url}
                        className="card-img-top"
                        alt="Post"
                        style={{
                          height: 160,
                          objectFit: "cover",
                          borderBottom: "1px solid var(--line)",
                        }}
                      />
                    )}
                    <div className="card-body">
                      <h3 className="h6 card-title">{post.title}</h3>
                      <p className="text-muted mb-2">{new Date(post.createdAt).toDateString()}</p>
                      <Link to={`/posts/${post._id}`} className="btn btn-outline-light">
                        Read post &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <p className="text-muted">You haven't published anything yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
