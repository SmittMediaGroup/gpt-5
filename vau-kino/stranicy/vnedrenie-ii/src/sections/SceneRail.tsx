import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useStage } from '../lib/useStage'
import { Kicker, clamp01 } from '../lib/ui'

/**
 * Сцена 3 «Рельс внедрения». Вертикальная прокрутка двигает рельс со станциями
 * влево; «вагончик-процесс» стоит на месте у левой трети экрана, и каждая
 * станция, проезжая мимо него, получает штамп «принято».
 */
const STATIONS = [
  {
    n: '00',
    t: 'Разбор',
    d: '30 минут, бесплатно',
    body: 'Вы рассказываете один процесс, который болит. Мы говорим честно: есть ли там что отдать ИИ и сколько примерно это будет стоить.',
    out: 'Ответ «да / нет» и вилка',
  },
  {
    n: '01',
    t: 'Аудит процессов',
    d: 'с людьми, которые их делают',
    body: 'Проходим процесс шаг за шагом: где руками переносят данные, где ищут ответы, где теряются заявки. Смотрим, где лежат данные и что нельзя выпускать наружу.',
    out: 'Карта: что делает ИИ, что — человек',
  },
  {
    n: '02',
    t: 'Пилот',
    d: 'один процесс, 2–4 недели',
    body: 'Запускаем на ваших реальных данных, а не на демо. Сравниваем «до» и «после» по вашим же показателям: скорость ответа, доля обработанных заявок, время на рутину.',
    out: 'Работающий пилот и замер',
  },
  {
    n: '03',
    t: 'Внедрение',
    d: 'интеграция и обучение',
    body: 'Подключаем к CRM, почте и документам, пишем регламент «кто проверяет ИИ», обучаем сотрудников работать с новым порядком.',
    out: 'Процесс работает каждый день',
  },
  {
    n: '04',
    t: 'Сопровождение',
    d: 'по договорённости',
    body: 'Следим за качеством ответов, правим правила и подсказки, берём следующий процесс — уже по готовой схеме.',
    out: 'Следующий процесс — быстрее',
  },
]

