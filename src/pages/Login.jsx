import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { FaLock, FaEnvelope, FaArrowRight } from "react-icons/fa";
import { useAdminAuth } from "../hooks/useAdminAuth";
import "./Login.css";

export default function Login() {
  const { isAdmin, ready, login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (ready && isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__glow" aria-hidden="true" />
      <form className="login-card" onSubmit={submit}>
        <span className="login-card__badge">Admin Access</span>
        <h1>Welcome Back</h1>
        <p className="login-card__sub">Sign in to manage Alpha Edge IT Services content.</p>

        <label className="login-field">
          <FaEnvelope aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="login-field">
          <FaLock aria-hidden="true" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="login-card__submit" disabled={loading || !email || !password}>
          {loading ? "Signing in…" : "Sign In"} {!loading && <FaArrowRight />}
        </button>

        {error && <p className="login-card__error">{error}</p>}
      </form>
    </div>
  );
}
