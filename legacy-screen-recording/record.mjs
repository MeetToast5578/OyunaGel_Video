// Records each scene of the OyunaGəl tour as a crisp CDP screencast, then turns it into a 30fps clip.
import { chromium } from '/opt/npm-tools/node_modules/playwright/index.mjs'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const BASE = 'http://localhost:3000'
const OUT = '/var/tmp/vid/clips'
mkdirSync(OUT, { recursive: true })
const only = process.argv[2]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Fake cursor + click ripple, since headless Chrome draws no pointer.
const CURSOR = `
addEventListener('DOMContentLoaded', () => {
  const c = document.createElement('div')
  c.id = '__cursor'
  c.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 2l16 9-7 2-3 7z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
  Object.assign(c.style, { position: 'fixed', left: '-50px', top: '-50px', zIndex: 2147483647, pointerEvents: 'none', transition: 'transform .12s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.35))' })
  document.body.appendChild(c)
  const p = JSON.parse(sessionStorage.getItem('__cur') || 'null')
  if (p) { c.style.left = p[0] - 4 + 'px'; c.style.top = p[1] - 2 + 'px' }
  addEventListener('mousemove', (e) => { c.style.left = e.clientX - 4 + 'px'; c.style.top = e.clientY - 2 + 'px'; sessionStorage.setItem('__cur', JSON.stringify([e.clientX, e.clientY])) }, true)
  addEventListener('mousedown', (e) => {
    c.style.transform = 'scale(.82)'
    const r = document.createElement('div')
    Object.assign(r.style, { position: 'fixed', left: e.clientX - 22 + 'px', top: e.clientY - 22 + 'px', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(240,166,60,.45)', zIndex: 2147483646, pointerEvents: 'none', transition: 'transform .45s ease-out, opacity .45s ease-out' })
    document.body.appendChild(r)
    requestAnimationFrame(() => { r.style.transform = 'scale(1.8)'; r.style.opacity = '0' })
    setTimeout(() => r.remove(), 500)
  }, true)
  addEventListener('mouseup', () => { c.style.transform = '' }, true)
})`

async function newPage(browser, { mobile = false, login = false } = {}) {
  const ctx = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 })
  if (login) {
    const r = await ctx.request.post(BASE + '/api/users/login', { data: { email: 'vusal.salmanov.20@seed.oyunagel.az', password: 'demo-video-pass' } })
    if (!r.ok()) throw new Error('login failed ' + r.status())
  }
  if (!mobile) await ctx.addInitScript(CURSOR)
  const page = await ctx.newPage()
  return page
}

// Eased smooth scroll by `dy` pixels over `ms`.
const scroll = (page, dy, ms = 1200) => page.evaluate(([dy, ms]) => new Promise((done) => {
  const y0 = scrollY, t0 = performance.now()
  const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const step = (now) => { const t = Math.min(1, (now - t0) / ms); scrollTo(0, y0 + dy * ease(t)); t < 1 ? requestAnimationFrame(step) : done() }
  requestAnimationFrame(step)
}), [dy, ms])
const scrollTo = async (page, locator, offset = 120, ms = 1200) => {
  const box = await locator.boundingBox()
  await scroll(page, box.y - offset, ms)
}

let mouse = { x: 720, y: 400 }
async function moveTo(page, locator, ms = 700) {
  const b = await locator.boundingBox()
  const x = b.x + b.width / 2, y = b.y + b.height / 2
  const steps = Math.max(8, Math.round(ms / 16))
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    await page.mouse.move(mouse.x + (x - mouse.x) * e, mouse.y + (y - mouse.y) * e)
    await sleep(ms / steps)
  }
  mouse = { x, y }
}
async function click(page, locator, ms) { await moveTo(page, locator, ms); await sleep(150); await page.mouse.down(); await sleep(90); await page.mouse.up() }

async function record(page, name, size, fn) {
  if (only && only !== name) return
  const dir = `${OUT}/${name}_frames`
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir)
  const cdp = await page.context().newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const f = `${dir}/${String(frames.length).padStart(5, '0')}.jpg`
    writeFileSync(f, Buffer.from(data, 'base64'))
    frames.push([f, metadata.timestamp])
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: size[0], maxHeight: size[1], everyNthFrame: 1 })
  const t0 = Date.now() / 1000
  await fn()
  const tEnd = Date.now() / 1000
  await cdp.send('Page.stopScreencast')
  // Each frame lasts until the next one; the last until the scene ends.
  let list = ''
  frames.forEach(([f, ts], i) => {
    const next = i + 1 < frames.length ? frames[i + 1][1] : tEnd
    list += `file '${f}'\nduration ${Math.max(0.001, next - (i === 0 ? Math.min(ts, t0) : ts)).toFixed(4)}\n`
  })
  list += `file '${frames.at(-1)[0]}'\n`
  writeFileSync(`${dir}.txt`, list)
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}.txt`,
    '-vf', `fps=30,scale=${size[0]}:${size[1]}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', `${OUT}/${name}.mp4`])
  console.log(name, frames.length, 'frames', (tEnd - t0).toFixed(1) + 's')
}

