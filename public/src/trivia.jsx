// Trivia — 4 phases per question, with audio isolation during DISCUSS.
//
// Phase ladder:
//   reveal   — both rooms see the question; audio open; ~3s
//   discuss  — other room muted; facilitator clicks the room's consensus pick
//   locked   — waiting for the other room to lock in too
//   answer   — audio reopens; both rooms' picks shown side-by-side; scores update
//
// The facilitator is the room's "hands" — residents shout, facilitator clicks.

const TRIVIA_QUESTIONS = [
  {
    decade:'1960s', category:'Music',
    q:'Which Motown group sang "My Girl" in 1965?',
    options:[
      { id:'a', label:'The Temptations' },
      { id:'b', label:'The Four Tops' },
      { id:'c', label:'The Miracles' },
      { id:'d', label:'The Supremes' },
    ],
    answer:'a',
  },
  {
    decade:'1960s', category:'Headlines',
    q:'In what year did Neil Armstrong walk on the moon?',
    options:[
      { id:'a', label:'1967' },
      { id:'b', label:'1969' },
      { id:'c', label:'1971' },
      { id:'d', label:'1973' },
    ],
    answer:'b',
  },
];

function TriviaGame({ audioIsolation = true, onMuteOther }) {
  const [qi, setQi] = React.useState(0);
  const q = TRIVIA_QUESTIONS[qi % TRIVIA_QUESTIONS.length];

  // Phase machine
  const [phase, setPhase] = React.useState('reveal'); // reveal | discuss | locked | answer
  const [time, setTime] = React.useState(3); // reveal countdown
  const [discussTime, setDiscussTime] = React.useState(25);
  const [ourPick, setOurPick] = React.useState(null);
  const [theirPick, setTheirPick] = React.useState(null);
  const [scores, setScores] = React.useState({ sunrise: 3, maplewood: 2 });

  // Drive audio isolation outward (in-call shows the visual cue)
  React.useEffect(() => {
    onMuteOther?.(audioIsolation && (phase === 'discuss' || phase === 'locked'));
  }, [phase, audioIsolation, onMuteOther]);

  // Reveal countdown → discuss
  React.useEffect(() => {
    if (phase !== 'reveal') return;
    if (time <= 0) { setPhase('discuss'); return; }
    const id = setTimeout(() => setTime(t => t - 1), 700);
    return () => clearTimeout(id);
  }, [phase, time]);

  // Discuss countdown — if time runs out, auto-lock with whatever the room picked
  React.useEffect(() => {
    if (phase !== 'discuss') return;
    if (discussTime <= 0) { if (ourPick) lockIn(); return; }
    const id = setTimeout(() => setDiscussTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, discussTime]);

  // After we lock in, simulate Carmen locking in too ~2s later
  React.useEffect(() => {
    if (phase !== 'locked') return;
    const id = setTimeout(() => {
      // give Maplewood a plausible pick (often correct, sometimes not)
      const picks = ['a','b','c','d'];
      const tp = Math.random() < 0.6 ? q.answer : picks[Math.floor(Math.random()*4)];
      setTheirPick(tp);
      // tally
      setScores(s => ({
        sunrise:   s.sunrise   + (ourPick   === q.answer ? 1 : 0),
        maplewood: s.maplewood + (tp        === q.answer ? 1 : 0),
      }));
      setPhase('answer');
    }, 2000);
    return () => clearTimeout(id);
  }, [phase]);

  const lockIn = () => {
    if (!ourPick) return;
    setPhase('locked');
  };

  const next = () => {
    setQi(i => i + 1);
    setOurPick(null);
    setTheirPick(null);
    setTime(3);
    setDiscussTime(25);
    setPhase('reveal');
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', gap:14 }}>
      {/* Phase banner — explicit so facilitator knows what's happening */}
      <PhaseBanner phase={phase} discussTime={discussTime} revealTime={time} />

      {/* Question hero */}
      <div className="card" style={{
        position:'relative', overflow:'hidden', padding:'34px 44px 30px',
        background:'linear-gradient(180deg, #FFFBEF 0%, #EFE6CC 100%)',
        borderRadius:'var(--r-xl)', flex:'0 0 auto',
      }}>
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <span className="pill" style={{ background:'var(--ink)', color:'var(--cream)', padding:'6px 12px' }}>
              {q.decade}
            </span>
            <span className="pill" style={{ background:'rgba(255,255,255,.7)', color:'var(--ink)' }}>
              {q.category}
            </span>
            <span className="h-mono">Question {qi+1} of 12</span>
          </div>
        </div>

        <div className="h-display" style={{ position:'relative', fontSize:54, lineHeight:1.08, maxWidth:980 }}>
          {q.q}
        </div>
      </div>

      {/* Answers */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {q.options.map((o, i) => {
          const showResults = phase === 'answer';
          const isAnswer = showResults && o.id === q.answer;
          const isOurPick   = ourPick === o.id;
          const isTheirPick = theirPick === o.id;
          const isOurWrong   = showResults && isOurPick && o.id !== q.answer;
          const isTheirWrong = showResults && isTheirPick && o.id !== q.answer;
          const clickable = phase === 'discuss';
          const colors = ['var(--peach)','var(--sage)','var(--lavender)','var(--blush)'];
          return (
            <button key={o.id}
              onClick={() => clickable && setOurPick(o.id)}
              disabled={!clickable}
              style={{ all:'unset', cursor: clickable?'pointer':'default', position:'relative', overflow:'hidden',
                       padding:'24px 28px', borderRadius:'var(--r-lg)',
                       background: isAnswer ? '#E5F0D4'
                                 : isOurWrong || isTheirWrong ? '#F3DAD3'
                                 : 'var(--paper)',
                       boxShadow: isOurPick && phase!=='answer'
                          ? `inset 0 0 0 3px var(--ink), var(--shadow-md)` : 'var(--shadow-md)',
                       display:'flex', alignItems:'center', gap:20,
                       transition:'background .25s ease, box-shadow .15s ease',
                       opacity: phase === 'reveal' ? 0.5 : 1 }}>
              <div style={{ width:60, height:60, borderRadius:'50%',
                             background: isAnswer ? '#A6C97D' : colors[i], flexShrink:0,
                             display:'flex', alignItems:'center', justifyContent:'center',
                             fontFamily:'var(--serif)', fontSize:30, color:'var(--ink)' }}>
                {o.id.toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div className="h-display" style={{ fontSize:30, lineHeight:1.1 }}>{o.label}</div>
              </div>

              {/* Picks badges */}
              <div style={{ display:'flex', gap:6 }}>
                {isOurPick && (
                  <span style={{ padding:'6px 12px', borderRadius:999, background:'var(--peach)',
                                 fontSize:12, fontWeight:500 }}>Sunrise</span>
                )}
                {isTheirPick && (
                  <span style={{ padding:'6px 12px', borderRadius:999, background:'var(--sage)',
                                 fontSize:12, fontWeight:500 }}>Maplewood</span>
                )}
                {isAnswer && (
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--ink)',
                                 color:'var(--cream)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name="check" size={18} color="var(--cream)" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer: score + action button */}
      <div className="card" style={{ padding:'14px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20 }}>
        <RoomScore name="Sunrise Manor" color="var(--peach)" score={scores.sunrise}
          delta={phase==='answer'?(ourPick===q.answer?1:0):null} />
        <div style={{ fontFamily:'var(--sans)', fontSize:11, letterSpacing:'.14em',
                       textTransform:'uppercase', color:'var(--ink-3)', fontWeight:500 }}>vs</div>
        <RoomScore name="Maplewood House" color="var(--sage)" score={scores.maplewood}
          delta={phase==='answer'?(theirPick===q.answer?1:0):null} right />
        <div>
          {phase === 'discuss' && (
            <button className="btn btn-primary btn-lg" onClick={lockIn} disabled={!ourPick}>
              {ourPick ? 'Lock it in' : 'Pick the room\'s answer'}
            </button>
          )}
          {phase === 'locked' && (
            <div className="btn btn-secondary btn-lg" style={{ cursor:'default' }}>
              Locked in · waiting for Maplewood…
            </div>
          )}
          {phase === 'answer' && (
            <button className="btn btn-primary btn-lg" onClick={next}>
              Next question <Icon name="arrow" size={18} color="var(--cream)"/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseBanner({ phase, discussTime, revealTime }) {
  const banner = {
    reveal:  { bg:'var(--cream-2)', label:'Reading the question together',
               sub:`Both rooms see it · audio open · ${revealTime}s` },
    discuss: { bg:'var(--ink)',     label:'Your turn to discuss',
               sub:`Maplewood is muted — confer with the room and lock in (${discussTime}s)`, dark:true },
    locked:  { bg:'#A6C97D',        label:'Locked in',
               sub:'Waiting for Maplewood to lock in too…' },
    answer:  { bg:'var(--buttercream)', label:'Reveal',
               sub:'Audio is open again — react together' },
  }[phase];

  return (
    <div style={{ padding:'14px 22px', borderRadius:'var(--r-md)',
                  background:banner.bg, color: banner.dark?'var(--cream)':'var(--ink)',
                  display:'flex', alignItems:'center', gap:14, justifyContent:'space-between',
                  transition:'background .3s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <PhaseIcon phase={phase} dark={banner.dark} />
        <div>
          <div style={{ fontSize:17, fontWeight:500 }}>{banner.label}</div>
          <div style={{ fontSize:13, opacity:.75 }}>{banner.sub}</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {['reveal','discuss','locked','answer'].map((p, i) => (
          <div key={p} style={{ width: phase===p?20:8, height:8, borderRadius:999,
                                background: phase===p ? (banner.dark?'var(--cream)':'var(--ink)')
                                                       : (banner.dark?'rgba(250,245,234,.25)':'rgba(42,33,28,.15)'),
                                transition:'all .25s ease' }} />
        ))}
      </div>
    </div>
  );
}

function PhaseIcon({ phase, dark }) {
  const c = dark ? 'var(--cream)' : 'var(--ink)';
  if (phase === 'discuss' || phase === 'locked') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 3l18 18M9 9v3a3 3 0 005 2.24M15 9.34V5a3 3 0 00-5.94-.6M5 10v2a7 7 0 0011.91 4.95M19 10v2a6.97 6.97 0 01-.34 2.15"
              stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke={c} strokeWidth="1.8"/>
      <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function RoomScore({ name, color, score, delta, right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14, flexDirection: right?'row-reverse':'row' }}>
      <div style={{ width:44, height:44, borderRadius:'50%', background:color }} />
      <div style={{ textAlign: right?'right':'left' }}>
        <div className="h-mono">{name}</div>
        <div className="h-num" style={{ fontSize:32 }}>
          {score}{delta != null && delta > 0 && (
            <span style={{ fontSize:16, color:'var(--terracotta)', marginLeft:8 }}>+{delta}</span>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TriviaGame });
