// ─── Navbar Component ─────────────────────────────────────────
// Fixed top navigation with mobile hamburger menu.
// Highlights the active page link and shows a "Book" CTA button.

import { useState, useEffect } from "react";

export default function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (p) => {
    setPage(p);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const links = [
    ["home", "Home"],
    ["doctor", "Our Doctor"],
    ["reviews", "Reviews"],
    ["faq", "FAQ"],
    ["contact", "Contact"],
  ];

  return (
    <>
      {/* ── Desktop Navbar ──────────────────────────────────── */}
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">
          <button className="nav-logo" onClick={() => go("home")} aria-label="Home">
            <span className="nav-logo__mark">M</span>
            <span className="nav-logo__text">MediCare Clinic</span>
          </button>

          {/* Desktop links — hidden on mobile via CSS */}
          <div className="nav-links">
            {links.map(([p, l]) => (
              <button
                key={p}
                className={`nav-link${page === p ? " active" : ""}`}
                onClick={() => go(p)}
              >
                {l}
              </button>
            ))}
            {/* Book CTA button — purple primary style */}
            <button className="btn btn--primary btn--sm" onClick={() => go("booking")}>
              📅 Book Appointment
            </button>
          </div>

          {/* Hamburger — visible on mobile */}
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Mobile Slide-Down Menu ───────────────────────────── */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="mobile-menu__inner">
          {links.map(([p, l]) => (
            <button
              key={p}
              className={`mobile-link${page === p ? " active" : ""}`}
              onClick={() => go(p)}
            >
              {l}
            </button>
          ))}
          <button
            className="btn btn--primary"
            style={{ marginTop: 8 }}
            onClick={() => go("booking")}
          >
            📅 Book Appointment
          </button>
          <button className="btn btn--outline" onClick={() => go("dashboard")}>
            🔧 Staff Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
