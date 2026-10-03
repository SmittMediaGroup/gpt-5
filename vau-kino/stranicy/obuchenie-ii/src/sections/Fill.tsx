import { useLayoutEffect, useRef, useState } from 'react'
import { lin, ramp, useSceneProgress } from '../lib/hooks'
import { MarkerAt } from './Marker'

/**
 * КАДР-СЕНСАЦИЯ «Маркер выделяет — и заливает экран».
 * Кремовый экран с фразой «Теперь — про деньги. Без „индивидуального расчёта“».
 * Маркер по прокрутке выделяет её строка за строкой: кончик идёт по строке,
 * корпус лежит в просвете под ней и не закрывает текст. После третьей строки
 * маркер уходит за край, а выделения разрастаются в жёлтую заливку всего экрана.
 * Фраза всё время в слое над заливкой (тёмный текст читается и на креме, и на
 * жёлтом) и в конце перетекает в «Пятнадцать человек. Один час. 7 000 ₽.» —
 * без пустого кадра. Следующая сцена (группа) стоит на том же жёлтом.
 */

// на телефоне строки короче: одна строка фразы = одна строка экрана, иначе выделение становится блоком
const LINES_DESK = ['Теперь — про деньги.', 'Без «индивидуального', 'расчёта».']
const LINES_PHONE = ['Теперь —', 'про деньги.', 'Без', '«индивидуального', 'расчёта».']
const BACK = 0.03 // перенос маркера к началу следующей строки
const T0 = 0.05

type Box = { x: number; y: number; w: number; h: number }

export function Fill() {
  const ref = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([])
  const p = useSceneProgress(ref)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const LINES = phone ? LINES_PHONE : LINES_DESK
  const DRAW = 0.54 / LINES.length - BACK

  useLayoutEffect(() => {
    const measure = () => {
      const st = stageRef.current?.getBoundingClientRect()
      if (!st) return
      setPhone(st.width < 768)
      setBoxes(
        lineRefs.current.slice(0, (st.width < 768 ? LINES_PHONE : LINES_DESK).length).map((el) => {
          const r = el!.getBoundingClientRect()
          return { x: r.left - st.left, y: r.top - st.top, w: r.width, h: r.height }
        }),
      )
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [phone])

  // прогресс выделения каждой строки
  const start = (i: number) => T0 + i * (DRAW + BACK)
  const prog = LINES.map((_, i) => lin(p, start(i), start(i) + DRAW))
  const endDraw = start(LINES.length - 1) + DRAW

  // где кончик маркера
  let mk: { x: number; y: number } | null = null
  if (boxes.length === LINES.length) {
    const tipY = (b: Box) => b.y + b.h * 0.97
    const cur = prog.findIndex((v) => v < 1)
    if (cur === -1) {
      // все строки выделены — маркер уходит вправо за край
      const b = boxes[LINES.length - 1]
      const go = lin(p, endDraw, endDraw + 0.07)
      mk = { x: b.x + b.w + go * 1600, y: tipY(b) }
    } else if (cur > 0 && p < start(cur)) {
      // перенос: от конца прошлой строки к началу текущей
      const a = boxes[cur - 1], b = boxes[cur]
      const t = ramp(p, start(cur) - BACK, start(cur))
      mk = { x: a.x + a.w + (b.x - a.x - a.w) * t, y: tipY(a) + (tipY(b) - tipY(a)) * t }
    } else {
      const b = boxes[cur]
      mk = { x: b.x + b.w * prog[cur], y: tipY(b) }
    }
  }
  const mkIn = ramp(p, 0.0, T0)

  // выделения разрастаются в заливку экрана
  const flood = ramp(p, endDraw + 0.02, endDraw + 0.14)
  // смена фразы с перекрытием — пустого кадра нет
  const out1 = ramp(p, 0.74, 0.84)
  const in2 = ramp(p, 0.77, 0.87)

  return (
    <section ref={ref} id="zalivka" className="relative bg-krem" style={{ height: '240svh' }} aria-label="Переход к разделу о цене группы">
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* заливка — под текстом */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] bg-pole"
          style={{ transform: `scaleY(${flood})`, transformOrigin: '50% 50%' }}
        />

        {/* фраза 1 — выделяется маркером */}
        <div
          className="absolute inset-0 z-10 flex items-center px-4 md:px-10"
          style={{ opacity: 1 - out1, transform: `translateY(${-out1 * 38}vh)` }}
          aria-hidden={out1 > 0.5}
        >
          <p className="display mx-auto w-full max-w-[1320px] whitespace-nowrap text-[8.4vw] md:text-[5.8vw] xl:text-[5.6rem]" style={{ lineHeight: 1.6 }}>
            {LINES.map((l, i) => (
              <span key={l} className="block">
                <span ref={(el) => { lineRefs.current[i] = el }} className="relative inline-block">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[0.08em] -right-[0.08em] bottom-[-0.04em] top-[0.78em] bg-pole"
                    style={{ transform: `scaleX(${prog[i]})`, transformOrigin: 'left center' }}
                  />
                  <span className="relative">{l}</span>
                </span>
              </span>
            ))}
          </p>
        </div>

        {/* фраза 2 — на залитом поле */}
        <div
          className="absolute inset-0 z-10 flex items-center px-4 md:px-10"
          style={{ opacity: in2, transform: `translateY(${(1 - in2) * 38}vh)` }}
          aria-hidden={in2 < 0.5}
        >
          <div className="mx-auto w-full max-w-[1320px]">
            <p className="eyebrow mb-5 text-ink-2">Одна ставка на группу</p>
            <p className="display max-w-[14ch] text-[13vw] leading-[0.95] md:text-[8.4vw] xl:text-[8.6rem]">
              Пятнадцать человек. Один час. 7&nbsp;000&nbsp;₽.
            </p>
          </div>
        </div>

        {/* маркер: кончик на строке, корпус — в просвете под ней, почти вдоль строки */}
        {mk ? (
          <MarkerAt
            x={mk.x}
            y={mk.y}
            angle={176}
            flip
            width={phone ? '120px' : '250px'}
            opacity={mkIn}
            className="z-20"
          />
        ) : null}
      </div>
    </section>
  )
}
