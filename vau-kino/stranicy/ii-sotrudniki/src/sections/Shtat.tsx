/**
 * «Штат»: роли ИИ-⁠сотрудников в виде пропусков. У каждой роли — что делает
 * и чего НЕ делает: граница роли продаёт честнее, чем список умений.
 */

type Rol = { n: string; title: string; dela: string; ne: string; fakt?: string; zapros?: string }

const ROLI: Rol[] = [
  {
    n: '01',
    title: 'Менеджер по заявкам 24/7',
    dela: 'Отвечает за секунды, уточняет задачу, заводит сделку, ставит встречу. Горячего клиента передаёт менеджеру.',
    ne: 'Не обещает скидок и сроков, которых нет в ваших правилах.',
  },
  {
    n: '02',
    title: 'Расшифровщик звонков',
    dela: 'Превращает записи разговоров в текст с репликами по ролям, кладёт резюме и следующий шаг в сделку.',
    ne: 'Не оценивает людей за вас — даёт руководителю материал.',
    fakt: 'Работает у нас: приложение для Битрикс24',
  },
  {
    n: '03',
    title: 'Юрист-консультант',
    dela: 'Ищет ответ в действующих редакциях законов и даёт ссылку на статью. Готовит справку юристу или клиенту.',
    ne: 'Не подписывает, не представляет в суде, не заменяет юриста.',
    fakt: 'Работает у нас: ИИ-⁠юрист на открытом API pravo.gov.ru',
  },
  {
    n: '04',
    title: 'Аналитик отзывов',
    dela: 'Разбирает отзывы, анкеты и переписку, которые вы ему даёте, по темам: доставка, качество, персонал. Раз в неделю — что болит чаще.',
    ne: 'Не пишет отзывы от имени клиентов. Никогда.',
  },
  {
    n: '05',
    title: 'ИИ-⁠секретарь',
    dela: 'Записывает на услугу, переносит, напоминает о визите, отвечает на «как проехать» и «до скольки работаете».',
    ne: 'Не принимает оплату и не отменяет запись без правила.',
  },
  {
    n: '06',
    title: 'Документовед',
    dela: 'Разбирает входящие письма и документы, вытаскивает реквизиты и суммы в таблицу или CRM, готовит типовой ответ.',
    ne: 'Не отправляет договор клиенту без проверки человеком.',
  },
  {
    n: '07',
    title: 'ИИ-⁠рекрутер',
    dela: 'Первично разбирает отклики по вашим критериям, задаёт кандидатам уточняющие вопросы, собирает короткий список.',
    ne: 'Не отказывает кандидатам сам — решение за HR.',
  },
  {
    n: '08',
    title: 'Ваша роль',
    dela: 'Если работа повторяется и описывается словами — тендеры, закупки, отчёты, — из неё можно сделать роль.',
    ne: 'Не берём роль, где ошибка стоит дороже, чем проверка человеком.',
  },
]

export function Shtat() {
  return (
    <section data-status="оформляет пропуска · 8 ролей" id="shtat" className="bg-bumaga px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="head max-w-[14ch] text-[clamp(2.6rem,6.4vw,5.6rem)]">Кого можно взять в штат</h2>
          <p className="max-w-[44ch] text-[1.08rem] text-seryy">
            Каждая роль — отдельный ИИ-⁠сотрудник со своими правами и базой знаний. Ниже — что он делает и,
            так же важно, чего не делает.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLI.map((r) => {
            const svoya = r.n === '08'
            return (
              <li
                key={r.n}
                className={`flex flex-col overflow-hidden rounded-[1.4rem] border-2 border-chern ${svoya ? 'bg-pole' : 'bg-bumaga'}`}
              >
                <div className={`flex items-center justify-between px-5 py-2.5 ${svoya ? 'border-b-2 border-chern' : 'bg-myata'}`}>
                  <span className="mono text-xs font-bold tracking-[0.14em]">ПРОПУСК № {r.n}</span>
                  <span className="tochka" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="head text-[1.95rem] leading-[0.95]">{r.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-snug">{r.dela}</p>
                  <p className={`mt-4 border-t-2 border-dashed pt-3 text-[0.9rem] leading-snug ${svoya ? 'border-chern/40' : 'border-chern/20 text-seryy'}`}>
                    <span className="mono text-[0.72rem] font-bold uppercase tracking-[0.1em]">не делает · </span>
                    {r.ne}
                  </p>
                  {r.fakt && (
                    <p className="mt-auto pt-4">
                      <span className="inline-block rounded-full bg-pole px-3 py-1 text-[0.78rem] font-bold">{r.fakt}</span>
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
