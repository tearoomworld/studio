// Director Dashboard — supports two states:
//   "active" — has upcoming sessions
//   "empty"  — first-time / no sessions yet (prompts setting availability)
// And an Availability screen for picking when the home is free.

function Dashboard({ state = 'active', onOpenSession, onSetAvailability }) {
  return (
    <div style={{ maxWidth:1320, margin:'0 auto', padding:'40px 40px 80px' }}>
      <DashHeader />

      {/* Greeting */}
      <div style={{ marginBottom:32, marginTop:32 }}>
        <div className="h-mono" style={{ marginBottom:8 }}>Tuesday, May 21</div>
        <div className="h-display" style={{ fontSize:48 }}>
          Good morning, <span className="h-italic">Patricia</span>.
        </div>
      </div>

      {state === 'empty'
        ? <EmptyState onSetAvailability={onSetAvailability} />
        : <ActiveDashboard onOpenSession={onOpenSession} />
      }
    </div>
  );
}

function DashHeader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--terracotta)',
                      position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:'7px 3px 3px 7px', borderRadius:'50%', background:'var(--buttercream)' }} />
        </div>
        <div className="h-display" style={{ fontSize:26, lineHeight:1 }}>kindred</div>
        <div style={{ width:1, height:20, background:'var(--line)' }} />
        <div style={{ fontSize:14, color:'var(--ink-2)' }}>Sunrise Manor · Activities</div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <button className="btn btn-ghost" style={{ fontSize:13 }}>
          <Icon name="calendar" size={16} /> Calendar
        </button>
        <button className="btn btn-ghost" style={{ fontSize:13 }}>
          <Icon name="users" size={16} /> Partner homes
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10, paddingLeft:14, borderLeft:'1px solid var(--line)' }}>
          <ResidentAvatar name="Patricia Reyes" color="var(--lavender)" size={32} />
          <div style={{ fontSize:13 }}>Patricia</div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty / first-time state ────────────────────────────────────────────
