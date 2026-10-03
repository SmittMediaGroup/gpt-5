import { useMemo, useRef } from 'react'
import { lin, ramp, useSceneProgress } from '../lib/scene'

/**
 * СЦЕНА 2 «Табель: 45 → 168».
 * Недельный табель 7 × 24. Люди — будни 9:00–18:00 (5 × 9 = 45 часов).
 * По прокрутке остальные 123 клетки заливаются зелёным: сначала вечера
 * будней, потом ночи, потом выходные. Счётчик — чистая арифметика.
 */

const DNI = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const lyudi = (d: number, h: number) => d < 5 && h >= 9 && h < 18

type Cell = { d: number; h: number; rank: number }

function buildCells() {
  const cells: Cell[] = []
  for (let d = 0; d < 7; d++)
    for (let h = 0; h < 24; h++) {
      let rank = -1
      if (!lyudi(d, h)) {
        if (d < 5) rank = h >= 18 ? h - 18 : h + 6 // вечер 0–5, ночь и утро 6–14
        else rank = 20 + (h >= 18 ? h - 18 : h + 6) // выходные — последними
        rank = rank * 10 + d // внутри часа — по дням, волной
      }
      cells.push({ d, h, rank })
    }
  const empty = cells.filter((c) => c.rank >= 0).sort((a, b) => a.rank - b.rank)
  empty.forEach((c, i) => (c.rank = i / empty.length))
  return cells
}

export function Tabel() {
  const ref = useRef<HTMLElement>(null)
  const p = useSceneProgress(ref)
  const cells = useMemo(buildCells, [])
  const f = lin(p, 0.14, 0.8)
  const filled = cells.filter((c) => c.rank >= 0 && c.rank < f).length
  const chasy = 45 + filled
  const itog = ramp(p, 0.8, 0.9)

  return (
    <section
      ref={ref}
      data-status={`в табеле · ${chasy} ч в неделю`}
      className="relative h-[280vh] bg-bumaga"
      aria-label="Сцена: недельный табель — люди закрывают 45 часов, ИИ-⁠сотрудник заполняет остальные 123"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-myata" style={{ opacity: ramp(p, 0.5, 0.9) }} />
        <div className="relative mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center px-4 pb-16 pt-16 sm:px-6 md:pt-20">
          <p className="kapsy text-glub">Сцена 2 · табель отдела</p>
          <div className="mt-3 grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-10">
            <h2 className="head text-[clamp(2.2rem,8.6vw,3.2rem)] md:text-[clamp(2.6rem,4.8vw,4.6rem)]">
              Отдел на месте 45 часов в неделю. Заявки приходят все 168.
            </h2>
            <div className="flex items-baseline gap-3 md:justify-end">
              <span className="mono text-[clamp(3.6rem,17vw,5rem)] font-bold leading-none tracking-[-0.05em] md:text-[clamp(5rem,9vw,8.4rem)]">
                {chasy}
              </span>
              <span className="mono max-w-[11ch] text-sm font-semibold leading-tight md:text-base">
                часов в неделю под присмотром
              </span>
            </div>
          </div>

          {/* ТАБЕЛЬ */}
          <div className="mt-6 md:mt-10" role="img" aria-label={`Табель: ${chasy} из 168 часов закрыты`}>
            <div className="ml-7 grid grid-cols-4 text-[0.7rem] text-seryy md:ml-10 md:text-xs">
              {['00', '06', '12', '18'].map((h) => (
                <span key={h} className="mono">
                  {h}:00
                </span>
              ))}
            </div>
            <div className="mt-1 space-y-[3px] md:space-y-1.5">
              {DNI.map((den, d) => (
                <div key={den} className="flex items-center gap-1.5 md:gap-3">
                  <span className="mono w-6 shrink-0 text-xs font-bold md:w-7 md:text-sm">{den}</span>
                  <div className="grid flex-1 grid-cols-24 gap-[2px] md:gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                    {cells
                      .filter((c) => c.d === d)
                      .map((c) => {
                        const ppl = c.rank < 0
                        const on = !ppl && c.rank < f
                        return (
                          <div
                            key={c.h}
                            className={`relative h-[22px] overflow-hidden rounded-[3px] border md:h-[40px] md:rounded-md ${
                              ppl ? 'border-chern bg-glub' : 'border-chern/25 bg-bumaga'
                            }`}
                          >
                            {!ppl && (
                              <div
                                className="absolute inset-0 origin-bottom bg-pole transition-transform duration-300"
                                style={{ transform: `scaleY(${on ? 1 : 0})` }}
                              />
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <span className="inline-block size-4 rounded-[3px] border border-chern bg-glub" /> люди · 45 ч
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block size-4 rounded-[3px] border border-chern/40 bg-pole" /> ИИ-⁠сотрудник · {filled} ч
              </span>
              <span className="flex items-center gap-2 text-seryy">
                <span className="inline-block size-4 rounded-[3px] border border-chern/25 bg-bumaga" /> никого · {123 - filled} ч
              </span>
            </div>
          </div>

          <p
            className="mt-6 max-w-[60ch] text-[1.02rem] font-medium md:mt-8 md:text-[1.2rem]"
            style={{ opacity: 0.45 + 0.55 * itog }}
          >
            Люди остаются на своих часах. ИИ-⁠сотрудник закрывает остальные 123 — и днём подхватывает
            пики, когда все менеджеры на линии.
          </p>
        </div>
      </div>
    </section>
  )
}
