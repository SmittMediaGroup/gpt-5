import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStop } from '../lib/scene'

const EASE = [0.22, 1, 0.36, 1] as const

/** Штрихкод пропуска — детерминированный, без случайности между рендерами */
const BARS = Array.from({ length: 34 }, (_, i) => ({
  w: 1 + ((i * 7 + 3) % 4) * 0.55,
  gap: 0.35 + ((i * 5) % 3) * 0.3,
}))

export type Rol = {
  n: string
  title: string
  ikon: 'chat' | 'volna' | 'para' | 'stolb'
  ryady: [string, string][]
}

export const ROLI_PROPUSK: Rol[] = [
  {
    n: '0001',
    title: 'Менеджер по заявкам',
    ikon: 'chat',
    ryady: [
      ['Смена', '24/7, без выходных'],
      ['Каналы', 'сайт, Telegram, Авито'],
      ['Доступ', 'CRM: сделки и задачи'],
      ['Решения', 'за человеком'],
    ],
  },
  {
    n: '0002',
    title: 'Расшифровщик звонков',
    ikon: 'volna',
    ryady: [
      ['Смена', 'после каждого звонка'],
      ['Слушает', 'записи телефонии'],
      ['Пишет', 'резюме в сделку'],
      ['Аудио', 'удаляет за 24 часа'],
    ],
  },
  {
    n: '0003',
    title: 'Юрист-консультант',
    ikon: 'para',
    ryady: [
      ['Смена', 'по запросу'],
      ['Ищет', 'в действующих редакциях'],
      ['Выдаёт', 'справку со ссылкой'],
      ['Решения', 'за юристом'],
    ],
  },
  {
    n: '0004',
    title: 'Аналитик отзывов',
    ikon: 'stolb',
    ryady: [
      ['Смена', 'раз в неделю'],
      ['Читает', 'отзывы и анкеты'],
      ['Выдаёт', 'сводку по темам'],
      ['Не пишет', 'отзывы за клиентов'],
    ],
  },
]

function Ikon({ k }: { k: Rol['ikon'] }) {
  const c = 'currentColor'
  if (k === 'chat')
    return (
      <svg viewBox="0 0 40 32" className="w-[3em]" aria-hidden>
        <path d="M4 4h32v18H16l-8 7v-7H4z" fill="none" stroke={c} strokeWidth="3.2" strokeLinejoin="round" />
        <circle cx="13" cy="13" r="2.2" fill={c} />
        <circle cx="20" cy="13" r="2.2" fill={c} />
        <circle cx="27" cy="13" r="2.2" fill={c} />
      </svg>
    )
  if (k === 'para') return <span className="head text-[3.4em] leading-none">§</span>
  if (k === 'stolb')
    return (
      <svg viewBox="0 0 40 32" className="w-[3em]" aria-hidden>
        {[6, 14, 22, 30].map((x, i) => (
          <rect key={x} x={x - 3} y={30 - [12, 22, 8, 26][i]} width="6" height={[12, 22, 8, 26][i]} rx="1.5" fill={c} />
        ))}
      </svg>
    )
  return (
    <svg viewBox="0 0 40 24" className="w-[3.2em]" aria-hidden>
      {[4, 10, 16, 22, 28, 34].map((x, i) => (
        <rect key={x} x={x - 1.6} y={12 - [4, 8, 11, 7, 10, 5][i]} width="3.2" height={[4, 8, 11, 7, 10, 5][i] * 2} rx="1.6" fill={c} />
      ))}
    </svg>
  )
}

/**
 * Пропуск ИИ-сотрудника на ленте. Все размеры — в em: на телефоне
 * весь бейдж уменьшается одним font-size, пропорции не плывут.
 * typed — сколько букв должности уже «напечатано», stamp — штамп «в штате».
 */
