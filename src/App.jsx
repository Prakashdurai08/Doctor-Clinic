// ─── App Root ─────────────────────────────────────────────────
// CHANGED: Added PageTransition, ToastContainer, WhatsAppButton,
//          MobileNav, and PageToken.

import { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import { ToastContainer } from "./components/Toast";   // ✅ FIX: named import (curly braces)
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

export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <PageHome setPage={setPage} />;
      case "booking": return <PageBooking setPage={setPage} />;
      case "doctor": return <PageDoctor setPage={setPage} />;
      case "reviews": return <PageReviews setPage={setPage} />;
      case "faq": return <PageFAQ setPage={setPage} />;
      case "contact": return <PageContact setPage={setPage} />;
      case "dashboard": return <PageDashboard />;
      case "token": return <PageToken />;
      default: return <PageHome setPage={setPage} />;
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
      <WhatsAppButton />
      <MobileNav page={page} setPage={setPage} />
      <ToastContainer />  {/* ✅ FIX: use correct component name */}
    </div>
  );
}
