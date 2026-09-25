import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="logo auth-logo">
          <span className="logo-icon">↗</span>
          TradePredict <span>AI</span>
        </Link>

        <div className="auth-hero">
          <span className="section-tag">WELCOME BACK</span>

          <h1>
            Your market.
            <br />
            Your edge.
          </h1>

          <p>
            Sign in to monitor the market and generate
            AI-powered short-term predictions.
          </p>

          <div className="auth-market-preview">
            <div>
              <small>NIFTY 50</small>
              <strong>24,968.45</strong>
            </div>

            <span className="positive-change">+0.74%</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <Link to="/" className="mobile-logo logo">
            <span className="logo-icon">↗</span>
            TradePredict <span>AI</span>
          </Link>

          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Login to continue to your dashboard.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email address</label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert("Password reset will be added later.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
              <span>→</span>
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;