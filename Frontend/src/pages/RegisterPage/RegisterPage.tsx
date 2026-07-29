import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerRequest, verifyEmailRequest, resendOtpRequest } from "../../api/auth.api";
import { ApiClientError } from "../../api/clients";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext/ToastContext";
import styles from "./RegisterPage.module.css";

type Step = "register" | "verify";

export default function RegisterPage() {
    const [step, setStep] = useState<Step>("register");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            await registerRequest({ name, email, password });
            setStep("verify");
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : "Registration failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const res = await verifyEmailRequest({ email, otp });
            login(res.token, res.user);
            navigate("/projects");
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : "Verification failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtpRequest({ email });
            showToast("success", "A new code has been sent to your email");
        } catch (err) {
            setError(err instanceof ApiClientError ? err.message : "Could not resend code");
        }
    };

    return (
        <div className={styles.page}>
            {step === "register" ? (
                <form className={styles.card} onSubmit={handleRegister}>
                    <h1 className={styles.title}>Taskapp</h1>
                    <p className={styles.subtitle}>Create your account</p>

                    {error && <div className={styles.error}>{error}</div>}

                    <label className={styles.label}>
                        Name
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </label>

                    <label className={styles.label}>
                        Email
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </label>

                    <label className={styles.label}>
                        Password
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                        />
                    </label>

                    <button type="submit" className={styles.submit} disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Register"}
                    </button>

                    <p className={styles.footerText}>
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                </form>
            ) : (
                <form className={styles.card} onSubmit={handleVerify}>
                    <h1 className={styles.title}>Verify your email</h1>
                    <p className={styles.subtitle}>We sent a code to {email}</p>

                    {error && <div className={styles.error}>{error}</div>}

                    <label className={styles.label}>
                        Verification code
                        <input
                            className={styles.input}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </label>

                    <button type="submit" className={styles.submit} disabled={isSubmitting}>
                        {isSubmitting ? "Verifying..." : "Verify"}
                    </button>

                    <p className={styles.footerText}>
                        Didn't get a code?{" "}
                        <button type="button" className={styles.linkButton} onClick={handleResend}>
                            Resend
                        </button>
                    </p>
                </form>
            )}
        </div>
    );
}