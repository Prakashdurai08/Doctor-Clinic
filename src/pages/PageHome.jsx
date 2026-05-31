// ─── Page: Home ───────────────────────────────────────────────
// Landing page with Hero, Services grid, CTA banner,
// Testimonials, and a Google Maps embed.

import FadeUp from "../components/FadeUp";
import { LS } from "../utils/constants";

export default function PageHome({ setPage }) {
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
      {/* ── Hero Section ──────────────────────────────────────── */}
      {/* Background uses purple gradient (defined in App.css .hero) */}
      <section className="hero">
        <div className="hero__bg-circle hero__bg-circle--1" />
        <div className="hero__bg-circle hero__bg-circle--2" />
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__eyebrow">✚ Trusted Healthcare Since 2010</div>
            <h1 className="hero__title">
              Specialized Care,<br /><span>Anytime</span> You Need
            </h1>
            <p className="hero__desc">
              At MediCare Clinic, we combine expert medical knowledge with genuine compassion
              to provide the best care for you and your family.
            </p>
            {/* Availability warning — shown when clinic is closed */}
            {!available && (
              <div className="alert alert--warn" style={{ marginBottom: 20 }}>
                🚫 <strong>Closed today</strong> — Bookings are currently paused. Please call for emergencies.
              </div>
            )}
            <div className="hero__actions">
              <button className="btn btn--primary btn--lg" onClick={() => go("booking")}>
                📅 Book Appointment
              </button>
              <button className="btn btn--outline btn--lg" onClick={() => go("doctor")}>
                Meet Our Doctor
              </button>
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

          {/* Floating doctor illustration + availability badge */}
          <div className="hero__img-wrap">
            <div className="hero__img-circle">🧑‍⚕️</div>
            <div className={`hero__badge${!available ? " hero__badge--closed" : ""}`}>
              {/* Green dot when open, red when closed */}
              <span className={`badge-dot${!available ? " badge-dot--red" : ""}`} />
              {available ? "Doctor Available Now" : "Closed Today"}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="pill">What We Offer</span>
            <h2>Comprehensive Healthcare Services</h2>
            <p>From routine check-ups to specialized consultations, we're here for every step of your health journey.</p>
          </div>
          {/* Service cards staggered with FadeUp delay */}
          <div className="services-grid">
            {services.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.07}>
                <div className="service-card">
                  {/* Icon uses purple gradient bg (defined in App.css) */}
                  <div className="service-card__icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner — purple gradient background ────────────── */}
      <section className="cta-banner">
        <div className="container" style={{ textAlign: "center" }}>
          <FadeUp>
            <h2>Ready to Book Your Appointment?</h2>
            <p>Quick online booking — get a confirmation in minutes.</p>
            <button className="btn btn--white btn--lg" onClick={() => go("booking")}>
              📅 Book Now – It's Free
            </button>
          </FadeUp>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
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
                    {/* Avatar uses purple light background */}
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

      {/* ── Map ───────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <FadeUp>
            <div className="map-wrap">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.032673817547!2d80.20946491482177!3d13.089613790789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265a56a282ec3%3A0xcea9f1ca7cff5019!2sAnna%20Nagar%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1620000000000"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Clinic Location"
              />
            </div>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
