import { useRef } from 'react'
import { lin, ramp, rub, useIsPhone, useSceneProgress } from '../lib/hooks'
import { MarkerAt } from './Marker'

/**
 * СЦЕНА 2 «Класс из 15 мест».
 * Механизм: прокрутка рассаживает группу. Пятнадцать мест — ровно столько,
 * сколько входит в одну ставку. Каждый новый участник приходит со своей задачей
 * из своего отдела, а счётчик «цена часа на одного» падает: 7 000 ₽ / n.
 * Число не придумано — это арифметика ставки владельца (7 000 ₽ за час на группу
 * до 15 человек), поэтому сцена честно продаёт «приводите группу целиком».
 */

const SEATS = [
  { d: 'Продажи', t: 'коммерческое предложение' },
  { d: 'Маркетинг', t: 'контент-план на месяц' },
  { d: 'Юрист', t: 'риски в договоре' },
  { d: 'HR', t: 'текст вакансии' },
  { d: 'Бухгалтерия', t: 'ответ на требование ФНС' },
  { d: 'Продажи', t: 'ответ на возражение' },
  { d: 'Руководитель', t: 'отчёт собственнику' },
  { d: 'Поддержка', t: 'ответы клиентам' },
  { d: 'Закупки', t: 'сравнение предложений' },
  { d: 'Маркетинг', t: 'сводка по рекламе' },
  { d: 'HR', t: 'гайд для собеседования' },
  { d: 'Бухгалтерия', t: 'формула в Excel' },
  { d: 'Юрист', t: 'претензия по шаблону' },
  { d: 'Офис', t: 'протокол совещания' },
  { d: 'Продажи', t: 'разбор звонка' },
]

const START = 0.1
const STEP = 0.047

function Person({ i }: { i: number }) {
  // Один и тот же простой человечек, разный по мелочам — без лиц и стока
  const hair = i % 4
  const tone = i % 3 === 0 ? '#f2b705' : i % 3 === 1 ? '#ffe680' : '#ffd43b'
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <path d="M8 64 C8 46 20 40 32 40 C44 40 56 46 56 64 Z" fill={tone} stroke="#17140a" strokeWidth="3" />
      <circle cx="32" cy="24" r="12" fill="#fff7da" stroke="#17140a" strokeWidth="3" />
      {hair === 0 && <path d="M20 22 C20 10 44 10 44 22 C40 16 26 16 20 22 Z" fill="#17140a" />}
      {hair === 1 && <circle cx="32" cy="9" r="5" fill="#17140a" />}
      {hair === 1 && <path d="M20 21 C21 12 43 12 44 21 C38 17 26 17 20 21 Z" fill="#17140a" />}
      {hair === 2 && (
        <g fill="none" stroke="#17140a" strokeWidth="2.4">
          <circle cx="27" cy="25" r="3.6" />
          <circle cx="37" cy="25" r="3.6" />
          <path d="M30.6 25 H33.4" />
        </g>
      )}
      {hair === 3 && <path d="M32 44 L29 52 L32 60 L35 52 Z" fill="#17140a" />}
    </svg>
  )
}

