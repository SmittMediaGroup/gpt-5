import { createContext, useContext, useEffect, useRef, useState, type RefObject } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'

/** Плавная ступенька 0→1 на отрезке [a,b] */
export function ramp(p: number, a: number, b: number): number {
  const t = Math.min(Math.max((p - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

/** Линейная доля 0→1 на отрезке [a,b] */
export function lin(p: number, a: number, b: number): number {
  return Math.min(Math.max((p - a) / (b - a), 0), 1)
}

/** Флаг «движение остановлено» — кнопка в шапке + системная настройка */
export const StopContext = createContext<{ stopped: boolean; toggle: () => void }>({
  stopped: false,
  toggle: () => {},
})
export const useStop = () => useContext(StopContext)

/**
 * Прогресс sticky-сцены 0…1: от момента, когда верх секции дошёл до верха
 * экрана, до момента, когда низ секции дошёл до низа экрана.
 * Квантуется до 1/1000, чтобы не перерисовывать сцену на каждом пикселе.
 * Если движение выключено — сцена сразу в конечном состоянии.
 */
export function useSceneProgress(ref: RefObject<HTMLElement | null>, stillValue = 1) {
  const { stopped } = useStop()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [p, setP] = useState(0)
  const last = useRef(-1)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const q = Math.round(v * 1000) / 1000
    if (q !== last.current) {
      last.current = q
      setP(q)
    }
  })
  useEffect(() => {
    setP(Math.round(scrollYProgress.get() * 1000) / 1000)
  }, [scrollYProgress])
  return stopped ? stillValue : p
}

/** Узкий экран — для упрощённой раскладки сцен */
export function useNarrow(bp = 768) {
  const [n, setN] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp)
  useEffect(() => {
    const on = () => setN(window.innerWidth < bp)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [bp])
  return n
}
