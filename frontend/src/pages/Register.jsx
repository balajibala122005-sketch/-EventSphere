import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  ArrowRight,
  Ticket,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleRoleSelect(selectedRole) {
    setForm({
      ...form,
      role: selectedRole,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Password validation (backend requires minimum 8 characters)
    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // Confirm password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/users/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      });

      const user = response.data;

      // Save user to localStorage
      localStorage.setItem("eventsphere_user", JSON.stringify(user));
      showToast(`Account created successfully! Welcome to EventSphere.`, "success");

      // Navigate based on selected role
      if (form.role === "ORGANIZER" || user.role === "ORGANIZER") {
        navigate("/organizer/dashboard");
      } else {
        navigate("/events");
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data) {
        setError(
          typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.error || "Registration failed. Please try again."
        );
      } else {
        setError("Unable to connect to the server. Please verify your backend is active.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card register-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="auth-icon-badge">
            <CalendarDays size={24} />
          </div>
          <h1>Create Your Account</h1>
          <p className="auth-subtitle">Join EventSphere to discover, book, or host live experiences</p>
        </div>

        {/* Role Selector Cards */}
        <div className="role-selection-group">
          <label className="role-group-label">Choose your account purpose</label>
          <div className="role-options-grid">
            <button
              type="button"
              className={`role-option-card ${form.role === "USER" ? "selected" : ""}`}
              onClick={() => handleRoleSelect("USER")}
            >
              <div className="role-option-icon">
                <Ticket size={20} />
              </div>
              <div className="role-option-info">
                <strong>Event Attendee</strong>
                <span>Discover & reserve digital tickets</span>
              </div>
              {form.role === "USER" && <CheckCircle2 size={16} className="role-check" />}
            </button>

            <button
              type="button"
              className={`role-option-card ${form.role === "ORGANIZER" ? "selected" : ""}`}
              onClick={() => handleRoleSelect("ORGANIZER")}
            >
              <div className="role-option-icon">
                <Briefcase size={20} />
              </div>
              <div className="role-option-info">
                <strong>Event Organizer</strong>
                <span>Create, publish & sell tickets</span>
              </div>
              {form.role === "ORGANIZER" && <CheckCircle2 size={16} className="role-check" />}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="form-error" role="alert" style={{ marginBottom: "16px" }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                id="reg-name"
                name="name"
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="reg-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <div className="input-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={handleChange}
                required
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password & Confirm Grid */}
          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
            style={{ marginTop: "14px" }}
          >
            <span>{loading ? "Creating Account..." : "Complete Registration"}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Switch to Login */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;