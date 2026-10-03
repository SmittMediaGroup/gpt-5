import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'

/**
 * Сквозной мотив страницы — «линия процесса». Вагончик «ваш процесс» едет
 * по линии от героя до заявки и проходит станции-сцены. На широком экране —
 * вертикальная линия у левого края, на телефоне — линия по низу шапки.
 */
const STATIONS = [
  { id: 'top', t: 'старт' },
  { id: 'shema', t: 'схема' },
  { id: 'zvonki', t: 'звонок' },
  { id: 'etapy', t: 'этапы' },
  { id: 'razbor', t: 'разбор' },
]

function usePositions() {
  const [pos, setPos] = useState<number[]>([])
  useEffect(() => {
    const calc = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPos(
        STATIONS.map((s) => {
          const el = document.getElementById(s.id)
          return el ? Math.min(1, el.offsetTop / max) : 0
        }),
      )
    }
    calc()
    const t = window.setTimeout(calc, 800)
    window.addEventListener('resize', calc)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', calc)
    }
  }, [])
  return pos
}

export function ProcessLineDesktop() {
  const { scrollYProgress } = useScroll()
  const fill = useRef<HTMLDivElement>(null)
  const cart = useRef<HTMLDivElement>(null)
  const dots = useRef<(HTMLSpanElement | null)[]>([])
  const pos = usePositions()

  const apply = (v: number) => {
    if (fill.current) fill.current.style.transform = `scaleY(${v})`
    if (cart.current) cart.current.style.transform = `translate3d(-50%,${v * (cart.current.parentElement?.clientHeight ?? 0) - 15}px,0)`
    dots.current.forEach((d, i) => {
      if (d) d.dataset.on = v + 0.002 >= (pos[i] ?? 1) ? '1' : '0'
    })
  }
  useMotionValueEvent(scrollYProgress, 'change', apply)
  useEffect(() => apply(scrollYProgress.get()))

  return (
    <div aria-hidden className="pointer-events-none fixed bottom-6 left-[14px] top-[96px] z-40 hidden w-[4px] min-[1400px]:block">
      <div className="absolute inset-0 rounded-full bg-choc/20" />
      <div ref={fill} className="absolute inset-0 origin-top rounded-full bg-choc" style={{ transform: 'scaleY(0)' }} />
      {STATIONS.map((s, i) => (
        <span
          key={s.id}
          ref={(el) => {
            dots.current[i] = el
          }}
          data-on="0"
          className="line-dot absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ top: `${(pos[i] ?? 0) * 100}%` }}
        />
      ))}
      <div
        ref={cart}
        className="absolute left-1/2 top-0 h-[30px] w-[16px] rounded-[6px] border-[3px] border-choc bg-pole will-change-transform"
      />
    </div>
  )
}

/** Телефон и узкие экраны: та же линия по нижнему краю шапки */
export function ProcessLineHeader() {
  const { scrollYProgress } = useScroll()
  const fill = useRef<HTMLDivElement>(null)
  const cart = useRef<HTMLDivElement>(null)
  const dots = useRef<(HTMLSpanElement | null)[]>([])
  const pos = usePositions()
  const apply = (v: number) => {
    if (fill.current) fill.current.style.transform = `scaleX(${v})`
    if (cart.current) cart.current.style.transform = `translate3d(${v * (cart.current.parentElement?.clientWidth ?? 0) - 10}px,-50%,0)`
    dots.current.forEach((d, i) => {
      if (d) d.dataset.on = v + 0.002 >= (pos[i] ?? 1) ? '1' : '0'
    })
  }
  useMotionValueEvent(scrollYProgress, 'change', apply)
  useEffect(() => apply(scrollYProgress.get()))
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-6 bottom-[5px] h-[3px] min-[1400px]:hidden">
      <div className="absolute inset-0 rounded-full bg-choc/15" />
      <div ref={fill} className="absolute inset-0 origin-left rounded-full bg-rust" style={{ transform: 'scaleX(0)' }} />
      {STATIONS.map((s, i) => (
        <span
          key={s.id}
          ref={(el) => {
            dots.current[i] = el
          }}
          data-on="0"
          className="line-dot absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${(pos[i] ?? 0) * 100}%` }}
        />
      ))}
      <div
        ref={cart}
        className="absolute left-0 top-1/2 h-[11px] w-[20px] rounded-[4px] border-2 border-choc bg-pole will-change-transform"
      />
    </div>
  )
}
