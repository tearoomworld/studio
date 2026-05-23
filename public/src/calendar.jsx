// Calendar — weekly schedule view with sessions across days.
// Time runs vertically (left axis), days run horizontally.

const CAL_DAYS = ['Mon 19', 'Tue 20', 'Wed 21', 'Thu 22', 'Fri 23', 'Sat 24', 'Sun 25'];
const CAL_HOURS = []; for (let h = 8; h <= 20; h++) CAL_HOURS.push(h);

const CAL_SESSIONS = [
  { day:0, start:10.5, end:11.5, title:'Decades Trivia · 50s', partner:'Maplewood House',  kind:'trivia', color:'var(--sage)' },
  { day:0, start:14,   end:14.75,title:'Afternoon Bingo',      partner:'Willow Ridge',     kind:'bingo',  color:'var(--peach)' },
  { day:1, start:15,   end:16,   title:'Sing-Along · Frank',   partner:'Oak Haven',        kind:'music',  color:'var(--lavender)' },
  { day:2, start:10.5, end:11.5, title:'Decades Trivia · 60s', partner:'Maplewood House',  kind:'trivia', color:'var(--sage)' },
  { day:2, start:14,   end:14.5, title:'Afternoon Bingo',      partner:'Willow Ridge',     kind:'bingo',  color:'var(--peach)' },
  { day:2, start:16.25,end:17,   title:'Sing-Along · Patsy',   partner:'Oak Haven',        kind:'music',  color:'var(--lavender)' },
  { day:3, start:11,   end:12,   title:'Bingo with Bayview',   partner:'Bayview Cottages', kind:'bingo',  color:'var(--peach)' },
  { day:4, start:10,   end:11,   title:'Decades Trivia · 70s', partner:'Meadowbrook',      kind:'trivia', color:'var(--sage)' },
  { day:4, start:15,   end:15.75,title:'Friday Bingo',         partner:'Willow Ridge',     kind:'bingo',  color:'var(--peach)' },
  { day:5, start:10.5, end:11.5, title:'Saturday Social',      partner:'Maplewood House',  kind:'video',  color:'var(--blush)' },
];

const HOUR_PX = 56;

