import { useRef } from 'react'
import { lin, ramp, useIsPhone, useSceneProgress } from '../lib/hooks'
import { MarkerAt } from './Marker'

/**
 * СЦЕНА 1 «Пять деталей запроса».
 * Механизм: прокрутка = занятие «час 1–2» воркшопа. В сырой запрос сотрудника
 * по одной встают пять деталей каркаса (роль → контекст → задача → формат →
 * ограничения), каждая прокрашивается маркером. Справа ответ той же нейросети
 * перерисовывается на каждом шаге: из «воды» — в письмо, которое можно отправить.
 * На шаге «формат» модель выдумывает имя клиента — и только пятая деталь
 * («не придумывай») это убирает. Так видно, чему именно учим.
 * Всё считается из p, поэтому назад по прокрутке сцена отыгрывает обратно.
 */

const BASE = 'Напиши письмо клиенту про задержку поставки.'

const DETAILS = [
  { k: 'Роль', full: 'Ты — менеджер по работе с ключевыми клиентами оптовой компании.', short: 'менеджер по ключевым клиентам' },
  { k: 'Контекст', full: 'Клиент ждал партию 12-го. Из-за таможни привезём 19-го.', short: 'ждали 12-го, привезём 19-го' },
  { k: 'Задача', full: 'Извинись, назови новую дату, предложи бесплатную доставку.', short: 'извиниться, дата, доставка за нас' },
  { k: 'Формат', full: 'До 80 слов, тема письма отдельной строкой, без канцелярита.', short: 'до 80 слов, тема отдельно' },
  { k: 'Ограничения', full: 'Не придумывай имён и условий, которых нет выше. Чего не хватает — спроси.', short: 'ничего не выдумывать' },
]

type Answer = { subj?: string; body: React.ReactNode; status: string }

const FAKE = (s: string) => (
  <span className="relative underline decoration-ink decoration-wavy decoration-2 underline-offset-4">
    {s}
    <span className="ml-1 rounded bg-ink px-1.5 py-0.5 align-middle text-[0.62rem] font-bold uppercase tracking-wider text-pole">
      выдумано
    </span>
  </span>
)

const ANSWERS: Answer[] = [
  {
    body: 'Уважаемый клиент! В современном мире логистика — сложный и многогранный процесс. Наша компания ценит каждого партнёра и делает всё возможное для обеспечения высокого качества услуг. Приносим извинения за возможные неудобства и благодарим за понимание…',
    status: 'Вода. Переписывать целиком',
  },
  {
    body: 'Добрый день! Пишу как ваш менеджер по поставкам. К сожалению, с вашим заказом возникла задержка. Мы делаем всё возможное, чтобы решить вопрос как можно скорее. Приносим извинения за неудобства.',
    status: 'Тон появился, сути нет',
  },
  {
    body: 'Добрый день! Партия, которую вы ждали 12-го, задержалась на таможне. Ожидаем поступление 19-го. Приносим извинения за неудобства и благодарим за понимание.',
    status: 'Факты есть, решения нет',
  },
  {
    body: 'Добрый день! Партия, которую вы ждали 12-го, задержалась на таможне — привезём 19-го. Простите за сдвиг: понимаем, что он ломает вам план. В качестве компенсации доставим эту партию бесплатно. Если 19-е не подходит, предложите удобный день — подстроимся под вас.',
    status: 'По сути верно, но длинно и без темы',
  },
  {
    subj: 'Новая дата поставки — 19-е, доставка за наш счёт',
    body: (
      <>
        Здравствуйте, {FAKE('Ирина Сергеевна')}! Партия, которую вы ждали 12-го, задержалась на таможне —
        привезём 19-го. Простите за сдвиг. Доставку этой партии берём на себя. Удобно принять{' '}
        {FAKE('до обеда')}?
      </>
    ),
    status: 'Коротко, но модель придумала имя',
  },
  {
    subj: 'Новая дата поставки — 19-е, доставка за наш счёт',
    body: 'Здравствуйте! Партия, которую вы ждали 12-го, задержалась на таможне — привезём 19-го. Простите за сдвиг: понимаем, что он ломает вам план. Доставку этой партии берём на себя. Подтвердите, пожалуйста, адрес склада — и согласуем время.',
    status: 'Можно отправлять',
  },
]

// пороги появления деталей по прогрессу сцены
const T = [0.2, 0.34, 0.48, 0.62, 0.76]

