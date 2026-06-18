// ─── Page: Reviews ────────────────────────────────────────────
// Shows a rating summary card (score + breakdown bars) and a
// grid of patient review cards. Rating bar fill uses the purple
// gradient defined in App.css .rating-bar__fill.
// CHANGED (Item F): Added "View on Google Reviews" and
// "Write a Review" buttons below the rating summary card.
//
// CHANGE HERE: Replace GOOGLE_MAPS_URL with your clinic's actual
// Google Maps listing URL (search your clinic name on Google Maps,
// click Share, copy the link).

import FadeUp from "../components/FadeUp";

// CHANGE HERE: your clinic's Google Maps URL
const GOOGLE_MAPS_URL = "https://www.google.com/maps/search/?api=1&query=MediCare+Clinic+Anna+Nagar+Chennai";
// Write-a-review deep link (Google opens review composer directly when
// the listing has a place_id — using search URL as a safe fallback)
const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID";

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

          {/* ── CHANGE: Google Reviews CTA buttons (Item F) ───────── */}
          <FadeUp delay={0.1}>
            <div className="google-reviews-cta">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noreferrer"
                className="google-reviews-btn"
              >
                {/* Google "G" logo */}
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                View on Google Reviews →
              </a>
              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noreferrer"
                className="btn btn--outline"
              >
                ✍️ Write a Review
              </a>
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
