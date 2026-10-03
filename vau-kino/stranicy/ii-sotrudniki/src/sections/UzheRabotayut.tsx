/**
 * «Сначала сделали себе» — только собственные продукты SMG и только
 * проверяемые факты (см. РЕШЕНИЯ.md). Ни клиентов, ни процентов.
 */
const PRODUKTY = [
  {
    t: 'Расшифровка звонков для Битрикс24',
    rol: 'расшифровщик звонков',
    d: 'Текст разговора с репликами по ролям, резюме и следующий шаг — в карточке сделки. Расчёт идёт на нашем сервере в России, аудио удаляется через сутки. 60 минут в месяц бесплатно.',
    href: 'https://app.smittmediagroup.ru/',
    link: 'app.smittmediagroup.ru',
  },
  {
    t: 'ИИ-⁠юрист',
    rol: 'юрист-консультант',
    d: 'Ищет ответ в действующих редакциях законов через открытое API pravo.gov.ru и показывает, на какую норму опирается. Работает на нашей модели. Это справка, а не юридическая консультация.',
  },
  {
    t: 'GEO-Радар',
    rol: 'аналитик',
    d: 'Проверяет, называют ли ИИ-⁠ассистенты вашу компанию, когда клиент спрашивает их о вашей нише. Отчёт за 15 минут, без регистрации.',
    href: 'https://geo.smittmediagroup.ru/',
    link: 'geo.smittmediagroup.ru',
  },
  {
    t: 'Охотник заказов',
    rol: 'менеджер по входящим',
    d: 'Три раза в день просматривает биржи фриланса, отбирает подходящие заказы и готовит отклик. Отправляет человек — автоотправки нет намеренно.',
  },
]

export function UzheRabotayut() {
  return (
    <section data-status="уже работает у нас" className="bg-myata px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="kapsy text-glub">Уже на смене у нас</p>
        <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="head max-w-[14ch] text-[clamp(2.6rem,6.4vw,5.6rem)]">Сначала наняли себе</h2>
          <p className="max-w-[46ch] text-[1.08rem]">
            Мы не показываем чужие презентации. Это наши собственные ИИ-⁠сотрудники — они работают в наших
            процессах каждый день, и на них видны и сильные стороны, и границы.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2">
          {PRODUKTY.map((p) => (
            <li key={p.t} className="flex flex-col rounded-[1.4rem] border-2 border-chern bg-bumaga p-6 md:p-8">
              <span className="mono text-xs font-bold uppercase tracking-[0.12em] text-glub">роль: {p.rol}</span>
              <h3 className="head mt-2 text-[2.3rem] md:text-[2.7rem]">{p.t}</h3>
              <p className="mt-3 leading-snug">{p.d}</p>
              {p.href ? (
                <a
                  href={p.href}
                  rel="noopener"
                  className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-5 font-bold underline decoration-2 underline-offset-[6px]"
                >
                  {p.link} ↗
                </a>
              ) : (
                <span className="mono mt-auto pt-5 text-sm text-seryy">внутренний инструмент</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
