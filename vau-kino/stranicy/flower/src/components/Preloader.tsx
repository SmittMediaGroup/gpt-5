import { useEffect, useRef, useState } from 'react'
import { HeroPeony } from './FlowerEngraving'
import { useContent } from '../content/useContent'
import { inStudioPreview } from '../content/studio'

/**
 * Прелоадер-«проявка»: пион проявляется из темноты снизу вверх, как
 * изображение на фотобумаге в красной комнате. Шторка уходит вверх и
 * стартует hero-хореография (onReveal). Паттерн — прелоадеры
 * nomadcar («заправка») и sad138 («прорастание»), тёмная инверсия.
 * Под reduced-motion НЕ исчезает (грабля 10): прогресс — информация.
 */

const FILL_MS = 1600
const HOLD_MS = 200
const CURTAIN_MS = 650
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/* viewBox HeroPeony: y от -110 до 10 */
const FILL_TOP = -112
const FILL_BOTTOM = 12

export function Preloader({ onReveal }: { onReveal: () => void }) {
  // В предпросмотре Студии шторка не нужна: клиент правит текст, а не ждёт проявку
  if (inStudioPreview) return <SkipPreloader onReveal={onReveal} />
  return <PreloaderCurtain onReveal={onReveal} />
}

function SkipPreloader({ onReveal }: { onReveal: () => void }) {
  useEffect(() => onReveal(), [onReveal])
  return null
}

function PreloaderCurtain({ onReveal }: { onReveal: () => void }) {
  const txt = useContent()
  const clipRef = useRef<SVGRectElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const [phase, setPhase] = useState<'fill' | 'leave' | 'gone'>('fill')
  const revealRef = useRef(onReveal)
  revealRef.current = onReveal

  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    let raf = 0
    let leaveTimer = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - t0) / FILL_MS, 1)
      const k = easeInOut(t)
      if (clipRef.current) {
        const y = FILL_BOTTOM - k * (FILL_BOTTOM - FILL_TOP)
        clipRef.current.setAttribute('y', String(y))
        clipRef.current.setAttribute('height', String(FILL_BOTTOM - y))
      }
      if (pctRef.current) pctRef.current.textContent = `${Math.round(k * 100)}%`
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        leaveTimer = window.setTimeout(() => {
          setPhase('leave')
          revealRef.current()
          window.setTimeout(() => setPhase('gone'), CURTAIN_MS + 50)
        }, HOLD_MS)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(leaveTimer)
      document.documentElement.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase === 'gone') document.documentElement.style.overflow = ''
  }, [phase])

  if (phase === 'gone') return null

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] bg-velvet transition-transform"
      style={{
        transform: phase === 'leave' ? 'translateY(-100%)' : 'translateY(0)',
        transitionDuration: `${CURTAIN_MS}ms`,
        transitionTimingFunction: 'cubic-bezier(0.7, 0, 0.3, 1)',
      }}
    >
      {/* Wordmark там же, где в хедере: шторка уходит — имя «остаётся» */}
      <div className="px-6 pt-4">
        <span className="display text-lg tracking-[0.04em]">{txt.header.brand}</span>
      </div>

      <div className="flex h-full flex-col items-center justify-center px-6">
        <div className="relative w-[min(40vw,200px)]">
          {/* контур-подмалёвок: едва видимый рисунок в темноте */}
          <div className="opacity-25 grayscale">
            <HeroPeony className="w-full" />
          </div>
          {/* проявляющийся цветной слой, клип поднимается снизу вверх */}
          <svg viewBox="-60 -110 120 120" className="absolute inset-0 w-full" role="presentation">
            <defs>
              <clipPath id="reveal-clip">
                <rect ref={clipRef} x={-60} y={FILL_BOTTOM} width={120} height={0} />
              </clipPath>
            </defs>
            <g clipPath="url(#reveal-clip)">
              <HeroPeony className="w-full" />
            </g>
          </svg>
        </div>

        <p className="mt-10 flex items-baseline gap-4">
          <span className="text-xs tracking-[0.22em] text-smoke uppercase">Проявляем</span>
          <span ref={pctRef} className="display text-xl tabular-nums">
            0%
          </span>
        </p>
      </div>
    </div>
  )
}
