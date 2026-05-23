// Shared design system — blob shapes, video tiles, common UI.
// Every styles object is namespaced to avoid global collisions.

// ── Organic blob shapes (decorative SVGs that match the reference image) ──
// Hand-drawn-feeling paths. Reused throughout to tie the visual system together.
const BlobPaths = {
  blob1: "M53,8 C72,8 92,18 96,42 C100,66 86,86 60,93 C34,100 12,86 8,62 C4,38 18,8 53,8 Z",
  blob2: "M40,6 C66,2 96,16 94,46 C92,76 70,98 42,94 C14,90 2,68 6,42 C10,16 14,10 40,6 Z",
  pebble: "M50,4 C76,4 96,24 96,52 C96,80 74,96 48,96 C22,96 4,76 4,50 C4,24 24,4 50,4 Z",
  star: "M50,4 L60,30 L88,30 L66,48 L74,76 L50,60 L26,76 L34,48 L12,30 L40,30 Z",
  heart: "M50,86 C20,66 6,46 6,30 C6,16 18,6 30,6 C40,6 46,12 50,22 C54,12 60,6 70,6 C82,6 94,16 94,30 C94,46 80,66 50,86 Z",
  moon: "M50,6 C26,6 8,26 8,50 C8,74 26,94 50,94 C36,94 26,74 26,50 C26,26 36,6 50,6 Z",
  drop: "M50,4 C70,30 90,52 90,68 C90,84 72,96 50,96 C28,96 10,84 10,68 C10,52 30,30 50,4 Z",
  cloud: "M28,52 C16,52 8,44 8,34 C8,24 18,18 28,20 C30,10 42,4 54,8 C64,12 70,22 70,30 C82,30 92,38 92,50 C92,62 82,68 70,68 L28,68 C18,68 12,62 12,56 Z",
};

function Blob({ shape = "blob1", color = "var(--buttercream)", size = 160, rotate = 0, style = {} }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}
         style={{ transform: `rotate(${rotate}deg)`, ...style }}
         aria-hidden="true">
      <path d={BlobPaths[shape]} fill={color} />
    </svg>
  );
}

// Blob with text inside — exact motif from the reference image.
function BlobLabel({ shape = "blob1", color = "var(--buttercream)", size = 220, rotate = 0,
                    eyebrow, title, style = {} }) {
  return (
    <div style={{ position:'relative', width:size, height:size, display:'inline-block', ...style }}>
      <svg viewBox="0 0 100 100" width={size} height={size}
           style={{ position:'absolute', inset:0, transform:`rotate(${rotate}deg)` }}>
        <path d={BlobPaths[shape]} fill={color} />
      </svg>
      <div style={{ position:'absolute', inset:'18%', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center', textAlign:'center', color:'var(--ink)' }}>
        {eyebrow && <div className="h-mono-sm" style={{ marginBottom:6, color:'rgba(42,33,28,.55)' }}>{eyebrow}</div>}
        <div className="h-display" style={{ fontSize:size*0.11, lineHeight:1.1 }}>{title}</div>
      </div>
    </div>
  );
}

// Layered cluster of organic shapes — backdrop ornamentation.
function BlobScatter({ items = [] }) {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {items.map((it, i) => (
        <Blob key={i} shape={it.shape} color={it.color} size={it.size} rotate={it.rotate}
              style={{ position:'absolute', top:it.top, left:it.left, right:it.right, bottom:it.bottom, opacity:it.opacity ?? 1 }} />
      ))}
    </div>
  );
}

// ── Video tile — placeholder showing a "common room" feed ──
// Uses a soft warm gradient + an SVG silhouette suggestion. NEVER pretends to
// be a real photo of people; the placeholder reads as "video feed".
function VideoTile({ home, location, residents = 0, color = "var(--peach)",
                    accent = "var(--blush)", muted = false, speaking = false,
                    style = {}, large = false }) {
  return (
    <div style={{
      position:'relative', borderRadius:'var(--r-lg)', overflow:'hidden',
      background:`linear-gradient(160deg, ${color} 0%, ${accent} 100%)`,
      aspectRatio:'16/10', boxShadow: speaking ? '0 0 0 4px var(--terracotta), var(--shadow-lg)' : 'var(--shadow-md)',
      transition:'box-shadow .2s ease',
      ...style,
    }}>
      {/* Silhouettes suggesting a common-room scene */}
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice"
           style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.55 }}>
        <ellipse cx="80" cy="180" rx="42" ry="60" fill="rgba(42,33,28,.18)" />
        <circle cx="80" cy="125" r="22" fill="rgba(42,33,28,.18)" />
        <ellipse cx="170" cy="180" rx="40" ry="55" fill="rgba(42,33,28,.22)" />
        <circle cx="170" cy="132" r="20" fill="rgba(42,33,28,.22)" />
        <ellipse cx="248" cy="180" rx="44" ry="62" fill="rgba(42,33,28,.16)" />
        <circle cx="248" cy="122" r="22" fill="rgba(42,33,28,.16)" />
      </svg>
      {/* Soft sun glow upper-right */}
      <div style={{ position:'absolute', top:'-30%', right:'-15%', width:'60%', height:'80%',
                    background:'radial-gradient(circle, rgba(255,250,235,.5), transparent 60%)' }} />

      {/* Top-left meta */}
      <div style={{ position:'absolute', top:large?20:14, left:large?22:16, display:'flex', gap:8, alignItems:'center' }}>
        {speaking && <span className="pill" style={{ background:'rgba(255,255,255,.85)', color:'var(--ink)', fontWeight:600 }}>
          <span className="live-dot" />speaking
        </span>}
      </div>

      {/* Bottom-left name */}
      <div style={{ position:'absolute', bottom:large?22:14, left:large?22:16, right:large?22:16,
                    display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:12 }}>
        <div>
          <div className="h-display" style={{ fontSize: large?40:22, color:'var(--ink)', lineHeight:1.05 }}>
            {home}
          </div>
          <div style={{ fontSize: large?16:12, color:'rgba(42,33,28,.65)', marginTop:2 }}>
            {location} · {residents} resident{residents===1?'':'s'}
          </div>
        </div>
        {muted && (
          <div style={{ width:large?44:32, height:large?44:32, borderRadius:'50%',
                        background:'rgba(42,33,28,.85)', color:'#fff',
                        display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width={large?20:14} height={large?20:14} viewBox="0 0 24 24" fill="none">
              <path d="M3 3l18 18M9 9v3a3 3 0 005 2.24M15 9.34V5a3 3 0 00-5.94-.6M5 10v2a7 7 0 0011.91 4.95M19 10v2a6.97 6.97 0 01-.34 2.15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Resident avatar (placeholder portrait, big circular) ──
function ResidentAvatar({ name = "", color = "var(--buttercream)", size = 56 }) {
  const initials = name.split(' ').slice(0,2).map(p => p[0]?.toUpperCase() || '').join('');
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:color,
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--serif)', fontSize:size*0.42, color:'var(--ink)',
      boxShadow:'0 0 0 2px var(--paper), 0 2px 6px rgba(42,33,28,.08)',
    }}>{initials}</div>
  );
}

// ── Section header ──
function SectionHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:18, gap:20 }}>
      <div>
        {eyebrow && <div className="h-mono" style={{ marginBottom:6 }}>{eyebrow}</div>}
        <div className="h-display" style={{ fontSize:32 }}>{title}</div>
      </div>
      {action}
    </div>
  );
}

