import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/auth.api";
import { ApiClientError } from "../../api/clients";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("mamoidtamer300@gmail.com");
  const [password, setPassword] = useState("Mahmoudtamer@2004");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await loginRequest({ email, password });
      login(res.token, res.user);
      navigate("/projects");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Taskapp</h1>
        <p className={styles.subtitle}>Log in to your account</p>
        <p className={styles.hint}>A seed account is pre-filled below so you can log in and try it out right away.</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </label>

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className={styles.footerText}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}