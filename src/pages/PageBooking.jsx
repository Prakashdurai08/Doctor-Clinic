// ─── Page: Booking ────────────────────────────────────────────
// CHANGED: Confetti on success, inline field errors, toast notifications.

import { useState } from "react";
import { LS, CLINIC, fmtDate, openWhatsApp, openEmail } from "../utils/constants";
import Confetti from "../components/Confetti";
import { toast } from "../components/Toast";

export default function PageBooking() {
  const available = LS.isAvailable();
  const [form, setForm]         = useState({ name:"", age:"", phone:"", email:"", datetime:"", notes:"" });
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [step, setStep]         = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDt = now.toISOString().slice(0,16);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]:"" });
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Full name is required";
    if (!form.age)           e.age   = "Age is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    return e;
  };

  const handleNext = () => {
    const e = validateStep1();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setStep(2);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.datetime) { setErrors({ datetime:"Please select a date and time" }); return; }
    setErrors({}); setSubmitting(true);
    try {
      const booking = await LS.addBooking(form);
      setLastBooking(booking);
      setSubmitted(true);
      setShowConfetti(true);
      toast.success("Appointment booked successfully! 🎉");
      window.scrollTo({ top:0, behavior:"smooth" });
      setTimeout(() => setShowConfetti(false), 4000);
    } catch {
      toast.error("Failed to submit. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldStyle = (name) => ({
    borderColor: errors[name] ? "var(--danger)" : undefined,
    boxShadow:   errors[name] ? "0 0 0 3px rgba(229,62,62,.12)" : undefined,
  });

  if (!available) return (
    <div className="page-wrapper">
      <div className="page-header"><div className="container"><span className="pill">Online Booking</span><h1>Book an Appointment</h1></div></div>
      <div className="container" style={{ maxWidth:600, padding:"40px 20px" }}>
        <div className="closed-banner">
          <div className="closed-banner__icon">🚫</div>
          <div>
            <h3>Clinic Closed Today</h3>
            <p>Bookings are currently paused. Please call us or check back tomorrow.</p>
            <a href={`tel:${CLINIC.phone}`} className="btn btn--danger" style={{ marginTop:12 }}>📞 Call {CLINIC.phone}</a>
          </div>
        </div>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="page-wrapper">
      {showConfetti && <Confetti />}
      <div className="page-header"><div className="container"><span className="pill">Booking Confirmed</span><h1>🎉 Request Sent!</h1></div></div>
      <div className="container" style={{ maxWidth:600, padding:"40px 20px" }}>
        <div className="success-box">
          <div className="success-box__icon" style={{ fontSize:"4rem" }}>🎊</div>
          <h2>Your appointment request has been sent!</h2>
          <p>We'll confirm your slot shortly. Notify us faster via:</p>
          <div className="success-box__actions">
            <button className="btn btn--success" onClick={()=>{ openWhatsApp(lastBooking); toast.info("Opening WhatsApp…"); }}>💬 Notify via WhatsApp</button>
            <button className="btn btn--outline" onClick={()=>{ openEmail(lastBooking); toast.info("Opening Email…"); }}>✉️ Notify via Email</button>
          </div>
          <div className="booking-summary">
            <h4>Booking Summary</h4>
            <div className="booking-summary__row"><span>Name</span><strong>{lastBooking.name}</strong></div>
            <div className="booking-summary__row"><span>Phone</span><strong>{lastBooking.phone}</strong></div>
            <div className="booking-summary__row"><span>Date & Time</span><strong>{fmtDate(lastBooking.datetime)}</strong></div>
            {lastBooking.notes && <div className="booking-summary__row"><span>Notes</span><strong>{lastBooking.notes}</strong></div>}
          </div>
          <div style={{ marginTop:16, padding:"14px 20px", background:"var(--teal-light)", borderRadius:10, fontSize:".88rem", color:"var(--teal-dark)" }}>
            💡 <strong>Tip:</strong> Check your queue position on our <strong>Token Board</strong> in the nav menu.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="page-header"><div className="container"><span className="pill">Online Booking</span><h1>Book an Appointment</h1><p>Fill in the form below and we'll confirm your slot.</p></div></div>
      <div className="container" style={{ maxWidth:760, padding:"40px 20px" }}>
        <div className="step-indicator">
          <div className={`step-indicator__step${step>=1?" active":""}`}><div className="step-indicator__num">1</div><span>Personal Details</span></div>
          <div className="step-indicator__line"/>
          <div className={`step-indicator__step${step>=2?" active":""}`}><div className="step-indicator__num">2</div><span>Schedule & Notes</span></div>
        </div>

        <form className="card booking-form" onSubmit={handleSubmit}>
          <div className="privacy-strip">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Your booking is securely saved to our clinic database.
          </div>

          {step===1 && (
            <>
              <h2 style={{ marginBottom:20 }}>Personal Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="name" className="form-control" placeholder="e.g. Arun Kumar" value={form.name} onChange={handleChange} style={fieldStyle("name")}/>
                  {errors.name && <span style={{ color:"var(--danger)", fontSize:".8rem", marginTop:4, display:"block" }}>⚠ {errors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input name="age" type="number" className="form-control" placeholder="e.g. 32" min="1" max="120" value={form.age} onChange={handleChange} style={fieldStyle("age")}/>
                  {errors.age && <span style={{ color:"var(--danger)", fontSize:".8rem", marginTop:4, display:"block" }}>⚠ {errors.age}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input name="phone" type="tel" className="form-control" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} style={fieldStyle("phone")}/>
                  {errors.phone && <span style={{ color:"var(--danger)", fontSize:".8rem", marginTop:4, display:"block" }}>⚠ {errors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span style={{ color:"var(--gray-400)", fontSize:".8rem" }}>(optional)</span></label>
                  <input name="email" type="email" className="form-control" placeholder="you@email.com" value={form.email} onChange={handleChange}/>
                </div>
              </div>
              <button type="button" className="btn btn--primary" style={{ marginTop:8 }} onClick={handleNext}>Next: Schedule →</button>
            </>
          )}

          {step===2 && (
            <>
              <h2 style={{ marginBottom:20 }}>Schedule & Notes</h2>
              <div className="form-group">
                <label className="form-label">Preferred Date & Time *</label>
                <div className="datetime-wrapper">
                  <input name="datetime" type="datetime-local" className="form-control" min={minDt} value={form.datetime} onChange={handleChange} style={fieldStyle("datetime")}/>
                </div>
                {errors.datetime && <span style={{ color:"var(--danger)", fontSize:".8rem", marginTop:4, display:"block" }}>⚠ {errors.datetime}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Symptoms / Notes <span style={{ color:"var(--gray-400)", fontSize:".8rem" }}>(optional)</span></label>
                <textarea name="notes" className="form-control" rows="4" placeholder="Briefly describe your symptoms…" value={form.notes} onChange={handleChange}/>
              </div>
              <div className="booking-actions">
                <button type="button" className="btn btn--outline" onClick={()=>setStep(1)}>← Back</button>
                <button type="submit" className="btn btn--primary" style={{ flex:1 }} disabled={submitting}>
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