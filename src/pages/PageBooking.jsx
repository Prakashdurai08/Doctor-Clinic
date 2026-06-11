// ─── Page: Booking ────────────────────────────────────────────
// CHANGED: Confetti on success, inline field errors, toast notifications.

import { useState } from "react";
import { LS, CLINIC, fmtDate, openWhatsApp, openEmail } from "../utils/constants";
import Confetti from "../components/Confetti";
import { toast } from "../components/Toast";



// CHANGE: Slot grid helpers — generates 30-min slots within clinic hours
const SLOT_CONFIG = {
  0: null,                          // Sunday — closed
  1: { start: 9, end: 19 },        // Mon
  2: { start: 9, end: 19 },        // Tue
  3: { start: 9, end: 19 },        // Wed
  4: { start: 9, end: 19 },        // Thu
  5: { start: 9, end: 19 },        // Fri
  6: { start: 9, end: 14 },        // Sat — closes 2 PM
};

const generateSlots = (dateStr) => {
  if (!dateStr) return [];
  const d = new Date(dateStr);
  const config = SLOT_CONFIG[d.getDay()];
  if (!config) return [];
  const slots = [];
  for (let h = config.start; h < config.end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
};

const fmtSlot = (t) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

// Next 14 days excluding Sundays for the date picker
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 21 && dates.length < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

export default function PageBooking() {
  const available = LS.isAvailable();
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", datetime: "", notes: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  // CHANGE: Separate date and slot selection for the slot grid
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDt = now.toISOString().slice(0, 16);

  // CHANGE: Validate datetime against clinic hours
  const isValidClinicTime = (dt) => {
    if (!dt) return false;
    const d = new Date(dt);
    const day = d.getDay();        // 0 = Sunday
    const totalMins = d.getHours() * 60 + d.getMinutes();
    if (day === 0) return false;                           // Sunday blocked
    if (day === 6) return totalMins >= 540 && totalMins <= 840;  // Sat 9AM–2PM
    return totalMins >= 540 && totalMins <= 1140;          // Mon–Fri 9AM–7PM
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  // CHANGE: Added Indian mobile number validation (10 digits, starts 6–9)
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.age) e.age = "Age is required";
    if (Number(form.age) < 1 || Number(form.age) > 120) e.age = "Please enter a valid age";
    if (!form.phone.trim()) {
      e.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s|-/g, ""))) {
      e.phone = "Enter a valid 10-digit Indian mobile number";
    }
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setStep(2);
  };

  // CHANGE: Added clinic hours validation before submitting
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.datetime) {
      setErrors({ datetime: "Please select a date and time" });
      return;
    }
    if (!isValidClinicTime(form.datetime)) {
      setErrors({ datetime: "Please select a time within clinic hours (Mon–Fri 9AM–7PM, Sat 9AM–2PM). We are closed on Sundays." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const booking = await LS.addBooking(form);
      setLastBooking(booking);
      setSubmitted(true);
      setShowConfetti(true);
      toast.success("Appointment booked successfully! 🎉");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setShowConfetti(false), 4000);
    } catch {
      toast.error("Failed to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = (name) => ({
    borderColor: errors[name] ? "var(--danger)" : undefined,
    boxShadow: errors[name] ? "0 0 0 3px rgba(229,62,62,.12)" : undefined,
  });

  if (!available) return (
    <div className="page-wrapper">
      <div className="page-header"><div className="container"><span className="pill">Online Booking</span><h1>Book an Appointment</h1></div></div>
      <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
        <div className="closed-banner">
          <div className="closed-banner__icon">🚫</div>
          <div>
            <h3>Clinic Closed Today</h3>
            <p>Bookings are currently paused. Please call us or check back tomorrow.</p>
            <a href={`tel:${CLINIC.phone}`}
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 700,
                fontSize: ".95rem",
                border: "2px solid rgba(255,255,255,0.4)",
                textDecoration: "none",
                transition: "background .2s ease",
                WebkitTapHighlightColor: "transparent", /* removes default mobile blue flash */
              }}
              onMouseDown={e => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
              onMouseUp={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              onTouchStart={e => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
              onTouchEnd={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              📞 Call {CLINIC.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="page-wrapper">
      {showConfetti && <Confetti />}
      <div className="page-header"><div className="container"><span className="pill">Booking Confirmed</span><h1>🎉 Request Sent!</h1></div></div>
      <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
        <div className="success-box">
          <div className="success-box__icon" style={{ fontSize: "4rem" }}>🎊</div>
          <h2>Your appointment request has been sent!</h2>
          <p>We'll confirm your slot shortly. Notify us faster via:</p>
          <div className="success-box__actions">
            <button className="btn btn--success" onClick={() => { openWhatsApp(lastBooking); toast.info("Opening WhatsApp…"); }}>💬 Notify via WhatsApp</button>
            <button className="btn btn--outline" onClick={() => { openEmail(lastBooking); toast.info("Opening Email…"); }}>✉️ Notify via Email</button>
          </div>
          <div className="booking-summary">
            <h4>Booking Summary</h4>
            <div className="booking-summary__row"><span>Name</span><strong>{lastBooking.name}</strong></div>
            <div className="booking-summary__row"><span>Phone</span><strong>{lastBooking.phone}</strong></div>
            <div className="booking-summary__row"><span>Date & Time</span><strong>{fmtDate(lastBooking.datetime)}</strong></div>
            {lastBooking.notes && <div className="booking-summary__row"><span>Notes</span><strong>{lastBooking.notes}</strong></div>}
          </div>
          <div style={{ marginTop: 16, padding: "14px 20px", background: "var(--teal-light)", borderRadius: 10, fontSize: ".88rem", color: "var(--teal-dark)" }}>
            💡 <strong>Tip:</strong> Check your queue position on our <strong>Token Board</strong> in the nav menu.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header"><div className="container"><span className="pill">Online Booking</span><h1>Book an Appointment</h1><p>Fill in the form below and we'll confirm your slot.</p></div></div>
      <div className="container" style={{ maxWidth: 760, padding: "40px 20px" }}>
        {/* CHANGE: Improved step indicator — filled + checkmark on complete, grayed until reached */}
        <div className="step-indicator">
          <div className={`step-indicator__step${step >= 1 ? " active" : ""}${step > 1 ? " done" : ""}`}>
            <div className="step-indicator__num">
              {step > 1 ? "✓" : "1"}
            </div>
            <span>Personal Details</span>
          </div>
          <div className={`step-indicator__line${step > 1 ? " done" : ""}`} />
          <div className={`step-indicator__step${step >= 2 ? " active" : ""}`}>
            <div className="step-indicator__num">2</div>
            <span>Schedule & Notes</span>
          </div>
        </div>

        <form className="card booking-form" onSubmit={handleSubmit}>
          <div className="privacy-strip">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Your booking is securely saved to our clinic database.
          </div>

          {step === 1 && (
            <>
              <h2 style={{ marginBottom: 20 }}>Personal Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="name" className="form-control" placeholder="e.g. Arun Kumar" value={form.name} onChange={handleChange} style={fieldStyle("name")} />
                  {errors.name && <span style={{ color: "var(--danger)", fontSize: ".8rem", marginTop: 4, display: "block" }}>⚠ {errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input name="age" type="number" className="form-control" placeholder="e.g. 32" min="1" max="120" value={form.age} onChange={handleChange} style={fieldStyle("age")} />
                  {errors.age && <span style={{ color: "var(--danger)", fontSize: ".8rem", marginTop: 4, display: "block" }}>⚠ {errors.age}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input name="phone" type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} style={fieldStyle("phone")} />
                  {errors.phone && <span style={{ color: "var(--danger)", fontSize: ".8rem", marginTop: 4, display: "block" }}>⚠ {errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span style={{ color: "var(--gray-400)", fontSize: ".8rem" }}>(optional)</span></label>
                  <input name="email" type="email" className="form-control" placeholder="you@email.com" value={form.email} onChange={handleChange} />
                </div>
              </div>
              <button type="button" className="btn btn--primary" style={{ marginTop: 8 }} onClick={handleNext}>Next: Schedule →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ marginBottom: 20 }}>Schedule & Notes</h2>

              {/* CHANGE: Date selector row */}
              <div className="form-group">
                <label className="form-label">Select Date *</label>
                <div style={{
                  display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4,
                }}>
                  {getAvailableDates().map(dateStr => {
                    const d = new Date(dateStr);
                    const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedSlot("");
                          setForm(f => ({ ...f, datetime: "" }));
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: isSelected ? "2px solid var(--teal)" : "1.5px solid var(--gray-200)",
                          background: isSelected ? "var(--teal-light)" : "#fff",
                          color: isSelected ? "var(--teal-dark)" : "var(--gray-700)",
                          fontWeight: isSelected ? 700 : 400,
                          fontSize: ".85rem",
                          cursor: "pointer",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHANGE: Time slot grid — only shows after date is selected */}
              {selectedDate && (
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Select Time Slot *</label>
                  {generateSlots(selectedDate).length === 0 ? (
                    <p style={{ color: "var(--danger)", fontSize: ".9rem", marginTop: 8 }}>
                      No slots available on this day.
                    </p>
                  ) : (
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
                      gap: 8,
                      marginTop: 8,
                    }}>
                      {generateSlots(selectedDate).map(slot => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedSlot(slot);
                              // CHANGE: Combine date + slot into datetime for existing form logic
                              setForm(f => ({ ...f, datetime: `${selectedDate}T${slot}` }));
                              setErrors(e => ({ ...e, datetime: "" }));
                            }}
                            style={{
                              padding: "10px 6px",
                              borderRadius: 8,
                              border: isSelected ? "2px solid var(--teal)" : "1.5px solid var(--gray-200)",
                              background: isSelected ? "var(--teal)" : "#fff",
                              color: isSelected ? "#fff" : "var(--gray-700)",
                              fontWeight: isSelected ? 700 : 400,
                              fontSize: ".85rem",
                              cursor: "pointer",
                              textAlign: "center",
                            }}
                          >
                            {fmtSlot(slot)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errors.datetime && (
                    <span style={{ color: "var(--danger)", fontSize: ".8rem", marginTop: 6, display: "block" }}>
                      ⚠ {errors.datetime}
                    </span>
                  )}
                </div>
              )}

              {/* Notes field — unchanged */}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">
                  Symptoms / Notes{" "}
                  <span style={{ color: "var(--gray-400)", fontSize: ".8rem" }}>(optional)</span>
                </label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="4"
                  placeholder="Briefly describe your symptoms…"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="booking-actions">
                <button type="button" className="btn btn--outline" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Submitting..." : "Submit Appointment Request"}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="booking-info-cards">
          <a href={`tel:${CLINIC.phone}`} className="info-card"><div className="info-card__icon">📞</div><div className="info-card__label">Call Instead</div><div className="info-card__val">{CLINIC.phone}</div></a>
          <div className="info-card"><div className="info-card__icon">🕐</div><div className="info-card__label">Clinic Hours</div><div className="info-card__val">Mon–Fri 9AM–7PM · Sat 9AM–2PM</div></div>
        </div>
      </div>
    </div>
  );
}