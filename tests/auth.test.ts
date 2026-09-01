import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import request from "supertest";
import { Express } from "express";
import { startTestApp, stopTestApp, clearDatabase } from "./setup";

describe("auth", () => {
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

  it("registers a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "alice",
      email: "alice@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects registration with an invalid email format", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "bob",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("valid email address");
  });

  it("rejects registration with a too-short password", async () => {
    const res = await request(app).post("/auth/register").send({
      username: "carol",
      email: "carol@example.com",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("at least 6 characters");
  });

  it("rejects registration when the email is already used", async () => {
    await request(app).post("/auth/register").send({
      username: "dave",
      email: "dave@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/register").send({
      username: "dave2",
      email: "dave@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("User already exists");
  });

  it("logs in with correct credentials and sets a session cookie", async () => {
    await request(app).post("/auth/register").send({
      username: "erin",
      email: "erin@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/login").send({
      email: "erin@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("erin@example.com");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects login with the wrong password", async () => {
    await request(app).post("/auth/register").send({
      username: "frank",
      email: "frank@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/login").send({
      email: "frank@example.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain("Incorrect password");
  });

  it("returns a 401 JSON error for an unauthenticated request to a protected route", async () => {
    const res = await request(app).get("/user/profile");

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("GET /auth/me returns null when logged out and the user when logged in", async () => {
    const loggedOut = await request(app).get("/auth/me");
    expect(loggedOut.status).toBe(200);
    expect(loggedOut.body.user).toBeNull();

    await request(app).post("/auth/register").send({
      username: "gwen",
      email: "gwen@example.com",
      password: "password123",
    });
    const loginRes = await request(app).post("/auth/login").send({
      email: "gwen@example.com",
      password: "password123",
    });
    const cookie = loginRes.headers["set-cookie"];

    const loggedIn = await request(app).get("/auth/me").set("Cookie", cookie);
    expect(loggedIn.status).toBe(200);
    expect(loggedIn.body.user.email).toBe("gwen@example.com");
  });
});
