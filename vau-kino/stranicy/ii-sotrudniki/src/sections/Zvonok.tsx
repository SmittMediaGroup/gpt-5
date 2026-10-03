import { useMemo, useRef } from 'react'
import { lin, ramp, useNarrow, useSceneProgress } from '../lib/scene'

/**
 * СЦЕНА 3 «Звонок → резюме в сделке».
 * Такт 1 (0,04–0,36): головка проигрывания идёт по дорожке, реплики
 *   появляются, когда звук до них дошёл.
 * Такт 2 (0,36–0,56): в расшифровке подсвечиваются бюджет, возражение,
 *   следующий шаг — на полях встают ярлыки.
 * Такт 3 (0,56–0,86): расшифровка отходит на второй план, поля сделки
 *   заполняются по одному — резюме, следующий шаг, задача.
 * Такт 4 (0,86–1): штамп «Записано в сделку».
 * Так работает наше приложение для Битрикс24 (роли, резюме в сделку).
 */

type Rep = { at: number; who: 'М' | 'К'; text: string; mark?: [string, string] }
const REPLIKI: Rep[] = [
  { at: 0.02, who: 'М', text: 'Добрый день! Вы оставляли заявку на офисные кресла — удобно говорить?' },
  { at: 0.17, who: 'К', text: 'Да. Нужно двенадцать мест, в ноябре переезжаем в новый офис.' },
  { at: 0.33, who: 'М', text: 'Под какой бюджет смотрите?' },
  { at: 0.42, who: 'К', text: 'Согласует директор, но дороже прошлой закупки не пропустит.', mark: ['бюджет', 'дороже прошлой закупки не пропустит'] },
  { at: 0.6, who: 'К', text: 'И доставка у вас дольше, чем у других, — это смущает.', mark: ['возражение', 'доставка у вас дольше'] },
  { at: 0.76, who: 'М', text: 'Понял. Пришлю КП с двумя вариантами и сроками доставки до четверга.', mark: ['следующий шаг', 'КП с двумя вариантами и сроками доставки до четверга'] },
  { at: 0.92, who: 'К', text: 'Хорошо, жду.' },
]

const POLYA = [
  ['Резюме звонка', '12 кресел к переезду в ноябре. Бюджет — не выше прошлой закупки, решает директор. Смущает срок доставки.'],
  ['Следующий шаг', 'КП с двумя вариантами и сроками доставки — до четверга.'],
  ['Задача', '«Отправить КП» — ответственному менеджеру, срок: четверг.'],
]

