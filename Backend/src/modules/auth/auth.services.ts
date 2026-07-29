// import { OAuth2Client } from "google-auth-library";
import pool from "../../config/db";
import ApiError from "../../utils/errors/ApiError";
import { checkPassword } from "../../utils/checkPassword";
import { generateToken } from "../../utils/generateToken";
import { generateOTP } from "../../utils/generatOtp";
import { hashPassword } from "../../utils/hashPassword";
import { sendEmail } from "../../utils/sendEmail";
import crypto from "crypto";
import { loginTemplate, resendOtpTemplate, verifyEmailTemplate, verifyOtpTemplate } from "../../emails/user.emails";


export const register = async ({ email, name, password }: { email: string, name: string, password: string, phone: string }) => {

    const { otp, hashedOtp, expires } = generateOTP()

    const findUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])


    if (findUser.rows.length > 0 && findUser.rows[0].isEmailVerified == true) {
        throw new ApiError(400, "this email already in use");
    }

    const hashedPassword = await hashPassword(password);

    if (findUser.rows.length > 0 && findUser.rows[0].isEmailVerified == false) {
        await pool.query("UPDATE users SET name = $1, password = $2, \"emailVerificationCode\" = $3, \"emailVerificationExpires\" = $4 WHERE email = $5", [name.toLowerCase(), hashedPassword, hashedOtp, expires, email])
    } else {
        await pool.query("INSERT INTO users (email, name, password, \"emailVerificationCode\", \"emailVerificationExpires\") VALUES ($1, $2, $3, $4, $5)", [email, name.toLowerCase(), hashedPassword, hashedOtp, expires])
    }


    setImmediate(() => {
        sendEmail({
            email: email,
            subject: "Verify your email",
            text: "",
            message: verifyEmailTemplate(name, otp),
        }).catch(err => console.log("email error:", err));
    })



    return;
}

export const resendOtp = async ({ email }: { email: string }) => {
    const { otp, hashedOtp, expires } = generateOTP()

    const findUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    if (findUser.rows.length === 0) {
        throw new ApiError(404, "user not found");
    }

    if (findUser.rows[0].isEmailVerified === true) {
        throw new ApiError(400, "this email already in use");
    }

    await pool.query("UPDATE users SET \"emailVerificationCode\" = $1, \"emailVerificationExpires\" = $2 WHERE email = $3", [hashedOtp, expires, email])


    await sendEmail({
        email: email,
        subject: "Resend Verification Code",
        text: "",
        message: resendOtpTemplate(otp),
    });

    return;
}

export const verifyEmail = async ({ email, otp }: { email: string, otp: string }, device: string) => {


    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    const findUser = await pool.query(`UPDATE users SET "isEmailVerified" = $1, "emailVerificationCode" = $2,status = 'active',
            "emailVerificationExpires" = $3 WHERE email = $4 AND "isEmailVerified" = $5 And "emailVerificationExpires" >= $6 AND "emailVerificationCode" = $7 RETURNING id,name,email,role`,
        [true, null, null, email, false, new Date(), hashedOtp])

    if (findUser.rowCount == 0) throw new ApiError(400, "Invalid or expired verification code");

    const session = await pool.query(
        `INSERT INTO sessions (user_id, device, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING id`,
        [findUser.rows[0].id, device]
    );

    const token = generateToken(findUser.rows[0].name, findUser.rows[0].id.toString(), findUser.rows[0].role, session.rows[0].id.toString(), findUser.rows[0].email)

    setImmediate(() => {
        sendEmail({
            email: findUser.rows[0].email,
            subject: "Account Created 🎉 - Aleef",
            text: "",
            message: verifyOtpTemplate(findUser.rows[0].name),
        }).catch(err => console.log("email error:", err));
    })


    return { user: findUser.rows[0], token }

}

export const login = async ({ email, password }: { email: string, password: string }, device: string) => {

    const findUser = await pool.query(`SELECT email, id, name, role, password, "isEmailVerified", status FROM users WHERE email = $1`, [email])

    if (findUser.rows.length === 0) {
        throw new ApiError(400, "email or password not correct");
    }

    const checkedPass = await checkPassword(password, findUser.rows[0].password)

    if (!checkedPass) {
        throw new ApiError(400, "email or password not correct");
    }

    if (findUser.rows[0].isEmailVerified == false) {
        throw new ApiError(401, "email not veryfied");
    }

    if (findUser.rows[0].status === "banned") {
        throw new ApiError(403, "your account is banned permanently, please contact support");
    }

    const session = await pool.query(
        `INSERT INTO sessions (user_id, device, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '7 days') RETURNING id`,
        [findUser.rows[0].id, device]
    );

    const token = generateToken(findUser.rows[0].name, findUser.rows[0].id.toString(), findUser.rows[0].role, session.rows[0].id.toString(), findUser.rows[0].email)

    const time = new Date().toLocaleString();

    setImmediate(() => {
        sendEmail({
            email: email,
            subject: "New Login Detected",
            text: "",
            message: loginTemplate(device, time),
        }).catch(err => console.log("email error:", err))
    })


    return { findUser: findUser.rows[0], token };
}