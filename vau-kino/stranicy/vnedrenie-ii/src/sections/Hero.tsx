import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CtaButton } from '../lib/ui'

const EASE = [0.22, 1, 0.36, 1] as const
const BASE = import.meta.env.BASE_URL
const VIDEO = `${BASE}media/geroy.mp4`
const POSTER = `${BASE}media/geroy-poster.jpg`

/** Частицы-вырезки из стоп-кадра: живут орбитой после замирания.
 *  Кладутся blend screen — тёмный фон вырезки исчезает на тёмном кино. */
const PARTS = [
  { src: 'part-1.png', left: '13%', top: '26%', w: 44, dur: 9.5, delay: 0.0, dx: 10, dy: -16, rot: 14 },
  { src: 'part-2.png', left: '82%', top: '22%', w: 36, dur: 11, delay: 1.2, dx: -12, dy: 12, rot: -10 },
  { src: 'part-3.png', left: '8%', top: '58%', w: 30, dur: 8.5, delay: 0.6, dx: 14, dy: 10, rot: 18 },
  { src: 'part-4.png', left: '88%', top: '55%', w: 42, dur: 10.5, delay: 2.0, dx: -10, dy: -14, rot: -16 },
  { src: 'part-5.png', left: '24%', top: '12%', w: 26, dur: 12, delay: 0.3, dx: 8, dy: 12, rot: 22 },
  { src: 'part-6.png', left: '72%', top: '80%', w: 34, dur: 9, delay: 1.6, dx: -14, dy: -10, rot: -20 },
]

export function Hero() {
  const reduced = useReducedMotion()
  const vref = useRef<HTMLVideoElement>(null)
  const [frozen, setFrozen] = useState(false)

  useEffect(() => {
    if (reduced) {
      setFrozen(true)
      return
    }
    const v = vref.current
    if (!v) return
    // автоплей могли заблокировать (экономия энергии) — тогда сразу стоп-кадр
    const guard = window.setTimeout(() => {
      if (v.paused && v.currentTime < 0.2) setFrozen(true)
    }, 3000)
    const p = v.play()
    if (p) p.catch(() => setFrozen(true))
    return () => window.clearTimeout(guard)
  }, [reduced])

  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#150d07]"
    >
      {/* ── слой 1: гигантский заголовок ЗА предметом ── */}
      <h1 className="display pointer-events-none absolute inset-x-0 top-[15svh] z-[1] select-none text-center font-[800] leading-[0.94] tracking-[-0.01em] text-[#d8a35d] sm:top-[13svh] sm:leading-[0.9]">
        <span className="block overflow-hidden">
          <motion.span
            className="block text-[16.5vw] sm:text-[13vw]"
            initial={{ y: '108%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            ВНЕДРЕНИЕ
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span
            className="block text-[16.5vw] sm:text-[13vw]"
            initial={{ y: '108%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            ИИ
            <motion.em
              className="ml-[0.35em] inline-block align-[0.18em] font-sans text-[4.2vw] font-[300] italic tracking-[0.02em] text-[#c89865] sm:text-[2.4vw]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.1, ease: EASE }}
            >
              в бизнес
            </motion.em>
          </motion.span>
        </span>
      </h1>

      {/* ── слой 2: кино. Тёмный фон ролика пропадает на blend lighten,
             предмет перекрывает буквы ── */}
      <div className="absolute inset-0 z-[2] mix-blend-lighten">
        <img
          src={POSTER}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[50%_44%]"
        />
        {!reduced && (
          <video
            ref={vref}
            className={`absolute inset-0 h-full w-full object-cover object-[50%_44%] transition-opacity duration-700 ${
              frozen ? 'opacity-0' : 'opacity-100'
            }`}
            src={VIDEO}
            poster={POSTER}
            muted
            playsInline
            autoPlay
            preload="auto"
            onEnded={() => setFrozen(true)}
          />
        )}
      </div>

      {/* ── слой 3: частицы орбитой — кадр дышит после замирания ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] hidden sm:block">
        {PARTS.map((p) => (
          <img
            key={p.src}
            src={`${BASE}media/${p.src}`}
            alt=""
            className="kino-part absolute mix-blend-screen"
            style={
              {
                left: p.left,
                top: p.top,
                width: p.w,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* ── слой 4: scrim-виньетка и зерно ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 42%, transparent 48%, rgba(10,6,3,0.55) 100%), linear-gradient(to top, rgba(10,6,3,0.72) 0%, transparent 26%), linear-gradient(to bottom, rgba(10,6,3,0.5) 0%, transparent 18%)',
        }}
      />
      <div aria-hidden className="grain absolute inset-0 z-[5]" />

      {/* ── слой 5: hairline-UI ── */}
      <div className="relative z-[6] mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 pb-7 pt-24 sm:px-8 sm:pb-9">
        <motion.div
          className="mt-auto flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
        >
          <div className="max-w-[560px]">
            <p className="mono border-l border-[#d8a35d]/40 pl-4 text-[12px] leading-[1.75] text-[#eadfcd]/85 sm:text-[13px]">
              Разрозненные ручные шаги процесса собираются
              <br className="hidden sm:block" /> в работающий механизм: аудит → пилот на одном
              процессе
              <br className="hidden sm:block" /> за 2–4 недели → внедрение с CRM и обучением команды.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <CtaButton tone="krem">Разобрать мой процесс — 30 минут бесплатно</CtaButton>
            </div>
          </div>
          <a
            href="#shema"
            className="focus-ring mono hidden items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#eadfcd]/60 transition-colors hover:text-[#eadfcd] sm:inline-flex"
          >
            как это выглядит
            <span aria-hidden className="inline-block h-8 w-px bg-[#d8a35d]/50" />
            <span aria-hidden className="animate-bounce">↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/** Шов «тёмное кино → светлые секции»: подпись-hairline на тёмном,
 *  затем кремовый язык с большим радиусом. */
export function KinoShov() {
  return (
    <div className="relative -mt-px bg-[#150d07]">
      <div aria-hidden className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 pb-8 pt-1 sm:px-8">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[#d8a35d]/75 sm:text-[11px]">
          дальше — как это устроено
        </span>
        <span className="h-px flex-1 bg-[#d8a35d]/25" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[#d8a35d]/45 sm:text-[11px]">
          smg · внедрение ИИ
        </span>
      </div>
      <div className="h-10 rounded-t-[36px] bg-krem sm:h-16 sm:rounded-t-[64px]" />
    </div>
  )
}
