// ─── Page: Token Display ───────────────────────────────────────
// Public live queue board. No login needed. Auto-refreshes every 20s.
// CHANGED (Item E): Added "TV Mode" — fullscreen "Now Serving" display
// for waiting-room TVs. Uses .tv-mode-overlay styles from App.css.

import { useState, useEffect, useRef } from "react";
import { LS } from "../utils/constants";

export default function PageToken() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [lastSync, setLastSync] = useState(null);
  // CHANGE: TV mode state
  const [tvMode, setTvMode]     = useState(false);
  const [clock, setClock]       = useState(new Date()); // BUG5 FIX: live clock

  const refresh = async () => {
    const data = await LS.fetchBookings();
    setBookings(data);
    setLoading(false);
    setLastSync(new Date());
  };

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20000);
    return () => clearInterval(id);
  }, []);

  // CHANGE: Exit TV mode on Escape key
  useEffect(() => {
    if (!tvMode) return;
    const onKey = (e) => { if (e.key === "Escape") setTvMode(false); };
    window.addEventListener("keydown", onKey);
    const tick = setInterval(() => setClock(new Date()), 1000);
    return () => { window.removeEventListener("keydown", onKey); clearInterval(tick); };
  }, [tvMode]);

  const todayStr   = new Date().toISOString().slice(0,10);
  const todayQueue = bookings
    .filter(b => b.arrived && b.checkedInAt?.slice(0,10)===todayStr)
    .sort((a,b) => (a.token||0)-(b.token||0));
  const completed  = todayQueue.filter(b => b.status==="Completed");
  const waiting    = todayQueue.filter(b => b.status!=="Completed" && b.status!=="Cancelled");
  const currentToken = waiting[0]?.token ?? null;
  const nextToken    = waiting[1]?.token ?? null;
  const currentName  = waiting[0]?.name ?? null;
  const getWait = (token) => {
    const pos = waiting.findIndex(b => b.token===token);
    return pos < 0 ? null : pos * 15;
  };

  // ── CHANGE: TV Mode fullscreen overlay ─────────────────────────
  // Track token changes for pop animation
  const prevTokenRef = useRef(currentToken);
  const [tokenKey, setTokenKey]   = useState(0);
  const [bellKey, setBellKey]     = useState(0);

  useEffect(() => {
    if (prevTokenRef.current !== currentToken && currentToken) {
      setTokenKey(k => k + 1);
      setBellKey(k => k + 1);
    }
    prevTokenRef.current = currentToken;
  }, [currentToken]);

  if (tvMode) {
    return (
      <div className="tv-mode-overlay" style={{ overflow:"hidden" }}>
        <button className="tv-mode-overlay__exit" onClick={() => setTvMode(false)}>
          ✕ Exit TV Mode (Esc)
        </button>

        {/* Label with bell */}
        <div className="tv-mode-overlay__label tv-label-breathe">
          <span key={bellKey} className={bellKey > 0 ? "tv-bell-ring" : ""}>🔔</span>
          {" "}NOW SERVING
        </div>

        {currentToken ? (
          <>
            {/* Pulse rings behind token */}
            <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div className="tv-pulse-ring" style={{ width:"clamp(180px,30vw,340px)", height:"clamp(180px,30vw,340px)", animationDelay:"0s" }}/>
              <div className="tv-pulse-ring" style={{ width:"clamp(180px,30vw,340px)", height:"clamp(180px,30vw,340px)", animationDelay:".5s" }}/>
              <div className="tv-pulse-ring" style={{ width:"clamp(180px,30vw,340px)", height:"clamp(180px,30vw,340px)", animationDelay:"1s" }}/>
              <div
                key={tokenKey}
                className={`tv-mode-overlay__token ${tokenKey > 0 ? "tv-token-pop" : ""}`}
                style={{ position:"relative", zIndex:1 }}
              >
                #{currentToken}
              </div>
            </div>

            {currentName && (
              <div className="tv-mode-overlay__name">
                {currentName.split(" ")[0]}
              </div>
            )}
            {nextToken && (
              <div className="tv-mode-overlay__sub">
                Next up: #{nextToken}
              </div>
            )}
          </>
        ) : (
          <div className="tv-mode-overlay__name" style={{ opacity:.6 }}>
            No patients in queue
          </div>
        )}

        <div className="tv-mode-overlay__sub" style={{ marginTop:32 }}>
          {clock.toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}
          {" · "}
          {clock.toLocaleTimeString("en-IN",{timeStyle:"short"})}
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ minHeight:"80vh" }}>
      <div className="dash-header" style={{ padding:"32px 0" }}>
        <div className="container" style={{ textAlign:"center" }}>
          <span className="pill" style={{ background:"rgba(255,255,255,.2)", color:"#fff" }}>Live Queue Board</span>
          <h1 style={{ color:"#fff", marginTop:10 }}>Today's Token Status</h1>
          <p style={{ opacity:.8 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}</p>
          {lastSync && <p style={{ opacity:.6, fontSize:".8rem", marginTop:4 }}>Auto-refreshes every 20s · Last: {lastSync.toLocaleTimeString("en-IN",{timeStyle:"short"})}</p>}

          {/* ── CHANGE: TV Mode button ───────────────────────── */}
          <div style={{ marginTop: 16 }}>
            <button className="tv-mode-btn" onClick={() => setTvMode(true)}>
              📺 TV Mode
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth:700, padding:"32px 20px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <div style={{ fontSize:"3rem", marginBottom:12 }}>⏳</div>
            <p style={{ color:"var(--gray-600)" }}>Loading queue…</p>
          </div>
        ) : (
          <>
            {/* Now Serving */}
            <div style={{
              background:"linear-gradient(135deg, var(--teal), var(--blue))",
              borderRadius:20, padding:"32px 24px", textAlign:"center",
              marginBottom:20, boxShadow:"var(--shadow-lg)", color:"#fff",
            }}>
              <div style={{ fontSize:".85rem", fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", opacity:.85, marginBottom:8 }}>🔔 Now Serving</div>
              {currentToken
                ? <div style={{ fontSize:"5rem", fontWeight:900, fontFamily:"var(--font-display)", lineHeight:1 }}>#{currentToken}</div>
                : <div style={{ fontSize:"1.4rem", opacity:.8, marginTop:8 }}>No patients in queue</div>}
              {nextToken && <div style={{ marginTop:12, opacity:.85, fontSize:".9rem" }}>Next up: <strong>#{nextToken}</strong></div>}
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
              {[{icon:"👥",num:waiting.length,label:"Waiting"},{icon:"✅",num:completed.length,label:"Completed"},{icon:"📋",num:todayQueue.length,label:"Total"}].map(s=>(
                <div key={s.label} className="card" style={{ textAlign:"center", padding:"16px 8px" }}>
                  <div style={{ fontSize:"1.5rem" }}>{s.icon}</div>
                  <div style={{ fontSize:"1.8rem", fontWeight:900, color:"var(--teal-dark)", fontFamily:"var(--font-display)" }}>{s.num}</div>
                  <div style={{ fontSize:".75rem", color:"var(--gray-600)" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Queue List */}
            {waiting.length > 0 ? (
              <div className="card" style={{ padding:0, overflow:"hidden" }}>
                <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--gray-200)" }}>
                  <h3 style={{ fontSize:"1rem", fontFamily:"var(--font-body)", fontWeight:700 }}>Waiting Queue ({waiting.length})</h3>
                </div>
                {waiting.map((b,i) => (
                  <div key={b.id} style={{
                    display:"flex", alignItems:"center", gap:16,
                    padding:"14px 20px", borderBottom:"1px solid var(--gray-100)",
                    background: i===0 ? "var(--teal-light)" : "#fff",
                  }}>
                    <span className="token-badge" style={{ fontSize:"1rem", minWidth:44, textAlign:"center" }}>#{b.token}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:"var(--navy)" }}>{b.name.split(" ")[0]}</div>
                      <div style={{ fontSize:".78rem", color:"var(--gray-600)" }}>Est. wait: ~{getWait(b.token)} min</div>
                    </div>
                    {i===0 && <span style={{ background:"var(--teal)", color:"#fff", borderRadius:99, padding:"3px 12px", fontSize:".72rem", fontWeight:700 }}>Current</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign:"center", padding:40 }}>
                <div style={{ fontSize:"3rem", marginBottom:12 }}>🎉</div>
                <h3>Queue is clear!</h3>
                <p style={{ color:"var(--gray-600)", marginTop:8 }}>No patients waiting right now.</p>
              </div>
            )}
            <p style={{ textAlign:"center", fontSize:".8rem", color:"var(--gray-400)", marginTop:20 }}>⏱ Estimated wait times are approximate (15 min per patient)</p>
          </>
        )}
      </div>
    </div>
  );
}
