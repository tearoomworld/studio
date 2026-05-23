// Partner Homes — directory of homes Sunrise is connected to,
// plus an "explore" section for finding new partners.

const PARTNERS = [
  { id:'maplewood', name:'Maplewood House',  loc:'Burlington, VT', tz:'EST', residents:34,
    color:'var(--sage)',   director:'Carmen Ortiz',  sessions:24, last:'Yesterday',
    likes:['Trivia','Sing-along','Just a visit'], status:'active' },
  { id:'willow',    name:'Willow Ridge',     loc:'Tucson, AZ',     tz:'MST', residents:48,
    color:'var(--blush)',  director:'Brenda Choi',    sessions:18, last:'2 days ago',
    likes:['Bingo','Trivia'], status:'active' },
  { id:'oakhaven',  name:'Oak Haven Care',   loc:'Asheville, NC',  tz:'EST', residents:22,
    color:'var(--lavender)',director:'Theo Ward',      sessions:12, last:'Last week',
    likes:['Sing-along','Bingo','Trivia'], status:'active' },
  { id:'bayview',   name:'Bayview Cottages', loc:'Astoria, OR',    tz:'PST', residents:18,
    color:'var(--peach)',  director:'Anita Halverson', sessions:6,  last:'2 weeks ago',
    likes:['Bingo','Trivia'], status:'quiet' },
  { id:'meadow',    name:'Meadowbrook',      loc:'Lincoln, NE',    tz:'CST', residents:29,
    color:'var(--buttercream)',director:'Joel Tate',    sessions:4,  last:'3 weeks ago',
    likes:['Trivia','Just a visit'], status:'quiet' },
];

const SUGGESTED = [
  { name:'Cedar Hollow',   loc:'Madison, WI', tz:'CST', residents:26, match:'94%' },
  { name:'Spring Meadows', loc:'Athens, GA',  tz:'EST', residents:31, match:'88%' },
  { name:'Lakeshore Care', loc:'Duluth, MN',  tz:'CST', residents:22, match:'82%' },
];

