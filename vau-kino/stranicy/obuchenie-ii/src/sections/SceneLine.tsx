import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { lin, ramp, useIsPhone, useSceneProgress } from '../lib/hooks'
import { MarkerAt } from './Marker'

/**
 * СЦЕНА 3 «Красная линия».
 * Механизм: по ленте к нейросети едут куски рабочих документов. Посередине —
 * чёрно-жёлтый шлагбаум. Та часть карточки, что уже прошла линию, показана
 * обезличенной: ФИО, телефоны, ИНН и суммы закрашены «чернилами» и заменены
 * метками. Срез идёт ровно по линии, поэтому видно, как документ «переписывается»
 * на ходу. Скан паспорта до линии доезжает и остаётся: его не загружают никогда.
 * Регламент без персональных данных проходит как есть.
 * Телефон: ленты нет, линия липнет к середине экрана, а документы проезжают
 * через неё обычной прокруткой — тот же срез, только по вертикали.
 */

type Part = string | { o: string; r: string }
type Doc = { kind: string; parts: Part[]; block?: boolean; clean?: boolean }

const DOCS: Doc[] = [
  {
    kind: 'Письмо клиента',
    parts: [{ o: 'Иванова Мария', r: 'КЛИЕНТ' }, ', ', { o: '+7 900 000-00-00', r: 'ТЕЛЕФОН' }, ': перенести поставку'],
  },
  {
    kind: 'Договор',
    parts: [{ o: 'ООО «Пример»', r: 'КОНТРАГЕНТ' }, ', ИНН ', { o: '3800000000', r: 'ИНН' }, ', ', { o: '1 250 000 ₽', r: 'СУММА' }, ', пени 0,1 %'],
  },
  {
    kind: 'Резюме кандидата',
    parts: [{ o: 'Петров Андрей', r: 'КАНДИДАТ' }, ', ', { o: '34 года', r: 'ВОЗРАСТ' }, ', ', { o: 'ул. Ленина, 5', r: 'АДРЕС' }, ' — продажи B2B'],
  },
  { kind: 'Скан паспорта', parts: ['Серия, номер, прописка'], block: true },
  { kind: 'Регламент отдела', parts: ['Скидка больше 10 % — с согласия руководителя'], clean: true },
]

function Text({ parts, redacted }: { parts: Part[]; redacted: boolean }) {
  return (
    <>
      {parts.map((pt, i) =>
        typeof pt === 'string' ? (
          <span key={i}>{pt}</span>
        ) : redacted ? (
          <span key={i} className="mx-[1px] rounded-[4px] bg-ink px-1.5 py-[1px] text-[0.78em] font-bold tracking-wider text-pole">
            {pt.r}
          </span>
        ) : (
          <span key={i} className="font-semibold underline decoration-ink/40 decoration-dotted underline-offset-4">
            {pt.o}
          </span>
        ),
      )}
    </>
  )
}

/** Карточка в два слоя: исходник и обезличенная версия; c — доля, прошедшая линию */
function Card({ doc, c, axis }: { doc: Doc; c: number; axis: 'x' | 'y' }) {
  const pct = (v: number) => `${(v * 100).toFixed(2)}%`
  const origClip = axis === 'x' ? `inset(0 ${pct(c)} 0 0)` : `inset(${pct(c)} 0 0 0)`
  const redClip = axis === 'x' ? `inset(0 0 0 ${pct(1 - c)})` : `inset(0 0 ${pct(1 - c)} 0)`
  // по оси x карточка едет слева направо: прошедшая часть — правая
  const body = (redacted: boolean) => (
    <div className="flex h-full flex-col justify-center gap-1 px-4 py-2.5 md:px-5">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-2">{doc.kind}</span>
      <p className="line-clamp-3 text-[0.92rem] leading-snug md:line-clamp-1 md:whitespace-nowrap md:text-[1.02rem]">
        {doc.block && redacted ? (
          <span className="font-semibold">Не загружаем. Никогда.</span>
        ) : (
          <Text parts={doc.parts} redacted={redacted} />
        )}
      </p>
    </div>
  )
  return (
    <div className="relative grid h-full overflow-hidden rounded-[16px] bg-white">
      <div className="col-start-1 row-start-1" style={{ clipPath: origClip }}>
        {body(false)}
      </div>
      <div
        className={`col-start-1 row-start-1 rounded-[14px] ${doc.block ? 'hazard-soft' : doc.clean ? 'bg-krem' : 'bg-pole-2'}`}
        style={{ clipPath: redClip }}
        aria-hidden="true"
      >
        {body(true)}
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[16px] border-2 border-ink" />
      {doc.clean ? (
        <span
          className="absolute right-2 top-1.5 rounded-full border-2 border-ink bg-pole px-2 text-[0.7rem] font-bold"
          style={{ opacity: c > 0.5 ? 1 : 0 }}
        >
          можно как есть
        </span>
      ) : null}
    </div>
  )
}

