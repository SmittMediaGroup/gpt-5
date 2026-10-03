import { useRef, useState } from 'react'
import { useNear } from '../lib/useNear'
import { useReducedMotion } from 'framer-motion'
import { MEDIA } from '../data/clips'
import { useContent } from '../content/useContent'

/**
 * Интермеццо «руки флориста»: тюльпан встаёт в вазу и возвращается
 * (бумеранг, screen на бархате). Мост от кино к интерактивному ателье.
 */
export function Hands() {
  const txt = useContent()
  const reduced = useReducedMotion()
  const [mobile] = useState(() => window.innerWidth < 768)
  const ref = useRef<HTMLElement>(null)
  const near = useNear(ref)

  return (
    /* night-band — НЕПРОЗРАЧНАЯ ночь под слоем с blend. Раньше у секции
       своего фона не было вовсе, темноту изображал полупрозрачный градиент
       from-velvet/70: screen ложился на кремовую страницу и давал почти
       чистый белый — полоса между ценами и заголовком «забелилась»
       (грабля 9 с обратным знаком, замечание владельца 02.10).
       Градиентом это не лечится: лечит только непрозрачный фон секции. */
    <section
      ref={ref}
      id="hands"
      data-night
      className="night-band canvas-grain relative overflow-hidden"
      aria-label="Флорист ставит цветок в вазу"
    >
      {/* Под reduced-motion РАНЬШЕ не рендерилось вообще ничего, и полоса
          оказывалась пустым тёмным прямоугольником с одним заголовком
          (владелец смотрит именно в этом режиме). Теперь движение убираем,
          а кадр остаётся: тот же постер ролика. */}
      {reduced ? (
        <img
          src={MEDIA.vasePoster}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <video
          src={near ? (mobile ? MEDIA.vase916 : MEDIA.vase169) : undefined}
          poster={MEDIA.vasePoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* всё, что ниже, рисуется ПОСЛЕ слоя с blend — забелить уже не может */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-[#fff5ea] via-[#fff5ea]/15 to-transparent"
      />
      <div aria-hidden className="stage-vignette absolute inset-0" />
      <div className="relative mx-auto flex min-h-[74svh] max-w-[1100px] flex-col items-start justify-end px-6 py-24">
        <p className="text-xs tracking-[0.24em] text-peony uppercase">{txt.hands.kicker}</p>
        <h2 className="display mt-4 max-w-[16ch] text-[clamp(2rem,6.2vw,4.4rem)] leading-[0.98]">
          {txt.hands.title}
        </h2>
        <p className="mt-4 max-w-[36ch] text-sm text-smoke">{txt.hands.lead}</p>
      </div>
    </section>
  )
}
