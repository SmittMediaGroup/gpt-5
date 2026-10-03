import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Цветок из живых частиц (canvas 2D) — приём мировых цветочных SOTD
 * (Flowers for Society: particles + transitions), без WebGL-зависимостей.
 * ~1400 частиц собираются из хаоса в форму пиона (полярная роза в три
 * яруса), дышат и разбегаются от курсора, возвращаясь пружиной.
 * Всё в rAF через ref — ноль ре-рендеров. prefers-reduced-motion:
 * частицы отрисовываются сразу на местах, без анимации и отклика.
 */

type P = {
  x: number
  y: number
  vx: number
  vy: number
  tx: number
  ty: number
  r: number
  hue: string
  delay: number
}

/** Точки-мишени: три яруса лепестков + сердцевина (полярные розы) */
function targets(count: number, R: number): { x: number; y: number; layer: number }[] {
  const pts: { x: number; y: number; layer: number }[] = []
  const layers = [
    { k: 3, scale: 1.0, n: Math.floor(count * 0.46), rot: 0 },
    { k: 4, scale: 0.58, n: Math.floor(count * 0.3), rot: Math.PI / 8 },
    { k: 5, scale: 0.3, n: Math.floor(count * 0.14), rot: Math.PI / 10 },
  ]
  for (let li = 0; li < layers.length; li++) {
    const { k, scale, n, rot } = layers[li]
    for (let i = 0; i < n; i++) {
      const th = Math.random() * Math.PI * 2
      const petal = Math.abs(Math.cos(k * th))
      // треть частиц — точно на кромке лепестка: чёткий силуэт розы;
      // остальные заполняют тело с вырезанной серединой
      const body = 0.3 + 0.7 * Math.sqrt(Math.random())
      const rho = (i % 3 === 0 ? petal : petal * body) * scale * R
      pts.push({ x: Math.cos(th + rot) * rho, y: Math.sin(th + rot) * rho, layer: li })
    }
  }
  const core = count - pts.length
  for (let i = 0; i < core; i++) {
    const th = Math.random() * Math.PI * 2
    const rho = Math.sqrt(Math.random()) * R * 0.07
    pts.push({ x: Math.cos(th) * rho, y: Math.sin(th) * rho, layer: 3 })
  }
  return pts
}

const HUES = [
  /* Палитра частиц под светлый фон: костяной на кремовом исчезал,
     поэтому вместо него — насыщенные лепестковые тона и зелень стебля. */
  'rgba(212,66,106,', // peony
  'rgba(166,42,78,', // глубокий пион
  'rgba(224,160,60,', // пыльца
  'rgba(78,122,74,', // стебель
]

export function ParticleBloom({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0
    const fit = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()

    const R = Math.min(W, H) * 0.44
    const N = Math.min(1900, Math.floor((W * H) / 240))
    const tg = targets(N, R)
    const parts: P[] = tg.map((t, i) => {
      const th = Math.random() * Math.PI * 2
      const far = Math.max(W, H) * (0.6 + Math.random() * 0.5)
      return {
        x: Math.cos(th) * far,
        y: Math.sin(th) * far,
        vx: 0,
        vy: 0,
        tx: t.x,
        ty: t.y,
        r: t.layer === 3 ? 1.6 : 1 + Math.random() * 1.4,
        hue: t.layer === 3 ? HUES[3] : t.layer === 2 ? HUES[0] : HUES[i % 2 === 0 ? 0 : (i % 7 === 0 ? 2 : 1)],
        delay: (Math.abs(t.x) + Math.abs(t.y)) / R * 26 + Math.random() * 24,
      }
    })

    let mx = -9999
    let my = -9999
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mx = e.clientX - rect.left - W / 2
      my = e.clientY - rect.top - H / 2
    }
    const onLeave = () => {
      mx = -9999
      my = -9999
    }
    if (!reduced) {
      window.addEventListener('mousemove', onMove, { passive: true })
      canvas.addEventListener('mouseleave', onLeave)
    }

    let raf = 0
    let frame = 0
    const K = 0.045 // пружина к мишени
    const D = 0.86 // демпфер
    const REP = 70 // радиус разбегания от курсора

    const draw = () => {
      raf = requestAnimationFrame(draw)
      frame++
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      ctx.translate(W / 2, H / 2)
      const breathe = reduced ? 1 : 1 + Math.sin(frame / 90) * 0.012
      ctx.scale(breathe, breathe)
      for (const p of parts) {
        if (reduced) {
          p.x = p.tx
          p.y = p.ty
        } else if (frame > p.delay) {
          let ax = (p.tx - p.x) * K
          let ay = (p.ty - p.y) * K
          const dx = p.x - mx
          const dy = p.y - my
          const d2 = dx * dx + dy * dy
          if (d2 < REP * REP) {
            const d = Math.sqrt(d2) || 1
            const f = ((REP - d) / REP) * 2.2
            ax += (dx / d) * f
            ay += (dy / d) * f
          }
          p.vx = (p.vx + ax) * D
          p.vy = (p.vy + ay) * D
          p.x += p.vx
          p.y += p.vy
        }
        const speed = Math.abs(p.vx) + Math.abs(p.vy)
        ctx.fillStyle = `${p.hue}${Math.min(0.9, 0.5 + speed * 0.15 + (p.r - 1) * 0.2)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      if (reduced) cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(draw)

    const onResize = () => fit()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
