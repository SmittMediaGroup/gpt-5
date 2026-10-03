import { useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { MEDIA } from '../data/clips'
import { useScrollScrub } from '../lib/useScrollScrub'
import { useContent } from '../content/useContent'

/**
 * «Ноктюрн» — пьеса для фортепиано, музыка ночи. Поэтому прокрутка здесь
 * не просто раскрывает бутон: дальше камера идёт В СЕРДЦЕВИНУ, и внутри
 * цветка открывается ночная комната с роялем, свечами и дождём за высоким
 * окном. Цветок перестаёт быть картинкой и становится входом.
 *
 * Одна прокрутка — три такта (p = прогресс секции, 0…1):
 *   0,00–0,52  бутон раскрывается (скраб ролика, механика прежняя);
 *   0,44–0,84  сердцевина наезжает, лепестки уходят за край кадра;
 *   0,50–0,88  комната проявляется из сердцевины и занимает экран.
 * Всё считается из p, поэтому назад по прокрутке сцена отыгрывает
 * обратно — зритель может «выйти» из цветка.
 *
 * ГРАБЛЯ (дорого поймана 02.10 на первом экране): transform на ОБЁРТКЕ
 * элемента с mix-blend-mode создаёт контекст наложения, и blend перестаёт
 * видеть то, что под обёрткой, — чёрная коробка ролика проступает линией.
 * Поэтому масштаб ролика пишется прямо в <video>, а не в обёртку.
 */

/** Плавная ступенька 0→1 на отрезке [a,b] со сглаживанием по краям */
function ramp(p: number, a: number, b: number): number {
  const t = Math.min(Math.max((p - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

/** Разгон 0→1 на отрезке [a,b]: чем дальше, тем быстрее (камера ускоряется) */
function accel(p: number, a: number, b: number, power: number): number {
  const t = Math.min(Math.max((p - a) / (b - a), 0), 1)
  return Math.pow(t, power)
}

/**
 * Апертура: дыра в середине кадра радиусом r (в процентах луча градиента).
 * invert=false — видно только ВНУТРИ круга (так распахивается комната);
 * invert=true  — видно только СНАРУЖИ круга (так лепестки съедаются от
 * сердцевины к краям, а не растворяются по всему кадру).
 */
function aperture(r: number, invert: boolean, feather = 16): string {
  const a = Math.max(r, 0)
  const b = a + feather
  return invert
    ? `radial-gradient(circle at 50% 50%, transparent 0%, transparent ${a}%, #000 ${b}%)`
    : `radial-gradient(circle at 50% 50%, #000 0%, #000 ${a}%, transparent ${b}%)`
}

const DUST = Array.from({ length: 10 }, (_, i) => ({
  left: (i * 37 + 9) % 96,
  size: 2 + ((i * 13) % 4),
  t: 14 + ((i * 23) % 11),
  d: -((i * 31) % 16),
  dx: ((i * 19) % 10) - 4,
  o: 0.28 + ((i * 17) % 35) / 100,
}))

export function BloomScrub() {
  const txt = useContent()
  const reduced = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [p, setP] = useState(0)

  // ролик доигрывает к 52 % секции, остальное — влёт внутрь
  useScrollScrub(sectionRef, videoRef, MEDIA.bloom, MEDIA.bloomMobile, setP, 0.52)

  const dive = useMemo(() => {
    /* Лепестки ПРОНОСЯТСЯ мимо камеры: масштаб разгоняется до десяти,
       а не до трёх с хвостом. Разгон степенной — скорость нарастает,
       как при реальном влёте. */
    const rush = accel(p, 0.5, 0.84, 3)
    /* Дыра в сердцевине: растёт от нуля до размера больше кадра.
       Она же — единственный способ развести слои: цветок остаётся
       НЕПРОЗРАЧНЫМ, но в середине его просто нет. */
    const hole = accel(p, 0.56, 0.84, 1.6) * 125
    /* Путь уже внутри комнаты: последняя треть прокрутки — медленный
       наезд и выход из темноты на свет. Без неё кадры «вход» и
       «комната» выходили одинаковыми (замечание владельца). */
    const settle = ramp(p, 0.78, 1)
    const come = ramp(p, 0.58, 0.88)
    const flowerScale = 1 + rush * 9
    return {
      flowerScale: flowerScale,
      /* Непрозрачность держим до упора: гасим только хвост, когда дыра
         уже больше кадра и гасить, по сути, нечего. Полупрозрачный
         цветок поверх полупрозрачной комнаты и давал молочную кашу. */
      flowerOpacity: 1 - ramp(p, 0.84, 0.9),
      /* Маска живёт в координатах САМОГО элемента и масштабируется вместе
         с ним. Чтобы дыра на экране росла так, как задумано, радиус делим
         на масштаб — иначе при ×9 она мгновенно сожрала бы весь кадр. */
      flowerHole: hole / flowerScale,
      flowerFeather: Math.max(16 / flowerScale, 2.5),
      /* Комната распахивается В СЕРДЦЕВИНЕ: её видно только внутри дыры,
         и дыра чуть опережает кромку лепестков, чтобы между слоями не
         возникало чёрного колечка. */
      roomHole: hole + 10,
      roomScale: 1.75 - come * 0.45 - settle * 0.3,
      roomLift: (1 - settle) * -8,
      // из тёмной сердцевины выходим на свет: комната разгорается
      roomDim: 0.42 + 0.58 * ramp(p, 0.6, 0.96),
      /* Что видно В ДЫРЕ на телефоне: отдельный крупный кадр комнаты.
         В маленьком круглом отверстии общий план читался тёмным пятном —
         нужен предмет, а не сцена (замечание владельца). К приходу внутрь
         крупный план уходит, и дальше работает принятая комната. */
      coreOpacity: 1 - ramp(p, 0.68, 0.8),
      // кромка дыры светится — видно, что это именно вход, а не вырез
      glow: 0.3 * ramp(p, 0.5, 0.64) * (1 - ramp(p, 0.74, 0.86)),
      // подпись уходит, когда зритель полетел внутрь
      capOpacity: 1 - ramp(p, 0.4, 0.56),
      insideOpacity: ramp(p, 0.86, 0.97),
    }
  }, [p])

  return (
    <section
      data-scrub
      data-night
      id="bloom"
      ref={sectionRef}
      className="relative h-[330vh]"
      aria-label="Цветок распускается по мере прокрутки, внутри него открывается ночная комната"
    >
      {/* Фон сцены обязателен и обязательно НЕПРОЗРАЧНЫЙ: sticky+overflow
          создают stacking context, и без него mix-blend-screen смешивается
          с пустотой — чёрная подложка ролика остаётся чёрной (грабля 9). */}
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-velvet">
        {/* 1. Комната РАСПАХИВАЕТСЯ в сердцевине: маска-апертура растёт из
            центра, поэтому комната не «проступает» поверх всего кадра, а
            открывается там, где у цветка дыра. Маска на обёртке безопасна:
            внутри неё нет ни одного элемента с mix-blend-mode. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            maskImage: aperture(dive.roomHole, false),
            WebkitMaskImage: aperture(dive.roomHole, false),
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        >
          <picture>
            <source media="(min-width: 768px)" srcSet={MEDIA.room169} />
            <img
              src={MEDIA.room916}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{
                transform: `scale(${dive.roomScale}) translateY(${dive.roomLift}%)`,
                filter: `brightness(${dive.roomDim})`,
                willChange: 'transform',
              }}
            />
          </picture>
          {/* крупный план — только на телефоне и только пока летим внутрь */}
          {dive.coreOpacity > 0.01 ? (
            <div
              className="absolute inset-0 md:hidden"
              style={{ opacity: dive.coreOpacity }}
            >
              <img
                src={MEDIA.core916}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                style={{
                  transform: `scale(${1 + (dive.roomScale - 1) * 0.4}) translateY(${dive.roomLift * 0.4}%)`,
                  filter: `brightness(${dive.roomDim})`,
                  willChange: 'transform',
                }}
              />
            </div>
          ) : null}
          {reduced ? null : (
            <>
              <div className="room-rain absolute inset-0" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {DUST.map((d, i) => (
                  <span
                    key={i}
                    className="room-dust"
                    style={
                      {
                        left: `${d.left}%`,
                        width: d.size,
                        height: d.size,
                        '--rd-t': `${d.t}s`,
                        '--rd-d': `${d.d}s`,
                        '--rd-dx': `${d.dx}vw`,
                        '--rd-o': d.o,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 2. Сам цветок. Масштаб и маска — в ЭЛЕМЕНТЕ, не в обёртке: обёртка
            с transform или mask создала бы контекст наложения, и screen
            перестал бы видеть комнату под собой (см. шапку файла).
            Маска обратная: лепестки съедаются от сердцевины наружу — зритель
            проходит СКВОЗЬ них, а не смотрит, как они тают. */}
        <video
          ref={videoRef}
          poster={MEDIA.bloomPoster}
          muted
          playsInline
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            transform: `scale(${dive.flowerScale})`,
            opacity: dive.flowerOpacity,
            maskImage:
              dive.flowerHole > 0 ? aperture(dive.flowerHole, true, dive.flowerFeather) : undefined,
            WebkitMaskImage:
              dive.flowerHole > 0 ? aperture(dive.flowerHole, true, dive.flowerFeather) : undefined,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            willChange: 'transform, opacity',
          }}
        />

        {/* 3. сердцевина разгорается — из неё и выходит комната */}
        <div
          aria-hidden
          className="core-glow pointer-events-none absolute top-1/2 left-1/2 h-[62vmax] w-[62vmax] -translate-x-1/2 -translate-y-1/2"
          style={{ opacity: dive.glow }}
        />

        {/* 4. виньетка кадра */}
        <div aria-hidden className="stage-vignette absolute inset-0" />

        {/* 5. подпись: огромная типографика поверх кадра, без коробки.
            Коробку заменил скрим — на светлых лепестках белый текст иначе
            не читается, а коробка резала кинокадр (02.10). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-[#fff5ea]/92 via-[#fff5ea]/55 to-transparent"
          style={{ opacity: dive.capOpacity }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-20 px-6 md:top-24 md:px-10"
          style={{ opacity: dive.capOpacity }}
        >
          <p className="text-[0.68rem] tracking-[0.3em] text-peony uppercase">
            {txt.bloom.kicker}
          </p>
          <p className="display mt-3 max-w-[13ch] text-[clamp(2.1rem,6.4vw,4.6rem)] leading-[0.98] text-bone">
            {txt.bloom.title}
          </p>
          <p className="mt-4 text-xs tracking-[0.18em] text-peony uppercase">{txt.bloom.hint}</p>
        </div>

        {/* 6. Долетели: здесь обещание исполняется словами. Раньше зритель
            попадал внутрь и оставался без ответа, почему мастерская так
            называется (замечание владельца 02.10). */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-16 px-6 text-center md:bottom-20 md:px-10"
          style={{ opacity: dive.insideOpacity }}
        >
          {/* Подложка обязательна: строка стоит по яркому роялю, и без неё
              читалась впритык (замечание владельца 02.10). */}
          <p className="display mx-auto inline-block max-w-[22ch] rounded-2xl bg-[#fff5ea]/92 px-5 py-3 text-[clamp(1.2rem,3vw,2.1rem)] leading-[1.14] text-bone shadow-[0_10px_40px_rgba(122,11,54,0.18)]">
            {txt.bloom.inside}
          </p>
        </div>

        {/* 7. единственный интерфейс кадра — линия прокрутки */}
        <div aria-hidden className="scrub-rail absolute inset-x-6 bottom-8 h-px md:inset-x-10">
          <span style={{ transform: `scaleX(${Math.max(p, 0.001)})` }} />
        </div>
      </div>
    </section>
  )
}
