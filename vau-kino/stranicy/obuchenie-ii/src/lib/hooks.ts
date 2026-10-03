import { useEffect, useState, type RefObject } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'

/** Узкий экран: сцены переключаются на упрощённую раскладку */
export function useIsPhone(): boolean {
  const q = '(max-width: 767px)'
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

/**
 * Прогресс прокрутки sticky-сцены 0…1: от момента, когда верх секции дошёл
 * до верха окна, до момента, когда низ секции дошёл до низа окна.
 * При reduced-motion сцена сразу показывает итог (p = 1) — без скраба.
 */
export function useSceneProgress(ref: RefObject<HTMLElement | null>): number {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [p, setP] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setP(Math.round(v * 1000) / 1000)
  })
  return reduced ? 1 : p
}

/** Плавная ступенька 0→1 на отрезке [a, b] */
export function ramp(p: number, a: number, b: number): number {
  const t = Math.min(Math.max((p - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

/** Линейный отрезок 0→1 на [a, b] без сглаживания */
export function lin(p: number, a: number, b: number): number {
  return Math.min(Math.max((p - a) / (b - a), 0), 1)
}

export const rub = (n: number) => n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽'
