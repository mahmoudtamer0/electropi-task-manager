import request from "supertest";
import app from "../app";
import pool from "../config/db";
import { createVerifiedUser, loginAndGetToken } from "./helpers";

describe("Projects", () => {
    afterAll(async () => {
        await pool.end();
    });

    it("rejects creating a project without a token", async () => {
        const res = await request(app)
            .post("/api/v1/projects")
            .send({ name: "No Auth Project" });

        expect(res.status).toBe(401);
    });

    it("allows a logged-in user to create a project", async () => {
        const email = `owner_${Date.now()}@example.com`;
        await createVerifiedUser(email, "Password123!");
        const token = await loginAndGetToken(email, "Password123!");

        const res = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "My Project", description: "created in a test" });

        expect(res.status).toBe(201);
        expect(res.body.project.name).toBe("My Project");
    });

    it("blocks a user who is not a project member from viewing it", async () => {
        const ownerEmail = `owner2_${Date.now()}@example.com`;
        await createVerifiedUser(ownerEmail, "Password123!");
        const ownerToken = await loginAndGetToken(ownerEmail, "Password123!");

        const createRes = await request(app)
            .post("/api/v1/projects")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ name: "Private Project" });

        const projectId = createRes.body.project.id;

        const outsiderEmail = `outsider_${Date.now()}@example.com`;
        await createVerifiedUser(outsiderEmail, "Password123!");
        const outsiderToken = await loginAndGetToken(outsiderEmail, "Password123!");

        const res = await request(app)
            .get(`/api/v1/projects/${projectId}`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(res.status).toBe(403);
    });
});