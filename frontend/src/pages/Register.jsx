import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
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
          <span className="section-tag">START TODAY</span>

          <h1>
            Turn market
            <br />
            data into insight.
          </h1>

          <p>
            Create your account and get access to live charts,
            multiple timeframes and AI-powered market analysis.
          </p>

          <div className="signup-points">
            <div>
              <span>✓</span>
              Live stock monitoring
            </div>

            <div>
              <span>✓</span>
              Multi-timeframe charts
            </div>

            <div>
              <span>✓</span>
              AI prediction engine
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <Link to="/" className="mobile-logo logo">
            <span className="logo-icon">↗</span>
            TradePredict <span>AI</span>
          </Link>

          <h2>Create account</h2>
          <p className="auth-subtitle">
            Start monitoring the market smarter.
          </p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full name</label>

              <input
                type="text"
                placeholder="Your name"
                value={name}
                disabled={isSubmitting}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
              <label>Password</label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                disabled={isSubmitting}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm password</label>

              <input
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                disabled={isSubmitting}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
              <span>→</span>
            </button>
          </form>

          <p className="terms">
            By creating an account, you agree to our Terms of Service
            and Privacy Policy.
          </p>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;