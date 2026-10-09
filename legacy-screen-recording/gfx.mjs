// Renders frames, captions and the animated intro/outro for the OyunaGəl video.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const OUT = '/var/tmp/vid/gfx'
mkdirSync(OUT, { recursive: true })
const NM = '/root/BDA_Oyuna_Gel/node_modules/@fontsource-variable'
const font = (f) => `data:font/woff2;base64,${readFileSync(f).toString('base64')}`
const FONTS = `
@font-face{font-family:SG;src:url(${font(NM + '/space-grotesk/files/space-grotesk-latin-wght-normal.woff2')}) format('woff2');font-weight:300 700}
@font-face{font-family:SG;src:url(${font(NM + '/space-grotesk/files/space-grotesk-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:300 700;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:IN;src:url(${font(NM + '/inter/files/inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:IN;src:url(${font(NM + '/inter/files/inter-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
*{margin:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden}
body{font-family:IN,sans-serif;color:#fff}
.bg{position:absolute;inset:0;background:
  radial-gradient(900px 700px at 12% 8%, rgba(123,108,255,.55), transparent 65%),
  radial-gradient(800px 600px at 92% 95%, rgba(232,163,61,.28), transparent 65%),
  linear-gradient(135deg,#3525cd 0%,#2a1cb3 45%,#1b1367 100%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:120px 120px;mask-image:radial-gradient(circle at 50% 50%,#000 30%,transparent 85%)}
.logo{font-family:SG;font-weight:700;letter-spacing:-.02em;display:flex;align-items:center;gap:.12em}
.logo i{width:.26em;height:.26em;border-radius:50%;background:#e8a33d;display:inline-block}
`
// Layout of the browser window on the 1920×1080 canvas (content is the recorded 1536×864 clip).
const WIN = { x: 192, y: 176, w: 1536, h: 864, bar: 48 }
// Phone screen: recorded 390×844 viewport shown at 400×866.
const PH = { x: 300, y: 133, w: 400, h: 866, sb: 46 } // sb: status bar above the clip

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const shot = async (name, html, transparent = false) => {
  await page.setContent(`<style>${FONTS}</style>${html}`); await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `${OUT}/${name}.png`, omitBackground: transparent })
}

// Browser frame: everything except a rounded hole where the clip shows through.
await shot('frame_browser', `
<div id="all" style="position:absolute;inset:0">
  <div class="bg"></div><div class="grid"></div>
  <div style="position:absolute;left:${WIN.x}px;top:${WIN.y - WIN.bar}px;width:${WIN.w}px;height:${WIN.h + WIN.bar}px;border-radius:18px;box-shadow:0 40px 90px rgba(11,0,58,.55),0 0 0 1px rgba(255,255,255,.12);background:#f3f3f7"></div>
  <div style="position:absolute;left:${WIN.x}px;top:${WIN.y - WIN.bar}px;width:${WIN.w}px;height:${WIN.bar}px;display:flex;align-items:center;padding:0 20px;gap:9px">
    <b style="width:13px;height:13px;border-radius:50%;background:#ff5f57"></b><b style="width:13px;height:13px;border-radius:50%;background:#febc2e"></b><b style="width:13px;height:13px;border-radius:50%;background:#28c840"></b>
    <div style="margin:0 auto;transform:translateX(-30px);background:#fff;border:1px solid #e2e2ea;border-radius:9px;padding:6px 18px;font-size:15px;color:#464555;display:flex;gap:8px;align-items:center">
      <svg width="12" height="14" viewBox="0 0 12 14"><rect x="1" y="6" width="10" height="7.5" rx="1.5" fill="#706e80"/><path d="M3.3 6V4.2a2.7 2.7 0 0 1 5.4 0V6" stroke="#706e80" stroke-width="1.6" fill="none"/></svg>bda-next-six.vercel.app</div>
  </div>
</div>
<style>#all{mask-image:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><rect width='1920' height='1080' fill='white'/><rect x='${WIN.x}' y='${WIN.y}' width='${WIN.w}' height='${WIN.h}' rx='18' fill='black'/><rect x='${WIN.x}' y='${WIN.y}' width='${WIN.w}' height='40' fill='black'/></svg>`)}");mask-mode:luminance}</style>
`, true)

// Phone frame with side text.
await shot('frame_phone', `
<div id="all" style="position:absolute;inset:0">
  <div class="bg"></div><div class="grid"></div>
  <div style="position:absolute;left:${PH.x - 16}px;top:${PH.y - PH.sb - 16}px;width:${PH.w + 32}px;height:${PH.h + PH.sb + 32}px;border-radius:66px;background:#0d0b1e;box-shadow:0 50px 100px rgba(11,0,58,.6),inset 0 0 0 2px #3a3655"></div>
  <div style="position:absolute;left:${PH.x}px;top:${PH.y - PH.sb}px;width:${PH.w}px;height:${PH.sb + 30}px;border-radius:50px 50px 0 0;background:#fff;display:flex;justify-content:space-between;align-items:flex-start;padding:14px 34px 0 40px;color:#111;font:600 17px/20px IN">
    <span>9:41</span><span style="display:flex;gap:6px;align-items:center;height:20px"><svg width="18" height="11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#111"/><rect x="5" y="5" width="3" height="6" rx="1" fill="#111"/><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="#111"/><rect x="15" y="0" width="3" height="11" rx="1" fill="#111"/></svg><svg width="26" height="12"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="#111" opacity=".5"/><rect x="2.5" y="2.5" width="16" height="7" rx="1.5" fill="#111"/><rect x="24" y="4" width="1.6" height="4" rx=".8" fill="#111" opacity=".5"/></svg></span></div>
  <div style="position:absolute;left:${PH.x + PH.w / 2 - 60}px;top:${PH.y - PH.sb + 10}px;width:120px;height:32px;border-radius:20px;background:#0d0b1e;z-index:2"></div>
  <div style="position:absolute;left:840px;top:0;bottom:0;width:900px;display:flex;flex-direction:column;justify-content:center">
    <div style="font-family:SG;font-weight:600;color:#e8a33d;font-size:26px;letter-spacing:.14em">06 — ON THE GO</div>
    <div style="font-family:SG;font-weight:700;font-size:92px;line-height:1;letter-spacing:-.03em;margin-top:22px">Built for<br>your phone.</div>
    <div style="font-size:30px;line-height:1.45;color:rgba(255,255,255,.78);margin-top:30px;max-width:720px">Every screen is responsive, so players can find and join a game from the pitch side.</div>
  </div>
