// ─── Page: Dashboard ──────────────────────────────────────────
// PIN-protected staff dashboard. DashboardGate handles auth;
// PageDashboardContent is the actual queue management UI.
// Dashboard header uses the purple gradient (App.css .dash-header).
// Future pending appointments highlighted in soft purple rows.

import { useState, useEffect } from "react";
import { LS, CLINIC, SHEET_URL, fmtDate } from "../utils/constants";

// ── PIN configuration — change this to your clinic's PIN ──────
const DASHBOARD_PIN = "1234";

// ── DashboardGate: wraps content behind PIN auth ──────────────
function DashboardGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("dash_unlocked") === "true");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Countdown timer when locked after 3 failed attempts
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      setLockTimer((t) => {
        if (t <= 1) { clearInterval(id); setLocked(false); setAttempts(0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [locked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locked) return;
    if (pin === DASHBOARD_PIN) {
      sessionStorage.setItem("dash_unlocked", "true");
      setUnlocked(true);
      setError("");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setPin("");
      if (next >= 3) {
        setLocked(true);
        setLockTimer(30);
        setError("Too many attempts.");
      } else {
        setError(`Incorrect PIN. ${3 - next} attempt${3 - next === 1 ? "" : "s"} remaining.`);
      }
    }
  };

  if (unlocked) return children;

  return (
    <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 20px" }}>
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔐</div>
          <h2 style={{ marginBottom: 10 }}>Staff Dashboard Protected</h2>
          <p style={{ color: "var(--gray-600)", marginBottom: 24 }}>Enter clinic PIN to continue</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password" className="form-control" placeholder="Enter PIN"
              value={pin} onChange={(e) => setPin(e.target.value)}
              disabled={locked} maxLength={8} autoFocus
              style={{ textAlign: "center", fontSize: "1.4rem", letterSpacing: ".3em", marginBottom: 16 }}
            />
            {error && (
              <div className="alert alert--danger" style={{ marginBottom: 16 }}>
                {locked ? `🔒 Locked (${lockTimer}s)` : `❌ ${error}`}
              </div>
            )}
            {/* Unlock button — purple primary style */}
            <button
              type="submit" className="btn btn--primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={!pin || locked}
            >
              {locked ? `Locked (${lockTimer}s)` : "🔓 Unlock Dashboard"}
            </button>
          </form>
          <p style={{ marginTop: 18, fontSize: ".8rem", color: "var(--gray-400)" }}>Authorized staff only</p>
        </div>
      </div>
    </div>
  );
}

// ── PageDashboard: wraps content in gate ─────────────────────
export default function PageDashboard() {
  return <DashboardGate><PageDashboardContent /></DashboardGate>;
}

// ── PageDashboardContent: main queue management UI ────────────
function PageDashboardContent() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailableState] = useState(LS.isAvailable());
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [walkInForm, setWalkInForm] = useState({ name: "", age: "", phone: "", notes: "" });
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  // Toggle to show last 30 days of booking history
  const [showHistory, setShowHistory] = useState(false);

  const refresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
    const data = await LS.fetchBookings();
    setBookings(data);
    setLoading(false);
    setRefreshing(false);
    setLastRefreshed(new Date());
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAvail = () => {
    const next = !available;
    LS.setAvailability(next);
    setAvailableState(next);
  };

  const changeStatus = async (id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    await LS.updateBooking(id, { status });
  };

  // Mark patient as arrived and assign next queue token
  const markArrived = async (id) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr);
    const nextToken = todayArrivals.length + 1;
    const fields = {
      arrived: true,
      token: nextToken,
      checkedInAt: new Date().toISOString(),
      status: "Confirmed",
    };
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
    await LS.updateBooking(id, fields);
  };

  // Add walk-in patient directly to the queue
  const addWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInForm.name || !walkInForm.age || !walkInForm.phone) {
      alert("Please fill in name, age, and phone.");
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr);
    const nextToken = todayArrivals.length + 1;
    const newBooking = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      name: walkInForm.name,
      age: walkInForm.age,
      phone: walkInForm.phone,
      email: "",
      datetime: new Date().toISOString(),
      notes: walkInForm.notes,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
      arrived: true,
      token: nextToken,
      visitType: "Walk-In",
      checkedInAt: new Date().toISOString(),
      completedAt: null,
      action: "add",
    };
    setBookings(prev => [...prev, newBooking]);
    setWalkInForm({ name: "", age: "", phone: "", notes: "" });
    setShowWalkInForm(false);
    await fetch(SHEET_URL, { method: "POST", body: JSON.stringify(newBooking) });
  };

  const markCompleted = async (id) => {
    const fields = { status: "Completed", completedAt: new Date().toISOString() };
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
    await LS.updateBooking(id, fields);
  };

  const deleteBooking = async (id) => {
    if (!confirm("Delete this booking?")) return;
    setBookings(prev => prev.filter(b => b.id !== id));
    await LS.deleteBooking(id);
  };

  const clearAll = async () => {
    if (!confirm("Clear ALL bookings? This cannot be undone.")) return;
    setBookings([]);
    await LS.deleteAll();
  };

  // Announce next patient in queue via browser alert
  const callNextPatient = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayQueue = bookings
      .filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr && b.status === "Confirmed")
      .sort((a, b) => (a.token || 0) - (b.token || 0));
    if (todayQueue.length === 0) { alert("No patients in queue."); return; }
    const nextPatient = todayQueue[0];
    alert(`🔔 Calling: ${nextPatient.name} (Token #${nextPatient.token})`);
  };

  // Export all bookings as a CSV file download
  const exportCSV = () => {
    if (!bookings.length) return alert("No bookings to export.");
    const headers = ["ID", "Name", "Age", "Phone", "Email", "DateTime", "Notes", "Status", "Token", "Visit Type", "Arrival Time", "Completed At", "CreatedAt"];
    const rows = bookings.map(b => [
      b.id, b.name, b.age, b.phone, b.email, b.datetime,
      (b.notes || "").replace(/,/g, " "), b.status, b.token || "—",
      b.visitType || "Online",
      b.checkedInAt ? fmtDate(b.checkedInAt) : "—",
      b.completedAt ? fmtDate(b.completedAt) : "—",
      b.createdAt,
    ].join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `bookings-${Date.now()}.csv`,
    });
    a.click();
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Today's bookings: submitted today AND scheduled today
  const todayBookings = bookings.filter(
    b => b.createdAt?.slice(0, 10) === todayStr && b.datetime?.slice(0, 10) === todayStr
  );

  // Future pending bookings: scheduled after today, still Pending
  const futurePending = bookings.filter(
    b => b.datetime?.slice(0, 10) > todayStr && b.status === "Pending"
  );

  const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0, 10) === todayStr);
  const todayQueue = [...todayArrivals].sort((a, b) => (a.token || 0) - (b.token || 0));
  const waitingOnline = bookings.filter(b => !b.arrived && b.visitType === "Online" && b.datetime?.slice(0, 10) === todayStr);
  const completedToday = bookings.filter(b => b.status === "Completed" && b.completedAt?.slice(0, 10) === todayStr);

  // Stat cards — 4th card (Future Pending) uses purple color
  const stats = [
    { num: todayBookings.length,  lbl: "Today's Bookings",  color: "var(--teal)",    icon: "📅" },
    { num: futurePending.length,  lbl: "Pending (Future)",  color: "#9b59b6",        icon: "⏳" },
    { num: todayArrivals.length,  lbl: "Arrived",           color: "var(--success)", icon: "✅" },
    { num: completedToday.length, lbl: "Completed",         color: "var(--blue)",    icon: "🏁" },
  ];

  // Base filter for search + tab selection
  const baseFiltered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name?.toLowerCase().includes(q) || b.phone?.toLowerCase().includes(q);
    const matchTab = activeTab === "all" || b.status?.toLowerCase() === activeTab;
    return matchSearch && matchTab;
  }).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));

  // 30-day history filter
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filtered = showHistory
    ? baseFiltered.filter(b => new Date(b.createdAt) >= thirtyDaysAgo)
    : baseFiltered;

  return (
    <div className="page-wrapper">

      {/* ── Dashboard Header — purple gradient bg ─────────────── */}
      <div className="dash-header">
        <div className="container">
          <div className="dash-header__inner">
            {/* Lock button */}
            <button
              className="btn btn--outline btn--sm"
              style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "1px solid rgba(255,255,255,.4)" }}
              onClick={() => { sessionStorage.removeItem("dash_unlocked"); window.location.reload(); }}
            >
              🔒 Lock Dashboard
            </button>
            <div>
              <span className="pill" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}>Staff Dashboard</span>
              <h1 style={{ color: "#fff", marginTop: 10 }}>Queue Management System</h1>
              <p style={{ opacity: .85 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
              {lastRefreshed && (
                <p style={{ opacity: .6, fontSize: ".8rem", marginTop: 4 }}>
                  Last synced: {lastRefreshed.toLocaleTimeString("en-IN", { timeStyle: "short" })}
                </p>
              )}
            </div>
            {/* Availability indicator */}
            <div className="avail-badge">
              <span className={`avail-dot${available ? " avail-dot--open" : " avail-dot--closed"}`} />
              <span>{available ? "🟢 Clinic Open" : "🔴 Clinic Closed"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 8 }}>
        <div className="dash-stats">
          {stats.map(s => (
            <div key={s.lbl} className="dash-stat">
              <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{s.icon}</div>
              {/* Number color per stat type — Future Pending uses purple */}
              <div className="dash-stat__num" style={{ color: s.color }}>
                {loading ? "…" : s.num}
              </div>
              <div className="dash-stat__lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Future Pending alert banner — appears when count > 0 */}
        {futurePending.length > 0 && (
          <div style={{
            background: "#f3e8ff",
            border: "1px solid #c084fc",
            borderRadius: 10,
            padding: "12px 18px",
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}>
            <span style={{ fontSize: "1.2rem" }}>⏳</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: "#7e22ce" }}>
                {futurePending.length} future appointment{futurePending.length > 1 ? "s" : ""} waiting for confirmation
              </strong>
              <div style={{ fontSize: ".82rem", color: "#6b21a8", marginTop: 3 }}>
                {futurePending.slice(0, 3).map(b => (
                  <span key={b.id} style={{ marginRight: 12 }}>
                    👤 {b.name} — {fmtDate(b.datetime)}
                  </span>
                ))}
                {futurePending.length > 3 && <span>+{futurePending.length - 3} more</span>}
              </div>
            </div>
            {/* View All → scrolls to the pending tab */}
            <button
              className="btn btn--sm"
              style={{ background: "#7e22ce", color: "#fff", border: "none" }}
              onClick={() => {
                setActiveTab("pending");
                setSearch("");
                setShowHistory(false);
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              }}
            >
              View All →
            </button>
          </div>
        )}
      </div>

      {/* ── Clinic Controls ───────────────────────────────────── */}
      <div className="container" style={{ marginBottom: 8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">🔧 Clinic Controls</h3>
          <div className="dash-controls">
            {/* Availability toggle — thumb turns purple when checked (App.css) */}
            <label className="toggle-switch">
              <input type="checkbox" checked={available} onChange={toggleAvail} />
              <div className="toggle-track" />
              <span className="toggle-label">{available ? "Available Today" : "Not Available Today"}</span>
            </label>
            <div style={{ flex: 1 }} />
            <button className="btn btn--primary btn--sm" onClick={callNextPatient}>📢 Call Next Patient</button>
            <button className="btn btn--outline btn--sm" onClick={() => refresh(false)} disabled={refreshing}>
              {refreshing ? "⏳ Syncing…" : "🔄 Refresh"}
            </button>
            <button className="btn btn--outline btn--sm" onClick={exportCSV}>⬇ Export CSV</button>
            <button className="btn btn--danger btn--sm" onClick={clearAll}>🗑 Clear All</button>
          </div>
          <div className={`alert ${available ? "alert--success" : "alert--danger"}`} style={{ marginTop: 12 }}>
            {available
              ? "✅ Bookings are open. Patients can book appointments."
              : "🚫 Bookings are disabled. Booking page will show a \"Closed\" banner."}
          </div>
        </div>
      </div>

      {/* ── Today's Queue ─────────────────────────────────────── */}
      {todayQueue.length > 0 && (
        <div className="container" style={{ marginBottom: 8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">📋 Today's Queue ({todayQueue.length})</h3>
            <div className="table-wrap">
              {/* Table header uses purple gradient from App.css thead */}
              <table>
                <thead>
                  <tr><th>Token</th><th>Name</th><th>Type</th><th>Arrival Time</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {todayQueue.map((b) => (
                    <tr key={b.id}>
                      {/* Token badge uses purple gradient */}
                      <td><span className="token-badge">#{b.token}</span></td>
                      <td><strong>{b.name}</strong></td>
                      <td>
                        <span className={`visit-type-pill visit-type-pill--${(b.visitType || "online").toLowerCase()}`}>
                          {b.visitType}
                        </span>
                      </td>
                      <td>{b.checkedInAt ? fmtDate(b.checkedInAt) : "—"}</td>
                      <td>
                        <span className={`status-pill status-pill--${b.status.toLowerCase()}`}>{b.status}</span>
                      </td>
                      <td>
                        <button className="btn btn--success btn--sm" style={{ padding: "4px 10px" }} onClick={() => markCompleted(b.id)}>
                          ✓ Done
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Waiting Online Bookings ───────────────────────────── */}
      {waitingOnline.length > 0 && (
        <div className="container" style={{ marginBottom: 8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">⏳ Waiting Online Bookings ({waitingOnline.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Contact</th><th>Booked Time</th><th>Notes</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {waitingOnline.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong></td>
                      <td>
                        <a href={`tel:${b.phone}`} style={{ color: "var(--teal-dark)" }}>{b.phone}</a>
                      </td>
                      <td>{fmtDate(b.datetime)}</td>
                      <td style={{ fontSize: ".82rem" }}>{b.notes || "—"}</td>
                      <td>
                        <button className="btn btn--primary btn--sm" style={{ padding: "4px 10px" }} onClick={() => markArrived(b.id)}>
                          ✓ Mark Arrived
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Walk-In Form ──────────────────────────────────── */}
      <div className="container" style={{ marginBottom: 8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">➕ Add Walk-In Patient</h3>
          {!showWalkInForm ? (
            <button className="btn btn--primary" onClick={() => setShowWalkInForm(true)}>+ Add Walk-In</button>
          ) : (
            <form onSubmit={addWalkIn} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" placeholder="Patient name" value={walkInForm.name} onChange={(e) => setWalkInForm({ ...walkInForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input type="number" className="form-control" placeholder="Age" value={walkInForm.age} onChange={(e) => setWalkInForm({ ...walkInForm, age: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" className="form-control" placeholder="Phone" value={walkInForm.phone} onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-control" placeholder="Notes" value={walkInForm.notes} onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })} />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", gap: "12px" }}>
                <button type="submit" className="btn btn--success">✓ Add Walk-In</button>
                <button type="button" className="btn btn--outline" onClick={() => setShowWalkInForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── 30-Day History Toggle ─────────────────────────────── */}
      <div className="container" style={{ marginBottom: 8 }}>
        <button
          className={`btn ${showHistory ? "btn--primary" : "btn--outline"}`}
          onClick={() => setShowHistory(h => !h)}
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          🗓 {showHistory ? "Hide History (Last 30 Days)" : "Show 30-Day History"}
        </button>
        {showHistory && (
          <span style={{ marginLeft: 12, fontSize: ".85rem", color: "var(--gray-500)" }}>
            Showing bookings from {thirtyDaysAgo.toLocaleDateString("en-IN", { dateStyle: "medium" })} onwards
          </span>
        )}
      </div>

      {/* ── All Bookings Table ────────────────────────────────── */}
      <div className="container" style={{ marginBottom: 40 }}>
        <div className="dash-card">
          <div className="dash-card__head">
            <h3 className="dash-card__title">
              📋 {showHistory ? "Last 30 Days — All Bookings" : "All Bookings"}
            </h3>
            <input
              className="form-control"
              style={{ maxWidth: 240 }}
              placeholder="Search by name or phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Tabs — active tab uses purple from App.css .tab.active */}
          <div className="tabs">
            {[["all", "All"], ["pending", "Pending"], ["confirmed", "Confirmed"], ["completed", "Completed"], ["cancelled", "Cancelled"]].map(([v, l]) => (
              <button key={v} className={`tab${activeTab === v ? " active" : ""}`} onClick={() => setActiveTab(v)}>
                {l}
                {/* Purple count badge on Pending tab when future bookings exist */}
                {v === "pending" && futurePending.length > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: "#9b59b6",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "1px 7px",
                    fontSize: ".72rem",
                    fontWeight: 700,
                    verticalAlign: "middle",
                  }}>
                    {futurePending.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="no-data" style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
              <p>Loading bookings from database…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-data">📋 No bookings found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th><th>Contact</th><th>Date & Time</th>
                    <th>Token</th><th>Type</th><th>Status</th>
                    <th>Notes</th><th>Change</th><th>Del</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr
                      key={b.id}
                      // Future pending rows get a soft purple highlight
                      style={
                        b.datetime?.slice(0, 10) > todayStr && b.status === "Pending"
                          ? { background: "#faf5ff", borderLeft: "3px solid #c084fc" }
                          : {}
                      }
                    >
                      <td>
                        <strong>{b.name}</strong>
                        <br /><small style={{ color: "var(--gray-400)" }}>Age: {b.age}</small>
                        {/* Future booking label in purple */}
                        {b.datetime?.slice(0, 10) > todayStr && b.status === "Pending" && (
                          <div style={{ fontSize: ".7rem", color: "#7e22ce", marginTop: 2, fontWeight: 600 }}>
                            📆 Future Booking
                          </div>
                        )}
                      </td>
                      <td>
                        <a href={`tel:${b.phone}`} style={{ color: "var(--teal-dark)" }}>{b.phone}</a>
                        <br /><small style={{ color: "var(--gray-400)" }}>{b.email || "—"}</small>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{fmtDate(b.datetime)}</td>
                      <td>{b.token ? <span className="token-badge">#{b.token}</span> : "—"}</td>
                      <td>
                        <span className={`visit-type-pill visit-type-pill--${(b.visitType || "online").toLowerCase()}`}>
                          {b.visitType}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-pill--${(b.status || "pending").toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: 160, fontSize: ".82rem" }}>{b.notes || "—"}</td>
                      <td>
                        <select
                          value={b.status}
                          onChange={e => changeStatus(b.id, e.target.value)}
                          className="form-control"
                          style={{ fontSize: ".8rem", padding: "4px 8px" }}
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn--danger btn--sm"
                          style={{ padding: "4px 10px" }}
                          onClick={() => deleteBooking(b.id)}
                        >✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop: 10, fontSize: ".8rem", color: "var(--gray-400)" }}>
                Showing {filtered.length} of {bookings.length} bookings
                {showHistory ? " · Last 30 days" : ""} · Auto-refreshes every 30 seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
