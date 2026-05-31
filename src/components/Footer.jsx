// ─── Footer Component ─────────────────────────────────────────
// Site-wide footer with brand info, quick links, clinic hours,
// and a privacy note. Uses the navy background from CSS variables.

import { CLINIC } from "../utils/constants";

export default function Footer({ setPage }) {
  const go = (p) => { setPage(p); window.scrollTo({ top: 0 }); };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">

          {/* Brand column */}
          <div className="footer__brand">
            <div className="nav-logo" style={{ marginBottom: 12 }}>
              <span className="nav-logo__mark">M</span>
              <span className="nav-logo__text" style={{ color: "#fff" }}>MediCare Clinic</span>
            </div>
            <p>Specialized Care, Anytime. Trusted healthcare for you and your family since 2010.</p>
            <p style={{ marginTop: 10, fontSize: ".85rem" }}>📍 {CLINIC.address}</p>
            <p style={{ marginTop: 6, fontSize: ".85rem" }}>
              📞 <a href={`tel:${CLINIC.phone}`} style={{ color: "var(--teal)" }}>{CLINIC.phone}</a>
            </p>
            {/* Privacy note uses purple left-border strip */}
            <div className="privacy-strip" style={{ marginTop: 16 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your data is securely stored in the cloud and shared via WhatsApp/email when you choose.
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4>Quick Links</h4>
            <ul className="footer__links">
              {[["home", "Home"], ["booking", "Book Appointment"], ["doctor", "Doctor Info"], ["reviews", "Reviews"]].map(([p, l]) => (
                <li key={p}><button onClick={() => go(p)}>{l}</button></li>
              ))}
            </ul>
          </div>

          {/* Information links */}
          <div>
            <h4>Information</h4>
            <ul className="footer__links">
              {[["faq", "FAQ"], ["contact", "Contact Us"], ["dashboard", "Staff Dashboard"]].map(([p, l]) => (
                <li key={p}><button onClick={() => go(p)}>{l}</button></li>
              ))}
            </ul>
          </div>

          {/* Clinic hours */}
          <div>
            <h4>Clinic Hours</h4>
            <ul className="footer__links" style={{ gap: 6 }}>
              <li style={{ opacity: .75, fontSize: ".88rem" }}>Mon – Fri: 9:00 AM – 7:00 PM</li>
              <li style={{ opacity: .75, fontSize: ".88rem" }}>Saturday: 9:00 AM – 2:00 PM</li>
              <li style={{ opacity: .75, fontSize: ".88rem" }}>Sunday: Emergency Only</li>
              <li style={{ marginTop: 8 }}>
                <a href={`tel:${CLINIC.phone}`} className="btn btn--outline btn--sm">📞 Emergency Call</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2025 MediCare Clinic. All rights reserved.</span>
          <span>Built with ❤️ for better healthcare.</span>
        </div>
      </div>
    </footer>
  );
}
