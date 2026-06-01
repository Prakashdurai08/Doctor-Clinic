// ─── Page: Dashboard ──────────────────────────────────────────
// Google Sign-In protected staff dashboard.
// Added: Excel export (2 sheets), 7-day bar chart, today's donut chart.

import { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider, ALLOWED_EMAILS } from "../utils/firebase";
import { LS, CLINIC, SHEET_URL, fmtDate } from "../utils/constants";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// ── DashboardGate ─────────────────────────────────────────────
function DashboardGate({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setError("");
    setSigningIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        await signOut(auth);
        setError(`❌ Access denied for ${result.user.email}. Contact the clinic admin.`);
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"80vh" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:12 }}>⏳</div>
          <p style={{ color:"var(--gray-600)" }}>Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (user && ALLOWED_EMAILS.includes(user.email)) return children;

  return (
    <div className="page-wrapper" style={{
      display:"flex", alignItems:"center", justifyContent:"center", minHeight:"80vh",
      background:"linear-gradient(135deg, var(--teal-light), var(--blue-light))",
    }}>
      <div style={{ width:"100%", maxWidth:400, padding:"0 20px" }}>
        <div className="card" style={{ textAlign:"center", padding:"44px 36px" }}>
          <div style={{
            width:64, height:64, borderRadius:16, margin:"0 auto 20px",
            background:"linear-gradient(135deg, var(--teal), var(--blue))",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem",
          }}>🏥</div>
          <h2 style={{ marginBottom:6 }}>Staff Dashboard</h2>
          <p style={{ color:"var(--gray-600)", marginBottom:28, fontSize:".93rem" }}>
            Sign in with your authorized Google account to access the clinic dashboard.
          </p>
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
              gap:12, padding:"13px 20px", borderRadius:10,
              border:"1.5px solid var(--gray-200)",
              background: signingIn ? "var(--gray-100)" : "#fff",
              fontFamily:"var(--font-body)", fontSize:"1rem", fontWeight:600,
              color:"var(--gray-800)", cursor: signingIn ? "not-allowed" : "pointer",
              boxShadow:"var(--shadow-sm)", transition:"var(--transition)",
            }}
            onMouseEnter={e => { if (!signingIn) e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
          >
            {!signingIn ? (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            ) : (
              <span style={{ fontSize:"1.1rem" }}>⏳</span>
            )}
            {signingIn ? "Signing in…" : "Sign in with Google"}
          </button>
          {error && (
            <div className="alert alert--danger" style={{ marginTop:20, textAlign:"left" }}>{error}</div>
          )}
          <div className="privacy-strip" style={{ marginTop:24 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Only authorized clinic staff emails can access this dashboard. Secured by Google.
          </div>
          <p style={{ marginTop:16, fontSize:".78rem", color:"var(--gray-400)" }}>
            Forgot access? Contact: {CLINIC.email}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── PageDashboard ─────────────────────────────────────────────
export default function PageDashboard() {
  return <DashboardGate><PageDashboardContent /></DashboardGate>;
}

// ── PageDashboardContent ──────────────────────────────────────
function PageDashboardContent() {
  const [bookings, setBookings]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [available, setAvailableState]      = useState(LS.isAvailable());
  const [search, setSearch]                 = useState("");
  const [activeTab, setActiveTab]           = useState("all");
  const [walkInForm, setWalkInForm]         = useState({ name:"", age:"", phone:"", notes:"" });
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [lastRefreshed, setLastRefreshed]   = useState(null);
  const [showHistory, setShowHistory]       = useState(false);

  const currentUser = auth.currentUser;

  const refresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
    const data = await LS.fetchBookings();
    setBookings(data);
    setLoading(false);
    setRefreshing(false);
    setLastRefreshed(new Date());
  };

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

  const markArrived = async (id) => {
    const ts            = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0,10) === ts);
    const nextToken     = todayArrivals.length + 1;
    const fields        = { arrived:true, token:nextToken, checkedInAt:new Date().toISOString(), status:"Confirmed" };
    setBookings(prev => prev.map(b => b.id === id ? { ...b, ...fields } : b));
    await LS.updateBooking(id, fields);
  };

  const addWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInForm.name || !walkInForm.age || !walkInForm.phone) {
      alert("Please fill in name, age, and phone."); return;
    }
    const ts            = new Date().toISOString().slice(0, 10);
    const todayArrivals = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0,10) === ts);
    const nextToken     = todayArrivals.length + 1;
    const newBooking    = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2,5),
      ...walkInForm, email:"", datetime:new Date().toISOString(),
      status:"Confirmed", createdAt:new Date().toISOString(),
      arrived:true, token:nextToken, visitType:"Walk-In",
      checkedInAt:new Date().toISOString(), completedAt:null, action:"add",
    };
    setBookings(prev => [...prev, newBooking]);
    setWalkInForm({ name:"", age:"", phone:"", notes:"" });
    setShowWalkInForm(false);
    await fetch(SHEET_URL, { method:"POST", body:JSON.stringify(newBooking) });
  };

  const markCompleted = async (id) => {
    const fields = { status:"Completed", completedAt:new Date().toISOString() };
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

  const callNextPatient = () => {
    const ts       = new Date().toISOString().slice(0, 10);
    const queue    = bookings
      .filter(b => b.arrived && b.checkedInAt?.slice(0,10) === ts && b.status === "Confirmed")
      .sort((a,b) => (a.token||0)-(b.token||0));
    if (!queue.length) { alert("No patients in queue."); return; }
    alert(`🔔 Calling: ${queue[0].name} (Token #${queue[0].token})`);
  };

  // ── Excel Export ────────────────────────────────────────────
  const exportExcel = () => {
    if (!bookings.length) return alert("No bookings to export.");
    const monthName = new Date().toLocaleString("en-IN", { month:"long", year:"numeric" });
    const fileName  = `${CLINIC.name.replace(/\s+/g,"_")}_${monthName.replace(" ","_")}.xlsx`;
    const ts        = new Date().toISOString().slice(0, 10);

    const rows = bookings.map((b, i) => ({
      "S.No":         i + 1,
      "Patient Name": b.name,
      "Age":          b.age,
      "Phone":        b.phone,
      "Email":        b.email || "—",
      "Appointment":  b.datetime  ? fmtDate(b.datetime)  : "—",
      "Visit Type":   b.visitType || "Online",
      "Token No":     b.token     || "—",
      "Status":       b.status,
      "Arrived At":   b.checkedInAt ? fmtDate(b.checkedInAt) : "—",
      "Completed At": b.completedAt ? fmtDate(b.completedAt) : "—",
      "Notes":        b.notes || "—",
      "Booked On":    b.createdAt ? fmtDate(b.createdAt) : "—",
    }));

    const summary = [
      { "Metric": "Total Bookings Today",  "Count": bookings.filter(b => b.datetime?.slice(0,10) === ts).length },
      { "Metric": "Patients Arrived",      "Count": bookings.filter(b => b.arrived && b.checkedInAt?.slice(0,10) === ts).length },
      { "Metric": "Completed Today",       "Count": bookings.filter(b => b.status === "Completed" && b.completedAt?.slice(0,10) === ts).length },
      { "Metric": "Pending",               "Count": bookings.filter(b => b.status === "Pending").length },
      { "Metric": "Walk-In Patients",      "Count": bookings.filter(b => b.visitType === "Walk-In" && b.checkedInAt?.slice(0,10) === ts).length },
    ];

    const wb  = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(rows);
    const ws2 = XLSX.utils.json_to_sheet(summary);
    ws1["!cols"] = [{wch:6},{wch:20},{wch:6},{wch:14},{wch:24},{wch:20},{wch:12},{wch:10},{wch:12},{wch:20},{wch:20},{wch:28},{wch:20}];
    ws2["!cols"] = [{wch:28},{wch:10}];
    XLSX.utils.book_append_sheet(wb, ws1, "Patient Register");
    XLSX.utils.book_append_sheet(wb, ws2, "Today Summary");
    XLSX.writeFile(wb, fileName);
  };

  const handleSignOut = async () => {
    if (!confirm("Sign out of the dashboard?")) return;
    await signOut(auth);
  };

  // ── Derived data ────────────────────────────────────────────
  const todayStr       = new Date().toISOString().slice(0,10);
  const todayBookings  = bookings.filter(b => b.createdAt?.slice(0,10)===todayStr && b.datetime?.slice(0,10)===todayStr);
  const futurePending  = bookings.filter(b => b.datetime?.slice(0,10)>todayStr && b.status==="Pending");
  const todayArrivals  = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0,10)===todayStr);
  const todayQueue     = [...todayArrivals].sort((a,b)=>(a.token||0)-(b.token||0));
  const waitingOnline  = bookings.filter(b => !b.arrived && b.visitType==="Online" && b.datetime?.slice(0,10)===todayStr);
  const completedToday = bookings.filter(b => b.status==="Completed" && b.completedAt?.slice(0,10)===todayStr);

  const stats = [
    { num:todayBookings.length,  lbl:"Today's Bookings", color:"var(--teal)",    icon:"📅" },
    { num:futurePending.length,  lbl:"Pending (Future)", color:"#9b59b6",        icon:"⏳" },
    { num:todayArrivals.length,  lbl:"Arrived",          color:"var(--success)", icon:"✅" },
    { num:completedToday.length, lbl:"Completed",        color:"var(--blue)",    icon:"🏁" },
  ];

  const baseFiltered = bookings.filter(b => {
    const q           = search.toLowerCase();
    const matchSearch = !q || b.name?.toLowerCase().includes(q) || b.phone?.toLowerCase().includes(q);
    const matchTab    = activeTab==="all" || b.status?.toLowerCase()===activeTab;
    return matchSearch && matchTab;
  }).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
  const filtered = showHistory
    ? baseFiltered.filter(b=>new Date(b.createdAt)>=thirtyDaysAgo)
    : baseFiltered;

  // ── Chart data ──────────────────────────────────────────────
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key   = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday:"short", day:"numeric" });
    return { label, count: bookings.filter(b => b.createdAt?.slice(0,10) === key).length, isToday: key === todayStr };
  });

  const donutData = [
    { name:"Waiting",   value: waitingOnline.length,  fill:"#f59e0b" },
    { name:"Arrived",   value: todayArrivals.length,   fill:"#8b5cf6" },
    { name:"Completed", value: completedToday.length,  fill:"#10b981" },
  ].filter(d => d.value > 0);

  return (
    <div className="page-wrapper">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="dash-header">
        <div className="container">
          <div className="dash-header__inner">
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button
                className="btn btn--outline btn--sm"
                style={{ background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.4)" }}
                onClick={handleSignOut}
              >🔒 Sign Out</button>
              {currentUser && (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {currentUser.photoURL && (
                    <img src={currentUser.photoURL} alt="avatar"
                      style={{ width:28, height:28, borderRadius:"50%", border:"2px solid rgba(255,255,255,.5)" }}
                    />
                  )}
                  <span style={{ fontSize:".78rem", color:"rgba(255,255,255,.8)" }}>{currentUser.email}</span>
                </div>
              )}
            </div>
            <div>
              <span className="pill" style={{ background:"rgba(255,255,255,.2)", color:"#fff" }}>Staff Dashboard</span>
              <h1 style={{ color:"#fff", marginTop:10 }}>Queue Management System</h1>
              <p style={{ opacity:.85 }}>
                {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
              </p>
              {lastRefreshed && (
                <p style={{ opacity:.6, fontSize:".8rem", marginTop:4 }}>
                  Last synced: {lastRefreshed.toLocaleTimeString("en-IN",{timeStyle:"short"})}
                </p>
              )}
            </div>
            <div className="avail-badge">
              <span className={`avail-dot${available?" avail-dot--open":" avail-dot--closed"}`}/>
              <span>{available?"🟢 Clinic Open":"🔴 Clinic Closed"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="container" style={{ paddingTop:28, paddingBottom:8 }}>
        <div className="dash-stats">
          {stats.map(s => (
            <div key={s.lbl} className="dash-stat">
              <div style={{ fontSize:"1.4rem", marginBottom:4 }}>{s.icon}</div>
              <div className="dash-stat__num" style={{ color:s.color }}>{loading?"…":s.num}</div>
              <div className="dash-stat__lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
        {futurePending.length > 0 && (
          <div style={{ background:"#f3e8ff", border:"1px solid #c084fc", borderRadius:10, padding:"12px 18px", marginTop:12, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:"1.2rem" }}>⏳</span>
            <div style={{ flex:1 }}>
              <strong style={{ color:"#7e22ce" }}>
                {futurePending.length} future appointment{futurePending.length>1?"s":""} waiting for confirmation
              </strong>
              <div style={{ fontSize:".82rem", color:"#6b21a8", marginTop:3 }}>
                {futurePending.slice(0,3).map(b=>(
                  <span key={b.id} style={{ marginRight:12 }}>👤 {b.name} — {fmtDate(b.datetime)}</span>
                ))}
                {futurePending.length>3 && <span>+{futurePending.length-3} more</span>}
              </div>
            </div>
            <button className="btn btn--sm" style={{ background:"#7e22ce", color:"#fff", border:"none" }}
              onClick={()=>{ setActiveTab("pending"); setSearch(""); setShowHistory(false); window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"}); }}>
              View All →
            </button>
          </div>
        )}
      </div>

      {/* ── Charts ──────────────────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <style>{`
          .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
          @media(max-width:640px){ .charts-grid { grid-template-columns:1fr; } }
        `}</style>
        <div className="charts-grid">

          {/* 7-Day Bar Chart */}
          <div className="dash-card" style={{ minWidth:0 }}>
            <h3 className="dash-card__title" style={{ marginBottom:16 }}>📊 Patients — Last 7 Days</h3>
            {bookings.length === 0 ? (
              <div style={{ color:"var(--gray-400)", textAlign:"center", padding:"24px 0", fontSize:".9rem" }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={last7Days} barCategoryGap="30%" margin={{ top:4, right:4, left:-16, bottom:0 }}>
                  <XAxis dataKey="label" tick={{ fontSize:11, fill:"var(--gray-500)" }} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill:"var(--gray-500)" }} axisLine={false} tickLine={false} width={28}/>
                  <Tooltip
                    formatter={(v) => [`${v} patients`, "Count"]}
                    contentStyle={{ borderRadius:8, fontSize:".82rem", border:"1px solid var(--gray-200)", boxShadow:"0 2px 8px rgba(0,0,0,.08)" }}
                  />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {last7Days.map((entry, i) => (
                      <Cell key={i} fill={entry.isToday ? "#8b5cf6" : "#ddd6fe"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <p style={{ fontSize:".73rem", color:"var(--gray-400)", marginTop:6, textAlign:"right" }}>
              🟣 Dark = today &nbsp;·&nbsp; Light = past days
            </p>
          </div>

          {/* Today Donut */}
          <div className="dash-card" style={{ minWidth:0 }}>
            <h3 className="dash-card__title" style={{ marginBottom:16 }}>🍩 Today's Patient Status</h3>
            {donutData.length === 0 ? (
              <div style={{ color:"var(--gray-400)", textAlign:"center", padding:"24px 0", fontSize:".9rem" }}>No patients today yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${v} patients`, name]}
                    contentStyle={{ borderRadius:8, fontSize:".82rem", border:"1px solid var(--gray-200)", boxShadow:"0 2px 8px rgba(0,0,0,.08)" }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize:".82rem", paddingTop:4 }}/>
                </PieChart>
              </ResponsiveContainer>
            )}
            <p style={{ fontSize:".73rem", color:"var(--gray-400)", marginTop:4, textAlign:"center" }}>
              Total today: {waitingOnline.length + todayArrivals.length + completedToday.length} patients
            </p>
          </div>

        </div>
      </div>

      {/* ── Clinic Controls ─────────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">🔧 Clinic Controls</h3>
          <div className="dash-controls">
            <label className="toggle-switch">
              <input type="checkbox" checked={available} onChange={toggleAvail}/>
              <div className="toggle-track"/>
              <span className="toggle-label">{available?"Available Today":"Not Available Today"}</span>
            </label>
            <div style={{ flex:1 }}/>
            <button className="btn btn--primary btn--sm" onClick={callNextPatient}>📢 Call Next Patient</button>
            <button className="btn btn--outline btn--sm" onClick={()=>refresh(false)} disabled={refreshing}>
              {refreshing?"⏳ Syncing…":"🔄 Refresh"}
            </button>
            <button className="btn btn--outline btn--sm" onClick={exportExcel}>📥 Export Excel</button>
            <button className="btn btn--danger btn--sm" onClick={clearAll}>🗑 Clear All</button>
          </div>
          <div className={`alert ${available?"alert--success":"alert--danger"}`} style={{ marginTop:12 }}>
            {available
              ? "✅ Bookings are open. Patients can book appointments."
              : "🚫 Bookings are disabled. Booking page will show a \"Closed\" banner."}
          </div>
        </div>
      </div>

      {/* ── Today's Queue ────────────────────────────────────── */}
      {todayQueue.length > 0 && (
        <div className="container" style={{ marginBottom:8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">📋 Today's Queue ({todayQueue.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Token</th><th>Name</th><th>Type</th><th>Arrival Time</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {todayQueue.map(b => (
                    <tr key={b.id}>
                      <td><span className="token-badge">#{b.token}</span></td>
                      <td><strong>{b.name}</strong></td>
                      <td><span className={`visit-type-pill visit-type-pill--${(b.visitType||"online").toLowerCase()}`}>{b.visitType}</span></td>
                      <td>{b.checkedInAt ? fmtDate(b.checkedInAt) : "—"}</td>
                      <td><span className={`status-pill status-pill--${b.status.toLowerCase()}`}>{b.status}</span></td>
                      <td><button className="btn btn--success btn--sm" style={{ padding:"4px 10px" }} onClick={()=>markCompleted(b.id)}>✓ Done</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Waiting Online Bookings ──────────────────────────── */}
      {waitingOnline.length > 0 && (
        <div className="container" style={{ marginBottom:8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">⏳ Waiting Online Bookings ({waitingOnline.length})</h3>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Contact</th><th>Booked Time</th><th>Notes</th><th>Action</th></tr></thead>
                <tbody>
                  {waitingOnline.map(b => (
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong></td>
                      <td><a href={`tel:${b.phone}`} style={{ color:"var(--teal-dark)" }}>{b.phone}</a></td>
                      <td>{fmtDate(b.datetime)}</td>
                      <td style={{ fontSize:".82rem" }}>{b.notes||"—"}</td>
                      <td><button className="btn btn--primary btn--sm" style={{ padding:"4px 10px" }} onClick={()=>markArrived(b.id)}>✓ Mark Arrived</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Walk-In ──────────────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">➕ Add Walk-In Patient</h3>
          {!showWalkInForm ? (
            <button className="btn btn--primary" onClick={()=>setShowWalkInForm(true)}>+ Add Walk-In</button>
          ) : (
            <form onSubmit={addWalkIn} style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" placeholder="Patient name" value={walkInForm.name} onChange={e=>setWalkInForm({...walkInForm,name:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input type="number" className="form-control" placeholder="Age" value={walkInForm.age} onChange={e=>setWalkInForm({...walkInForm,age:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input type="tel" className="form-control" placeholder="Phone" value={walkInForm.phone} onChange={e=>setWalkInForm({...walkInForm,phone:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <input className="form-control" placeholder="Notes" value={walkInForm.notes} onChange={e=>setWalkInForm({...walkInForm,notes:e.target.value})}/>
              </div>
              <div style={{ gridColumn:"1 / -1", display:"flex", gap:12 }}>
                <button type="submit" className="btn btn--success">✓ Add Walk-In</button>
                <button type="button" className="btn btn--outline" onClick={()=>setShowWalkInForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── 30-Day History Toggle ────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <button className={`btn ${showHistory?"btn--primary":"btn--outline"}`}
          onClick={()=>setShowHistory(h=>!h)} style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
          🗓 {showHistory?"Hide History (Last 30 Days)":"Show 30-Day History"}
        </button>
        {showHistory && (
          <span style={{ marginLeft:12, fontSize:".85rem", color:"var(--gray-500)" }}>
            Showing from {thirtyDaysAgo.toLocaleDateString("en-IN",{dateStyle:"medium"})} onwards
          </span>
        )}
      </div>

      {/* ── All Bookings Table ───────────────────────────────── */}
      <div className="container" style={{ marginBottom:40 }}>
        <div className="dash-card">
          <div className="dash-card__head">
            <h3 className="dash-card__title">📋 {showHistory?"Last 30 Days — All Bookings":"All Bookings"}</h3>
            <input className="form-control" style={{ maxWidth:240 }} placeholder="Search by name or phone…"
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="tabs">
            {[["all","All"],["pending","Pending"],["confirmed","Confirmed"],["completed","Completed"],["cancelled","Cancelled"]].map(([v,l])=>(
              <button key={v} className={`tab${activeTab===v?" active":""}`} onClick={()=>setActiveTab(v)}>
                {l}
                {v==="pending" && futurePending.length>0 && (
                  <span style={{ marginLeft:6,background:"#9b59b6",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:".72rem",fontWeight:700,verticalAlign:"middle" }}>
                    {futurePending.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="no-data" style={{ padding:"40px 20px" }}>
              <div style={{ fontSize:"2rem", marginBottom:12 }}>⏳</div>
              <p>Loading bookings from database…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="no-data">📋 No bookings found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Patient</th><th>Contact</th><th>Date & Time</th><th>Token</th><th>Type</th><th>Status</th><th>Notes</th><th>Change</th><th>Del</th></tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}
                      style={b.datetime?.slice(0,10)>todayStr && b.status==="Pending"
                        ?{background:"#faf5ff",borderLeft:"3px solid #c084fc"}:{}}>
                      <td>
                        <strong>{b.name}</strong>
                        <br/><small style={{ color:"var(--gray-400)" }}>Age: {b.age}</small>
                        {b.datetime?.slice(0,10)>todayStr && b.status==="Pending" && (
                          <div style={{ fontSize:".7rem",color:"#7e22ce",marginTop:2,fontWeight:600 }}>📆 Future Booking</div>
                        )}
                      </td>
                      <td>
                        <a href={`tel:${b.phone}`} style={{ color:"var(--teal-dark)" }}>{b.phone}</a>
                        <br/><small style={{ color:"var(--gray-400)" }}>{b.email||"—"}</small>
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>{fmtDate(b.datetime)}</td>
                      <td>{b.token ? <span className="token-badge">#{b.token}</span> : "—"}</td>
                      <td><span className={`visit-type-pill visit-type-pill--${(b.visitType||"online").toLowerCase()}`}>{b.visitType}</span></td>
                      <td><span className={`status-pill status-pill--${(b.status||"pending").toLowerCase()}`}>{b.status}</span></td>
                      <td style={{ maxWidth:160,fontSize:".82rem" }}>{b.notes||"—"}</td>
                      <td>
                        <select value={b.status} onChange={e=>changeStatus(b.id,e.target.value)}
                          className="form-control" style={{ fontSize:".8rem",padding:"4px 8px" }}>
                          <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn--danger btn--sm" style={{ padding:"4px 10px" }} onClick={()=>deleteBooking(b.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ marginTop:10,fontSize:".8rem",color:"var(--gray-400)" }}>
                Showing {filtered.length} of {bookings.length} bookings{showHistory?" · Last 30 days":""} · Auto-refreshes every 30s
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
