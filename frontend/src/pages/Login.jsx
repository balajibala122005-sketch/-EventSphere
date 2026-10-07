import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: email.trim(),
        password: password,
      });

      const user = response.data;

      // Save logged-in user to localStorage
      localStorage.setItem("eventsphere_user", JSON.stringify(user));
      showToast(`Welcome back, ${user.name || "Explorer"}!`, "success");

      // Navigate based on user role
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (user.role === "ORGANIZER") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/events");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data) {
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.error ||
                err.response.data.message ||
                "Invalid email or password. Please verify your credentials."
        );
      } else {
        setError("Unable to connect to the server. Please verify your backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-icon-badge">
            <CalendarDays size={24} />
          </div>
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to access your tickets, dashboard, or events</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-error" role="alert" style={{ marginBottom: "16px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="login-password">Password</label>
            </div>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            style={{ marginTop: "12px" }}
          >
            <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Switch Link */}
        <p className="auth-switch">
          Don't have an account yet?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}