function Calendar({ onBack, onOpenSession }) {
  const [view, setView] = React.useState('week'); // week | month
  const [selected, setSelected] = React.useState(null);

  return (
    <div style={{ maxWidth:1320, margin:'0 auto', padding:'32px 40px 80px' }}>
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom:14, paddingLeft:8, fontSize:13 }}>
        <span style={{ transform:'rotate(180deg)', display:'inline-flex' }}><Icon name="chev" size={16} /></span>
        Back to dashboard
      </button>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, gap:24 }}>
        <div>
          <div className="h-mono" style={{ marginBottom:10 }}>May · week 21</div>
          <div className="h-display" style={{ fontSize:52, lineHeight:1.05 }}>
            <span className="h-italic">10</span> sessions <br/>this week
          </div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ display:'flex', background:'var(--paper)', borderRadius:999, padding:4,
                         boxShadow:'inset 0 0 0 1px var(--line-2)' }}>
            <button onClick={() => {}} style={{ all:'unset', cursor:'pointer', padding:'8px 14px', borderRadius:999,
                          fontSize:13, color:'var(--ink-2)' }}>
              ‹
            </button>
            <button onClick={() => {}} style={{ all:'unset', cursor:'pointer', padding:'8px 14px', borderRadius:999,
                          fontSize:13, color:'var(--ink-2)' }}>
              Today
            </button>
            <button onClick={() => {}} style={{ all:'unset', cursor:'pointer', padding:'8px 14px', borderRadius:999,
                          fontSize:13, color:'var(--ink-2)' }}>
              ›
            </button>
          </div>
          <div style={{ display:'flex', background:'var(--paper)', borderRadius:999, padding:4,
                         boxShadow:'inset 0 0 0 1px var(--line-2)' }}>
            {['week','month'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ all:'unset', cursor:'pointer', padding:'8px 16px', borderRadius:999,
                          fontSize:13, fontWeight:500, textTransform:'capitalize',
                          color: view===v?'var(--cream)':'var(--ink-2)',
                          background: view===v?'var(--ink)':'transparent' }}>
                {v}
              </button>
            ))}
          </div>
          <button className="btn btn-primary">
            <Icon name="plus" size={16} color="var(--cream)" /> Schedule session
          </button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap:24 }}>
        <div className="card" style={{ padding:'24px 28px 28px', overflow:'hidden' }}>
          {/* Day header */}
          <div style={{ display:'grid', gridTemplateColumns:`72px repeat(${CAL_DAYS.length}, 1fr)`,
                         borderBottom:'1px solid var(--line)', paddingBottom:14, marginBottom:8 }}>
            <div />
            {CAL_DAYS.map((d, i) => {
              const isToday = i === 2;
              const [name, num] = d.split(' ');
              return (
                <div key={d} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:11, fontFamily:'var(--sans)', fontWeight:500, letterSpacing:'.12em',
                                 textTransform:'uppercase', color:'var(--ink-3)' }}>
                    {name}
                  </div>
                  <div className="h-num" style={{ fontSize:22, marginTop:4,
                                                   color: isToday?'var(--ink)':'var(--ink-2)',
                                                   display:'inline-flex', alignItems:'center', justifyContent:'center',
                                                   width:32, height:32, borderRadius:'50%',
                                                   background: isToday?'var(--buttercream)':'transparent' }}>
                    {num}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Body — time axis + grid */}
          <div style={{ position:'relative', display:'grid',
                         gridTemplateColumns:`72px repeat(${CAL_DAYS.length}, 1fr)`,
                         height: HOUR_PX * (CAL_HOURS.length - 1) }}>
            {/* Time column */}
            <div style={{ position:'relative' }}>
              {CAL_HOURS.slice(0, -1).map((h, i) => (
                <div key={h} style={{ position:'absolute', top: i*HOUR_PX - 7, right:12,
                                       fontSize:11, color:'var(--ink-3)',
                                       fontFamily:'var(--sans)', letterSpacing:'.06em' }}>
                  {h % 12 || 12}{h>=12?' PM':' AM'}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {CAL_DAYS.map((d, di) => (
              <div key={d} style={{ position:'relative',
                                     borderLeft: di===0 ? '1px solid var(--line-2)' : '1px solid var(--line-2)',
                                     borderRight: di===CAL_DAYS.length-1 ? '1px solid var(--line-2)' : 'none' }}>
                {/* Hour lines */}
                {CAL_HOURS.slice(0,-1).map((h, i) => (
                  <div key={h} style={{ position:'absolute', left:0, right:0,
                                         top: i*HOUR_PX, borderTop:'1px solid var(--line-2)' }} />
                ))}
                {/* Sessions */}
                {CAL_SESSIONS.filter(s => s.day === di).map((s, i) => {
                  const top  = (s.start - CAL_HOURS[0]) * HOUR_PX;
                  const ht   = (s.end - s.start) * HOUR_PX - 4;
                  return (
                    <button key={i} onClick={() => setSelected(s)}
                      style={{ all:'unset', cursor:'pointer', position:'absolute',
                                left:4, right:4, top, height:ht,
                                borderRadius:10, padding:'8px 10px',
                                background:s.color, color:'var(--ink)',
                                boxShadow: selected===s ? 'inset 0 0 0 2px var(--ink)' : 'none',
                                display:'flex', flexDirection:'column', gap:2, overflow:'hidden' }}>
                      <div style={{ fontSize:11, fontWeight:600, lineHeight:1.2 }}>{s.title}</div>
                      <div style={{ fontSize:10, opacity:.7, lineHeight:1.2 }}>{s.partner}</div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel for selected session */}
        {selected && (
          <aside className="card" style={{ padding:24, alignSelf:'flex-start' }}>
            <button onClick={() => setSelected(null)} style={{ all:'unset', cursor:'pointer',
                          fontSize:18, color:'var(--ink-3)', float:'right' }}>×</button>
            <div style={{ width:48, height:48, borderRadius:'50%', background:selected.color,
                           display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <Icon name={selected.kind} size={22} />
            </div>
            <div className="h-display" style={{ fontSize:26, lineHeight:1.15 }}>{selected.title}</div>
            <div className="h-mono" style={{ marginTop:8 }}>
              {CAL_DAYS[selected.day]} · {formatTime(selected.start)}–{formatTime(selected.end)}
            </div>
            <div style={{ height:1, background:'var(--line-2)', margin:'20px 0' }} />
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:selected.color }} />
              <div>
                <div style={{ fontSize:14, fontWeight:500 }}>{selected.partner}</div>
                <div style={{ fontSize:12, color:'var(--ink-3)' }}>partner home</div>
              </div>
            </div>
            <div style={{ marginTop:20, fontSize:13, color:'var(--ink-2)', lineHeight:1.5,
                           padding:'14px 16px', background:'var(--cream-2)', borderRadius:'var(--r-sm)' }}>
              Both rooms confirmed. Carmen will be facilitating on their side.
            </div>
            <div style={{ display:'flex', gap:8, marginTop:18 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={() => onOpenSession(selected.kind)}>
                Open session
              </button>
              <button className="btn btn-secondary">Reschedule</button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function formatTime(decimal) {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return m === 0 ? `${hh} ${ampm}` : `${hh}:${String(m).padStart(2,'0')} ${ampm}`;
}

Object.assign(window, { Calendar });
