import React from 'react'
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from 'remotion'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'

export const C = {
  primary: '#3525cd', hover: '#2a1cb3', deep: '#1b1367', night: '#0b003a', ink: '#141b2b',
  accent: '#e8a33d', onAccent: '#5c3a0e', success: '#00d26a', successText: '#047a3f',
  page: '#fafafa', text: '#464555', track: '#e9edff', border: '#e4e4ee',
}
export const SG = "'Space Grotesk Variable', sans-serif"
export const IN = "'Inter Variable', sans-serif"
export const ease = Easing.bezier(0.2, 0.8, 0.2, 1)

/** Clamped, eased interpolate over frames. */
export const lerp = (f: number, i: [number, number], o: [number, number], e = ease) =>
  interpolate(f, i, o, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e })
export const sp = (f: number, delay = 0, damping = 14, stiffness = 140, mass = 0.7) =>
  spring({ frame: f - delay, fps: 30, config: { damping, stiffness, mass } })

// ------------------------------------------------------------------ backgrounds
export const Bg: React.FC<{ variant?: 'brand' | 'night' | 'deep' }> = ({ variant = 'brand' }) => {
  const f = useCurrentFrame()
  const base = variant === 'night'
    ? 'linear-gradient(160deg,#0d0a26 0%,#07051a 60%,#05030f 100%)'
    : variant === 'deep'
      ? 'linear-gradient(150deg,#241a9c 0%,#1b1367 55%,#0b003a 100%)'
      : 'linear-gradient(135deg,#3f2fe0 0%,#3525cd 35%,#2a1cb3 60%,#1b1367 100%)'
  const a = variant === 'night' ? 0.35 : 0.55
  return (
    <AbsoluteFill style={{ background: base, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 1400, height: 1400, borderRadius: '50%', left: -400 + Math.sin(f / 70) * 120, top: -600 + Math.cos(f / 90) * 80, background: `radial-gradient(circle, rgba(123,108,255,${a}), transparent 65%)` }} />
      <div style={{ position: 'absolute', width: 1200, height: 1200, borderRadius: '50%', right: -420 + Math.cos(f / 80) * 100, bottom: -620 + Math.sin(f / 60) * 90, background: `radial-gradient(circle, rgba(232,163,61,${a * 0.6}), transparent 65%)` }} />
      <div style={{ position: 'absolute', inset: -120, transform: `translate(${(f * 0.4) % 120}px, ${(f * 0.25) % 120}px)`, backgroundImage: 'linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.055) 1px,transparent 1px)', backgroundSize: '120px 120px', maskImage: 'radial-gradient(circle at 50% 50%, #000 25%, transparent 80%)' }} />
    </AbsoluteFill>
  )
}

// ------------------------------------------------------------------ kinetic type
type Word = string | { t: string; c?: string }
/** Words that rise and settle one after another. */
export const Words: React.FC<{ words: Word[]; delay?: number; stagger?: number; size: number; color?: string; weight?: number; style?: React.CSSProperties; lineHeight?: number }> =
  ({ words, delay = 0, stagger = 5, size, color = '#fff', weight = 700, style, lineHeight = 1.05 }) => {
    const f = useCurrentFrame()
    return (
      <div style={{ fontFamily: SG, fontWeight: weight, fontSize: size, letterSpacing: '-0.035em', lineHeight, color, display: 'flex', flexWrap: 'wrap', columnGap: size * 0.26, ...style }}>
        {words.map((w, i) => {
          if (w === '\n') return <div key={i} style={{ flexBasis: '100%', height: 0 }} />
          const s = sp(f, delay + i * stagger, 13, 160, 0.6)
          const t = typeof w === 'string' ? w : w.t
          return (
            <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
              <span style={{ display: 'inline-block', color: typeof w === 'string' ? undefined : w.c, transform: `translateY(${(1 - s) * 110}%) rotate(${(1 - s) * 6}deg)`, opacity: Math.min(1, s * 1.5) }}>{t}</span>
            </span>
          )
        })}
      </div>
    )
  }

