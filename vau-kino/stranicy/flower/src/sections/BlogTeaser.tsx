import { motion, useReducedMotion } from 'framer-motion'
import { useContent } from '../content/useContent'
import { media, ruDate, useBlogPosts } from '../content/studio'

/**
 * Заметки флориста — между ателье и финалом. Подача та же, что у программы
 * вечера: афиши в тонкой рамке, дата вместо номера опуса, пион на наведении.
 * Записи пишет клиент в Студии; пока их нет, секции на странице нет вовсе.
 */
export function BlogTeaser() {
  const txt = useContent()
  const posts = useBlogPosts(3)
  const reduced = useReducedMotion()
  if (!posts.length) return null
  const base = import.meta.env.BASE_URL

  return (
    <section id="blog" className="relative border-t border-bone/10 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1100px]">
        <p className="text-xs tracking-[0.22em] text-smoke uppercase">{txt.blog.kicker}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="display max-w-[18ch] text-[clamp(1.7rem,3.6vw,2.8rem)]">{txt.blog.title}</h2>
          <a
            href={`${base}blog/`}
            className="inline-flex min-h-11 items-center text-sm text-peony underline-offset-4 transition-colors duration-200 hover:underline focus-visible:underline"
          >
            {txt.blog.all} →
          </a>
        </div>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {posts.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 1, 0.5, 1] }}
            >
              <a
                href={`${base}blog/${p.slug}/`}
                className="group flex h-full flex-col border border-bone/12 bg-soot/40 p-7 transition-colors duration-250 hover:border-peony/60 focus-visible:border-peony"
              >
                {p.cover ? (
                  <img src={media(p.cover)} alt="" loading="lazy" className="mb-6 aspect-[4/3] w-full object-cover" />
                ) : null}
                <p className="text-xs tracking-[0.2em] text-smoke uppercase">{ruDate(p.date)}</p>
                <h3 className="display mt-2 text-xl leading-snug break-words transition-colors duration-200 group-hover:text-peony">
                  {p.title}
                </h3>
                {p.excerpt ? (
                  <p className="mt-4 border-t border-bone/10 pt-4 text-sm leading-relaxed text-smoke">{p.excerpt}</p>
                ) : null}
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
