// ─── App Root ─────────────────────────────────────────────────
// CHANGED: Added hash-based routing so browser back button works
// and pages can be bookmarked/shared (e.g. yourclinic.com/#booking)
// No new library needed — uses window.location.hash natively.

import { useState, useEffect } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import { ToastContainer } from "./components/Toast";
import WhatsAppButton from "./components/WhatsAppButton";
import MobileNav from "./components/MobileNav";

import PageHome from "./pages/PageHome";
import PageBooking from "./pages/PageBooking";
import PageDoctor from "./pages/PageDoctor";
import PageReviews from "./pages/PageReviews";
import PageFAQ from "./pages/PageFAQ";
import PageContact from "./pages/PageContact";
import PageDashboard from "./pages/PageDashboard";
import PageToken from "./pages/PageToken";

// CHANGE: Valid page names — hash must match one of these
const VALID_PAGES = ["home","booking","doctor","reviews","faq","contact","dashboard","token"];

// CHANGE: Read current hash from URL, fallback to "home"
const getPageFromHash = () => {
  const hash = window.location.hash.replace("#", "");
  return VALID_PAGES.includes(hash) ? hash : "home";
};

export default function App() {
  const [page, setPage] = useState(getPageFromHash);

  // CHANGE: Sync URL hash when page state changes
  useEffect(() => {
    window.location.hash = page;
  }, [page]);

  // CHANGE: Listen for browser back/forward button
  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home":      return <PageHome setPage={setPage} />;
      case "booking":   return <PageBooking setPage={setPage} />;
      case "doctor":    return <PageDoctor setPage={setPage} />;
      case "reviews":   return <PageReviews setPage={setPage} />;
      case "faq":       return <PageFAQ setPage={setPage} />;
      case "contact":   return <PageContact setPage={setPage} />;
      case "dashboard": return <PageDashboard />;
      case "token":     return <PageToken />;
      default:          return <PageHome setPage={setPage} />;
    }
  };

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} />
      <main>
        <PageTransition pageKey={page}>
          {renderPage()}
        </PageTransition>
      </main>
      <Footer setPage={setPage} />
      {/* CHANGE: Hide WhatsApp on staff-only pages */}
      {page !== "dashboard" && page !== "token" && <WhatsAppButton />}
      <MobileNav page={page} setPage={setPage} />
      <ToastContainer />
    </div>
  );
}