// Bingo — designed for the BIG SCREEN.
// One big called ball. One BIG card for our home, partner's card small.
// "BINGO!" button for facilitator to claim a win on behalf of the room.

const BINGO_LETTERS = ['B','I','N','G','O'];
const BINGO_COLORS  = {
  B:'var(--peach)', I:'var(--sage)', N:'var(--lavender)', G:'var(--blush)', O:'var(--buttercream)',
};
const BINGO_RANGES = { B:[1,15], I:[16,30], N:[31,45], G:[46,60], O:[61,75] };

// Pre-generate the room's bingo card (one shared 5x5 per home, FREE in middle).
function genCard(seed) {
  const card = [];
  for (let col = 0; col < 5; col++) {
    const L = BINGO_LETTERS[col];
    const [lo, hi] = BINGO_RANGES[L];
    const pool = [];
    for (let n = lo; n <= hi; n++) pool.push(n);
    // pseudo-random per seed
    const picks = [];
    let s = seed + col*97;
    while (picks.length < 5) {
      s = (s * 9301 + 49297) % 233280;
      const i = Math.floor((s / 233280) * pool.length);
      picks.push(pool.splice(i, 1)[0]);
    }
    card.push(picks);
  }
  return card;
}

const OUR_CARD   = genCard(42);
const THEIR_CARD = genCard(73);

