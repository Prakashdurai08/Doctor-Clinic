// ─── Page: Booking ────────────────────────────────────────────
// 2-step appointment booking form. Step 1 collects personal
// details; Step 2 collects schedule and notes. Submits to
// Google Sheets via the SHEET_URL in constants.js.
// Shows a "Clinic Closed" banner when availability is toggled off.

import { useState } from "react";
import { LS, CLINIC, fmtDate, openWhatsApp, openEmail } from "../utils/constants";

export default function PageBooking() {
  const available = LS.isAvailable();
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", datetime: "", notes: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [step, setStep] = useState(1);

  // Minimum selectable datetime = right now (local time)
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDt = now.toISOString().slice(0, 16);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.age || !form.phone || !form.datetime) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const booking = await LS.addBooking(form);
      setLastBooking(booking);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("❌ Failed to submit. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Clinic Closed Banner ──────────────────────────────────
  if (!available) {
    return (
      <div className="page-wrapper">
        <div className="page-header">
          <span className="pill">Online Booking</span>
          <h1>Book an Appointment</h1>
        </div>
        <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
          <div className="closed-banner">
            <div className="closed-banner__icon">🚫</div>
            <div>
              <h3>Clinic Closed Today</h3>
              <p>Bookings are currently paused. Please call us or check back tomorrow.</p>
              <a href={`tel:${CLINIC.phone}`} className="btn btn--danger" style={{ marginTop: 12 }}>
                📞 Call {CLINIC.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Success State — shown after successful submission ─────
  if (submitted) {
    return (
      <div className="page-wrapper">
        <div className="page-header">
          <span className="pill">Booking Confirmed</span>
          <h1>Request Sent!</h1>
        </div>
        <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
          <div className="success-box">
            <div className="success-box__icon">✅</div>
            <h2>Your appointment request has been sent!</h2>
            <p>We'll confirm your slot shortly. You can also notify us via:</p>
            <div className="success-box__actions">
              <button className="btn btn--success" onClick={() => openWhatsApp(lastBooking)}>
                💬 Notify via WhatsApp
              </button>
              <button className="btn btn--outline" onClick={() => openEmail(lastBooking)}>
                ✉️ Notify via Email
              </button>
            </div>
            {/* Booking summary card */}
            <div className="booking-summary">
              <h4>Booking Summary</h4>
              <div className="booking-summary__row"><span>Name</span><strong>{lastBooking.name}</strong></div>
              <div className="booking-summary__row"><span>Phone</span><strong>{lastBooking.phone}</strong></div>
              <div className="booking-summary__row"><span>Date & Time</span><strong>{fmtDate(lastBooking.datetime)}</strong></div>
              {lastBooking.notes && (
                <div className="booking-summary__row"><span>Notes</span><strong>{lastBooking.notes}</strong></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Booking Form ─────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <span className="pill">Online Booking</span>
          <h1>Book an Appointment</h1>
          <p>Fill in the form below and we'll confirm your slot as soon as possible.</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 760, padding: "40px 20px" }}>

        {/* Step indicator — purple circle when active (App.css) */}
        <div className="step-indicator">
          <div className={`step-indicator__step${step >= 1 ? " active" : ""}`}>
            <div className="step-indicator__num">1</div>
            <span>Personal Details</span>
          </div>
          <div className="step-indicator__line" />
          <div className={`step-indicator__step${step >= 2 ? " active" : ""}`}>
            <div className="step-indicator__num">2</div>
            <span>Schedule & Notes</span>
          </div>
        </div>

        <form className="card booking-form" onSubmit={handleSubmit}>
          {/* Privacy note — purple left-border strip */}
          <div className="privacy-strip">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Your booking is securely saved to our clinic database and visible to staff immediately.
          </div>

          {/* ── Step 1: Personal Details ── */}
          {step === 1 && (
            <>
              <h2 style={{ marginBottom: 20 }}>Personal Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="name" className="form-control" placeholder="e.g. Arun Kumar" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input name="age" type="number" className="form-control" placeholder="e.g. 32" min="1" max="120" value={form.age} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input name="phone" type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className="form-control" placeholder="you@email.com" value={form.email} onChange={handleChange} />
                </div>
              </div>
              {/* Next button — validates step 1 fields before proceeding */}
              <button
                type="button"
                className="btn btn--primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  if (!form.name || !form.age || !form.phone) {
                    setError("Please fill name, age, and phone first.");
                  } else {
                    setError("");
                    setStep(2);
                  }
                }}
              >
                Next: Schedule →
              </button>
            </>
          )}

          {/* ── Step 2: Schedule & Notes ── */}
          {step === 2 && (
            <>
              <h2 style={{ marginBottom: 20 }}>Schedule & Notes</h2>
              <div className="form-group">
                <label className="form-label">Preferred Date & Time *</label>
                <input name="datetime" type="datetime-local" className="form-control" min={minDt} value={form.datetime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Symptoms / Notes</label>
                <textarea name="notes" className="form-control" rows="4" placeholder="Briefly describe your symptoms or any notes for the doctor…" value={form.notes} onChange={handleChange} />
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn--primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? "⏳ Submitting..." : "📅 Submit Appointment Request"}
                </button>
              </div>
            </>
          )}

          {error && <div className="alert alert--danger" style={{ marginTop: 16 }}>{error}</div>}
        </form>

        {/* Quick-info cards — phone and hours */}
        <div className="booking-info-cards">
          <a href={`tel:${CLINIC.phone}`} className="info-card">
            <div className="info-card__icon">📞</div>
            <div className="info-card__label">Call Instead</div>
            <div className="info-card__val">{CLINIC.phone}</div>
          </a>
          <div className="info-card">
            <div className="info-card__icon">🕐</div>
            <div className="info-card__label">Clinic Hours</div>
            <div className="info-card__val">Mon–Fri 9AM–7PM · Sat 9AM–2PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
