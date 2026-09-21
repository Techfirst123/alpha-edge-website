import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import logo from "../../assets/Alpha_Edge_logos.jpg";

// On admin.<domain> the public site lives on www.<domain>; elsewhere
// (localhost, workers.dev) it's the same host.
const publicSiteUrl = () => {
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  return h.startsWith("admin.") ? `https://www.${h.slice(6)}/` : "/";
};

export default function AdminLogin() {
  const { isAdmin, ready, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const target = location.state?.from && location.state.from !== "/admin/login" ? location.state.from : "/admin";
  if (ready && isAdmin) return <Navigate to={target} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate(target, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="adm-login">
      <div className="adm-login__art" aria-hidden="true">
        <div className="adm-login__grid" />
        <div className="adm-login__copy">
          <span className="adm-login__tag">Alpha Edge IT Services</span>
          <h2>Manage your whole website from one place.</h2>
          <p>Hero slides, products, services, enquiries, reviews and site details — every change saves to the database and goes live instantly.</p>
        </div>
      </div>

      <form className="adm-login__card" onSubmit={submit}>
        <img src={logo} alt="Alpha Edge" className="adm-login__logo" />
        <h1>Admin sign in</h1>
        <p className="adm-login__sub">Use your admin email and password.</p>

        <label className="adm-login__field">
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
        <label className="adm-login__field">
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

        {error && <p className="adm-login__error">{error}</p>}

        <button type="submit" className="adm-btn adm-btn--accent adm-login__submit" disabled={loading || !email || !password}>
          {loading ? <FaSpinner className="adm-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"} {!loading && <FaArrowRight />}
        </button>

        <a href={publicSiteUrl()} className="adm-login__back">← Back to website</a>
      </form>
    </div>
  );
}