const browser = await chromium.launch({ args: ['--hide-scrollbars'] })
const W = [1536, 864]

// 1 · Home: hero, carousel, sports, open games
{
  const page = await newPage(browser)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' }); await sleep(800)
  await page.mouse.move(mouse.x, mouse.y)
  await record(page, 'home', W, async () => {
    await sleep(1400)
    const next = page.getByRole('button', { name: 'Növbəti oyun' })
    await click(page, next, 1100); await sleep(900)
    await click(page, next, 300); await sleep(1000)
    await scrollTo(page, page.getByText('Bu gün və sabah üçün qoşula biləcəyin oyunlar'), 260, 1600)
    await sleep(500)
    await moveTo(page, page.locator('article').first(), 800); await sleep(1400)
  })
  await page.context().close()
}

// 2 · All games + sport filter
{
  const page = await newPage(browser)
  await page.goto(BASE + '/games', { waitUntil: 'networkidle' }); await sleep(800)
  mouse = { x: 900, y: 120 }; await page.mouse.move(mouse.x, mouse.y)
  await record(page, 'games', W, async () => {
    await sleep(900)
    await click(page, page.getByRole('navigation', { name: 'İdman növü filtri' }).getByText('Futbol'), 900)
    await page.waitForLoadState('networkidle'); await sleep(1300)
    await scroll(page, 520, 1600); await sleep(800)
    await sleep(700)
  })
  await page.context().close()
}

// 3 · Game detail
{
  const page = await newPage(browser)
  await page.goto(BASE + '/games', { waitUntil: 'networkidle' })
  const warm = await page.locator('article a[class*=titleLink]').nth(1).getAttribute('href')
  await page.goto(BASE + warm, { waitUntil: 'networkidle' }) // warm the cover image cache
  await page.goto(BASE + '/games', { waitUntil: 'networkidle' }); await sleep(600)
  mouse = { x: 700, y: 300 }; await page.mouse.move(mouse.x, mouse.y)
  await record(page, 'detail', W, async () => {
    await sleep(500)
    await click(page, page.locator('article a[class*=titleLink]').nth(1), 900)
    await page.waitForURL(/\/games\/\d+$/); await page.waitForLoadState('networkidle'); await sleep(1500)
    await moveTo(page, page.getByRole('button', { name: /Qoşul/ }).or(page.getByRole('link', { name: /Qoşul/ })).first(), 1000)
    await sleep(1800)
  })
  await page.context().close()
}

// 4 · Create a game (signed in)
{
  const page = await newPage(browser, { login: true })
  await page.goto(BASE + '/games/new', { waitUntil: 'networkidle' }); await sleep(800)
  mouse = { x: 1200, y: 60 }; await page.mouse.move(mouse.x, mouse.y)
  await record(page, 'create', W, async () => {
    await sleep(700)
    await scroll(page, 330, 1000)
    await click(page, page.getByText('Basketbol', { exact: true }).last(), 800)
    await page.locator('input[name=sport][value=basketball]').check({ force: true }); await sleep(400)
    const venue = page.getByRole('combobox', { name: 'Meydança' })
    await click(page, venue, 700)
    await page.keyboard.type('Inter', { delay: 90 }); await sleep(500)
    await click(page, page.getByRole('option').first(), 600); await sleep(300)
    const time = page.getByPlaceholder(/məs\. \d/)
    await click(page, time, 700)
    await page.keyboard.type('20:30', { delay: 110 }); await sleep(250)
    await page.keyboard.press('Escape').catch(() => {})
    await scroll(page, 260, 900)
    await click(page, page.getByText('Yüksək', { exact: true }), 700)
    await page.locator('input[name=level][value=high]').check({ force: true })
    const title = page.getByPlaceholder(/Cümə axşamı/)
    await click(page, title, 600)
    await page.keyboard.type('Cümə axşamı 5-ə-5', { delay: 65 }); await sleep(400)
    await click(page, page.getByRole('button', { name: 'Oyunu dərc et' }), 800)
    await page.waitForURL(/\/games\/\d+$/, { timeout: 15000 }); await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => [...document.images].every((i) => i.complete)); await sleep(2400)
  })
  await page.context().close()
}

// 5 · Profile
{
  const page = await newPage(browser, { login: true })
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' }); await sleep(800)
  mouse = { x: 1000, y: 200 }; await page.mouse.move(mouse.x, mouse.y)
  await record(page, 'profile', W, async () => {
    await sleep(1600)
    await moveTo(page, page.getByText(/statistika/i).first(), 900); await sleep(600)
    await scroll(page, 430, 1500); await sleep(500)
    await click(page, page.getByText('Təşkil etdiyim oyunlar'), 900)
    await sleep(1800)
  })
  await page.context().close()
}

// 6 · Mobile
{
  const page = await newPage(browser, { mobile: true })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' }); await sleep(800)
  await record(page, 'mobile', [780, 1688], async () => {
    await sleep(1400)
    await scroll(page, 700, 1500); await sleep(700)
    await scroll(page, 900, 1700); await sleep(800)
    await scroll(page, 1100, 1900); await sleep(900)
  })
  await page.context().close()
}

await browser.close()
