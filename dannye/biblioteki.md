# Библиотеки: что ставим, что не ставим, сколько весит

Проверка 02.10.2026. Веса — min+gzip; источники: Bundlephobia API, локальные
замеры esbuild/unpkg+gzip (помечено), официальная документация. Стек:
Vite + React 19 + Tailwind 4 + Motion.

## Берём

| Пакет | Версия | gzip | Лицензия | React 19 | Зачем |
|---|---|---|---|---|---|
| [`motion`](https://www.npmjs.com/package/motion) (бывший framer-motion) | 13.5.0 | 45,7 КБ, **27,2 КБ** с `m` + `LazyMotion` + `domAnimation` | MIT | да, peer `^18 \|\| ^19` | движок анимации |
| [`lenis`](https://www.npmjs.com/package/lenis) | 1.3.26 | 5,5 КБ | MIT | да, есть `lenis/react` | плавная прокрутка |
| [`embla-carousel-react`](https://www.npmjs.com/package/embla-carousel-react) | 8.6.0 | 7,9 КБ | MIT | да, peer включает `^19` | карусель карточек |
| [`@number-flow/react`](https://www.npmjs.com/package/@number-flow/react) | 0.6.2 | 6,1 КБ | MIT | да | анимированные цифры и метрики |
| [`splitting`](https://www.npmjs.com/package/splitting) | 1.1.0 | 1,8 КБ + CSS | MIT | фреймворк-независим | разбивка заголовка на буквы/слова под stagger |
| [`@paper-design/shaders-react`](https://www.npmjs.com/package/@paper-design/shaders-react) | 0.0.81 | **8,2 КБ** только `MeshGradient` | Apache-2.0 | да | анимированный mesh-градиент **без three.js** |
| [`simplex-noise`](https://www.npmjs.com/package/simplex-noise) | 4.0.3 | 1,8 КБ | MIT | чистый JS | органичное «живое» движение |
| [`tw-animate-css`](https://www.npmjs.com/package/tw-animate-css) | 1.4.0 | 1,78 КБ (замер unpkg+gzip) | MIT | — | утилиты анимаций под Tailwind v4 |

**Итого ≈ 78,8 КБ gzip**, или ≈60 КБ при `LazyMotion`. Для сравнения: только
`three.js` + `@react-three/fiber` — ≈242 КБ.

Два пакета надо **пинить** по версии: `@paper-design/shaders-react` (pre-1.0,
автор прямо просит пинить) и `tw-animate-css` (обещаны ломающие изменения в 2.0).

Главный рычаг по весу: `m` + `LazyMotion` + `domAnimation` вместо обычного
`motion` — минус 40% (https://motion.dev/docs/react-reduce-bundle-size).

## Не берём и почему

| Пакет | gzip | Причина |
|---|---|---|
| `three.js` 0.186.1 | 184,9 КБ | одна зависимость в 4 раза тяжелее всего нашего анимационного слоя; задачу mesh-градиента закрывает Paper Shaders за 8,2 КБ |
| `@react-three/fiber` 9.8.1 | 57,0 КБ **поверх** three.js + 10 зависимостей, итого ≈242 КБ | то же; плюс peer `react: ">=19 <19.4"` — сломается на React 19.4 |
| `vanta` 0.5.24 | по собственному README «~120 КБ, в основном three.js» | требует глобальный `window.THREE`, последняя публикация 2022, React-обёртки нет |
| `lottie-react` 3.1.2 | 196 КБ | тащит полный плеер; если Lottie нужен — только `@lottiefiles/dotlottie-react` (33,9 КБ JS **+ неизмеренный WASM**) |
| `@rive-app/react-canvas` | 64,3 КБ JS + **WASM 368–821 КБ gzip** | минимальный путь ≈420 КБ gzip — больше половины медианного JS-бюджета мобильной страницы |
| `tailwindcss-animate` 1.0.7 | 1,1 КБ | последняя публикация до выхода Tailwind v4; shadcn/ui официально заменил его на `tw-animate-css`. Ловушка: peer `>=3.0.0` формально проходит, npm не предупредит |
| `react-wrap-balancer` | 1,2 КБ | нативный `text-wrap: balance` делает то же бесплатно |
| `@vercel/og` | 147 КБ | рассчитан на API-роут Next.js, у статической Vite-сборки его нет; MPL-2.0 |
| `mesh-gradient.js`, `granim` | 8,0 / 5,0 КБ | заброшены (2022 и 2018) |
| `ogl` | 34,2 КБ | имеет смысл только если пишем свои шейдеры |

## GSAP: проверенные факты, а не слухи

- **Бесплатен с 30.04.2025**, включая бывшие платные плагины (SplitText,
  ScrollSmoother, MorphSVG, DrawSVG) — начиная с версии 3.13.0:
  https://gsap.com/pricing/ , https://gsap.com/blog/3-13/
- **Но это не MIT и не OSI-лицензия**: в репозитории GreenSock файла LICENSE нет,
  в npm поле `license` — свободный текст со ссылкой на
  https://gsap.com/community/standard-license/ . Webflow купил GreenSock в октябре 2024.
- Запрет в лицензии один существенный: нельзя использовать GSAP внутри продукта,
  который **конкурирует с визуальным редактором анимаций Webflow**. Обычные
  клиентские лендинги разрешены прямо, включая коммерческие.
- **Вес:** `gsap.min.js` 28,1 КБ gzip + `ScrollTrigger.min.js` 17,8 КБ = **≈46 КБ**.
- **Вывод: не берём — по избыточности, а не по лицензии.** Уникальны у ScrollTrigger
  только `pin`, `snap` и `containerAnimation`; первое закрывается `position: sticky`,
  второе — `scroll-snap-type` в CSS, сглаживание скраба — `useSpring` в Motion.
  Motion сам признаёт, что scroll-pinning у него нет и рекомендует sticky:
  https://motion.dev/docs/migrate-from-gsap-to-motion
- Две оговорки владельцу: (а) если агентство когда-нибудь будет делать СВОЙ
  no-code конструктор анимаций как продукт — пункт про конкуренцию с Webflow
  сработает; (б) при аудите зависимостей «только OSI-лицензии» GSAP не пройдёт.

## Готовые наборы компонентов (ускоритель, не библиотека)

| Набор | ★ | Лицензия | Стек | Замечание |
|---|---|---|---|---|
| [cult-ui](https://github.com/nolly-studio/cult-ui) | 6 256 | MIT | **Tailwind v4 + Motion** | лучшее совпадение с нашим стеком |
| [magicui](https://github.com/magicuidesign/magicui) | 22 437 | MIT | React + TS + Tailwind + Motion | 150+ компонентов, ставится через shadcn CLI |
| [motion-primitives](https://github.com/ibelick/motion-primitives) | 6 441 | MIT | Motion + Tailwind | примитивы, бета |
| [animata](https://github.com/codse/animata) | 2 817 | MIT | React + Tailwind + Motion | copy-paste, не пакет |
| [react-bits](https://github.com/DavidHDev/react-bits) | 48 395 | **MIT + Commons Clause** | React | 200+ компонентов, **но: нельзя перепродавать сами компоненты** — для клиентского лендинга можно, для продажи шаблонов на биржах нельзя |

## CSS, который заменяет библиотеки

| Что | Вместо чего | Поддержка |
|---|---|---|
| `text-wrap: balance` | react-wrap-balancer | широкая |
| `scroll-snap-type` | GSAP snap | широкая |
| `position: sticky` | GSAP pin | широкая |
| `@property` + градиент | JS-анимация градиента | Baseline с июля 2024 |
| `animation-timeline: view()` | скролл-библиотеки | **Baseline «Limited»: нет в Firefox** — только как необязательное улучшение |
| View Transitions (same-document) | AnimatePresence для смены «экранов» | Baseline «Newly available» с 14.10.2025 (Chrome 111, Safari 18, Firefox 144) |
| `content-visibility: auto` | ручная виртуализация длинной страницы | измеренный пример: первая отрисовка 232 мс → 30 мс (https://web.dev/articles/content-visibility) |
