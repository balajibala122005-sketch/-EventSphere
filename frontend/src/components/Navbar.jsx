import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays,
  LogOut,
  Menu,
  X,
  User,
  Search,
  ChevronDown,
  LayoutDashboard,
  Ticket,
  Shield,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "../services/eventService";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll to toggle glassmorphism navbar background
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  function logout() {
    localStorage.removeItem("eventsphere_user");
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
    window.location.reload();
  }

  function isActive(path) {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  }

  function closeMobile() {
    setMobileMenuOpen(false);
  }

  // Dedicated SaaS Admin Console uses its own AdminLayout & AdminHeader
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className={`navbar-wrapper ${isScrolled ? "scrolled" : ""}`}>
      <nav className="navbar" aria-label="Main Navigation">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="logo" onClick={closeMobile} aria-label="EventSphere Home">
            <div className="logo-badge">
              <CalendarDays size={20} />
              <span className="logo-glow" />
            </div>
            <div className="logo-text">
              Event<span>Sphere</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              Home
            </Link>
            <Link to="/events" className={`nav-link ${isActive("/events") ? "active" : ""}`}>
              Events
              <span className="nav-link-pill">Explore</span>
            </Link>

            {user && user.role === "USER" && (
              <Link
                to="/my-bookings"
                className={`nav-link ${isActive("/my-bookings") ? "active" : ""}`}
              >
                My Bookings
              </Link>
            )}

            {user && user.role === "ORGANIZER" && (
              <Link
                to="/organizer/dashboard"
                className={`nav-link ${isActive("/organizer/dashboard") ? "active" : ""}`}
              >
                Dashboard
              </Link>
            )}

            {user && user.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className={`nav-link ${isActive("/admin/dashboard") ? "active" : ""}`}
              >
                Admin Console
              </Link>
            )}
          </div>

          {/* Desktop User Actions */}
          <div className="nav-actions">
            <Link
              to="/events"
              className="nav-search-btn"
              title="Search events by title or city"
              aria-label="Search events"
            >
              <Search size={16} />
              <span>Search</span>
              <kbd className="nav-search-kbd">⌘K</kbd>
            </Link>

            {user ? (
              <div className="user-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="nav-user-chip"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                    <span className="user-online-dot" />
                  </div>
                  <div className="user-meta">
                    <span className="nav-user-name">{user.name}</span>
                    <span className="nav-user-role">{user.role}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`dropdown-chevron ${userDropdownOpen ? "open" : ""}`}
                  />
                </button>

                {/* User Popover Menu */}
                {userDropdownOpen && (
                  <div className="user-dropdown-menu" role="menu">
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar-large">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="dropdown-user-details">
                        <strong className="dropdown-name">{user.name}</strong>
                        <span className="dropdown-email">{user.email || "Verified Member"}</span>
                        <span className="dropdown-role-tag">{user.role}</span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <div className="dropdown-links">
                      {user.role === "USER" && (
                        <Link
                          to="/my-bookings"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Ticket size={16} />
                          <span>My Tickets & Bookings</span>
                        </Link>
                      )}

                      {user.role === "ORGANIZER" && (
                        <Link
                          to="/organizer/dashboard"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard size={16} />
                          <span>Organizer Dashboard</span>
                        </Link>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          to="/admin/dashboard"
                          className="dropdown-item"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Shield size={16} />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        to="/events"
                        className="dropdown-item"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <Sparkles size={16} />
                        <span>Discover Experiences</span>
                      </Link>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-logout-btn"
                      onClick={logout}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-auth-buttons">
                <Link to="/login" className="login-btn">
                  Log In
                </Link>

                <Link to="/register" className="signup-btn">
                  <span>Get Started</span>
                  <span className="signup-btn-shine" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            className="mobile-backdrop"
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}

        {/* Mobile Drawer Menu */}
        <div className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-drawer-header">
            <div className="logo-text">
              Event<span>Sphere</span>
            </div>
            <button
              type="button"
              className="mobile-close-btn"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mobile-drawer-nav">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
              onClick={closeMobile}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`nav-link ${isActive("/events") ? "active" : ""}`}
              onClick={closeMobile}
            >
              Explore Events
            </Link>

            {user && user.role === "USER" && (
              <Link
                to="/my-bookings"
                className={`nav-link ${isActive("/my-bookings") ? "active" : ""}`}
                onClick={closeMobile}
              >
                My Bookings
              </Link>
            )}

            {user && user.role === "ORGANIZER" && (
              <Link
                to="/organizer/dashboard"
                className={`nav-link ${isActive("/organizer/dashboard") ? "active" : ""}`}
                onClick={closeMobile}
              >
                Organizer Dashboard
              </Link>
            )}

            {user && user.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className={`nav-link ${isActive("/admin/dashboard") ? "active" : ""}`}
                onClick={closeMobile}
              >
                Admin Console
              </Link>
            )}
          </div>

          <div className="nav-actions-mobile">
            {user ? (
              <>
                <div className="nav-user-chip mobile-user-chip">
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                  </div>
                  <div className="user-meta">
                    <span className="nav-user-name">{user.name}</span>
                    <span className="nav-user-role">{user.role}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={logout}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="mobile-auth-stack">
                <Link to="/login" className="secondary-btn" onClick={closeMobile}>
                  Log In
                </Link>
                <Link to="/register" className="primary-btn" onClick={closeMobile}>
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;