// ── Icon set (simple line) ──
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.6" strokeLinecap="round" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
    calendar: <g stroke={color} strokeWidth="1.6" fill="none"><rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/></g>,
    users: <g stroke={color} strokeWidth="1.6" fill="none"><circle cx="9" cy="9" r="3.5"/><path d="M2.5 19c.6-3.4 3.4-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><circle cx="17" cy="8" r="2.5"/><path d="M17 13.5c2.4 0 4.1 1.4 4.5 3.5"/></g>,
    mic: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></g>,
    video: <g stroke={color} strokeWidth="1.6" fill="none"><rect x="3" y="6.5" width="13" height="11" rx="2"/><path d="M16 10l5-2.5v9L16 14z" strokeLinejoin="round"/></g>,
    bingo: <g stroke={color} strokeWidth="1.6" fill="none"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/></g>,
    music: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><path d="M9 17V5l11-2v12"/><circle cx="7" cy="17" r="2"/><circle cx="18" cy="15" r="2"/></g>,
    trivia: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><path d="M12 19v.01M9 9a3 3 0 116 0c0 2-3 2-3 5"/><circle cx="12" cy="12" r="9.5"/></g>,
    settings: <g stroke={color} strokeWidth="1.6" fill="none"><circle cx="12" cy="12" r="3"/><path d="M19.4 12.7a8 8 0 000-1.4l1.7-1.4-2-3.4-2 .7a8 8 0 00-1.2-.7l-.4-2.1h-3.9l-.4 2.1a8 8 0 00-1.2.7l-2-.7-2 3.4 1.7 1.4a8 8 0 000 1.4l-1.7 1.4 2 3.4 2-.7a8 8 0 001.2.7l.4 2.1h3.9l.4-2.1a8 8 0 001.2-.7l2 .7 2-3.4z"/></g>,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    x: <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />,
    chev: <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
    heart: <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round"/>,
    waving: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><path d="M7 12V6a2 2 0 014 0v6m0-3V5a2 2 0 014 0v8m0-3V7a2 2 0 014 0v8a7 7 0 01-7 7c-4 0-6-3-7-5l-2-4a2 2 0 013-2"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
  );
};

// Map a card-home color string to a softer accent for video gradient
const HomeColors = {
  sunrise: { color: 'var(--peach)',    accent: 'var(--blush)' },
  maplewood:{ color: 'var(--sage)',     accent: 'var(--sky)' },
  willow:  { color: 'var(--lavender)', accent: 'var(--blush)' },
  oakhaven:{ color: 'var(--buttercream)',accent:'var(--peach)' },
  bayview: { color: 'var(--sky)',      accent: 'var(--sage)' },
  meadow:  { color: 'var(--blush)',    accent: 'var(--lavender)' },
};

Object.assign(window, {
  BlobPaths, Blob, BlobLabel, BlobScatter,
  VideoTile, ResidentAvatar, SectionHeader, Icon, HomeColors,
});
