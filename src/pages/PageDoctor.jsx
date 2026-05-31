// ─── Page: Doctor ─────────────────────────────────────────────
// Displays the doctor's profile photo, bio, qualifications,
// specialty tags, and a weekly consultation hours grid.
// "Today" card is highlighted with the purple border (App.css).

import FadeUp from "../components/FadeUp";

export default function PageDoctor({ setPage }) {
  const qualifications = [
    { icon: "🎓", title: "MBBS – Bachelor of Medicine & Surgery", sub: "[Medical College Name], [University], [Year of Graduation]" },
    { icon: "🏆", title: "MD – General Medicine", sub: "[Postgraduate Institute], [University], [Year]" },
    { icon: "🏥", title: "Senior Resident – [Hospital Name]", sub: "3 years of residency in General Medicine · [City]" },
    { icon: "📋", title: "Registered with Tamil Nadu Medical Council", sub: "Registration No: [TNMC-XXXX] · Valid & Active" },
    { icon: "⭐", title: "15+ Years Clinical Practice", sub: "Over 5,000 patients treated across Chennai." },
  ];

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
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long" });

  return (
    <div className="page-wrapper">
      {/* Page header — purple gradient bg from App.css .page-header */}
      <div className="page-header">
        <div className="container">
          <span className="pill">Meet the Team</span>
          <h1>Our Doctor</h1>
          <p>Compassionate care backed by expertise and experience.</p>
        </div>
      </div>

      {/* ── Doctor Profile Card ───────────────────────────────── */}
      <section className="section">
        <div className="container">
          <FadeUp>
            <div className="doctor-card">
              {/* Photo placeholder — purple gradient bg */}
              <div className="doctor-card__photo">🧑‍⚕️</div>
              <div className="doctor-card__info">
                <h2>Dr. [Doctor's Full Name]</h2>
                {/* Specialty text uses --teal-dark (purple) from App.css */}
                <p className="doctor-card__spec">MBBS, MD – General Medicine & Family Health</p>
                <p className="doctor-card__bio">
                  Dr. [Name] is a dedicated physician with over 15 years of experience in general
                  medicine and family healthcare. Known for a patient-first approach, they combine
                  clinical expertise with genuine warmth to ensure every patient feels heard,
                  respected, and well-cared for.
                </p>
                {/* Specialty tags — purple pill style */}
                <div className="doctor-card__tags">
                  {["General Medicine", "Family Health", "Chronic Disease", "Pediatrics", "Preventive Care"].map(t => (
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

      {/* ── Consultation Hours Grid ───────────────────────────── */}
      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          <FadeUp>
            <h2 style={{ marginBottom: 8 }}>Consultation Hours</h2>
            <p style={{ color: "var(--gray-600)", marginBottom: 24 }}>Walk-ins welcome; booking recommended.</p>
            <div className="timing-grid">
              {days.map(d => (
                <div
                  key={d}
                  className={`timing-card${d === today ? " timing-card--today" : ""}${d === "Sunday" ? " timing-card--sunday" : ""}`}
                >
                  {/* Today badge — purple bg from App.css .today-badge */}
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
