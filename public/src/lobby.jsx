// Pre-call Lobby — designed for the BIG SCREEN.
// The room sees a giant "Welcome, Maplewood!" greeting; both facilitators
// click "We're all settled in" — only when BOTH press it does the session start.

function Lobby({ mode = 'trivia', onStart, onBack }) {
  const [usReady, setUsReady] = React.useState(false);
  const [themReady, setThemReady] = React.useState(false);
  const [otherJoined, setOtherJoined] = React.useState(false);
  const [countdown, setCountdown] = React.useState(null);

  // Simulate the other home joining after a moment.
  React.useEffect(() => {
    const id = setTimeout(() => setOtherJoined(true), 1800);
    return () => clearTimeout(id);
  }, []);

  // Simulate Carmen (other facilitator) tapping ready ~3s after we do.
  React.useEffect(() => {
    if (!usReady) return;
    const id = setTimeout(() => setThemReady(true), 2800);
    return () => clearTimeout(id);
  }, [usReady]);

  // When BOTH ready → countdown → start.
  React.useEffect(() => {
    if (!(usReady && themReady)) return;
    setCountdown(3);
  }, [usReady, themReady]);
  React.useEffect(() => {
    if (countdown == null) return;
    if (countdown <= 0) { onStart(mode); return; }
    const id = setTimeout(() => setCountdown(c => c - 1), 900);
    return () => clearTimeout(id);
  }, [countdown]);

  const title = mode === 'bingo' ? 'Afternoon Bingo' : 'Decades Trivia: the 1960s';

  return (
    <div className="stage-bg" style={{ minHeight:'100vh', position:'relative', overflow:'hidden' }}>

      {/* Discreet top-left back link — facilitator chrome */}
      <button onClick={onBack} className="btn btn-ghost"
        style={{ position:'absolute', top:20, left:24, zIndex:5, fontSize:13 }}>
        <span style={{ transform:'rotate(180deg)', display:'inline-flex' }}><Icon name="chev" size={16} /></span>
        Back to dashboard
      </button>

      {/* Countdown overlay */}
      {countdown != null && (
        <div style={{ position:'absolute', inset:0, zIndex:50,
                       background:'rgba(42,33,28,.7)', display:'flex',
                       alignItems:'center', justifyContent:'center', flexDirection:'column',
                       backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)' }}>
          <div className="h-mono" style={{ color:'rgba(250,245,234,.7)', marginBottom:20 }}>everyone's ready</div>
          {countdown > 0 ? (
            <div className="h-num" style={{ fontSize:340, color:'var(--cream)' }}>{countdown}</div>
          ) : (
            <div className="h-display" style={{ fontSize:96, color:'var(--cream)', lineHeight:.9 }}>Here we go</div>
          )}
        </div>
      )}

      <div style={{ position:'relative', maxWidth:1280, margin:'0 auto', padding:'80px 40px 40px',
                    minHeight:'100vh', display:'flex', flexDirection:'column' }}>

        {/* Big welcome heading — for residents to see */}
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div className="h-mono" style={{ marginBottom:14 }}>{otherJoined ? 'together for' : 'getting ready for'}</div>
          <div className="h-display" style={{ fontSize:96, lineHeight:1.0 }}>
            {otherJoined ? <>Welcome, <span className="h-italic">Maplewood</span>!</> : title}
          </div>
          {otherJoined && (
            <div style={{ marginTop:16, fontSize:22, color:'var(--ink-2)' }}>
              We're playing <strong>{title}</strong> together.
            </div>
          )}
        </div>

        {/* Two video tiles — both rooms, equally sized */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, marginBottom:40 }}>
          <RoomTile
            home="Sunrise Manor" sub="East Lounge · Asheville, NC"
            color="var(--peach)" accent="var(--blush)"
            ready={usReady} self
          />
          <RoomTile
            home="Maplewood House" sub="Living Room · Burlington, VT"
            color="var(--sage)"  accent="var(--sky)"
            joined={otherJoined} ready={themReady}
          />
        </div>

        {/* The two CTAs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:32, marginTop:'auto' }}>
          {/* Our CTA — facilitator clicks this */}
          <div style={{ textAlign:'center' }}>
            {!usReady ? (
              <button onClick={() => otherJoined && setUsReady(true)}
                disabled={!otherJoined}
                style={{ all:'unset', cursor: otherJoined?'pointer':'not-allowed',
                         display:'inline-flex', alignItems:'center', justifyContent:'center', gap:14,
                         padding:'28px 56px', borderRadius:999, minHeight:88,
                         background: otherJoined ? 'var(--ink)' : 'rgba(42,33,28,.3)',
                         color:'var(--cream)', fontSize:26, fontWeight:500,
                         boxShadow: otherJoined ? '0 16px 40px -12px rgba(42,33,28,.4)' : 'none',
                         transition:'all .15s ease' }}>
                <Icon name="check" size={26} color="var(--cream)" />
                We're all settled in
              </button>
            ) : (
              <div style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'28px 40px',
                            borderRadius:999, background:'#E5F0D4', color:'var(--ink)',
                            fontSize:24, fontWeight:500, minHeight:88, boxSizing:'border-box' }}>
                <Icon name="check" size={26} /> You're ready
              </div>
            )}
            <div style={{ marginTop:12, fontSize:14, color:'var(--ink-2)' }}>
              {!otherJoined ? 'Waiting for Maplewood to connect…'
                : usReady ? "Carmen will see your countdown."
                : 'Click when your residents are gathered and the snacks are out.'}
            </div>
          </div>

          {/* Their status — read-only mirror */}
          <div style={{ textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'28px 40px',
                           borderRadius:999, minHeight:88, boxSizing:'border-box',
                           background: themReady ? '#E5F0D4' : 'rgba(42,33,28,.06)',
                           color: themReady ? 'var(--ink)' : 'var(--ink-2)',
                           fontSize:24, fontWeight:500 }}>
              {themReady ? <><Icon name="check" size={26}/> Maplewood is ready</>
                : <>{otherJoined ? 'Carmen is getting Maplewood settled' : 'Carmen is opening her tablet'}…</>}
            </div>
            <div style={{ marginTop:12, fontSize:14, color:'var(--ink-2)' }}>
              {themReady ? 'Everybody set. Game starting…' : 'They\'ll tap the same button on their side.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomTile({ home, sub, color, accent, joined = true, ready, self }) {
  return (
    <div>
      <div className="h-mono" style={{ marginBottom:10, color: self?'var(--ink-2)':'var(--ink-3)' }}>
        {self ? 'our room' : 'partner'}
      </div>
      <div style={{ position:'relative' }}>
        {joined ? (
          <VideoTile home={home} location={sub} residents={self?14:11}
            color={color} accent={accent} large speaking={ready && !self} />
        ) : (
          <div style={{ aspectRatio:'16/10', borderRadius:'var(--r-lg)', background:'var(--cream-2)',
                         display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                         color:'var(--ink-3)', position:'relative', overflow:'hidden',
                         boxShadow:'var(--shadow-md)' }}>
            <div style={{ width:84, height:84, borderRadius:'50%', background:'var(--cream)',
                           border:'2px dashed var(--ink-faint)', display:'flex',
                           alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <Icon name="video" size={32} color="var(--ink-faint)" />
            </div>
            <div className="h-display" style={{ fontSize:36, color:'var(--ink-2)' }}>
              Ringing…
            </div>
            <div style={{ marginTop:8, fontSize:15 }}>{home}</div>
          </div>
        )}
        {/* Ready overlay tick */}
        {ready && (
          <div style={{ position:'absolute', top:18, right:18,
                         background:'#A6C97D', color:'var(--ink)', padding:'8px 14px',
                         borderRadius:999, display:'flex', alignItems:'center', gap:8,
                         fontSize:14, fontWeight:500, boxShadow:'var(--shadow-md)' }}>
            <Icon name="check" size={16} /> Settled in
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Lobby });
