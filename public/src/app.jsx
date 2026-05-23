// App shell — full director flow.
// 6 distinct screens; demo chip lets you jump anywhere.

const SCREENS = [
  { id:'welcome',      label:'First-time' },
  { id:'availability', label:'Availability' },
  { id:'dashboard',    label:'Dashboard' },
  { id:'partners',     label:'Partner homes' },
  { id:'calendar',     label:'Calendar' },
  { id:'lobby',        label:'Lobby' },
  { id:'live',         label:'Live' },
  { id:'recap',        label:'Recap' },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette":["#FAF5EA","#F2D98E","#B6CFB1","#F2BFC9","#D2C3E4"],
  "headingFont":"Newsreader",
  "audioIsolation":true
}/*EDITMODE-END*/;

const PALETTES = {
  warmCream: ["#FAF5EA","#F2D98E","#B6CFB1","#F2BFC9","#D2C3E4"],
  morning:   ["#F9F0E4","#F4C5A6","#F2BFC9","#D2C3E4","#B7D2E3"],
  meadow:    ["#F4F2E5","#D6E0A0","#B6CFB1","#A8D0C6","#E6CCA0"],
  lavender:  ["#F6F1F4","#D2C3E4","#E0C6D8","#B7D2E3","#F2D98E"],
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const p = t.palette;
    const root = document.documentElement.style;
    if (p && p.length >= 5) {
      root.setProperty('--cream', p[0]);
      root.setProperty('--buttercream', p[1]);
      root.setProperty('--sage', p[2]);
      root.setProperty('--blush', p[3]);
      root.setProperty('--lavender', p[4]);
    }
    root.setProperty('--serif',
      `"${t.headingFont}", "Cormorant Garamond", Georgia, serif`);
  }, [t.palette, t.headingFont]);

  const parseHash = () => {
    const h = window.location.hash.replace('#','');
    const [step, kind] = h.split(':');
    return {
      step: SCREENS.find(s => s.id === step)?.id || 'dashboard',
      kind: kind === 'bingo' ? 'bingo' : 'trivia',
    };
  };
  const [{ step, kind }, set] = React.useState(parseHash);
  React.useEffect(() => { window.location.hash = `${step}:${kind}`; }, [step, kind]);
  React.useEffect(() => {
    const onHash = () => set(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const goto = (next, nextKind) => set({ step: next, kind: nextKind || kind });

  return (
    <div className="app">
      <main className="screen" data-screen-label={`${SCREENS.find(s=>s.id===step)?.label}${step==='live'?' · '+kind:''}`}>
        {step === 'welcome' && (
          <Dashboard state="empty"
            onSetAvailability={() => goto('availability')} />
        )}
        {step === 'availability' && (
          <Availability onBack={() => goto('dashboard')} onSave={() => goto('dashboard')} />
        )}
        {step === 'dashboard' && (
          <Dashboard state="active" onOpenSession={(k) => goto('lobby', k)} />
        )}
        {step === 'partners' && (
          <PartnerHomes onBack={() => goto('dashboard')} />
        )}
        {step === 'calendar' && (
          <Calendar onBack={() => goto('dashboard')}
                    onOpenSession={(k) => goto('lobby', k)} />
        )}
        {step === 'lobby' && (
          <Lobby mode={kind}
                 onStart={() => goto('live')}
                 onBack={() => goto('dashboard')} />
        )}
        {step === 'live' && (
          <InCall mode={kind}
                  audioIsolation={t.audioIsolation}
                  onEnd={() => goto('recap')} />
        )}
        {step === 'recap' && (
          <Recap mode={kind}
                 onHome={() => goto('dashboard')}
                 onScheduleNext={() => goto('dashboard')} />
        )}
      </main>

      <DemoChip step={step} kind={kind}
                setStep={(s) => goto(s)}
                setKind={(k) => set(prev => ({ ...prev, kind:k }))} />

      <TweaksPanel title="Kindred tweaks">
        <TweakSection label="Palette" />
        <TweakColor label="Palette" value={t.palette}
          options={[PALETTES.warmCream, PALETTES.morning, PALETTES.meadow, PALETTES.lavender]}
          onChange={(v) => setTweak('palette', v)} />

        <TweakSection label="Type" />
        <TweakSelect label="Display font" value={t.headingFont}
          options={['Newsreader','Cormorant Garamond','DM Serif Display','Playfair Display']}
          onChange={(v) => setTweak('headingFont', v)} />

        <TweakSection label="Game rules" />
        <TweakToggle label="Mute other room during trivia thinking time" value={t.audioIsolation}
          onChange={(v) => setTweak('audioIsolation', v)} />
      </TweaksPanel>
    </div>
  );
}

function DemoChip({ step, kind, setStep, setKind }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position:'fixed', left:16, bottom:16, zIndex:100,
                  fontFamily:'var(--sans)' }}>
      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:0,
                      background:'rgba(42,33,28,.94)', color:'var(--cream)',
                      borderRadius:14, padding:6, minWidth:240,
                      boxShadow:'0 16px 40px -10px rgba(0,0,0,.4)',
                      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
          <div style={{ padding:'10px 12px 6px', fontSize:10, letterSpacing:'.14em',
                         textTransform:'uppercase', color:'rgba(250,245,234,.5)' }}>
            jump to screen
          </div>
          {SCREENS.map((s, i) => (
            <button key={s.id} onClick={() => { setStep(s.id); setOpen(false); }}
              style={{ all:'unset', cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                       padding:'10px 12px', borderRadius:8, width:'100%', boxSizing:'border-box',
                       fontSize:13, background: step===s.id?'rgba(255,255,255,.1)':'transparent' }}>
              <span style={{ fontSize:10, opacity:.5, width:18, fontFamily:'var(--sans)' }}>{String(i+1).padStart(2,'0')}</span>
              <span style={{ flex:1 }}>{s.label}</span>
              {step===s.id && <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--buttercream)' }} />}
            </button>
          ))}
          <div style={{ borderTop:'1px solid rgba(250,245,234,.15)', margin:'6px 0' }} />
          <div style={{ padding:'10px 12px 6px', fontSize:10, letterSpacing:'.14em',
                         textTransform:'uppercase', color:'rgba(250,245,234,.5)' }}>
            preview live as
          </div>
          <div style={{ display:'flex', gap:6, padding:'0 8px 8px' }}>
            {['trivia','bingo'].map(k => (
              <button key={k} onClick={() => setKind(k)}
                style={{ all:'unset', cursor:'pointer', flex:1, padding:'8px 12px', borderRadius:8,
                          fontSize:12, textTransform:'capitalize', textAlign:'center',
                          background: kind===k?'rgba(255,255,255,.15)':'transparent',
                          color: kind===k?'var(--cream)':'rgba(250,245,234,.6)' }}>
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        style={{ all:'unset', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:10,
                 padding:'10px 14px', borderRadius:999, background:'rgba(42,33,28,.94)', color:'var(--cream)',
                 fontSize:11, fontFamily:'var(--sans)', letterSpacing:'.14em', textTransform:'uppercase',
                 fontWeight:500, boxShadow:'0 8px 24px -8px rgba(0,0,0,.3)' }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--buttercream)' }} />
        Demo · {SCREENS.find(s=>s.id===step)?.label}
        <span style={{ opacity:.5, transform:open?'rotate(180deg)':'none', display:'inline-block' }}>▾</span>
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
