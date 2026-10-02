/**
 * Зонд по сайтам-эталонам: живость, вес, библиотеки, типографика, снимок первого экрана.
 * Запуск: NODE_PATH=C:/smg/data/higgsfield/node_modules node probe.cjs urls.txt outdir out.json
 */
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const urlsFile = process.argv[2]
const outDir = process.argv[3]
const outJson = process.argv[4]
fs.mkdirSync(outDir, { recursive: true })

const urls = fs
  .readFileSync(urlsFile, 'utf8')
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('#'))

const LIBS = [
  ['gsap', /gsap|ScrollTrigger/i],
  ['three', /three(\.min)?\.(js|module)|three@|r3f|react-three/i],
  ['lenis', /lenis|@studio-freight/i],
  ['locomotive', /locomotive-scroll/i],
  ['framer-motion', /framer-motion|motion@|motion\/react/i],
  ['lottie', /lottie|dotlottie/i],
  ['rive', /rive-app|rive\.js|\.riv/i],
  ['barba', /barba/i],
  ['swiper', /swiper/i],
  ['splide', /splide/i],
  ['embla', /embla/i],
  ['matter', /matter\.js|matter-js/i],
  ['pixi', /pixi/i],
  ['curtains', /curtainsjs/i],
  ['webflow', /webflow/i],
  ['next', /_next\/static/i],
  ['nuxt', /_nuxt\//i],
  ['shopify', /cdn\.shopify|shopify/i],
  ['squarespace', /squarespace/i],
  ['wordpress', /wp-content|wp-includes/i],
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slug = (u) => u.replace(/^https?:\/\//, '').replace(/[^a-z0-9.]+/gi, '-').replace(/-+$/, '').slice(0, 60)

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const results = []
  for (const url of urls) {
    const rec = { url, ok: false }
    let ctx
    try {
      ctx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
      })
      const page = await ctx.newPage()
      let bytes = 0
      const byType = {}
      const srcs = []
      page.on('response', async (res) => {
        try {
          const h = res.headers()
          const len = parseInt(h['content-length'] || '0', 10) || 0
          bytes += len
          const t = (h['content-type'] || '').split(';')[0]
          byType[t] = (byType[t] || 0) + len
          srcs.push(res.url())
        } catch (e) {}
      })
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
      rec.status = resp ? resp.status() : null
      rec.finalUrl = page.url()
      await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {})
      await sleep(3500)
      rec.title = await page.title()
      rec.ok = true

      const info = await page.evaluate(() => {
        const toHex = (c) => {
          const m = (c || '').match(/rgba?\(([^)]+)\)/)
          if (!m) return null
          const p = m[1].split(',').map((x) => parseFloat(x))
          if (p.length > 3 && p[3] === 0) return null
          return '#' + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
        }
        const g = (el, prop) => getComputedStyle(el)[prop]
        const bodyS = getComputedStyle(document.body)
        const htmlS = getComputedStyle(document.documentElement)
        const heads = []
        for (const sel of ['h1', 'h2']) {
          const el = document.querySelector(sel)
          if (!el) continue
          const s = getComputedStyle(el)
          heads.push({
            tag: sel,
            text: (el.innerText || '').trim().slice(0, 90),
            fontFamily: s.fontFamily,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color: toHex(s.color),
            textTransform: s.textTransform,
          })
        }
        // частоты цветов по вычисленным стилям
        const bg = {}
        const fg = {}
        const all = Array.from(document.querySelectorAll('body *')).slice(0, 2500)
        for (const el of all) {
          const s = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          const area = Math.max(0, r.width) * Math.max(0, r.height)
          const b = toHex(s.backgroundColor)
          if (b && area > 0) bg[b] = (bg[b] || 0) + area
          const c = toHex(s.color)
          if (c) fg[c] = (fg[c] || 0) + 1
        }
        const top = (o, n) =>
          Object.entries(o)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n)
            .map(([k, v]) => [k, Math.round(v)])
        const fonts = new Set()
        for (const el of all) fonts.add(getComputedStyle(el).fontFamily)
        return {
          bodyBg: toHex(bodyS.backgroundColor) || toHex(htmlS.backgroundColor),
          bodyColor: toHex(bodyS.color),
          bodyFont: bodyS.fontFamily,
          heads,
          topBackgrounds: top(bg, 10),
          topTextColors: top(fg, 8),
          fontFamilies: Array.from(fonts).slice(0, 14),
          videos: document.querySelectorAll('video').length,
          videoSrc: Array.from(document.querySelectorAll('video'))
            .map((v) => v.currentSrc || v.src || (v.querySelector('source') || {}).src)
            .filter(Boolean)
            .slice(0, 4),
          canvases: document.querySelectorAll('canvas').length,
          canvasWebgl: Array.from(document.querySelectorAll('canvas')).filter((c) => {
            try {
              return !!(c.getContext('webgl2', {}) || c.getContext('webgl', {}))
            } catch (e) {
              return false
            }
          }).length,
          imgs: document.querySelectorAll('img').length,
          svgs: document.querySelectorAll('svg').length,
          bigType: (() => {
            // самый крупный кегль на первом экране
            let max = 0,
              txt = '',
              ff = ''
            for (const el of all) {
              const r = el.getBoundingClientRect()
              if (r.top > window.innerHeight || r.bottom < 0) continue
              const s = getComputedStyle(el)
              const fs = parseFloat(s.fontSize)
              const t = (el.innerText || '').trim()
              if (fs > max && t && t.length < 120 && el.children.length === 0) {
                max = fs
                txt = t.slice(0, 70)
                ff = s.fontFamily
              }
            }
            return { px: Math.round(max), vw: +((max / window.innerWidth) * 100).toFixed(2), text: txt, font: ff }
          })(),
          globals: {
            gsap: typeof window.gsap !== 'undefined',
            THREE: typeof window.THREE !== 'undefined',
            Lenis: typeof window.Lenis !== 'undefined',
            Locomotive: typeof window.LocomotiveScroll !== 'undefined',
            barba: typeof window.barba !== 'undefined',
          },
        }
      })
      Object.assign(rec, info)
      const joined = srcs.join('\n')
      rec.libs = LIBS.filter(([, re]) => re.test(joined)).map(([n]) => n)
      rec.bytesKB = Math.round(bytes / 1024)
      rec.byTypeKB = Object.fromEntries(
        Object.entries(byType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([k, v]) => [k, Math.round(v / 1024)]),
      )
      rec.requests = srcs.length
      const shot = path.join(outDir, slug(url) + '.png')
      await page.screenshot({ path: shot })
      rec.shot = shot
      // телефон
      const p2 = await ctx.newPage()
      await p2.setViewportSize({ width: 390, height: 844 })
      await p2.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => {})
      await sleep(3000)
      const shot390 = path.join(outDir, slug(url) + '-390.png')
      await p2.screenshot({ path: shot390 }).catch(() => {})
      rec.shot390 = shot390
    } catch (e) {
      rec.error = String(e).slice(0, 220)
    } finally {
      if (ctx) await ctx.close().catch(() => {})
    }
    console.log(rec.ok ? 'OK  ' : 'FAIL', rec.status || '', rec.bytesKB || '', url, rec.error || '')
    results.push(rec)
    fs.writeFileSync(outJson, JSON.stringify(results, null, 1), 'utf8')
  }
  await browser.close()
  console.log('готово:', results.filter((r) => r.ok).length, 'из', results.length)
})()
