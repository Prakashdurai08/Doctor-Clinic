// ─── Page: Reviews ────────────────────────────────────────────
// Shows a rating summary card (score + breakdown bars) and a
// grid of patient review cards. Rating bar fill uses the purple
// gradient defined in App.css .rating-bar__fill.

import FadeUp from "../components/FadeUp";

export default function PageReviews({ setPage }) {
  const reviews = [
    { stars: 5, quote: "The doctor was incredibly thorough and patient. I felt genuinely cared for, not just another number. Highly recommend!", name: "Priya Sharma", since: "Patient since 2021", avatar: "👩" },
    { stars: 5, quote: "Booking was super easy and the staff is very warm. The clinic is clean and the doctor explains everything clearly.", name: "Rajan Pillai", since: "Patient since 2019", avatar: "👨" },
    { stars: 5, quote: "Best clinic in Anna Nagar. Always on time, very professional, and genuinely caring. Wouldn't go anywhere else.", name: "Meena Krishnan", since: "Patient since 2020", avatar: "👩‍🦱" },
    { stars: 5, quote: "My entire family has been coming here for 3 years. The doctor remembers our history and treats us like family.", name: "Suresh Babu", since: "Patient since 2022", avatar: "👨‍🦳" },
    { stars: 4, quote: "Excellent care and very hygienic premises. The wait time was slightly long but the consultation was worth it.", name: "Kavitha Rangan", since: "Patient since 2023", avatar: "👩‍🦰" },
    { stars: 5, quote: "Called for a home visit and the doctor came on time. Very professional and thorough. Highly recommended!", name: "Arjun Nair", since: "Patient since 2021", avatar: "🧑" },
  ];

  // Rating distribution
  const ratings = { 5: 185, 4: 12, 3: 4, 2: 0, 1: 0 };
  const total = Object.values(ratings).reduce((a, b) => a + b, 0);

  return (
    <div className="page-wrapper">
      {/* Page header — purple gradient bg */}
      <div className="page-header">
        <div className="container">
          <span className="pill">Patient Stories</span>
          <h1>What Our Patients Say</h1>
          <p>Real experiences from real patients who trust MediCare Clinic.</p>
        </div>
      </div>

      {/* ── Rating Summary Card ───────────────────────────────── */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 700 }}>
          <FadeUp>
            <div className="card rating-summary">
              {/* Overall score — purple number from App.css .rating-summary__num */}
              <div className="rating-summary__score">
                <div className="rating-summary__num">4.9</div>
                <div className="rating-summary__stars">★★★★★</div>
                <div className="rating-summary__count">based on 200+ reviews</div>
              </div>
              {/* Rating bars — fill uses purple→indigo gradient */}
              <div className="rating-summary__bars">
                {[5, 4, 3, 2, 1].map(n => (
                  <div key={n} className="rating-bar">
                    <span className="rating-bar__label">{n} ★</span>
                    <div className="rating-bar__track">
                      <div className="rating-bar__fill" style={{ width: `${(ratings[n] / total) * 100}%` }} />
                    </div>
                    <span className="rating-bar__count">{ratings[n]}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Reviews Grid ──────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--gray-50)" }}>
        <div className="container">
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <FadeUp key={r.name} delay={i * 0.07}>
                <div className="testimonial-card">
                  <div className="testimonial-card__stars">
                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                  </div>
                  <p className="testimonial-card__quote">"{r.quote}"</p>
                  <div className="testimonial-card__author">
                    {/* Avatar bg uses purple light */}
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
            <button
              className="btn btn--primary"
              onClick={() => { setPage("booking"); window.scrollTo({ top: 0 }); }}
            >
              📅 Book Your Appointment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
