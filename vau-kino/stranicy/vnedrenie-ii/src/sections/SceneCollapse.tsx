import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useStage } from '../lib/useStage'
import { Kicker, lerp, seg } from '../lib/ui'

/**
 * Сцена 1 «Схема сворачивается».
 * Лист процесса «заявка → оплата» из 9 строк. Указатель идёт сверху вниз;
 * шаги, которые умеет делать ИИ, по одному перекрашиваются в сурик, затем
 * сворачиваются в подписанную полосу «ИИ · … — работает сам», лист сжимается.
 * Герой сцены — табло ручных шагов 9 → 3: цифра щёлкает при каждой смене.
 * Цифры — только счёт шагов схемы-примера, без выдуманных минут.
 */
type Step = { t: string; s: string; ai?: string }
const STEPS: Step[] = [
  { t: 'Заявку из почты и с сайта переносят в CRM', s: 'Заявка → CRM', ai: 'ИИ разбирает письмо и заводит сделку' },
  { t: 'Первый звонок клиенту', s: 'Первый звонок' },
  { t: 'Итог звонка вписывают в карточку', s: 'Итог звонка', ai: 'расшифровка и итог — в сделку' },
  { t: 'Ответы на типовые вопросы клиента', s: 'Типовые вопросы', ai: 'ассистент по вашей базе знаний' },
  { t: 'Сборка коммерческого предложения', s: 'Сборка КП', ai: 'черновик КП из данных сделки' },
  { t: 'Решение по цене и скидке', s: 'Цена и скидка' },
  { t: 'Проверка договора на риски', s: 'Проверка договора', ai: 'ИИ отмечает пункты, юрист решает' },
  { t: 'Контроль качества звонков', s: 'Контроль звонков', ai: 'чек-лист скрипта по каждому звонку' },
  { t: 'Договорённость и подпись', s: 'Подпись' },
]
const AI_IDX = STEPS.map((s, i) => (s.ai ? i : -1)).filter((i) => i >= 0)
const START = 0.1
const SPAN = 0.76 / AI_IDX.length

