import { useState } from 'react'
import { motion } from 'framer-motion'
import { rub } from '../lib/hooks'

const RATE = 7000

/* ------------------------------------------------------------------ форматы */

const FORMATS = [
  {
    name: 'Воркшоп «Старт с ИИ»',
    hours: 6,
    when: '6 часов · один день',
    price: '42 000 ₽',
    text: 'Три–пять настоящих задач компании прямо на занятии. Каркас запроса, правила по данным и список: кто какую задачу переводит на ИИ в ближайшие две недели.',
    for: 'Чтобы понять, стоит ли вообще, — и снять страх.',
  },
  {
    name: 'Курс для отдела',
    hours: 16,
    when: '16 часов · 3–5 недель',
    price: '112 000 ₽',
    text: 'Программа под задачи одного отдела, домашние задания на рабочих процессах, библиотека промптов отдела, сертификаты участникам.',
    for: 'Чтобы ИИ стал привычкой, а не впечатлением.',
    main: true,
  },
  {
    name: 'Программа для компании',
    hours: 32,
    when: 'от 32 часов · 6–8 недель',
    price: 'от 224 000 ₽',
    text: 'Несколько отделов потоками, отдельный трек для руководителей, регламент работы с данными, отчёт руководству и план внедрения.',
    for: 'Чтобы перевести на ИИ процессы, а не отдельных людей.',
  },
]

const DEPTS = [
  {
    id: 'prodazhi',
    name: 'Продажи',
    q: 'ИИ в продажах',
    weeks: [
      'Письмо, КП, ответ на возражение за пять минут — в тоне компании и без выдуманных цифр.',
      'Разбор звонков: расшифровка, чек-лист сильных и слабых мест, сводка руководителю.',
      'Подготовка к встрече: досье на компанию клиента, вопросы под его задачи, план разговора.',
    ],
  },
  {
    id: 'marketing',
    name: 'Маркетинг',
    q: 'Нейросети для маркетолога',
    weeks: [
      'Тексты и контент-план: тон бренда, проверка фактов, серия постов из одного материала.',
      'Картинки и креативы под формат площадки, единый стиль, что нельзя публиковать (права, лица).',
      'Сводка по кампаниям из выгрузок Директа и VK за десять минут, гипотезы на неделю.',
    ],
  },
  {
    id: 'hr',
    name: 'HR и подбор',
    q: 'ИИ в HR',
    weeks: [
      'Вакансия под площадку, критерии отбора, письма кандидатам.',
      'Гайд для собеседования под роль, разбор ответов, сводка для руководителя.',
      'Курс адаптации новичка из ваших регламентов. Резюме — только обезличенные.',
    ],
  },
  {
    id: 'buh',
    name: 'Бухгалтерия',
    q: 'ИИ для бухгалтерии',
    weeks: [
      'Ответ на требование, пояснительная, письмо контрагенту — с проверкой на выдуманные нормы.',
      'Разбор договора на риски, сверка условий, выжимка из сорока страниц.',
      'Формулы и макросы по описанию, проверка расчёта. Локальные и российские модели для закрытого контура.',
    ],
  },
  {
    id: 'yurist',
    name: 'Юристы',
    q: 'ИИ для юристов',
    weeks: [
      'Договор: риски по чек-листу компании, сравнение редакций, протокол разногласий.',
      'Претензия, ответ, ходатайство по вашему шаблону и в едином стиле.',
      'Практика: как ставить вопрос и как проверять каждую ссылку. Конфиденциальность.',
    ],
  },
  {
    id: 'ruk',
    name: 'Руководители',
    q: 'ИИ для руководителей',
    weeks: [
      'Где ИИ даёт деньги именно в вашем бизнесе, а где — только шум.',
      'Как считать эффект: какие задачи замерить до и после, кто отвечает.',
      'Как запускать внедрение и не утопить данные: регламент, роли, первые 90 дней.',
    ],
  },
]

