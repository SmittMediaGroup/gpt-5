const DA = [
  'Работающего ИИ-⁠сотрудника в одной роли — в ваших каналах и CRM',
  'Базу знаний, собранную из ваших материалов. Она ваша',
  'Журнал действий: что сделал, когда и почему',
  'Правила передачи человеку: какие темы ИИ-⁠сотрудник не трогает',
  'Короткую инструкцию для команды: как проверять и править',
]
const NET = [
  'Не заменит сильного продавца — заберёт рутину, чтобы у него было время продавать',
  'Не принимает решений о деньгах, скидках и возвратах',
  'Ошибается, как любой ИИ. Поэтому первые недели каждый ответ проверяет человек',
  'Не обещаем рост продаж в процентах — обещаем, что заявки не будут ждать утра',
]

export function Garantii() {
  return (
    <section data-status="сложное — человеку" className="bg-bumaga px-4 py-20 sm:px-6 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <h2 className="head max-w-[18ch] text-[clamp(2.6rem,6.4vw,5.6rem)]">Что получите — и чего не обещаем</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.4rem] border-2 border-chern bg-pole p-6 md:p-8">
            <p className="kapsy">Получите</p>
            <ul className="mt-4 space-y-3">
              {DA.map((x) => (
                <li key={x} className="flex gap-3 text-[1.05rem] font-medium leading-snug">
                  <span className="mono mt-0.5 font-bold">✓</span> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.4rem] border-2 border-chern bg-bumaga p-6 md:p-8">
            <p className="kapsy text-glub">Не обещаем</p>
            <ul className="mt-4 space-y-3">
              {NET.map((x) => (
                <li key={x} className="flex gap-3 text-[1.05rem] leading-snug">
                  <span className="mono mt-0.5 font-bold text-glub">—</span> {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ['Данные', 'Данные компании используются только для вашего ИИ-⁠сотрудника. По запросу — хранение в России и NDA.'],
            ['Звонки', 'В нашем приложении для Битрикс24 аудио удаляется не позже чем через 24 часа, текст — через 90 дней.'],
            ['Контроль', 'Права выдаются под роль. Любое действие можно поднять по журналу и проверить.'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[1.4rem] border-2 border-chern/20 bg-myata p-5">
              <p className="head text-[1.7rem]">{k}</p>
              <p className="mt-1.5 leading-snug">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
