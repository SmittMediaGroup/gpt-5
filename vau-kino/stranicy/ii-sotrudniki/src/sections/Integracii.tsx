const SISTEMY = [
  ['Битрикс24', 'сделки, задачи, таймлайн'],
  ['amoCRM', 'заявка → сделка с полями'],
  ['1С', 'остатки, цены, статусы через обмен'],
  ['Telegram', 'чат и бот'],
  ['ВКонтакте', 'сообщения сообщества'],
  ['Авито', 'чаты объявлений'],
  ['Сайт', 'виджет и формы'],
  ['Почта', 'разбор входящих'],
  ['Телефония', 'записи разговоров'],
  ['Таблицы', 'реестры и отчёты'],
]

export function Integracii() {
  return (
    <section data-status="сидит в вашей CRM" className="bg-bumaga px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[5fr_7fr] md:gap-16">
        <div>
          <p className="kapsy text-glub">Рабочее место</p>
          <h2 className="head mt-3 text-[clamp(2.6rem,5.6vw,5rem)]">Сидит там же, где ваши люди</h2>
          <p className="mt-5 max-w-[44ch] text-[1.08rem]">
            ИИ-⁠сотрудник бесполезен, если живёт отдельно от рабочих систем. Он видит то же, что менеджер, и
            пишет туда же, куда пишет менеджер.
          </p>
          <div className="mt-8 rounded-2xl border-2 border-chern bg-myata p-5">
            <p className="head text-[1.7rem]">Права — ровно под роль</p>
            <p className="mt-2 leading-snug">
              Менеджеру по заявкам не нужен доступ к бухгалтерии. Каждое действие в CRM и каждый ответ
              клиенту — строкой в журнале: что сделал, когда и на основании чего.
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 self-start sm:grid-cols-2">
          {SISTEMY.map(([n, d]) => (
            <li key={n} className="flex min-h-[96px] flex-col justify-between rounded-2xl border-2 border-chern bg-bumaga p-4">
              <span className="head text-[1.7rem] md:text-[2rem]">{n}</span>
              <span className="text-[0.88rem] leading-snug text-seryy">{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
