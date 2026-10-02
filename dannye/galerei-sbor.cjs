/**
 * Сбор кандидатов из галерей. Открывает страницу листинга и вытаскивает
 * внешние ссылки на сайты + подписи. Пишет JSON.
 * node sbor.cjs zadaniya.json out.json
 */
const { chromium } = require('playwright')
const fs = require('fs')

const zadaniya = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const outJson = process.argv[3]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    locale: 'en-US',
  })
  const out = []
  for (const z of zadaniya) {
    const rec = { galereya: z.galereya, stranica: z.url, ok: false, ssylki: [] }
    const page = await ctx.newPage()
    try {
      const r = await page.goto(z.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      rec.status = r ? r.status() : null
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {})
      // прокрутить, чтобы подгрузилось ленивое
      for (let i = 0; i < (z.skroll || 3); i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5))
        await sleep(1200)
      }
      rec.title = await page.title()
      rec.tekst = (await page.evaluate(() => document.body.innerText)).slice(0, 12000)
      rec.ssylki = await page.evaluate(() => {
        const host = location.hostname.replace(/^www\./, '')
        const seen = new Map()
        for (const a of document.querySelectorAll('a[href]')) {
          let h = a.href
          if (!/^https?:/.test(h)) continue
          let u
          try {
            u = new URL(h)
          } catch (e) {
            continue
          }
          const hh = u.hostname.replace(/^www\./, '')
          const vneshn = !hh.endsWith(host) && !host.endsWith(hh)
          const txt = (a.innerText || a.getAttribute('aria-label') || a.title || '').trim().slice(0, 120)
          const key = vneshn ? hh : u.pathname
          if (!seen.has(key)) seen.set(key, { href: h, host: hh, vneshn, txt, ctx: '' })
          const s = seen.get(key)
          if (!s.txt && txt) s.txt = txt
          // контекст — текст карточки-родителя
          if (!s.ctx) {
            let p = a
            for (let i = 0; i < 4 && p; i++) p = p.parentElement
            if (p) s.ctx = (p.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 180)
          }
        }
        return Array.from(seen.values())
      })
      rec.ok = true
    } catch (e) {
      rec.error = String(e).slice(0, 200)
    }
    await page.close().catch(() => {})
    console.log(rec.ok ? 'OK ' : 'FAIL', rec.status || '', (rec.ssylki || []).length, z.galereya, z.url, rec.error || '')
    out.push(rec)
    fs.writeFileSync(outJson, JSON.stringify(out, null, 1), 'utf8')
  }
  await browser.close()
})()