export const Eyebrow: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const f = useCurrentFrame()
  const s = sp(f, delay)
  return <div style={{ fontFamily: SG, fontWeight: 600, fontSize: 24, letterSpacing: '0.2em', color: C.accent, opacity: s, transform: `translateX(${(1 - s) * -30}px)`, ...style }}>{children}</div>
}

// ------------------------------------------------------------------ UI pieces recreated from the app
export const Logo: React.FC<{ size: number; color?: string }> = ({ size, color = '#fff' }) => (
  <div style={{ fontFamily: SG, fontWeight: 700, fontSize: size, letterSpacing: '-0.03em', color, display: 'flex', alignItems: 'center', gap: size * 0.14 }}>
    <span style={{ width: size * 0.24, height: size * 0.24, borderRadius: '50%', background: C.accent, display: 'inline-block' }} />OyunaGəl
  </div>
)

const AV = ['#2f6b4f', '#e8a33d', '#8a5a3b', '#3d6a8a', '#c0443b', '#6b4fa0', '#1f7a8c']
export const Avatar: React.FC<{ initials: string; size: number; i?: number; color?: string; ring?: string }> = ({ initials, size, i = 0, color, ring = '#fff' }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color ?? AV[i % AV.length], color: '#fff', fontFamily: IN, fontWeight: 700, fontSize: size * 0.36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 ${Math.max(2, size * 0.05)}px ${ring}` }}>{initials}</div>
)

const Icon = {
  pin: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" /></svg>,
  cal: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2.2" /></svg>,
  clock: (s: number) => <svg width={s} height={s} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" /></svg>,
}
export { Icon }

export type Game = { title: string; sport: 'football' | 'basketball' | 'tennis'; level: 'Başlanğıc' | 'Orta səviyyə' | 'Yüksək'; venue: string; district: string; date: string; time: string; rel: string; cur: number; max: number; host: string; ini: string; img: string }
export const SPORT = { football: ['⚽', 'Futbol'], basketball: ['🏀', 'Basketbol'], tennis: ['🎾', 'Tennis'] } as const
export const LEVEL_BG = { 'Başlanğıc': '#4caf1a', 'Orta səviyyə': '#e8a33d', 'Yüksək': '#d64545' }

export const GAMES: Game[] = [
  { title: 'Cümə 5-ə-5', sport: 'football', level: 'Orta səviyyə', venue: 'Inter Arena', district: 'Nərimanov', date: 'Cüm, 9 Okt', time: '20:30', rel: 'Bu gün · 20:30', cur: 7, max: 10, host: 'Vaqif Şirinov', ini: 'VŞ', img: 'inter-arena' },
  { title: 'Yoldaşlıq oyunu', sport: 'basketball', level: 'Yüksək', venue: 'Sahil Sport Mərkəzi', district: 'Səbail', date: 'Cüm, 9 Okt', time: '13:00', rel: 'Bu gün · 13:00', cur: 4, max: 10, host: 'Ülvi Səfərov', ini: 'ÜS', img: 'sahil-sport-merkezi' },
  { title: 'Şənbə cütlük oyunu', sport: 'tennis', level: 'Başlanğıc', venue: 'Xəzər Tennis Klubu', district: 'Xəzər', date: 'Şən, 10 Okt', time: '15:00', rel: 'Sabah · 15:00', cur: 2, max: 4, host: 'Nigar Qasımova', ini: 'NQ', img: 'xezer-tennis-klubu' },
  { title: 'Axşam 6-ya-6', sport: 'football', level: 'Orta səviyyə', venue: 'Aku Arena', district: 'Nizami', date: 'Şən, 10 Okt', time: '19:00', rel: 'Sabah · 19:00', cur: 11, max: 12, host: 'Hüseyn Quliyev', ini: 'HQ', img: 'aku-arena' },
  { title: 'Həvəskar basketbol', sport: 'basketball', level: 'Başlanğıc', venue: 'Suraxanı Basket Zalı', district: 'Suraxanı', date: 'Şən, 10 Okt', time: '09:30', rel: 'Sabah · 09:30', cur: 2, max: 6, host: 'Cavid Babayev', ini: 'CB', img: 'suraxani-basket-zali' },
  { title: 'Günorta 5-ə-5', sport: 'football', level: 'Orta səviyyə', venue: 'Dərnəgül Mini Futbol', district: 'Binəqədi', date: 'Şən, 10 Okt', time: '13:00', rel: 'Sabah · 13:00', cur: 9, max: 10, host: 'Orxan Rəhimov', ini: 'OR', img: 'dernegul-mini-futbol' },
  { title: 'Tennis səhəri', sport: 'tennis', level: 'Yüksək', venue: 'Qaradağ Sport Hub', district: 'Qaradağ', date: 'Baz, 11 Okt', time: '10:00', rel: 'Bazar · 10:00', cur: 1, max: 2, host: 'Leyla Əliyeva', ini: 'LƏ', img: 'qaradag-sport-hub' },
  { title: 'Bazar 7-yə-7', sport: 'football', level: 'Başlanğıc', venue: '707 Stadium', district: 'Xətai', date: 'Baz, 11 Okt', time: '15:00', rel: 'Bazar · 15:00', cur: 5, max: 14, host: 'Rüfət Nəbiyev', ini: 'RN', img: '707-stadium' },
  { title: 'Axşam 4-ə-4', sport: 'basketball', level: 'Yüksək', venue: 'Sahil Sport Mərkəzi', district: 'Səbail', date: 'Şən, 10 Okt', time: '21:00', rel: 'Sabah · 21:00', cur: 5, max: 8, host: 'Nicat Bayramov', ini: 'NB', img: 'sahil-sport-merkezi' },
  { title: 'Futbol gecəsi', sport: 'football', level: 'Yüksək', venue: 'Binəqədi Futbol Parkı', district: 'Binəqədi', date: 'Cüm, 9 Okt', time: '22:00', rel: 'Bu gün · 22:00', cur: 9, max: 10, host: 'Toğrul Hüseynov', ini: 'TH', img: 'bineqedi-futbol-parki' },
  { title: 'Səhər oyunu', sport: 'football', level: 'Başlanğıc', venue: 'Sabunçu İdman Meydanı', district: 'Sabunçu', date: 'Baz, 11 Okt', time: '09:00', rel: 'Bazar · 09:00', cur: 3, max: 10, host: 'Aynur Quliyeva', ini: 'AQ', img: 'sabuncu-idman-meydani' },
  { title: 'Cütlük turniri', sport: 'tennis', level: 'Orta səviyyə', venue: 'Xəzər Tennis Klubu', district: 'Xəzər', date: 'Baz, 11 Okt', time: '17:00', rel: 'Bazar · 17:00', cur: 3, max: 4, host: 'Əli Əliyev', ini: 'ƏƏ', img: 'xezer-tennis-klubu' },
]
export const arena = (n: string) => staticFile(`arenas/${n}.png`)

export const Chip: React.FC<{ bg: string; color?: string; children: React.ReactNode; size?: number }> = ({ bg, color = '#fff', children, size = 13 }) => (
  <span style={{ background: bg, color, fontFamily: IN, fontWeight: 700, fontSize: size, padding: `${size * 0.35}px ${size * 0.8}px`, borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(0,0,0,.15)' }}>{children}</span>
)

/** The app's game card, rebuilt as a component so it can animate. */
export const GameCard: React.FC<{ g: Game; w?: number; fill?: number; style?: React.CSSProperties }> = ({ g, w = 340, fill = 1, style }) => {
  const k = w / 340
  const left = g.max - g.cur
  return (
    <div style={{ width: w, background: '#fff', borderRadius: 16 * k, overflow: 'hidden', boxShadow: '0 18px 40px rgba(11,0,58,.22)', fontFamily: IN, color: C.ink, ...style }}>
      <div style={{ height: 180 * k, backgroundImage: `url(${arena(g.img)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12 * k, right: 12 * k, display: 'flex', gap: 6 * k }}>
          <Chip bg={LEVEL_BG[g.level]} size={12 * k}>{g.level === 'Orta səviyyə' ? 'Orta' : g.level}</Chip>
          <Chip bg="rgba(255,255,255,.92)" color="#323232" size={12 * k}>{SPORT[g.sport][0]} {SPORT[g.sport][1]}</Chip>
        </div>
      </div>
      <div style={{ padding: `${18 * k}px ${20 * k}px ${20 * k}px` }}>
        <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 22 * k, letterSpacing: '-0.02em', color: '#11111a' }}>{g.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 * k, fontSize: 14 * k, color: C.text, marginTop: 8 * k }}>{Icon.pin(15 * k)}{g.venue}, {g.district}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 * k, fontSize: 14 * k, color: C.ink, marginTop: 8 * k }}>
          <span style={{ display: 'flex', gap: 5 * k, alignItems: 'center' }}>{Icon.cal(15 * k)}{g.date}</span>
          <span style={{ display: 'flex', gap: 5 * k, alignItems: 'center' }}>{Icon.clock(15 * k)}{g.time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 * k, fontWeight: 600, marginTop: 14 * k }}>
          <span>{g.cur}/{g.max} oyunçu</span><span style={{ color: left ? C.successText : C.text }}>{left ? `${left} yer qalıb` : 'Yer qalmayıb'}</span>
        </div>
        <div style={{ height: 6 * k, borderRadius: 9, background: C.track, marginTop: 7 * k, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(g.cur / g.max) * 100 * fill}%`, background: C.success, borderRadius: 9 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 * k }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 * k, fontSize: 13 * k }}><Avatar initials={g.ini} size={32 * k} color={C.primary} ring="transparent" />{g.host}</div>
          <div style={{ background: C.primary, color: '#fff', fontWeight: 700, fontSize: 15 * k, padding: `${10 * k}px ${22 * k}px`, borderRadius: 10 * k }}>Qoşul</div>
        </div>
      </div>
    </div>
  )
}

/** The glassy "ticket" from the home carousel. */
export const Ticket: React.FC<{ g: Game; w?: number; style?: React.CSSProperties }> = ({ g, w = 470, style }) => {
  const k = w / 470
  return (
    <div style={{ width: w, padding: 24 * k, borderRadius: 20 * k, background: 'linear-gradient(160deg, rgba(110,96,255,.92), rgba(62,46,214,.92))', border: '1px solid rgba(255,255,255,.28)', boxShadow: '0 30px 60px rgba(11,0,58,.45)', color: '#fff', fontFamily: IN, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ background: 'rgba(11,0,58,.4)', color: C.accent, fontWeight: 600, fontSize: 14 * k, padding: `${5 * k}px ${12 * k}px`, borderRadius: 99 }}>● {g.rel}</span>
        <Chip bg={C.accent} color={C.onAccent} size={14 * k}>{SPORT[g.sport][0]} {SPORT[g.sport][1]}</Chip>
      </div>
      <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 30 * k, marginTop: 14 * k }}>{g.title}</div>
      <div style={{ fontSize: 15 * k, opacity: 0.85, marginTop: 4 * k }}>{g.venue} · {g.district}, Bakı · {g.level}</div>
      <div style={{ marginTop: 12 * k, display: 'flex', alignItems: 'baseline', gap: 8 * k }}><b style={{ fontFamily: SG, fontSize: 40 * k }}>{g.cur}</b><span style={{ fontSize: 16 * k, opacity: 0.85 }}>/ {g.max} iştirakçı</span></div>
      <div style={{ height: 7 * k, background: 'rgba(255,255,255,.25)', borderRadius: 9, marginTop: 10 * k }}><div style={{ width: `${(g.cur / g.max) * 100}%`, height: '100%', background: C.accent, borderRadius: 9 }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 * k }}>
        <div style={{ display: 'flex' }}>{['NB', 'KƏ', 'YS', 'SV'].map((s, i) => <div key={s} style={{ marginLeft: i ? -8 * k : 0 }}><Avatar initials={s} size={38 * k} i={i} ring="#5a4bf0" /></div>)}</div>
        <div style={{ background: '#fff', color: C.primary, fontWeight: 700, fontSize: 16 * k, padding: `${11 * k}px ${34 * k}px`, borderRadius: 10 * k }}>Qoşul</div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ device frames
export const Browser: React.FC<{ w: number; h: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, h, children, style }) => (
  <div style={{ width: w, height: h, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 60px 120px rgba(11,0,58,.55), 0 0 0 1px rgba(255,255,255,.15)', ...style }}>
    <div style={{ height: 44, background: '#f1f1f6', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8, borderBottom: '1px solid #e4e4ee' }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <b key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
      <div style={{ margin: '0 auto', transform: 'translateX(-30px)', background: '#fff', border: '1px solid #e2e2ea', borderRadius: 8, padding: '5px 22px', display: 'flex', alignItems: 'center' }}><Logo size={15} color={C.ink} /></div>
    </div>
    <div style={{ position: 'relative', height: h - 44, overflow: 'hidden' }}>{children}</div>
  </div>
)

export const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const h = w * (844 / 390)
  return (
    <div style={{ width: w + 28, height: h + 28, padding: 14, borderRadius: 64, background: '#0d0b1e', boxShadow: '0 60px 120px rgba(5,3,15,.6), inset 0 0 0 2px #3a3655', ...style }}>
      <div style={{ width: w, height: h, borderRadius: 50, overflow: 'hidden', position: 'relative', background: '#fff' }}>
        {children}
        <div style={{ position: 'absolute', top: 11, left: w / 2 - 58, width: 116, height: 32, borderRadius: 20, background: '#0d0b1e' }} />
      </div>
    </div>
  )
}

export const Cursor: React.FC<{ x: number; y: number; down?: boolean }> = ({ x, y, down }) => (
  <div style={{ position: 'absolute', left: x - 6, top: y - 3, transform: `scale(${down ? 0.82 : 1})`, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.35))', zIndex: 50 }}>
    <svg width="40" height="40" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  </div>
)

/** Expanding ring on a click. */
export const Ripple: React.FC<{ x: number; y: number; at: number; color?: string }> = ({ x, y, at, color = C.accent }) => {
  const f = useCurrentFrame() - at
  if (f < 0 || f > 14) return null
  const s = f / 14
  return <div style={{ position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: '50%', border: `4px solid ${color}`, transform: `scale(${0.4 + s * 1.6})`, opacity: 1 - s, zIndex: 49 }} />
}

/** Cursor path through [frame, x, y] keyframes, eased between them. */
export const pathAt = (f: number, keys: [number, number, number][]) => {
  if (f <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] }
  for (let i = 1; i < keys.length; i++) {
    const [f1, x1, y1] = keys[i], [f0, x0, y0] = keys[i - 1]
    if (f <= f1) {
      const t = Easing.inOut(Easing.cubic)((f - f0) / (f1 - f0))
      return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }
    }
  }
  const l = keys[keys.length - 1]
  return { x: l[1], y: l[2] }
}

/** Deterministic confetti burst. */
export const Confetti: React.FC<{ x: number; y: number; at: number; n?: number; spread?: number }> = ({ x, y, at, n = 46, spread = 1 }) => {
  const f = useCurrentFrame() - at
  if (f < 0 || f > 60) return null
  const cols = [C.accent, '#fff', C.success, '#7b6cff', '#ff6b8b']
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const r = (Math.sin(i * 12.9898) * 43758.5453) % 1, r2 = (Math.sin(i * 78.233) * 12345.678) % 1
        const ang = (i / n) * Math.PI * 2 + r, v = (10 + Math.abs(r2) * 16) * spread
        const px = x + Math.cos(ang) * v * f, py = y + Math.sin(ang) * v * f * 0.8 + 0.45 * f * f
        return <div key={i} style={{ position: 'absolute', left: px, top: py, width: 10, height: i % 3 ? 16 : 10, borderRadius: i % 3 ? 2 : 5, background: cols[i % cols.length], transform: `rotate(${f * 14 + i * 40}deg)`, opacity: lerp(f, [40, 60], [1, 0]), zIndex: 60 }} />
      })}
    </>
  )
}

export const Img2 = Img
export { AbsoluteFill }