function Mark({ text, mark, on }: { text: string; mark?: [string, string]; on: number }) {
  if (!mark) return <>{text}</>
  const i = text.indexOf(mark[1])
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <mark
        className="rounded-[4px] bg-transparent px-0.5 text-inherit"
        style={{
          backgroundImage: 'linear-gradient(oklch(0.8 0.21 148), oklch(0.8 0.21 148))',
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${on * 100}% 100%`,
        }}
      >
        {mark[1]}
      </mark>
      {text.slice(i + mark[1].length)}
    </>
  )
}

export function Zvonok() {
  const ref = useRef<HTMLElement>(null)
  const p = useSceneProgress(ref)
  const narrow = useNarrow()
  const nBars = narrow ? 44 : 84
  const bars = useMemo(
    () =>
      Array.from({ length: nBars }, (_, i) => {
        const x = i / nBars
        // кто говорит в этот момент — по репликам
        let who: 'М' | 'К' = 'М'
        for (const r of REPLIKI) if (x >= r.at) who = r.who
        const h = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43 + 1))
        return { h, who }
      }),
    [nBars],
  )

  const a = lin(p, 0.04, 0.36) // проиграно звука
  const svet = (k: number) => ramp(p, 0.36 + k * 0.06, 0.44 + k * 0.06) // подсветка k-й метки
  const otkhod = ramp(p, 0.56, 0.66)
  const pole = (k: number) => ramp(p, 0.6 + k * 0.08, 0.68 + k * 0.08)
  const shtamp = ramp(p, 0.86, 0.92)
  const vidno = REPLIKI.filter((r) => a >= r.at)
  const hvost = narrow ? vidno.slice(-3) : vidno

  const mm = Math.floor(a * 154)
  const vremya = `${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`

  let markIdx = -1

  return (
    <section
      ref={ref}
      data-status={p < 0.36 ? 'слушает звонок' : p < 0.56 ? 'отмечает главное' : p < 0.86 ? 'пишет резюме в сделку' : 'записал в сделку ✓'}
      className="zerno relative h-[320vh] bg-pole"
      aria-label="Сцена: запись звонка превращается в расшифровку, а затем в резюме и задачу в сделке CRM"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center px-4 pb-16 pt-[64px] sm:px-6 md:pb-8 md:pt-20">
          <p className="kapsy">Сцена 3 · расшифровщик звонков</p>
          <h2 className="head mt-2 max-w-[22ch] text-[clamp(2rem,8.4vw,2.9rem)] md:mt-3 md:text-[clamp(2.6rem,4.6vw,4.4rem)]">
            Звонок закончился. Резюме уже в&nbsp;сделке.
          </h2>

          {/* ПЛЕЕР */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-chern bg-bumaga px-3 py-2.5 md:mt-6 md:gap-5 md:px-5 md:py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-chern text-pole md:size-11" aria-hidden>
              {a > 0 && a < 1 ? '❚❚' : '▶'}
            </span>
            <div className="relative flex h-10 flex-1 items-center gap-[2px] md:h-14 md:gap-[3px]" aria-hidden>
              {bars.map((b, i) => {
                const played = i / nBars < a
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full ${b.who === 'М' ? 'bg-chern' : 'bg-glub'}`}
                    style={{ height: `${b.h * 100}%`, opacity: played ? 1 : 0.22 }}
                  />
                )
              })}
              <span
                className="absolute inset-y-[-6px] w-[3px] rounded-full bg-chern"
                style={{ left: `${a * 100}%`, opacity: a > 0 && a < 1 ? 1 : 0 }}
              />
            </div>
            <span className="mono shrink-0 text-xs font-bold md:text-sm">{vremya} / 02:34</span>
          </div>
          <div className="mono mt-2 flex gap-4 text-[0.7rem] font-semibold md:text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-full bg-chern" /> менеджер
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-full bg-glub" /> клиент
            </span>
          </div>

          <div className="mt-3 grid min-h-0 gap-3 md:mt-5 md:grid-cols-[7fr_5fr] md:items-stretch md:gap-6">
            {/* РАСШИФРОВКА */}
            <div
              className="flex min-h-0 flex-col overflow-hidden rounded-3xl border-2 border-chern bg-bumaga p-3 md:p-5"
              style={{ opacity: 1 - otkhod * 0.4, transform: `scale(${1 - otkhod * 0.03})` }}
            >
              <p className="kapsy mb-2 text-glub">расшифровка · роли определены</p>
              <div className="flex flex-col justify-end gap-2 overflow-hidden md:justify-start">
                {hvost.map((r) => {
                  if (r.mark) markIdx = REPLIKI.filter((x) => x.mark).indexOf(r)
                  const on = r.mark ? svet(markIdx) : 0
                  return (
                    <div key={r.at} className="flex gap-2.5 text-[0.88rem] leading-snug md:text-[1rem]">
                      <span
                        className={`mono mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-[0.7rem] font-bold ${
                          r.who === 'М' ? 'bg-chern text-pole' : 'bg-glub text-bumaga'
                        }`}
                      >
                        {r.who}
                      </span>
                      <p className="flex-1">
                        <Mark text={r.text} mark={r.mark} on={on} />
                        {r.mark && on > 0.05 && (
                          <span
                            className="mono ml-2 inline-block rounded-full border-2 border-chern px-2 text-[0.66rem] font-bold uppercase tracking-wider"
                            style={{ opacity: on }}
                          >
                            {r.mark[0]}
                          </span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* СДЕЛКА */}
            <div className="relative flex min-h-0 flex-col rounded-3xl border-2 border-chern bg-bumaga p-3 shadow-[0.5rem_0.6rem_0_oklch(0.45_0.12_148/0.45)] md:p-5">
              <div className="flex items-center justify-between">
                <p className="kapsy text-glub">сделка в CRM</p>
                <span className="mono rounded-full bg-myata px-2 py-0.5 text-[0.7rem] font-bold">этап: КП</span>
              </div>
              <p className="head mt-1 text-[1.5rem] md:text-[2rem]">Офисные кресла · 12 мест</p>
              <div className="mt-2 flex flex-col gap-1.5 md:mt-3 md:gap-2.5">
                {POLYA.map(([k, v], i) => {
                  const o = pole(i)
                  return (
                    <div key={k} className={`rounded-xl border-2 px-2.5 py-1.5 md:px-3 md:py-2 ${o > 0.02 ? 'border-chern bg-myata' : 'border-dashed border-chern/25'}`}>
                      <p className="mono text-[0.66rem] font-bold uppercase tracking-wider text-seryy md:text-[0.7rem]">{k}</p>
                      <p
                        className="text-[0.82rem] leading-snug md:text-[0.95rem]"
                        style={{ clipPath: `inset(0 ${(1 - o) * 100}% 0 0)` }}
                      >
                        {narrow && i === 0 ? '12 кресел к ноябрю; бюджет — не выше прошлой закупки; смущает доставка.' : v}
                      </p>
                    </div>
                  )
                })}
              </div>
              <div
                className="pointer-events-none absolute right-3 top-[-14px] rotate-[-6deg] rounded-xl border-[3px] border-chern bg-pole px-3 py-1 text-sm font-extrabold md:right-6 md:top-[-18px] md:text-base"
                style={{ opacity: shtamp, transform: `rotate(-6deg) scale(${1.4 - 0.4 * shtamp})` }}
              >
                ✓ Записано в сделку
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs md:mt-3 md:text-sm">
            Так работает наше приложение для Битрикс24. Диалог — пример; расшифровка считается на нашем
            сервере в России.
          </p>
        </div>
      </div>
    </section>
  )
}
