import { useMemo, useState } from 'react'
import { STEMS, MAX_STEMS, type Stem } from '../data/stems'
import { StemGlyph } from '../components/FlowerEngraving'
import { useContent } from '../content/useContent'

/**
 * Signature: «Сборка букета». Выбираешь стебли — композиция собирается
 * в вазе на глазах, гравюрой. Каждый стебель встаёт пружиной
 * (.stem-enter), веер строится от центра наружу с лёгким шумом
 * позиций, чтобы букет выглядел рукотворным, а не циркульным.
 */

type Picked = { uid: number; stem: Stem }

/** Раскладка веера: корни у горлышка, наклон раскидывает верхушки */
function slot(i: number, uid: number) {
  const side = i % 2 === 0 ? 1 : -1
  const ring = Math.floor(i / 2)
  const angle = side * (ring * 11 + 6) + ((uid * 7) % 5) - 2
  const dip = ring * 2
  const dx = side * (2 + ring * 3) + (((uid * 13) % 5) - 2)
  return { angle, dip, dx }
}

export function Atelier() {
  const txt = useContent()
  const [picked, setPicked] = useState<Picked[]>([])
  const [uid, setUid] = useState(1)

  const total = useMemo(() => picked.reduce((s, p) => s + p.stem.price, 0), [picked])
  const full = picked.length >= MAX_STEMS

  const add = (stem: Stem) => {
    if (full) return
    setPicked((p) => [...p, { uid, stem }])
    setUid((u) => u + 1)
  }
  const undo = () => setPicked((p) => p.slice(0, -1))
  const reset = () => setPicked([])

  return (
    <section id="atelier" className="relative border-t border-bone/10 bg-soot/40 px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1100px] gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <div>
          <p className="text-xs tracking-[0.22em] text-smoke uppercase">{txt.atelier.kicker}</p>
          <h2 className="display mt-3 text-[clamp(1.7rem,3.6vw,2.8rem)]">
            {txt.atelier.title}
          </h2>
          <p className="mt-4 max-w-[46ch] text-sm text-smoke">
            {txt.atelier.text}
          </p>

          {/* палитра стеблей */}
          <ul className="mt-8 flex flex-wrap gap-2">
            {STEMS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => add(s)}
                  disabled={full}
                  className="flex min-h-11 items-center gap-2.5 border border-bone/15 px-4 py-2 text-sm transition-colors duration-200 hover:border-peony hover:text-peony focus-visible:border-peony disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: s.hue }}
                  />
                  {s.name}
                  <span className="text-xs text-smoke tabular-nums">{s.price} ₽</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={undo}
              disabled={picked.length === 0}
              className="flex min-h-11 items-center px-4 text-sm text-smoke transition-colors duration-200 hover:text-bone disabled:opacity-40"
            >
              {txt.atelier.undo}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={picked.length === 0}
              className="flex min-h-11 items-center px-4 text-sm text-smoke transition-colors duration-200 hover:text-bone disabled:opacity-40"
            >
              {txt.atelier.reset}
            </button>
          </div>

          <div className="mt-10 border-t border-bone/10 pt-6">
            <p className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-smoke">
                {picked.length === 0
                  ? txt.atelier.statusEmpty
                  : full
                    ? txt.atelier.statusFull
                    : `${txt.atelier.statusCount} ${picked.length}`}
              </span>
              <span className="display text-2xl tabular-nums">{total.toLocaleString('ru-RU')} ₽</span>
            </p>
            <a
              href="#finale"
              aria-disabled={picked.length === 0}
              className={`mt-5 inline-flex min-h-12 items-center gap-3 border px-6 text-sm tracking-wide transition-colors duration-200 ${
                picked.length === 0
                  ? 'pointer-events-none border-bone/15 text-smoke/50'
                  : 'border-peony text-peony hover:bg-peony hover:text-velvet focus-visible:bg-peony focus-visible:text-velvet'
              }`}
            >
              {txt.atelier.order}
            </a>
          </div>
        </div>

        {/* Ваза стоит на СЦЕНЕ: тёмный бархат, тёплый круг света сверху,
            гравюра кремовыми линиями. Сборка букета перестала быть схемой
            на кремовой бумаге и стала витриной — тот же вечер, что в герое
            и в финале (02.10). night-band переворачивает токены, поэтому
            сам SVG менять не пришлось. */}
        <div className="night-band canvas-grain relative flex min-h-[340px] items-end justify-center overflow-hidden px-4 pt-10 pb-6 md:min-h-[540px]">
          <div
            aria-hidden
            className="core-glow candle-flicker pointer-events-none absolute top-[-36%] left-1/2 h-[125%] w-[140%] -translate-x-1/2"
          />
          <div aria-hidden className="stage-vignette pointer-events-none absolute inset-0" />
          <svg viewBox="-155 -205 310 265" className="relative w-full max-w-[560px]" role="img" aria-label="Собранная композиция в вазе">
            {/* стебли: корни сведены к горлышку вазы */}
            <g transform="translate(0 -34)">
              {picked.map((p, i) => {
                const { angle, dip, dx } = slot(i, p.uid)
                return (
                  <g key={p.uid} className="stem-enter">
                    <g transform={`translate(${dx} ${dip}) rotate(${angle}) scale(1.45)`}>
                      <StemGlyph kind={p.stem.kind} hue={p.stem.hue} bend={(p.uid % 2 === 0 ? 1 : -1) * 4} />
                    </g>
                  </g>
                )
              })}
            </g>
            {/* ваза поверх корней — тёмное стекло гравюрой */}
            <path
              d="M -34 -34 C -30 -14, -38 4, -44 22 C -48 36, -40 50, 0 50 C 40 50, 48 36, 44 22 C 38 4, 30 -14, 34 -34 Z"
              fill="var(--color-velvet)"
              stroke="var(--color-bone)"
              strokeOpacity={0.5}
              strokeWidth={1.1}
            />
            {/* блик на стекле */}
            <path
              d="M -28 -26 C -26 -8, -32 8, -36 22"
              fill="none"
              stroke="var(--color-bone)"
              strokeOpacity={0.25}
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* стол — одна линия */}
            <line x1={-145} y1={50} x2={145} y2={50} stroke="var(--color-bone)" strokeOpacity={0.2} />
          </svg>

          {picked.length === 0 && (
            <p className="absolute top-1/2 left-1/2 w-max max-w-[80%] -translate-x-1/2 -translate-y-1/2 text-center text-sm text-smoke/80">
              {txt.atelier.emptyVase}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
