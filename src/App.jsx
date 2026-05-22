import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css"

// ─────────────────────────────────────────────────────────────
//  ★ STEP 1: Paste your Google Apps Script Web App URL below ★
// ─────────────────────────────────────────────────────────────
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwMS-c22pTzIQI3CWE_15FnGjo1AIcJUcAi9xFCkcDs_eWLydAa43vHKMUAzSbP44Q/exec";
//  ↑ Replace YOUR_SCRIPT_ID_HERE with your actual script ID
//  Example: "https://script.google.com/macros/s/AKfycbxXXXXXXXX/exec"
// ─────────────────────────────────────────────────────────────

const CLINIC = {
  name: "MediCare Clinic",
  phone: "+91-9629622076",
  whatsapp: "919629622076",
  email: "selvaprakash4000@gmail.com",
  address: "12, Health Avenue, Anna Nagar, Chennai – 600 040, Tamil Nadu",
};

// ─── Google Sheets Storage Layer ─────────────────────────────
// All booking data is stored in Google Sheets (cloud).
// This means ANY device can see bookings — patients book on
// their phone, staff sees it instantly on their computer. ✅
const LS = {
  // Clinic open/closed toggle — still stored locally per staff device
  isAvailable: () => {
    const v = localStorage.getItem("clinic_availability");
    return v === null ? true : v === "true";
  },
  setAvailability: (b) => localStorage.setItem("clinic_availability", String(b)),

  // ── Add a new booking (called when patient submits form) ──
  addBooking: async (data) => {
    const entry = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      status: "Pending",
      createdAt: new Date().toISOString(),
      arrived: false,
      token: null,
      visitType: "Online",
      checkedInAt: null,
      completedAt: null,
      action: "add",
    };
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error("Failed to save booking:", err);
      throw new Error("Could not save booking. Please try again.");
    }
    return entry;
  },

  // ── Fetch ALL bookings (called when dashboard loads) ──────
  fetchBookings: async () => {
    try {
      const res = await fetch(SHEET_URL + "?t=" + Date.now()); // cache-bust
      const data = await res.json();
      // Normalize boolean fields from Sheets (they come back as strings)
      return data.map((b) => ({
        ...b,
        arrived: b.arrived === true || b.arrived === "TRUE" || b.arrived === "true",
        token: b.token === "" || b.token === null ? null : Number(b.token) || null,
      }));
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      return [];
    }
  },

  // ── Update specific fields on an existing booking ─────────
  updateBooking: async (id, fields) => {
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify({ action: "update", id, ...fields }),
      });
    } catch (err) {
      console.error("Failed to update booking:", err);
    }
  },

  // ── Delete one booking ────────────────────────────────────
  deleteBooking: async (id) => {
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch (err) {
      console.error("Failed to delete booking:", err);
    }
  },

  // ── Delete ALL bookings ───────────────────────────────────
  deleteAll: async () => {
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteAll" }),
      });
    } catch (err) {
      console.error("Failed to clear bookings:", err);
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

function openWhatsApp(data) {
  const msg = encodeURIComponent(
    `🏥 *New Appointment – ${CLINIC.name}*\n\n👤 ${data.name}\n🎂 Age: ${data.age}\n📞 ${data.phone}\n✉️ ${data.email || "—"}\n📅 ${data.datetime}\n📝 ${data.notes || "N/A"}\n\n_Sent via website_`
  );
  window.open(`https://wa.me/${CLINIC.whatsapp}?text=${msg}`, "_blank");
}
function openEmail(data) {
  const s = encodeURIComponent(`Appointment Request – ${data.name}`);
  const b = encodeURIComponent(
    `Name: ${data.name}\nAge: ${data.age}\nPhone: ${data.phone}\nEmail: ${data.email || "—"}\nDateTime: ${data.datetime}\nNotes: ${data.notes || "N/A"}`
  );
  window.location.href = `mailto:${CLINIC.email}?subject=${s}&body=${b}`;
}

// ─── FadeUp Animation Hook ────────────────────────────────────
function useFadeUp() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeUp({ children, delay = 0, style = {}, className = "" }) {
  const [ref, visible] = useFadeUp();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (p) => { setPage(p); setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const links = [["home", "Home"], ["doctor", "Our Doctor"], ["reviews", "Reviews"], ["faq", "FAQ"], ["contact", "Contact"]];

  return (
    <>
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="container navbar__inner">
          <button className="nav-logo" onClick={() => go("home")} aria-label="Home">
            <span className="nav-logo__mark">M</span>
            <span className="nav-logo__text">MediCare Clinic</span>
          </button>
          <div className="nav-links">
            {links.map(([p, l]) => (
              <button key={p} className={`nav-link${page === p ? " active" : ""}`} onClick={() => go(p)}>{l}</button>
            ))}
            <button className="btn btn--primary btn--sm" onClick={() => go("booking")}>📅 Book Appointment</button>
          </div>
          <button className={`hamburger${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <div className="mobile-menu__inner">
          {links.map(([p, l]) => (
            <button key={p} className={`mobile-link${page === p ? " active" : ""}`} onClick={() => go(p)}>{l}</button>
          ))}
          <button className="btn btn--primary" style={{ marginTop: 8 }} onClick={() => go("booking")}>📅 Book Appointment</button>
          <button className="btn btn--outline" onClick={() => go("dashboard")}>🔧 Staff Dashboard</button>
        </div>
      </div>
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────
function Footer({ setPage }) {
  const go = (p) => { setPage(p); window.scrollTo({ top: 0 }); };
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="nav-logo" style={{ marginBottom: 12 }}>
              <span className="nav-logo__mark">M</span>
              <span className="nav-logo__text" style={{ color: "#fff" }}>MediCare Clinic</span>
            </div>
            <p>Specialized Care, Anytime. Trusted healthcare for you and your family since 2010.</p>
            <p style={{ marginTop: 10, fontSize: ".85rem" }}>📍 {CLINIC.address}</p>
            <p style={{ marginTop: 6, fontSize: ".85rem" }}>📞 <a href={`tel:${CLINIC.phone}`} style={{ color: "var(--teal)" }}>{CLINIC.phone}</a></p>
            <div className="privacy-strip" style={{ marginTop: 16 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Your data is securely stored in the cloud and shared via WhatsApp/email when you choose.
            </div>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul className="footer__links">
              {[["home", "Home"], ["booking", "Book Appointment"], ["doctor", "Doctor Info"], ["reviews", "Reviews"]].map(([p, l]) => (
                <li key={p}><button onClick={() => go(p)}>{l}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Information</h4>
            <ul className="footer__links">
              {[["faq", "FAQ"], ["contact", "Contact Us"], ["dashboard", "Staff Dashboard"]].map(([p, l]) => (
                <li key={p}><button onClick={() => go(p)}>{l}</button></li>
              ))}
            </ul>
          </div>
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

// ─── Page: Home ───────────────────────────────────────────────
function PageHome({ setPage }) {
  const available = LS.isAvailable();
  const go = (p) => { setPage(p); window.scrollTo({ top: 0 }); };

  const services = [
    { icon: "🩺", title: "General Consultation", desc: "Comprehensive health check-ups and medical consultations for all ages." },
    { icon: "💊", title: "Prescription & Medication", desc: "Expert prescriptions and medication guidance tailored to your needs." },
    { icon: "🧪", title: "Diagnostics & Lab Tests", desc: "In-house and referral lab tests with quick, accurate results." },
    { icon: "👶", title: "Pediatric Care", desc: "Specialized care and vaccinations for infants, children, and teens." },
    { icon: "🫀", title: "Chronic Disease Management", desc: "Long-term care plans for diabetes, hypertension, and more." },
    { icon: "🏠", title: "Home Visits", desc: "Convenient home consultations for patients who cannot visit the clinic." },
  ];

  const testimonials = [
    { stars: 5, quote: "The doctor was incredibly thorough and patient. I felt genuinely cared for, not just another number. Highly recommend!", name: "Priya Sharma", since: "Patient since 2021", avatar: "👩" },
    { stars: 5, quote: "Booking was super easy and the staff is very warm. The clinic is clean and the doctor explains everything clearly.", name: "Rajan Pillai", since: "Patient since 2019", avatar: "👨" },
    { stars: 5, quote: "Best clinic in Anna Nagar. Always on time, very professional, and genuinely caring. Wouldn't go anywhere else.", name: "Meena Krishnan", since: "Patient since 2020", avatar: "👩‍🦱" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-circle hero__bg-circle--1" />
        <div className="hero__bg-circle hero__bg-circle--2" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__eyebrow">✚ Trusted Healthcare Since 2010</div>
            <h1 className="hero__title">Specialized Care,<br /><span>Anytime</span> You Need</h1>
            <p className="hero__desc">At MediCare Clinic, we combine expert medical knowledge with genuine compassion to provide the best care for you and your family.</p>
            {!available && (
              <div className="alert alert--warn" style={{ marginBottom: 20 }}>
                🚫 <strong>Closed today</strong> — Bookings are currently paused. Please call for emergencies.
              </div>
            )}
            <div className="hero__actions">
              <button className="btn btn--primary btn--lg" onClick={() => go("booking")}>📅 Book Appointment</button>
              <button className="btn btn--outline btn--lg" onClick={() => go("doctor")}>Meet Our Doctor</button>
            </div>
            <div className="hero__stats">
              {[["5000+", "Patients Served"], ["15+", "Years Experience"], ["4.9★", "Patient Rating"]].map(([num, lbl]) => (
                <div key={lbl} className="hero__stat">
                  <strong>{num}</strong>
                  <span>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hero__img-wrap">
            <div className="hero__img-circle">🧑‍⚕️</div>
            <div className={`hero__badge${!available ? " hero__badge--closed" : ""}`}>
              <span className={`badge-dot${!available ? " badge-dot--red" : ""}`} />
              {available ? "Doctor Available Now" : "Closed Today"}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="pill">What We Offer</span>
            <h2>Comprehensive Healthcare Services</h2>
            <p>From routine check-ups to specialized consultations, we're here for every step of your health journey.</p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.07}>
                <div className="service-card">
                  <div className="service-card__icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="container" style={{ textAlign: "center" }}>
          <FadeUp>
            <h2>Ready to Book Your Appointment?</h2>
            <p>Quick online booking — get a confirmation in minutes.</p>
            <button className="btn btn--white btn--lg" onClick={() => go("booking")}>📅 Book Now – It's Free</button>
          </FadeUp>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="section-header">
            <span className="pill">Patient Stories</span>
            <h2>What Our Patients Say</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div className="testimonial-card">
                  <div className="testimonial-card__stars">{"★".repeat(t.stars)}</div>
                  <p className="testimonial-card__quote">"{t.quote}"</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">{t.avatar}</div>
                    <div>
                      <div className="testimonial-card__name">{t.name}</div>
                      <div className="testimonial-card__since">{t.since}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button className="btn btn--outline" onClick={() => go("reviews")}>Read All Reviews</button>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section-sm">
        <div className="container">
          <FadeUp>
            <div className="map-wrap">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.032673817547!2d80.20946491482177!3d13.089613790789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265a56a282ec3%3A0xcea9f1ca7cff5019!2sAnna%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1620000000000"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Clinic Location"
              />
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}

// ─── Page: Booking ────────────────────────────────────────────
function PageBooking() {
  const available = LS.isAvailable();
  const [form, setForm] = useState({ name: "", age: "", phone: "", email: "", datetime: "", notes: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastBooking, setLastBooking] = useState(null);
  const [step, setStep] = useState(1);

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

  if (!available) {
    return (
      <div className="page-wrapper">
        <div className="page-header"><span className="pill">Online Booking</span><h1>Book an Appointment</h1></div>
        <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
          <div className="closed-banner">
            <div className="closed-banner__icon">🚫</div>
            <div>
              <h3>Clinic Closed Today</h3>
              <p>Bookings are currently paused. Please call us or check back tomorrow.</p>
              <a href={`tel:${CLINIC.phone}`} className="btn btn--danger" style={{ marginTop: 12 }}>📞 Call {CLINIC.phone}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page-wrapper">
        <div className="page-header"><span className="pill">Booking Confirmed</span><h1>Request Sent!</h1></div>
        <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
          <div className="success-box">
            <div className="success-box__icon">✅</div>
            <h2>Your appointment request has been sent!</h2>
            <p>We'll confirm your slot shortly. You can also notify us via:</p>
            <div className="success-box__actions">
              <button className="btn btn--success" onClick={() => openWhatsApp(lastBooking)}>💬 Notify via WhatsApp</button>
              <button className="btn btn--outline" onClick={() => openEmail(lastBooking)}>✉️ Notify via Email</button>
            </div>
            <div className="booking-summary">
              <h4>Booking Summary</h4>
              <div className="booking-summary__row"><span>Name</span><strong>{lastBooking.name}</strong></div>
              <div className="booking-summary__row"><span>Phone</span><strong>{lastBooking.phone}</strong></div>
              <div className="booking-summary__row"><span>Date & Time</span><strong>{fmtDate(lastBooking.datetime)}</strong></div>
              {lastBooking.notes && <div className="booking-summary__row"><span>Notes</span><strong>{lastBooking.notes}</strong></div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Step indicator */}
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
          <div className="privacy-strip">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Your booking is securely saved to our clinic database and visible to staff immediately.
          </div>

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
              <button
                type="button"
                className="btn btn--primary"
                style={{ marginTop: 8 }}
                onClick={() => {
                  if (!form.name || !form.age || !form.phone) { setError("Please fill name, age, and phone first."); }
                  else { setError(""); setStep(2); }
                }}
              >
                Next: Schedule →
              </button>
            </>
          )}

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

// ─── Page: Doctor ─────────────────────────────────────────────
function PageDoctor({ setPage }) {
  const qualifications = [
    { icon: "🎓", title: "MBBS – Bachelor of Medicine & Surgery", sub: "[Medical College Name], [University], [Year of Graduation]" },
    { icon: "🏆", title: "MD – General Medicine", sub: "[Postgraduate Institute], [University], [Year]" },
    { icon: "🏥", title: "Senior Resident – [Hospital Name]", sub: "3 years of residency in General Medicine · [City]" },
    { icon: "📋", title: "Registered with Tamil Nadu Medical Council", sub: "Registration No: [TNMC-XXXX] · Valid & Active" },
    { icon: "⭐", title: "15+ Years Clinical Practice", sub: "Over 5,000 patients treated across Chennai." },
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = { Monday: "9:00 AM – 7:00 PM", Tuesday: "9:00 AM – 7:00 PM", Wednesday: "9:00 AM – 7:00 PM", Thursday: "9:00 AM – 7:00 PM", Friday: "9:00 AM – 7:00 PM", Saturday: "9:00 AM – 2:00 PM", Sunday: "Emergency Only" };
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <span className="pill">Meet the Team</span>
          <h1>Our Doctor</h1>
          <p>Compassionate care backed by expertise and experience.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <FadeUp>
            <div className="doctor-card">
              <div className="doctor-card__photo">🧑‍⚕️</div>
              <div className="doctor-card__info">
                <h2>Dr. [Doctor's Full Name]</h2>
                <p className="doctor-card__spec">MBBS, MD – General Medicine & Family Health</p>
                <p className="doctor-card__bio">Dr. [Name] is a dedicated physician with over 15 years of experience in general medicine and family healthcare. Known for a patient-first approach, they combine clinical expertise with genuine warmth to ensure every patient feels heard, respected, and well-cared for.</p>
                <div className="doctor-card__tags">
                  {["General Medicine", "Family Health", "Chronic Disease", "Pediatrics", "Preventive Care"].map(t => (
                    <span key={t} className="pill pill--sm">{t}</span>
                  ))}
                </div>
                <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => { setPage("booking"); window.scrollTo({ top: 0 }); }}>📅 Book an Appointment</button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="section-sm" style={{ background: "var(--gray-50)" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <FadeUp>
            <h2 style={{ marginBottom: 8 }}>Qualifications & Experience</h2>
            <p style={{ color: "var(--gray-600)", marginBottom: 28 }}>Academic training and professional background.</p>
            <div className="card" style={{ padding: 24 }}>
              {qualifications.map((q, i) => (
                <div key={i} className="qual-item">
                  <div className="qual-item__icon">{q.icon}</div>
                  <div>
                    <div className="qual-item__title">{q.title}</div>
                    <div className="qual-item__sub">{q.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <FadeUp>
            <h2 style={{ marginBottom: 8 }}>Consultation Hours</h2>
            <p style={{ color: "var(--gray-600)", marginBottom: 24 }}>Walk-ins welcome; booking recommended.</p>
            <div className="timing-grid">
              {days.map(d => (
                <div key={d} className={`timing-card${d === today ? " timing-card--today" : ""}${d === "Sunday" ? " timing-card--sunday" : ""}`}>
                  <div className="timing-card__day">{d}{d === today && <span className="today-badge">Today</span>}</div>
                  <div className={`timing-card__hours${d === "Sunday" ? " timing-card__hours--closed" : ""}`}>{hours[d]}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <button className="btn btn--primary" onClick={() => { setPage("booking"); window.scrollTo({ top: 0 }); }}>📅 Book Appointment</button>
              <a href={`tel:${CLINIC.phone}`} className="btn btn--outline">📞 Call Clinic</a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

// ─── Page: Reviews ────────────────────────────────────────────
function PageReviews({ setPage }) {
  const reviews = [
    { stars: 5, quote: "The doctor was incredibly thorough and patient. I felt genuinely cared for, not just another number. Highly recommend!", name: "Priya Sharma", since: "Patient since 2021", avatar: "👩" },
    { stars: 5, quote: "Booking was super easy and the staff is very warm. The clinic is clean and the doctor explains everything clearly.", name: "Rajan Pillai", since: "Patient since 2019", avatar: "👨" },
    { stars: 5, quote: "Best clinic in Anna Nagar. Always on time, very professional, and genuinely caring. Wouldn't go anywhere else.", name: "Meena Krishnan", since: "Patient since 2020", avatar: "👩‍🦱" },
    { stars: 5, quote: "My entire family has been coming here for 3 years. The doctor remembers our history and treats us like family.", name: "Suresh Babu", since: "Patient since 2022", avatar: "👨‍🦳" },
    { stars: 4, quote: "Excellent care and very hygienic premises. The wait time was slightly long but the consultation was worth it.", name: "Kavitha Rangan", since: "Patient since 2023", avatar: "👩‍🦰" },
    { stars: 5, quote: "Called for a home visit and the doctor came on time. Very professional and thorough. Highly recommended!", name: "Arjun Nair", since: "Patient since 2021", avatar: "🧑" },
  ];
  const ratings = { 5: 185, 4: 12, 3: 4, 2: 0, 1: 0 };
  const total = Object.values(ratings).reduce((a, b) => a + b, 0);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <span className="pill">Patient Stories</span>
          <h1>What Our Patients Say</h1>
          <p>Real experiences from real patients who trust MediCare Clinic.</p>
        </div>
      </div>

      <section className="section-sm">
        <div className="container" style={{ maxWidth: 700 }}>
          <FadeUp>
            <div className="card rating-summary">
              <div className="rating-summary__score">
                <div className="rating-summary__num">4.9</div>
                <div className="rating-summary__stars">★★★★★</div>
                <div className="rating-summary__count">based on 200+ reviews</div>
              </div>
              <div className="rating-summary__bars">
                {[5, 4, 3, 2, 1].map(n => (
                  <div key={n} className="rating-bar">
                    <span className="rating-bar__label">{n} ★</span>
                    <div className="rating-bar__track"><div className="rating-bar__fill" style={{ width: `${(ratings[n] / total) * 100}%` }} /></div>
                    <span className="rating-bar__count">{ratings[n]}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <FadeUp key={r.name} delay={i * 0.07}>
                <div className="testimonial-card">
                  <div className="testimonial-card__stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                  <p className="testimonial-card__quote">"{r.quote}"</p>
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">{r.avatar}</div>
                    <div>
                      <div className="testimonial-card__name">{r.name}</div>
                      <div className="testimonial-card__since">{r.since}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <button className="btn btn--primary" onClick={() => { setPage("booking"); window.scrollTo({ top: 0 }); }}>📅 Book Your Appointment</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Page: FAQ ────────────────────────────────────────────────
function PageFAQ({ setPage }) {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  const sections = [
    {
      heading: "💰 Fees & Payments", items: [
        { q: "What is the consultation fee?", a: "The standard consultation fee is ₹[Amount]. Fees may vary for specialist consultations, procedures, or follow-ups. We accept cash, UPI, and major debit/credit cards. Please call us for the latest fee schedule." },
        { q: "Is there a separate charge for follow-up visits?", a: "Follow-up visits within 7 days of an initial consultation are charged at a reduced rate of ₹[Amount]. Please bring your previous prescription or medical records." },
        { q: "Do you accept health insurance?", a: "We currently accept [Insurance Provider Names]. Please call us in advance to confirm whether your specific policy is covered." },
      ]
    },
    {
      heading: "🕐 Timings & Appointments", items: [
        { q: "What are the clinic's operating hours?", a: "Monday – Friday: 9:00 AM to 7:00 PM | Saturday: 9:00 AM to 2:00 PM | Sunday: Emergency consultations only. Public holidays may have different hours." },
        { q: "How do I book an appointment?", a: "You can book online via our Book Appointment page, send us a WhatsApp message, call our clinic directly, or walk in during clinic hours. Online booking is the fastest way to secure your preferred slot." },
        { q: "How long will I have to wait after booking?", a: "Booked appointments typically wait 10–20 minutes. Walk-in patients are seen in the order of arrival after booked patients. We recommend booking in advance, especially on weekday mornings." },
        { q: "Can I cancel or reschedule my appointment?", a: "Yes. Please call or WhatsApp us at least 2 hours before your scheduled time. This helps us accommodate other patients. There is no cancellation fee." },
      ]
    },
    {
      heading: "🎒 What to Bring", items: [
        { q: "What documents should I bring to my first visit?", a: "Please bring: a government-issued photo ID, any previous medical records or prescriptions, your health insurance card (if applicable), and a list of current medications." },
        { q: "Should I fast before my appointment?", a: "Fasting is only required if you are scheduled for specific blood tests (such as fasting blood glucose or lipid profiles). For a general consultation, there is no need to fast." },
      ]
    },
    {
      heading: "🔒 Privacy & Data", items: [
        { q: "How is my booking data stored and used?", a: "When you book through our website, your details are securely saved to our clinic's private Google Sheet database. Only authorized clinic staff can access this data." },
        { q: "Is my medical information kept confidential?", a: "Absolutely. All medical information shared during consultation is strictly confidential and protected under patient privacy norms. We do not share your health data with third parties." },
      ]
    },
  ];

  let idx = 0;
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="container">
          <span className="pill">Help Centre</span>
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know before your visit.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          {sections.map((sec) => (
            <FadeUp key={sec.heading}>
              <h2 className="faq-section-heading">{sec.heading}</h2>
              <div className="faq-list">
                {sec.items.map((item) => {
                  const i = idx++;
                  return (
                    <div key={i} className="faq-item">
                      <button className={`faq-item__q${open === i ? " open" : ""}`} onClick={() => toggle(i)}>
                        <span>{item.q}</span>
                        <span className={`faq-item__icon${open === i ? " open" : ""}`}>+</span>
                      </button>
                      <div className={`faq-item__a${open === i ? " open" : ""}`}>{item.a}</div>
                    </div>
                  );
                })}
              </div>
            </FadeUp>
          ))}

          <FadeUp>
            <div className="faq-cta">
              <div style={{ fontSize: "2.5rem" }}>💬</div>
              <h3>Still have questions?</h3>
              <p>Our team is happy to help you anytime.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn--primary" onClick={() => { setPage("contact"); window.scrollTo({ top: 0 }); }}>Contact Us</button>
                <a href={`tel:${CLINIC.phone}`} className="btn btn--outline">📞 Call Now</a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

// ─── Page: Contact ────────────────────────────────────────────
function PageContact({ setPage }) {
  const [form, setForm] = useState({ name: "", phone: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.msg) { setError("Please fill in all fields."); return; }
    setError("");
    setSent(true);
  };

  return (
    <div className="page-wrapper">
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
            <FadeUp>
              <h2 style={{ marginBottom: 20 }}>Reach Us</h2>
              <div className="contact-big-btns">
                <a href={`https://wa.me/${CLINIC.whatsapp}?text=Hello%20MediCare%20Clinic`} target="_blank" rel="noreferrer" className="contact-big-btn contact-big-btn--wa">
                  <span>💬</span>
                  <div><div className="contact-big-btn__lbl">WhatsApp</div><div className="contact-big-btn__val">Chat with us now</div></div>
                </a>
                <a href={`mailto:${CLINIC.email}`} className="contact-big-btn contact-big-btn--email">
                  <span>✉️</span>
                  <div><div className="contact-big-btn__lbl">Email</div><div className="contact-big-btn__val">{CLINIC.email}</div></div>
                </a>
                <a href={`tel:${CLINIC.phone}`} className="contact-big-btn contact-big-btn--call">
                  <span>📞</span>
                  <div><div className="contact-big-btn__lbl">Call / Emergency</div><div className="contact-big-btn__val">{CLINIC.phone}</div></div>
                </a>
              </div>

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

              <div className="privacy-strip" style={{ marginTop: 16 }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                Your message is not stored on our servers. We'll respond via WhatsApp or email.
              </div>
            </FadeUp>

            <FadeUp>
              <h2 style={{ marginBottom: 20 }}>Send us a Message</h2>
              <div className="card" style={{ padding: 28 }}>
                {!sent ? (
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
                    <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }}>📤 Send Message</button>
                  </form>
                ) : (
                  <div className="success-box" style={{ textAlign: "center" }}>
                    <div className="success-box__icon">✅</div>
                    <h3>Message Received!</h3>
                    <p>Thank you for reaching out. We'll get back to you shortly.</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
                      <button className="btn btn--success" onClick={() => { window.open(`https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(`Name: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.msg}`)}`, "_blank"); }}>
                        💬 Send via WhatsApp
                      </button>
                      <button className="btn btn--outline" onClick={() => { const s = encodeURIComponent(`Message from ${form.name}`); const b = encodeURIComponent(`Name: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.msg}`); window.location.href = `mailto:${CLINIC.email}?subject=${s}&body=${b}`; }}>
                        ✉️ Send via Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 24 }}>
                <div className="map-wrap" style={{ height: 280 }}>
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.032673817547!2d80.20946491482177!3d13.089613790789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265a56a282ec3%3A0xcea9f1ca7cff5019!2sAnna%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1620000000000" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Clinic Location" />
                </div>
                <a href="https://maps.google.com/?q=Anna+Nagar+Chennai" target="_blank" rel="noreferrer" className="btn btn--outline" style={{ marginTop: 12, display: "inline-flex" }}>🗺️ Open in Google Maps</a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Dashboard PIN Protection ─────────────────────────────────
const DASHBOARD_PIN = "1234"; // ← CHANGE YOUR PIN HERE

function DashboardGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("dash_unlocked") === "true");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      setLockTimer((t) => {
        if (t <= 1) { clearInterval(id); setLocked(false); setAttempts(0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    if (pin === DASHBOARD_PIN) {
      sessionStorage.setItem("dash_unlocked", "true");
      setUnlocked(true);
      setError("");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPin("");
      if (next >= 3) { setLocked(true); setLockTimer(30); setError("Too many attempts."); }
      else { setError(`Incorrect PIN. ${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`); }
    }
  };

  if (unlocked) return children;

  return (
    <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
          <h2 style={{ marginBottom: 10 }}>Staff Dashboard Protected</h2>
          <p style={{ color: "var(--gray-600)", marginBottom: 24 }}>Enter clinic PIN to continue</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password" className="form-control" placeholder="Enter PIN"
              value={pin} onChange={(e) => setPin(e.target.value)} disabled={locked} maxLength={8} autoFocus
              style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: ".3em", marginBottom: 16 }}
            />
            {error && (
              <div className="alert alert--danger" style={{ marginBottom: 16 }}>
                {locked ? `🔒 Locked (${lockTimer}s)` : `❌ ${error}`}
              </div>
            )}
            <button type="submit" className="btn btn--primary" style={{ width: "100%", justifyContent: "center" }} disabled={!pin || locked}>
              {locked ? `Locked (${lockTimer}s)` : "🔓 Unlock Dashboard"}
            </button>
          </form>
          <p style={{ marginTop: 18, fontSize: ".8rem", color: "var(--gray-400)" }}>Authorized staff only</p>
        </div>
      </div>
    </div>
  );
}

function PageDashboard() {
  return <DashboardGate><PageDashboardContent /></DashboardGate>;
}

// ─── Page: Dashboard Content ──────────────────────────────────
function PageDashboardContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailableState] = useState(LS.isAvailable());
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [walkInForm, setWalkInForm] = useState({ name: "", age: "", phone: "", notes: "" });
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ── Fetch bookings from Google Sheets ──────────────────────
  const refresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
    const data = await LS.fetchBookings();
    setBookings(data);
    setLoading(false);
    setRefreshing(false);
    setLastRefreshed(new Date());
  };

  // Load on mount + auto-refresh every 30 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAvail = () => {
    const next = !available;
    LS.setAvailability(next);
    setAvailableState(next);
  };

  const changeStatus = async (id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    await LS.updateBooking(id, { status });
  };

  const markArrived = async (id) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr);
    const nextToken = todayArrivals.length + 1;
    const fields = {
      arrived: true,
      token: nextToken,
      checkedInAt: new Date().toISOString(),
      status: "Confirmed",
    };
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
    await LS.updateBooking(id, fields);
  };

  const addWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInForm.name || !walkInForm.age || !walkInForm.phone) {
      alert("Please fill in name, age, and phone.");
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr);
    const nextToken = todayArrivals.length + 1;
    const newBooking = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name: walkInForm.name,
      age: walkInForm.age,
      phone: walkInForm.phone,
      email: "",
      datetime: new Date().toISOString(),
      notes: walkInForm.notes,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      arrived: true,
      token: nextToken,
      visitType: "Walk-In",
      checkedInAt: new Date().toISOString(),
      completedAt: null,
      action: "add",
    };
    setBookings(prev => [...prev, newBooking]);
    setWalkInForm({ name: "", age: "", phone: "", notes: "" });
    setShowWalkInForm(false);
    await fetch(SHEET_URL, { method: "POST", body: JSON.stringify(newBooking) });
  };

  const markCompleted = async (id) => {
    const fields = { status: "Completed", completedAt: new Date().toISOString() };
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
    await LS.updateBooking(id, fields);
  };

  const deleteBooking = async (id) => {
    if (!confirm("Delete this booking?")) return;
    setBookings(prev => prev.filter(b => b.id !== id));
    await LS.deleteBooking(id);
  };

  const clearAll = async () => {
    if (!confirm("Clear ALL bookings? This cannot be undone.")) return;
    setBookings([]);
    await LS.deleteAll();
  };

  const callNextPatient = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayQueue = bookings
      .filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr && b.status === "Confirmed")
      .sort((a, b) => (a.token || 0) - (b.token || 0));
    if (todayQueue.length === 0) { alert("No patients in queue."); return; }
    const nextPatient = todayQueue[0];
    alert(`🔔 Calling: ${nextPatient.name} (Token #${nextPatient.token})`);
  };

  const exportCSV = () => {
    if (!bookings.length) return alert("No bookings to export.");
    const headers = ["ID", "Name", "Age", "Phone", "Email", "DateTime", "Notes", "Status", "Token", "Visit Type", "Arrival Time", "Completed At", "CreatedAt"];
    const rows = bookings.map(b => [
      b.id, b.name, b.age, b.phone, b.email, b.datetime,
      (b.notes || "").replace(/,/g, " "), b.status, b.token || "—",
      b.visitType || "Online",
      b.checkedInAt ? fmtDate(b.checkedInAt) : "—",
      b.completedAt ? fmtDate(b.completedAt) : "—",
      b.createdAt
    ].join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `bookings-${Date.now()}.csv` });
    a.click();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter(b => b.datetime?.slice(0, 10) === todayStr);
  const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr);
  const todayQueue = [...todayArrivals].sort((a, b) => (a.token || 0) - (b.token || 0));
  const waitingOnline = bookings.filter(b => !b.arrived && b.visitType === "Online" && b.datetime?.slice(0, 10) === todayStr);
  const completedToday = bookings.filter(b => b.status === "Completed" && b.completedAt?.slice(0, 10) === todayStr);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name?.toLowerCase().includes(q) || b.phone?.toLowerCase().includes(q);
    const matchTab = activeTab === "all" || b.status?.toLowerCase() === activeTab;
    return matchSearch && matchTab;
  }).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  const stats = [
    { num: todayBookings.length, lbl: "Today's Bookings", color: "var(--teal)" },
    { num: todayArrivals.length, lbl: "Arrived", color: "var(--success)" },
    { num: waitingOnline.length, lbl: "Waiting Arrival", color: "#d69e2e" },
    { num: completedToday.length, lbl: "Completed", color: "var(--blue)" },
  ];

  return (
    <div className="page-wrapper">
      <div className="dash-header">
        <div className="container">
          <div className="dash-header__inner">
            <button
              className="btn btn--outline btn--sm"
              style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.4)" }}
              onClick={() => { sessionStorage.removeItem("dash_unlocked"); window.location.reload(); }}
            >
              🔒 Lock Dashboard
            </button>
            <div>
              <span className="pill" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>Staff Dashboard</span>
              <h1 style={{ color: "#fff", marginTop: 10 }}>Queue Management System</h1>
              <p style={{ opacity: .85 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              {lastRefreshed && (
                <p style={{ opacity: .6, fontSize: ".8rem", marginTop: 4 }}>
                  Last synced: {lastRefreshed.toLocaleTimeString("en-IN", { timeStyle: "short" })}
                </p>
              )}
            </div>
            <div className="avail-badge">
              <span className={`avail-dot${available ? " avail-dot--open" : " avail-dot--closed"}`} />
              <span>{available ? "🟢 Clinic Open" : "🔴 Clinic Closed"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 8 }}>
        <div className="dash-stats">
          {stats.map(s => (
            <div key={s.lbl} className="dash-stat">
              <div className="dash-stat__num" style={{ color: s.color }}>
                {loading ? "…" : s.num}
              </div>
              <div className="dash-stat__lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="container" style={{ marginBottom: 8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">🔧 Clinic Controls</h3>
          <div className="dash-controls">
            <label className="toggle-switch">
              <input type="checkbox" checked={available} onChange={toggleAvail} />
              <div className="toggle-track" />
              <span className="toggle-label">{available ? "Available Today" : "Not Available Today"}</span>
            </label>
            <div style={{ flex: 1 }} />
            <button className="btn btn--primary btn--sm" onClick={callNextPatient}>📢 Call Next Patient</button>
            <button
              className="btn btn--outline btn--sm"
              onClick={() => refresh(false)}
              disabled={refreshing}
            >
              {refreshing ? "⏳ Syncing…" : "🔄 Refresh"}
            </button>
            <button className="btn btn--outline btn--sm" onClick={exportCSV}>⬇ Export CSV</button>
            <button className="btn btn--danger btn--sm" onClick={clearAll}>🗑 Clear All</button>
          </div>
          <div className={`alert ${available ? "alert--success" : "alert--danger"}`} style={{ marginTop: 12 }}>
            {available ? "✅ Bookings are open. Patients can book appointments." : "🚫 Bookings are disabled. Booking page will show a \"Closed\" banner."}
          </div>
        </div>
      </div>

      {/* Today's Queue */}
      {todayQueue.length > 0 && (
        <div className="container" style={{ marginBottom: 8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">📋 Today's Queue ({todayQueue.length})</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Token</th><th>Name</th><th>Type</th><th>Arrival Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {todayQueue.map((b) => (
                    <tr key={b.id}>
                      <td><span className="token-badge">#{b.token}</span></td>
                      <td><strong>{b.name}</strong></td>
                      <td><span className={`visit-type-pill visit-type-pill--${(b.visitType || "online").toLowerCase()}`}>{b.visitType}</span></td>
                      <td>{b.checkedInAt ? fmtDate(b.checkedInAt) : "—"}</td>
                      <td><span className={`status-pill status-pill--${b.status.toLowerCase()}`}>{b.status}</span></td>
                      <td>
                        <button className="btn btn--success btn--sm" style={{ padding: "4px 10px" }} onClick={() => markCompleted(b.id)}>✓ Done</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Waiting Online Bookings */}
      {waitingOnline.length > 0 && (
        <div className="container" style={{ marginBottom: 8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">⏳ Waiting Online Bookings ({waitingOnline.length})</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Contact</th><th>Booked Time</th><th>Notes</th><th>Action</th></tr></thead>
                <tbody>
                  {waitingOnline.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong></td>
                      <td><a href={`tel:${b.phone}`} style={{ color: "var(--teal-dark)" }}>{b.phone}</a></td>
                      <td>{fmtDate(b.datetime)}</td>
                      <td style={{ fontSize: ".82rem" }}>{b.notes || "—"}</td>
                      <td><button className="btn btn--primary btn--sm" style={{ padding: "4px 10px" }} onClick={() => markArrived(b.id)}>✓ Mark Arrived</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Walk-In */}
      <div className="container" style={{ marginBottom: 8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">➕ Add Walk-In Patient</h3>
          {!showWalkInForm ? (
            <button className="btn btn--primary" onClick={() => setShowWalkInForm(true)}>+ Add Walk-In</button>
          ) : (
            <form onSubmit={addWalkIn} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" placeholder="Patient name" value={walkInForm.name} onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input type="number" className="form-control" placeholder="Age" value={walkInForm.age} onChange={(e) => setWalkInForm({ ...walkInForm, age: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" className="form-control" placeholder="Phone" value={walkInForm.phone} onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-control" placeholder="Notes" value={walkInForm.notes} onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px" }}>
                <button type="submit" className="btn btn--success">✓ Add Walk-In</button>
                <button type="button" className="btn btn--outline" onClick={() => setShowWalkInForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* All Bookings */}
      <div className="container" style={{ marginBottom: 40 }}>
        <div className="dash-card">
          <div className="dash-card__head">
            <h3 className="dash-card__title">📋 All Bookings</h3>
            <input className="form-control" style={{ maxWidth: 240 }} placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tabs">
            {[["all", "All"], ["pending", "Pending"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([v, l]) => (
              <button key={v} className={`tab${activeTab === v ? " active" : ""}`} onClick={() => setActiveTab(v)}>{l}</button>
            ))}
          </div>

          {loading ? (
            <div className="no-data" style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
              <p>Loading bookings from database…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-data">📋 No bookings found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th><th>Contact</th><th>Date & Time</th>
                    <th>Token</th><th>Type</th><th>Status</th>
                    <th>Notes</th><th>Change</th><th>Del</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong><br /><small style={{ color: "var(--gray-400)" }}>Age: {b.age}</small></td>
                      <td>
                        <a href={`tel:${b.phone}`} style={{ color: "var(--teal-dark)" }}>{b.phone}</a>
                        <br /><small style={{ color: "var(--gray-400)" }}>{b.email || "—"}</small>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDate(b.datetime)}</td>
                      <td>{b.token ? <span className="token-badge">#{b.token}</span> : "—"}</td>
                      <td><span className={`visit-type-pill visit-type-pill--${(b.visitType || "online").toLowerCase()}`}>{b.visitType}</span></td>
                      <td><span className={`status-pill status-pill--${(b.status || "pending").toLowerCase()}`}>{b.status}</span></td>
                      <td style={{ maxWidth: 160, fontSize: ".82rem" }}>{b.notes || "—"}</td>
                      <td>
                        <select value={b.status} onChange={e => changeStatus(b.id, e.target.value)} className="form-control" style={{ fontSize: ".8rem", padding: "4px 8px" }}>
                          <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn--danger btn--sm" style={{ padding: "4px 10px" }} onClick={() => deleteBooking(b.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: 10, fontSize: ".8rem", color: "var(--gray-400)" }}>
                Showing {filtered.length} of {bookings.length} bookings · Auto-refreshes every 30 seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Scroll to Top Button ─────────────────────────────────────
function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!show) return null;
  return (
    <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">↑</button>
  );
}

// ─── App Root ─────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <PageHome setPage={setPage} />;
      case "booking": return <PageBooking />;
      case "doctor": return <PageDoctor setPage={setPage} />;
      case "reviews": return <PageReviews setPage={setPage} />;
      case "faq": return <PageFAQ setPage={setPage} />;
      case "contact": return <PageContact setPage={setPage} />;
      case "dashboard": return <PageDashboard />;
      default: return <PageHome setPage={setPage} />;
    }
  };

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} />
      <main>{renderPage()}</main>
      <Footer setPage={setPage} />
      <ScrollToTop />
    </div>
  );
}
