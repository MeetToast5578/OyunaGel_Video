import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Bg, C, Chip, Confetti, Cursor, Eyebrow, GAMES, GameCard, IN, Icon, LEVEL_BG, Ripple, SG, SPORT, Words, arena, Avatar, lerp, pathAt, sp } from './lib'
import { DETAIL } from './cues'

// ---------------------------------------------------------------- 4 · pick your sport
export const Sports: React.FC = () => {
  const f = useCurrentFrame()
  const panels = [
    { s: 'football' as const, img: 'inter-arena' },
    { s: 'basketball' as const, img: 'suraxani-basket-zali' },
    { s: 'tennis' as const, img: 'xezer-tennis-klubu' },
  ]
  const exit = lerp(f, [164, 180], [0, 1])
  return (
    <AbsoluteFill>
      <Bg variant="night" />
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 1 - exit }}>
        <Words size={104} words={['İdmanını', { t: 'seç.', c: C.accent }]} stagger={5} />
      </div>
      <AbsoluteFill style={{ perspective: 1800 }}>
        {panels.map((p, i) => {
          const d = 15 + i * 15
          const s = sp(f, d, 11, 200, 0.7)
          const x = 140 + i * 560
          return (
            <div key={p.s} style={{ position: 'absolute', left: x, top: 290, width: 520, height: 600, borderRadius: 28, overflow: 'hidden', opacity: Math.min(1, s * 3) * (1 - exit),
              transform: `translateY(${(1 - s) * 260 + exit * (i - 1) * 40}px) rotateX(${(1 - s) * 50}deg) scale(${1.25 - 0.25 * s - exit * 0.15}) rotateY(${(i - 1) * exit * 25}deg)`,
              boxShadow: '0 40px 80px rgba(0,0,0,.5)', backgroundImage: `url(${arena(p.img)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,0,58,.05) 30%, rgba(11,0,58,.92) 100%)' }} />
              <div style={{ position: 'absolute', left: 40, bottom: 40, color: '#fff' }}>
                <div style={{ fontSize: 96, transform: `scale(${sp(f, d + 6, 9, 220, 0.5)})`, transformOrigin: 'left bottom' }}>{SPORT[p.s][0]}</div>
                <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 72, letterSpacing: '-0.03em', marginTop: 8 }}>{SPORT[p.s][1]}</div>
              </div>
            </div>
          )
        })}
      </AbsoluteFill>
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, opacity: 1 - exit }}>
        {(['Başlanğıc', 'Orta səviyyə', 'Yüksək'] as const).map((l, i) => {
          const s = sp(f, 90 + i * 6, 10, 220, 0.5)
          return <div key={l} style={{ transform: `scale(${s})` }}><Chip bg={LEVEL_BG[l]} size={26}>{l}</Chip></div>
        })}
        <div style={{ fontFamily: SG, fontWeight: 600, fontSize: 34, color: '#fff', marginLeft: 14, opacity: lerp(f, [110, 122], [0, 1]) }}>Hər səviyyəyə yer var.</div>
      </div>
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------- 5 · card wall, then one game up close
export const Wall: React.FC = () => {
  const f = useCurrentFrame()
  const d = f - DETAIL.start
  const wallOut = lerp(f, [96, 124], [0, 1], (t) => t * t)
  const cards = Array.from({ length: 36 }, (_, i) => GAMES[(i * 5 + Math.floor(i / 6)) % GAMES.length])
  return (
    <AbsoluteFill>
      <Bg variant="deep" />
      {f < 126 && (
        <AbsoluteFill style={{ perspective: 1600, opacity: 1 - wallOut }}>
          <div style={{ position: 'absolute', left: 960, top: 540, width: 6 * 340 + 5 * 36, display: 'flex', flexWrap: 'wrap', gap: 36,
            transform: `translate(-50%,-50%) rotateX(${48 - wallOut * 30}deg) rotateZ(-26deg) translateY(${lerp(f, [0, 124], [420, -420], (t) => t)}px) scale(${1 + wallOut * 1.6})` }}>
            {cards.map((g, i) => {
              const s = sp(f, (i % 6) * 2 + Math.floor(i / 6) * 2, 14, 140, 0.7)
              return <div key={i} style={{ transform: `translateZ(${(1 - s) * -400}px)`, opacity: s }}><GameCard g={g} /></div>
            })}
          </div>
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(11,0,58,.55) 0%, rgba(11,0,58,.2) 60%, rgba(11,0,58,.6) 100%)' }} />
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Words size={124} words={['Bax.', { t: 'Seç.', c: C.accent }, 'Oyna.']} delay={10} stagger={12} style={{ textShadow: '0 10px 40px rgba(11,0,58,.8)' }} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {d >= -6 && <Detail d={d} />}
    </AbsoluteFill>
  )
}

const Detail: React.FC<{ d: number }> = ({ d }) => {
  const g = GAMES[0]
  const enter = sp(d, 0, 15, 110, 0.8)
  const joined = d >= DETAIL.join - DETAIL.start
  const count = Math.round(lerp(d, [8, 34], [0, 7], (t) => t)) + (joined ? 1 : 0)
  const btn = { x: 1380, y: 736 }
  const cur = pathAt(d, [[40, 1900, 1100], [72, btn.x + 40, btn.y + 10], [78, btn.x + 40, btn.y + 10], [110, 1700, 1000]])
  const J = DETAIL.join - DETAIL.start
  return (
    <AbsoluteFill style={{ opacity: enter, transform: `scale(${0.9 + 0.1 * enter})` }}>
      <div style={{ position: 'absolute', left: 200, top: 70 }}>
        <Words size={72} words={['Bir', { t: 'kliklə', c: C.accent }, 'qoşul.']} delay={4} stagger={5} />
      </div>
      {/* big game card */}
      <div style={{ position: 'absolute', left: 200, top: 210, width: 780, borderRadius: 28, overflow: 'hidden', background: '#fff', boxShadow: '0 50px 100px rgba(5,3,15,.5)', transform: `translateX(${(1 - enter) * -120}px)` }}>
        <div style={{ height: 400, backgroundImage: `url(${arena(g.img)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', transform: `scale(${1.15 - 0.15 * enter})` }}>
          <div style={{ position: 'absolute', top: 20, left: 20 }}><Chip bg="rgba(255,255,255,.92)" color="#323232" size={18}>⚽ Futbol</Chip></div>
          <div style={{ position: 'absolute', top: 20, right: 20 }}><Chip bg={C.accent} size={18}>Orta səviyyə</Chip></div>
        </div>
        <div style={{ padding: '34px 40px 40px', fontFamily: IN, color: C.ink }}>
          <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 64, letterSpacing: '-0.03em', color: '#11111a' }}>{g.title}</div>
          <div style={{ display: 'flex', gap: 30, fontSize: 24, marginTop: 14, color: C.text }}>
            {[[Icon.cal(24), g.date], [Icon.clock(24), g.time], [Icon.pin(24), `${g.venue}, ${g.district}`]].map(([ic, t], i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: lerp(d, [14 + i * 5, 22 + i * 5], [0, 1]) }}>{ic}{t}</span>
            ))}
          </div>
        </div>
      </div>
      {/* participants panel */}
      <div style={{ position: 'absolute', left: 1040, top: 210, width: 680, background: '#fff', borderRadius: 28, padding: 40, boxShadow: '0 50px 100px rgba(5,3,15,.5)', fontFamily: IN, color: C.ink, transform: `translateX(${(1 - enter) * 160}px)` }}>
        <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '.08em', color: C.text }}>İŞTİRAKÇILAR</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
          <span style={{ fontFamily: SG, fontWeight: 700, fontSize: 96, color: joined ? C.primary : '#11111a', transform: `scale(${joined ? 1 + 0.25 * Math.max(0, 1 - (d - J) / 10) : 1})`, display: 'inline-block' }}>{count}</span>
          <span style={{ fontSize: 30, color: C.text }}>/ 10 iştirakçı</span>
        </div>
        <div style={{ height: 14, borderRadius: 9, background: '#eef0e8', marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${count * 10}%`, background: C.success, borderRadius: 9 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 92px)', gap: 22, marginTop: 34 }}>
          {Array.from({ length: 10 }, (_, i) => {
            if (i < 7) return <div key={i} style={{ transform: `scale(${sp(d, 12 + i * 3, 10, 200, 0.5)})` }}><Avatar initials={['NB', 'KƏ', 'YS', 'SV', 'NH', 'AQ', 'TH'][i]} size={92} i={i} /></div>
            if (i === 7 && joined) {
              const s = sp(d, J, 8, 220, 0.5)
              return <div key={i} style={{ transform: `scale(${s})` }}><Avatar initials="SƏN" size={92} color={C.accent} ring="#fff" /></div>
            }
            const pulse = 1 + Math.max(0, Math.sin(d / 5)) * 0.05
            return <div key={i} style={{ width: 92, height: 92, borderRadius: '50%', border: '3px dashed #c9c6e6', transform: `scale(${pulse})` }} />
          })}
        </div>
        <div style={{ marginTop: 36, height: 84, borderRadius: 16, background: joined ? C.success : C.primary, color: '#fff', fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transform: `scale(${d >= J - 2 && d < J + 4 ? 0.96 : 1})` }}>
          {joined ? '✓ Qoşuldun! · 2 yer qalıb' : 'Qoşul · 3 yer qalıb →'}
        </div>
      </div>
      <Ripple x={btn.x} y={btn.y} at={J} color="#fff" />
      <Confetti x={1354} y={612} at={J + 1} n={40} spread={0.8} />
      {d > 38 && d < 112 && <Cursor x={cur.x} y={cur.y} down={d >= J - 2 && d < J + 3} />}
    </AbsoluteFill>
  )
}

export { Eyebrow }
