// Availability — the director paints when the common room is free.
// Weekly grid: rows = days, cols = 30-min blocks from 8am to 8pm.
// Click and drag (or click individual cells) to toggle availability.
// Right rail shows matches: partner homes whose hours overlap.

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = []; // 8am → 8pm, 30-min slots
for (let h = 8; h <= 20; h++) {
  HOURS.push({ h, m:0 });
  if (h < 20) HOURS.push({ h, m:30 });
}

// Pre-seeded availability so the grid has texture on first render
const DEFAULT_AVAIL = (() => {
  const slots = new Set();
  // weekday mornings 10-noon + afternoons 2-4
  for (let d = 0; d < 5; d++) {
    for (let h = 10; h < 12; h++) { slots.add(`${d}-${h}-0`); slots.add(`${d}-${h}-30`); }
    for (let h = 14; h < 16; h++) { slots.add(`${d}-${h}-0`); slots.add(`${d}-${h}-30`); }
  }
  // Sat morning 10-11
  slots.add('5-10-0'); slots.add('5-10-30');
  return slots;
})();

function Availability({ onBack, onSave }) {
  const [slots, setSlots] = React.useState(DEFAULT_AVAIL);
  const dragRef = React.useRef({ active:false, mode:'add', touched:new Set() });

  const key = (d, h, m) => `${d}-${h}-${m}`;
  const has = (k) => slots.has(k);

  const apply = (k) => {
    const t = dragRef.current;
    if (t.touched.has(k)) return;
    t.touched.add(k);
    setSlots(prev => {
      const next = new Set(prev);
      t.mode === 'add' ? next.add(k) : next.delete(k);
      return next;
    });
  };

  const onCellDown = (k) => (e) => {
    e.preventDefault();
    dragRef.current = { active:true, mode: has(k) ? 'remove' : 'add', touched: new Set() };
    apply(k);
  };
  const onCellEnter = (k) => () => {
    if (dragRef.current.active) apply(k);
  };

  React.useEffect(() => {
    const up = () => { dragRef.current.active = false; dragRef.current.touched.clear(); };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const totalHours = slots.size / 2;
  const dayCounts = DAYS.map((_, d) =>
    HOURS.filter(({h,m}) => has(key(d,h,m))).length / 2
  );

  // Suggested partners — pretend overlap calculation
  const matches = [
    { name:'Maplewood House',  loc:'Burlington, VT',     overlap:'8 hrs/wk',   color:'var(--sage)',   tz:'EST · +0' },
    { name:'Willow Ridge',     loc:'Tucson, AZ',         overlap:'4.5 hrs/wk', color:'var(--blush)',  tz:'MST · −2' },
    { name:'Oak Haven Care',   loc:'Asheville, NC',      overlap:'6 hrs/wk',   color:'var(--lavender)', tz:'EST · +0' },
    { name:'Bayview Cottages', loc:'Astoria, OR',        overlap:'2 hrs/wk',   color:'var(--peach)',  tz:'PST · −3' },
  ];

  return (
    <div style={{ maxWidth:1320, margin:'0 auto', padding:'32px 40px 80px' }}>
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom:14, paddingLeft:8, fontSize:13 }}>
        <span style={{ transform:'rotate(180deg)', display:'inline-flex' }}><Icon name="chev" size={16} /></span>
        Back
      </button>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, gap:24 }}>
        <div>
          <div className="h-mono" style={{ marginBottom:10 }}>our availability</div>
          <div className="h-display" style={{ fontSize:56, lineHeight:1.05 }}>
            When is the <span className="h-italic">common room</span> free?
          </div>
          <div style={{ marginTop:10, color:'var(--ink-2)', fontSize:16, maxWidth:640 }}>
            Click or drag to paint open slots. We'll match you with partner homes who are around then.
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button className="btn btn-secondary" onClick={() => setSlots(new Set())}>Clear all</button>
          <button className="btn btn-primary btn-lg" onClick={onSave}>
            <Icon name="check" size={18} color="var(--cream)" />
            Save availability
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:28 }}>
        {/* Calendar */}
        <div className="card" style={{ padding:24 }}>
          {/* Totals strip */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                         marginBottom:18, paddingBottom:18, borderBottom:'1px solid var(--line-2)' }}>
            <div>
              <div className="h-mono" style={{ marginBottom:4 }}>open this week</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <span className="h-num" style={{ fontSize:36 }}>{totalHours}</span>
                <span style={{ fontSize:14, color:'var(--ink-2)' }}>hours across {dayCounts.filter(c=>c>0).length} days</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--ink-2)' }}>
              <span style={{ width:14, height:14, borderRadius:4, background:'var(--sage)' }} />
              Open
              <span style={{ width:14, height:14, borderRadius:4, background:'var(--cream-2)', marginLeft:10 }} />
              Closed
            </div>
          </div>

          {/* Grid */}
          <div style={{ display:'grid',
                         gridTemplateColumns:`64px repeat(${HOURS.length}, 1fr)`,
                         gap:2, userSelect:'none' }}>
            {/* Header row: times */}
            <div />
            {HOURS.map(({h, m}, i) => (
              <div key={`h-${i}`} style={{ fontSize:9, fontFamily:'var(--sans)', fontWeight:500,
                                            letterSpacing:'.04em', textAlign:'center',
                                            color: m === 0 ? 'var(--ink-2)' : 'transparent',
                                            paddingBottom:6 }}>
                {m === 0 ? `${h % 12 || 12}${h>=12?'p':'a'}` : ''}
              </div>
            ))}

            {/* Body rows */}
            {DAYS.map((day, d) => (
              <React.Fragment key={day}>
                <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)',
                                display:'flex', alignItems:'center', paddingRight:8 }}>
                  {day}
                  <span style={{ marginLeft:'auto', fontSize:11, color:'var(--ink-3)' }}>
                    {dayCounts[d]>0 ? `${dayCounts[d]}h` : ''}
                  </span>
                </div>
                {HOURS.map(({h, m}, i) => {
                  const k = key(d, h, m);
                  const on = has(k);
                  return (
                    <div key={k}
                      onMouseDown={onCellDown(k)}
                      onMouseEnter={onCellEnter(k)}
                      style={{ aspectRatio:'0.6/1', minHeight:30, borderRadius:6,
                                background: on ? 'var(--sage)' : 'var(--cream-2)',
                                cursor:'pointer',
                                transition:'background .08s ease, transform .08s ease',
                                boxShadow: on ? 'inset 0 0 0 1px rgba(42,33,28,.1)' : 'none' }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Quick presets */}
          <div style={{ display:'flex', gap:8, marginTop:18, flexWrap:'wrap', alignItems:'center' }}>
            <span className="h-mono">presets:</span>
            <button className="btn btn-secondary" style={{ fontSize:12, minHeight:34, padding:'8px 14px' }}
              onClick={() => setSlots(DEFAULT_AVAIL)}>Standard activities hours</button>
            <button className="btn btn-secondary" style={{ fontSize:12, minHeight:34, padding:'8px 14px' }}
              onClick={() => {
                const s = new Set();
                for (let d = 0; d < 5; d++) for (let h = 10; h < 12; h++) {
                  s.add(`${d}-${h}-0`); s.add(`${d}-${h}-30`);
                }
                setSlots(s);
              }}>Weekday mornings only</button>
            <button className="btn btn-secondary" style={{ fontSize:12, minHeight:34, padding:'8px 14px' }}
              onClick={() => {
                const s = new Set();
                for (let d = 0; d < 7; d++) for (let h = 14; h < 17; h++) {
                  s.add(`${d}-${h}-0`); s.add(`${d}-${h}-30`);
                }
                setSlots(s);
              }}>Every afternoon</button>
          </div>
        </div>

        {/* Match panel */}
        <aside>
          <div className="h-mono" style={{ marginBottom:14 }}>good matches</div>
          <div style={{ background:'var(--paper)', borderRadius:'var(--r-md)',
                         boxShadow:'var(--shadow-sm)', overflow:'hidden' }}>
            {matches.map((m, i) => (
              <div key={m.name} style={{ padding:'18px 20px',
                                          borderTop: i>0 ? '1px solid var(--line-2)':'none',
                                          display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:m.color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.loc} · {m.tz}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="h-num" style={{ fontSize:18 }}>{m.overlap.split(' ')[0]}</div>
                  <div style={{ fontSize:10, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.1em' }}>
                    overlap/wk
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'16px 18px', background:'var(--cream-2)',
                         borderRadius:'var(--r-sm)', fontSize:13, color:'var(--ink-2)', lineHeight:1.5 }}>
            Add more open slots and we'll surface more matches. Most homes leave 6–10 hours/week open.
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { Availability });
