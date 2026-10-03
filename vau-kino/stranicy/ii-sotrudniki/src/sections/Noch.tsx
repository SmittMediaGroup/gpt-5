import { useRef } from 'react'
import { ramp, useNarrow, useSceneProgress } from '../lib/scene'

/**
 * СЦЕНА 1 «03:14. Офис спит».
 * Прокрутка двигает ВРЕМЯ, а не картинку: p (0…1) → секунды суток по
 * опорным точкам. Всё остальное — сообщения, строки журнала, свет в окнах,
 * утренняя сводка — показывается, когда часы дошли до своего времени.
 * Назад по прокрутке время идёт назад, сцена отыгрывается обратно.
 */

const t = (h: number, m: number, s = 0) => h * 3600 + m * 60 + s

// опорные точки: прогресс → время
const KEYS: [number, number][] = [
  [0, t(3, 14, 0)],
  [0.1, t(3, 14, 7)],
  [0.48, t(3, 17, 46)],
  [0.55, t(3, 18, 30)],
  [0.8, t(9, 0, 0)],
  [1, t(9, 0, 40)],
]

function clockAt(p: number) {
  for (let i = 1; i < KEYS.length; i++) {
    const [p1, s1] = KEYS[i]
    const [p0, s0] = KEYS[i - 1]
    if (p <= p1) return s0 + ((p - p0) / (p1 - p0)) * (s1 - s0)
  }
  return KEYS[KEYS.length - 1][1]
}

const fmt = (sec: number) => {
  const s = Math.floor(sec)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return [hh, mm, ss] as const
}

type Msg = { at: number; who: 'k' | 'ii'; text: string }
const CHAT: Msg[] = [
  { at: t(3, 14, 7), who: 'k', text: 'Здравствуйте! Сколько стоит кухня 3 метра, фасады МДФ? Нужна к декабрю.' },
  { at: t(3, 14, 19), who: 'ii', text: 'Добрый вечер! Цену считаем по замеру — от материалов и фурнитуры. Замерщик может приехать в субботу. Удобно?' },
  { at: t(3, 15, 30), who: 'k', text: 'Да, в субботу после 12.' },
  { at: t(3, 16, 2), who: 'ii', text: 'Записал на субботу, 13:00. Пришлите адрес и, если есть, план кухни — передам замерщику.' },
  { at: t(3, 17, 20), who: 'k', text: 'Адрес — Ленина, 5. План пришлю утром.' },
]

type Line = { at: number; text: string; human?: boolean }
const LOG: Line[] = [
  { at: t(3, 14, 7), text: 'Заявка с сайта принята' },
  { at: t(3, 14, 19), text: 'Ответ клиенту — по базе знаний' },
  { at: t(3, 16, 2), text: 'Уточнено: размер, материал, срок' },
  { at: t(3, 17, 38), text: 'Сделка «Кухня 3 м, МДФ» — в CRM' },
  { at: t(3, 17, 40), text: 'Замер: суббота 13:00 — в календаре' },
  { at: t(3, 17, 42), text: 'Задача менеджеру: подтвердить замер' },
  { at: t(4, 52, 10), text: 'Авито: вопрос о сроках — ответ по базе' },
  { at: t(6, 31, 44), text: 'Telegram: жалоба → передано человеку', human: true },
  { at: t(8, 58, 0), text: 'Утренняя сводка — руководителю' },
]

const WINDOWS = Array.from({ length: 15 }, (_, i) => i)
const ZVEZDY = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 41 + 7) % 97,
  y: (i * 23 + 5) % 62,
  s: 2 + (i % 3),
  o: 0.35 + ((i * 17) % 50) / 100,
}))

