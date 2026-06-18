// ─── Page: Doctor ─────────────────────────────────────────────
// CHANGED: Replaced all [placeholder] brackets with real dummy
// content for a Tamil Nadu-based doctor. When a real doctor
// orders the product, replace the values in the DOCTOR object
// at the top — no need to touch the JSX below.

import FadeUp from "../components/FadeUp";

// ── CHANGE HERE when client orders ────────────────────────────
const DOCTOR = {
  name: "Dr. Suresh Kumar R.",
  qualification: "MBBS, MD – General Medicine & Family Health",
  bio: "Dr. Suresh Kumar is a dedicated physician with over 15 years of experience in general medicine and family healthcare across Chennai. Known for a patient-first approach, he combines clinical expertise with genuine warmth — ensuring every patient feels heard, respected, and well cared for.",
  tags: ["General Medicine", "Family Health", "Chronic Disease", "Pediatrics", "Preventive Care"],
  qualifications: [
    {
      icon: "🎓",
      title: "MBBS – Bachelor of Medicine & Surgery",
      sub: "Madras Medical College, The Tamil Nadu Dr. MGR Medical University, 2005",
    },
    {
      icon: "🏆",
      title: "MD – General Medicine",
      sub: "Stanley Medical College, Chennai, 2009",
    },
    {
      icon: "🏥",
      title: "Senior Resident – Government General Hospital",
      sub: "3 years of residency in General Medicine · Chennai",
    },
    {
      icon: "📋",
      title: "Registered with Tamil Nadu Medical Council",
      sub: "Registration No: TNMC-45231 · Valid & Active",
    },
    {
      icon: "⭐",
      title: "15+ Years Clinical Practice",
      sub: "Over 5,000 patients treated across Anna Nagar, Chennai.",
    },
  ],
};
// ──────────────────────────────────────────────────────────────

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const hours = {
  Monday: "9:00 AM – 7:00 PM",
  Tuesday: "9:00 AM – 7:00 PM",
  Wednesday: "9:00 AM – 7:00 PM",
  Thursday: "9:00 AM – 7:00 PM",
  Friday: "9:00 AM – 7:00 PM",
  Saturday: "9:00 AM – 2:00 PM",
  Sunday: "Emergency Only",
};

export default function PageDoctor({ setPage }) {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <div className="page-wrapper">
      {/* Page header — purple gradient bg from App.css .page-header */}
      <div className="page-header">
        <div className="container">
          <span className="pill">Meet the Doctor</span>
          <h1>Our Doctor</h1>
          <p>Compassionate care backed by expertise and experience.</p>
        </div>
      </div>

      {/* ── Doctor Profile Card ───────────────────────────────── */}
      <section className="section">
        <div className="container">
          <FadeUp>
            <div className="doctor-card">
              {/* CHANGE: Replaced emoji with styled initials avatar */}
              {/* When client provides a photo, replace this div with <img> */}
              {/* CHANGE: Replaced "SK" initials placeholder with a real
                  doctor photo. Same Unsplash placeholder as the hero —
                  swap `src` with the real doctor's photo when the
                  client orders (recommended: 400x480px portrait,
                  placed in src/assets/ and imported). */}
              <div className="doctor-card__photo">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=480&fit=crop&crop=faces&q=80"
                  alt={DOCTOR.name}
                />
              </div>

              <div className="doctor-card__info">
                {/* CHANGE: Real doctor name */}
                <h2>{DOCTOR.name}</h2>
                <p className="doctor-card__spec">{DOCTOR.qualification}</p>
                {/* CHANGE: Real bio */}
                <p className="doctor-card__bio">{DOCTOR.bio}</p>
                <div className="doctor-card__tags">
                  {DOCTOR.tags.map(t => (
                    <span key={t} className="pill pill--sm">{t}</span>
                  ))}
                </div>
                <button
                  className="btn btn--primary"
                  style={{ marginTop: 20 }}
                  onClick={() => { setPage("booking"); window.scrollTo({ top: 0 }); }}
                >
                  📅 Book an Appointment
                </button>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Qualifications ────────────────────────────────────── */}
      <section className="section-sm" style={{ background: "var(--gray-50)" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <FadeUp>
            <h2 style={{ marginBottom: 8 }}>Qualifications & Experience</h2>
            <p style={{ color: "var(--gray-600)", marginBottom: 28 }}>
              Academic training and professional background.
            </p>
            <div className="card" style={{ padding: 24 }}>
              {/* CHANGE: All real qualification entries */}
              {DOCTOR.qualifications.map((q, i) => (
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

      {/* ── Consultation Hours Grid ───────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <FadeUp>
            <h2 style={{ marginBottom: 8 }}>Consultation Hours</h2>
            <p style={{ color: "var(--gray-600)", marginBottom: 24 }}>
              Walk-ins welcome; booking recommended.
            </p>
            <div className="timing-grid">
              {days.map(d => (
                <div
                  key={d}
                  className={`timing-card${d === today ? " timing-card--today" : ""}${d === "Sunday" ? " timing-card--sunday" : ""}`}
                >
                  <div className="timing-card__day">
                    {d}{d === today && <span className="today-badge">Today</span>}
                  </div>
                  <div className={`timing-card__hours${d === "Sunday" ? " timing-card__hours--closed" : ""}`}>
                    {hours[d]}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                className="btn btn--primary"
                onClick={() => { setPage("booking"); window.scrollTo({ top: 0 }); }}
              >
                📅 Book Appointment
              </button>
              <a href="tel:+91-9629622076" className="btn btn--outline">📞 Call Clinic</a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}