function EmptyState({ onSetAvailability }) {
  return (
    <>
      {/* Hero: warm welcome + primary CTA */}
      <div style={{
        padding:'56px 56px', borderRadius:'var(--r-xl)',
        background:'linear-gradient(140deg, #F5E2B8 0%, #EFC9A3 70%, #ECB994 100%)',
        boxShadow:'var(--shadow-lg)',
        display:'grid', gridTemplateColumns:'1.4fr auto', gap:60, alignItems:'center',
      }}>
        <div>
          <div className="h-mono" style={{ marginBottom:14 }}>welcome to kindred</div>
          <div className="h-display" style={{ fontSize:60, lineHeight:1.0 }}>
            Let's get Sunrise Manor on the schedule.
          </div>
          <div style={{ marginTop:18, fontSize:18, color:'var(--ink-2)', maxWidth:520 }}>
            Tell us when your common room is free, and we'll match you with partner homes
            whose schedules line up.
          </div>
          <div style={{ display:'flex', gap:10, marginTop:30 }}>
            <button className="btn btn-primary btn-xl" onClick={onSetAvailability}>
              <Icon name="calendar" size={20} color="var(--cream)" />
              Set our availability
            </button>
            <button className="btn btn-ghost btn-lg">Take a tour first</button>
          </div>
        </div>

        {/* Clean symmetric ring of dots */}
        <div style={{ position:'relative', width:200, height:200 }}>
          <CleanRing />
        </div>
      </div>

      {/* Three numbered steps — symmetric, clean */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18, marginTop:32 }}>
        {[
          { n:'1', t:'Set your hours', body:'Block out when your common room is free for sessions.' },
          { n:'2', t:'Get matched', body:'We pair you with homes whose residents are around at the same time.' },
          { n:'3', t:'Press play',   body:'Open the laptop in the common room and the rest is residents being residents.' },
        ].map(s => (
          <div key={s.n} style={{ background:'var(--paper)', borderRadius:'var(--r-md)',
                                   padding:'30px 28px', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--cream-2)',
                           display:'flex', alignItems:'center', justifyContent:'center',
                           fontFamily:'var(--sans)', fontWeight:500, fontSize:18, color:'var(--ink)' }}>
              {s.n}
            </div>
            <div className="h-display" style={{ fontSize:24, marginTop:18 }}>{s.t}</div>
            <div style={{ marginTop:8, fontSize:14, color:'var(--ink-2)', lineHeight:1.5 }}>{s.body}</div>
          </div>
        ))}
      </div>

      {/* Suggested partner peek — to whet appetite */}
      <div style={{ marginTop:48 }}>
        <div className="h-mono" style={{ marginBottom:14 }}>homes in your network</div>
        <div style={{ background:'var(--paper)', borderRadius:'var(--r-md)', padding:'8px 0',
                       boxShadow:'var(--shadow-sm)' }}>
          {[
            { name:'Maplewood House',  loc:'Burlington, VT', residents:34, color:'var(--sage)' },
            { name:'Willow Ridge',     loc:'Tucson, AZ',     residents:48, color:'var(--blush)' },
            { name:'Oak Haven Care',   loc:'Asheville, NC',  residents:22, color:'var(--lavender)' },
          ].map((h, i) => (
            <div key={h.name} style={{ display:'grid', gridTemplateColumns:'56px 1fr auto auto',
                                        gap:18, alignItems:'center', padding:'18px 24px',
                                        borderTop: i>0 ? '1px solid var(--line-2)' : 'none' }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:h.color }} />
              <div>
                <div style={{ fontSize:16, fontWeight:500 }}>{h.name}</div>
                <div style={{ fontSize:13, color:'var(--ink-3)' }}>{h.loc} · {h.residents} residents</div>
              </div>
              <div style={{ fontSize:13, color:'var(--ink-2)' }}>Loves trivia, bingo, music</div>
              <button className="btn btn-secondary" style={{ fontSize:13 }}>Say hello</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Clean symmetric ring decoration — replaces blob ornamentation
function CleanRing() {
  const dots = 12;
  return (
    <svg viewBox="-100 -100 200 200" width="200" height="200">
      <circle cx="0" cy="0" r="64" fill="none" stroke="rgba(42,33,28,.12)" strokeWidth="1" />
      <circle cx="0" cy="0" r="84" fill="none" stroke="rgba(42,33,28,.08)" strokeWidth="1" />
      {Array.from({ length: dots }).map((_, i) => {
        const a = (i / dots) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(a) * 84;
        const y = Math.sin(a) * 84;
        return <circle key={i} cx={x} cy={y} r={i === 0 ? 8 : 4}
                       fill={i === 0 ? 'var(--ink)' : 'var(--ink)'}
                       opacity={i === 0 ? 1 : 0.25} />;
      })}
      <circle cx="0" cy="0" r="22" fill="var(--cream)" />
      <circle cx="0" cy="0" r="22" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Active state (has sessions) ─────────────────────────────────────────
function ActiveDashboard({ onOpenSession }) {
  return (
    <>
      <NextSessionHero onOpen={() => onOpenSession('trivia')} />

      <div style={{ marginTop:48 }}>
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:18 }}>
          <div className="h-mono">also today</div>
          <button className="btn btn-ghost" style={{ fontSize:13 }}>This week <Icon name="chev" size={14} /></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column' }}>
          {LATER_TODAY.map((s, i) => (
            <button key={s.id} onClick={() => onOpenSession(s.kind)}
              style={{ all:'unset', cursor:'pointer', display:'grid',
                       gridTemplateColumns:'100px 56px 1fr auto auto', gap:24, alignItems:'center',
                       padding:'22px 8px', borderTop: i===0?'1px solid var(--line)':'none',
                       borderBottom:'1px solid var(--line)' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(42,33,28,.025)'}
              onMouseOut ={e=>e.currentTarget.style.background='transparent'}
            >
              <div>
                <div className="h-num" style={{ fontSize:22 }}>{s.time}</div>
                <div className="h-mono" style={{ marginTop:6 }}>{s.dur}</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:'50%', background:s.kindColor,
                            display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name={s.kind} size={20} />
              </div>
              <div>
                <div style={{ fontSize:17, marginBottom:2 }}>{s.title}</div>
                <div style={{ fontSize:13, color:'var(--ink-2)' }}>with {s.partner} · {s.where}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center' }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width:28, height:28, borderRadius:'50%',
                                         background:['var(--peach)','var(--sage)','var(--lavender)'][j],
                                         marginLeft:j>0?-8:0, boxShadow:'0 0 0 2px var(--cream)' }} />
                ))}
                <span style={{ fontSize:12, color:'var(--ink-3)', marginLeft:10 }}>{s.residents} residents</span>
              </div>
              <Icon name="chev" size={16} color="var(--ink-3)" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const LATER_TODAY = [
  { id:2, time:'2:00 PM',  dur:'30 min', title:'Afternoon Bingo', partner:'Willow Ridge',
    where:'Main Hall',   kind:'bingo',  kindColor:'var(--peach)', residents:22 },
];

function NextSessionHero({ onOpen }) {
  const [mins, setMins] = React.useState(12);
  const [secs, setSecs] = React.useState(34);
  React.useEffect(() => {
    const id = setInterval(() => {
      setSecs(s => {
        if (s > 0) return s - 1;
        setMins(m => Math.max(0, m - 1));
        return 59;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      position:'relative', overflow:'hidden', padding:'48px 56px',
      background:'linear-gradient(140deg, #F5E2B8 0%, #EFC9A3 60%, #ECB994 100%)',
      borderRadius:'var(--r-xl)',
      boxShadow:'var(--shadow-lg)',
    }}>
      <div style={{ position:'relative', display:'grid', gridTemplateColumns:'1fr auto', gap:60, alignItems:'center' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span className="pill" style={{ background:'var(--ink)', color:'var(--cream)', padding:'7px 14px', fontSize:12 }}>
              <span className="live-dot" /> up next
            </span>
            <span className="h-mono">10:30 AM · East Lounge</span>
          </div>

          <div className="h-display" style={{ fontSize:72, lineHeight:1 }}>
            Decades Trivia
          </div>
          <div className="h-display h-italic" style={{ fontSize:48, lineHeight:1.1, color:'var(--ink-2)' }}>
            the 1960s
          </div>
          <div style={{ marginTop:18, fontSize:17, color:'var(--ink-2)', maxWidth:520 }}>
            With Maplewood House. You've gathered <strong style={{ color:'var(--ink)' }}>14 residents</strong> in the East Lounge.
            Carmen's bringing 11 from their living room.
          </div>

          <div style={{ display:'flex', gap:10, marginTop:32 }}>
            <button className="btn btn-primary btn-xl" onClick={onOpen}>
              <Icon name="video" size={20} color="var(--cream)" />
              Open session
            </button>
            <button className="btn btn-ghost btn-lg">Reschedule</button>
          </div>
        </div>

        <div style={{ textAlign:'center', minWidth:240 }}>
          <div className="h-mono" style={{ marginBottom:10 }}>starts in</div>
          <div className="h-num" style={{ fontSize:140 }}>
            {String(mins).padStart(2,'0')}<span style={{ color:'rgba(42,33,28,.4)' }}>:</span>{String(secs).padStart(2,'0')}
          </div>
          <div style={{ marginTop:10, fontSize:13, color:'var(--ink-2)' }}>minutes</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
