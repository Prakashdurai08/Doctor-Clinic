// ─── Page: FAQ ────────────────────────────────────────────────
// Accordion-style FAQ grouped into sections. Open item uses
// the purple gradient bg defined in App.css .faq-item__q.open.
// Bottom CTA section uses purple light bg (.faq-cta in App.css).

import { useState } from "react";
import FadeUp from "../components/FadeUp";
import { CLINIC } from "../utils/constants";

export default function PageFAQ({ setPage }) {
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  const sections = [
    {
      heading: "💰 Fees & Payments",
      items: [
        { q: "What is the consultation fee?", a: "The standard consultation fee is ₹[Amount]. Fees may vary for specialist consultations, procedures, or follow-ups. We accept cash, UPI, and major debit/credit cards. Please call us for the latest fee schedule." },
        { q: "Is there a separate charge for follow-up visits?", a: "Follow-up visits within 7 days of an initial consultation are charged at a reduced rate of ₹[Amount]. Please bring your previous prescription or medical records." },
        { q: "Do you accept health insurance?", a: "We currently accept [Insurance Provider Names]. Please call us in advance to confirm whether your specific policy is covered." },
      ],
    },
    {
      heading: "🕐 Timings & Appointments",
      items: [
        { q: "What are the clinic's operating hours?", a: "Monday – Friday: 9:00 AM to 7:00 PM | Saturday: 9:00 AM to 2:00 PM | Sunday: Emergency consultations only. Public holidays may have different hours." },
        { q: "How do I book an appointment?", a: "You can book online via our Book Appointment page, send us a WhatsApp message, call our clinic directly, or walk in during clinic hours. Online booking is the fastest way to secure your preferred slot." },
        { q: "How long will I have to wait after booking?", a: "Booked appointments typically wait 10–20 minutes. Walk-in patients are seen in the order of arrival after booked patients. We recommend booking in advance, especially on weekday mornings." },
        { q: "Can I cancel or reschedule my appointment?", a: "Yes. Please call or WhatsApp us at least 2 hours before your scheduled time. This helps us accommodate other patients. There is no cancellation fee." },
      ],
    },
    {
      heading: "🎒 What to Bring",
      items: [
        { q: "What documents should I bring to my first visit?", a: "Please bring: a government-issued photo ID, any previous medical records or prescriptions, your health insurance card (if applicable), and a list of current medications." },
        { q: "Should I fast before my appointment?", a: "Fasting is only required if you are scheduled for specific blood tests (such as fasting blood glucose or lipid profiles). For a general consultation, there is no need to fast." },
      ],
    },
    {
      heading: "🔒 Privacy & Data",
      items: [
        { q: "How is my booking data stored and used?", a: "When you book through our website, your details are securely saved to our clinic's private Google Sheet database. Only authorized clinic staff can access this data." },
        { q: "Is my medical information kept confidential?", a: "Absolutely. All medical information shared during consultation is strictly confidential and protected under patient privacy norms. We do not share your health data with third parties." },
      ],
    },
  ];

  // Global index counter for accordion keys
  let idx = 0;

  return (
    <div className="page-wrapper">
      {/* Page header — purple gradient bg */}
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
                      {/* Question button — hover/open uses purple bg from App.css */}
                      <button
                        className={`faq-item__q${open === i ? " open" : ""}`}
                        onClick={() => toggle(i)}
                      >
                        <span>{item.q}</span>
                        {/* + icon rotates 45° when open */}
                        <span className={`faq-item__icon${open === i ? " open" : ""}`}>+</span>
                      </button>
                      {/* Answer expands via max-height transition */}
                      <div className={`faq-item__a${open === i ? " open" : ""}`}>{item.a}</div>
                    </div>
                  );
                })}
              </div>
            </FadeUp>
          ))}

          {/* Bottom CTA — purple light bg from App.css .faq-cta */}
          <FadeUp>
            <div className="faq-cta">
              <div style={{ fontSize: "2.5rem" }}>💬</div>
              <h3>Still have questions?</h3>
              <p>Our team is happy to help you anytime.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  className="btn btn--primary"
                  onClick={() => { setPage("contact"); window.scrollTo({ top: 0 }); }}
                >
                  Contact Us
                </button>
                <a href={`tel:${CLINIC.phone}`} className="btn btn--outline">📞 Call Now</a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
