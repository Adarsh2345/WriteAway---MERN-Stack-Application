import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { startTestApp, stopTestApp, clearDatabase } from "./setup";

describe("search and tags", () => {
  let app: Express;

  beforeAll(async () => {
    app = await startTestApp();
  });

  afterAll(async () => {
    await stopTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();

    const User = (await import("../src/models/User")).default;
    const Post = (await import("../src/models/Post")).default;

    const author = await User.create({
      username: "writer",
      email: "writer@example.com",
      password: "hashed",
    });

    await Post.create([
      {
        title: "Learning JavaScript Closures",
        content: "<p>Closures are a core JavaScript concept.</p>",
        author: author._id,
        images: [{ url: "http://example.com/1.jpg", public_id: "1" }],
        tags: ["javascript", "tutorial"],
      },
      {
        title: "Getting Started with Python",
        content: "<p>Python is great for beginners.</p>",
        author: author._id,
        images: [{ url: "http://example.com/2.jpg", public_id: "2" }],
        tags: ["python", "tutorial"],
      },
      {
        title: "Career Advice for New Grads",
        content: "<p>Tips for your first job search.</p>",
        author: author._id,
        images: [{ url: "http://example.com/3.jpg", public_id: "3" }],
        tags: ["career"],
      },
    ]);
  });

  it("filters posts by tag", async () => {
    const res = await request(app).get("/posts?tag=python");

    expect(res.status).toBe(200);
    const titles = res.body.posts.map((p: { title: string }) => p.title);
    expect(titles).toContain("Getting Started with Python");
    expect(titles).not.toContain("Learning JavaScript Closures");
  });

  it("finds posts via full-text search", async () => {
    const res = await request(app).get("/posts?q=closures");

    expect(res.status).toBe(200);
    const titles = res.body.posts.map((p: { title: string }) => p.title);
    expect(titles).toContain("Learning JavaScript Closures");
    expect(titles).not.toContain("Career Advice for New Grads");
  });

  it("combines a tag filter and a text search", async () => {
    const res = await request(app).get("/posts?tag=tutorial&q=python");

    expect(res.status).toBe(200);
    const titles = res.body.posts.map((p: { title: string }) => p.title);
    expect(titles).toContain("Getting Started with Python");
    expect(titles).not.toContain("Learning JavaScript Closures");
  });

  it("paginates results", async () => {
    const Post = (await import("../src/models/Post")).default;
    const User = (await import("../src/models/User")).default;
    const author = await User.findOne({ email: "writer@example.com" });

    // Seed enough extra posts to guarantee more than one page (9 per page).
    const extraPosts = Array.from({ length: 10 }, (_, i) => ({
      title: `Bulk Post ${i}`,
      content: "<p>filler</p>",
      author: author!._id,
      images: [{ url: "http://example.com/bulk.jpg", public_id: `bulk-${i}` }],
    }));
    await Post.insertMany(extraPosts);

    const pageOne = await request(app).get("/posts?page=1");
    const pageTwo = await request(app).get("/posts?page=2");

    expect(pageOne.status).toBe(200);
    expect(pageTwo.status).toBe(200);
    expect(pageOne.body.currentPage).toBe(1);
    expect(pageTwo.body.currentPage).toBe(2);
    const pageOneIds = pageOne.body.posts.map((p: { _id: string }) => p._id);
    const pageTwoIds = pageTwo.body.posts.map((p: { _id: string }) => p._id);
    expect(pageOneIds).not.toEqual(pageTwoIds);
  });
});
