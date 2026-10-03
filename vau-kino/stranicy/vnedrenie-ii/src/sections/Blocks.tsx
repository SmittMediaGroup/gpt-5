import { useState } from 'react'
import { CtaButton, Kicker, MAIL, TG } from '../lib/ui'
import { ProcessLineHeader } from './ProcessLine'

/* ───────────── Шапка ───────────── */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="relative mx-auto flex h-12 max-w-[1320px] items-center justify-between gap-3 rounded-full bg-krem/90 pl-4 pr-1.5 shadow-[0_8px_30px_-18px_oklch(0.3_0.08_40/0.6)] backdrop-blur-md sm:h-14 sm:pl-6">
        <a href="#top" className="focus-ring flex min-w-0 items-baseline gap-2">
          <span className="display text-[17px] font-[800] text-choc sm:text-[19px]">SMG</span>
          <span className="mono truncate text-[11px] font-medium text-choc/80 sm:text-[12px]">внедрение ИИ</span>
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a href="#shema" className="focus-ring hidden min-h-11 items-center px-3 text-[14px] font-medium text-choc hover:underline md:inline-flex">Схема</a>
          <a href="#etapy" className="focus-ring hidden min-h-11 items-center px-3 text-[14px] font-medium text-choc hover:underline md:inline-flex">Этапы</a>
          <a href="#ceny" className="focus-ring hidden min-h-11 items-center px-3 text-[14px] font-medium text-choc hover:underline md:inline-flex">Цены</a>
          <a
            href="#razbor"
            className="focus-ring inline-flex h-9 items-center rounded-full bg-rust px-4 text-[13px] font-semibold text-krem transition-colors hover:bg-choc sm:h-11 sm:px-5 sm:text-[14px]"
          >
            Разбор 30 мин
          </a>
        </nav>
        <ProcessLineHeader />
      </div>
    </header>
  )
}

