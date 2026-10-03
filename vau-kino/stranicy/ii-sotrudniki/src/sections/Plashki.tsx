/**
 * Спокойные цветные плашки между сценами: одна крупная фраза на поле,
 * без анимации появления — это осознанная пауза между сценами.
 */

export function Bol() {
  const boli = [
    ['Ночь и выходные', 'Заявки с сайта и Авито лежат без ответа до утра понедельника.'],
    ['Звонки', 'Разговоры записываются, но их никто не слушает — некогда.'],
    ['Одни и те же вопросы', 'Менеджеры по кругу отвечают про сроки и доставку вместо продаж.'],
    ['Отзывы', 'Копятся на площадках и в чатах, выводов из них никто не делает.'],
  ]
  return (
    <section data-status="на смене · ждёт заявок" className="bg-myata px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="kapsy mb-6 text-glub">Знакомо?</p>
        <p className="head max-w-[18ch] text-[clamp(2.4rem,7.4vw,6.4rem)]">
          Заявка пришла в&nbsp;23:40. Ответили в&nbsp;10:15&nbsp;— вежливо, подробно и&nbsp;уже никому.
        </p>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-3xl border-2 border-chern bg-chern sm:grid-cols-2 lg:grid-cols-4">
          {boli.map(([t, d]) => (
            <li key={t} className="bg-bumaga p-6">
              <p className="head text-[1.9rem]">{t}</p>
              <p className="mt-2 text-seryy">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Obeshchanie() {
  return (
    <section data-status="на смене · отвечает" className="zerno relative overflow-hidden bg-pole px-4 py-20 sm:px-6 md:py-32">
      <div
        aria-hidden
        className="absolute -left-[10vw] top-1/2 h-[70%] w-[50vw] -translate-y-1/2 bg-pole-hi"
        style={{ borderRadius: '58% 42% 37% 63% / 55% 62% 38% 45%' }}
      />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
        <p className="kapsy mb-6">Что меняется</p>
        <p className="head max-w-[20ch] text-[clamp(2.4rem,6.6vw,5.8rem)]">
          ИИ-⁠сотрудник не устаёт от сотого одинакового вопроса.
        </p>
        <p className="mt-8 max-w-[52ch] text-[1.15rem] font-medium md:text-[1.35rem]">
          Он отвечает, уточняет, записывает, расшифровывает и оставляет след в CRM. Решения о деньгах,
          скидках и сложных случаях остаются за вашими людьми — это правило, а не настройка по умолчанию.
        </p>
        </div>
        <ul className="mono hidden rotate-[2deg] space-y-2 text-[0.95rem] font-semibold lg:block" aria-hidden>
          {['ответил клиенту', 'уточнил задачу', 'завёл сделку', 'поставил задачу', 'сложное — человеку'].map((x, i) => (
            <li
              key={x}
              className={`flex items-center justify-between rounded-2xl border-2 border-chern px-4 py-3 ${i === 4 ? 'bg-chern text-pole' : 'bg-bumaga'}`}
              style={{ marginLeft: `${(i % 2) * 1.5}rem` }}
            >
              {x} <span>{i === 4 ? '→' : '✓'}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function PlashkaBot() {
  const ryady = [
    ['Понимает', 'кнопки и ключевые слова', 'вопрос, написанный как угодно'],
    ['Знает', 'то, что зашили в сценарий', 'ваш прайс, регламенты и базу знаний'],
    ['Делает', 'пишет в чат', 'заводит сделку, ставит задачу, записывает'],
    ['Вне сценария', '«я вас не понял»', 'уточняет или зовёт человека'],
  ]
  return (
    <section data-status="работает, а не болтает" className="bg-pole px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="head max-w-[16ch] text-[clamp(2.6rem,8vw,7.2rem)]">
          Бот разговаривает. ИИ-⁠сотрудник выполняет работу.
        </p>
        <p className="mt-6 max-w-[46ch] text-[1.15rem] font-medium md:text-[1.3rem]">
          Простой тест: если после диалога в CRM ничего не изменилось — это был бот.
        </p>
        <div className="mt-12 overflow-hidden rounded-3xl border-2 border-chern bg-bumaga">
          <div className="grid grid-cols-[0.8fr_1fr_1fr] border-b-2 border-chern bg-myata text-sm font-bold md:text-base">
            <div className="p-3 md:p-4" />
            <div className="p-3 md:p-4">Чат-бот по сценарию</div>
            <div className="flex items-center gap-2 p-3 md:p-4">
              <span className="tochka" aria-hidden /> ИИ-⁠сотрудник
            </div>
          </div>
          {ryady.map(([k, a, b], i) => (
            <div
              key={k}
              className={`grid grid-cols-[0.8fr_1fr_1fr] text-[0.92rem] md:text-[1.05rem] ${i ? 'border-t border-chern/15' : ''}`}
            >
              <div className="p-3 font-bold md:p-4">{k}</div>
              <div className="p-3 text-seryy md:p-4">{a}</div>
              <div className="p-3 font-semibold md:p-4">{b}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PlashkaPeredFormoy() {
  return (
    <section data-status="ждёт вашу заявку" className="bg-myata px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-[1240px]">
        <p className="head max-w-[22ch] text-[clamp(2.4rem,6.6vw,5.8rem)]">
          Начните с одной роли. Ту, где сегодня теряются заявки.
        </p>
        <p className="mt-6 max-w-[50ch] text-[1.1rem] font-medium md:text-[1.25rem]">
          За 30 минут разберём, какую работу можно отдать ИИ-⁠сотруднику уже сейчас, что ему понадобится
          из ваших материалов и где он упрётся в границы. Если окажется, что выгоднее не ИИ, а порядок
          в CRM, — так и скажем.
        </p>
      </div>
    </section>
  )
}
