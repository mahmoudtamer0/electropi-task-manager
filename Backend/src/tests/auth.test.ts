import request from "supertest";
import app from "../app";
import pool from "../config/db";
import { createVerifiedUser } from "./helpers";
import { describe } from "node:test";

describe("Auth", () => {
    afterAll(async () => {
        await pool.end();
    });

    it("registers a new user successfully", async () => {
        const email = `register_${Date.now()}@example.com`;

        const res = await request(app)
            .post("/api/v1/auth/register")
            .send({ name: "New User", email, password: "Password123!" });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("success");
    });

    it("rejects login with the wrong password", async () => {
        const email = `login_${Date.now()}@example.com`;
        await createVerifiedUser(email, "CorrectPass123!");

        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({ email, password: "WrongPass123!" });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe("fail");
    });
});