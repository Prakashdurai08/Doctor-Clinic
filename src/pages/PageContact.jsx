// ─── Page: Contact ────────────────────────────────────────────
// Two-column layout: left = contact buttons + clinic info,
// right = message form + embedded map. On submit, shows
// WhatsApp/Email send options (data is NOT saved to server).

import { useState } from "react";
import FadeUp from "../components/FadeUp";
import { CLINIC } from "../utils/constants";

export default function PageContact({ setPage }) {
  const [form, setForm] = useState({ name: "", phone: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.msg) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="page-wrapper">
      {/* Page header — purple gradient bg */}
      <div className="page-header">
        <div className="container">
          <span className="pill">Get in Touch</span>
          <h1>Contact Us</h1>
          <p>We're always happy to hear from you. Reach out any way that's convenient.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="contact-grid">

            {/* ── Left Column: Contact Buttons + Info ──────────── */}
            <FadeUp>
              <h2 style={{ marginBottom: 20 }}>Reach Us</h2>

              {/* Quick-action contact buttons */}
              <div className="contact-big-btns">
                <a
                  href={`https://wa.me/${CLINIC.whatsapp}?text=Hello%20MediCare%20Clinic`}
                  target="_blank" rel="noreferrer"
                  className="contact-big-btn contact-big-btn--wa"
                >
                  <span>💬</span>
                  <div>
                    <div className="contact-big-btn__lbl">WhatsApp</div>
                    <div className="contact-big-btn__val">Chat with us now</div>
                  </div>
                </a>
                <a href={`mailto:${CLINIC.email}`} className="contact-big-btn contact-big-btn--email">
                  <span>✉️</span>
                  <div>
                    <div className="contact-big-btn__lbl">Email</div>
                    <div className="contact-big-btn__val">{CLINIC.email}</div>
                  </div>
                </a>
                <a href={`tel:${CLINIC.phone}`} className="contact-big-btn contact-big-btn--call">
                  <span>📞</span>
                  <div>
                    <div className="contact-big-btn__lbl">Call / Emergency</div>
                    <div className="contact-big-btn__val">{CLINIC.phone}</div>
                  </div>
                </a>
              </div>

              {/* Clinic info rows */}
              <h2 style={{ margin: "32px 0 16px" }}>Clinic Information</h2>
              <div className="card" style={{ padding: 24 }}>
                {[
                  { icon: "📍", label: "Address", val: CLINIC.address },
                  { icon: "🕐", label: "Hours", val: "Mon–Fri: 9AM–7PM · Sat: 9AM–2PM · Sun: Emergency only" },
                  { icon: "📞", label: "Phone", val: CLINIC.phone },
                  { icon: "✉️", label: "Email", val: CLINIC.email },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="info-row">
                    <span className="info-row__icon">{icon}</span>
                    <div><strong>{label}</strong><span>{val}</span></div>
                  </div>
                ))}
              </div>

              {/* Privacy note — purple left-border strip */}
              <div className="privacy-strip" style={{ marginTop: 16 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Your message is not stored on our servers. We'll respond via WhatsApp or email.
              </div>
            </FadeUp>

            {/* ── Right Column: Message Form + Map ─────────────── */}
            <FadeUp>
              <h2 style={{ marginBottom: 20 }}>Send us a Message</h2>
              <div className="card" style={{ padding: 28 }}>
                {!sent ? (
                  // Message form
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Your Name *</label>
                      <input name="name" className="form-control" placeholder="Your name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input name="phone" type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message *</label>
                      <textarea name="msg" className="form-control" rows="5" placeholder="Your message…" value={form.msg} onChange={handleChange} required />
                    </div>
                    {error && <div className="alert alert--danger">{error}</div>}
                    <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>
                      📤 Send Message
                    </button>
                  </form>
                ) : (
                  // Success state with WhatsApp/Email send options
                  <div className="success-box" style={{ textAlign: "center" }}>
                    <div className="success-box__icon">✅</div>
                    <h3>Message Received!</h3>
                    <p>Thank you for reaching out. We'll get back to you shortly.</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
                      <button
                        className="btn btn--success"
                        onClick={() => {
                          window.open(
                            `https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(`Name: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.msg}`)}`,
                            "_blank"
                          );
                        }}
                      >
                        💬 Send via WhatsApp
                      </button>
                      <button
                        className="btn btn--outline"
                        onClick={() => {
                          const s = encodeURIComponent(`Message from ${form.name}`);
                          const b = encodeURIComponent(`Name: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.msg}`);
                          window.location.href = `mailto:${CLINIC.email}?subject=${s}&body=${b}`;
                        }}
                      >
                        ✉️ Send via Email
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Embedded map */}
              <div style={{ marginTop: 24 }}>
                <div className="map-wrap" style={{ height: 280 }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.032673817547!2d80.20946491482177!3d13.089613790789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265a56a282ec3%3A0xcea9f1ca7cff5019!2sAnna%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1620000000000"
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                    title="Clinic Location"
                  />
                </div>
                <a
                  href="https://maps.google.com/?q=Anna+Nagar+Chennai"
                  target="_blank" rel="noreferrer"
                  className="btn btn--outline"
                  style={{ marginTop: 12, display: "inline-flex" }}
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}
