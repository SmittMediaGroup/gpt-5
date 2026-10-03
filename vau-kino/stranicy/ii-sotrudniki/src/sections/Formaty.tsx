/**
 * Форматы и сроки — с боевой /neyrosotrudniki (опубликованы).
 * Цен «от …» нет: в источниках из ТЗ суммы для ИИ-⁠сотрудников нет
 * (см. РЕШЕНИЯ.md). Стоимость — после бесплатного разбора.
 */
const FORMATY = [
  {
    t: 'Старт',
    srok: 'от 7 дней',
    punkty: ['Одна роль, один канал: сайт или Telegram', 'База знаний из ваших материалов', 'Сложные случаи — человеку'],
  },
  {
    t: 'Бизнес',
    srok: '3–4 недели',
    glavnyy: true,
    punkty: [
      'Несколько каналов и CRM: Битрикс24, amoCRM',
      'Роль под ваш процесс: заявки, звонки, документы',
      'Месяц контроля качества и доучивания',
    ],
  },
  {
    t: 'Команда',
    srok: 'проект',
    punkty: ['Несколько связанных ИИ-⁠сотрудников', 'Своя модель на данных компании', 'Обучение вашей команды работе с ними'],
  },
]

export function Formaty() {
  return (
    <section data-status="смета — после разбора" id="formaty" className="bg-myata px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="kapsy text-glub">Форматы и стоимость</p>
        <h2 className="head mt-3 max-w-[16ch] text-[clamp(2.6rem,6.4vw,5.6rem)]">Сколько стоит ИИ-⁠сотрудник</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FORMATY.map((f) => (
            <div
              key={f.t}
              className={`flex flex-col rounded-[1.4rem] border-2 border-chern p-6 md:p-7 ${f.glavnyy ? 'bg-pole' : 'bg-bumaga'}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="head text-[2.6rem]">{f.t}</h3>
                <span className="mono text-sm font-bold">{f.srok}</span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {f.punkty.map((x) => (
                  <li key={x} className="flex gap-2.5 leading-snug">
                    <span className="mt-[0.45em] inline-block size-2 shrink-0 rounded-full bg-chern" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[1.4rem] border-2 border-chern bg-bumaga p-6 md:flex-row md:items-center md:p-8">
          <p className="max-w-[56ch] text-[1.12rem] leading-snug md:text-[1.25rem]">
            <b>Стоимость — после бесплатного разбора, 30 минут.</b> Считаем от вашего процесса: сколько
            каналов, какие системы, сколько материалов для базы знаний. Готового прайса «на всех» нет —
            ИИ-⁠сотрудник на Авито и юрист-консультант стоят по-разному.
          </p>
          <a
            href="#forma"
            className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-full bg-chern px-6 font-bold text-pole transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="tochka" aria-hidden /> Записаться на разбор
          </a>
        </div>
      </div>
    </section>
  )
}