export function Noch() {
  const ref = useRef<HTMLElement>(null)
  const p = useSceneProgress(ref)
  const narrow = useNarrow()
  const now = clockAt(p)
  const [hh, mm, ss] = fmt(now)
  /* КИНО-ПЕРЕХОД ночь ↔ день.
     Закат: на входе экран ещё зелёный, как плашка над сценой; зелёное
     поле стягивается в солнце у верхнего края — открывается ночь.
     Рассвет: солнце поднимается снизу и заливает экран полем целиком. */
  const zakat = ramp(p, 0, 0.08) // 0 — день, 1 — ночь наступила
  const voskhod = ramp(p, 0.72, 0.8) // солнце показалось
  const morning = ramp(p, 0.8, 0.9) // поле залило экран
  const pelena = ramp(p, 0.82, 0.87) // переписка уходит под пелену
  const svodka = ramp(p, 0.87, 0.93) // сводка выезжает, когда пелена уже легла
  const sunR = zakat < 1 ? 150 * (1 - zakat) + 7 * zakat : 0
  const dawnR = 9 * voskhod + 150 * morning
  const night = zakat > 0.6 && morning < 0.55
  const zvezdy = zakat * (1 - Math.max(voskhod, morning))
  const ff = p > 0.55 && p < 0.8 // перемотка до утра
  const typing = CHAT.find((m) => m.who === 'ii' && now >= m.at - 9 && now < m.at)
  const shown = LOG.filter((l) => now >= l.at)
  const logTail = shown.slice(narrow ? -3 : -7)

  return (
    <section
      id="noch"
      ref={ref}
      data-status={
        p < 0.1
          ? 'офис уходит домой'
          : p < 0.3
            ? 'отвечает клиенту'
            : p < 0.5
              ? 'заводит сделку в CRM'
              : p < 0.8
                ? 'дежурит ночью'
                : 'сдал утреннюю сводку'
      }
      className="relative h-[380vh] bg-noch md:h-[400vh]"
      aria-label="Сцена: ночью приходит заявка, и ИИ-⁠сотрудник доводит её до сделки, пока офис спит"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* звёзды и луна — только ночью */}
        <div aria-hidden className="absolute inset-0" style={{ opacity: zvezdy }}>
          {ZVEZDY.map((z, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-myata"
              style={{ left: `${z.x}%`, top: `${z.y}%`, width: z.s, height: z.s, opacity: z.o }}
            />
          ))}
          <svg viewBox="0 0 100 100" className="absolute hidden md:left-[24%] md:top-[60%] md:block md:w-[84px]">
            <circle cx="50" cy="50" r="40" fill="oklch(0.94 0.07 148)" />
            <circle cx="68" cy="38" r="34" fill="oklch(0.27 0.06 148)" />
          </svg>
        </div>
        {/* закат: зелёное поле стягивается в солнце у верхнего края */}
        <div
          aria-hidden
          className="absolute inset-0 bg-pole"
          style={{ clipPath: `circle(${sunR}% at 50% -4%)`, display: sunR > 0 ? 'block' : 'none' }}
        />
        {/* рассвет: солнце встаёт снизу и заливает экран */}
        <div
          aria-hidden
          className="absolute inset-0 bg-pole"
          style={{ clipPath: `circle(${dawnR}% at 50% 104%)`, display: dawnR > 0 ? 'block' : 'none' }}
        />

        <div className="relative mx-auto grid min-h-0 w-full max-w-[1240px] flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-3 md:grid-rows-1 px-4 pb-16 pt-[68px] sm:px-6 md:grid-cols-[5fr_7fr] md:gap-10 md:pb-10 md:pt-24">
          {/* ЛЕВО: часы и офис */}
          <div
            className={`flex min-h-0 flex-col transition-colors duration-300 ${
              night ? 'text-bumaga [&_.text-glub]:text-pole [&_.text-seryy]:text-myata' : 'text-chern [&_.text-glub]:text-chern [&_.text-seryy]:text-chern'
            }`}
          >
            <p className="kapsy hidden text-glub md:block">Сцена 1 · пример сценария</p>
            <div className="flex items-end justify-between gap-3 md:mt-4 md:block">
              <div
                className="mono text-[clamp(3.1rem,15vw,4.2rem)] font-bold leading-none tracking-[-0.04em] md:text-[clamp(4.5rem,8vw,7.6rem)]"
                aria-live="off"
              >
                {hh}
                <span className={ff ? 'opacity-30' : ''}>:</span>
                {mm}
                <span className="text-[0.55em] text-seryy">:{ss}</span>
              </div>
              <div className="mono pb-1 text-right text-[0.8rem] font-semibold md:mt-3 md:text-left md:text-base">
                {morning < 0.5 ? (
                  <span>
                    вторник · <span className="text-glub">офис спит</span>
                  </span>
                ) : (
                  <span>
                    вторник · <span className="text-glub">офис работает</span>
                  </span>
                )}
                {ff && <span className="ml-2 inline-block rounded bg-pole px-1.5 text-chern">▸▸ до утра</span>}
              </div>
            </div>

            {!narrow && (
              <>
                <p className="mt-6 max-w-[34ch] text-[1.15rem] font-medium leading-snug">
                  Все ушли домой. Заявка приходит в 03:14. Смотрите, что успевает ИИ-⁠сотрудник, пока
                  отдел спит.
                </p>
                {/* офис: окна загораются в 09:00 */}
                <div className="mt-auto flex items-end gap-6 pt-6">
                  <svg viewBox="0 0 200 172" className="w-[180px] lg:w-[200px]" aria-hidden>
                    <rect x="20" y="20" width="160" height="150" rx="6" fill={night ? 'oklch(0.34 0.08 148)' : 'oklch(0.975 0.025 148)'} stroke={night ? 'oklch(0.94 0.07 148)' : 'oklch(0.22 0.05 148)'} strokeWidth="3" />
                    {WINDOWS.map((i) => {
                      const col = i % 5
                      const row = Math.floor(i / 5)
                      const lit = ramp(morning, (i % 7) / 10, (i % 7) / 10 + 0.3)
                      return (
                        <g key={i}>
                          <rect x={34 + col * 28} y={36 + row * 38} width="20" height="26" rx="2" fill={night ? 'oklch(0.27 0.06 148)' : 'oklch(0.94 0.07 148)'} stroke={night ? 'oklch(0.6 0.1 148)' : 'oklch(0.22 0.05 148)'} strokeWidth="2" />
                          <rect x={34 + col * 28} y={36 + row * 38} width="20" height="26" rx="2" fill="oklch(0.8 0.21 148)" opacity={lit} />
                        </g>
                      )
                    })}
                    <rect x="86" y="140" width="28" height="30" fill="oklch(0.22 0.05 148)" />
                  </svg>
                  <p className="mono mb-2 max-w-[20ch] text-sm text-seryy">
                    {morning < 0.5 ? 'людей в офисе: 0' : 'менеджер пришёл, сделка уже ждёт'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ПРАВО: окно переписки + журнал */}
          <div className="flex min-h-0 flex-col gap-3 md:gap-4">
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-chern bg-bumaga text-chern">
              <div className="flex items-center justify-between border-b-2 border-chern bg-pole px-4 py-2.5">
                <span className="text-sm font-bold">Чат на сайте<span className="hidden sm:inline"> · кухни на заказ</span></span>
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <span className="tochka" aria-hidden /> <span><span className="hidden sm:inline">ИИ-⁠сотрудник </span>в сети</span>
                </span>
              </div>
              <div className="relative flex flex-1 flex-col justify-end gap-2.5 overflow-hidden p-3 md:p-5">
                {CHAT.map((m) => {
                  const o = ramp(now, m.at - 0.5, m.at + 6)
                  if (o <= 0) return null
                  const ii = m.who === 'ii'
                  return (
                    <div
                      key={m.at}
                      className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[0.93rem] leading-snug md:text-base ${
                        ii ? 'self-end rounded-br-md border-2 border-chern bg-pole' : 'self-start rounded-bl-md border-2 border-chern/20 bg-myata'
                      }`}
                      style={{ opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}
                    >
                      <span className={`mono mb-0.5 block text-[0.7rem] ${ii ? 'text-chern/75' : 'text-seryy'}`}>
                        {ii ? 'ИИ-⁠сотрудник' : 'Клиент'} · {fmt(m.at).slice(0, 2).join(':')}
                      </span>
                      {m.text}
                    </div>
                  )
                })}
                {typing && (
                  <div className="mono self-end rounded-full bg-chern/8 px-3 py-1 text-xs text-seryy">печатает…</div>
                )}
              </div>

              {/* УТРЕННЯЯ СВОДКА: переписка уходит под матовую пелену, сводка — по центру окна */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 top-[46px] bg-bumaga/90"
                style={{ opacity: pelena }}
              />
              <div
                className="absolute inset-x-3 top-[calc(50%+23px)] rounded-2xl border-2 border-chern bg-bumaga p-4 shadow-[0.5rem_0.6rem_0_oklch(0.45_0.12_148/0.45)] md:inset-x-6 md:p-6"
                style={{
                  opacity: svodka,
                  transform: `translateY(calc(-50% + ${(1 - svodka) * 36}px)) scale(${0.96 + 0.04 * svodka})`,
                  pointerEvents: svodka > 0.5 ? 'auto' : 'none',
                }}
                aria-hidden={svodka < 0.5}
              >
                <p className="kapsy text-glub">Утренняя сводка · 09:00</p>
                <p className="head mt-1 text-[1.9rem] md:text-[2.4rem]">За ночь — 3 обращения</p>
                <ul className="mt-3 space-y-1.5 text-[0.92rem] md:text-base">
                  <li>
                    <b>Кухня 3 м</b> — замер в субботу 13:00, сделка в CRM
                  </li>
                  <li>
                    <b>Авито</b> — ответ о сроках по базе знаний
                  </li>
                  <li>
                    <b>Telegram, жалоба</b> — ждёт вас: по существу ИИ не отвечал
                  </li>
                </ul>
              </div>
            </div>

            <div className="mono shrink-0 rounded-3xl border-2 border-chern bg-bumaga text-chern p-3 text-[0.74rem] leading-relaxed md:p-4 md:text-[0.85rem]">
              <div className="mb-1 flex justify-between font-bold text-glub">
                <span>журнал действий</span>
                <span>{shown.length} / {LOG.length}</span>
              </div>
              <div className={narrow ? 'h-[3.6rem]' : 'h-[11.6rem]'}>
                {logTail.map((l) => (
                  <div key={l.at} className="flex gap-3 whitespace-nowrap">
                    <span className="text-seryy">{fmt(l.at).join(':')}</span>
                    <span className={`truncate ${l.human ? 'rounded bg-pole px-1 font-bold' : ''}`}>
                      {l.human ? '⚑ ' : ''}
                      {l.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className={`text-xs md:max-w-[calc(100%-290px)] md:text-sm ${night ? 'text-myata' : 'text-chern'}`}>
              Пример сценария, не отчёт клиента. Каналы, действия и границы задаются под ваш процесс.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