function Desk() {
  const ref = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const p = useSceneProgress(ref)
  const [w, setW] = useState(1200)
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cardW = Math.min(470, w * 0.36)
  const barrier = w * 0.47
  const boxW = Math.min(150, w * 0.12)
  const endX = w - boxW - 24 - cardW * 0.35
  const passed = DOCS.filter((d, i) => !d.block && ramp(lin(p, 0.06 + i * 0.13, 0.46 + i * 0.13), 0.86, 1) > 0.5).length

  return (
    <section ref={ref} id="dannye" className="relative bg-krem-2" style={{ height: '330vh' }}>
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-10 pb-8 pt-[92px]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col">
          <p className="eyebrow text-ink-2">Час 5 воркшопа · правила по данным</p>
          <h2 className="display mt-3 max-w-[30ch] text-[3.2vw] leading-[1] xl:text-[3.1rem]">
            Что можно отдавать нейросети, а что — никогда
          </h2>

          <div ref={stageRef} className="relative mt-16 flex-1">
            {/* зоны */}
            <span className="eyebrow absolute left-0 top-0 text-ink-2">Рабочие документы</span>
            <span className="eyebrow absolute top-0 text-ink-2" style={{ left: barrier + 70 }}>
              Уже обезличено
            </span>

            {/* шлагбаум */}
            <div className="absolute bottom-0 top-8 w-[18px] rounded-full border-2 border-ink hazard" style={{ left: barrier - 9 }} />
            {/* маркер — «страж» линии: кончиком вниз, на макушке шлагбаума */}
            <MarkerAt x={barrier} y={30} angle={-62} width="110px" className="z-10" />
            <span
              className="absolute bottom-[-6px] -translate-x-1/2 rounded-full border-2 border-ink bg-pole px-3 py-1 text-[0.8rem] font-bold"
              style={{ left: barrier }}
            >
              красная линия · 152-ФЗ
            </span>

            {/* нейросеть */}
            <div
              className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-col items-center justify-center rounded-[28px] border-2 border-ink bg-ink text-pole"
              style={{ width: boxW, height: boxW * 1.45 }}
            >
              <span className="display text-[2.6rem]">ИИ</span>
              <span className="mt-1 text-center text-[0.72rem] font-semibold leading-tight text-pole-2">получила</span>
              <span className="display num mt-1 text-[1.9rem] text-pole">{passed}</span>
              <span className="text-center text-[0.68rem] font-semibold leading-tight text-pole-2">обезличенных</span>
            </div>

            {/* ленты */}
            <div className="absolute inset-x-0 bottom-12 top-9 flex flex-col gap-3">
              {DOCS.map((d, i) => {
                const s = 0.06 + i * 0.13
                const t = lin(p, s, s + 0.4)
                const startX = -cardW * 0.15
                let x = startX + (endX - startX) * t
                let stamp = 0
                let fall = 0
                if (d.block) {
                  const stop = barrier - cardW - 4
                  x = Math.min(x, stop)
                  stamp = ramp(p, s + 0.22, s + 0.27)
                  fall = ramp(p, s + 0.3, s + 0.4)
                }
                const c = d.block ? 0 : Math.min(Math.max((x + cardW - barrier) / cardW, 0), 1)
                const into = ramp(t, 0.86, 1)
                return (
                  <div key={d.kind} className="relative min-h-0 flex-1">
                    {/* дорожка ленты */}
                    <div
                      aria-hidden="true"
                      className="absolute top-1/2 h-0 border-t-2 border-dashed border-ink/25"
                      style={{ left: 0, right: boxW + 12 }}
                    />
                    <div
                      className="absolute top-0 h-full"
                      style={{
                        width: cardW,
                        transform: `translateX(${x}px) translateY(${fall * 26}px) scale(${1 - into * 0.25})`,
                        opacity: (1 - into) * (1 - fall * 0.75) * ramp(p, s - 0.05, s),
                      }}
                    >
                      <Card doc={d} c={c} axis="x" />
                      {d.block ? (
                        <span
                          className="absolute -right-3 top-1/2 -translate-y-1/2 rotate-[-8deg] rounded-md border-[3px] border-ink bg-pole px-3 py-1 text-[0.9rem] font-black uppercase tracking-wider"
                          style={{ opacity: stamp, transform: `translateY(-50%) rotate(-8deg) scale(${1.4 - stamp * 0.4})` }}
                        >
                          стоп
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-8">
            <p className="max-w-[46rem] text-[1.05rem] text-ink-2">
              На занятии разбираем ваши типовые документы и пишем правила на одну страницу: что
              обезличивать, что не выносить из компании, какие российские модели ставить для рабочих
              данных.
            </p>
            <p className="num shrink-0 text-right text-[0.95rem] font-semibold">
              нейросеть получила: <span className="display text-[1.6rem]">{passed}</span> обезличенных · паспорт — 0
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Phone() {
  const ref = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const lineRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [cs, setCs] = useState<number[]>(DOCS.map(() => 0))
  const { scrollY } = useScroll()
  const measure = () => {
    const line = lineRef.current?.getBoundingClientRect()
    if (!line) return
    const y = line.top + line.height / 2
    setCs(
      cardsRef.current.map((el) => {
        if (!el) return 0
        const r = el.getBoundingClientRect()
        return Math.min(Math.max((y - r.top) / r.height, 0), 1)
      }),
    )
  }
  useMotionValueEvent(scrollY, 'change', measure)
  useEffect(measure, [])

  return (
    <section ref={ref} id="dannye" className="relative bg-krem-2 px-4 pb-24 pt-20">
      <p className="eyebrow text-ink-2">Час 5 воркшопа · правила по данным</p>
      <h2 className="display mt-2 text-[8vw] leading-[1]">Что можно отдавать нейросети, а что — никогда</h2>
      <p className="mt-4 text-[0.98rem] text-ink-2">
        Прокрутите: всё, что проходит через линию, становится обезличенным.
      </p>

      {/* линия липнет к середине экрана */}
      <div ref={lineRef} className="sticky top-[50svh] z-20 -mx-4 mt-8 flex h-[14px] items-center">
        <div className="hazard h-full w-full border-y-2 border-ink" />
        <MarkerAt x="2%" y="50%" angle={-35} width="96px" className="z-10" />
        <span className="absolute right-3 top-[18px] rounded-full border-2 border-ink bg-pole px-2.5 py-0.5 text-[0.72rem] font-bold">
          красная линия · 152-ФЗ
        </span>
      </div>

      <div className="relative z-10 mt-[22svh] flex flex-col gap-[16svh] pb-[30svh]">
        {DOCS.map((d, i) => {
          const c = reduced ? 1 : cs[i]
          return (
            <div key={d.kind} ref={(el) => { cardsRef.current[i] = el }} className="relative h-[124px]">
              <Card doc={d} c={d.block ? 0 : c} axis="y" />
              {d.block ? (
                <span
                  className="absolute right-3 top-1/2 rounded-md border-[3px] border-ink bg-pole px-3 py-1 text-[0.85rem] font-black uppercase tracking-wider"
                  style={{ opacity: c > 0.25 ? 1 : 0, transform: 'translateY(-50%) rotate(-8deg)', transition: 'opacity .2s' }}
                >
                  стоп · не загружаем
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <p className="text-[1rem]">
        На занятии разбираем ваши типовые документы и пишем правила на одну страницу: что
        обезличивать, что не выносить из компании, какие российские модели ставить для рабочих данных.
      </p>
    </section>
  )
}

export function SceneLine() {
  const phone = useIsPhone()
  return phone ? <Phone /> : <Desk />
}
