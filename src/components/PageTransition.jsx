// ─── Page Transition — Fade + Slide Up ────────────────────────
// Smooth fade-in + slide-up on every page change.

import { useEffect, useState } from "react";

export default function PageTransition({ children, pageKey }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [pageKey]);

  return (
    <div style={{
      opacity:   visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition:"opacity .4s cubic-bezier(.4,0,.2,1), transform .4s cubic-bezier(.4,0,.2,1)",
      minHeight:"60vh",
    }}>
      {children}
    </div>
  );
}