import React from 'react'
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion'
import QRCode from 'qrcode'
import { Avatar, Bg, C, Confetti, Cursor, GameCard, IN, Logo, Phone, Ripple, SG, SPORT, Words, lerp, pathAt, sp, type Game } from './lib'
import { CREATE as K } from './cues'

// ---------------------------------------------------------------- 6 · host a game
const NEW_GAME: Game = { title: 'Cümə gecəsi 7-yə-7', sport: 'football', level: 'Orta səviyyə', venue: 'Binəqədi Futbol Parkı', district: 'Binəqədi', date: 'Cüm, 9 Okt', time: '20:30', rel: 'Bu gün · 20:30', cur: 1, max: 14, host: 'Vüsal Salmanov', ini: 'VS', img: 'bineqedi-futbol-parki' }

const Label: React.FC<{ y: number; x?: number; children: React.ReactNode }> = ({ y, x = 48, children }) =>
  <div style={{ position: 'absolute', left: x, top: y, fontFamily: IN, fontWeight: 600, fontSize: 19, color: '#2b2b3a' }}>{children}</div>
const Field: React.FC<{ x: number; y: number; w: number; focus?: boolean; children: React.ReactNode }> = ({ x, y, w, focus, children }) =>
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: 66, borderRadius: 12, background: '#f4f3fd', border: `2px solid ${focus ? C.primary : '#e3e1f5'}`, display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: IN, fontSize: 22, color: C.ink, boxShadow: focus ? '0 0 0 5px rgba(53,37,205,.12)' : undefined }}>{children}</div>

const CUR: [number, number, number][] = [[20, 980, 980], [40, 182, 252], [46, 182, 252], [64, 300, 405], [112, 300, 405], [120, 330, 478], [126, 330, 478], [134, 686, 535], [141, 686, 535], [182, 420, 665], [222, 420, 665], [230, 685, 665], [236, 685, 665], [250, 470, 802], [262, 470, 802], [290, 760, 990]]