export function Badge({
  rol = ROLI_PROPUSK[0],
  typed,
  stamp = 1,
  className = '',
}: {
  rol?: Rol
  typed?: number
  stamp?: number
  className?: string
}) {
  const t = typed === undefined ? rol.title : rol.title.slice(0, typed)
  const pechataet = typed !== undefined && typed < rol.title.length
  return (
    <div className={`relative w-[21em] ${className}`}>
      {/* клипса */}
      <div className="absolute left-1/2 top-[-1.2em] z-10 h-[2.4em] w-[4.6em] -translate-x-1/2 rounded-[0.7em] border-[0.22em] border-chern bg-bumaga" />
      <div className="relative overflow-hidden rounded-[1.6em] border-[0.22em] border-chern bg-bumaga shadow-[0.9em_1.1em_0_oklch(0.45_0.12_148/0.35)]">
        {/* прорезь */}
        <div className="absolute left-1/2 top-[1.5em] h-[0.7em] w-[3.4em] -translate-x-1/2 rounded-full bg-chern/85" />
        <div className="flex items-end justify-between bg-pole px-[1.4em] pb-[0.9em] pt-[3em]">
          <span className="mono text-[0.95em] font-bold tracking-[0.14em]">SMITT · ШТАТ</span>
          <span className="mono text-[0.95em] font-bold">№ {rol.n}</span>
        </div>
        <div className="px-[1.4em] pb-[1.3em] pt-[1.2em]">
          <div className="flex items-center gap-[1em]">
            {/* «фото» — не лицо, а знак роли */}
            <div className="relative grid size-[5.6em] shrink-0 place-items-center rounded-full border-[0.22em] border-chern bg-myata">
              <Ikon k={rol.ikon} />
              <span className="absolute bottom-[0.1em] right-[0.1em] size-[1.3em] rounded-full border-[0.2em] border-chern bg-pole" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mono text-[0.85em] font-semibold uppercase tracking-[0.12em] text-glub">ИИ-сотрудник</div>
              {/* место под две строки держим всегда — пропуск не прыгает при печати */}
              <div className="head relative leading-[0.95]" style={{ fontSize: Math.max(...rol.title.split(/[\s ]/).map((w) => w.length)) > 10 ? '1.82em' : '2.15em' }}>
                <span className="invisible block">{rol.title}</span>
                <span className="absolute inset-0">
                  {t}
                  {pechataet && <span className="ml-[0.04em] inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-chern" />}
                </span>
              </div>
            </div>
          </div>
          <dl className="mono mt-[1.2em] grid grid-cols-[auto_1fr] gap-x-[0.8em] gap-y-[0.35em] text-[0.92em] leading-snug">
            {rol.ryady.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-seryy">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-[1.1em] flex h-[2.6em] items-stretch" aria-hidden>
            {BARS.map((b, i) => (
              <span key={i} className="bg-chern" style={{ width: `${b.w * 0.16}em`, marginRight: `${b.gap * 0.16}em` }} />
            ))}
          </div>
        </div>
        {/* штамп «в штате» */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[1.1em] right-[0.9em] rounded-[0.5em] border-[0.22em] border-glub bg-bumaga/80 px-[0.6em] py-[0.15em] text-glub transition-[opacity,transform] duration-200 ease-out"
          style={{ opacity: stamp, transform: `rotate(-12deg) scale(${1.9 - 0.9 * stamp})` }}
        >
          <span className="mono text-[1em] font-extrabold tracking-[0.12em]">В ШТАТЕ</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Цикл пропуска в герое: должность печатается, штамп «в штате» бьёт,
 * через паузу пропуск переворачивается следующей ролью.
 */
function usePropusk(stopped: boolean) {
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState(0)
  const [stamp, setStamp] = useState(0)
  const [manual, setManual] = useState(0)
  useEffect(() => {
    const title = ROLI_PROPUSK[idx].title
    if (stopped) {
      setTyped(title.length)
      setStamp(1)
      return
    }
    const timers: number[] = []
    const start = idx === 0 && manual === 0 ? 700 : 420
    setTyped(0)
    setStamp(0)
    for (let k = 1; k <= title.length; k++) timers.push(window.setTimeout(() => setTyped(k), start + k * 36))
    const done = start + title.length * 36
    timers.push(window.setTimeout(() => setStamp(1), done + 150))
    timers.push(window.setTimeout(() => setIdx((i) => (i + 1) % ROLI_PROPUSK.length), done + 2700))
    return () => timers.forEach((t) => clearTimeout(t))
  }, [idx, stopped, manual])
  const go = (i: number) => {
    setIdx(i)
    setManual((m) => m + 1)
  }
  return { idx, typed, stamp, go }
}

export function Hero() {
  const { stopped } = useStop()
  const { idx, typed, stamp, go } = usePropusk(stopped)
  const words = ['ИИ-⁠сотрудники', 'для бизнеса']
  return (
    <section className="zerno relative flex min-h-[100svh] flex-col overflow-hidden bg-pole">
      {/* клякса за пропуском — та же семья, светлее поля */}
      <div
        aria-hidden
        className="absolute right-[-14vw] top-[-6vh] h-[78vh] w-[62vw] bg-pole-hi md:right-[-4vw] md:top-[8vh] md:h-[86vh] md:w-[44vw]"
        style={{ borderRadius: '42% 58% 63% 37% / 45% 38% 62% 55%' }}
      />
      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] flex-1 grid-cols-1 px-4 pt-14 sm:px-6 md:grid-cols-[1.3fr_0.7fr] md:gap-6">
        {/* ПРОПУСК НА ЛЕНТЕ — на телефоне сверху справа, на десктопе в правой колонке */}
        <div className="pointer-events-none relative order-1 h-[clamp(290px,44svh,370px)] md:order-2 md:h-auto">
          <motion.div
            className="absolute left-1/2 top-[-56px] -ml-[10.5em] flex flex-col items-center text-[9.2px] sm:text-[10px] md:left-[34%] md:text-[13.5px] lg:text-[14.5px]"
            style={{ transformOrigin: '50% 0%' }}
            initial={stopped ? false : { y: '-115%', rotate: -18 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{
              // падение — быстрая пружина, раскачка — мягкая с затуханием ~3 с
              y: { type: 'spring', stiffness: 170, damping: 16, mass: 1 },
              rotate: { type: 'spring', stiffness: 55, damping: 4.2, mass: 1, delay: 0.05 },
            }}
          >
            {/* лента */}
            <svg className="h-[15em] w-[8em] md:h-[16em]" viewBox="0 0 80 160" preserveAspectRatio="none" aria-hidden>
              <path d="M8 0 L36 160 L44 160 L72 0 Z" fill="oklch(0.45 0.12 148)" />
              <path d="M16 0 L38 150 L42 150 L64 0 Z" fill="oklch(0.6 0.17 148)" />
            </svg>
            <div style={{ perspective: '900px' }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={idx}
                  initial={{ rotateY: -90 }}
                  animate={{ rotateY: 0, transition: { duration: 0.3, ease: EASE } }}
                  exit={{ rotateY: 90, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }}
                >
                  <Badge rol={ROLI_PROPUSK[idx]} typed={typed} stamp={stamp} />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* переключатель ролей */}
            <div className="pointer-events-auto mt-[1.2em] flex gap-[0.5em]" role="tablist" aria-label="Роли на пропуске">
              {ROLI_PROPUSK.map((r, i) => (
                <button
                  key={r.n}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={r.title.replace(' ', ' ')}
                  onClick={() => go(i)}
                  className="grid h-[2.6em] min-h-6 place-items-center px-[0.3em]"
                >
                  <span
                    className={`block h-[0.7em] rounded-full border-[0.18em] border-chern transition-all duration-300 ${
                      i === idx ? 'w-[3em] bg-chern' : 'w-[0.9em] bg-bumaga'
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative order-2 flex flex-col justify-center pb-8 md:order-1 md:pb-16">
          <motion.p
            className="kapsy mb-4 flex items-center gap-2 md:mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <span className="tochka" aria-hidden /> В сети · смена 24/7 · в вашей CRM
          </motion.p>
          <h1 className="head text-[clamp(3.1rem,13.4vw,4.6rem)] md:text-[clamp(4rem,8.2vw,8.9rem)]">
            {words.map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.04em]">
                <motion.span
                  className="block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: EASE }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="mt-5 max-w-[34ch] text-[1.08rem] font-medium leading-snug md:mt-7 md:max-w-[40ch] md:text-[1.3rem]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
          >
            Отвечают на заявки ночью и в выходные, расшифровывают звонки, готовят справки и разбирают отзывы.
            Работают в вашей CRM и каналах, сложное отдают человеку.
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-9"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
          >
            <a
              href="#forma"
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-chern py-3 pl-5 pr-6 text-[1.02rem] font-bold text-pole transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] md:text-lg"
            >
              <span className="tochka" aria-hidden />
              <span className="sm:hidden">Разбор задачи — 30&nbsp;мин бесплатно</span><span className="hidden sm:inline">Разобрать мою задачу — 30&nbsp;минут бесплатно</span>
            </a>
            <a href="#noch" className="inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-[6px]">
              Что он делает в 03:14 ↓
            </a>
          </motion.div>
        </div>
      </div>

      {/* нижняя строка фактов — только опубликованное */}
      <div className="relative z-10 border-t-2 border-chern/80 bg-pole">
        <ul className="mx-auto grid max-w-[1240px] grid-cols-1 gap-x-8 gap-y-1 px-4 py-3 text-[0.92rem] font-semibold sm:grid-cols-3 sm:px-6 sm:py-4">
          <li>
            <span className="mono text-glub">01</span>&nbsp; Одна роль — от 7 дней до работы
          </li>
          <li className="hidden sm:list-item">
            <span className="mono text-glub">02</span>&nbsp; Каждое действие — строкой в журнале
          </li>
          <li className="hidden sm:list-item">
            <span className="mono text-glub">03</span>&nbsp; Расшифровка звонков — на сервере в России
          </li>
        </ul>
      </div>
    </section>
  )
}