export function SceneClass() {
  const ref = useRef<HTMLElement>(null)
  const p = useSceneProgress(ref)
  const phone = useIsPhone()

  const seat = SEATS.map((_, i) => ramp(p, START + i * STEP - 0.03, START + i * STEP + 0.02))
  const n = seat.filter((s) => s > 0.5).length
  const per = Math.round(7000 / Math.max(n, 1))
  const last = n > 0 ? SEATS[n - 1] : null
  const done = ramp(p, 0.82, 0.9)
  // маркер ставит галочку каждому, кто сел: чуть позже посадки
  const chk = SEATS.map((_, i) => lin(p, START + i * STEP + 0.005, START + i * STEP + 0.04))
  const writing = chk.findIndex((c) => c > 0 && c < 1)

  return (
    <section
      ref={ref}
      id="gruppa"
      className="relative bg-pole"
      style={{ height: phone ? '280vh' : '320vh' }}
      aria-label="Группа до 15 человек: цена часа на одного сотрудника"
    >
      <div className="grain sticky top-0 h-[100svh] overflow-hidden px-4 pb-4 pt-[68px] md:px-10 md:pb-8 md:pt-[92px]">
        <div className="relative mx-auto grid h-full w-full max-w-[1320px] content-start gap-4 md:grid-cols-[0.9fr_1.25fr] md:content-center md:gap-14">
          {/* счётчик */}
          <div>
            <p className="eyebrow text-ink-2">Группа до 15 человек · одна ставка</p>
            <h2 className="display mt-2 max-w-[16ch] text-[7.4vw] leading-[1] md:mt-3 md:text-[3.4vw] xl:text-[3.3rem]">
              Чем полнее группа, тем дешевле час на&nbsp;каждого
            </h2>
            <div className="mt-4 md:mt-10">
              <div className="display num text-[17vw] leading-[0.9] md:text-[8.2vw] xl:text-[8rem]" aria-live="polite">
                {rub(per)}
              </div>
              <p className="mt-2 text-[0.98rem] font-semibold md:mt-3 md:text-[1.15rem]">
                час занятий на одного сотрудника · мест занято:{' '}
                <span className="num">{n}</span> из 15
              </p>
            </div>
            <p
              className="mt-5 hidden max-w-[30rem] text-[1.05rem] md:block"
              style={{ opacity: done, transform: `translateY(${(1 - done) * 12}px)` }}
            >
              Ставка не меняется: <b>7 000 ₽ за час</b> — и за одного человека, и за пятнадцать.
              Поэтому выгоднее приводить отдел целиком, а не «пару самых продвинутых».
            </p>
          </div>

          {/* места */}
          <div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5 md:gap-3.5">
              {SEATS.map((s, i) => {
                const a = seat[i]
                const rot = ((i * 37) % 7) - 3
                return (
                  <div key={i} className="relative aspect-[16/9] md:aspect-[5/6]">
                    {/* пустое место */}
                    <div className="absolute inset-0 rounded-[14px] border-2 border-dashed border-ink/35 md:rounded-[18px]">
                      <span className="num absolute left-2 top-1.5 text-[0.7rem] font-semibold text-ink/45 md:text-[0.8rem]">
                        {i + 1}
                      </span>
                    </div>
                    {/* занятое место */}
                    <div
                      className="absolute inset-0 flex flex-col overflow-hidden rounded-[14px] border-2 border-ink bg-krem p-1 md:rounded-[18px] md:p-2.5"
                      style={{
                        opacity: a,
                        transform: `translateY(${(1 - a) * -26}px) scale(${0.86 + a * 0.14}) rotate(${a * rot}deg)`,
                      }}
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-0.5 md:block md:h-auto">
                        <div className="h-7 w-7 shrink-0 md:mx-auto md:h-auto md:w-[60%]">
                          <Person i={i} />
                        </div>
                        <div className="w-full min-w-0 text-center md:mt-1 md:text-left">
                          <p className="whitespace-nowrap text-[0.64rem] font-bold leading-tight md:whitespace-normal md:text-[0.82rem]">{s.d}</p>
                          <p className="hidden text-[0.74rem] leading-[1.2] text-ink-2 md:line-clamp-2 md:block">{s.t}</p>
                        </div>
                      </div>
                      {/* галочка, которую ставит маркер */}
                      <svg viewBox="0 0 40 40" className="absolute right-1 top-1 h-5 w-5 md:right-2 md:top-2 md:h-7 md:w-7" aria-hidden="true">
                        <path d="M6 21 L16 31 L35 8" fill="none" stroke="#17140a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                          pathLength={1} strokeDasharray="1" strokeDashoffset={1 - chk[i]} />
                      </svg>
                    </div>
                    {writing === i ? (
                      <MarkerAt x="88%" y="14%" angle={38} width={phone ? '120px' : '170px'} className="z-30" />
                    ) : null}
                  </div>
                )
              })}
            </div>
            {/* подпись последнего вошедшего */}
            <div className="mt-4 flex min-h-[3.2rem] items-center gap-3 rounded-2xl border-2 border-ink bg-krem px-4 py-2.5 md:mt-6">
              <span className="shrink-0 rounded-md bg-ink px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-pole">
                {last ? 'пришёл с задачей' : 'места свободны'}
              </span>
              <span className="text-[0.95rem] font-semibold md:text-[1.05rem]">
                {last ? `${last.d}: ${last.t}` : 'Каждый приносит на занятие свою рабочую задачу'}
              </span>
            </div>
            <p className="mt-4 text-[0.95rem] md:hidden" style={{ opacity: done }}>
              Ставка не меняется: <b>7 000 ₽ за час</b> — и за одного, и за пятнадцать.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
