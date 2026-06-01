// ─── Toast Notification System ────────────────────────────────
// Replaces all browser alert() popups with smooth slide-in toasts.
// Usage: import { toast } from "./Toast"
//        toast.success("Saved!") / toast.error("Failed") / toast.info("...")
// ToastContainer must be rendered once in App.jsx.

import { useState, useEffect } from "react";

let _emit = null;
export function _setEmitter(fn) { _emit = fn; }

export function toast(type, message, duration = 3500) {
  if (_emit) _emit({ id: Date.now() + Math.random(), type, message, duration });
}
toast.success = (msg, dur) => toast("success", msg, dur);
toast.error   = (msg, dur) => toast("error",   msg, dur);
toast.info    = (msg, dur) => toast("info",    msg, dur);
toast.warn    = (msg, dur) => toast("warn",    msg, dur);

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _setEmitter((t) => {
      setToasts(prev => [...prev, { ...t, visible: true }]);
      setTimeout(() => {
        setToasts(prev => prev.map(p => p.id === t.id ? { ...p, visible: false } : p));
        setTimeout(() => setToasts(prev => prev.filter(p => p.id !== t.id)), 400);
      }, t.duration);
    });
    return () => _setEmitter(null);
  }, []);

  const icons  = { success:"✅", error:"❌", info:"ℹ️", warn:"⚠️" };
  const colors = {
    success: { bg:"#e6f4ea", border:"#b7dfbf", color:"#2f855a" },
    error:   { bg:"#fce8e8", border:"#f5c6c6", color:"#c53030" },
    info:    { bg:"#ede9fe", border:"#c4b5fd", color:"#7c3aed" },
    warn:    { bg:"#fff3cd", border:"#ffe088", color:"#856404" },
  };

  return (
    <div style={{
      position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
      zIndex:9999, display:"flex", flexDirection:"column", gap:10,
      alignItems:"center", pointerEvents:"none", width:"100%", maxWidth:420, padding:"0 16px",
    }}>
      {toasts.map(t => {
        const c = colors[t.type] || colors.info;
        return (
          <div key={t.id} style={{
            background:c.bg, border:`1px solid ${c.border}`, color:c.color,
            borderRadius:12, padding:"12px 20px",
            display:"flex", alignItems:"center", gap:10,
            boxShadow:"0 4px 20px rgba(0,0,0,.12)",
            width:"100%", pointerEvents:"auto",
            opacity: t.visible ? 1 : 0,
            transform: t.visible ? "translateY(0) scale(1)" : "translateY(20px) scale(.95)",
            transition:"opacity .35s ease, transform .35s ease",
            fontWeight:600, fontSize:".9rem",
          }}>
            <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{icons[t.type]}</span>
            <span style={{ flex:1 }}>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}