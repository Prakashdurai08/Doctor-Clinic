// ─── Mobile Bottom Navigation ─────────────────────────────────
// Fixed bottom tab bar — only visible on mobile screens (<768px).

export default function MobileNav({ page, setPage }) {
  const go = (p) => { setPage(p); window.scrollTo({ top:0, behavior:"smooth" }); };

  const tabs = [
    { id:"home",    icon:"🏠", label:"Home"    },
    { id:"booking", icon:"📅", label:"Book"    },
    { id:"doctor",  icon:"🧑‍⚕️", label:"Doctor" },
    { id:"contact", icon:"📞", label:"Contact" },
    { id:"faq",     icon:"❓", label:"FAQ"     },
  ];

  return (
    <>
      <nav className="mobile-bottom-nav">
        {tabs.map(t => (
          <button key={t.id} onClick={() => go(t.id)} style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:3, padding:"8px 4px 10px",
            background:"none", border:"none", cursor:"pointer",
            color: page===t.id ? "var(--teal-dark)" : "var(--gray-400)",
            fontSize:".65rem", fontWeight: page===t.id ? 700 : 500,
            fontFamily:"var(--font-body)", transition:"var(--transition)",
            position:"relative",
          }}>
            {page===t.id && (
              <span style={{
                position:"absolute", top:6, left:"50%", transform:"translateX(-50%)",
                width:20, height:3, borderRadius:2,
                background:"linear-gradient(90deg, var(--teal), var(--blue))",
              }}/>
            )}
            <span style={{ fontSize:"1.3rem", lineHeight:1, marginTop:6 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
      <div className="mobile-bottom-nav-spacer"/>
      <style>{`
        .mobile-bottom-nav {
          display: none;
          position: fixed; bottom:0; left:0; right:0; z-index:250;
          background:#fff; border-top:1px solid var(--gray-200);
          align-items:stretch;
          box-shadow: 0 -4px 20px rgba(139,92,246,.10);
        }
        .mobile-bottom-nav-spacer { display:none; height:64px; }
        @media (max-width:768px) {
          .mobile-bottom-nav { display:flex !important; }
          .mobile-bottom-nav-spacer { display:block !important; }
        }
      `}</style>
    </>
  );
}