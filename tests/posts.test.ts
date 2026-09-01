import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { startTestApp, stopTestApp, clearDatabase } from "./setup";

// Registers and logs in a fresh user, returning the session cookie to reuse
// on subsequent authenticated requests.
async function loginAsNewUser(app: Express, emailPrefix: string) {
  const email = `${emailPrefix}@example.com`;
  await request(app).post("/auth/register").type("form").send({
    username: emailPrefix,
    email,
    password: "password123",
  });
  const loginRes = await request(app).post("/auth/login").type("form").send({
    email,
    password: "password123",
  });
  const cookie = loginRes.headers["set-cookie"];
  return cookie;
}

describe("posts", () => {
  let app: Express;

  beforeAll(async () => {
    app = await startTestApp();
  });

  afterAll(async () => {
    await stopTestApp();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it("allows creating a text-only post with no image", async () => {
    const cookie = await loginAsNewUser(app, "owner1");

    const res = await request(app)
      .post("/posts/add")
      .set("Cookie", cookie)
      .type("form")
      .send({ title: "No Image Post", content: "<p>hello</p>" });

    // Redirects straight back to the posts listing with a success flag,
    // instead of re-rendering the empty form.
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/posts?created=1");

    const Post = (await import("../src/models/Post")).default;
    const saved = await Post.findOne({ title: "No Image Post" });
    expect(saved).not.toBeNull();
    expect(saved?.images).toHaveLength(0);

    const postsPage = await request(app).get(res.headers.location);
    expect(postsPage.text).toContain("Post created successfully");
  });

  it("rejects creating a post with no title, and preserves the typed content", async () => {
    const cookie = await loginAsNewUser(app, "owner5");

    const res = await request(app)
      .post("/posts/add")
      .set("Cookie", cookie)
      .type("form")
      .send({ content: "<p>content I don't want to lose</p>" });

    expect(res.status).toBe(200);
    expect(res.text).toContain("Title and content are required");
    // The content the user already typed should be echoed back into the
    // re-rendered form (embedded as a JSON string for the Quill pre-fill
    // script), not silently discarded.
    expect(res.text).toContain("content I don't want to lose");
  });

  it("blocks a non-owner from updating another user's post", async () => {
    // We can't easily attach a real image through Cloudinary in tests, so we
    // insert a post directly and only exercise the ownership-check branch of
    // the update route (which runs before any image handling).
    const Post = (await import("../src/models/Post")).default;
    const User = (await import("../src/models/User")).default;

    const owner = await User.create({
      username: "owner2",
      email: "owner2@example.com",
      password: "hashed",
    });
    const post = await Post.create({
      title: "Original Title",
      content: "<p>original</p>",
      author: owner._id,
      images: [{ url: "http://example.com/img.jpg", public_id: "abc" }],
      tags: ["javascript"],
    });

    const otherUserCookie = await loginAsNewUser(app, "intruder1");

    const res = await request(app)
      .put(`/posts/${post._id}`)
      .set("Cookie", otherUserCookie)
      .type("form")
      .send({ title: "Hacked Title", content: "<p>hacked</p>" });

    expect(res.status).toBe(403);
    expect(res.text).toContain("not authorized to edit this post");

    const unchanged = await Post.findById(post._id);
    expect(unchanged?.title).toBe("Original Title");
  });

  it("blocks a non-owner from deleting another user's post", async () => {
    const Post = (await import("../src/models/Post")).default;
    const User = (await import("../src/models/User")).default;

    const owner = await User.create({
      username: "owner3",
      email: "owner3@example.com",
      password: "hashed",
    });
    const post = await Post.create({
      title: "Should Survive",
      content: "<p>content</p>",
      author: owner._id,
      images: [{ url: "http://example.com/img.jpg", public_id: "abc" }],
    });

    const otherUserCookie = await loginAsNewUser(app, "intruder2");

    const res = await request(app)
      .delete(`/posts/${post._id}`)
      .set("Cookie", otherUserCookie);

    expect(res.status).toBe(403);

    const stillThere = await Post.findById(post._id);
    expect(stillThere).not.toBeNull();
  });

  it("sanitizes a <script> tag out of post content on save", async () => {
    const Post = (await import("../src/models/Post")).default;
    const User = (await import("../src/models/User")).default;

    const owner = await User.create({
      username: "owner4",
      email: "owner4@example.com",
      password: "hashed",
    });
    const post = await Post.create({
      title: "XSS Test",
      // Simulates content that was saved before sanitization existed, to
      // confirm getPostById's read-time sanitization strips it too.
      content: "<p>hello</p><script>alert('xss')</script>",
      author: owner._id,
      images: [{ url: "http://example.com/img.jpg", public_id: "abc" }],
    });

    const res = await request(app).get(`/posts/${post._id}`);

    expect(res.status).toBe(200);
    expect(res.text).not.toContain("<script>");
  });
});