export function SceneRail() {
  const ref = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const stamps = useRef<(HTMLDivElement | null)[]>([])
  const cards = useRef<(HTMLDivElement | null)[]>([])
  const reduced = !!useReducedMotion()

  useStage(
    ref,
    (p) => {
      const tr = track.current
      const vp = viewport.current
      if (!tr || !vp) return
      const vw = vp.clientWidth
      const cartX = vw * (vw < 640 ? 0.5 : 0.3)
      const first = cards.current[0]
      const last = cards.current[cards.current.length - 1]
      if (!first || !last) return
      // сдвиг: от «первая станция у вагончика» до «последняя у вагончика»
      const c0 = first.offsetLeft + first.offsetWidth / 2
      const cN = last.offsetLeft + last.offsetWidth / 2
      const startShift = c0 - cartX - (vw < 640 ? 0 : 60)
      const q = Math.min(1, p / 0.88)
      const shift = reduced ? 0 : startShift + q * (cN - c0 + (vw < 640 ? 40 : 100))
      tr.style.transform = reduced ? 'none' : `translate3d(${-shift}px,0,0)`
      cards.current.forEach((el, i) => {
        if (!el) return
        const center = el.offsetLeft + el.offsetWidth / 2 - shift
        const st = reduced ? 1 : clamp01((cartX - center + 40) / 70)
        const s = stamps.current[i]
        if (s) {
          s.style.opacity = String(st)
          s.style.transform = `rotate(-8deg) scale(${1.5 - 0.5 * st})`
        }
      })
    },
    reduced,
  )

  return (
    <section
      id="etapy"
      ref={ref}
      className={`relative bg-rust ${reduced ? '' : 'h-[300svh] sm:h-[300vh]'}`}
      aria-label="Как проходит внедрение: пять этапов"
    >
      <div className={`${reduced ? 'py-20' : 'sticky top-0 h-[100svh]'} flex flex-col justify-center overflow-hidden`}>
        <div className="mx-auto w-full max-w-[1320px] px-4 pt-20 sm:px-8 sm:pt-24">
          <Kicker className="text-krem">Сцена 3 · как работаем</Kicker>
          <h2 className="display mt-3 max-w-[900px] text-[clamp(2rem,7.6vw,4.4rem)] font-[750] text-krem">
            От разбора до процесса, который работает сам
          </h2>
        </div>

        <div ref={viewport} className="relative mt-8 sm:mt-12">
          {/* рельс со шпалами */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-[30px] h-[22px] bg-[repeating-linear-gradient(90deg,oklch(0.975_0.02_75/0.28)_0_6px,transparent_6px_26px)]"
          />
          <div aria-hidden className="absolute inset-x-0 top-[33px] h-[4px] bg-krem/70" />
          <div aria-hidden className="absolute inset-x-0 top-[45px] h-[4px] bg-krem/70" />
          {/* вагончик-процесс стоит на месте, едет мир */}
          {!reduced && (
            <div
              aria-hidden
              className="absolute -top-[10px] z-20 -translate-x-1/2 left-1/2 sm:left-[30%]"
            >
              <div className="flex h-[56px] items-center gap-2 rounded-2xl border-[3px] border-choc bg-pole px-4 shadow-[0_14px_28px_-12px_oklch(0.2_0.05_40/0.8)]">
                <span className="h-3 w-3 animate-pulse rounded-full bg-krem" />
                <span className="mono text-[13px] font-bold text-choc sm:text-[14px]">ваш процесс</span>
              </div>
              <div className="mx-auto -mt-1 flex w-[70%] justify-between">
                <span className="h-3 w-3 rounded-full border-2 border-choc bg-krem" />
                <span className="h-3 w-3 rounded-full border-2 border-choc bg-krem" />
              </div>
            </div>
          )}

          <div
            ref={track}
            className={`relative flex gap-5 pt-[78px] will-change-transform sm:gap-8 ${
              reduced ? 'flex-wrap px-4 sm:px-8' : 'w-max pl-[50vw] pr-[50vw]'
            }`}
          >
            {STATIONS.map((s, i) => (
              <div
                key={s.n}
                ref={(el) => {
                  cards.current[i] = el
                }}
                className="relative w-[min(76vw,440px)] shrink-0"
              >
                <span aria-hidden className="absolute -top-[46px] left-8 h-[40px] w-[4px] bg-krem/60" />
                <div className="relative h-full rounded-[22px] bg-krem p-5 sm:p-7">
                  <div className="flex items-baseline justify-between">
                    <span className="display text-[44px] font-[850] leading-none text-rust sm:text-[56px]">{s.n}</span>
                    <span className="mono text-right text-[12px] font-semibold uppercase tracking-[0.08em] text-rust">
                      {s.d}
                    </span>
                  </div>
                  <h3 className="display mt-3 text-[28px] font-[750] text-choc sm:text-[34px]">{s.t}</h3>
                  <p className="mt-3 text-[15px] leading-[1.5] text-choc sm:text-[16px]">{s.body}</p>
                  <p className="mono mt-4 border-t-2 border-dashed border-choc/25 pt-3 text-[13px] font-semibold text-choc">
                    → {s.out}
                  </p>
                  <div
                    ref={(el) => {
                      stamps.current[i] = el
                    }}
                    aria-hidden
                    className="mono pointer-events-none absolute right-3 -top-4 rounded-lg border-[3px] border-rust bg-krem px-3 py-1 text-[13px] font-bold uppercase tracking-[0.12em] text-rust opacity-0"
                  >
                    принято
                  </div>
                </div>
              </div>
            ))}
            <a
              href="#razbor"
              className="focus-ring group relative flex w-[min(76vw,380px)] shrink-0 flex-col justify-between rounded-[22px] border-[3px] border-dashed border-krem/70 p-6 text-krem transition-colors hover:bg-krem/10 sm:p-8"
            >
              <span className="mono text-[12px] font-semibold uppercase tracking-[0.12em]">первая станция бесплатно</span>
              <span className="display mt-6 text-[30px] font-[750] leading-[1.05] sm:text-[38px]">
                Начать с разбора — 30 минут <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
