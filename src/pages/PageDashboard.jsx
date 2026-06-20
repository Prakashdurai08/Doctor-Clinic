// ─── Page: Dashboard ──────────────────────────────────────────
// CHANGED:
//   1. Single merged stat row — 6 cards only (removed duplicate white row)
//      Cards: Total Today, Waiting, Arrived, Completed, Pending Future, Avg Wait
//   2. Clinic Controls moved to TOP (first section after header)
//   3. WhatsApp SVG icon replacing text "💬 WA"
//   4. Full responsive design with mobile media queries

import { useState, useEffect, useRef } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider, ALLOWED_EMAILS } from "../utils/firebase";
import { LS, CLINIC, SHEET_URL, fmtDate } from "../utils/constants";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

// ── WhatsApp SVG Icon ─────────────────────────────────────────
// CHANGE: Proper WhatsApp logo icon component
const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      fill="#25D366"
    />
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.306A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.045-1.104l-.29-.173-2.956.775.787-2.878-.19-.295A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"
      fill="#25D366"
    />
  </svg>
);

// ── Print token slip ──────────────────────────────────────────
function printTokenSlip(b) {
  const win = window.open("", "_blank", "width=320,height=420");
  win.document.write(`
    <html><head><title>Token Slip — ${CLINIC.name}</title>
    <style>
      body{font-family:Arial,sans-serif;text-align:center;padding:28px;margin:0;}
      .clinic{font-size:17px;font-weight:bold;color:#1e1e2e;margin-bottom:2px;}
      .sub{font-size:11px;color:#888;margin-bottom:16px;}
      .label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;}
      .token-num{font-size:80px;font-weight:900;color:#7c3aed;margin:8px 0;line-height:1;}
      .name{font-size:18px;font-weight:700;color:#1e1e2e;margin:6px 0 2px;}
      .age{font-size:12px;color:#666;margin-bottom:12px;}
      .date{font-size:12px;color:#555;margin-top:10px;}
      hr{border:none;border-top:1px dashed #ddd;margin:14px 0;}
      .footer{font-size:10px;color:#bbb;margin-top:10px;}
    </style></head><body>
    <div class="clinic">${CLINIC.name}</div>
    <div class="sub">Token Slip</div>
    <hr/>
    <div class="label">Token Number</div>
    <div class="token-num">#${b.token}</div>
    <hr/>
    <div class="label">Patient</div>
    <div class="name">${b.name}</div>
    <div class="age">Age: ${b.age}</div>
    <div class="date">${new Date().toLocaleDateString("en-IN",{dateStyle:"full"})}</div>
    <hr/>
    <div class="footer">Please wait for your token to be called · ${CLINIC.name}</div>
    </body></html>
  `);
  win.document.close();
  win.print();
}

