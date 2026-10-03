import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useStage } from '../lib/useStage'
import { Kicker, seg } from '../lib/ui'

/**
 * Сцена 2 «Звонок становится сделкой» — доказательство на нашем продукте.
 * 0,04–0,40  линия сканирует волну звонка, пройденные столбики темнеют;
 * 0,10–0,50  под волной проявляется диалог с ролями;
 * 0,46–0,58  ключевые фразы подсвечиваются маркером;
 * 0,56–0,92  поля карточки сделки заполняются по одному.
 * Поля — ровно те, что выдаёт «Расшифровка звонков SMG» (README b24-transcribe).
 */
const BARS = Array.from({ length: 72 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 1.7) * 0.55 + Math.sin(i * 0.37) * 0.35 + Math.sin(i * 5.3) * 0.18)
  const pause = i % 23 > 19 ? 0.18 : 1
  return Math.max(0.12, Math.min(1, v * pause + 0.08))
})

type Line = { who: 'М' | 'К'; time: string; parts: (string | { m: string })[] }
const DIALOG: Line[] = [
  { who: 'М', time: '00:04', parts: ['Добрый день! Вы оставляли заявку на поставку — удобно говорить?'] },
  { who: 'К', time: '00:11', parts: ['Да. Сравниваем вас с ещё одним поставщиком, ', { m: 'у них дешевле примерно на десять процентов' }, '.'] },
  { who: 'М', time: '01:02', parts: ['Понимаю. А сроки и доставка вам важнее цены или наоборот?'] },
  { who: 'К', time: '01:20', parts: ['Сроки важнее. ', { m: 'Пришлите КП с доставкой до пятницы' }, ' — посмотрим.'] },
  { who: 'М', time: '01:41', parts: ['Пришлю сегодня. ', { m: 'Созвонимся в пятницу в 11:00' }, '?'] },
]

const FIELDS: { k: string; v: string; q?: string }[] = [
  { k: 'Оценка звонка', v: '82 / 100' },
  { k: 'Кратко', v: 'Клиент сравнивает с другим поставщиком, сроки важнее цены.' },
  { k: 'Возражение', v: 'Цена выше конкурента', q: '00:11 «у них дешевле примерно на десять процентов»' },
  { k: 'Договорённость', v: 'КП с доставкой — до пятницы', q: '01:20' },
  { k: 'Следующий шаг', v: 'Созвон в пятницу, 11:00', q: '01:41' },
  { k: 'Чек-лист скрипта', v: 'приветствие ✓ · потребность ✓ · следующий шаг ✓ · допродажа —' },
]

/** сквозной номер выделенной фразы в диалоге */
const markIdx = (line: number, part: number) => {
  let n = 0
  for (let i = 0; i < DIALOG.length; i++)
    for (let j = 0; j < DIALOG[i].parts.length; j++) {
      if (i === line && j === part) return n
      if (typeof DIALOG[i].parts[j] !== 'string') n++
    }
  return n
}