function BingoGame() {
  const [called, setCalled] = React.useState(['B-4','B-12','I-22','I-19','N-44','G-58','O-71','I-27','N-38']);
  const [current, setCurrent] = React.useState('N-38');
  const [drawing, setDrawing] = React.useState(false);
  // Which cells our facilitator has dabbed (residents call out, facilitator clicks)
  const [dabbed, setDabbed] = React.useState(new Set(['B-4','I-22','I-19','N-44','G-58','I-27','N-38']));

  const calledSet = React.useMemo(() => new Set(called), [called]);

  const draw = () => {
    if (drawing) return;
    setDrawing(true);
    let ticks = 0;
    const id = setInterval(() => {
      const L = BINGO_LETTERS[Math.floor(Math.random()*5)];
      const [lo, hi] = BINGO_RANGES[L];
      const n = lo + Math.floor(Math.random()*(hi-lo+1));
      setCurrent(`${L}-${n}`);
      ticks++;
      if (ticks > 12) {
        clearInterval(id);
        let pick, tries=0;
        do {
          const L = BINGO_LETTERS[Math.floor(Math.random()*5)];
          const [lo, hi] = BINGO_RANGES[L];
          const n = lo + Math.floor(Math.random()*(hi-lo+1));
          pick = `${L}-${n}`;
          tries++;
        } while (calledSet.has(pick) && tries < 60);
        setCurrent(pick);
        setCalled(c => [pick, ...c]);
        setDrawing(false);
      }
    }, 80);
  };

  const dab = (key) => {
    // facilitator marks the cell on behalf of the room
    setDabbed(d => {
      const next = new Set(d);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const [letter, number] = current.split('-');

  return (
    <div style={{ height:'100%', display:'grid', gridTemplateColumns:'420px 1fr', gap:18, minHeight:0 }}>
      {/* LEFT: the big called ball + controls */}
      <div className="card" style={{
        position:'relative', overflow:'hidden', padding:'30px 32px 28px',
        display:'flex', flexDirection:'column', borderRadius:'var(--r-xl)',
        background:'linear-gradient(180deg, #FFFBEF 0%, #F9EFD3 100%)',
      }}>

        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div className="h-mono">now calling</div>
          <div style={{ fontSize:13, color:'var(--ink-2)' }}>{called.length} of 75</div>
        </div>

        {/* THE big number ball */}
        <div style={{ position:'relative', flex:1, display:'flex', flexDirection:'column',
                       alignItems:'center', justifyContent:'center', textAlign:'center', minHeight:280 }}>
          <div style={{
            width:300, height:300, borderRadius:'50%',
            background:BINGO_COLORS[letter],
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            boxShadow:'inset 0 -12px 32px rgba(42,33,28,.08), 0 24px 60px -22px rgba(42,33,28,.32)',
            transition: drawing ? 'transform .08s ease' : 'transform .4s ease',
            transform: drawing ? `scale(${1 + Math.random()*0.04})` : 'scale(1)',
          }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:60, lineHeight:.9, color:'var(--ink)' }}>{letter}</div>
            <div className="h-num" style={{ fontSize:170, color:'var(--ink)' }}>
              {number}
            </div>
          </div>
          <div className="h-display h-italic" style={{ fontSize:28, marginTop:18, color:'var(--ink-2)' }}>
            "{letter} — {numberInWords(number)}"
          </div>
        </div>

        {/* Recent calls strip */}
        <div style={{ position:'relative', marginTop:14 }}>
          <div className="h-mono" style={{ marginBottom:8 }}>previously called</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {called.slice(1, 9).map((c, i) => {
              const [L, n] = c.split('-');
              return (
                <div key={c+i} style={{
                  width:38, height:38, borderRadius:'50%', background:BINGO_COLORS[L],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  opacity: Math.max(0.35, 1 - i*0.1),
                }}>
                  <span style={{ fontFamily:'var(--serif)', fontSize:13, color:'var(--ink)' }}>{L}<span className="h-num" style={{ fontSize:14, marginLeft:1 }}>{n}</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={{ position:'relative', display:'flex', gap:10, alignItems:'center', marginTop:18 }}>
          <button className="btn btn-primary btn-xl" style={{ flex:1, fontSize:20 }}
                  onClick={draw} disabled={drawing}>
            {drawing ? 'Drawing…' : 'Call next number'}
          </button>
        </div>
      </div>

      {/* RIGHT: cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:14, minHeight:0 }}>
        {/* OUR CARD — big */}
        <div className="card" style={{ padding:'22px 24px', flex:1, display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div>
              <div className="h-mono">our card · sunrise manor</div>
              <div style={{ fontSize:13, color:'var(--ink-2)', marginTop:4 }}>
                Tap a number when your residents call it out · {dabbed.size}/24 marked
              </div>
            </div>
            <button onClick={() => alert("BINGO claimed! Carmen will see this on her side.")}
              style={{ all:'unset', cursor:'pointer', padding:'16px 36px', borderRadius:999,
                       background:'linear-gradient(135deg, var(--terracotta) 0%, #B85A45 100%)',
                       color:'#fff', fontFamily:'var(--serif)', fontSize:32, fontWeight:500,
                       boxShadow:'0 12px 28px -10px rgba(196,90,60,.5)' }}>
              BINGO!
            </button>
          </div>

          <BingoCard letters={BINGO_LETTERS} card={OUR_CARD} calledSet={calledSet}
                     dabbed={dabbed} onDab={dab} interactive />
        </div>

        {/* THEIR CARD — small mirror */}
        <div className="card" style={{ padding:'16px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <div className="h-mono">maplewood's card</div>
            <div style={{ fontSize:12, color:'var(--ink-3)' }}>they have 9 dabbed · 1 away from a row</div>
          </div>
          <BingoCard letters={BINGO_LETTERS} card={THEIR_CARD} calledSet={calledSet}
                     dabbed={new Set(['B-12','I-19','N-44','O-71','I-27'].filter(k => calledSet.has(k)))}
                     small />
        </div>
      </div>
    </div>
  );
}

function BingoCard({ letters, card, calledSet, dabbed, onDab, small, interactive }) {
  const cell = small ? 36 : 64;
  const fontN = small ? 16 : 28;
  const fontL = small ? 12 : 20;
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(5, ${cell}px)`,
                  gap: small?5:8, justifyContent:'center', flex:1, alignContent:'center' }}>
      {/* Header row */}
      {letters.map(L => (
        <div key={'h'+L} style={{ height: small?22:32, display:'flex', alignItems:'center',
                                   justifyContent:'center', fontFamily:'var(--serif)',
                                   fontSize: fontL, color: BINGO_COLORS[L], fontWeight:500 }}>
          {L}
        </div>
      ))}
      {/* Body */}
      {[0,1,2,3,4].map(row => (
        letters.map((L, col) => {
          const n = card[col][row];
          const isFree = row === 2 && col === 2;
          const key = `${L}-${n}`;
          const isDabbed = isFree || dabbed.has(key);
          const isCalled = calledSet.has(key);
          return (
            <button key={key} onClick={() => interactive && !isFree && onDab(key)}
              style={{ all:'unset', cursor: interactive?'pointer':'default',
                       width:cell, height:cell, borderRadius:'50%', position:'relative',
                       background: isFree ? 'var(--cream-2)'
                                  : isCalled ? '#FFF8E5' : 'transparent',
                       border: `1.5px solid ${isCalled ? BINGO_COLORS[L] : 'var(--line)'}`,
                       display:'flex', alignItems:'center', justifyContent:'center',
                       fontFamily:'var(--sans)', fontSize: fontN, fontWeight:500,
                       fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em',
                       color:'var(--ink)', transition:'all .15s ease' }}>
              {isFree ? <span style={{ fontSize: small?9:11, fontFamily:'var(--sans)',
                                        textTransform:'uppercase', letterSpacing:'.1em',
                                        color:'var(--ink-3)' }}>Free</span> : n}
              {isDabbed && !isFree && (
                <span style={{ position:'absolute', inset:'12%', borderRadius:'50%',
                                background:BINGO_COLORS[L], opacity:.55,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                fontFamily:'var(--sans)', fontWeight:500,
                                fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em',
                                fontSize: fontN, color:'var(--ink)' }}>
                  {n}
                </span>
              )}
            </button>
          );
        })
      ))}
    </div>
  );
}

function numberInWords(n) {
  n = Number(n);
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
                'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if (n < 20) return ones[n];
  const t = Math.floor(n/10), o = n%10;
  return o === 0 ? tens[t] : `${tens[t]}-${ones[o]}`;
}

Object.assign(window, { BingoGame });
