// ─── App Root ─────────────────────────────────────────────────
// Entry point that wires together all pages and shared components.
// Page routing is done via a simple string state (no React Router).
// All green/teal colors have been replaced with purple/violet in App.css.

import { useState } from "react";
import "./App.css";

// ── Shared Components ─────────────────────────────────────────
import Navbar      from "./components/Navbar";
import Footer      from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// ── Pages ─────────────────────────────────────────────────────
import PageHome      from "./pages/PageHome";
import PageBooking   from "./pages/PageBooking";
import PageDoctor    from "./pages/PageDoctor";
import PageReviews   from "./pages/PageReviews";
import PageFAQ       from "./pages/PageFAQ";
import PageContact   from "./pages/PageContact";
import PageDashboard from "./pages/PageDashboard";

export default function App() {
  // Single page state drives all navigation — no router needed
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home":      return <PageHome      setPage={setPage} />;
      case "booking":   return <PageBooking                      />;
      case "doctor":    return <PageDoctor    setPage={setPage} />;
      case "reviews":   return <PageReviews   setPage={setPage} />;
      case "faq":       return <PageFAQ       setPage={setPage} />;
      case "contact":   return <PageContact   setPage={setPage} />;
      case "dashboard": return <PageDashboard                   />;
      default:          return <PageHome      setPage={setPage} />;
    }
  };

  return (
    <div className="app">
      {/* Fixed top navbar — purple accent colors */}
      <Navbar page={page} setPage={setPage} />

      {/* Page content — padding-top accounts for fixed navbar height */}
      <main>{renderPage()}</main>

      {/* Site footer — navy background */}
      <Footer setPage={setPage} />

      {/* Floating scroll-to-top button — purple gradient */}
      <ScrollToTop />
    </div>
  );
}
