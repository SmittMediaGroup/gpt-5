import { useState, type FormEvent } from 'react'
import { Badge } from './Hero'

/**
 * Форма без своего обработчика (ТЗ): кнопка собирает письмо на
 * info@smittmediagroup.ru, рядом — прямой Telegram. Отдельная галочка
 * согласия на ПДн (152-ФЗ), без неё кнопка не активна.
 */
const ROLI = ['Заявки 24/7', 'Звонки', 'Юрист-консультант', 'Отзывы', 'Другое']

export function Forma() {
  const [imya, setImya] = useState('')
  const [kontakt, setKontakt] = useState('')
  const [rol, setRol] = useState('Заявки 24/7')
  const [soglasie, setSoglasie] = useState(false)

  const gotovo = soglasie && imya.trim() && kontakt.trim()

  const otpravit = (e: FormEvent) => {
    e.preventDefault()
    if (!gotovo) return
    const tema = `Разбор 30 минут: ИИ-⁠сотрудник — ${rol}`
    const telo = `Имя: ${imya}\nТелефон или Telegram: ${kontakt}\nРоль: ${rol}\n\nСогласие на обработку персональных данных дано на странице vau-ii-sotrudniki.`
    window.location.href = `mailto:info@smittmediagroup.ru?subject=${encodeURIComponent(tema)}&body=${encodeURIComponent(telo)}`
  }

  return (
    <section data-status="ждёт вашу заявку" id="forma" className="zerno relative overflow-hidden bg-pole px-4 py-20 sm:px-6 md:py-28">
      <div
        aria-hidden
        className="absolute -right-[12vw] -top-[10vh] h-[80%] w-[54vw] bg-pole-hi"
        style={{ borderRadius: '42% 58% 63% 37% / 45% 38% 62% 55%' }}
      />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 md:grid-cols-[1fr_1fr]">
        <div>
          <p className="kapsy flex items-center gap-2">
            <span className="tochka" aria-hidden /> Вакансия открыта
          </p>
          <h2 className="head mt-4 text-[clamp(2.8rem,8vw,6.6rem)]">Выведем ИИ-⁠сотрудника на первую смену</h2>
          <p className="mt-5 max-w-[42ch] text-[1.12rem] font-medium">
            Оставьте контакт — за 30 минут разберём вашу задачу, покажем, какую роль стоит запустить
            первой, и назовём цену.
          </p>
          <div className="mt-10 hidden text-[11px] md:block lg:text-[12px]">
            <div className="rotate-[-4deg]">
              <Badge />
            </div>
          </div>
        </div>

        <form
          onSubmit={otpravit}
          className="rounded-[1.6rem] border-2 border-chern bg-bumaga p-5 shadow-[0.8rem_1rem_0_oklch(0.45_0.12_148/0.4)] md:p-8"
        >
          <p className="kapsy text-glub">Заявка на разбор</p>
          <label className="mt-5 block">
            <span className="text-sm font-bold">Как к вам обращаться</span>
            <input
              value={imya}
              onChange={(e) => setImya(e.target.value)}
              autoComplete="given-name"
              className="mt-1.5 block h-13 w-full rounded-xl border-2 border-chern bg-white px-4 text-base outline-none focus:border-glub focus:ring-4 focus:ring-pole/60"
              placeholder="Имя"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-bold">Телефон или Telegram</span>
            <input
              value={kontakt}
              onChange={(e) => setKontakt(e.target.value)}
              autoComplete="tel"
              className="mt-1.5 block h-13 w-full rounded-xl border-2 border-chern bg-white px-4 text-base outline-none focus:border-glub focus:ring-4 focus:ring-pole/60"
              placeholder="+7… или @ник"
            />
          </label>
          <fieldset className="mt-5">
            <legend className="text-sm font-bold">Какую работу хотите отдать</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {ROLI.map((r) => (
                <label
                  key={r}
                  className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 border-chern px-4 text-sm font-semibold transition-colors duration-150 ${
                    rol === r ? 'bg-chern text-pole' : 'bg-bumaga hover:bg-myata'
                  }`}
                >
                  <input type="radio" name="rol" value={r} checked={rol === r} onChange={() => setRol(r)} className="sr-only" />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="mt-6 flex cursor-pointer gap-3 text-[0.92rem] leading-snug">
            <input
              type="checkbox"
              checked={soglasie}
              onChange={(e) => setSoglasie(e.target.checked)}
              className="mt-0.5 size-6 shrink-0 accent-[oklch(0.45_0.12_148)]"
              required
            />
            <span>
              Даю отдельное согласие на обработку персональных данных (имя и контакт) для ответа на заявку —
              по{' '}
              <a href="https://smittmediagroup.ru/privacy" rel="noopener" target="_blank" className="font-bold underline underline-offset-2">
                Политике обработки персональных данных
              </a>
              .
            </span>
          </label>
          <p className="mt-3 text-xs text-seryy">Не пишите в заявке данные ваших клиентов — они нам на разборе не нужны.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!gotovo}
              className="inline-flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full bg-chern px-6 font-bold text-pole transition-transform duration-150 enabled:hover:-translate-y-0.5 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span className="tochka" aria-hidden /> Отправить письмом
            </button>
            <a
              href="https://t.me/SmittMG"
              rel="noopener"
              className="inline-flex min-h-14 items-center justify-center rounded-full border-2 border-chern px-6 font-bold hover:bg-myata"
            >
              Написать в Telegram
            </a>
          </div>
          {!soglasie && <p className="mt-3 text-xs text-seryy">Кнопка станет активной после галочки согласия.</p>}
        </form>
      </div>
    </section>
  )
}
