// Captures the app screenshots the video uses (public/shots). Needs the OyunaGəl app running locally
// with seed data (`npm run seed` in the app repo) and Playwright installed (`npm i -D playwright`).
import { chromium } from 'playwright'

const BASE = process.env.APP_URL ?? 'http://localhost:3000'
const OUT = new URL('../public/shots/', import.meta.url).pathname

const browser = await chromium.launch({ args: ['--hide-scrollbars'] })
async function shoot(mobile, path, file, maxCssHeight) {
  const ctx = await browser.newContext(mobile
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  await page.goto(BASE + path, { waitUntil: 'networkidle' })
  // Scroll through once so lazy images load.
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } scrollTo(0, 0) })
  await page.waitForTimeout(800)
  const height = await page.evaluate(() => document.body.scrollHeight)
  await page.screenshot({ path: OUT + file, type: 'jpeg', quality: 90, fullPage: true, clip: { x: 0, y: 0, width: mobile ? 390 : 1440, height: Math.min(height, maxCssHeight ?? height) } })
  await ctx.close()
}
await shoot(false, '/', 'd_home_full.jpg')
await shoot(true, '/', 'm_home_full.jpg', 2000)
await shoot(true, '/games', 'm_games_full.jpg', 2000)
await shoot(true, '/games/64', 'm_detail_full.jpg') // any game id from the seeded database
await browser.close()
