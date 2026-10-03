import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaults, type Content } from './defaults'
import { inStudioPreview, onStudioMessage, studioReady } from './studio'

/**
 * Загрузка содержимого сайта (тексты, фото, списки).
 *
 * Содержимое лежит в content.json рядом с собранным сайтом. Его пишет Студия —
 * редактор, в котором клиент сам правит сайт. Пересобирать проект не нужно.
 *
 * Правила:
 *  1. Сайт не зависит от файла. Не загрузился — показываем defaults.
 *  2. Правка одного поля не стирает остальные: JSON накладывается поверх
 *     defaults, а не заменяет их целиком. Списки заменяются целиком — клиент
 *     редактирует их как список (добавить, удалить, переставить).
 *  3. Никакой разметки из JSON: значения выводятся как текст.
 *  4. Внутри предпросмотра Студии (iframe с ?studio=1) содержимое приходит
 *     сообщением на каждую правку — клиент видит изменения до публикации.
 */

function merge<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base
  if (Array.isArray(base)) {
    return (Array.isArray(override) ? override : base) as T
  }
  if (typeof base === 'object' && typeof override === 'object') {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
    for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
      if (key in out) out[key] = merge(out[key], value) // чужих ключей не берём
    }
    return out as T
  }
  return (typeof override === typeof base ? override : base) as T
}

const ContentContext = createContext<Content>(defaults)

export function useContent(): Content {
  return useContext(ContentContext)
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(defaults)

  useEffect(() => {
    let alive = true
    let fromStudio = false
    // относительный путь: сайт может лежать в подпапке (/files/bakery/)
    const url = new URL('content.json', document.baseURI).href
    fetch(url, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        // черновик из Студии важнее опубликованного файла, пришедшего позже
        if (alive && data && !fromStudio) setContent(merge(defaults, data))
      })
      .catch(() => {
        /* нет файла или битый JSON — остаёмся на defaults */
      })

    const off = onStudioMessage((draft) => {
      fromStudio = true
      setContent(merge(defaults, draft))
    })
    if (inStudioPreview) studioReady()
    return () => {
      alive = false
      off()
    }
  }, [])

  useEffect(() => {
    const site = (content as { site?: { title?: string; description?: string } }).site
    if (site?.title) document.title = site.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta && site?.description) meta.setAttribute('content', site.description)
  }, [content])

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}