</div>
<style>#all{mask-image:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><rect width='1920' height='1080' fill='white'/><rect x='${PH.x}' y='${PH.y}' width='${PH.w}' height='${PH.h}' rx='50' fill='black'/><rect x='${PH.x}' y='${PH.y}' width='${PH.w}' height='60' fill='black'/></svg>`)}");mask-mode:luminance}</style>
`, true)

// Captions above the browser window.
const CAPS = [
  ['01 — DISCOVER', 'Find an open game in Baku, tonight'],
  ['02 — BROWSE', 'Every open game, filtered by sport in one tap'],
  ['03 — DETAILS', 'Venue, time, host and spots left at a glance'],
  ['04 — HOST', 'Create your own game in seconds'],
  ['05 — PROFILE', 'Your stats and your games in one place'],
]
for (const [i, [eyebrow, text]] of CAPS.entries()) {
  await shot(`cap${i + 1}`, `
  <div style="position:absolute;left:${WIN.x}px;top:22px;height:96px;display:flex;align-items:center;gap:26px">
    <div style="font-family:SG;font-weight:600;color:#e8a33d;font-size:22px;letter-spacing:.14em;white-space:nowrap">${eyebrow}</div>
    <div style="font-family:SG;font-weight:700;font-size:46px;letter-spacing:-.02em;white-space:nowrap">${text}</div>
  </div>`, true)
}

// Animated cards, recorded with the same screencast approach.
async function animate(name, html, seconds) {
  const dir = `${OUT}/${name}_frames`
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir)
  await page.setContent(`<style>${FONTS}</style>${html.replace(/animation-play-state:running/g, '')}`)
  await page.evaluate(() => document.fonts.ready)
  // Deterministic: pause every animation and step time manually, one screenshot per frame.
  const fps = 30, n = Math.round(seconds * fps)
  for (let f = 0; f < n; f++) {
    await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t }), (f / fps) * 1000)
    await page.screenshot({ path: `${dir}/${String(f).padStart(4, '0')}.png` })
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${dir}/%04d.png`, '-c:v', 'libx264', '-crf', '14', '-pix_fmt', 'yuv420p', `${OUT}/${name}.mp4`])
  console.log(name, n, 'frames')
}

const KF = `
@keyframes up{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes pop{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.06)}100%{transform:scale(1)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes drift{from{transform:scale(1.08)}to{transform:scale(1)}}
@keyframes bar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.a{animation:up .9s cubic-bezier(.2,.8,.2,1) both}
.chip{font-family:SG;font-weight:600;font-size:26px;padding:14px 26px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22)}
`
await animate('intro', `<style>${KF}</style>
<div class="bg" style="animation:drift 4.5s ease-out both"></div><div class="grid"></div>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
  <div class="a" style="animation-delay:.1s;font-family:SG;font-weight:600;font-size:24px;letter-spacing:.18em;color:#e8a33d">BAKU · OPEN SPORTS GAMES</div>
  <div class="logo" style="font-size:190px;margin-top:18px;animation:pop 1s cubic-bezier(.2,.8,.2,1) .35s both"><i></i>OyunaGəl</div>
  <div class="a" style="animation-delay:1.1s;font-family:SG;font-weight:500;font-size:46px;margin-top:22px;letter-spacing:-.01em">Pick a sport. Find a pitch. <span style="color:#e8a33d">Join the game.</span></div>
  <div class="a" style="animation-delay:1.7s;display:flex;gap:16px;margin-top:46px"><span class="chip">⚽ Football</span><span class="chip">🏀 Basketball</span><span class="chip">🎾 Tennis</span></div>
</div>`, 4.5)

await animate('outro', `<style>${KF}</style>
<div class="bg"></div><div class="grid"></div>
<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
  <div class="logo" style="font-size:150px;animation:pop .9s cubic-bezier(.2,.8,.2,1) .1s both"><i></i>OyunaGəl</div>
  <div class="a" style="animation-delay:.6s;font-family:SG;font-weight:500;font-size:44px;margin-top:14px">Azerbaijan's sports coordination platform</div>
  <div class="a" style="animation-delay:1.1s;margin-top:44px;font-family:SG;font-weight:700;font-size:40px;background:#e8a33d;color:#5c3a0e;padding:18px 40px;border-radius:16px">bda-next-six.vercel.app</div>
  <div class="a" style="animation-delay:1.7s;display:flex;gap:14px;margin-top:56px;font-size:22px">
    ${['Next.js 16', 'React 19', 'Payload CMS', 'PostgreSQL', 'Google sign-in', 'Vercel'].map((t) => `<span class="chip" style="font-size:22px;padding:10px 22px">${t}</span>`).join('')}
  </div>
</div>`, 5.5)

await browser.close()
writeFileSync(`${OUT}/layout.json`, JSON.stringify({ WIN, PH }))
