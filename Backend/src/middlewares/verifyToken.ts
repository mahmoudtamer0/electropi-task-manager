import jwt from "jsonwebtoken";
import catchAsync from "../utils/errors/catchAsync";
import ApiError from "../utils/errors/ApiError";
import pool from "../config/db";
import { getCache, setCache } from "../config/cache";

export const verifyToken = catchAsync(async (req, res, next) => {

    const headers = req.headers["authorization"]

    if (!headers || !headers.startsWith("Bearer ")) {
        return next(new ApiError(401, "No token provided"));
    }

    const token = headers.split(" ")[1]

    let decoded: any;
    const jwtSecretKey = process.env["JWT_SECRET"]

    try {
        if (!token) return next(new ApiError(401, "Session expired. Please login again."));
        if (!jwtSecretKey) return next(new ApiError(401, "Session expired. Please login again."));

        decoded = jwt.verify(token, jwtSecretKey);
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            return next(new ApiError(401, "Session expired. Please login again."));
        }
        return next(new ApiError(401, "Session expired. Please login again."));
    }

    const cacheKey = `session:${decoded.sessionId}`;
    const cachedSession = getCache(cacheKey);

    if (!cachedSession) {
        const session = await pool.query("SELECT user_id FROM sessions WHERE id = $1", [decoded.sessionId]);
        if (session.rowCount === 0) {
            return next(new ApiError(401, "Session expired. Please login again."));
        }
        setCache(cacheKey, session.rows[0], 1000);
    }

    req.user = decoded;
    next();
})