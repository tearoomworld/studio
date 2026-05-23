// In-call view — the BIG SCREEN.
// Big game area dominates. Slim facilitator chrome on top.
// No mode-switcher (one session = one game).
// No emoji reactions (rooms see + hear each other; reactions are organic).

function InCall({ mode = 'bingo', audioIsolation = true, onEnd }) {
  const [sessionSecs, setSessionSecs] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setSessionSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const title = mode === 'bingo' ? 'Afternoon Bingo' : 'Decades Trivia · the 1960s';
  const fmt = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  // Other-room audio state — driven by the trivia phase or facilitator override.
  const [otherMuted, setOtherMuted] = React.useState(false);

  return (
    <div className="stage-bg" style={{ minHeight:'calc(100vh)', padding:'20px 24px 24px',
          display:'flex', flexDirection:'column', gap:18 }}>

      {/* Facilitator chrome */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:18 }}>
          <span className="pill" style={{ background:'var(--paper)', padding:'8px 14px', fontSize:13 }}>
            <span className="live-dot" /> Live · {fmt(sessionSecs)}
          </span>
          <div>
            <div className="h-display" style={{ fontSize:24, lineHeight:1 }}>{title}</div>
            <div className="h-mono" style={{ marginTop:4 }}>with Maplewood House</div>
          </div>
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-secondary" title="Session settings">
            <Icon name="settings" size={16} />
          </button>
          <button className="btn" style={{ background:'#C45A3C', color:'#fff' }} onClick={onEnd}>
            End session
          </button>
        </div>
      </header>

      {/* Main stage: video rail + game area */}
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:20, flex:1, minHeight:0 }}>
        {/* Side video rail */}
        <aside style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <div className="h-mono" style={{ marginBottom:8 }}>partner</div>
            <VideoTile home="Maplewood House" location="Living Room" residents={11}
              color="var(--sage)" accent="var(--sky)" speaking={!otherMuted} muted={otherMuted} />
          </div>
          <div>
            <div className="h-mono" style={{ marginBottom:8 }}>our room</div>
            <VideoTile home="Sunrise Manor" location="East Lounge" residents={14}
              color="var(--peach)" accent="var(--blush)" />
          </div>

          {/* Audio isolation indicator */}
          {otherMuted && (
            <div style={{ padding:'14px 16px', borderRadius:'var(--r-md)',
                           background:'var(--ink)', color:'var(--cream)' }}>
              <div className="h-mono" style={{ color:'rgba(250,245,234,.5)', marginBottom:6 }}>privacy on</div>
              <div style={{ fontSize:14, lineHeight:1.4 }}>
                Maplewood <strong>can't hear you</strong> while you discuss.
                We'll reopen audio when you lock in.
              </div>
            </div>
          )}
        </aside>

        {/* Game area */}
        <div style={{ position:'relative', minHeight:0 }}>
          {mode === 'bingo'  && <BingoGame />}
          {mode === 'trivia' && <TriviaGame audioIsolation={audioIsolation} onMuteOther={setOtherMuted} />}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InCall });
