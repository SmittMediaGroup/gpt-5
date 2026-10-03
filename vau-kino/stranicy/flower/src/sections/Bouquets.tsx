import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MEDIA } from '../data/clips'
import { useContent } from '../content/useContent'
import { media } from '../content/studio'

/**
 * Афиша одного ноктюрна: трёхсекундный ролик-бумеранг вместо статичного
 * кадра. Вес держим зубами — пять роликов на одной полосе легко убивают
 * телефон, поэтому:
 *   * preload="none" и src подставляется только перед первым показом;
 *   * одновременно играет ОДНА карточка: на телефоне та, что в центре
 *     экрана (IntersectionObserver), на десктопе — та, на которую навели;
 *   * под prefers-reduced-motion ролика нет вовсе, остаётся постер.
 * Постер обязателен: он же первый кадр до загрузки и кадр для reduced.
 */
function OpusFrame({
  clip,
  poster,
  reduced,
}: {
  clip: string
  poster: string
  reduced: boolean
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const vidRef = useRef<HTMLVideoElement>(null)
  const [wide] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 768))

  const play = () => {
    const v = vidRef.current
    if (!v) return
    if (!v.getAttribute('src')) v.setAttribute('src', clip)
    v.play().catch(() => {})
  }
  const stop = () => {
    const v = vidRef.current
    if (v && !v.paused) v.pause()
  }

  useEffect(() => {
    if (reduced || wide) return
    const el = boxRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio > 0.62) play()
        else stop()
      },
      { threshold: [0, 0.62, 1] },
    )
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, wide, clip])

  return (
    <div
      ref={boxRef}
      className="relative -mx-7 -mt-7 mb-5 overflow-hidden bg-stage"
      onMouseEnter={reduced || !wide ? undefined : play}
      onMouseLeave={reduced || !wide ? undefined : stop}
    >
      {reduced ? (
        <img
          src={poster}
          alt=""
          loading="lazy"
          draggable={false}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <video
          ref={vidRef}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="aspect-[4/3] w-full object-cover"
        />
      )}
    </div>
  )
}

/**
 * Программа вечера — горизонтальная лента афиш (приём мировых
 * витрин: showcase тянется вбок, а не листается вниз). Десктоп —
 * drag мышью с инерцией framer-motion; мобайл — нативный
 * горизонтальный скролл со снапом. Каждый букет — театральная
 * афиша с номером в пол-экрана.
 *
 * Букеты правятся в Студии списком. Фото у букета необязательно: без него
 * афиша остаётся типографской (номер-гигант), с ним фото встаёт на место
 * номера.
 */
export function Bouquets() {
  const txt = useContent()
  const reduced = useReducedMotion()
  const laneRef = useRef<HTMLDivElement>(null)
  const [bound, setBound] = useState(0)

  useEffect(() => {
    const el = laneRef.current
    if (!el) return
    const measure = () => setBound(Math.max(0, el.scrollWidth - el.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <section id="opus" className="relative overflow-x-clip border-t border-bone/10 py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6">
        <p className="text-xs tracking-[0.22em] text-smoke uppercase">{txt.bouquets.kicker}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display max-w-[18ch] text-[clamp(1.7rem,3.6vw,2.8rem)]">
            {txt.bouquets.title}
          </h2>
          <p className="hidden text-xs tracking-[0.18em] text-peony uppercase md:block">{txt.bouquets.dragHint}</p>
        </div>
        {/* «Опус» — слово из музыки, и это нигде не было сказано (02.10) */}
        <p className="mt-4 max-w-[46ch] text-sm text-smoke">{txt.bouquets.lead}</p>
      </div>

      {/* лента: на мобиле скролл+снап, на десктопе drag с инерцией */}
      <div
        ref={laneRef}
        className="mt-12 snap-x snap-mandatory overflow-x-auto pb-4 md:snap-none md:overflow-x-visible md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <motion.ul
          drag={reduced ? false : 'x'}
          dragConstraints={{ left: -bound, right: 0 }}
          dragElastic={0.08}
          className="flex w-max cursor-grab gap-5 px-6 active:cursor-grabbing md:pl-[max(1.5rem,calc((100vw-1100px)/2))]"
        >
          {txt.bouquets.items.map((b, i) => (
            <motion.li
              key={b.id || i}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] }}
              className="group relative w-[78vw] max-w-[360px] shrink-0 snap-center border border-bone/12 bg-soot/40 p-7 transition-colors duration-250 select-none hover:border-peony/60 md:w-[360px]"
            >
              {/* Афиша букета: трёхсекундная пьеса во всю ширину карточки,
                  на ней номер ноктюрна в пол-кадра. Раньше тут был номер по
                  кремовому — лента читалась списком, а не витриной (02.10). */}
              <div className="relative">
                <OpusFrame
                  clip={`${import.meta.env.BASE_URL}${MEDIA.opus[i % MEDIA.opus.length]}`}
                  poster={media(b.photo) || `${import.meta.env.BASE_URL}${MEDIA.bloomPoster}`}
                  reduced={!!reduced}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 bottom-5 -mx-7 -mt-7 bg-gradient-to-t from-[#2b1320]/55 via-transparent to-transparent"
                />
                <p
                  aria-hidden
                  className="display pointer-events-none absolute left-4 bottom-1 text-[6.5rem] leading-none text-[#f6ecdf]/80 transition-colors duration-300 group-hover:text-[#ff8aa6]/90"
                >
                  {i + 1}
                </p>
              </div>
              {b.opus ? <p className="text-xs tracking-[0.2em] text-smoke uppercase">{b.opus}</p> : null}
              <h3 className="display mt-2 text-3xl break-words">{b.name}</h3>
              <p className="mt-2 min-h-[2.6em] text-sm text-smoke">{b.mood}</p>
              <p className="mt-5 border-t border-bone/10 pt-4 text-sm leading-relaxed text-bone/75">
                {b.stems}
              </p>
              <div className="mt-6 flex items-baseline justify-between gap-4">
                <a
                  href="#atelier"
                  className="inline-flex min-h-11 items-center text-sm text-peony underline-offset-4 transition-colors duration-200 hover:underline"
                  draggable={false}
                >
                  {txt.bouquets.more}
                </a>
                <span className="display text-2xl whitespace-nowrap tabular-nums">{b.price}</span>
              </div>
            </motion.li>
          ))}
          {/* хвост ленты — приглашение в ателье */}
          <li className="flex w-[70vw] max-w-[300px] shrink-0 snap-center items-center justify-center border border-dashed border-bone/20 p-7">
            <a href="#atelier" className="display block text-center text-2xl text-smoke transition-colors duration-200 hover:text-peony">
              {txt.bouquets.tailTop}
              <br />
              {txt.bouquets.tailBottom}
            </a>
          </li>
        </motion.ul>
      </div>

      <p className="mx-auto mt-8 max-w-[1100px] px-6 text-xs text-smoke/70">
        {txt.bouquets.note}
      </p>
    </section>
  )
}