function PartnerHomes({ onBack }) {
  const [tab, setTab] = React.useState('connected'); // connected | explore
  const [active, setActive] = React.useState(PARTNERS[0]);

  return (
    <div style={{ maxWidth:1320, margin:'0 auto', padding:'32px 40px 80px' }}>
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom:14, paddingLeft:8, fontSize:13 }}>
        <span style={{ transform:'rotate(180deg)', display:'inline-flex' }}><Icon name="chev" size={16} /></span>
        Back to dashboard
      </button>

      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, gap:24 }}>
        <div>
          <div className="h-mono" style={{ marginBottom:10 }}>kindred network · 5 homes</div>
          <div className="h-display" style={{ fontSize:52, lineHeight:1.05 }}>
            Sunrise's <span className="h-italic">circle</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <div style={{ display:'flex', background:'var(--paper)', borderRadius:999, padding:4,
                         boxShadow:'inset 0 0 0 1px var(--line-2)' }}>
            {[
              { id:'connected', label:'Connected' },
              { id:'explore',   label:'Explore new' },
            ].map(o => (
              <button key={o.id} onClick={() => setTab(o.id)}
                style={{ all:'unset', cursor:'pointer', padding:'8px 16px', borderRadius:999, fontSize:13, fontWeight:500,
                          color: tab===o.id?'var(--cream)':'var(--ink-2)',
                          background: tab===o.id?'var(--ink)':'transparent' }}>
                {o.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary">
            <Icon name="plus" size={16} color="var(--cream)" /> Invite by email
          </button>
        </div>
      </div>

      {tab === 'connected' ? (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24 }}>
          {/* List */}
          <div className="card" style={{ padding:'8px 0' }}>
            {PARTNERS.map((p, i) => {
              const isActive = active?.id === p.id;
              return (
                <button key={p.id} onClick={() => setActive(p)}
                  style={{ all:'unset', cursor:'pointer', display:'grid',
                            gridTemplateColumns:'56px 1.4fr 1fr auto auto', gap:18, alignItems:'center',
                            padding:'20px 24px', borderTop: i>0 ? '1px solid var(--line-2)' : 'none',
                            background: isActive ? 'rgba(42,33,28,.04)' : 'transparent' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:p.color }} />
                  <div>
                    <div style={{ fontSize:16, fontWeight:500 }}>{p.name}</div>
                    <div style={{ fontSize:13, color:'var(--ink-3)' }}>{p.loc} · {p.tz}</div>
                  </div>
                  <div>
                    <div className="h-num" style={{ fontSize:20 }}>{p.sessions}</div>
                    <div style={{ fontSize:11, color:'var(--ink-3)', letterSpacing:'.1em',
                                   textTransform:'uppercase' }}>sessions together</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="h-mono">{p.status === 'active' ? 'active' : 'quiet'}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)', marginTop:4 }}>last: {p.last}</div>
                  </div>
                  <Icon name="chev" size={16} color="var(--ink-3)" />
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {active && (
            <aside>
              <div className="card" style={{ padding:'28px 28px', position:'relative' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:active.color }} />
                <div className="h-display" style={{ fontSize:32, marginTop:18 }}>{active.name}</div>
                <div className="h-mono" style={{ marginTop:6 }}>{active.loc} · {active.tz}</div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:22 }}>
                  <Stat n={active.residents} label="Residents" />
                  <Stat n={active.sessions}   label="Sessions" />
                </div>

                <div style={{ height:1, background:'var(--line-2)', margin:'22px 0' }} />

                <div className="h-mono" style={{ marginBottom:10 }}>their activities director</div>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <ResidentAvatar name={active.director} color={active.color} size={40} />
                  <div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{active.director}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>Reply usually within a day</div>
                  </div>
                </div>

                <div style={{ height:1, background:'var(--line-2)', margin:'22px 0' }} />

                <div className="h-mono" style={{ marginBottom:10 }}>their residents love</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {active.likes.map(l => (
                    <span key={l} className="pill" style={{ background:'var(--cream-2)',
                                                              color:'var(--ink)', padding:'7px 12px' }}>
                      {l}
                    </span>
                  ))}
                </div>

                <div style={{ display:'flex', gap:8, marginTop:24 }}>
                  <button className="btn btn-primary" style={{ flex:1 }}>
                    <Icon name="calendar" size={16} color="var(--cream)" />
                    Schedule a session
                  </button>
                  <button className="btn btn-secondary">Message</button>
                </div>
              </div>
            </aside>
          )}
        </div>
      ) : (
        <>
          <div className="card" style={{ padding:'8px 0' }}>
            {SUGGESTED.map((p, i) => (
              <div key={p.name} style={{ display:'grid',
                                          gridTemplateColumns:'56px 1.4fr 1fr 1fr auto', gap:18, alignItems:'center',
                                          padding:'20px 24px', borderTop: i>0 ? '1px solid var(--line-2)' : 'none' }}>
                <div style={{ width:48, height:48, borderRadius:'50%',
                               background:['var(--sage)','var(--blush)','var(--lavender)'][i%3] }} />
                <div>
                  <div style={{ fontSize:16, fontWeight:500 }}>{p.name}</div>
                  <div style={{ fontSize:13, color:'var(--ink-3)' }}>{p.loc} · {p.tz}</div>
                </div>
                <div style={{ fontSize:13, color:'var(--ink-2)' }}>{p.residents} residents</div>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:60, height:6, borderRadius:999, background:'var(--cream-2)', overflow:'hidden' }}>
                      <div style={{ width:p.match, height:'100%', background:'#A6C97D' }} />
                    </div>
                    <span className="h-num" style={{ fontSize:14 }}>{p.match}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--ink-3)', marginTop:4, letterSpacing:'.1em',
                                 textTransform:'uppercase' }}>schedule match</div>
                </div>
                <button className="btn btn-secondary">Say hello</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop:18, padding:'18px 22px', background:'var(--cream-2)',
                         borderRadius:'var(--r-sm)', fontSize:13, color:'var(--ink-2)', lineHeight:1.5,
                         maxWidth:680 }}>
            Matches are based on your availability and residents' preferences.
            Open more slots in <em>Availability</em> to surface more homes.
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div style={{ padding:'14px 16px', background:'var(--cream-2)', borderRadius:'var(--r-sm)' }}>
      <div className="h-num" style={{ fontSize:26 }}>{n}</div>
      <div style={{ fontSize:11, color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:2 }}>
        {label}
      </div>
    </div>
  );
}

Object.assign(window, { PartnerHomes });