export function Program() {
  const [tab, setTab] = useState(0)
  const d = DEPTS[tab]
  return (
    <section id="programma" className="relative bg-krem px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="eyebrow mb-6 text-ink-2">Что входит</p>
        <h2 className="h2 max-w-[18ch]">Три формата — одна ставка</h2>
        <p className="mt-6 max-w-[40rem] text-[1.1rem] text-ink-2">
          Форматы отличаются только числом часов и глубиной. Задачи внутри — всегда ваши: за неделю до
          старта собираем их у участников.
        </p>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {FORMATS.map((f) => (
            <article
              key={f.name}
              className={`relative flex flex-col rounded-[28px] border-2 border-ink p-6 md:p-8 ${f.main ? 'bg-pole' : 'bg-white/70'}`}
            >
              {f.main ? (
                <span className="absolute -top-3.5 left-6 rounded-full bg-ink px-3 py-1 text-[0.75rem] font-bold uppercase tracking-wider text-pole">
                  чаще всего берут
                </span>
              ) : null}
              <p className="text-[0.9rem] font-semibold text-ink-2">{f.when}</p>
              <h3 className="mt-2 font-display text-[1.6rem] font-extrabold leading-[1.1] tracking-[-0.02em]">{f.name}</h3>
              <p className="display num mt-5 text-[2.6rem]">{f.price}</p>
              <p className="mt-1 text-[0.85rem] text-ink-2">{f.hours} ч × 7 000 ₽, группа до 15 человек</p>
              <p className="mt-5 text-[1rem]">{f.text}</p>
              <p className="mt-auto pt-5 text-[0.95rem] font-semibold">{f.for}</p>
            </article>
          ))}
        </div>

        {/* Программа по отделам */}
        <div className="mt-24 md:mt-32">
          <h3 className="font-display text-[1.9rem] font-extrabold leading-[1.05] tracking-[-0.02em] md:text-[2.8rem]">
            Программа собирается под отдел
          </h3>
          <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Отделы">
            {DEPTS.map((x, i) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={i === tab}
                onClick={() => setTab(i)}
                className={`min-h-11 rounded-full border-2 border-ink px-4 text-[0.98rem] font-semibold transition-colors duration-150 ${
                  i === tab ? 'bg-ink text-pole' : 'bg-transparent hover:bg-pole-2'
                }`}
              >
                {x.name}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3" role="tabpanel">
            {d.weeks.map((w, i) => (
              <div key={d.id + i} className="rounded-[22px] bg-pole-2 p-6">
                <p className="eyebrow text-ink-2">Неделя {i + 1}</p>
                <p className="mt-3 text-[1.05rem] leading-[1.45]">{w}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[0.95rem] text-ink-2">
            {d.q}: пример того, как курс для отдела раскладывается по неделям. Точную программу и число
            часов присылаем после разговора, за один рабочий день.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ этапы */

const STEPS = [
  { h: 'За неделю', t: 'Собираем три–пять настоящих задач', d: 'Письмо, которое долго писать; отчёт, который собирают руками; документ, который перечитывают. Часть отсеиваем сразу и говорим почему.' },
  { h: 'Час 1–2', t: 'Каркас запроса на первой задаче', d: 'Пять деталей, после которых нейросеть перестаёт выдавать воду. Сразу на вашем материале.' },
  { h: 'Час 3–4', t: 'Каждый доводит свою задачу', d: 'До результата, который не стыдно отправить клиенту или руководителю. Ведущий правит запросы вживую.' },
  { h: 'Час 5', t: 'Красная линия по данным', d: 'Что нельзя загружать в зарубежные сервисы и какие российские модели ставить вместо них. 152-ФЗ без юридического тумана.' },
  { h: 'Час 6', t: 'Кто что переводит на ИИ', d: 'Список задач с именами на ближайшие две недели. Он остаётся у руководителя.' },
  { h: 'Через 2 недели', t: 'Созвон на 30 минут', d: 'Что получилось, что застряло. Входит в стоимость — иначе обучение остаётся впечатлением.' },
]

export function Steps() {
  return (
    <section id="etapy" className="relative bg-krem px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="eyebrow mb-6 text-ink-2">Как проходит воркшоп</p>
        <h2 className="h2 max-w-[18ch]">Шесть часов, после которых есть что проверить</h2>
        {/* линейка: деления как у школьной линейки — ритм этапов */}
        <div className="relative mt-16 md:mt-20">
          <div className="absolute left-0 right-0 top-0 hidden h-6 border-b-2 border-ink md:block" aria-hidden="true"
            style={{ background: 'repeating-linear-gradient(90deg, #17140a 0 2px, transparent 2px 22px)', backgroundSize: '100% 12px', backgroundRepeat: 'repeat-x', backgroundPosition: 'bottom' }} />
          <ol className="grid gap-10 md:grid-cols-6 md:gap-6 md:pt-12">
            {STEPS.map((s, i) => (
              <li key={s.h} className="relative border-l-2 border-ink pl-5 md:border-l-0 md:pl-0">
                <span className="hidden md:absolute md:-top-[54px] md:left-0 md:block md:h-8 md:w-[3px] md:bg-ink" aria-hidden="true" />
                <p className="display num text-[2.6rem] leading-none text-pole-4 md:text-[3rem]">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-3 text-[0.8rem] font-bold uppercase tracking-[0.1em]">{s.h}</p>
                <h3 className="mt-2 font-display text-[1.2rem] font-bold leading-[1.15]">{s.t}</h3>
                <p className="mt-2 text-[0.95rem] leading-[1.5] text-ink-2">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ цена */

export function Price() {
  const [hours, setHours] = useState(16)
  const [people, setPeople] = useState(15)
  const sum = hours * RATE
  const per = Math.round(sum / people)
  return (
    <section id="cena" className="grain relative bg-pole-3 px-4 py-24 md:px-10 md:py-32">
      <div className="relative mx-auto grid max-w-[1320px] gap-12 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-16">
        <div>
          <p className="eyebrow mb-6 text-ink">Сколько стоит корпоративное обучение ИИ</p>
          <p className="display num relative inline-block text-[21vw] leading-[0.85] md:text-[10vw] xl:text-[9.6rem]">
            7 000 ₽
            {/* маркер обводит ставку — один раз, когда цена вошла в кадр */}
            <svg viewBox="0 0 400 160" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-[9%] -inset-y-[22%] h-[144%] w-[118%]" aria-hidden="true">
              <motion.path
                d="M30 92 C 20 30, 250 6, 360 40 C 410 58, 392 128, 260 146 C 140 160, 24 140, 34 84 C 40 52, 120 30, 190 26"
                fill="none" stroke="#fff7da" strokeWidth="9" strokeLinecap="round"
                initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
          </p>
          <p className="mt-4 font-display text-[1.5rem] font-bold leading-[1.15] md:text-[2rem]">
            за час занятий для группы до 15 человек
          </p>
          <p className="mt-6 max-w-[34rem] text-[1.06rem]">
            Считаем за час, а не за человека: 7 000 ₽ и для одного сотрудника, и для пятнадцати. Цена
            любой программы складывается в открытую — число часов × 7 000 ₽. Выше ставка выходит
            только за очный выезд из Иркутска и за группы больше 15 человек — их делим на потоки.
          </p>
        </div>

        {/* калькулятор: считает только по ставке, ничего не прибавляет */}
        <div className="rounded-[30px] border-2 border-ink bg-krem p-6 md:p-9">
          <p className="font-display text-[1.35rem] font-extrabold">Посчитайте свою группу</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ['Воркшоп', 6],
              ['Курс отдела', 16],
              ['Программа', 32],
            ].map(([n, h]) => (
              <button
                key={n}
                onClick={() => setHours(h as number)}
                className={`min-h-11 rounded-full border-2 border-ink px-4 text-[0.95rem] font-semibold transition-colors duration-150 ${
                  hours === h ? 'bg-ink text-pole' : 'hover:bg-pole-2'
                }`}
              >
                {n} · {h} ч
              </button>
            ))}
          </div>

          <label className="mt-7 block">
            <span className="flex justify-between text-[0.98rem] font-semibold">
              <span>Часов занятий</span>
              <span className="num">{hours}</span>
            </span>
            <input type="range" min={2} max={40} value={hours} onChange={(e) => setHours(+e.target.value)} className="mt-3 h-11 w-full" />
          </label>
          <label className="mt-3 block">
            <span className="flex justify-between text-[0.98rem] font-semibold">
              <span>Человек в группе</span>
              <span className="num">{people}</span>
            </span>
            <input type="range" min={1} max={15} value={people} onChange={(e) => setPeople(+e.target.value)} className="mt-3 h-11 w-full" />
          </label>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-ink pt-6">
            <div>
              <p className="text-[0.85rem] font-semibold text-ink-2">Всего</p>
              <p className="display num mt-1 text-[2rem] md:text-[2.4rem]">{rub(sum)}</p>
            </div>
            <div>
              <p className="text-[0.85rem] font-semibold text-ink-2">На одного сотрудника</p>
              <p className="display num mt-1 text-[2rem] md:text-[2.4rem]">{rub(per)}</p>
            </div>
          </div>
          <a
            href="#zayavka"
            className="mt-7 flex min-h-13 items-center justify-center rounded-full bg-ink px-6 text-[1.02rem] font-semibold text-pole transition-transform duration-150 hover:-translate-y-0.5"
          >
            Получить программу на {hours} ч
          </a>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ что получите */

const KEEP = [
  { t: 'Библиотека промптов отдела', d: 'Не «100 промптов для бизнеса» из интернета, а те, что собрали на занятии из ваших формулировок.' },
  { t: 'Правила по данным на одну страницу', d: 'Что можно отдавать модели, что обезличивать, что не выносить из компании, какие сервисы ставить.' },
  { t: 'Список первых задач с именами', d: 'Кто и что переводит на ИИ в ближайшие две недели. Без этого листа обучение забывается за месяц.' },
  { t: 'Созвон через две недели', d: 'Смотрим факт: что получилось, что застряло. Входит в стоимость.' },
  { t: 'Сертификат участника', d: 'От агентства. Удостоверения о повышении квалификации нет: мы не организация ДПО и не делаем вид.' },
]

const NOT = [
  'что ИИ заменит сотрудников — он забирает черновую работу, решение остаётся за человеком',
  'результат без практики — каждое занятие строится на задачах участников',
  'что нейросеть не ошибается — учим проверять каждую цифру и ссылку',
]

export function Keep() {
  return (
    <section id="itog" className="grain relative bg-pole px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="eyebrow mb-6 text-ink-2">Что получите</p>
        <h2 className="h2 max-w-[18ch]">Что остаётся у команды после обучения</h2>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {KEEP.map((k, i) => (
            <div
              key={k.t}
              className={`rounded-[24px] border-2 border-ink p-6 md:p-7 ${i === 0 ? 'bg-pole-3 lg:row-span-2 lg:flex lg:flex-col lg:justify-end' : 'bg-krem'}`}
            >
              <p className="display num text-[2.2rem] leading-none text-ink">{String(i + 1).padStart(2, '0')}</p>
              <h3 className={`mt-4 font-display font-extrabold leading-[1.1] tracking-[-0.02em] ${i === 0 ? 'text-[1.9rem] md:text-[2.4rem]' : 'text-[1.35rem]'}`}>
                {k.t}
              </h3>
              <p className="mt-3 text-[1rem] text-ink-2">{k.d}</p>
            </div>
          ))}
          <div className="rounded-[24px] border-2 border-dashed border-ink bg-pole-2 p-6 md:p-7">
            <p className="eyebrow text-ink-2">Чего не обещаем</p>
            <ul className="mt-4 space-y-3 text-[1rem]">
              {NOT.map((n) => (
                <li key={n} className="flex gap-3">
                  <span className="mt-[0.55em] h-[3px] w-4 shrink-0 bg-ink" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ кто учит */

export function Who() {
  return (
    <section id="kto" className="grain relative bg-pole-2 px-4 py-24 md:px-10 md:py-32">
      <div className="relative mx-auto grid max-w-[1320px] gap-12 md:grid-cols-[1fr_1fr] md:gap-20">
        <div>
          <p className="eyebrow mb-6 text-ink-2">Кто учит</p>
          <h2 className="h2 max-w-[14ch]">Учим тому, что сами используем</h2>
          <p className="mt-6 max-w-[34rem] text-[1.08rem]">
            SmittMediaGroup — агентство из Иркутска, с 2004 года в вебе и рекламе. Нейросети сначала
            внедряем у себя и у клиентов, потом учим этому сотрудников компаний. Поэтому программа
            собирается из работающих приёмов, а не из пересказа чужих курсов.
          </p>
        </div>
        <ul className="grid content-start gap-4">
          <li className="rounded-[22px] border-2 border-ink bg-krem p-6">
            <p className="font-display text-[1.3rem] font-extrabold">Живые демо — без заявки</p>
            <p className="mt-2 text-ink-2">
              Работающие ИИ-решения агентства можно открыть и потрогать руками до разговора с нами.
            </p>
            <a className="mt-3 inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4" href="https://demo.smittmediagroup.ru/" rel="noopener">
              demo.smittmediagroup.ru →
            </a>
          </li>
          <li className="rounded-[22px] border-2 border-ink bg-krem p-6">
            <p className="font-display text-[1.3rem] font-extrabold">Свои ИИ-продукты</p>
            <p className="mt-2 text-ink-2">
              Расшифровка и разбор звонков в Битрикс24, ИИ-ассистент юриста, квалификатор заявок —
              то, на чём построены примеры для продаж, юристов и руководителей.
            </p>
            <a className="mt-3 inline-flex min-h-11 items-center font-semibold underline decoration-2 underline-offset-4" href="https://demo.smittmediagroup.ru/urist/" rel="noopener">
              Попробовать ИИ-ассистента юриста →
            </a>
          </li>
          <li className="rounded-[22px] border-2 border-ink bg-krem p-6">
            <p className="font-display text-[1.3rem] font-extrabold">Онлайн по всей России</p>
            <p className="mt-2 text-ink-2">
              Работа идёт в экранах участников, поэтому формат от расстояния не страдает. В Иркутске —
              очно, у вас в офисе. Часовой пояс подстраиваем под команду.
            </p>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ FAQ */

const FAQ = [
  ['Сколько стоит корпоративное обучение ИИ?', 'Ставка — 7 000 ₽ за час занятий для группы до 15 человек: столько же за одного сотрудника и за пятнадцать. Воркшоп на 6 часов — 42 000 ₽, курс для отдела на 16 часов — 112 000 ₽, программа для компании на 32 часа — 224 000 ₽. Программа и смета — бесплатно, за один рабочий день.'],
  ['Чем воркшоп отличается от курса?', 'Воркшоп — один день и один результат: рабочие промпты и понятые границы по данным. Курс на 3–5 недель делает из этого привычку: домашние задания на рабочих процессах и библиотека промптов отдела.'],
  ['Сколько человек можно привести?', 'До 15 на одного ведущего: больше — и разбор задач превращается в лекцию. Если людей больше, делим на потоки.'],
  ['Каким нейросетям учите?', 'ChatGPT, Claude, YandexGPT, GigaChat — выбираем под ваш контур. Где важны данные, показываем российские и локальные модели, которые не передают информацию за рубеж.'],
  ['Можно ли загружать в нейросеть данные клиентов?', 'Персональные данные — нет. На занятии учим обезличивать документы и разбираем, какие сервисы допустимы для рабочих данных. Итог — правила на одну страницу для всей команды.'],
  ['Нужно ли заранее готовить задачи?', 'Да, это главная подготовка. За неделю собираем у участников три–пять настоящих задач: письмо, которое долго писать, отчёт, который собирают руками, документ, который перечитывают.'],
  ['Онлайн или очно?', 'По России — онлайн, в Иркутске — очно у вас в офисе. Работа всё равно идёт в экранах участников, поэтому формат от расстояния не страдает.'],
  ['Выдаёте документ об обучении?', 'Сертификат участника от агентства — да. Удостоверение о повышении квалификации — нет: мы не организация ДПО и не делаем вид, что ею являемся.'],
  ['А если после обучения никто не станет пользоваться?', 'Так бывает чаще, чем признаются продавцы обучения. Поэтому занятие заканчивается списком «кто что переводит на ИИ», а через две недели мы созваниваемся и смотрим факт. Это входит в стоимость.'],
]

export function Faq() {
  return (
    <section id="voprosy" className="relative bg-krem px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1320px] gap-10 md:grid-cols-[0.8fr_1.4fr] md:gap-16">
        <div>
          <p className="eyebrow mb-6 text-ink-2">Вопросы</p>
          <h2 className="h2 max-w-[12ch]">Что спрашивают перед обучением</h2>
        </div>
        <div className="border-t-2 border-ink">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b-2 border-ink">
              <summary className="flex min-h-16 items-center justify-between gap-6 py-5">
                <span className="font-display text-[1.15rem] font-bold leading-[1.25] md:text-[1.3rem]">{q}</span>
                <span className="relative h-9 w-9 shrink-0 rounded-full border-2 border-ink transition-colors duration-150 group-open:bg-ink" aria-hidden="true">
                  <span className="absolute left-1/2 top-1/2 h-[2px] w-3.5 -translate-x-1/2 -translate-y-1/2 bg-ink group-open:bg-pole" />
                  <span className="absolute left-1/2 top-1/2 h-3.5 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-ink group-open:hidden" />
                </span>
              </summary>
              <p className="max-w-[46rem] pb-6 text-[1.02rem] leading-[1.6] text-ink-2">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ заявка */

export function Cta() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [team, setTeam] = useState('')
  const [agree, setAgree] = useState(false)
  const [sent, setSent] = useState('')
  const ok = agree && name.trim().length > 1 && contact.trim().length > 4

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ok) return
    const text = `Заявка на корпоративное обучение ИИ\nИмя: ${name}\nКонтакт: ${contact}\nКоманда: ${team || '—'}`
    try {
      await navigator.clipboard.writeText(text)
      setSent('Текст заявки скопирован — вставьте его в чат Telegram, который сейчас откроется.')
    } catch {
      setSent('Откроется Telegram @SmittMG — напишите туда имя, контакт и состав команды.')
    }
    window.open('https://t.me/SmittMG', '_blank', 'noopener')
  }

  return (
    <section id="zayavka" className="grain relative bg-pole px-4 py-24 md:px-10 md:py-32">
      <div className="relative mx-auto grid max-w-[1320px] gap-12 md:grid-cols-[1fr_1fr] md:gap-20">
        <div>
          <p className="eyebrow mb-6 text-ink-2">Заявка</p>
          <h2 className="display text-[10.5vw] leading-[0.98] md:text-[5vw] xl:text-[4.9rem]">
            Пришлём программу и смету{' '}
            <span className="relative inline">
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-[-0.05em] bottom-[0.02em] top-[0.45em] -z-0 origin-left bg-krem"
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              />
              <span className="relative">за&nbsp;один рабочий день</span>
            </span>
          </h2>
          <p className="mt-6 max-w-[32rem] text-[1.08rem]">
            Напишите, сколько сотрудников и каких отделов хотите обучить. Перезвоним, уточним задачи за
            30 минут и пришлём программу с точным числом часов. Ни к чему не обязывает.
          </p>
        </div>

        <form onSubmit={send} className="rounded-[30px] border-2 border-ink bg-krem p-6 md:p-9" noValidate>
          <label className="block">
            <span className="text-[0.95rem] font-semibold">Как к вам обращаться</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80}
              className="mt-2 h-13 w-full rounded-2xl border-2 border-ink bg-white px-4 text-[1.05rem] outline-none focus:bg-pole-2" />
          </label>
          <label className="mt-5 block">
            <span className="text-[0.95rem] font-semibold">Телефон или Telegram</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="tel" maxLength={80} inputMode="text"
              className="mt-2 h-13 w-full rounded-2xl border-2 border-ink bg-white px-4 text-[1.05rem] outline-none focus:bg-pole-2" />
          </label>
          <label className="mt-5 block">
            <span className="text-[0.95rem] font-semibold">Сколько человек и какие отделы <span className="font-normal text-ink-2">(можно не заполнять)</span></span>
            <input value={team} onChange={(e) => setTeam(e.target.value)} maxLength={200}
              className="mt-2 h-13 w-full rounded-2xl border-2 border-ink bg-white px-4 text-[1.05rem] outline-none focus:bg-pole-2" />
          </label>
          <label className="mt-6 flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-ink" />
            <span className="text-[0.9rem] leading-[1.45]">
              Даю отдельное согласие на обработку персональных данных (имя и контакт) для ответа на
              заявку — по{' '}
              <a href="https://smittmediagroup.ru/privacy" target="_blank" rel="noopener" className="font-semibold underline underline-offset-2">
                политике обработки персональных данных
              </a>
              .
            </span>
          </label>
          <button
            type="submit"
            disabled={!ok}
            className="mt-7 flex min-h-14 w-full items-center justify-center rounded-full bg-ink px-6 text-[1.05rem] font-semibold text-pole transition-[transform,opacity] duration-150 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Отправить в Telegram
          </button>
          <p className="mt-3 min-h-6 text-[0.88rem] text-ink-2" role="status" aria-live="polite">
            {sent || (agree ? '' : 'Кнопка станет активной после согласия на обработку данных.')}
          </p>
          <p className="mt-2 text-[0.88rem] text-ink-2">
            Или напишите сами:{' '}
            <a href="https://t.me/SmittMG" className="font-semibold underline underline-offset-2" rel="noopener">@SmittMG</a> ·{' '}
            <a href="https://smittmediagroup.ru/#contact" className="font-semibold underline underline-offset-2" rel="noopener">форма на сайте</a>
          </p>
        </form>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-ink px-4 py-12 text-[0.9rem] text-krem md:px-10">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-[1.3rem] font-extrabold tracking-[0.04em] text-pole">SMITT · MEDIA · GROUP</p>
          <p className="mt-2 max-w-[36rem] text-krem/80">
            Корпоративное обучение ИИ и нейросетям для сотрудников компаний. Иркутск, Верхняя набережная, 169 ·
            онлайн по всей России.
          </p>
          <p className="mt-3 max-w-[36rem] text-krem/80">
            ИИ ошибается — результаты проверяет человек. Примеры документов на странице условные, персональных
            данных не содержат.
          </p>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <a href="https://smittmediagroup.ru/privacy" className="inline-flex min-h-11 items-center underline underline-offset-4" rel="noopener">
            Политика обработки персональных данных
          </a>
          <a href="https://smittmediagroup.ru/" className="inline-flex min-h-11 items-center underline underline-offset-4" rel="noopener">
            smittmediagroup.ru
          </a>
          <span className="text-krem/60">Превью страницы · 2026</span>
        </div>
      </div>
    </footer>
  )
}