export function SceneCall() {
  const ref = useRef<HTMLElement>(null)
  const ink = useRef<HTMLDivElement>(null)
  const scanner = useRef<HTMLDivElement>(null)
  const lines = useRef<(HTMLLIElement | null)[]>([])
  const marks = useRef<HTMLSpanElement[]>([])
  const fields = useRef<(HTMLDivElement | null)[]>([])
  const card = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()

  useStage(
    ref,
    (p) => {
      const mobile = window.innerWidth < 1024
      const s = seg(p, 0.04, 0.4)
      if (ink.current) ink.current.style.clipPath = `inset(0 ${(1 - s) * 100}% 0 0)`
      if (scanner.current) {
        scanner.current.style.left = '0'
        scanner.current.style.transform = `translate3d(${s * (scanner.current.parentElement!.clientWidth - 3)}px,0,0)`
        scanner.current.style.opacity = s > 0 && s < 1 ? '1' : '0'
      }
      lines.current.forEach((el, i) => {
        if (!el) return
        const t = seg(p, 0.1 + i * 0.075, 0.16 + i * 0.075)
        el.style.opacity = String(t)
        el.style.transform = `translate3d(0,${(1 - t) * 14}px,0)`
      })
      marks.current.forEach((el, i) => {
        if (!el) return
        el.style.transform = `scaleX(${seg(p, 0.46 + i * 0.04, 0.52 + i * 0.04)})`
      })
      if (card.current) {
        // на телефоне карточка выезжает поверх диалога
        const c = seg(p, 0.52, 0.62)
        card.current.style.transform = mobile ? `translate3d(0,${(1 - c) * 110}%,0)` : 'none'
        card.current.style.opacity = mobile ? String(c > 0 ? 1 : 0) : '1'
      }
      fields.current.forEach((el, i) => {
        if (!el) return
        const t = seg(p, 0.58 + i * 0.055, 0.63 + i * 0.055)
        el.style.opacity = String(0.12 + t * 0.88)
        const bar = el.querySelector<HTMLElement>('[data-v]')
        if (bar) {
          bar.style.opacity = String(t)
          bar.style.transform = `translate3d(${(1 - t) * -18}px,0,0)`
        }
      })
    },
    reduced,
  )

  return (
    <section
      id="zvonki"
      ref={ref}
      className={`relative bg-peach ${reduced ? '' : 'h-[280svh] sm:h-[260vh]'}`}
      aria-label="Пример: звонок превращается в заполненную карточку сделки"
    >
      <div className={`${reduced ? '' : 'sticky top-0 h-[100svh]'} overflow-hidden`}>
        <div className="mx-auto flex h-full max-w-[1320px] flex-col justify-center px-4 pb-4 pt-20 sm:px-8">
          <div className="mb-5 grid gap-x-12 gap-y-2 sm:mb-6 lg:grid-cols-[1fr_400px] lg:items-end">
            <div>
              <Kicker className="text-rust">Сцена 2 · наш продукт, пример звонка</Kicker>
              <h2 className="display mt-3 max-w-[820px] text-[clamp(2rem,7.6vw,3.9rem)] font-[750] text-choc">
                Звонок сам становится сделкой
              </h2>
            </div>
            <p className="hidden text-[16px] leading-[1.5] text-choc lg:block">
              Менеджер положил трубку — в карточке сделки уже расшифровка с ролями, итог, следующий
              шаг и разбор по скрипту. Руководителю не нужно слушать звонки выборочно.
            </p>
          </div>

          <div className="relative grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
            {/* звонок */}
            <div className="rounded-[22px] bg-krem p-4 sm:p-6">
              <div className="mono flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-choc/80 sm:text-[12px]">
                <span>● Входящий · 02:07</span>
                <span>Менеджер / Клиент</span>
              </div>
              <div className="relative mt-3 h-[52px] sm:h-[72px]">
                <Bars className="text-pole2" />
                <div ref={ink} className="absolute inset-0" style={{ clipPath: 'inset(0 100% 0 0)' }}>
                  <Bars className="text-rust" />
                </div>
                <div
                  ref={scanner}
                  aria-hidden
                  className="absolute -bottom-1 -top-1 w-[3px] rounded-full bg-choc opacity-0"
                />
              </div>
              <ol className="mt-4 space-y-2 sm:mt-4 sm:space-y-2.5">
                {DIALOG.map((l, i) => (
                  <li
                    key={i}
                    ref={(el) => {
                      lines.current[i] = el
                    }}
                    className={`flex gap-3 opacity-0 ${i === 2 ? 'hidden sm:flex' : ''}`}
                  >
                    <span
                      className={`mono mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md text-[11px] font-bold ${
                        l.who === 'М' ? 'bg-choc text-krem' : 'bg-pole text-choc'
                      }`}
                    >
                      {l.who}
                    </span>
                    <p className="text-[14px] leading-[1.45] text-choc sm:text-[16px]">
                      <span className="mono mr-2 text-[11px] text-choc/75">{l.time}</span>
                      {l.parts.map((part, j) =>
                        typeof part === 'string' ? (
                          <span key={j}>{part}</span>
                        ) : (
                          <span key={j} className="relative whitespace-normal">
                            <span
                              aria-hidden
                              ref={(el) => {
                                if (el) marks.current[markIdx(i, j)] = el
                              }}
                              className="absolute -inset-x-0.5 inset-y-0 -z-0 origin-left scale-x-0 rounded bg-pole2"
                            />
                            <span className="relative font-semibold">{part.m}</span>
                          </span>
                        ),
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* карточка сделки */}
            <div
              ref={card}
              className="absolute inset-x-0 bottom-0 rounded-[22px] border-2 border-choc bg-krem p-4 shadow-[0_-20px_50px_-25px_oklch(0.4_0.12_40/0.55)] sm:p-6 lg:static lg:shadow-none"
            >
              <div className="mono -mx-4 -mt-4 flex items-center justify-between rounded-t-[20px] bg-pole px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-choc sm:-mx-6 sm:-mt-6 sm:px-6 sm:text-[12px]">
                <span>Сделка · комментарий в таймлайне</span>
                <span className="rounded-full bg-rust px-2 py-0.5 text-krem">ИИ</span>
              </div>
              <div className="mt-3 divide-y divide-choc/15">
                {FIELDS.map((f, i) => (
                  <div
                    key={f.k}
                    ref={(el) => {
                      fields.current[i] = el
                    }}
                    className={`grid grid-cols-[112px_1fr] gap-3 py-2 sm:grid-cols-[150px_1fr] sm:py-2.5 ${
                      i === 1 ? 'hidden sm:grid' : ''
                    }`}
                  >
                    <span className="mono pt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-choc/75 sm:text-[12px]">
                      {f.k}
                    </span>
                    <span data-v className="block">
                      <span
                        className={`block text-[14px] font-semibold leading-snug sm:text-[16px] ${
                          i === 0 ? 'display text-[22px] text-rust sm:text-[28px]' : 'text-choc'
                        }`}
                      >
                        {f.v}
                      </span>
                      {f.q && (
                        <span className="mono mt-0.5 hidden text-[11px] text-choc/70 sm:block">цитата {f.q}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 max-w-[980px] text-[13px] leading-[1.5] text-choc sm:mt-5 sm:text-[15px]">
            Так работает наша «Расшифровка звонков SMG» для Битрикс24 (
            <a
              className="focus-ring underline underline-offset-2"
              href="https://app.smittmediagroup.ru"
              target="_blank"
              rel="noopener"
            >
              app.smittmediagroup.ru
            </a>
            ). Каждый вывод опирается на дословную цитату из разговора — без цитаты он отбрасывается.
            Считается на сервере в России, без внешних ИИ-сервисов. Диалог и оценка на экране — пример.
          </p>
        </div>
      </div>
    </section>
  )
}

function Bars({ className }: { className: string }) {
  return (
    <svg
      viewBox={`0 0 ${BARS.length * 10} 100`}
      preserveAspectRatio="none"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    >
      {BARS.map((v, i) => (
        <rect key={i} x={i * 10 + 2} y={50 - v * 48} width="6" height={v * 96} rx="3" fill="currentColor" />
      ))}
    </svg>
  )
}
