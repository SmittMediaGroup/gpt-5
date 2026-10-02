/**
 * Карточки Awwwards: пара «внешний адрес сайта» + название + теги + страница карточки.
 * node awwcards.cjs urls.txt out.json
 */
const { chromium } = require('playwright')
const fs = require('fs')
const urls = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#'))
const outJson = process.argv[3]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    locale: 'en-US',
  })
  const out = []
  for (const url of urls) {
    const page = await ctx.newPage()
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
      for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5))
        await sleep(1100)
      }
      const cards = await page.evaluate(() => {
        const res = []
        const items = document.querySelectorAll('li, article, div.js-collectable, figure')
        const seen = new Set()
        for (const it of items) {
          const ext = Array.from(it.querySelectorAll('a[href^="http"]')).find((a) => {
            try {
              const h = new URL(a.href).hostname.replace(/^www\./, '')
              return !/awwwards\.com|facebook|instagram|twitter|x\.com|youtube|tiktok|linkedin|pinterest|streamlinehq|fonts\.ninja/.test(h)
            } catch (e) { return false }
          })
          if (!ext) continue
          const card = it.querySelector('a[href*="/sites/"]')
          const t = (it.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200)
          const key = ext.href
          if (seen.has(key)) continue
          seen.add(key)
          res.push({ sayt: ext.href, kartochka: card ? card.href : '', podpis: t })
        }
        return res
      })
      console.log(url, '->', cards.length)
      out.push({ stranica: url, cards })
    } catch (e) {
      console.log('FAIL', url, String(e).slice(0, 120))
      out.push({ stranica: url, error: String(e).slice(0, 160) })
    }
    await page.close().catch(() => {})
    fs.writeFileSync(outJson, JSON.stringify(out, null, 1), 'utf8')
  }
  await browser.close()
})()