export const Create: React.FC = () => {
  const f = useCurrentFrame()
  const enter = sp(f, 0, 16, 90, 0.9)
  const typed = 'Binəq'.slice(0, Math.max(0, Math.min(5, Math.floor((f - K.typeStart) / K.typeStep) + 1)))
  const venueSet = f >= K.option
  const dropdown = f >= K.typeStart && f < K.option + 4
  const clockOpen = f >= K.time && f < K.clockEnd + 10
  const hour = lerp(f, [K.time + 4, K.time + 20], [0, 8]), minute = lerp(f, [K.time + 22, K.clockEnd], [0, 6])
  const timeSet = f >= K.clockEnd
  const players = 10 + K.plus.filter((p) => f >= p).length
  const levelSet = f >= K.level
  const published = f >= K.publish
  const ready = levelSet
  const cur = pathAt(f, CUR)
  const downAt = [K.sport, K.venue, K.option, K.time, ...K.plus, K.level, K.publish]
  const down = downAt.some((a) => f >= a - 2 && f < a + 2)
  const steps: [string, boolean][] = [['İdman növü', f >= K.sport], ['Meydança', venueSet], ['Saat', timeSet], ['Oyunçular', f >= K.plus[3]], ['Səviyyə', levelSet]]
  const fly = sp(f, K.publish + 12, 13, 90, 0.9)
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: 'absolute', left: 100, top: 200, width: 770 }}>
        <Words size={100} words={['Öz', 'oyununu', '\n', { t: 'yarat.', c: C.accent }]} delay={4} stagger={5} />
        <div style={{ marginTop: 22 }}><Words size={28} weight={500} color="rgba(255,255,255,.78)" words={['İdman,', 'meydança,', 'saat', '—', 'bir', 'neçə', 'saniyəyə', 'dərc', 'et.']} delay={30} stagger={3} /></div>
        <div style={{ marginTop: 44, opacity: lerp(f, [K.publish, K.publish + 10], [1, 0]) }}>
          {steps.map(([t, done], i) => {
            const s = sp(f, 40 + i * 4)
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14, opacity: s, transform: `translateX(${(1 - s) * -30}px)`, fontFamily: SG, fontWeight: 600, fontSize: 30, color: done ? '#fff' : 'rgba(255,255,255,.5)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, border: `3px solid ${done ? C.success : 'rgba(255,255,255,.35)'}`, background: done ? C.success : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b3', fontSize: 22 }}>{done ? <span style={{ color: '#fff' }}>✓</span> : ''}</div>{t}
              </div>
            )
          })}
        </div>
      </div>
      {published && (
        <div style={{ position: 'absolute', left: 1350 + (400 - 1350) * fly, top: 892 + (770 - 892) * fly, transform: `translate(-50%,-50%) scale(${0.2 + 0.8 * fly}) rotate(${-6 * fly}deg)`, zIndex: 5, opacity: Math.min(1, fly * 3) }}>
          <GameCard g={NEW_GAME} w={380} />
        </div>
      )}
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{ position: 'absolute', left: 880, top: 90, width: 940, height: 900, borderRadius: 28, background: '#fff', boxShadow: '0 60px 120px rgba(11,0,58,.5)',
          transform: `translateX(${(1 - enter) * 900}px) rotateY(${-10 + (1 - enter) * -20}deg) rotateX(3deg)`, transformOrigin: 'left center' }}>
          <div style={{ position: 'absolute', left: 48, top: 44, fontFamily: SG, fontWeight: 700, fontSize: 44, letterSpacing: '-0.03em', color: '#11111a' }}>Yeni Oyun Yarat</div>
          <div style={{ position: 'absolute', left: 48, top: 104, fontFamily: IN, fontSize: 20, color: C.text }}>İstədiyiniz idman növünü seçin və oyun təşkil edin.</div>
          <Label y={160}>İdman növü</Label>
          {(['football', 'tennis', 'basketball'] as const).map((s, i) => {
            const on = s === 'football' && f >= K.sport
            const pop = on ? 1 + 0.06 * Math.max(0, 1 - (f - K.sport) / 8) : 1
            return (
              <div key={s} style={{ position: 'absolute', left: 48 + i * 288, top: 192, width: 268, height: 120, borderRadius: 16, border: `2px solid ${on ? C.primary : '#e3e1f5'}`, background: on ? '#f1efff' : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, transform: `scale(${pop})`, fontFamily: IN, fontWeight: 700, fontSize: 22, color: C.ink }}>
                <span style={{ fontSize: 40 }}>{SPORT[s][0]}</span>{SPORT[s][1]}
              </div>
            )
          })}
          <Label y={340}>Meydança</Label>
          <Field x={48} y={372} w={844} focus={f >= K.venue && f < K.option + 4}>
            {venueSet ? <b style={{ fontWeight: 600 }}>Binəqədi Futbol Parkı — Binəqədi, Bakı</b> : f >= K.typeStart ? <span>{typed}<span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0 }}>|</span></span> : <span style={{ color: '#8a8899' }}>Meydança axtar və seç</span>}
          </Field>
          <Label y={470}>Tarix</Label>
          <Label y={470} x={480}>Saat</Label>
          <Field x={48} y={502} w={412}>09.10.2026</Field>
          <Field x={480} y={502} w={412} focus={clockOpen}>{timeSet ? <b style={{ fontWeight: 600 }}>20:30</b> : <span style={{ color: '#8a8899' }}>məs. 19:30</span>}</Field>
          <Label y={600}>Maksimum iştirakçı</Label>
          <Label y={600} x={480}>Oyun Səviyyəsi</Label>
          <div style={{ position: 'absolute', left: 48, top: 632, width: 412, height: 66, borderRadius: 12, border: '2px solid #e3e1f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontFamily: SG, fontWeight: 700, fontSize: 30, color: C.ink }}>
            <span style={{ color: C.primary, width: 40, textAlign: 'center' }}>–</span>
            <span style={{ transform: `scale(${1 + 0.25 * Math.max(0, ...K.plus.map((p) => (f >= p ? 1 - (f - p) / 6 : 0)))})` }}>{players}</span>
            <span style={{ color: C.primary, width: 40, textAlign: 'center' }}>+</span>
          </div>
          <div style={{ position: 'absolute', left: 480, top: 632, width: 412, height: 66, borderRadius: 12, border: '2px solid #e3e1f5', display: 'flex', overflow: 'hidden', fontFamily: IN, fontWeight: 600, fontSize: 19 }}>
            {['Başlanğıc', 'Orta', 'Yüksək'].map((l, i) => {
              const on = levelSet && i === 1
              return <div key={l} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.primary : '#fff', color: on ? '#fff' : C.ink, borderLeft: i ? '2px solid #e3e1f5' : undefined }}>{l}</div>
            })}
          </div>
          <div style={{ position: 'absolute', left: 48, top: 760, width: 844, height: 84, borderRadius: 16, background: published ? C.success : ready ? C.primary : '#9a92ea', color: '#fff', fontFamily: SG, fontWeight: 700, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f >= K.publish - 2 && f < K.publish + 3 ? 0.97 : 1})`, boxShadow: ready ? '0 14px 30px rgba(53,37,205,.35)' : undefined }}>
            {published ? '✓ Oyun dərc edildi!' : 'Oyunu dərc et'}
          </div>
          {dropdown && (
            <div style={{ position: 'absolute', left: 48, top: 446, width: 844, borderRadius: 14, background: '#fff', boxShadow: '0 24px 50px rgba(11,0,58,.22)', border: '1px solid #e3e1f5', overflow: 'hidden', fontFamily: IN, zIndex: 10, transform: `translateY(${(1 - sp(f, K.typeStart, 16, 200)) * -10}px)`, opacity: sp(f, K.typeStart, 16, 200) }}>
              {[['Binəqədi Futbol Parkı', 'Binəqədi · S. Naxçıvani küç. 33'], ['Inter Arena', 'Nərimanov · Ağa Nemətulla küç. 12'], ['Dərnəgül Mini Futbol', 'Binəqədi · Dərnəgül şossesi 91']].map(([n, a], i) => (
                <div key={n} style={{ padding: '14px 22px', background: i === 0 && f >= K.option - 8 ? '#f1efff' : '#fff', borderBottom: '1px solid #f0eff7' }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: C.ink }}>{n}</div><div style={{ fontSize: 16, color: C.text }}>{a}</div>
                </div>
              ))}
            </div>
          )}
          {clockOpen && (
            <div style={{ position: 'absolute', left: 546, top: 582, width: 300, height: 340, borderRadius: 22, background: C.deep, boxShadow: '0 30px 60px rgba(11,0,58,.4)', zIndex: 10, transform: `scale(${sp(f, K.time, 14, 220)})`, transformOrigin: 'top center', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 18 }}>
              <div style={{ width: 240, height: 240, borderRadius: 120, background: 'rgba(255,255,255,.08)', position: 'relative' }}>
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2
                  return <div key={i} style={{ position: 'absolute', left: 120 + Math.sin(a) * 96 - 14, top: 120 - Math.cos(a) * 96 - 12, width: 28, textAlign: 'center', color: 'rgba(255,255,255,.75)', fontFamily: IN, fontSize: 17 }}>{f < K.time + 22 ? (i === 0 ? 24 : i + 12) : String(i * 5).padStart(2, '0')}</div>
                })}
                <div style={{ position: 'absolute', left: 119, top: 30, width: 3, height: 90, background: C.accent, transformOrigin: 'bottom center', transform: `rotate(${(f < K.time + 22 ? hour / 12 : minute / 12) * 360}deg)` }} />
                <div style={{ position: 'absolute', left: 113, top: 114, width: 14, height: 14, borderRadius: 7, background: C.accent }} />
              </div>
              <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 12 }}>{String(12 + Math.round(hour)).padStart(2, '0')} : {String(Math.round(minute) * 5).padStart(2, '0')}</div>
            </div>
          )}
          {downAt.map((a) => <Ripple key={a} x={pathAt(a, CUR).x} y={pathAt(a, CUR).y} at={a} />)}
          <Confetti x={470} y={802} at={K.publish + 2} n={60} />
          {f >= 20 && <Cursor x={cur.x} y={cur.y} down={down} />}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------- 7 · phones
export const Phones: React.FC = () => {
  const f = useCurrentFrame()
  const W = 360, H = W * (844 / 390)
  const phones = [
    { img: 'm_games_full.jpg', h: 6000, x: -450, ry: 24, z: -180, d: 14 },
    { img: 'm_home_full.jpg', h: 6000, x: 0, ry: 0, z: 0, d: 4 },
    { img: 'm_detail_full.jpg', h: 4338, x: 450, ry: -24, z: -180, d: 24 },
  ]
  return (
    <AbsoluteFill>
      <Bg variant="deep" />
      <div style={{ position: 'absolute', top: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Words size={84} words={['Oyun', 'həmişə', { t: 'cibində.', c: C.accent }]} delay={2} stagger={4} />
      </div>
      <AbsoluteFill style={{ perspective: 2000 }}>
        <div style={{ position: 'absolute', left: 960, top: 200, transformStyle: 'preserve-3d', transform: `rotateY(${lerp(f, [0, 240], [-8, 8], (t) => t)}deg)` }}>
          {phones.map((p, i) => {
            const s = sp(f, p.d, 15, 90, 0.9)
            const imgH = (p.h / 1170) * W
            const scroll = lerp(f, [40 + i * 10, 225], [0, -(imgH - H) * (i === 1 ? 0.55 : 0.4)])
            return (
              <div key={i} style={{ position: 'absolute', left: p.x - (W + 28) / 2, top: 0, transform: `translateY(${(1 - s) * 1000}px) translateZ(${p.z}px) rotateY(${p.ry}deg)` }}>
                <Phone w={W}><Img src={staticFile(`shots/${p.img}`)} style={{ width: W, transform: `translateY(${scroll}px)` }} /></Phone>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------- 8 · stats (build-up)
export const Stats: React.FC = () => {
  const f = useCurrentFrame()
  const enter = sp(f, 0, 15, 110, 0.8)
  const zoom = lerp(f, [96, 120], [1, 1.5], (t) => t * t)
  const nums: [number, string][] = [[12, 'oynanılan oyun'], [4, 'təşkil edilən'], [7, 'qarşıdakı oyun']]
  const bars: [string, string, number][] = [['⚽', 'Futbol', 8], ['🎾', 'Tennis', 1], ['🏀', 'Basketbol', 4]]
  return (
    <AbsoluteFill>
      <Bg variant="deep" />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, opacity: lerp(f, [104, 120], [1, 0]) }}>
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Words size={88} words={['Bütün', 'oyunların', { t: 'bir', c: C.accent }, { t: 'yerdə.', c: C.accent }]} stagger={4} />
        </div>
        <div style={{ position: 'absolute', left: 290, top: 320, width: 1340, height: 560, borderRadius: 32, background: '#fff', boxShadow: '0 60px 120px rgba(5,3,15,.5)', display: 'flex', padding: 56, gap: 56, fontFamily: IN, color: C.ink, opacity: enter, transform: `translateY(${(1 - enter) * 120}px)` }}>
          <div style={{ width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '2px solid #f0eff7', paddingRight: 56 }}>
            <div style={{ transform: `scale(${sp(f, 8, 10, 200, 0.6)})` }}><Avatar initials="VS" size={170} color={C.primary} ring="#e9e7ff" /></div>
            <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 40, marginTop: 26 }}>Vüsal Salmanov</div>
            <div style={{ fontSize: 20, color: C.text, marginTop: 6 }}>Qeydiyyat: avqust 2026</div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 700, letterSpacing: '.08em', fontSize: 20, color: C.text }}>STATİSTİKA</div>
            <div style={{ display: 'flex', gap: 70, marginTop: 14 }}>
              {nums.map(([n, l], i) => (
                <div key={l}><div style={{ fontFamily: SG, fontWeight: 700, fontSize: 104, color: '#11111a', lineHeight: 1 }}>{Math.round(lerp(f, [12 + i * 6, 60 + i * 6], [0, n]))}</div><div style={{ fontSize: 22, color: C.text, marginTop: 6 }}>{l}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 40 }}>
              {bars.map(([e, l, n], i) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, fontSize: 24, fontWeight: 600 }}>
                  <span style={{ width: 190 }}>{e} {l}</span>
                  <div style={{ flex: 1, height: 14, borderRadius: 9, background: '#eef0e8', overflow: 'hidden' }}><div style={{ width: `${lerp(f, [30 + i * 6, 80 + i * 6], [0, n / 8]) * 100}%`, height: '100%', background: C.success, borderRadius: 9 }} /></div>
                  <span style={{ width: 30, textAlign: 'right' }}>{Math.round(lerp(f, [30 + i * 6, 80 + i * 6], [0, n]))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

// ---------------------------------------------------------------- 9 · outro with QR
const qr = QRCode.create('https://oyunagel.vercel.app/', { errorCorrectionLevel: 'H' })
const QR: React.FC<{ size: number }> = ({ size }) => {
  const n = qr.modules.size, cell = size / n
  let d = ''
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) d += `M${x * cell},${y * cell}h${cell}v${cell}h${-cell}z`
  const lg = size * 0.22
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} shapeRendering="crispEdges"><path d={d} fill={C.deep} /></svg>
      <div style={{ position: 'absolute', left: (size - lg) / 2, top: (size - lg) / 2, width: lg, height: lg, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: lg * 0.62, height: lg * 0.62, borderRadius: '50%', background: C.accent }} />
      </div>
    </div>
  )
}

export const Outro: React.FC = () => {
  const f = useCurrentFrame()
  const card = sp(f, 28, 14, 100, 0.9)
  return (
    <AbsoluteFill>
      <Bg />
      <div style={{ position: 'absolute', left: 120, top: 250, width: 1150 }}>
        <Words size={98} lineHeight={1.08} words={['Sevdiyin', 'idmanı', 'seç,', '\n', 'meydança', { t: 'tap,', c: C.accent }, 'oyuna', '\n', 'qoşul']} delay={4} stagger={4} />
        <div style={{ marginTop: 56, opacity: lerp(f, [56, 66], [0, 1]), transform: `translateY(${lerp(f, [56, 70], [30, 0])}px)` }}><Logo size={84} /></div>
      </div>
      <div style={{ position: 'absolute', left: 1290, top: 250, width: 490, padding: 44, borderRadius: 36, background: '#fff', boxShadow: '0 60px 120px rgba(11,0,58,.5)', display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: Math.min(1, card * 2), transform: `perspective(1600px) rotateY(${(1 - card) * 40}deg) translateX(${(1 - card) * 200}px)` }}>
        <QR size={402} />
        <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 36, color: C.ink, marginTop: 26 }}>Skan et, oyuna qoşul</div>
        <div style={{ fontFamily: IN, fontSize: 22, color: C.text, marginTop: 4 }}>Növbəti oyununu tap</div>
      </div>
      <AbsoluteFill style={{ background: '#fff', opacity: lerp(f, [0, 8], [0.85, 0]) }} />
      <AbsoluteFill style={{ background: '#05030f', opacity: lerp(f, [166, 180], [0, 1]) }} />
    </AbsoluteFill>
  )
}
