// ─── Navbar Component ─────────────────────────────────────────
// CHANGED:
//   1. Hamburger (3-bar) menu completely removed on mobile/tablet
//   2. Mobile top navbar shows logo + Book button only
//   3. All links hidden on mobile — handled by MobileNav bottom bar
//   4. Desktop view unchanged

import { useState, useEffect } from "react";

export default function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const go = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const links = [
    ["home",    "Home"],
    ["doctor",  "Our Doctor"],
    ["reviews", "Reviews"],
    ["faq",     "FAQ"],
    ["contact", "Contact"],
    ["token",   "🔢 Token Board"],
  ];

  return (
    <>
      <style>{`
        /* CHANGE: Hide hamburger and mobile-menu completely */
        .hamburger { display: none !important; }
        .mobile-menu { display: none !important; }

        /* CHANGE: Hide nav links on mobile/tablet */
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .navbar__mobile-book { display: flex !important; }
        }

        /* CHANGE: Show Book button in top navbar on mobile only */
        .navbar__mobile-book {
          display: none;
          align-items: center;
        }
      `}</style>

      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">

          {/* Logo — always visible */}
          <button className="nav-logo" onClick={() => go("home")} aria-label="Home">
            <span className="nav-logo__mark">M</span>
            <span className="nav-logo__text">MediCare Clinic</span>
          </button>

          {/* Desktop nav links — hidden on mobile via CSS */}
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
            <button
              className="btn btn--primary btn--sm"
              onClick={() => go("booking")}
            >
              📅 Book Appointment
            </button>
          </div>

          {/* CHANGE: Mobile top-right — Book button only, no hamburger */}
          <div className="navbar__mobile-book">
            <button
              className="btn btn--primary btn--sm"
              onClick={() => go("booking")}
              style={{ fontSize: ".82rem", padding: "8px 14px" }}
            >
              📅 Book
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}
