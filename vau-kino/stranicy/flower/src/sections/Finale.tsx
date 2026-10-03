import { useRef, useState } from 'react'
import { useNear } from '../lib/useNear'
import { motion, useReducedMotion } from 'framer-motion'
import { MEDIA } from '../data/clips'
import { useContent } from '../content/useContent'

// Имя витрины берём из base-пути сборки: '/files/apiary/' → 'apiary'.
// Так файл переносится между демо без правок.
const SITE = (import.meta.env.BASE_URL || '/').split('/').filter(Boolean).pop() || 'flower'

// Адрес приёмника; переопределяется VITE_LEAD_ENDPOINT для локальной отладки.
const ENDPOINT: string =
  import.meta.env.VITE_LEAD_ENDPOINT || 'https://smittmediagroup.ru/clients/api/demo-lead'

// Молчащий сервер — та же неудача, что и отказ: не держим человека вечно.
const TIMEOUT_MS = 15000

type LeadState = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Финал: лепестки падают сквозь темноту (клип-слот petals, пока —
 * CSS-частицы, ловящие свет) и одна форма. Форма честная: концепт не
 * отправляет заявки, о чём и говорит после «отправки».
 */

export function Finale() {
  const txt = useContent()
  const reduced = useReducedMotion()
  const [mobile] = useState(() => window.innerWidth < 768)
  const finRef = useRef<HTMLElement>(null)
  const near = useNear(finRef)
  const [state, setState] = useState<LeadState>('idle')
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  // Поле-ловушка: человек его не видит и не заполнит, бот заполняет всё подряд.
  const [company, setCompany] = useState('')
  const sending = state === 'sending'

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const valid = name.trim().length > 0 && phone.trim().length >= 6 && agreed

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid || sending) return
    setState('sending')
    setError('')
    const stop = new AbortController()
    const timer = setTimeout(() => stop.abort(), TIMEOUT_MS)
    try {
      // Сайт, подключённый к Студии, шлёт заявки клиенту в его Студию
      const res = await fetch(txt.site.leadsUrl || ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site: SITE, name: name.trim(), contact: phone.trim(), company }),
        signal: stop.signal,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data || data.ok !== true) {
        setError((data && typeof data.error === 'string' && data.error) ||
          'Не получилось отправить. Попробуйте ещё раз.')
        setState('error')
        return
      }
      setState('sent')
    } catch {
      // Обрыв связи, таймаут, отказ браузера — причина для человека одна: не дошло.
      setError('Связь пропала — заявка не ушла. Проверьте интернет и попробуйте ещё раз.')
      setState('error')
    } finally {
      clearTimeout(timer)
    }
  }


  return (
    /* night-band: та же беда, что у секции «руки» — ролик лепестков висел
       с mix-blend-screen над кремовой страницей и забелил бы финал целиком.
       Непрозрачная ночь под слоем с blend — и лепестки снова ловят свет,
       а манифест читается светлым по бархату (02.10). */
    <section
      ref={finRef}
      id="finale"
      data-night
      className="night-band canvas-grain relative min-h-svh overflow-hidden px-6 py-24 md:py-32"
    >
      {/* PetalRain под reduced-motion возвращает null — значит в этой ветке
          раньше не было НИЧЕГО. Ставим статичный кадр лепестков. */}
      {reduced ? (
        <img
          src={MEDIA.petalsPoster}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
        />
      ) : (
        <video
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80"
          src={near ? (mobile ? MEDIA.petals916 : MEDIA.petals169) : undefined}
          poster={MEDIA.petalsPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
      {/* после слоя с blend: свет свечи сверху, виньетка и шов со страницей */}
      <div
        aria-hidden
        className="core-glow candle-flicker pointer-events-none absolute top-[-26%] left-1/2 h-[92vmax] w-[92vmax] -translate-x-1/2"
      />
      <div aria-hidden className="stage-vignette pointer-events-none absolute inset-0" />

      {/* Манифест-крещендо: последний толчок перед формой */}
      <div className="relative mx-auto mb-20 max-w-[900px] pt-6 text-center md:mb-24">
        {/* последняя строка манифеста — акцентная, сколько бы строк ни было */}
        {txt.finale.manifest.map((line, i, all) => (
          <motion.p
            key={i}
            initial={reduced ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.65, delay: i * 0.22, ease: [0.25, 1, 0.5, 1] }}
            className={`display text-[clamp(2.1rem,7vw,4.8rem)] leading-[1.14] break-words ${i === all.length - 1 ? 'text-peony' : ''}`}
          >
            {line}
          </motion.p>
        ))}
        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mx-auto mt-6 max-w-[46ch] text-base text-smoke"
        >
          {txt.finale.lead}
        </motion.p>
      </div>

      <div className="relative mx-auto flex max-w-[640px] flex-col items-center pt-10 text-center">
        <p className="text-xs tracking-[0.22em] text-smoke uppercase">{txt.finale.kicker}</p>
        <h2 className="display mt-3 text-[clamp(1.9rem,4.4vw,3.2rem)]">
          {txt.finale.title}
        </h2>
        <p className="mt-4 max-w-[44ch] text-sm text-smoke">
          {txt.finale.text}
        </p>

        {state !== 'sent' ? (
          <form
            className="relative mt-10 w-full max-w-[420px]"
            onSubmit={submit}
          >
            <label className="block text-left">
              <span className="text-xs tracking-[0.16em] text-smoke uppercase">{txt.finale.nameLabel}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full border-b border-bone/25 bg-transparent px-1 py-3 text-bone transition-colors duration-200 outline-none placeholder:text-smoke/50 focus:border-peony"
                placeholder={txt.finale.namePlaceholder}
              />
            </label>
            <label className="mt-6 block text-left">
              <span className="text-xs tracking-[0.16em] text-smoke uppercase">{txt.finale.phoneLabel}</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                type="tel"
                inputMode="tel"
                className="mt-2 w-full border-b border-bone/25 bg-transparent px-1 py-3 text-bone transition-colors duration-200 outline-none placeholder:text-smoke/50 focus:border-peony"
                placeholder={txt.finale.phonePlaceholder}
              />
            </label>
            <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
              <input
                tabIndex={-1}
                autoComplete="off"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <label className="mt-6 flex cursor-pointer items-start gap-3 text-left text-[12px] leading-relaxed">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={sending}
                className="mt-[3px] h-4 w-4 shrink-0"
              />
              <span>
                {txt.finale.consent}
              </span>
            </label>
            <button
              type="submit"
              disabled={!valid || sending}
              className="mt-10 inline-flex min-h-12 w-full items-center justify-center border border-peony px-6 text-sm tracking-wide text-peony transition-colors duration-200 hover:bg-peony hover:text-velvet focus-visible:bg-peony focus-visible:text-velvet disabled:cursor-not-allowed disabled:border-bone/15 disabled:text-smoke/50"
            >
              {txt.finale.cta}
            </button>
            {state === 'error' ? (
              <p role="alert" className="mt-4 text-left text-[13px] leading-relaxed text-[#ff9b9b]">
                {error}
              </p>
            ) : null}
            {/* Оговорка у формы: имя и телефон действительно уходят в SmittMediaGroup. */}
            <p className="mt-4 text-left text-[12px] leading-relaxed text-smoke/95">
              {txt.finale.text2}
              {' '}
              <a
                href={`${import.meta.env.BASE_URL}legal.html`}
                className="whitespace-nowrap underline decoration-smoke/52 underline-offset-2 transition-colors duration-200 hover:text-bone focus-visible:text-bone text-smoke/95"
              >
                {txt.finale.cta2}
              </a>
            </p>
          </form>
        ) : (
          <div className="mt-10 max-w-[420px] border border-bone/15 px-6 py-8">
            <p className="display text-xl break-words">
              {txt.finale.thanks}, {name.trim()}.
            </p>
            <p className="mt-3 text-sm text-smoke">
              {txt.finale.text3}
            </p>
            <button
              type="button"
              onClick={() => setState('idle')}
              className="mt-5 min-h-11 text-sm text-peony transition-colors duration-200 hover:text-bone"
            >
              {txt.finale.cta3}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
