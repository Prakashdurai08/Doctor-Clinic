// ─── Skeleton Loading Screens ──────────────────────────────────
// Purple-tinted shimmer placeholders shown while data loads.

const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .skeleton-box {
    background: linear-gradient(90deg, #f0eaf8 25%, #e4d9f5 50%, #f0eaf8 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 8px;
  }
`;

function Bone({ w="100%", h=16, mb=10, radius=8 }) {
  return <div className="skeleton-box" style={{ width:w, height:h, marginBottom:mb, borderRadius:radius }}/>;
}

export function SkeletonCard() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid var(--gray-200)", boxShadow:"var(--shadow-sm)" }}>
        <Bone h={12} w="40%" mb={16}/>
        <Bone h={20} w="70%" mb={10}/>
        <Bone h={14} w="90%" mb={8}/>
        <Bone h={14} w="80%" mb={20}/>
        <Bone h={36} w="50%" radius={10}/>
      </div>
    </>
  );
}

export function SkeletonTable({ rows=5 }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid var(--gray-200)" }}>
        <div style={{ background:"linear-gradient(135deg, var(--teal), var(--blue))", padding:"12px 16px", display:"flex", gap:16 }}>
          {[120,100,100,80,80,80].map((w,i) => (
            <div key={i} style={{ width:w, height:12, background:"rgba(255,255,255,.3)", borderRadius:6 }}/>
          ))}
        </div>
        {Array.from({ length:rows }).map((_,i) => (
          <div key={i} style={{ padding:"14px 16px", borderBottom:"1px solid var(--gray-100)", display:"flex", gap:16, alignItems:"center" }}>
            {[120,100,100,80,80,80].map((w,j) => <Bone key={j} w={w} h={12} mb={0}/>)}
          </div>
        ))}
      </div>
    </>
  );
}

export function SkeletonGrid({ count=3 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:24 }}>
      {Array.from({ length:count }).map((_,i) => <SkeletonCard key={i}/>)}
    </div>
  );
}