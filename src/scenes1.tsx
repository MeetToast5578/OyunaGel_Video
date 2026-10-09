import React from 'react'
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion'
import { measureText } from '@remotion/layout-utils'
import { Bg, C, Eyebrow, GAMES, Logo, SG, Ticket, Words, Avatar, Browser, lerp, sp, IN } from './lib'

// ---------------------------------------------------------------- 1 · cold open (bars 0-3)
export const Cold: React.FC = () => {
  const f = useCurrentFrame()
  const out = (a: number) => ({ opacity: lerp(f, [a, a + 8], [1, 0]), transform: `translateY(${lerp(f, [a, a + 8], [0, -70])}px)` })
  // The row of 10 player slots: 7 taken, 3 open; the last open slot becomes the logo dot.
  const R = 120, G = 26, row = 10 * R + 9 * G, x0 = (1920 - row) / 2, y0 = 610
  const grow = lerp(f, [222, 240], [1, 46], (t) => t * t * t)
  const lastX = x0 + 9 * (R + G) + R / 2, lastY = y0 + R / 2
  const cx = lerp(f, [222, 240], [lastX, 960], (t) => t * t), cy = lerp(f, [222, 240], [lastY, 540], (t) => t * t)
  return (
    <AbsoluteFill>
      <Bg variant="night" />
      {f < 60 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...out(52) }}>
          <Words size={170} words={['Cümə,', { t: 'saat 20:00.', c: C.accent }]} stagger={15} />
        </AbsoluteFill>
      )}
      {f >= 60 && f < 120 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', ...out(112) }}>
          <Words size={112} words={['Futbol', 'oynamaq', 'istəyirsən.']} delay={60} stagger={10} />
        </AbsoluteFill>
      )}
      {f >= 120 && (
        <AbsoluteFill style={{ opacity: lerp(f, [214, 224], [1, 0]) }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: lerp(f, [150, 170], [400, 250]), display: 'flex', justifyContent: 'center' }}>
            <Words size={120} words={['Amma', { t: '3 oyunçu', c: C.accent }, 'çatmır.']} delay={120} stagger={15} />
          </div>
        </AbsoluteFill>
      )}
      {f >= 160 && Array.from({ length: 10 }, (_, i) => {
        const taken = i < 7
        const s = sp(f, 165 + (taken ? i * 3 : 7 * 3 + (i - 7) * 3), 11, 180, 0.5)
        const pulse = taken ? 1 : 1 + Math.max(0, Math.sin((f - 190) / 5)) * 0.05 * (f > 190 ? 1 : 0)
        const isLast = i === 9
        const glow = isLast ? lerp(f, [200, 210], [0, 1]) : 0
        if (isLast && f >= 222) return null
        return (
          <div key={i} style={{ position: 'absolute', left: x0 + i * (R + G), top: y0, width: R, height: R, transform: `scale(${s * pulse})`, opacity: lerp(f, [214, 224], [1, isLast ? 1 : 0]) }}>
            {taken
              ? <Avatar initials={['NB', 'KƏ', 'YS', 'SV', 'NH', 'AQ', 'TH'][i]} size={R} i={i} ring="#07051a" />
              : <div style={{ width: R, height: R, borderRadius: '50%', border: `4px dashed rgba(255,255,255,${0.5 - glow * 0.5})`, background: `rgba(232,163,61,${glow})`, boxShadow: glow ? `0 0 ${60 * glow}px rgba(232,163,61,.8)` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: SG, fontWeight: 700, fontSize: 46 }}>{glow > 0.5 ? '?' : ''}</div>}
          </div>
        )
      })}
      {f >= 222 && <div style={{ position: 'absolute', left: cx - R / 2, top: cy - R / 2, width: R, height: R, borderRadius: '50%', background: C.accent, transform: `scale(${grow})` }} />}
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------- 2 · logo reveal (drop)
export const LogoReveal: React.FC = () => {
  const f = useCurrentFrame()
  const size = 230
  const textW = measureText({ text: 'OyunaGəl', fontFamily: SG, fontSize: size, fontWeight: '700', letterSpacing: '-0.03em' }).width
  const dot = size * 0.24
  const shrink = lerp(f, [0, 20], [46 * 120 / dot, 1], (t) => 1 - Math.pow(1 - t, 3))
  const reveal = sp(f, 20, 16, 120, 0.8)
  const exit = lerp(f, [104, 120], [1, 0])
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${lerp(f, [20, 120], [1, 1.08]) * (1 + (1 - exit) * 0.4)})`, opacity: exit }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: dot, height: dot, borderRadius: '50%', background: C.accent, transform: `scale(${shrink})`, flexShrink: 0, zIndex: 2 }} />
          <div style={{ width: (textW + size * 0.16) * reveal, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontFamily: SG, fontWeight: 700, fontSize: size, letterSpacing: '-0.03em', color: '#fff', paddingLeft: size * 0.16, lineHeight: 1.25 }}>OyunaGəl</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Words size={58} weight={500} words={['Bakıda', 'oyun', 'tap.', { t: 'Elə', c: C.accent }, { t: 'bu', c: C.accent }, { t: 'axşam.', c: C.accent }]} delay={48} stagger={5} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#fff', opacity: lerp(f, [0, 5], [0.0, 0]) }} />
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------- 3 · hero in 3D with flying tickets
export const Hero: React.FC = () => {
  const f = useCurrentFrame()
  const enter = sp(f, 0, 18, 70, 1)
  const W = 1240, H = 780
  const scroll = lerp(f, [70, 220], [0, -620])
  const tickets = [
    { g: GAMES[0], x: 1430, y: 215, z: 160, d: 40, r: -6 },
    { g: GAMES[9], x: 1560, y: 690, z: 260, d: 55, r: 5 },
    { g: GAMES[2], x: 1120, y: 860, z: 220, d: 70, r: -3 },
  ]
  return (
    <AbsoluteFill>
      <Bg variant="deep" />
      <div style={{ position: 'absolute', left: 110, top: 300, width: 720 }}>
        <Eyebrow delay={4}>BÜTÜN AÇIQ OYUNLAR</Eyebrow>
        <Words size={84} words={['Bakının', 'bütün', '\n', 'açıq', { t: 'oyunları.', c: C.accent }]} delay={8} stagger={5} style={{ marginTop: 18 }} />
        <div style={{ marginTop: 26 }}><Words size={34} weight={500} color="rgba(255,255,255,.75)" words={['Bu', 'gün,', 'sabah,', 'bütün', 'həftə.']} delay={40} stagger={4} /></div>
      </div>
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: 'absolute', left: 1240 - W / 2 + 190, top: 560 - H / 2, transformStyle: 'preserve-3d',
          transform: `translateY(${(1 - enter) * 900}px) rotateX(${lerp(f, [0, 240], [26, 12])}deg) rotateY(${lerp(f, [0, 240], [-30, -18])}deg) rotateZ(${lerp(f, [0, 240], [7, 3])}deg) scale(${lerp(f, [0, 240], [0.86, 0.94])})` }}>
          <Browser w={W} h={H}>
            <Img src={staticFile('shots/d_home_full.jpg')} style={{ width: W, transform: `translateY(${scroll}px)` }} />
          </Browser>
        </div>
        {tickets.map(({ g, x, y, z, d, r }, i) => {
          const s = sp(f, d, 12, 120, 0.8)
          const bob = Math.sin((f + i * 20) / 18) * 10
          return (
            <div key={i} style={{ position: 'absolute', left: x - 235, top: y - 120, opacity: Math.min(1, s * 2),
              transform: `translate3d(${(1 - s) * -260}px, ${(1 - s) * 140 + bob}px, ${z * s}px) rotate(${r * s}deg) scale(${0.55 + 0.45 * s})` }}>
              <Ticket g={g} w={430} />
            </div>
          )
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

export { IN }
