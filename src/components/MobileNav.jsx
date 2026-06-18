// ─── Mobile Bottom Navigation ─────────────────────────────────
// CHANGED:
//   1. Book tab — clean filled purple rounded button INSIDE the bar (no float)
//   2. More drawer — professional slide-up sheet, polished cards
//   3. Drawer animation smoother
//   4. Token Board, Staff Dashboard, Reviews, FAQ in drawer

import { useState, useEffect } from "react";

export default function MobileNav({ page, setPage }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const go = (p) => {
    setPage(p);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // CHANGE: Toggle body class so WhatsApp button can reposition
  // when the More drawer is open (see WhatsAppButton.jsx)
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add("drawer-open");
      const close = () => setDrawerOpen(false);
      window.addEventListener("hashchange", close);
      return () => {
        document.body.classList.remove("drawer-open");
        window.removeEventListener("hashchange", close);
      };
    } else {
      document.body.classList.remove("drawer-open");
    }
  }, [drawerOpen]);

  const drawerItems = [
    { id: "token",     icon: "🔢", label: "Token Board",    desc: "Live queue for waiting room",   badge: null },
    { id: "dashboard", icon: "🔒", label: "Staff Dashboard", desc: "Doctor & staff access",          badge: "Staff only" },
    { id: "reviews",   icon: "⭐", label: "Reviews",         desc: "Patient feedback & ratings",    badge: null },
    { id: "faq",       icon: "❓", label: "FAQ",             desc: "Frequently asked questions",   badge: null },
  ];

  const isMoreActive = ["token","dashboard","reviews","faq","pricing"].includes(page);

  // Tab config — Book has special style, More opens drawer
  const tabs = [
    { id: "home",    icon: "🏠", label: "Home" },
    { id: "booking", icon: "📅", label: "Book",  isCTA: true },
    { id: "doctor",  icon: "🧑‍⚕️", label: "Doctor" },
    { id: "contact", icon: "📞", label: "Contact" },
    { id: "more",    icon: null,  label: "More",  isMore: true },
  ];

  return (
    <>
      {/* ── Bottom Tab Bar ──────────────────────────────────── */}
      <nav className="mobile-bottom-nav">
        {tabs.map(t => {

          // CHANGE: Book — solid filled pill INSIDE the bar, same height, no floating
          if (t.isCTA) {
            const isActive = page === "booking";
            return (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "6px 4px 8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {/* Filled pill — sits cleanly inside the bar */}
                <div style={{
                  background: isActive
                    ? "linear-gradient(135deg,#7c3aed,#2563eb)"
                    : "linear-gradient(135deg,var(--teal),var(--blue))",
                  borderRadius: 12,
                  padding: "7px 14px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                  maxWidth: 68,
                }}>
                  <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>📅</span>
                  <span style={{
                    fontSize: ".6rem",
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                    letterSpacing: ".02em",
                  }}>Book</span>
                </div>
              </button>
            );
          }

          // More tab — opens drawer
          if (t.isMore) {
            return (
              <button
                key="more"
                onClick={() => setDrawerOpen(o => !o)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  padding: "8px 4px 10px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {(drawerOpen || isMoreActive) && (
                  <span style={{
                    position: "absolute", top: 5, left: "50%",
                    transform: "translateX(-50%)",
                    width: 20, height: 3, borderRadius: 2,
                    background: "linear-gradient(90deg,var(--teal),var(--blue))",
                  }}/>
                )}
                {/* Grid dots icon for "More" */}
                <svg
                  width="22" height="22" viewBox="0 0 24 24"
                  fill="none" stroke={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}
                  strokeWidth="2" strokeLinecap="round"
                  style={{ marginTop: 6 }}
                >
                  <circle cx="5"  cy="5"  r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="12" cy="5"  r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="19" cy="5"  r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="5"  cy="12" r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="12" cy="12" r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="19" cy="12" r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="5"  cy="19" r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="12" cy="19" r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                  <circle cx="19" cy="19" r="1.5" fill={(drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)"}/>
                </svg>
                <span style={{
                  fontSize: ".65rem",
                  fontWeight: (drawerOpen || isMoreActive) ? 700 : 500,
                  color: (drawerOpen || isMoreActive) ? "var(--teal-dark)" : "var(--gray-400)",
                  fontFamily: "var(--font-body)",
                }}>More</span>
              </button>
            );
          }

          // Regular tab
          const isActive = page === t.id;
          return (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "8px 4px 10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {isActive && (
                <span style={{
                  position: "absolute", top: 5, left: "50%",
                  transform: "translateX(-50%)",
                  width: 20, height: 3, borderRadius: 2,
                  background: "linear-gradient(90deg,var(--teal),var(--blue))",
                }}/>
              )}
              <span style={{
                fontSize: "1.3rem", lineHeight: 1, marginTop: 6,
                filter: isActive ? "none" : "grayscale(40%)",
              }}>{t.icon}</span>
              <span style={{
                fontSize: ".65rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--teal-dark)" : "var(--gray-400)",
                fontFamily: "var(--font-body)",
              }}>{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── CHANGE: More drawer — professional slide-up sheet ── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.4)",
              zIndex: 260,
            }}
          />

          {/* Sheet */}
          <div style={{
            position: "fixed",
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: 270,
            background: "#fff",
            borderRadius: "24px 24px 0 0",
            paddingBottom: "env(safe-area-inset-bottom,12px)",
            boxShadow: "0 -8px 40px rgba(0,0,0,.18)",
            animation: "slideUp .2s cubic-bezier(.32,.72,0,1)",
          }}>

            {/* Handle bar */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: "#e2e8f0",
              margin: "12px auto 0",
            }}/>

            {/* Sheet header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px 10px",
              borderBottom: "1px solid #f1f5f9",
            }}>
              <p style={{
                fontSize: ".8rem",
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                margin: 0,
              }}>More options</p>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "#f1f5f9",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: "#64748b",
                }}
              >✕</button>
            </div>

            {/* Drawer items */}
            <div style={{ padding: "10px 16px 16px" }}>
              {drawerItems.map((item, idx) => {
                const isActive = page === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "13px 16px",
                      marginBottom: idx < drawerItems.length - 1 ? 6 : 0,
                      borderRadius: 14,
                      border: isActive
                        ? "1.5px solid var(--teal)"
                        : "1px solid #f1f5f9",
                      background: isActive ? "#e1f5ee" : "#f8fafc",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all .15s ease",
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: isActive ? "#fff" : "#fff",
                      border: isActive ? "1.5px solid var(--teal)" : "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: ".95rem",
                        fontWeight: 600,
                        color: isActive ? "var(--teal-dark)" : "#1e293b",
                        fontFamily: "var(--font-body)",
                        marginBottom: 2,
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: ".75rem",
                        color: "#94a3b8",
                        fontFamily: "var(--font-body)",
                      }}>
                        {item.desc}
                      </div>
                    </div>

                    {/* Badge or chevron */}
                    {item.badge ? (
                      <span style={{
                        fontSize: ".65rem",
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 99,
                        background: "#f3e8ff",
                        color: "#7e22ce",
                        border: "1px solid #c084fc",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}>{item.badge}</span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={isActive ? "var(--teal)" : "#cbd5e1"}
                        strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="mobile-bottom-nav-spacer"/>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .mobile-bottom-nav {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 250;
          background: #fff;
          border-top: 1px solid #f1f5f9;
          align-items: stretch;
          height: 64px;
          box-shadow: 0 -2px 16px rgba(0,0,0,.08);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .mobile-bottom-nav-spacer { display: none; height: 64px; }
        @media (max-width: 768px) {
          .mobile-bottom-nav { display: flex !important; }
          .mobile-bottom-nav-spacer { display: block !important; }
        }
      `}</style>
    </>
  );
}
