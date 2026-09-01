import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { startTestApp, stopTestApp, clearDatabase } from "./setup";

// Registers and logs in a fresh user, returning the session cookie to reuse
// on subsequent authenticated requests.
async function loginAsNewUser(app: Express, emailPrefix: string) {
  const email = `${emailPrefix}@example.com`;
  await request(app).post("/auth/register").send({
    username: emailPrefix,
    email,
    password: "password123",
  });
  const loginRes = await request(app).post("/auth/login").send({
    email,
    password: "password123",
  });
  return loginRes.headers["set-cookie"];
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
      .post("/posts")
      .set("Cookie", cookie)
      .field("title", "No Image Post")
      .field("content", "<p>hello</p>");

    expect(res.status).toBe(201);
    expect(res.body.post.title).toBe("No Image Post");
    expect(res.body.post.images).toHaveLength(0);

    const Post = (await import("../src/models/Post")).default;
    const saved = await Post.findOne({ title: "No Image Post" });
    expect(saved).not.toBeNull();
  });

  it("rejects creating a post with no title", async () => {
    const cookie = await loginAsNewUser(app, "owner5");

    const res = await request(app)
      .post("/posts")
      .set("Cookie", cookie)
      .field("content", "<p>content</p>");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Title and content are required");
  });

  it("blocks a non-owner from updating another user's post", async () => {
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
      .field("title", "Hacked Title")
      .field("content", "<p>hacked</p>");

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("not authorized to edit this post");

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

  it("sanitizes a <script> tag out of post content on read", async () => {
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
    expect(res.body.post.content).not.toContain("<script>");
  });
});