/* ───────────── Боль ───────────── */
const PAINS = [
  ['Чат с нейросетью есть, процесса нет', 'Сотрудники что-то спрашивают у ChatGPT, но заявки, звонки и документы идут тем же ручным путём.'],
  ['Непонятно, с чего начать', 'Сотня сервисов «ИИ для бизнеса», и ни один не говорит, какой процесс отдать первым и окупится ли он.'],
  ['Страшно за данные', 'Отдавать переписку и звонки клиентов в зарубежный сервис нельзя — а без данных ИИ бесполезен.'],
  ['Подрядчик продаёт платформу', 'Вместо результата — лицензия, интеграция на полгода и презентация «цифровой трансформации».'],
]
export function Pain() {
  return (
    <section className="bg-krem px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1320px]">
        <Kicker className="text-rust">Знакомо?</Kicker>
        <p className="display mt-4 max-w-[1100px] text-[clamp(2rem,6.4vw,5.2rem)] font-[750] text-choc">
          ИИ в компании уже есть. А заявки всё равно{' '}
          <span className="rounded-[0.12em] bg-pole px-[0.12em] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">переносят руками</span>.
        </p>
        <div className="mt-12 grid gap-px overflow-hidden rounded-[22px] border-2 border-choc bg-choc sm:mt-16 md:grid-cols-2">
          {PAINS.map(([t, d]) => (
            <div key={t} className="bg-krem p-6 sm:p-8">
              <h3 className="display text-[24px] font-[700] text-choc sm:text-[28px]">{t}</h3>
              <p className="mt-3 max-w-[520px] text-[16px] leading-[1.55] text-choc sm:text-[17px]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────── Плашка-фраза ───────────── */
export function Plate({
  kicker,
  children,
  tone,
  sub,
}: {
  kicker: string
  children: React.ReactNode
  tone: 'peach' | 'pole'
  sub?: React.ReactNode
}) {
  return (
    <section className={`${tone === 'peach' ? 'bg-peach' : 'bg-pole'} px-4 py-24 sm:px-8 sm:py-36`}>
      <div className="mx-auto max-w-[1320px]">
        <Kicker className={tone === 'peach' ? 'text-rust' : 'text-choc'}>{kicker}</Kicker>
        <p className="display mt-5 max-w-[1180px] text-[clamp(2.1rem,6.8vw,5.6rem)] font-[750] text-choc">{children}</p>
        {sub && <div className="mt-8 max-w-[640px] text-[17px] leading-[1.55] text-choc sm:text-[19px]">{sub}</div>}
      </div>
    </section>
  )
}

/* ───────────── Что входит ───────────── */
const INCLUDES = [
  ['Аудит процессов', 'Разбираем, где сотрудники тратят время на повторяющуюся работу, и считаем, какие шаги стоит отдать ИИ, а какие — нет.'],
  ['Пилот на одном процессе', 'Запускаем на ваших реальных данных за 2–4 недели. Меряем «до» и «после» по вашим показателям, а не по нашим обещаниям.'],
  ['Интеграция с CRM и почтой', 'ИИ работает внутри привычных систем: Битрикс24, почта, документы, сайт. Сотрудникам не нужно ходить в отдельный чат.'],
  ['Модели на серверах в России', 'Можем запускать модели на собственных серверах — так работают наши расшифровка звонков и ИИ-юрист. Данные клиентов не уходят за границу.'],
  ['Обучение сотрудников', 'Показываем команде, как работать с новым порядком и как проверять ИИ. Без этого внедрение остаётся на бумаге.'],
  ['Сопровождение', 'Следим за качеством, правим правила и подсказки, добавляем следующие процессы по готовой схеме.'],
]
const CHIPS = ['Обработка заявок', 'Анализ звонков', 'Ответы клиентам 24/7', 'Проверка договоров', 'Коммерческие предложения', 'Отчёты руководителю', 'База знаний для сотрудников']

export function Includes() {
  return (
    <section className="bg-krem px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <Kicker className="text-rust">Что входит во внедрение ИИ</Kicker>
            <h2 className="display mt-4 text-[clamp(2rem,6vw,4.6rem)] font-[750] text-choc">
              Не «нейросеть вообще», а&nbsp;шесть понятных работ
            </h2>
          </div>
          <p className="max-w-[520px] text-[17px] leading-[1.55] text-choc lg:justify-self-end">
            Внедрение искусственного интеллекта в бизнес-процессы — это не покупка сервиса. Это
            перестройка конкретного процесса так, чтобы рутину делал ИИ, а человек проверял итог.
          </p>
        </div>
        <ol className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {INCLUDES.map(([t, d], i) => (
            <li key={t} className={`rounded-[22px] p-6 sm:p-8 ${i === 1 ? 'bg-pole' : 'bg-krem2'}`}>
              <span className={`display text-[40px] font-[850] leading-none ${i === 1 ? 'text-choc' : 'text-rust'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="display mt-4 text-[24px] font-[700] text-choc sm:text-[26px]">{t}</h3>
              <p className="mt-3 text-[16px] leading-[1.55] text-choc">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 sm:mt-14">
          <p className="mono text-[13px] font-semibold uppercase tracking-[0.1em] text-choc">Чаще всего начинаем с</p>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {CHIPS.map((c) => (
              <li key={c} className="rounded-full border-2 border-choc px-4 py-2 text-[15px] font-semibold text-choc">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ───────────── Что уже работает у нас ───────────── */
const PRODUCTS = [
  {
    t: 'Расшифровка звонков для Битрикс24',
    url: 'https://app.smittmediagroup.ru',
    host: 'app.smittmediagroup.ru',
    d: 'Расшифровка с ролями и речевая аналитика приходят комментарием в сделку: оценка, итог, договорённости со сроками, возражения, чек-лист скрипта.',
    f: '60 минут в месяц бесплатно, дальше 3 ₽/мин',
  },
  {
    t: 'ИИ-юрист',
    url: 'https://ai-meet.smittmediagroup.ru/ii-yurist',
    host: 'ai-meet.smittmediagroup.ru',
    d: 'Отвечает по официальным текстам законов с pravo.gov.ru — 24 кодекса, корпус обновляется каждый день. Выдуманные статьи блокируются: вместо них — выдержки со ссылкой.',
    f: 'Своя модель, без зарубежных облаков. Не юридическая консультация',
  },
  {
    t: 'GEO-Радар',
    url: 'https://geo.smittmediagroup.ru',
    host: 'geo.smittmediagroup.ru',
    d: 'Проверяет, называют ли нейросети ваш бренд: индекс видимости, доля голоса против конкурентов, что ИИ считает о вас правдой, а что выдумал.',
    f: 'Первая проверка бесплатно',
  },
  {
    t: 'Охотник заказов',
    url: '',
    host: 'внутренний инструмент',
    d: 'Наш собственный процесс продаж: каждый день собирает заказы с 7 бирж, отсеивает негодные и пишет черновики откликов. Человек выбирает и отправляет.',
    f: 'Пример того, как мы автоматизировали себя',
  },
]
export function Proof() {
  return (
    <section className="bg-krem px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1320px]">
        <Kicker className="text-rust">Доказательства, а не обещания</Kicker>
        <h2 className="display mt-4 max-w-[1000px] text-[clamp(2rem,6vw,4.6rem)] font-[750] text-choc">
          Что у нас уже работает — можно открыть и потрогать
        </h2>
        <p className="mt-5 max-w-[640px] text-[17px] leading-[1.55] text-choc">
          Клиентских логотипов здесь нет — мы не показываем чужие проекты без разрешения. Зато есть
          собственные ИИ-сервисы, которые работают на нашем сервере в России каждый день.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PRODUCTS.map((p, i) => (
            <article
              key={p.t}
              className={`flex flex-col rounded-[22px] p-6 sm:p-8 ${i === 0 ? 'bg-pole' : i === 3 ? 'bg-peach' : 'bg-krem2'}`}
            >
              <div className="mono flex items-center gap-2 text-[12px] font-semibold text-choc">
                <span className="h-2.5 w-2.5 rounded-full bg-choc" />
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener" className="focus-ring underline underline-offset-2">
                    {p.host}
                  </a>
                ) : (
                  <span>{p.host}</span>
                )}
              </div>
              <h3 className="display mt-4 text-[28px] font-[750] text-choc sm:text-[34px]">{p.t}</h3>
              <p className="mt-3 text-[16px] leading-[1.55] text-choc sm:text-[17px]">{p.d}</p>
              <p className="mono mt-auto pt-6 text-[13px] font-semibold text-choc">→ {p.f}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────── Цены ───────────── */
const PRICES = [
  {
    t: 'Пилот',
    sub: 'один процесс · 2–4 недели',
    p: 'от 90 000 ₽',
    items: ['аудит выбранного процесса', 'пилот на ваших данных', 'замер «до» и «после»', 'решение: масштабировать или нет'],
  },
  {
    t: 'Внедрение под ключ',
    sub: 'с интеграцией в CRM',
    p: 'от 250 000 ₽',
    items: ['всё из пилота', 'интеграция с CRM, почтой, документами', 'регламент «кто проверяет ИИ»', 'обучение сотрудников'],
    hot: true,
  },
  {
    t: 'Программа',
    sub: 'по всем процессам компании',
    p: 'от 600 000 ₽',
    items: ['аудит всех отделов', 'дорожная карта по очереди окупаемости', 'поэтапное внедрение', 'сопровождение по договорённости'],
  },
]
export function Prices() {
  return (
    <section id="ceny" className="bg-krem px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-[1320px]">
        <Kicker className="text-rust">Стоимость внедрения ИИ</Kicker>
        <h2 className="display mt-4 max-w-[1000px] text-[clamp(2rem,6vw,4.6rem)] font-[750] text-choc">
          Начинаем с пилота — платите за всё, когда видите результат
        </h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PRICES.map((c) => (
            <div
              key={c.t}
              className={`flex flex-col rounded-[22px] p-6 sm:p-8 ${c.hot ? 'bg-pole' : 'border-2 border-choc bg-krem'}`}
            >
              <p className="mono text-[12px] font-semibold uppercase tracking-[0.1em] text-choc">{c.sub}</p>
              <h3 className="display mt-3 text-[30px] font-[750] text-choc">{c.t}</h3>
              <p className={`display mt-5 text-[clamp(2.4rem,5vw,3.4rem)] font-[850] leading-none text-choc`}>
                {c.p}
              </p>
              <ul className="mt-6 space-y-2.5">
                {c.items.map((it) => (
                  <li key={it} className="flex gap-3 text-[16px] leading-snug text-choc">
                    <span aria-hidden className="mt-[7px] h-2 w-2 shrink-0 rounded-sm bg-choc" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-5 rounded-[22px] bg-krem2 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-[720px] text-[17px] leading-[1.55] text-choc">
            Точную смету называем после бесплатного разбора — 30 минут. Цена зависит от числа процессов,
            интеграций и объёма данных. Если на разборе видно, что ИИ в вашем процессе не окупится, мы
            так и скажем.
          </p>
          <CtaButton className="shrink-0">Записаться на разбор</CtaButton>
        </div>
      </div>
    </section>
  )
}

/* ───────────── Что получите ───────────── */
const OUT = [
  ['Карта процессов', 'Каждый шаг отмечен: делает ИИ, делает человек, где проверка.'],
  ['Расчёт', 'Какие шаги стоит автоматизировать первыми, сколько это стоит и что даёт.'],
  ['Работающий пилот', 'На ваших данных, в ваших системах, а не в демо-кабинете.'],
  ['Замер «до» и «после»', 'По вашим показателям: скорость ответа, доля обработанных заявок, время на рутину.'],
  ['Инструкции и обученная команда', 'Регламент работы с ИИ и сотрудники, которые им пользуются.'],
]
const TERMS = [
  ['Говорим «не надо», если не надо', 'Если ИИ в процессе не окупится, вы узнаете это на разборе, а не после оплаты.'],
  ['Данные — в России', 'Серверы в России, обработка по 152-ФЗ. Где нужно — свои модели без зарубежных облаков.'],
  ['ИИ проверяет человек', 'В каждый процесс встраиваем точку проверки: ИИ ошибается, и это нормально, если ошибку ловят.'],
]
export function Results() {
  return (
    <section className="bg-peach px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <Kicker className="text-rust">Что будет у вас на руках</Kicker>
          <h2 className="display mt-4 text-[clamp(2rem,6vw,4.4rem)] font-[750] text-choc">
            Результат, который можно проверить
          </h2>
          <ol className="mt-10 space-y-3">
            {OUT.map(([t, d], i) => (
              <li key={t} className="flex gap-4 rounded-[18px] bg-krem p-5 sm:gap-6 sm:p-6">
                <span className="display text-[34px] font-[850] leading-none text-rust">{i + 1}</span>
                <div>
                  <h3 className="text-[18px] font-bold text-choc sm:text-[19px]">{t}</h3>
                  <p className="mt-1 text-[16px] leading-[1.5] text-choc">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:pt-24">
          <div className="rounded-[22px] bg-rust p-6 text-krem sm:p-8">
            <p className="mono text-[12px] font-semibold uppercase tracking-[0.12em]">Честные условия</p>
            <ul className="mt-6 space-y-7">
              {TERMS.map(([t, d]) => (
                <li key={t}>
                  <h3 className="display text-[24px] font-[750] sm:text-[26px]">{t}</h3>
                  <p className="mt-2 text-[16px] leading-[1.55]">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ───────────── FAQ ───────────── */
const FAQ = [
  ['С чего начать внедрение ИИ в компании?', 'С одного процесса, где много повторяющейся ручной работы и уже есть данные: заявки, звонки, типовые письма, договоры. Его разбираем бесплатно за 30 минут и говорим, есть ли смысл в пилоте.'],
  ['Сколько стоит внедрение искусственного интеллекта?', 'Пилот на одном процессе — от 90 000 ₽ и 2–4 недели. Внедрение под ключ с интеграцией в CRM — от 250 000 ₽. Программа по всем процессам — от 600 000 ₽. Точную смету считаем после разбора.'],
  ['Куда уходят данные клиентов? Это законно?', 'Работаем на серверах в России и по 152-ФЗ. Где данные чувствительные, запускаем модели на собственных серверах — так устроены наши расшифровка звонков и ИИ-юрист. Зарубежные модели — только на обезличенных данных и с вашего согласия.'],
  ['Нам нужен «свой ИИ» или хватит готовых моделей?', 'Обычно хватает готовых моделей. Основная работа — не в обучении нейросети, а в том, чтобы встроить её в процесс: откуда берутся данные, куда уходит результат и кто его проверяет.'],
  ['Что будет, если ИИ ошибётся?', 'В каждом процессе есть точка проверки человеком. Выводы ИИ опираются на источник — цитату из звонка, пункт договора, статью закона, — чтобы проверка занимала секунды.'],
  ['С какими системами вы работаете?', 'Битрикс24 (у нас своё приложение для звонков), почта, документы, сайты, Telegram. С другими CRM работаем через их API — возможность проверяем на разборе.'],
  ['А если сотрудники не станут этим пользоваться?', 'Поэтому ИИ встраивается в привычные системы, а не живёт в отдельном чате. Обучение сотрудников входит во внедрение под ключ.'],
]
export function Faq() {
  return (
    <section className="bg-krem px-4 py-20 sm:px-8 sm:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Kicker className="text-rust">Вопросы</Kicker>
          <h2 className="display mt-4 text-[clamp(2rem,6vw,4.4rem)] font-[750] text-choc">Что спрашивают перед внедрением</h2>
        </div>
        <div className="divide-y-2 divide-choc/15 border-y-2 border-choc/15">
          {FAQ.map(([q, a], i) => (
            <details key={q} className="group" open={i === 0}>
              <summary className="focus-ring flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[18px] font-bold text-choc sm:text-[20px] [&::-webkit-details-marker]:hidden">
                {q}
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pole text-[20px] leading-none transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[720px] pb-6 text-[16px] leading-[1.6] text-choc sm:text-[17px]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ───────────── Заявка ───────────── */
export function Cta() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [agree, setAgree] = useState(false)
  const ready = name.trim().length > 1 && contact.trim().length > 3 && agree
  const href = `mailto:${MAIL}?subject=${encodeURIComponent('Разбор процесса — внедрение ИИ')}&body=${encodeURIComponent(
    `Имя: ${name}\nТелефон или Telegram: ${contact}\nСогласие на обработку персональных данных: да`,
  )}`

  return (
    <section id="razbor" className="grain relative isolate overflow-hidden bg-pole px-4 py-20 sm:px-8 sm:py-32">
      <div
        aria-hidden
        className="absolute -right-[20vw] -top-[10vw] -z-10 h-[60vw] w-[60vw] rounded-[42%_58%_63%_37%/45%_38%_62%_55%] bg-pole2"
      />
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="inline-flex h-9 items-center gap-2 rounded-xl border-[3px] border-choc bg-krem px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rust" />
              <span className="mono text-[12px] font-bold text-choc">ваш процесс</span>
            </span>
            <Kicker className="text-choc">конечная станция · разбор 30 минут</Kicker>
          </div>
          <h2 className="display mt-4 text-[clamp(2.3rem,7.4vw,5.6rem)] font-[800] text-choc">
            Покажите один процесс — скажем, что в нём сделает ИИ
          </h2>
          <p className="mt-6 max-w-[560px] text-[17px] leading-[1.55] text-choc sm:text-[19px]">
            Созвон на 30 минут. Вы рассказываете, как сейчас идёт работа, мы отвечаем: что можно отдать
            ИИ, с чего начать и сколько примерно это будет стоить. Без презентаций и обязательств.
          </p>
        </div>
        <form
          className="rounded-[26px] bg-krem p-6 shadow-[0_30px_60px_-30px_oklch(0.4_0.12_40/0.6)] sm:p-8"
          onSubmit={(e) => {
            e.preventDefault()
            if (ready) window.location.href = href
          }}
        >
          <label className="block">
            <span className="text-[14px] font-semibold text-choc">Как вас зовут</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              className="mt-2 block h-14 w-full rounded-xl border-2 border-choc/30 bg-white px-4 text-[17px] text-choc outline-none focus:border-choc"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[14px] font-semibold text-choc">Телефон или Telegram</span>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              autoComplete="tel"
              className="mt-2 block h-14 w-full rounded-xl border-2 border-choc/30 bg-white px-4 text-[17px] text-choc outline-none focus:border-choc"
            />
          </label>
          <label className="mt-5 flex cursor-pointer gap-3 text-[14px] leading-[1.5] text-choc">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[oklch(0.5_0.165_37)]"
            />
            <span>
              Даю отдельное согласие на обработку персональных данных (имя и контакт) для ответа на заявку
              по{' '}
              <a
                href="https://smittmediagroup.ru/privacy"
                target="_blank"
                rel="noopener"
                className="focus-ring font-semibold underline underline-offset-2"
              >
                политике обработки персональных данных
              </a>
              .
            </span>
          </label>
          <button
            type="submit"
            disabled={!ready}
            className="focus-ring mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-choc text-[17px] font-semibold text-krem transition-[background-color,opacity] hover:bg-choc2 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Записаться на разбор →
          </button>
          <p className="mt-4 text-center text-[14px] text-choc">
            Кнопка откроет письмо на {MAIL}. Быстрее — в Telegram:{' '}
            <a href={TG} target="_blank" rel="noopener" className="focus-ring font-semibold underline underline-offset-2">
              @SmittMG
            </a>
          </p>
        </form>
      </div>
    </section>
  )
}

/* ───────────── Подвал ───────────── */
export function Footer() {
  return (
    <footer className="bg-rust px-4 py-12 text-krem sm:px-8">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="display text-[26px] font-[800]">SmittMediaGroup</p>
          <p className="mt-2 max-w-[520px] text-[14px] leading-[1.6]">
            Внедрение ИИ в бизнес: аудит процессов, пилот, интеграция, обучение. ИИ ошибается —
            результаты проверяет человек.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-[14px] lg:items-end">
          <a href={TG} target="_blank" rel="noopener" className="focus-ring underline underline-offset-2">Telegram @SmittMG</a>
          <a href={`mailto:${MAIL}`} className="focus-ring underline underline-offset-2">{MAIL}</a>
          <a href="https://smittmediagroup.ru/privacy" target="_blank" rel="noopener" className="focus-ring underline underline-offset-2">
            Политика обработки персональных данных
          </a>
          <span className="mono text-[12px]">ИП · ИНН 381259266658 · ОГРНИП 324385000072413</span>
        </div>
      </div>
    </footer>
  )
}