export function ScenePrompt() {
  const ref = useRef<HTMLElement>(null)
  const p = useSceneProgress(ref)
  const phone = useIsPhone()

  const appear = T.map((t) => ramp(p, t - 0.07, t))
  const level = appear.reduce((s, a) => s + (a > 0.5 ? 1 : 0), 0)
  const intro = ramp(p, 0, 0.1)
  // маркер сначала зачёркивает «воду» в ответе, потом идёт дописывать запрос
  const strike = lin(p, 0.05, 0.13)

  return (
    <section
      ref={ref}
      id="kak-uchim"
      className="relative bg-pole-2"
      style={{ height: phone ? '300vh' : '340vh' }}
      aria-label="Как меняется ответ нейросети, когда сотрудник умеет ставить задачу"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden px-4 pb-4 pt-[68px] md:px-10 md:pb-8 md:pt-[92px]">
        <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
            <div>
              <p className="eyebrow text-ink-2">Час 1–2 воркшопа · каркас запроса</p>
              <h2 className="display mt-2 max-w-[22ch] text-[7.4vw] leading-[1] md:mt-3 md:text-[3.5vw] xl:text-[3.4rem]">
                Нейросеть одна. Результат — у того, кто умеет&nbsp;спросить.
              </h2>
            </div>
            {/* шкала из пяти деталей */}
            <ol className="hidden gap-2 md:flex" aria-hidden="true">
              {DETAILS.map((d, i) => {
                const on = appear[i] > 0.5
                return (
                  <li
                    key={d.k}
                    className={`rounded-full border-2 border-ink px-3.5 py-1.5 text-[0.9rem] font-semibold transition-colors duration-200 ${on ? 'bg-ink text-pole' : 'bg-transparent text-ink'}`}
                  >
                    {i + 1}. {d.k}
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="mt-4 grid flex-1 grid-rows-[auto_auto] content-start gap-3 md:mt-8 md:grid-cols-[1fr_auto_1fr] md:grid-rows-1 md:items-start md:gap-6">
            {/* ЗАПРОС */}
            <div
              className="rounded-[22px] border-2 border-ink bg-krem p-4 md:rounded-[28px] md:p-8 md:shadow-[10px_10px_0_#f2b705]"
              style={{ transform: `translateY(${(1 - intro) * 30}px)`, opacity: 0.4 + intro * 0.6 }}
            >
              <div className="mb-2.5 flex items-center justify-between md:mb-4">
                <span className="eyebrow text-[0.7rem] text-ink-2">Запрос сотрудника</span>
                <span className="num text-[0.75rem] font-semibold text-ink-2">{level}/5 деталей</span>
              </div>
              <p className="font-display text-[1.02rem] font-bold leading-snug md:text-[1.6rem]">{BASE}</p>
              <ul className="mt-2 space-y-1.5 md:mt-4 md:space-y-3.5">
                {DETAILS.map((d, i) => {
                  const a = appear[i]
                  const sweep = lin(p, T[i] - 0.05, T[i] + 0.02)
                  const fade = ramp(p, T[i] + 0.06, T[i] + 0.12)
                  return (
                    <li
                      key={d.k}
                      className="flex items-start gap-2.5"
                      style={{
                        opacity: a,
                        transform: `translateX(${(1 - a) * 46}px)`,
                      }}
                    >
                      <span className="mt-[2px] shrink-0 rounded-md bg-ink px-1.5 py-0.5 text-[0.66rem] font-bold uppercase tracking-wider text-pole md:mt-[3px] md:px-2 md:text-[0.72rem]">
                        {d.k}
                      </span>
                      <span className="relative block min-w-0 flex-1">
                      <span
                        className="hl text-[0.9rem] leading-[1.45] md:text-[1.12rem]"
                        style={{
                          backgroundSize: `${sweep * 100}% 88%`,
                          ['--hl' as string]: fade > 0 ? `color-mix(in oklch, #ffd43b ${100 - fade * 55}%, #fff7da)` : '#ffd43b',
                        }}
                      >
                        {phone ? d.short : d.full}
                      </span>
                      {sweep > 0 && sweep < 1 ? (
                        <MarkerAt x={`${sweep * 100}%`} y="0.8em" angle={32} width={phone ? '5.5em' : '9em'} className="z-20" />
                      ) : null}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* стрелка */}
            <div className="hidden h-full items-center md:flex" aria-hidden="true">
              <svg width="64" height="40" viewBox="0 0 64 40">
                <path d="M2 20 H54 M40 6 L58 20 L40 34" fill="none" stroke="#17140a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* ОТВЕТ */}
            <div
              className="relative rounded-[22px] border-2 border-ink bg-white/80 p-4 md:rounded-[28px] md:p-8 md:shadow-[10px_10px_0_#f2b705]"
              style={{ transform: `translateY(${(1 - intro) * 50}px)`, opacity: 0.4 + intro * 0.6 }}
            >
              <div className="mb-2.5 flex items-center justify-between md:mb-4">
                <span className="eyebrow text-[0.7rem] text-ink-2">Ответ нейросети</span>
                {/* шкала готовности: 6 делений, без выдуманных процентов */}
                <span className="flex gap-1" aria-hidden="true">
                  {ANSWERS.map((_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-4 rounded-sm border border-ink md:w-6"
                      style={{ background: i <= level ? '#17140a' : 'transparent' }}
                    />
                  ))}
                </span>
              </div>
              <div className="grid">
                {ANSWERS.map((ans, i) => {
                  const o = i === level ? 1 : 0
                  return (
                    <div
                      key={i}
                      className="col-start-1 row-start-1 transition-[opacity,transform] duration-300 ease-out"
                      style={{ opacity: o, transform: `translateY(${o ? 0 : 8}px)` }}
                      aria-hidden={i !== level}
                    >
                      {ans.subj ? (
                        <p className="mb-2 text-[0.86rem] font-bold md:text-[1.12rem]">
                          <span className="text-ink-2">Тема: </span>
                          {ans.subj}
                        </p>
                      ) : null}
                      <p className={`relative text-[0.88rem] leading-[1.5] md:text-[1.2rem] ${i === 0 ? 'text-ink-2 italic' : ''}`}>
                        {i === 0 ? (
                          <span
                            style={{
                              backgroundImage: 'linear-gradient(#17140a, #17140a)',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: '0 58%',
                              backgroundSize: `${strike * 100}% 3px`,
                              WebkitBoxDecorationBreak: 'clone',
                              boxDecorationBreak: 'clone',
                            }}
                          >
                            {ans.body}
                          </span>
                        ) : (
                          ans.body
                        )}
                        {i === 0 && strike > 0 && strike < 1 ? (
                          <MarkerAt x={`${strike * 100}%`} y="40%" angle={30} width={phone ? '7em' : '10em'} className="z-20" />
                        ) : null}
                      </p>
                    </div>
                  )
                })}
              </div>
              {/* штамп: «вода» в начале, «можно отправлять» в конце */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-5 rounded-lg border-[3px] border-ink bg-krem px-3 py-1 font-display text-[0.95rem] font-black uppercase tracking-wider md:-right-4 md:-top-7 md:text-[1.35rem]"
                style={{ opacity: level === 0 ? 1 : 0, transform: `rotate(7deg) scale(${level === 0 ? 1 : 1.4})`, transition: 'opacity .2s, transform .25s' }}
              >
                вода
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-2 -top-5 rounded-lg border-[3px] border-ink bg-pole px-3 py-1 font-display text-[0.95rem] font-black uppercase tracking-wider md:-right-5 md:-top-8 md:text-[1.35rem]"
                style={{ opacity: level === 5 ? 1 : 0, transform: `rotate(-6deg) scale(${level === 5 ? 1 : 1.5})`, transition: 'opacity .2s, transform .3s cubic-bezier(.22,1,.36,1)' }}
              >
                можно отправлять
              </span>
              <div className="mt-3 flex items-center gap-2 border-t-2 border-dashed border-ink/30 pt-2.5 md:mt-5 md:pt-4">
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full border-2 border-ink"
                  style={{ background: level === 5 ? '#17140a' : 'transparent' }}
                />
                <span className="text-[0.86rem] font-semibold md:text-[1rem]">{ANSWERS[level].status}</span>
              </div>
            </div>
          </div>

          <p
            className="mt-3 hidden max-w-[52rem] text-[1.02rem] text-ink-2 md:block"
            style={{ opacity: ramp(p, 0.8, 0.9) }}
          >
            На занятии каждый проходит этот путь на своей задаче — письме, отчёте, договоре. Каркас
            остаётся в библиотеке промптов отдела.
          </p>
        </div>
      </div>
    </section>
  )
}