// ── Greeting helper ───────────────────────────────────────────
function getGreeting(name) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name || "Doctor"} 👋`;
}

// ── DashboardGate ─────────────────────────────────────────────
function DashboardGate({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setError(""); setSigningIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (!ALLOWED_EMAILS.includes(result.user.email)) {
        await signOut(auth);
        setError(`❌ Access denied for ${result.user.email}. Contact the clinic admin.`);
      }
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") setError("Sign-in failed. Please try again.");
    } finally { setSigningIn(false); }
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"80vh" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:12 }}>⏳</div>
        <p style={{ color:"var(--gray-600)" }}>Checking authentication…</p>
      </div>
    </div>
  );

  if (user && ALLOWED_EMAILS.includes(user.email)) return children;

  return (
    <div className="page-wrapper" style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"80vh", background:"linear-gradient(135deg, var(--teal-light), var(--blue-light))" }}>
      <div style={{ width:"100%", maxWidth:400, padding:"0 20px" }}>
        <div className="card" style={{ textAlign:"center", padding:"44px 36px" }}>
          <div style={{ width:64, height:64, borderRadius:16, margin:"0 auto 20px", background:"linear-gradient(135deg, var(--teal), var(--blue))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem" }}>🏥</div>
          <h2 style={{ marginBottom:6 }}>Staff Dashboard</h2>
          <p style={{ color:"var(--gray-600)", marginBottom:28, fontSize:".93rem" }}>Sign in with your authorized Google account to access the clinic dashboard.</p>
          <button onClick={handleSignIn} disabled={signingIn}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"13px 20px", borderRadius:10, border:"1.5px solid var(--gray-200)", background: signingIn ? "var(--gray-100)" : "#fff", fontFamily:"var(--font-body)", fontSize:"1rem", fontWeight:600, color:"var(--gray-800)", cursor: signingIn ? "not-allowed" : "pointer", boxShadow:"var(--shadow-sm)", transition:"var(--transition)" }}
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
            ) : <span style={{ fontSize:"1.1rem" }}>⏳</span>}
            {signingIn ? "Signing in…" : "Sign in with Google"}
          </button>
          {error && <div className="alert alert--danger" style={{ marginTop:20, textAlign:"left" }}>{error}</div>}
          <div className="privacy-strip" style={{ marginTop:24 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Only authorized clinic staff emails can access this dashboard. Secured by Google.
          </div>
          <p style={{ marginTop:16, fontSize:".78rem", color:"var(--gray-400)" }}>Forgot access? Contact: {CLINIC.email}</p>
        </div>
      </div>
    </div>
  );
}

// ── PageDashboard ─────────────────────────────────────────────
// ── DoctorView ────────────────────────────────────────────────
function DoctorView({ bookings, loading, available, toggleAvail, markCompleted, markArrived, todayStr, clock }) {

  const todaySchedule = bookings
    .filter(b => b.datetime?.slice(0,10) === todayStr && b.visitType !== "Walk-In")
    .sort((a,b) => (a.datetime||"").localeCompare(b.datetime||""));

  const todayArrivals  = bookings.filter(b => b.arrived && b.checkedInAt?.slice(0,10) === todayStr);
  const completedToday = bookings.filter(b => b.status === "Completed" && b.completedAt?.slice(0,10) === todayStr);
  const queue          = [...todayArrivals]
    .filter(b => b.status !== "Completed" && b.status !== "Cancelled")
    .sort((a,b) => (a.token||0) - (b.token||0));
  const nowSeeing      = queue[0] || null;
  const upNext         = queue.slice(1, 4);
  const totalToday     = todaySchedule.length;
  const seenCount      = completedToday.length;
  const remaining      = queue.length;

  const slotFmt = (dt) => dt
    ? new Date(dt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true })
    : "—";

  return (
    <div style={{ padding:"24px 0 48px" }}>
      <style>{`
        .dv-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
        @media(max-width:900px){ .dv-grid { grid-template-columns:1fr 1fr; } }
        @media(max-width:560px){ .dv-grid { grid-template-columns:1fr; } }
        .dv-now { background:linear-gradient(135deg,#7c3aed,#6366f1); border-radius:20px; padding:32px; color:#fff; }
        .dv-card { background:#fff; border-radius:16px; padding:24px; box-shadow:var(--shadow-sm); border:1px solid var(--gray-200); }
        .dv-stat { background:#fff; border-radius:14px; padding:20px; box-shadow:var(--shadow-sm); border:1px solid var(--gray-200); text-align:center; }
        .dv-next-item { display:flex; align-items:center; gap:14px; padding:12px 0; border-bottom:1px solid var(--gray-200); }
        .dv-next-item:last-child { border-bottom:none; }
        .dv-schedule-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f3f0ff; }
        .dv-schedule-row:last-child { border-bottom:none; }
        .dv-avail-toggle { display:flex; align-items:center; gap:14px; background:#fff; border-radius:14px; padding:18px 22px; box-shadow:var(--shadow-sm); border:1px solid var(--gray-200); }
      `}</style>

      <div className="container">

        {/* ── Row 1: Availability + Stats ──────────────────── */}
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:20, alignItems:"stretch" }}>

          {/* Availability control */}
          <div className="dv-avail-toggle" style={{ flex:"0 0 auto" }}>
            <label className="toggle-switch">
              <input type="checkbox" checked={available} onChange={toggleAvail}/>
              <div className="toggle-track"/>
            </label>
            <div>
              <div style={{ fontWeight:700, fontSize:"1rem", color: available ? "#16a34a" : "#dc2626" }}>
                {available ? "🟢 Clinic Open" : "🔴 Clinic Closed"}
              </div>
              <div style={{ fontSize:".78rem", color:"var(--gray-400)", marginTop:2 }}>
                Toggle to update patient booking availability
              </div>
            </div>
          </div>

          {/* Stat pills */}
          {[
            { label:"Total Booked", value: loading ? "—" : totalToday, bg:"#ede9fe", color:"#6d28d9", icon:"📋" },
            { label:"Seen Today",   value: loading ? "—" : seenCount,  bg:"#dcfce7", color:"#166534", icon:"✅" },
            { label:"In Queue",     value: loading ? "—" : remaining,  bg:"#fef3c7", color:"#92400e", icon:"⏳" },
          ].map(s => (
            <div key={s.label} className="dv-stat" style={{ background:s.bg, flex:"1 1 100px", minWidth:100 }}>
              <div style={{ fontSize:"1.5rem", marginBottom:2 }}>{s.icon}</div>
              <div style={{ fontSize:"2rem", fontWeight:800, color:s.color, lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:".72rem", color:s.color, fontWeight:600, marginTop:6 }}>{s.label}</div>
            </div>
          ))}

          {/* Live clock */}
          <div className="dv-stat" style={{ background:"linear-gradient(135deg,#1e1b4b,#4f46e5)", flex:"1 1 120px", minWidth:120 }}>
            <div style={{ fontSize:"1.6rem", fontWeight:800, color:"#fff", fontFamily:"monospace", letterSpacing:2 }}>
              {clock.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true})}
            </div>
            <div style={{ fontSize:".72rem", color:"rgba(255,255,255,.6)", marginTop:6, fontWeight:600 }}>
              {clock.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
            </div>
          </div>
        </div>

        <div className="dv-grid">

          {/* ── Now Seeing ─────────────────────────────────── */}
          <div className="dv-now" style={{ gridColumn:"span 2" }}>
            <div style={{ fontSize:".8rem", fontWeight:700, opacity:.7, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>
              🩺 Now Seeing
            </div>
            {loading ? (
              <div style={{ opacity:.6, fontSize:"1rem" }}>Loading…</div>
            ) : nowSeeing ? (
              <>
                <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
                  <div style={{ background:"rgba(255,255,255,.2)", borderRadius:16, width:70, height:70, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.2rem", flexShrink:0 }}>
                    👤
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"1.8rem", fontWeight:800, lineHeight:1.1 }}>{nowSeeing.name}</div>
                    <div style={{ opacity:.75, fontSize:".95rem", marginTop:4 }}>Age {nowSeeing.age} · {slotFmt(nowSeeing.datetime)}</div>
                    {nowSeeing.notes && (
                      <div style={{ marginTop:10, background:"rgba(255,255,255,.15)", borderRadius:10, padding:"10px 14px", fontSize:".9rem" }}>
                        📝 <strong>Reason:</strong> {nowSeeing.notes}
                      </div>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14 }}>
                      <span style={{ background:"rgba(255,255,255,.25)", borderRadius:20, padding:"4px 14px", fontWeight:700, fontSize:".85rem" }}>
                        Token #{nowSeeing.token}
                      </span>
                      <a href={`tel:${nowSeeing.phone}`} style={{ color:"rgba(255,255,255,.8)", fontSize:".85rem", textDecoration:"none" }}>
                        📞 {nowSeeing.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => markCompleted(nowSeeing.id)}
                  style={{ marginTop:22, width:"100%", padding:"14px", borderRadius:12, border:"2px solid rgba(255,255,255,.6)", background:"rgba(255,255,255,.15)", color:"#fff", fontFamily:"var(--font-body)", fontWeight:800, fontSize:"1rem", cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.28)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.15)"}
                >
                  ✅ Done — Call Next Patient
                </button>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"20px 0", opacity:.7 }}>
                <div style={{ fontSize:"2.5rem", marginBottom:10 }}>🎉</div>
                <div style={{ fontWeight:700, fontSize:"1.1rem" }}>Queue is clear</div>
                <div style={{ fontSize:".85rem", marginTop:4, opacity:.8 }}>No patients currently waiting</div>
              </div>
            )}
          </div>

          {/* ── Up Next ────────────────────────────────────── */}
          <div className="dv-card">
            <div style={{ fontWeight:700, fontSize:".85rem", color:"var(--gray-400)", letterSpacing:".08em", textTransform:"uppercase", marginBottom:14 }}>
              ⏭ Up Next
            </div>
            {loading ? (
              <div style={{ color:"var(--gray-400)", fontSize:".9rem" }}>Loading…</div>
            ) : upNext.length === 0 ? (
              <div style={{ color:"var(--gray-400)", fontSize:".88rem", textAlign:"center", padding:"20px 0" }}>
                No more patients in queue
              </div>
            ) : (
              upNext.map((b, i) => (
                <div key={b.id} className="dv-next-item">
                  <div style={{ background:"#ede9fe", color:"#7c3aed", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:".9rem", flexShrink:0 }}>
                    #{b.token}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, color:"var(--navy)", fontSize:".95rem" }}>{b.name}</div>
                    <div style={{ fontSize:".78rem", color:"var(--gray-400)", marginTop:2 }}>
                      Age {b.age} · {slotFmt(b.datetime)}
                    </div>
                    {b.notes && (
                      <div style={{ fontSize:".75rem", color:"var(--gray-600)", marginTop:3, fontStyle:"italic" }}>
                        {b.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Upcoming not-yet-arrived */}
            {!loading && (() => {
              const upcoming = todaySchedule.filter(b => !b.arrived && b.status !== "Cancelled" && b.status !== "Completed");
              if (!upcoming.length) return null;
              return (
                <div style={{ marginTop:16, paddingTop:14, borderTop:"1px dashed var(--gray-200)" }}>
                  <div style={{ fontSize:".72rem", color:"var(--gray-400)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                    📅 Not yet arrived ({upcoming.length})
                  </div>
                  {upcoming.slice(0,3).map(b => (
                    <div key={b.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", fontSize:".82rem", borderBottom:"1px solid #f3f0ff" }}>
                      <span style={{ color:"var(--navy)", fontWeight:600 }}>{b.name}</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ color:"var(--gray-400)" }}>{slotFmt(b.datetime)}</span>
                        <button
                          onClick={() => markArrived(b.id)}
                          style={{ padding:"3px 10px", borderRadius:6, border:"1px solid #8b5cf6", background:"#ede9fe", color:"#7c3aed", fontFamily:"var(--font-body)", fontSize:".72rem", fontWeight:700, cursor:"pointer" }}
                        >
                          ✓ In
                        </button>
                      </div>
                    </div>
                  ))}
                  {upcoming.length > 3 && <div style={{ fontSize:".75rem", color:"var(--gray-400)", marginTop:6 }}>+{upcoming.length-3} more scheduled</div>}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Full Day Schedule ─────────────────────────── */}
        <div className="dv-card" style={{ marginTop:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <div style={{ fontWeight:700, color:"var(--navy)", fontSize:"1rem" }}>
              📋 Full Day Schedule
              <span style={{ marginLeft:10, background:"#ede9fe", color:"#6d28d9", borderRadius:20, padding:"2px 10px", fontSize:".72rem", fontWeight:700 }}>
                {totalToday} patients
              </span>
            </div>
            <span style={{ fontSize:".75rem", color:"var(--gray-400)" }}>Sorted by slot · Online bookings only</span>
          </div>

          {loading ? (
            <div style={{ color:"var(--gray-400)", textAlign:"center", padding:"20px 0" }}>⏳ Loading…</div>
          ) : todaySchedule.length === 0 ? (
            <div style={{ color:"var(--gray-400)", textAlign:"center", padding:"28px 0", fontSize:".9rem" }}>
              📭 No appointments booked for today.
            </div>
          ) : (
            <div>
              {todaySchedule.map((b, i) => {
                const isPast = b.datetime && new Date(b.datetime) < new Date();
                const statusColor =
                  b.status === "Completed" ? "#16a34a" :
                  b.status === "Cancelled" ? "#dc2626" :
                  b.arrived ? "#7c3aed" : "#92400e";
                const rowBg =
                  b.status === "Completed" ? "#f0fdf4" :
                  b.status === "Cancelled" ? "#fff5f5" :
                  b.arrived ? "#faf5ff" :
                  isPast ? "#fff7ed" : "#fff";

                return (
                  <div key={b.id} className="dv-schedule-row" style={{ background:rowBg, borderRadius:8, padding:"10px 12px", marginBottom:4 }}>
                    {/* Time */}
                    <div style={{ minWidth:72, fontWeight:700, fontSize:".88rem", color: isPast && b.status==="Pending" ? "#c2410c" : "var(--navy)" }}>
                      {slotFmt(b.datetime)}
                    </div>
                    {/* Token */}
                    {b.token
                      ? <div style={{ background:"#ede9fe", color:"#7c3aed", borderRadius:8, padding:"3px 10px", fontWeight:800, fontSize:".78rem", minWidth:36, textAlign:"center" }}>#{b.token}</div>
                      : <div style={{ minWidth:36 }}/>
                    }
                    {/* Name + notes */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, color:"var(--navy)", fontSize:".92rem", opacity: b.status==="Completed" ? .5 : 1 }}>{b.name}</div>
                      {b.notes && <div style={{ fontSize:".75rem", color:"var(--gray-600)", marginTop:2, fontStyle:"italic" }}>📝 {b.notes}</div>}
                    </div>
                    {/* Age */}
                    <div style={{ fontSize:".78rem", color:"var(--gray-400)", minWidth:40, textAlign:"center" }}>Ag. {b.age}</div>
                    {/* Status */}
                    <span className={`status-pill status-pill--${(b.status||"pending").toLowerCase()}`} style={{ fontSize:".72rem" }}>
                      {b.status}
                    </span>
                    {/* Action */}
                    <div style={{ minWidth:70, textAlign:"right" }}>
                      {!b.arrived && b.status !== "Completed" && b.status !== "Cancelled" && (
                        <button onClick={() => markArrived(b.id)}
                          style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #8b5cf6", background:"#ede9fe", color:"#7c3aed", fontFamily:"var(--font-body)", fontSize:".75rem", fontWeight:700, cursor:"pointer" }}>
                          ✓ Arrived
                        </button>
                      )}
                      {b.arrived && b.status !== "Completed" && b.status !== "Cancelled" && (
                        <button onClick={() => markCompleted(b.id)}
                          style={{ padding:"4px 10px", borderRadius:6, border:"1px solid #16a34a", background:"#dcfce7", color:"#166534", fontFamily:"var(--font-body)", fontSize:".75rem", fontWeight:700, cursor:"pointer" }}>
                          ✓ Done
                        </button>
                      )}
                      {b.status === "Completed" && <span style={{ fontSize:".78rem", color:"#16a34a", fontWeight:700 }}>✅ Seen</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

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
  const [clock, setClock]                   = useState(new Date());
  const [viewMode, setViewMode]             = useState("staff"); // "staff" | "doctor"
  const prevCountRef                        = useRef(null);
  // CHANGE: Ref for the All Bookings table — used to scroll precisely to it
  const bookingsTableRef                    = useRef(null);
  // CHANGE: Brief highlight flash when "View All" is clicked
  const [highlightTable, setHighlightTable] = useState(false);
  const currentUser                         = auth.currentUser;

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const playChime = () => {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  };

  const refresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
    const data = await LS.fetchBookings();
    if (silent && prevCountRef.current !== null && data.length > prevCountRef.current) playChime();
    prevCountRef.current = data.length;
    setBookings(data); setLoading(false); setRefreshing(false); setLastRefreshed(new Date());
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleAvail    = () => { const next = !available; LS.setAvailability(next); setAvailableState(next); };
  const changeStatus   = async (id, status) => { setBookings(prev => prev.map(b => b.id===id ? {...b,status} : b)); await LS.updateBooking(id, {status}); };
  const markCompleted  = async (id) => { const f={status:"Completed",completedAt:new Date().toISOString()}; setBookings(prev=>prev.map(b=>b.id===id?{...b,...f}:b)); await LS.updateBooking(id,f); };
  const deleteBooking  = async (id) => { if (!confirm("Delete this booking?")) return; setBookings(prev=>prev.filter(b=>b.id!==id)); await LS.deleteBooking(id); };
  const clearAll       = async () => { if (!confirm("Clear ALL bookings? This cannot be undone.")) return; setBookings([]); await LS.deleteAll(); };
  const handleSignOut  = async () => { if (!confirm("Sign out of the dashboard?")) return; await signOut(auth); };

  const markArrived = async (id) => {
    const ts=new Date().toISOString().slice(0,10);
    const todayArrivals=bookings.filter(b=>b.arrived&&b.checkedInAt?.slice(0,10)===ts);
    const fields={arrived:true,token:todayArrivals.length+1,checkedInAt:new Date().toISOString(),status:"Confirmed"};
    setBookings(prev=>prev.map(b=>b.id===id?{...b,...fields}:b));
    await LS.updateBooking(id,fields);
  };

  const addWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInForm.name||!walkInForm.age||!walkInForm.phone) { alert("Please fill in name, age, and phone."); return; }
    const ts=new Date().toISOString().slice(0,10);
    const todayArrivals=bookings.filter(b=>b.arrived&&b.checkedInAt?.slice(0,10)===ts);
    const newBooking={
      id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),
      ...walkInForm,email:"",datetime:new Date().toISOString(),status:"Confirmed",
      createdAt:new Date().toISOString(),arrived:true,token:todayArrivals.length+1,
      visitType:"Walk-In",checkedInAt:new Date().toISOString(),completedAt:null,action:"add",
    };
    setBookings(prev=>[...prev,newBooking]);
    setWalkInForm({name:"",age:"",phone:"",notes:""});
    setShowWalkInForm(false);
    await fetch(SHEET_URL,{method:"POST",body:JSON.stringify(newBooking)});
  };

  const callNextPatient = () => {
    const ts=new Date().toISOString().slice(0,10);
    const queue=bookings.filter(b=>b.arrived&&b.checkedInAt?.slice(0,10)===ts&&b.status==="Confirmed").sort((a,b)=>(a.token||0)-(b.token||0));
    if (!queue.length) { alert("No patients in queue."); return; }
    alert(`🔔 Calling: ${queue[0].name} (Token #${queue[0].token})`);
  };

  const exportExcel = () => {
    if (!bookings.length) return alert("No bookings to export.");
    const monthName=new Date().toLocaleString("en-IN",{month:"long",year:"numeric"});
    const fileName=`${CLINIC.name.replace(/\s+/g,"_")}_${monthName.replace(" ","_")}.xlsx`;
    const ts=new Date().toISOString().slice(0,10);
    const rows=bookings.map((b,i)=>({
      "S.No":i+1,"Patient Name":b.name,"Age":b.age,"Phone":b.phone,"Email":b.email||"—",
      "Appointment":b.datetime?fmtDate(b.datetime):"—","Visit Type":b.visitType||"Online",
      "Token No":b.token||"—","Status":b.status,
      "Arrived At":b.checkedInAt?fmtDate(b.checkedInAt):"—",
      "Completed At":b.completedAt?fmtDate(b.completedAt):"—",
      "Notes":b.notes||"—","Booked On":b.createdAt?fmtDate(b.createdAt):"—",
    }));
    const summary=[
      {"Metric":"Total Bookings Today","Count":bookings.filter(b=>b.datetime?.slice(0,10)===ts).length},
      {"Metric":"Patients Arrived","Count":bookings.filter(b=>b.arrived&&b.checkedInAt?.slice(0,10)===ts).length},
      {"Metric":"Completed Today","Count":bookings.filter(b=>b.status==="Completed"&&b.completedAt?.slice(0,10)===ts).length},
      {"Metric":"Pending","Count":bookings.filter(b=>b.status==="Pending").length},
      {"Metric":"Walk-In Patients","Count":bookings.filter(b=>b.visitType==="Walk-In"&&b.checkedInAt?.slice(0,10)===ts).length},
    ];
    const wb=XLSX.utils.book_new();
    const ws1=XLSX.utils.json_to_sheet(rows);
    const ws2=XLSX.utils.json_to_sheet(summary);
    ws1["!cols"]=[{wch:6},{wch:20},{wch:6},{wch:14},{wch:24},{wch:20},{wch:12},{wch:10},{wch:12},{wch:20},{wch:20},{wch:28},{wch:20}];
    ws2["!cols"]=[{wch:28},{wch:10}];
    XLSX.utils.book_append_sheet(wb,ws1,"Patient Register");
    XLSX.utils.book_append_sheet(wb,ws2,"Today Summary");
    XLSX.writeFile(wb,fileName);
  };

  // ── Derived data ─────────────────────────────────────────────
  const todayStr      = new Date().toISOString().slice(0,10);
  const tomorrowStr   = (() => { const d=new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10); })();
  const futurePending = bookings.filter(b=>b.datetime?.slice(0,10)>todayStr&&b.status==="Pending");
  const tomorrowAll   = bookings.filter(b=>b.datetime?.slice(0,10)===tomorrowStr);
  const todayArrivals = bookings.filter(b=>b.arrived&&b.checkedInAt?.slice(0,10)===todayStr);
  const todayQueue    = [...todayArrivals].sort((a,b)=>(a.token||0)-(b.token||0));
  const waitingOnline = bookings.filter(b=>!b.arrived&&b.visitType==="Online"&&b.datetime?.slice(0,10)===todayStr);
  const completedToday= bookings.filter(b=>b.status==="Completed"&&b.completedAt?.slice(0,10)===todayStr);
  const todayAll      = bookings.filter(b=>(b.createdAt||"").slice(0,10)===todayStr);
  const waitingCount  = todayAll.filter(b=>b.status==="Pending"||b.status==="Confirmed").length;

  // Today's Schedule — all online bookings for today sorted by appointment time
  const todaySchedule = bookings
    .filter(b => b.datetime?.slice(0,10) === todayStr && b.visitType !== "Walk-In")
    .sort((a,b) => (a.datetime||"").localeCompare(b.datetime||""));

  // CHANGE: Avg wait time
  const avgWait = (() => {
    const done=completedToday.filter(b=>b.checkedInAt&&b.completedAt);
    if (!done.length) return null;
    return Math.round(done.reduce((s,b)=>s+(new Date(b.completedAt)-new Date(b.checkedInAt)),0)/done.length/60000);
  })();

  const baseFiltered = bookings.filter(b => {
    const q=search.toLowerCase();
    return (!q||b.name?.toLowerCase().includes(q)||b.phone?.toLowerCase().includes(q)) &&
           (activeTab==="all"||b.status?.toLowerCase()===activeTab);
  }).sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
  const filtered = showHistory ? baseFiltered.filter(b=>new Date(b.createdAt)>=thirtyDaysAgo) : baseFiltered;

  const last7Days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const key=d.toISOString().slice(0,10);
    return { label:d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric"}), count:bookings.filter(b=>b.createdAt?.slice(0,10)===key).length, isToday:key===todayStr };
  });

  const donutData = [
    {name:"Waiting",  value:waitingOnline.length, fill:"#f59e0b"},
    {name:"Arrived",  value:todayArrivals.length, fill:"#8b5cf6"},
    {name:"Completed",value:completedToday.length,fill:"#10b981"},
  ].filter(d=>d.value>0);

  const doctorName = currentUser?.displayName?.split(" ")[0] || "Doctor";

  // CHANGE: Single merged stat row — 6 cards only
  const glanceCards = [
    { label:"Total Today",     value:todayAll.length,        color:"#0f6e56", bg:"#e1f5ee", accent:"#1D9E75", icon:"📋" },
    { label:"Waiting",         value:waitingCount,           color:"#185fa5", bg:"#e6f1fb", accent:"#378ADD", icon:"⏳" },
    { label:"Arrived",         value:todayArrivals.length,   color:"#6d28d9", bg:"#f3e8ff", accent:"#9b59b6", icon:"🚶" },
    { label:"Completed",       value:completedToday.length,  color:"#166534", bg:"#dcfce7", accent:"#16a34a", icon:"✅" },
    { label:"Pending Future",  value:futurePending.length,   color:"#92400e", bg:"#faeeda", accent:"#ba7517", icon:"📆" },
    { label:"Avg Wait",        value:avgWait!==null?`${avgWait}m`:"—", color:"#7e1d1d", bg:"#fee2e2", accent:"#dc2626", icon:"⏱️" },
  ];

  return (
    <div className="page-wrapper">

      {/* ── Responsive styles ─────────────────────────────────── */}
      <style>{`
        .dash-header__inner { display:grid; grid-template-columns:1fr auto 1fr; gap:16px; align-items:start; }
        @media(max-width:768px){
          .dash-header__inner { grid-template-columns:1fr; text-align:center; }
          .dash-header__inner > div:last-child { align-items:center !important; }
        }
        .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:640px){ .charts-grid { grid-template-columns:1fr; } }
        .glance-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
        @media(max-width:900px){ .glance-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:480px){ .glance-grid { grid-template-columns:repeat(2,1fr); } }
        .controls-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
        @media(max-width:640px){ .controls-row { flex-direction:column; align-items:stretch; } }
        .ctrl-btns { display:flex; gap:8px; flex-wrap:wrap; margin-left:auto; }
        @media(max-width:640px){ .ctrl-btns { margin-left:0; } }
        .walkin-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        @media(max-width:480px){ .walkin-grid { grid-template-columns:1fr; } }
        .table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
      `}</style>

      {/* ── Purple Header ─────────────────────────────────────── */}
      <div className="dash-header" style={{
        background: viewMode === "doctor"
          ? "linear-gradient(135deg, #0f766e, #0369a1)"
          : "linear-gradient(135deg, #7c3aed, #4f46e5)",
      }}>
        <div className="container">
          <div className="dash-header__inner">

            {/* Left — sign out + user */}
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button className="btn btn--outline btn--sm"
                style={{ background:"rgba(255,255,255,.15)", color:"#fff", border:"1px solid rgba(255,255,255,.4)", alignSelf:"flex-start" }}
                onClick={handleSignOut}>🔒 Sign Out</button>
              {currentUser && (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {currentUser.photoURL && <img src={currentUser.photoURL} alt="avatar" style={{ width:28, height:28, borderRadius:"50%", border:"2px solid rgba(255,255,255,.5)" }}/>}
                  <span style={{ fontSize:".78rem", color:"rgba(255,255,255,.8)" }}>{currentUser.email}</span>
                </div>
              )}
            </div>

            {/* Centre */}
            <div style={{ textAlign:"center" }}>
              <p style={{ color:"rgba(255,255,255,.75)", fontSize:".9rem", marginBottom:4 }}>{getGreeting(doctorName)}</p>
              <span className="pill" style={{ background:"rgba(255,255,255,.2)", color:"#fff" }}>Staff Dashboard</span>
              <h1 style={{ color:"#fff", marginTop:10 }}>Queue Management System</h1>
              <p style={{ opacity:.85 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
              {lastRefreshed && <p style={{ opacity:.6, fontSize:".8rem", marginTop:4 }}>Last synced: {lastRefreshed.toLocaleTimeString("en-IN",{timeStyle:"short"})}</p>}

              {/* ── View Mode Toggle ── */}
              <div style={{ display:"inline-flex", marginTop:16, background:"rgba(0,0,0,.18)", borderRadius:14, padding:5, gap:4 }}>
                <button
                  onClick={() => setViewMode("staff")}
                  style={{
                    padding:"9px 22px", borderRadius:10, border:"none", cursor:"pointer",
                    fontFamily:"var(--font-body)", fontWeight:700, fontSize:".85rem",
                    background: viewMode==="staff" ? "#fff" : "transparent",
                    color: viewMode==="staff" ? "#7c3aed" : "rgba(255,255,255,.6)",
                    boxShadow: viewMode==="staff" ? "0 2px 8px rgba(0,0,0,.18)" : "none",
                    transform: viewMode==="staff" ? "translateY(-1px)" : "none",
                    transition:"all .22s cubic-bezier(.4,0,.2,1)",
                  }}>
                  🖥 Staff View
                </button>
                <button
                  onClick={() => setViewMode("doctor")}
                  style={{
                    padding:"9px 22px", borderRadius:10, border:"none", cursor:"pointer",
                    fontFamily:"var(--font-body)", fontWeight:700, fontSize:".85rem",
                    background: viewMode==="doctor" ? "#fff" : "transparent",
                    color: viewMode==="doctor" ? "#0f766e" : "rgba(255,255,255,.6)",
                    boxShadow: viewMode==="doctor" ? "0 2px 8px rgba(0,0,0,.18)" : "none",
                    transform: viewMode==="doctor" ? "translateY(-1px)" : "none",
                    transition:"all .22s cubic-bezier(.4,0,.2,1)",
                  }}>
                  🩺 Doctor View
                </button>
              </div>
              <div style={{ marginTop:9, fontSize:".72rem", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", opacity:.65, color:"#fff" }}>
                {viewMode === "staff" ? "📋 Managing queue & bookings" : "🩺 Doctor patient view"}
              </div>
            </div>

            {/* Right — clock + availability */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12 }}>
              <div style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", borderRadius:12, padding:"10px 18px", textAlign:"center" }}>
                <div style={{ fontSize:"1.6rem", fontWeight:700, color:"#fff", letterSpacing:2, fontFamily:"monospace" }}>
                  {clock.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})}
                </div>
                <div style={{ fontSize:".7rem", color:"rgba(255,255,255,.6)", marginTop:2 }}>
                  {clock.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
                </div>
              </div>
              <div className="avail-badge">
                <span className={`avail-dot${available?" avail-dot--open":" avail-dot--closed"}`}/>
                <span>{available?"🟢 Clinic Open":"🔴 Clinic Closed"}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Doctor View ───────────────────────────────────────── */}
      {viewMode === "doctor" && (
        <DoctorView
          bookings={bookings}
          loading={loading}
          available={available}
          toggleAvail={toggleAvail}
          markCompleted={markCompleted}
          markArrived={markArrived}
          todayStr={new Date().toISOString().slice(0,10)}
          clock={clock}
        />
      )}

      {/* ── CHANGE 2: Clinic Controls at TOP ─────────────────── */}
      {viewMode === "staff" && (
      <>
      <div className="container" style={{ paddingTop:20, paddingBottom:4 }}>
        <div className="dash-card" style={{ borderLeft:"4px solid var(--teal)" }}>
          <div className="controls-row">
            {/* Availability toggle */}
            <label className="toggle-switch">
              <input type="checkbox" checked={available} onChange={toggleAvail}/>
              <div className="toggle-track"/>
              <span className="toggle-label" style={{ fontWeight:600 }}>
                {available ? "🟢 Open Today" : "🔴 Closed Today"}
              </span>
            </label>
            {/* Action buttons */}
            <div className="ctrl-btns">
              <button className="btn btn--primary btn--sm" onClick={callNextPatient}>📢 Call Next</button>
              <button className="btn btn--outline btn--sm" onClick={()=>refresh(false)} disabled={refreshing}>
                {refreshing?"⏳ Syncing…":"🔄 Refresh"}
              </button>
              <button className="btn btn--outline btn--sm" onClick={exportExcel}>📥 Export Excel</button>
              {/* CHANGE: Clear All separated with divider */}
              <div style={{ width:"1px", background:"var(--gray-200)", alignSelf:"stretch" }}/>
              <button className="btn btn--danger btn--sm" onClick={clearAll}>🗑 Clear All</button>
            </div>
          </div>
          <div className={`alert ${available?"alert--success":"alert--danger"}`} style={{ marginTop:12, marginBottom:0 }}>
            {available ? "✅ Bookings are open. Patients can book appointments." : "🚫 Bookings are disabled. Patients cannot book."}
          </div>
        </div>
      </div>

      {/* ── CHANGE 1: Single merged glance row — 6 cards only ── */}
      <div className="container" style={{ paddingTop:16, paddingBottom:4 }}>
        <p style={{ fontSize:".75rem", fontWeight:600, color:"var(--gray-500)", textTransform:"uppercase", letterSpacing:".07em", marginBottom:12 }}>
          Today at a glance
        </p>
        <div className="glance-grid">
          {glanceCards.map(s => (
            <div key={s.label} style={{
              background:s.bg,
              borderLeft:`4px solid ${s.accent}`,
              borderRadius:12,
              padding:"14px 12px",
              textAlign:"center",
            }}>
              <div style={{ fontSize:"1.1rem", marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:"1.8rem", fontWeight:800, color:s.color, lineHeight:1 }}>
                {loading ? "—" : s.value}
              </div>
              <div style={{ fontSize:".72rem", color:s.color, marginTop:6, fontWeight:600, lineHeight:1.3 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Future pending alert */}
        {futurePending.length > 0 && (
          <div style={{ background:"#f3e8ff", border:"1px solid #c084fc", borderLeft:"4px solid #9b59b6", borderRadius:10, padding:"12px 18px", marginTop:12, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:"1.2rem" }}>⏳</span>
            <div style={{ flex:1 }}>
              <strong style={{ color:"#7e22ce" }}>{futurePending.length} future appointment{futurePending.length>1?"s":""} waiting</strong>
              <div style={{ fontSize:".82rem", color:"#6b21a8", marginTop:3 }}>
                {futurePending.slice(0,3).map(b=><span key={b.id} style={{ marginRight:12 }}>👤 {b.name} — {fmtDate(b.datetime)}</span>)}
                {futurePending.length>3 && <span>+{futurePending.length-3} more</span>}
              </div>
            </div>
            <button className="btn btn--sm" style={{ background:"#7e22ce",color:"#fff",border:"none" }}
              onClick={()=>{
                // CHANGE: Switch to Pending tab, clear filters, then scroll
                // directly to the All Bookings table (not page bottom) and
                // briefly highlight it so the doctor's eye is drawn to the
                // individual future-pending rows.
                setActiveTab("pending");
                setSearch("");
                setShowHistory(false);
                setHighlightTable(true);
                setTimeout(() => {
                  bookingsTableRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
                }, 50);
                setTimeout(() => setHighlightTable(false), 1800);
              }}>
              View All →
            </button>
          </div>
        )}
      </div>

      {/* ── Charts ───────────────────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <div className="charts-grid">
          <div className="dash-card" style={{ minWidth:0 }}>
            <h3 className="dash-card__title" style={{ marginBottom:16 }}>📊 Patients — Last 7 Days</h3>
            {bookings.length===0 ? <div style={{ color:"var(--gray-400)",textAlign:"center",padding:"24px 0",fontSize:".9rem" }}>No data yet</div> : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={last7Days} barCategoryGap="30%" margin={{top:4,right:4,left:-16,bottom:0}}>
                  <XAxis dataKey="label" tick={{fontSize:11,fill:"var(--gray-500)"}} axisLine={false} tickLine={false}/>
                  <YAxis allowDecimals={false} tick={{fontSize:11,fill:"var(--gray-500)"}} axisLine={false} tickLine={false} width={28}/>
                  <Tooltip formatter={(v)=>[`${v} patients`,"Count"]} contentStyle={{borderRadius:8,fontSize:".82rem",border:"1px solid var(--gray-200)"}}/>
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {last7Days.map((e,i)=><Cell key={i} fill={e.isToday?"#8b5cf6":"#ddd6fe"}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <p style={{ fontSize:".73rem",color:"var(--gray-400)",marginTop:6,textAlign:"right" }}>🟣 Dark = today · Light = past</p>
          </div>
          <div className="dash-card" style={{ minWidth:0 }}>
            <h3 className="dash-card__title" style={{ marginBottom:16 }}>🍩 Today's Patient Status</h3>
            {donutData.length===0 ? <div style={{ color:"var(--gray-400)",textAlign:"center",padding:"24px 0",fontSize:".9rem" }}>No patients today yet</div> : (
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {donutData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[`${v} patients`,n]} contentStyle={{borderRadius:8,fontSize:".82rem",border:"1px solid var(--gray-200)"}}/>
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize:".82rem",paddingTop:4}}/>
                </PieChart>
              </ResponsiveContainer>
            )}
            <p style={{ fontSize:".73rem",color:"var(--gray-400)",marginTop:4,textAlign:"center" }}>
              Total today: {waitingOnline.length+todayArrivals.length+completedToday.length} patients
            </p>
          </div>
        </div>
      </div>


      {/* ── Today's Schedule ─────────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <div className="dash-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:16 }}>
            <h3 className="dash-card__title" style={{ marginBottom:0 }}>
              🗓 Today's Schedule
              <span style={{ marginLeft:10, background:"#ede9fe", color:"#6d28d9", borderRadius:20, padding:"2px 10px", fontSize:".75rem", fontWeight:700, verticalAlign:"middle" }}>
                {todaySchedule.length} booked
              </span>
            </h3>
            <span style={{ fontSize:".78rem", color:"var(--gray-400)" }}>Sorted by appointment time · Auto-refreshes</span>
          </div>

          {loading ? (
            <div style={{ color:"var(--gray-400)", textAlign:"center", padding:"24px 0" }}>⏳ Loading…</div>
          ) : todaySchedule.length === 0 ? (
            <div style={{ color:"var(--gray-400)", textAlign:"center", padding:"32px 0", fontSize:".9rem" }}>
              📭 No online appointments booked for today yet.
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr style={{ background:"#f3e8ff" }}>
                    {["Time","Patient","Age","Phone","Status","Token","Action"].map(h=>(
                      <th key={h} style={{ color:"#5b21b6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((b, i) => {
                    const slotTime = b.datetime ? new Date(b.datetime).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
                    const isPast   = b.datetime && new Date(b.datetime) < new Date();
                    const rowStyle = b.status==="Completed"
                      ? { opacity:.55, background:"#f0fdf4" }
                      : isPast && b.status==="Pending"
                        ? { background:"#fff7ed", borderLeft:"3px solid #fb923c" }
                        : i % 2 === 0 ? {} : { background:"#fafafa" };
                    return (
                      <tr key={b.id} style={rowStyle}>
                        <td style={{ whiteSpace:"nowrap", fontWeight:700, color: isPast && b.status==="Pending" ? "#c2410c" : "var(--navy)", minWidth:80 }}>
                          {slotTime}
                          {isPast && b.status==="Pending" && (
                            <div style={{ fontSize:".68rem", color:"#ef4444", fontWeight:600, marginTop:2 }}>⚠ Overdue</div>
                          )}
                        </td>
                        <td><strong>{b.name}</strong></td>
                        <td style={{ color:"var(--gray-500)" }}>{b.age}</td>
                        <td>
                          <a href={`tel:${b.phone}`} style={{ color:"var(--teal-dark)", fontSize:".85rem" }}>{b.phone}</a>
                        </td>
                        <td>
                          <span className={`status-pill status-pill--${(b.status||"pending").toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.token ? <span className="token-badge">#{b.token}</span> : <span style={{ color:"var(--gray-300)" }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                            {!b.arrived && b.status !== "Completed" && b.status !== "Cancelled" && (
                              <button className="btn btn--primary btn--sm" style={{ padding:"4px 10px", whiteSpace:"nowrap" }}
                                onClick={() => markArrived(b.id)}>✓ Arrived</button>
                            )}
                            {b.arrived && b.status !== "Completed" && (
                              <button className="btn btn--success btn--sm" style={{ padding:"4px 10px" }}
                                onClick={() => markCompleted(b.id)}>✓ Done</button>
                            )}
                            {b.status === "Completed" && (
                              <span style={{ fontSize:".8rem", color:"#16a34a", fontWeight:600 }}>✅ Seen</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Tomorrow's bookings ───────────────────────────────── */}
      {tomorrowAll.length > 0 && (
        <div className="container" style={{ marginBottom:8 }}>
          <div className="dash-card" style={{ borderLeft:"4px solid #85b7eb", background:"#f0f7ff" }}>
            <h3 className="dash-card__title" style={{ color:"#185fa5" }}>📅 Tomorrow's Bookings ({tomorrowAll.length})</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:10 }}>
              {tomorrowAll.slice(0,5).map(b=>(
                <div key={b.id} style={{ background:"#fff",border:"1px solid #bfdbfe",borderRadius:8,padding:"8px 14px",fontSize:".85rem" }}>
                  <strong style={{ color:"#1e3a5f" }}>{b.name}</strong>
                  <span style={{ color:"#64748b",marginLeft:8 }}>{b.datetime?new Date(b.datetime).toLocaleTimeString("en-IN",{timeStyle:"short"}):""}</span>
                </div>
              ))}
              {tomorrowAll.length>5 && <div style={{ padding:"8px 14px",fontSize:".85rem",color:"#64748b" }}>+{tomorrowAll.length-5} more</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── Today's Queue ─────────────────────────────────────── */}
      {todayQueue.length > 0 && (
        <div className="container" style={{ marginBottom:8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">📋 Today's Queue ({todayQueue.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr style={{ background:"#ede9fe" }}>
                    {["Token","Name","Type","Arrival","Status","Actions"].map(h=><th key={h} style={{ color:"#5b21b6" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {todayQueue.map(b=>(
                    <tr key={b.id}>
                      <td><span className="token-badge">#{b.token}</span></td>
                      <td><strong>{b.name}</strong><br/><small style={{ color:"var(--gray-400)" }}>Age: {b.age}</small></td>
                      <td><span className={`visit-type-pill visit-type-pill--${(b.visitType||"online").toLowerCase()}`}>{b.visitType}</span></td>
                      <td style={{ whiteSpace:"nowrap" }}>{b.checkedInAt?fmtDate(b.checkedInAt):"—"}</td>
                      <td><span className={`status-pill status-pill--${b.status.toLowerCase()}`}>{b.status}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <button className="btn btn--success btn--sm" style={{ padding:"4px 10px" }} onClick={()=>markCompleted(b.id)}>✓ Done</button>
                          {/* CHANGE: Print token slip */}
                          <button className="btn btn--outline btn--sm" style={{ padding:"4px 10px", display:"flex", alignItems:"center", gap:4 }} onClick={()=>printTokenSlip(b)}>
                            🖨 Slip
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Waiting Online — CHANGE 3: WhatsApp SVG icon ─────── */}
      {waitingOnline.length > 0 && (
        <div className="container" style={{ marginBottom:8 }}>
          <div className="dash-card">
            <h3 className="dash-card__title">⏳ Waiting Online Bookings ({waitingOnline.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr style={{ background:"#fef3c7" }}>
                    {["Name","Contact","Booked Time","Notes","Actions"].map(h=><th key={h} style={{ color:"#92400e" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {waitingOnline.map(b=>(
                    <tr key={b.id}>
                      <td><strong>{b.name}</strong><br/><small style={{ color:"var(--gray-400)" }}>Age: {b.age}</small></td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <a href={`tel:${b.phone}`} style={{ color:"var(--teal-dark)" }}>{b.phone}</a>
                          {/* CHANGE: WhatsApp SVG icon button */}
                          <a
                            href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(`Hello ${b.name}, your appointment at ${CLINIC.name} is confirmed for ${b.datetime?new Date(b.datetime).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}):"the scheduled time"}. Please arrive 5 minutes early. Thank you!`)}`}
                            target="_blank" rel="noreferrer"
                            title="Send WhatsApp confirmation"
                            style={{
                              display:"inline-flex", alignItems:"center", justifyContent:"center",
                              width:28, height:28, borderRadius:6,
                              background:"#dcfce7", border:"1px solid #86efac",
                              textDecoration:"none", flexShrink:0,
                            }}
                          >
                            <WhatsAppIcon size={16}/>
                          </a>
                        </div>
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>{fmtDate(b.datetime)}</td>
                      <td style={{ fontSize:".82rem" }}>{b.notes||"—"}</td>
                      <td><button className="btn btn--primary btn--sm" style={{ padding:"4px 10px", whiteSpace:"nowrap" }} onClick={()=>markArrived(b.id)}>✓ Mark Arrived</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Walk-In ───────────────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <div className="dash-card">
          <h3 className="dash-card__title">➕ Add Walk-In Patient</h3>
          {!showWalkInForm ? (
            <button className="btn btn--primary" onClick={()=>setShowWalkInForm(true)}>+ Add Walk-In</button>
          ) : (
            <form onSubmit={addWalkIn}>
              <div className="walkin-grid">
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
              </div>
              <div style={{ display:"flex", gap:12, marginTop:4 }}>
                <button type="submit" className="btn btn--success">✓ Add Walk-In</button>
                <button type="button" className="btn btn--outline" onClick={()=>setShowWalkInForm(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── 30-Day History Toggle ─────────────────────────────── */}
      <div className="container" style={{ marginBottom:8 }}>
        <button className={`btn ${showHistory?"btn--primary":"btn--outline"}`}
          onClick={()=>setShowHistory(h=>!h)} style={{ display:"inline-flex",alignItems:"center",gap:8 }}>
          🗓 {showHistory?"Hide History (Last 30 Days)":"Show 30-Day History"}
        </button>
        {showHistory && <span style={{ marginLeft:12,fontSize:".85rem",color:"var(--gray-500)" }}>Showing from {thirtyDaysAgo.toLocaleDateString("en-IN",{dateStyle:"medium"})} onwards</span>}
      </div>

      {/* ── All Bookings Table ────────────────────────────────── */}
      {/* CHANGE: ref attached here so "View All" scrolls precisely to
          this section, and highlightTable adds a brief glow effect */}
      <div className="container" style={{ marginBottom:40 }}>
        <div
          ref={bookingsTableRef}
          className="dash-card"
          style={{
            transition: "box-shadow .3s ease, border-color .3s ease",
            boxShadow: highlightTable ? "0 0 0 3px var(--teal-light), var(--shadow-lg)" : undefined,
            borderColor: highlightTable ? "var(--teal)" : undefined,
          }}
        >
          <div className="dash-card__head">
            <h3 className="dash-card__title">📋 {showHistory?"Last 30 Days — All Bookings":"All Bookings"}</h3>
            <input className="form-control" style={{ maxWidth:240 }} placeholder="Search by name or phone…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="tabs">
            {[["all","All"],["pending","Pending"],["confirmed","Confirmed"],["completed","Completed"],["cancelled","Cancelled"]].map(([v,l])=>(
              <button key={v} className={`tab${activeTab===v?" active":""}`} onClick={()=>setActiveTab(v)}>
                {l}
                {v==="pending"&&futurePending.length>0&&(
                  <span style={{ marginLeft:6,background:"#9b59b6",color:"#fff",borderRadius:10,padding:"1px 7px",fontSize:".72rem",fontWeight:700,verticalAlign:"middle" }}>{futurePending.length}</span>
                )}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="no-data" style={{ padding:"40px 20px" }}><div style={{ fontSize:"2rem",marginBottom:12 }}>⏳</div><p>Loading bookings from database…</p></div>
          ) : filtered.length===0 ? (
            <div className="no-data">📋 No bookings found.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr style={{ background:"#ede9fe" }}>
                    {["Patient","Contact","Date & Time","Token","Type","Status","Notes","Change","Del"].map(h=><th key={h} style={{ color:"#5b21b6" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b=>(
                    <tr key={b.id} style={b.datetime?.slice(0,10)>todayStr&&b.status==="Pending"?{background:"#faf5ff",borderLeft:"3px solid #c084fc"}:{}}>
                      <td>
                        <strong>{b.name}</strong><br/>
                        <small style={{ color:"var(--gray-400)" }}>Age: {b.age}</small>
                        {b.datetime?.slice(0,10)>todayStr&&b.status==="Pending"&&<div style={{ fontSize:".7rem",color:"#7e22ce",marginTop:2,fontWeight:600 }}>📆 Future</div>}
                      </td>
                      <td>
                        <a href={`tel:${b.phone}`} style={{ color:"var(--teal-dark)" }}>{b.phone}</a><br/>
                        <small style={{ color:"var(--gray-400)" }}>{b.email||"—"}</small>
                      </td>
                      <td style={{ whiteSpace:"nowrap" }}>{fmtDate(b.datetime)}</td>
                      <td>{b.token?<span className="token-badge">#{b.token}</span>:"—"}</td>
                      <td><span className={`visit-type-pill visit-type-pill--${(b.visitType||"online").toLowerCase()}`}>{b.visitType}</span></td>
                      <td><span className={`status-pill status-pill--${(b.status||"pending").toLowerCase()}`}>{b.status}</span></td>
                      <td style={{ maxWidth:160,fontSize:".82rem" }}>{b.notes||"—"}</td>
                      <td>
                        <select value={b.status} onChange={e=>changeStatus(b.id,e.target.value)} className="form-control" style={{ fontSize:".8rem",padding:"4px 8px" }}>
                          <option>Pending</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
                        </select>
                      </td>
                      <td><button className="btn btn--danger btn--sm" style={{ padding:"4px 10px" }} onClick={()=>deleteBooking(b.id)}>✕</button></td>
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
      </>
      )} {/* end staff view */}

    </div>
  );
}
