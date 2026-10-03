const ETAPY = [
  {
    n: '01',
    kogda: 'Неделя 1',
    t: 'Роль и границы',
    d: 'Договариваемся, что ИИ-⁠сотрудник делает и чего не делает никогда. Собираем базу знаний: прайс, регламенты, частые вопросы, примеры хороших ответов из вашей переписки.',
  },
  {
    n: '02',
    kogda: 'Неделя 2',
    t: 'Сборка и тесты вхолостую',
    d: 'Подключаем к CRM и каналам, прогоняем на прошлых диалогах. Вы читаете ответы и правите формулировки — клиенты об этом ещё не знают.',
  },
  {
    n: '03',
    kogda: 'Неделя 3',
    t: 'Работа под присмотром',
    d: 'Выходит к живым клиентам, но ответы проходят через сотрудника. Ловим последние странности, команда привыкает к новому коллеге.',
  },
  {
    n: '04',
    kogda: 'Дальше',
    t: 'Сам — там, где проверено',
    d: 'Снимаем ручной контроль с тех типов обращений, где он ничего не меняет. Сложное по-прежнему уходит человеку — это правило.',
  },
]

export function Etapy() {
  return (
    <section data-status="на испытательном сроке" className="bg-bumaga px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="kapsy text-glub">Как выходит на смену</p>
        <h2 className="head mt-3 max-w-[18ch] text-[clamp(2.6rem,6.4vw,5.6rem)]">
          Испытательный срок — как у человека
        </h2>
        <p className="mt-5 max-w-[56ch] text-[1.08rem] text-seryy">
          Типовой порядок для одной роли. «Старт» в одном канале запускается от 7 дней, роль с CRM и
          несколькими каналами — за 3–4 недели.
        </p>
        <ol className="mt-12 grid gap-0 border-t-2 border-chern md:grid-cols-4">
          {ETAPY.map((e, i) => (
            <li key={e.n} className={`border-b-2 border-chern py-7 md:border-b-0 md:py-8 md:pr-6 ${i ? 'md:border-l-2 md:pl-6' : ''}`}>
              <div className="flex items-baseline justify-between">
                <span className="head text-[4.6rem] leading-none text-pole [-webkit-text-stroke:2px_oklch(0.22_0.05_148)] md:text-[5.6rem]">
                  {e.n}
                </span>
                <span className="mono text-sm font-bold">{e.kogda}</span>
              </div>
              <h3 className="head mt-4 text-[2rem]">{e.t}</h3>
              <p className="mt-3 leading-snug">{e.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
