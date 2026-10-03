import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { MEDIA } from '../data/clips'
import { useContent } from '../content/useContent'

/** Минимальная цена букета — считается по программе вечера, а не вписана */
function minPrice(items: { price: string }[]): string {
  const nums = items
    .map((i) => Number(String(i.price).replace(/[^0-9]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!nums.length) return ''
  return `от ${Math.min(...nums).toLocaleString('ru-RU')} ₽`
}

const EXPO = [0.16, 1, 0.3, 1] as const
const QUINT = [0.22, 1, 0.36, 1] as const
const PAUSE_KEY = 'nokturn-pause'

/** Лепесток, нарисованный от руки: два слоя одной семьи, без контура */
function Petal({ tone, light }: { tone: string; light: string }) {
  return (
    <svg viewBox="0 0 60 90" className="block h-full w-full" aria-hidden>
      <path d="M30 2C52 18 60 46 46 72 39 85 21 85 14 72 0 46 8 18 30 2Z" fill={tone} />
      <path d="M30 10C44 24 48 46 39 64 35 72 25 72 21 64 13 46 17 24 30 10Z" fill={light} />
    </svg>
  )
}

/* Где висят лепестки: доля ширины/высоты экрана, размер в rem, слой.
   front — ПЕРЕД именем (пролетают сквозь буквы), иначе — за пионом. */
const PETALS = [
  /* x,y — телефон; xd,yd — десктоп (на десктопе левая колонка занята текстом) */
  { x: 7, y: 68, xd: 46, yd: 90, s: 2.6, r: -24, t: 7.2, d: 0, front: true, tone: '#f25c8a', light: '#ff9ebb', mob: true },
  { x: 88, y: 66, xd: 91, yd: 64, s: 3.2, r: 32, t: 8.6, d: -2.4, front: true, tone: '#ff9ebb', light: '#ffd3e2', mob: true },
  { x: 20, y: 17, xd: 44, yd: 16, s: 2.1, r: 12, t: 6.4, d: -1.1, front: false, tone: '#ffd3e2', light: '#fff5ea', mob: true },
  { x: 95, y: 30, xd: 96, yd: 33, s: 2.4, r: -40, t: 9.1, d: -4.0, front: false, tone: '#f25c8a', light: '#ffd3e2', mob: false },
  { x: 39, y: 88, xd: 4, yd: 80, s: 1.8, r: 64, t: 7.8, d: -3.2, front: true, tone: '#d81b60', light: '#f25c8a', mob: false },
]

/**
 * Первый экран, третья редакция (03.10.2026): ЦВЕТ ПОЛЕМ 30–45 %, КРЕМ ВОКРУГ.
 *
 * Прошлая редакция (02.10) залила малиновым 90 % экрана — красочно, но это
 * уже не поле, а стена: нейтрального 4 %, глазу негде отдохнуть, и герой
 * спорил с кремовой страницей ниже. Замер галерей для ярких сайтов: заливка
 * 25–60 %, светлый нейтральный 20–40 %, тёмное меньше 10 %, одна семья тонов.
 *
 * Поле — круг («луна» ночной пьесы) на кремовом. Имя во всю ширину лежит
 * ПОПЕРЁК круга и меняет цвет на его границе: малиновое на креме, кремовое
 * на малиновом — это одна и та же строка, второй её экземпляр обрезан тем же
 * кругом. Вход — круг разливается из точки, и граница цвета проходит по
 * буквам волной. Пион рисованный (вектор, 35 КБ) и на телефоне, и на
 * десктопе: одна семья розовых и легче фотовырезки в 5,5 раза.
 */
export function Hero({ go }: { go: boolean }) {
  const txt = useContent()
  const reduced = useReducedMotion()
  const price = minPrice(txt.bouquets.items)
  const letters = Array.from(txt.header.brand.toUpperCase())

  /* WCAG 2.2.2: петли дольше 5 с обязаны останавливаться по просьбе */
  const [paused, setPaused] = useState(() => {
    try {
      return localStorage.getItem(PAUSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const togglePause = () => {
    setPaused((v) => {
      try {
        localStorage.setItem(PAUSE_KEY, v ? '0' : '1')
      } catch {
        /* приватный режим — просто не запоминаем */
      }
      return !v
    })
  }
  const still = Boolean(reduced) || paused

  /* Радиус круга-поля 0…1: им же обрезан кремовый экземпляр имени,
     поэтому граница цвета на буквах всегда совпадает с краем поля. */
  const k = useMotionValue(reduced ? 1 : 0)
  const clip = useTransform(k, (v) => `circle(calc(var(--R) * ${v}) at var(--cx) var(--cy))`)
  useEffect(() => {
    if (!go) return
    if (reduced) {
      k.set(1)
      return
    }
    const c = animate(k, 1, { duration: 1.05, ease: EXPO })
    return () => c.stop()
  }, [go, reduced, k])

  /* Пион слегка поворачивается за курсором: движение от человека, не петля */
  const sectionRef = useRef<HTMLElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const px = useTransform(sx, (v) => v * 16)
  const py = useTransform(sy, (v) => v * 10)
  const pr = useTransform(sx, (v) => v * 4)
  useEffect(() => {
    if (still || !window.matchMedia('(pointer: fine)').matches) {
      mx.set(0)
      my.set(0)
      return
    }
    const el = sectionRef.current
    const on = (e: PointerEvent) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1)
      my.set(((e.clientY - r.top) / r.height) * 2 - 1)
    }
    window.addEventListener('pointermove', on, { passive: true })
    return () => window.removeEventListener('pointermove', on)
  }, [still, mx, my])

  const show = go || Boolean(reduced)
  const letter = (i: number) => ({
    initial: reduced ? false : { y: '38%', opacity: 0 },
    animate: show ? { y: '0%', opacity: 1 } : {},
    transition: { duration: 0.6, delay: 0.12 + i * 0.06, ease: QUINT },
  })

  const word = (cls: string) => (
    <div aria-hidden className="g3-word-row">
      <span className={`g3-word ${cls}`}>
        {letters.map((ch, i) => (
          <motion.span key={i} className="inline-block" {...letter(i)}>
            {ch}
          </motion.span>
        ))}
      </span>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      id="top"
      className={`g3-hero relative overflow-hidden bg-velvet ${still ? 'g3-still' : ''}`}
    >
      {/* 1. поле: круг одного тона + клякса на шаг светлее внутри него */}
      <motion.div aria-hidden className="g3-field absolute inset-0" style={{ clipPath: clip }}>
        <div className="g3-klyaksa" />
      </motion.div>

      {/* 2. лепестки ЗА пионом */}
      {PETALS.filter((p) => !p.front).map((p, i) => (
        <PetalAt key={`b${i}`} p={p} />
      ))}

      {/* 3. имя во всю ширину: малиновое по крему ... */}
      {word('text-[var(--pole)]')}
      {/* ... и кремовое там, где под ним поле: тот же текст, тот же круг */}
      <motion.div aria-hidden className="g3-word-clip absolute inset-0" style={{ clipPath: clip }}>
        {word('text-[#fff5ea]')}
      </motion.div>

      {/* 4. пион стоит НА имени, как на полке: нижние лепестки заходят
             на буквы — предмет проходит сквозь заголовок, а не висит над ним */}
      <div aria-hidden className="g3-pion-pos">
        <motion.div style={{ x: px, y: py, rotate: pr }} className="h-full w-full">
          <motion.img
            src={MEDIA.pionRisovanny}
            alt=""
            fetchPriority="high"
            decoding="async"
            width={1616}
            height={1676}
            className="g3-pion h-full w-full"
            initial={reduced ? false : { scale: 0.78, rotate: -14, opacity: 0 }}
            animate={show ? { scale: 1, rotate: 0, opacity: 1 } : {}}
            transition={{ duration: 0.95, delay: 0.08, ease: EXPO }}
          />
        </motion.div>
      </div>

      {/* 5. лепестки ПЕРЕД именем */}
      {PETALS.filter((p) => p.front).map((p, i) => (
        <PetalAt key={`f${i}`} p={p} />
      ))}

      {/* 6. печать с ценой на кромке поля: текст по кругу, цена в центре.
             Цена считается по программе вечера, а не вписана. */}
      {price ? (
        <motion.div
          className="g3-seal hidden md:block"
          initial={reduced ? false : { scale: 0.6, opacity: 0 }}
          animate={show ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.45, ease: QUINT }}
        >
          <svg viewBox="0 0 200 200" className="g3-seal-ring absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <path id="g3-arc" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            <text className="g3-seal-text">
              <textPath href="#g3-arc">{`${txt.bouquets.title} · `}</textPath>
            </text>
          </svg>
          <a
            href="#opus"
            className="relative flex h-full w-full flex-col items-center justify-center rounded-full text-center"
          >
            <span className="text-[0.62rem] tracking-[0.2em] text-[#9e0f45] uppercase">букет</span>
            <span className="display mt-1 text-[1.12rem] leading-none text-[#2b1320]">{price}</span>
          </a>
        </motion.div>
      ) : null}

      {/* 7. текст: на телефоне под именем, на десктопе колонкой слева */}
      <motion.div
        className="g3-copy"
        initial={reduced ? false : { opacity: 0, y: 14 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5, ease: QUINT }}
      >
        <p className="text-[0.66rem] tracking-[0.28em] text-[#9e0f45] uppercase md:text-[0.7rem]">
          {txt.hero.meaning}
        </p>
        <h1 className="display mt-2 text-[clamp(1.55rem,3.3vw,3.1rem)] text-bone md:mt-4">
          {txt.hero.title}
        </h1>
        <p className="mt-4 hidden max-w-[40ch] text-[0.95rem] text-smoke md:block">{txt.hero.text}</p>
        <div className="mt-5 flex items-center justify-between gap-4 md:mt-7 md:justify-start md:gap-6">
          <a
            href="#atelier"
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--pole)] px-6 text-sm font-medium text-[#fff5ea] shadow-[0_10px_30px_-12px_rgba(158,15,69,0.7)] transition-[background-color,transform] duration-200 hover:bg-[#b0124a] active:scale-[0.98]"
          >
            {txt.header.navAtelier} →
          </a>
          {price ? <span className="display text-[1.45rem] text-bone md:hidden">{price}</span> : null}
          <a
            href="#bloom"
            className="group hidden min-h-11 items-center gap-2 text-xs tracking-[0.22em] text-smoke uppercase transition-colors duration-200 hover:text-bone md:inline-flex"
          >
            {txt.hero.cta}
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 group-hover:translate-y-0.5"
            >
              ↓
            </span>
          </a>
        </div>
      </motion.div>

      {/* 8. стоп-кнопка: петли (лепестки, печать) дольше 5 с — WCAG 2.2.2 */}
      {reduced ? null : (
        <button
          type="button"
          onClick={togglePause}
          aria-pressed={paused}
          aria-label={paused ? 'Включить анимацию' : 'Остановить анимацию'}
          title={paused ? 'Включить анимацию' : 'Остановить анимацию'}
          className="g3-pause"
        >
          {paused ? (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
              <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </section>
  )
}

function PetalAt({ p }: { p: (typeof PETALS)[number] }) {
  return (
    <div
      aria-hidden
      className={`g3-petal ${p.mob ? '' : 'hidden md:block'}`}
      style={
        {
          '--pxm': `${p.x}%`,
          '--pym': `${p.y}%`,
          '--pxd': `${p.xd}%`,
          '--pyd': `${p.yd}%`,
          width: `${p.s}rem`,
          height: `${p.s * 1.5}rem`,
          zIndex: p.front ? 6 : 2,
          '--pr': `${p.r}deg`,
          '--pt': `${p.t}s`,
          '--pd': `${p.d}s`,
        } as React.CSSProperties
      }
    >
      <Petal tone={p.tone} light={p.light} />
    </div>
  )
}
