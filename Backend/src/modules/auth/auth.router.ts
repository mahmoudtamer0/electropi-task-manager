import express from "express";
import { login, register, resendOtp, verifyEmail } from "./auth.controller";
import validate from "../../middlewares/validate";
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema } from "./auth.validation";

const router = express.Router()

router.route("/register")
    .post(validate(registerSchema), register)

router.route("/verify-email")
    .post(validate(verifyOtpSchema), verifyEmail)

router.route("/resend-otp")
    .post(validate(resendOtpSchema), resendOtp)

router.route("/login")
    .post(validate(loginSchema), login)


export default router