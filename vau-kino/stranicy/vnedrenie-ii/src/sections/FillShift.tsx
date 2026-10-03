import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useStage } from '../lib/useStage'
import { Kicker, seg } from '../lib/ui'

/**
 * Полноэкранный переход-заливка в середине страницы. Вагончик «ваш процесс»
 * стоит на кремовом поле; из него круг сурика разливается на весь экран,
 * и страница переходит в сурик сцены 3 без шва. Только transform/opacity.
 */
export function FillShift() {
  const ref = useRef<HTMLElement>(null)
  const disc = useRef<HTMLDivElement>(null)
  const cart = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLDivElement>(null)
  const hint = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()

  useStage(
    ref,
    (p) => {
      const f = seg(p, 0.16, 0.62)
      const e = f * f * (3 - 2 * f)
      if (disc.current) disc.current.style.transform = `translate(-50%,-50%) scale(${Math.max(e, 0.001)})`
      if (cart.current) {
        const c = seg(p, 0.0, 0.2)
        cart.current.style.transform = `translate(-50%,-50%) translate3d(${(c - 1) * 40}vw,0,0)`
        cart.current.style.opacity = String(1 - seg(p, 0.4, 0.5))
      }
      if (hint.current) hint.current.style.opacity = String(1 - seg(p, 0.2, 0.34))
      if (text.current) {
        const t = seg(p, 0.46, 0.66)
        text.current.style.opacity = String(t)
        text.current.style.transform = `translate3d(0,${(1 - t) * 28}px,0)`
      }
    },
    reduced,
  )

  return (
    <section id="perehod" ref={ref} className={`relative bg-krem ${reduced ? 'bg-rust' : 'h-[230svh]'}`} aria-label="Переход">
      <div className={`${reduced ? 'py-24' : 'sticky top-0 h-[100svh]'} overflow-hidden`}>
        <div
          ref={disc}
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[170vmax] w-[170vmax] rounded-full bg-rust will-change-transform"
          style={{ transform: 'translate(-50%,-50%) scale(0.001)' }}
        />
        <div
          ref={cart}
          aria-hidden
          className="absolute left-1/2 top-1/2 z-10 will-change-transform"
        >
          <div className="flex h-[64px] origin-bottom items-center sm:scale-[1.35] gap-3 rounded-2xl border-[3px] border-choc bg-pole px-5 shadow-[0_16px_30px_-14px_oklch(0.3_0.08_40/0.8)]">
            <span className="h-3.5 w-3.5 rounded-full bg-krem" />
            <span className="mono whitespace-nowrap text-[15px] font-bold text-choc">ваш процесс</span>
          </div>
          <div className="mx-auto -mt-1 flex w-[70%] justify-between">
            <span className="h-3.5 w-3.5 rounded-full border-2 border-choc bg-krem" />
            <span className="h-3.5 w-3.5 rounded-full border-2 border-choc bg-krem" />
          </div>
        </div>
        <div ref={hint} className="absolute inset-x-0 top-[calc(50%-46vh+80px)] px-4 text-center sm:top-[calc(50%-260px)]">
          <p className="mono text-[12px] font-semibold uppercase tracking-[0.12em] text-rust sm:text-[13px]">следующая станция</p>
          <p className="display mt-3 text-[clamp(2.2rem,6.4vw,5rem)] font-[800] text-choc">
            Теперь — ваш процесс
          </p>
        </div>
        <div ref={text} className="relative z-20 mx-auto flex h-full max-w-[1320px] flex-col justify-center px-4 sm:px-8" style={{ opacity: reduced ? 1 : 0 }}>
          <Kicker className="text-krem">Почему нам можно доверить процесс</Kicker>
          <p className="display mt-5 max-w-[1150px] text-[clamp(2.4rem,8vw,6.4rem)] font-[800] text-krem">
            Всё, что предлагаем вам, сначала заработало у нас.
          </p>
          <p className="mt-6 max-w-[600px] text-[17px] leading-[1.55] text-krem sm:text-[19px]">
            Расшифровка звонков, ИИ-юрист, GEO-Радар и наш собственный отбор заказов прошли тот же путь:
            разбор, пилот, внедрение. Теперь по нему поедет ваш процесс.
          </p>
        </div>
      </div>
    </section>
  )
}
