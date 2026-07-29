import request from "supertest";
import app from "../app";
import pool from "../config/db";
import { hashPassword } from "../utils/hashPassword";


export async function createVerifiedUser(email: string, password: string, name = "Test User") {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
        `INSERT INTO users (email, name, password, "isEmailVerified", status, role)
         VALUES ($1, $2, $3, true, 'active', 'member')
         RETURNING id, email`,
        [email, name, hashedPassword]
    );
    return result.rows[0];
}

export async function loginAndGetToken(email: string, password: string) {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password });
    return res.body.token as string;
}