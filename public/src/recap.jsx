// End-of-session Recap — clean, symmetric, no organic blobs.

function Recap({ mode = 'trivia', onHome, onScheduleNext }) {
  return (
    <div style={{ maxWidth:1320, margin:'0 auto', padding:'40px 40px 80px' }}>
      {/* Hero */}
      <div style={{ textAlign:'center', padding:'32px 0 40px' }}>
        <div className="h-mono" style={{ marginBottom:14 }}>that's a wrap · 45 minutes together</div>
        <div className="h-display" style={{ fontSize:80, lineHeight:1.0, maxWidth:1000, margin:'0 auto' }}>
          A really lovely <span className="h-italic">afternoon</span>.
        </div>
        <div style={{ marginTop:18, fontSize:18, color:'var(--ink-2)', maxWidth:680, margin:'18px auto 0' }}>
          Sunrise Manor and Maplewood House gathered around the 1960s today.
        </div>
      </div>

      {/* Clean symmetric stat circles */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:14, margin:'40px 0' }}>
        <StatCircle color="var(--buttercream)" num="14" label="Sunrise residents" />
        <StatCircle color="var(--sage)"        num="11" label="Maplewood residents" />
        <StatCircle color="var(--sky)"         num="47" label="Questions answered" />
        <StatCircle color="var(--blush)"       num="9"  label="Songs sung together" />
        <StatCircle color="var(--lavender)"    num="3"  label="Birthdays celebrated" />
      </div>

      {/* Two-column body */}
      <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:22, marginTop:40 }}>
        <div className="card" style={{ padding:'30px 34px' }}>
          <div className="h-mono" style={{ marginBottom:14 }}>moments worth remembering</div>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Moment time="2:08 PM" color="var(--peach)"
              title="Frank knew every Motown question"
              body="The room cheered when he got “My Girl” before the timer hit zero. Carmen said Maplewood was clapping too." />
            <Moment time="2:24 PM" color="var(--sage)"
              title="Happy 91st, Eleanor"
              body="Both rooms sang together. Eleanor was teary — in the good way." />
            <Moment time="2:41 PM" color="var(--lavender)"
              title="Margaret and Doris swapped pie recipes"
              body="During the music break — a follow-up note suggested for both homes." />
          </div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:22 }}>
          <div className="card" style={{ padding:'24px 28px' }}>
            <div className="h-mono" style={{ marginBottom:14 }}>most engaged today</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { name:'Frank G.', sub:'Sunrise · answered 8 of 12', score:8,   color:'var(--peach)' },
                { name:'Margaret W.',sub:'Sunrise · answered 7 of 12',score:7, color:'var(--peach)' },
                { name:'Walter S.',sub:'Maplewood · answered 7 of 12',score:7, color:'var(--sage)' },
                { name:'Hazel D.', sub:'Sunrise · reacted 42 times', score:6,  color:'var(--peach)' },
              ].map(r => (
                <div key={r.name} style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <ResidentAvatar name={r.name} color={r.color} size={44} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:500 }}>{r.name}</div>
                    <div style={{ fontSize:12, color:'var(--ink-3)' }}>{r.sub}</div>
                  </div>
                  <div className="h-num" style={{ fontSize:24 }}>{r.score}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            position:'relative', overflow:'hidden', padding:'28px 30px', borderRadius:'var(--r-lg)',
            background:'linear-gradient(135deg, var(--sage) 0%, var(--sky) 100%)',
          }}>
            <div className="h-mono" style={{ position:'relative' }}>kindred suggests</div>
            <div className="h-display" style={{ position:'relative', fontSize:32, marginTop:8, maxWidth:300 }}>
              Maplewood is free <span className="h-italic">Thursday at 10</span>.
            </div>
            <div style={{ position:'relative', marginTop:8, fontSize:13, color:'var(--ink-2)', maxWidth:280 }}>
              Carmen tagged today as <em>"do again soon."</em> A 1970s music session is queued up.
            </div>
            <div style={{ position:'relative', display:'flex', gap:8, marginTop:18 }}>
              <button className="btn btn-primary" onClick={onScheduleNext}>Schedule Thursday</button>
              <button className="btn btn-ghost">Other times</button>
            </div>
          </div>
        </div>
      </div>

      {/* Quote + actions */}
      <div style={{ marginTop:40, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div className="h-display h-italic" style={{ fontSize:28, color:'var(--ink-2)', textAlign:'center', maxWidth:580 }}>
          "It felt like we were all in the same room.
          We can't wait until Thursday."
        </div>
        <div className="h-mono">— Carmen, Maplewood House</div>
        <div style={{ display:'flex', gap:12, marginTop:18 }}>
          <button className="btn btn-secondary btn-lg" onClick={onHome}>Back to dashboard</button>
          <button className="btn btn-primary btn-lg">Send recap to families</button>
        </div>
      </div>
    </div>
  );
}

function StatCircle({ color, num, label }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
      <div style={{ width:180, height:180, borderRadius:'50%', background:color,
                     display:'flex', alignItems:'center', justifyContent:'center',
                     boxShadow:'inset 0 -10px 30px rgba(42,33,28,.06)' }}>
        <div className="h-num" style={{ fontSize:64, color:'var(--ink)' }}>{num}</div>
      </div>
      <div style={{ fontSize:13, color:'var(--ink-2)', marginTop:14, maxWidth:140, lineHeight:1.3 }}>
        {label}
      </div>
    </div>
  );
}

function Moment({ time, color, title, body }) {
  return (
    <div style={{ display:'flex', gap:18, paddingBottom:18, borderBottom:'1px solid var(--line-2)' }}>
      <div style={{ minWidth:80 }}>
        <div className="h-mono">{time}</div>
        <div style={{ width:14, height:14, borderRadius:'50%', background:color, marginTop:8 }} />
      </div>
      <div>
        <div className="h-display" style={{ fontSize:24, lineHeight:1.15 }}>{title}</div>
        <div style={{ marginTop:6, fontSize:14, color:'var(--ink-2)', lineHeight:1.55 }}>{body}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Recap });
