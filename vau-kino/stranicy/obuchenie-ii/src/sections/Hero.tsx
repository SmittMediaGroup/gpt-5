import { animate, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { lin, useSceneProgress } from '../lib/hooks'
import { MarkerAt } from './Marker'

/**
 * Первый экран — сцена «маркер проводит заголовок».
 * Вход (≤1,2 с): слова поднимаются, маркер влетает и одним движением прокрашивает «ИИ».
 * Прокрутка: тот же маркер, не отрываясь, ведёт кремовую полосу дальше — петлёй вниз,
 * справа налево под «для сотрудников», и широким росчерком уходит за правый край,
 * в следующую секцию. Полоса — SVG-путь, построенный по реальным размерам строк,
 * поэтому работает одинаково на 1440 и на 390: телефон получает тот же момент.
 * Маркер всегда держится кончиком на голове полосы, корпус — вниз-вправо, как в руке.
 */

const EASE = [0.22, 1, 0.36, 1] as const

function Word({ w, i }: { w: string; i: number }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
      <motion.span
        className="inline-block"
        initial={{ y: '105%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.55, ease: EASE, delay: 0.04 + i * 0.07 }}
      >
        {w}
      </motion.span>
    </span>
  )
}

type Geo = { d: string; W: number; H: number; fs: number; f1: number; L: number }

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const iiRef = useRef<HTMLSpanElement>(null)
  const l3Ref = useRef<HTMLSpanElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const reduced = useReducedMotion()
  const p = useSceneProgress(ref)
  const [geo, setGeo] = useState<Geo | null>(null)
  const [entr, setEntr] = useState(reduced ? 1 : 0)

  // геометрия полосы — по реальным прямоугольникам строк
  useLayoutEffect(() => {
    const measure = () => {
      const st = stageRef.current, h1 = h1Ref.current, ii = iiRef.current, l3 = l3Ref.current
      if (!st || !h1 || !ii || !l3) return
      const o = st.getBoundingClientRect()
      const fs = parseFloat(getComputedStyle(h1).fontSize)
      const a = ii.getBoundingClientRect()
      const b = l3.getBoundingClientRect()
      const W = o.width, H = o.height
      const y2 = a.top - o.top + a.height * 0.43
      const y3 = b.top - o.top + b.height * 0.45
      const x0 = a.left - o.left - 0.1 * fs
      const x1 = a.right - o.left + 0.08 * fs
      const r3 = b.right - o.left + 0.12 * fs
      const l3x = b.left - o.left - 0.1 * fs
      const d = [
        `M ${x0} ${y2}`,
        `L ${x1} ${y2}`,
        `C ${x1 + 0.9 * fs} ${y2}, ${r3 + 0.9 * fs} ${y3}, ${r3} ${y3}`,
        `L ${l3x} ${y3}`,
        `C ${l3x - 0.7 * fs} ${y3}, ${l3x - 0.2 * fs} ${H * 0.97}, ${W * 0.42} ${H * 0.9}`,
        `S ${W * 0.9} ${H * 0.62}, ${W + 3.2 * fs} ${H * 0.66}`,
      ].join(' ')
      setGeo({ d, W, H, fs, f1: 0, L: 0 })
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // длина пути считается после того, как d попал в DOM
  useLayoutEffect(() => {
    const el = pathRef.current
    if (!geo || !el || geo.L) return
    const L = el.getTotalLength()
    const seg = (() => {
      const m = geo.d.match(/M ([\d.-]+) [\d.-]+ L ([\d.-]+)/)
      return m ? Math.abs(+m[2] - +m[1]) : L * 0.1
    })()
    setGeo({ ...geo, L, f1: seg / L })
  }, [geo])

  // вход: маркер прокрашивает «ИИ»
  useEffect(() => {
    if (reduced) return
    const c = animate(0, 1, { duration: 0.5, delay: 0.5, ease: EASE, onUpdate: setEntr })
    return () => c.stop()
  }, [reduced])

  let drawn = 0
  let mk: { x: number; y: number; a: number } | null = null
  if (geo && geo.L && pathRef.current) {
    const scroll = geo.f1 + (1 - geo.f1) * lin(p, 0.03, 0.78)
    drawn = reduced ? geo.f1 : Math.max(entr * geo.f1, p > 0.005 ? scroll : 0)
    const len = Math.max(drawn * geo.L, 0.5)
    const pt = pathRef.current.getPointAtLength(len)
    const pr = pathRef.current.getPointAtLength(Math.max(len - 4, 0))
    const tan = Math.atan2(pt.y - pr.y, pt.x - pr.x)
    // корпус вниз-вправо, чуть «дышит» от направления хода
    mk = { x: pt.x, y: pt.y, a: 34 + 12 * Math.sin(tan) }
  }
  const mkOpacity = reduced ? 1 : Math.min(entr * 6, 1)
  const out = lin(p, 0.8, 1)

  return (
    <section ref={ref} id="top" className="relative bg-pole" style={{ height: reduced ? '100svh' : '210svh' }}>
      <div ref={stageRef} className="grain sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* клякса светлее поля */}
        <div
          aria-hidden="true"
          className="absolute -right-[22vw] top-[10%] h-[70vh] w-[78vw] bg-pole-2 md:-right-[8vw] md:top-[8%] md:h-[80vh] md:w-[50vw]"
          style={{ borderRadius: '42% 58% 63% 37% / 45% 38% 62% 55%', transform: `translateY(${-out * 40}px)` }}
        />

        {/* полоса маркера — под текстом */}
        {geo ? (
          <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox={`0 0 ${geo.W} ${geo.H}`} aria-hidden="true">
            <path
              ref={pathRef}
              d={geo.d}
              fill="none"
              stroke="#fff7da"
              strokeWidth={geo.fs * 0.46}
              strokeLinecap="butt"
              strokeLinejoin="round"
              strokeDasharray={geo.L || 1}
              strokeDashoffset={(geo.L || 1) * (1 - drawn)}
            />
          </svg>
        ) : null}

        <div
          className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-4 pb-20 pt-20 md:px-10 md:pb-24 md:pt-24"
        >
          <motion.p
            className="eyebrow mb-4 text-ink-2 md:mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Онлайн по России · очно в Иркутске<span className="hidden md:inline"> · 7 000 ₽ / час</span>
          </motion.p>

          <h1 ref={h1Ref} style={{ fontWeight: 880, color: '#463a10' }} className="display text-[11.4vw] md:text-[9.4vw] xl:text-[9.2rem]">
            <span className="block">
              <Word w="Корпоративное" i={0} />
            </span>
            <span className="block">
              <Word w="обучение" i={1} />{' '}
              <span ref={iiRef} className="inline-block">
                <Word w="ИИ" i={2} />
              </span>
            </span>
            <span className="block text-[0.6em] tracking-[-0.03em]">
              <span ref={l3Ref} className="inline-block">
                <Word w="для" i={3} /> <Word w="сотрудников" i={4} />
              </span>
            </span>
          </h1>

          <div className="mt-6 flex flex-col gap-6 md:mt-9 md:flex-row md:items-end md:justify-between md:gap-10">
            <motion.p
              className="max-w-[33rem] text-[1.04rem] leading-[1.5] md:text-[1.18rem]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.6 }}
            >
              Учим отдел работать с нейросетями на его собственных задачах: письма, КП, договоры,
              отчёты. Каждый уходит с готовыми промптами, правилами по данным и задачей, которую уже
              перевёл на ИИ.
            </motion.p>
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.7 }}
            >
              <a
                href="#zayavka"
                className="inline-flex min-h-13 items-center rounded-full bg-ink px-7 text-[1.02rem] font-semibold text-pole transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Программа и смета за день
              </a>
              <a
                href="#cena"
                className="inline-flex min-h-13 items-center rounded-full border-2 border-ink bg-pole/60 px-6 text-[1.02rem] font-semibold transition-colors duration-150 hover:bg-krem"
              >
                Группа до 15 человек
              </a>
            </motion.div>
          </div>
        </div>

        {/* маркер-персонаж: кончик на голове полосы */}
        {mk && geo ? (
          <MarkerAt
            x={mk.x}
            y={mk.y}
            angle={mk.a}
            width={`${(geo.fs * (geo.W < 768 ? 3.4 : 3.1)).toFixed(0)}px`}
            opacity={mkOpacity}
            className="z-20"
          />
        ) : null}

        {/* подсказка прокрутки: исчезает с первым движением */}
        <span
          className="absolute bottom-[58px] left-1/2 z-10 hidden -translate-x-1/2 text-[0.8rem] font-semibold text-ink-2 md:block"
          style={{ opacity: Math.max(0, 1 - p * 20) * Math.min(entr * 2, 1) }}
          aria-hidden="true"
        >
          листайте — маркер ведёт дальше ↓
        </span>

        {/* лента отделов (пауза наведением, WCAG 2.2.2) */}
        <div className="marquee-wrap relative z-10 mt-auto border-y-2 border-ink bg-pole-3" tabIndex={0} aria-label="Для каких отделов программа">
          <div className="marquee flex w-max whitespace-nowrap py-2.5 text-[0.95rem] font-semibold">
            {[0, 1].map((k) => (
              <span key={k} className="flex shrink-0" aria-hidden={k === 1}>
                {['Продажи', 'Маркетинг', 'HR и подбор', 'Бухгалтерия', 'Юристы', 'Руководители', 'Поддержка', 'Закупки', 'Офис и документы'].map((d) => (
                  <span key={d} className="flex items-center">
                    <span className="px-5">{d}</span>
                    <span className="inline-block h-2 w-2 rotate-45 bg-ink" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
