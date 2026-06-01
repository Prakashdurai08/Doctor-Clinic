// ─── WhatsApp Floating Button ─────────────────────────────────
// Fixed bottom-RIGHT bubble, slightly above the mobile nav bar.

import { CLINIC } from "../utils/constants";

export default function WhatsAppButton() {
  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37,211,102,.45); }
          50%       { box-shadow: 0 4px 32px rgba(37,211,102,.80); }
        }
        .wa-btn {
          position: fixed;
          bottom: 84px;        /* sits above mobile nav (64px) + 20px gap */
          right: 20px;
          left: auto;
          z-index: 300;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #25d366;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37,211,102,.45);
          animation: waPulse 2.5s ease-in-out infinite;
          text-decoration: none;
          transition: transform .2s ease;
        }
        /* On desktop (no bottom nav) — sit lower */
        @media (min-width: 769px) {
          .wa-btn {
            bottom: 28px;
            right: 28px;
            width: 56px;
            height: 56px;
          }
        }
        .wa-btn:hover { transform: scale(1.12); }
      `}</style>

      <a
        href={`https://wa.me/${CLINIC.whatsapp}?text=${encodeURIComponent(
          "Hello MediCare Clinic, I'd like to enquire about an appointment."
        )}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="wa-btn"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="28"
          height="28"
          fill="white"
        >
          <path d="M16 .5C7.439.5.5 7.439.5 16c0 2.818.742 5.564 2.149 7.98L.5 31.5l7.723-2.124A15.435 15.435 0 0016 31.5C24.561 31.5 31.5 24.561 31.5 16S24.561.5 16 .5zm0 28.3a13.198 13.198 0 01-6.737-1.843l-.483-.287-4.585 1.261 1.293-4.46-.315-.497A13.24 13.24 0 012.7 16C2.7 8.653 8.653 2.7 16 2.7S29.3 8.653 29.3 16 23.347 28.8 16 28.8zm7.26-9.873c-.397-.199-2.35-1.159-2.715-1.291-.364-.132-.629-.198-.894.199-.265.397-1.027 1.291-1.259 1.556-.231.265-.463.298-.86.099-.397-.198-1.676-.617-3.192-1.97-1.18-1.051-1.977-2.349-2.208-2.746-.231-.397-.025-.612.174-.81.178-.177.397-.463.596-.694.199-.231.265-.397.397-.662.132-.265.066-.497-.033-.695-.099-.198-.894-2.154-1.225-2.95-.322-.774-.65-.669-.894-.682l-.762-.013c-.265 0-.695.099-1.06.497-.364.397-1.39 1.358-1.39 3.313 0 1.954 1.424 3.843 1.622 4.108.199.265 2.8 4.275 6.784 5.993.948.409 1.688.653 2.265.836.952.302 1.818.259 2.503.157.763-.114 2.35-.96 2.682-1.888.332-.929.332-1.724.232-1.889-.099-.165-.364-.264-.761-.463z" />
        </svg>
      </a>
    </>
  );
}
