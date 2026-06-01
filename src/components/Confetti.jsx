// ─── Confetti Animation ────────────────────────────────────────
// 60 colored particles falling on booking success. No library needed.

import { useEffect, useRef } from "react";

const COLORS = [
  "#8b5cf6","#7c3aed","#6366f1","#a78bfa",
  "#c4b5fd","#fbbf24","#34d399","#f472b6","#60a5fa","#fb923c",
];

export default function Confetti() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const pieces = [];

    for (let i = 0; i < 60; i++) {
      const el    = document.createElement("div");
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size  = Math.random() * 8 + 6;
      const isCircle = Math.random() > 0.5;
      Object.assign(el.style, {
        position:"absolute", width:`${size}px`,
        height: isCircle ? `${size}px` : `${size*.4}px`,
        background:color, borderRadius: isCircle ? "50%" : "2px",
        left:`${Math.random()*100}%`, top:"-20px", opacity:"1",
        transform:`rotate(${Math.random()*360}deg)`,
        animation:`confettiFall ${Math.random()*1.5+2}s ease-in ${Math.random()*1.2}s forwards`,
      });
      container.appendChild(el);
      pieces.push(el);
    }

    const timer = setTimeout(() => pieces.forEach(p => p.remove()), 4000);
    return () => { clearTimeout(timer); pieces.forEach(p => p.remove()); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform:translateY(0) rotate(0deg);    opacity:1; }
          80%  { opacity:1; }
          100% { transform:translateY(80vh) rotate(720deg); opacity:0; }
        }
      `}</style>
      <div ref={ref} style={{
        position:"fixed", top:0, left:0, width:"100%", height:"100%",
        pointerEvents:"none", zIndex:9998, overflow:"hidden",
      }}/>
    </>
  );
}