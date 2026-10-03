import { useEffect } from 'react'

/**
 * «Три акта дня»: фон незаметно меняет тон по мере скролла —
 * утренний кремовый → золотой полдень → закатный персик.
 * Плавное перекрашивание --color-velvet в rAF; все поверхности,
 * завязанные на токен, переезжают вместе (body, хедер, шторки).
 * Движение только от скролла — под reduced-motion остаётся (грабля 10).
 */

const ACTS: [number, number, number][] = [
  [247, 236, 224], // I: #f7ece0 — утренний свет на бумаге
  [251, 232, 211], // II: #fbe8d3 — золотой полдень
  [246, 221, 210], // III: #f6ddd2 — закатный персик
]

export function ActShift() {
  useEffect(() => {
    const root = document.documentElement
    let raf = 0
    let last = ''
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const span = document.documentElement.scrollHeight - window.innerHeight
      const p = span > 0 ? Math.min(window.scrollY / span, 1) : 0
      /* два сегмента: I→II на 0..0.55, II→III на 0.55..1 */
      const seg = p < 0.55 ? 0 : 1
      const k = seg === 0 ? p / 0.55 : (p - 0.55) / 0.45
      const a = ACTS[seg]
      const b = ACTS[seg + 1]
      const c = a.map((v, i) => Math.round(v + (b[i] - v) * k))
      const css = `rgb(${c[0]} ${c[1]} ${c[2]})`
      if (css !== last) {
        last = css
        root.style.setProperty('--color-velvet', css)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      root.style.removeProperty('--color-velvet')
    }
  }, [])
  return null
}