export function SceneCollapse() {
  const ref = useRef<HTMLElement>(null)
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const counter = useRef<HTMLSpanElement>(null)
  const ticks = useRef<(HTMLSpanElement | null)[]>([])
  const scan = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const sheetBg = useRef<HTMLDivElement>(null)
  const foot = useRef<HTMLDivElement>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const shown = useRef(STEPS.length)
  const reduced = !!useReducedMotion()

  useStage(
    ref,
    (p) => {
      const mobile = window.innerWidth < 640
      const H = mobile ? 44 : window.innerHeight < 820 ? 52 : 58
      const GAP = mobile ? 5 : 7
      const STRIP = mobile ? 20 : 24
      let y = 0
      let left = STEPS.length
      let scanY = 0
      let scanOn = 0
      STEPS.forEach((_s, i) => {
        const el = rows.current[i]
        if (!el) return
        const k = AI_IDX.indexOf(i)
        let flip = 0
        let fold = 0
        if (k >= 0) {
          const a = START + k * SPAN
          flip = seg(p, a, a + SPAN * 0.45)
          fold = seg(p, a + SPAN * 0.5, a + SPAN)
          if (flip > 0.5) left--
          if (p >= a && p <= a + SPAN) {
            scanY = y + H / 2
            scanOn = 1
          }
          const t = ticks.current[k]
          if (t) t.dataset.on = flip > 0.5 ? '1' : '0'
        }
        const h = lerp(H, STRIP, fold)
        el.style.transform = `translate3d(0,${y}px,0)`
        el.style.height = `${H}px`
        const bg = el.firstElementChild as HTMLElement
        bg.style.transform = `scaleY(${h / H})`
        const ai = bg.firstElementChild as HTMLElement
        ai.style.opacity = String(flip)
        const body = el.children[1] as HTMLElement
        body.style.opacity = String(1 - seg(fold, 0, 0.4))
        body.querySelectorAll<HTMLElement>('[data-hand]').forEach((n) => (n.style.opacity = String(1 - flip)))
        body.querySelectorAll<HTMLElement>('[data-ai]').forEach((n) => (n.style.opacity = String(flip)))
        const strip = el.children[2] as HTMLElement | undefined
        if (strip) {
          strip.style.height = `${STRIP}px`
          strip.style.opacity = String(seg(fold, 0.55, 1))
        }
        y += h + GAP
      })
      const full = STEPS.length * (H + GAP) - GAP
      if (sheet.current) sheet.current.style.height = `${full}px`
      if (sheetBg.current) {
        const pad = mobile ? 16 : 24
        sheetBg.current.style.transform = `scaleY(${(y - GAP + pad) / (full + pad)})`
      }
      const end = seg(p, 0.86, 0.96)
      if (foot.current) {
        foot.current.style.transform = `translate3d(0,${y + 8}px,0)`
        foot.current.style.opacity = String(end)
      }
      if (wrap.current) wrap.current.style.transform = `translate3d(0,${(full - (y - GAP)) / 2 - 18 * end}px,0)`
      // табло: цифра «щёлкает» только при смене значения
      if (counter.current && shown.current !== left) {
        shown.current = left
        const c = counter.current
        c.textContent = String(left)
        c.classList.remove('flap')
        void c.offsetWidth
        c.classList.add('flap')
      }
      if (scan.current) {
        scan.current.style.transform = `translate3d(0,${scanY - 9}px,0)`
        scan.current.style.opacity = String(scanOn)
      }
    },
    reduced,
  )

  return (
    <section
      id="shema"
      ref={ref}
      className={`relative bg-pole ${reduced ? '' : 'h-[300svh] sm:h-[280vh]'}`}
      aria-label="Схема процесса: ручные шаги заменяются автоматическими"
    >
      <div className={`${reduced ? '' : 'sticky top-0 h-[100svh]'} overflow-hidden`}>
        <div className="mx-auto grid h-full max-w-[1320px] content-center gap-4 px-4 pb-4 pt-[72px] sm:gap-8 sm:px-8 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <div className="grid grid-cols-[1fr_auto] items-end gap-x-4 lg:block">
            <div>
              <Kicker className="text-choc">Сцена 1 · схема-пример</Kicker>
              <h2 className="display mt-2 text-[clamp(1.9rem,8vw,3.7rem)] font-[750] text-choc sm:mt-3">
                Ручные шаги уходят по&nbsp;одному
              </h2>
            </div>
            {/* табло — герой сцены */}
            <div className="lg:mt-8">
              <div className="flex items-end gap-5">
                <div className="relative rounded-[18px] bg-choc p-2 [perspective:600px] sm:rounded-[26px] sm:p-3">
                  <span
                    ref={counter}
                    className="display block min-w-[0.72em] origin-top rounded-[12px] bg-krem px-[0.08em] pt-[0.08em] text-center text-[clamp(5.2rem,26vw,15rem)] font-[850] leading-[0.82] text-rust sm:rounded-[18px]"
                    aria-live="off"
                  >
                    9
                  </span>
                  <span aria-hidden className="absolute inset-x-2 top-1/2 h-[3px] -translate-y-1/2 bg-choc/80 sm:inset-x-3" />
                </div>
                <span className="hidden pb-3 text-[20px] font-semibold leading-snug text-choc lg:block">
                  ручных шагов
                  <br />
                  из 9 осталось
                </span>
              </div>
              <div className="mt-3 flex gap-1.5 lg:mt-5 lg:gap-2" aria-hidden>
                {STEPS.map((st, i) => {
                  const k = AI_IDX.indexOf(i)
                  return (
                    <span
                      key={i}
                      ref={
                        k >= 0
                          ? (el) => {
                              ticks.current[k] = el
                            }
                          : undefined
                      }
                      data-on="0"
                      className={`h-2.5 flex-1 rounded-sm lg:h-3.5 lg:w-7 lg:flex-none ${st.ai ? 'tick-ai' : 'bg-choc'}`}
                    />
                  )
                })}
              </div>
            </div>
            <p className="mt-6 hidden max-w-[470px] text-[17px] leading-[1.55] text-choc lg:block">
              Берём ваш процесс, отмечаем каждый шаг, который сотрудник делает руками, и забираем те,
              где ИИ справляется надёжно. Свёрнутый шаг не исчезает: он работает сам, а человек
              проверяет итог. Переговоры, деньги и подпись остаются людям.
            </p>
          </div>

          <div>
            <div className="mono mb-2 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-choc sm:mb-3 sm:text-[12px]">
              <span>Лист процесса · заявка → оплата</span>
              <span className="hidden sm:inline">отдел продаж</span>
            </div>
            <div ref={wrap} className="relative w-full p-2 will-change-transform sm:p-3">
              <div
                ref={sheetBg}
                aria-hidden
                className="absolute inset-0 origin-top rounded-[18px] bg-krem shadow-[0_30px_60px_-30px_oklch(0.4_0.12_40/0.6)]"
              />
              <div ref={sheet} className="relative" style={{ height: 560 }}>
                {STEPS.map((s, i) => (
                  <div
                    key={s.t}
                    ref={(el) => {
                      rows.current[i] = el
                    }}
                    className="absolute inset-x-0 top-0 will-change-transform"
                    style={{ height: 58 }}
                  >
                    <div
                      className={`absolute inset-0 origin-top overflow-hidden rounded-xl ${
                        s.ai ? 'hatch bg-krem2' : 'border-2 border-choc bg-peach'
                      }`}
                    >
                      <div className="absolute inset-0 bg-rust opacity-0" />
                    </div>
                    <div className="relative flex h-full items-center gap-3 px-3 sm:px-4">
                      <span className="mono w-6 shrink-0 text-[12px] font-semibold text-choc/80 sm:text-[13px]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="relative min-w-0 flex-1 leading-tight">
                        <span data-hand className="block">
                          <span className="block truncate text-[14px] font-semibold text-choc sm:hidden">{s.s}</span>
                          <span className="hidden truncate text-[16px] font-semibold text-choc sm:block lg:text-[17px]">
                            {s.t}
                          </span>
                        </span>
                        {s.ai && (
                          <span
                            data-ai
                            className="absolute inset-0 flex items-center truncate text-[14px] font-semibold text-krem opacity-0 sm:text-[16px] lg:text-[17px]"
                          >
                            {s.ai}
                          </span>
                        )}
                      </span>
                      {s.ai ? (
                        <span className="relative shrink-0">
                          <span
                            data-hand
                            className="mono block rounded-full border border-choc/60 px-2.5 py-1 text-[11px] font-semibold text-choc sm:text-[12px]"
                          >
                            руками
                          </span>
                          <span
                            data-ai
                            className="mono absolute right-0 top-1/2 block -translate-y-1/2 whitespace-nowrap rounded-full bg-krem px-2.5 py-1 text-[11px] font-bold text-rust opacity-0 sm:text-[12px]"
                          >
                            ИИ ✓
                          </span>
                        </span>
                      ) : (
                        <span className="mono block shrink-0 rounded-full bg-choc px-2.5 py-1 text-[11px] font-semibold text-krem sm:text-[12px]">
                          человек
                        </span>
                      )}
                    </div>
                    {s.ai && (
                      /* свёрнутый шаг: работает сам, подписан */
                      <div className="mono absolute inset-x-0 top-0 flex items-center gap-2 px-3 text-[11px] font-semibold text-krem opacity-0 sm:px-4 sm:text-[12px]">
                        <span className="rounded-[4px] bg-krem px-1.5 leading-[1.5] text-rust">ИИ</span>
                        <span className="truncate">{s.s.charAt(0).toLowerCase() + s.s.slice(1)} — работает сам</span>
                        <span className="ml-auto hidden sm:inline">авто ✓</span>
                      </div>
                    )}
                  </div>
                ))}
                <div
                  ref={foot}
                  className="mono absolute inset-x-0 top-0 pl-1 pt-2 text-[12px] font-semibold text-choc opacity-0 sm:text-[14px]"
                >
                  6 шагов свёрнуты: их делает ИИ, человек проверяет итог
                </div>
                <div
                  ref={scan}
                  aria-hidden
                  className="pointer-events-none absolute -left-[22px] top-0 h-0 w-0 border-y-[9px] border-l-[12px] border-y-transparent border-l-choc opacity-0 sm:-left-[30px] sm:border-y-[11px] sm:border-l-[15px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
