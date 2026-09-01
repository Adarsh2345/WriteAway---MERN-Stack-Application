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

  it("registers a new user and redirects to login", async () => {
    const res = await request(app).post("/auth/register").type("form").send({
      username: "alice",
      email: "alice@example.com",
      password: "password123",
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/auth/login");
  });

  it("rejects registration with an invalid email format", async () => {
    const res = await request(app).post("/auth/register").type("form").send({
      username: "bob",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain("valid email address");
  });

  it("rejects registration with a too-short password", async () => {
    const res = await request(app).post("/auth/register").type("form").send({
      username: "carol",
      email: "carol@example.com",
      password: "123",
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain("at least 6 characters");
  });

  it("rejects registration when the email is already used", async () => {
    await request(app).post("/auth/register").type("form").send({
      username: "dave",
      email: "dave@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/register").type("form").send({
      username: "dave2",
      email: "dave@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain("User already exists");
  });

  it("logs in with correct credentials and sets a session cookie", async () => {
    await request(app).post("/auth/register").type("form").send({
      username: "erin",
      email: "erin@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/login").type("form").send({
      email: "erin@example.com",
      password: "password123",
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/user/profile");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects login with the wrong password", async () => {
    await request(app).post("/auth/register").type("form").send({
      username: "frank",
      email: "frank@example.com",
      password: "password123",
    });

    const res = await request(app).post("/auth/login").type("form").send({
      email: "frank@example.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(200);
    expect(res.text).toContain("Incorrect password");
  });

  it("redirects an unauthenticated user away from a protected route", async () => {
    const res = await request(app).get("/user/profile");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/auth/login");
  });
});
