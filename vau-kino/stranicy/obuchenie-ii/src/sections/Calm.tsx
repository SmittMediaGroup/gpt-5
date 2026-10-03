import { motion } from 'framer-motion'

/**
 * Спокойные секции между сценами: без fade-up на каждом блоке.
 * Цвет держит заливка, ритм — крупные цифры и фразы.
 */

export function Plate({
  tone = 'deep',
  kicker,
  children,
  note,
}: {
  tone?: 'deep' | 'light' | 'pole'
  kicker?: string
  children: React.ReactNode
  note?: React.ReactNode
}) {
  const bg = tone === 'deep' ? 'bg-pole-3' : tone === 'light' ? 'bg-pole-2' : 'bg-pole'
  return (
    <section className={`grain relative ${bg} px-4 py-24 md:px-10 md:py-36`}>
      <div className="relative mx-auto max-w-[1320px]">
        {kicker ? <p className="eyebrow mb-6 text-ink-2">{kicker}</p> : null}
        <p className="display max-w-[18ch] text-[9.6vw] leading-[1.02] md:text-[5.4vw] xl:text-[5.2rem]">
          {children}
        </p>
        {note ? <div className="mt-8 max-w-[42rem] text-[1.08rem] text-ink md:text-[1.2rem]">{note}</div> : null}
      </div>
    </section>
  )
}

const PAINS = [
  {
    n: '01',
    t: 'Один получает от нейросети готовое письмо, другой — воду',
    d: 'Модель у них одна и та же. Разница в том, как поставлена задача, — и этому никто в отделе специально не учился.',
  },
  {
    n: '02',
    t: 'В чат уходят договоры, ИНН и телефоны клиентов',
    d: 'Не со зла: просто никто не сказал, где проходит граница и какие сервисы для рабочих данных допустимы.',
  },
  {
    n: '03',
    t: 'Курс «нейросети с нуля» забыт через месяц',
    d: 'Общие примеры про картинки и стихи не ложатся на работу бухгалтера или юриста. Навык не закрепляется.',
  },
  {
    n: '04',
    t: 'Руководитель не видит, что изменилось',
    d: 'Нет списка задач, которые перевели на ИИ, нет ответственных, нет проверки через две недели.',
  },
]

export function Pain() {
  return (
    <section id="bol" className="relative bg-krem px-4 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1320px]">
        <p className="eyebrow mb-6 text-ink-2">Как обычно бывает</p>
        <h2 className="h2 max-w-[20ch]">
          Сотрудники уже пишут в нейросети.{' '}
          <span className="relative inline-block">
            <motion.span
              aria-hidden="true"
              className="absolute inset-x-[-0.06em] bottom-0 top-[0.4em] origin-left bg-pole"
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
            <span className="relative">Каждый&nbsp;по‑своему.</span>
          </span>
        </h2>
        <div className="mt-14 grid gap-x-12 gap-y-12 md:mt-20 md:grid-cols-2">
          {PAINS.map((p) => (
            <div key={p.n} className="border-t-2 border-ink pt-6">
              <div className="flex items-start gap-5">
                <span className="display num shrink-0 text-[3.4rem] leading-none text-pole-4 md:text-[4.6rem]">
                  {p.n}
                </span>
                <div>
                  <h3 className="font-display text-[1.35rem] font-bold leading-[1.15] tracking-[-0.01em] md:text-[1.6rem]">
                    {p.t}
                  </h3>
                  <p className="mt-3 max-w-[34rem] text-ink-2">{p.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
