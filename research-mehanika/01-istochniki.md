# Раздел 1. Откуда генеративные системы берут источники и какие роботы ходят по сайтам

Дата сбора: 2026-09-25. Приоритет: Россия (Яндекс, GigaChat), затем ChatGPT, Perplexity, Google, DeepSeek.

## Как проверялось и чего проверить не удалось

- Прямой доступ к сайтам закрыт прокси. `WebFetch`/`curl` вернули `EGRESS_BLOCKED` или 403 для yandex.com, developers.openai.com, docs.perplexity.ai, developers.google.com, habr.com, ashmanov.com, seonews.ru, sostav.ru, kommersant.ru, openai.com, perplexity.com, api-docs.deepseek.com, developers.sber.ru и web.archive.org. Поэтому почти все утверждения ниже взяты **из сниппетов поисковой выдачи** (WebSearch), а не из полного текста страниц.
- **Ограничение объёма.** В этой сессии удалось выполнить около 25 поисковых запросов вместо запланированных 50–90. Дальше общий лимит сессии (200 запросов, его расходуют и параллельные агенты) закончился, и новые запросы блокировались. Из-за этого часть пунктов имеет статус «не проверено».
- **Дополнительный источник: открытые реестры ботов на GitHub.** Git-клоны доступны, поэтому их содержимое проверено по файлам, а не по сниппетам:
  - `ai-robots-txt/ai.robots.txt`: коммит 5631dee от 2026-09-22, 175 ботов, файл `robots.json`. https://github.com/ai-robots-txt/ai.robots.txt
  - `monperrus/crawler-user-agents`: состояние на 2026-08-07, файл `crawler-user-agents.json`. https://github.com/monperrus/crawler-user-agents
  - `ai-forever/gigachat`: официальный Python SDK GigaChat, состояние на 2026-09-08. https://github.com/ai-forever/gigachat

  Это **сторонние** реестры. Официальной документацией они не являются, но цитируют её и дают ссылки на неё.
- Метки в тексте:
  - «проверено 2026-09-25 (по сниппету поиска)»: утверждение видно в сниппете или сводке выдачи, полный текст страницы не открывался.
  - «проверено 2026-09-25 (файл репозитория)»: прочитан исходный файл.
  - «не проверено»: подтверждения в этой сессии нет. Если приведено знание модели, оно помечено отдельно («по памяти модели, до 06.2026»).

---

## 1. Поиск с Алисой / Алиса AI (бывший Яндекс Нейро, «быстрые ответы» под поисковой строкой)

### Откуда берёт источники
- Из **живой выдачи Поиска Яндекса**, в реальном времени.
  - «Нейро в режиме реального времени находит несколько самых подходящих источников по вашему вопросу, анализирует их, объединяет информацию в один ответ». Модель YandexGPT 3 «анализирует материалы из выдачи поиска». Источники: https://webmaster.yandex.ru/blog/yandeks-zapustil-neyro-kak-on-rabotaet и https://yandex.ru/company/news/01-16-04-2024. Проверено 2026-09-25 (по сниппету поиска).
  - Справка Вебмастера об Алисе AI: ответы строятся «на основе наиболее релевантных, информативных и качественных страниц, которые, как правило, находятся высоко в Поиске». В ответах «чаще всего упоминаются страницы сайтов, на которые Алиса AI опиралась при подготовке ответа». Источник: https://yandex.ru/support/webmaster/ru/service/alice-answers. Проверено 2026-09-25 (по сниппету поиска).
- **Режим рассуждений** «задействует больше источников» и может выдать ответ таблицей. Источник: https://webmaster.yandex.ru/blog/yandex-search-alice. Проверено 2026-09-25 (по сниппету поиска).
- **Модель быстрых ответов.** Яндекс раскрыл, что быстрые ответы в Поиске строит отдельная модель Alice AI‑T5‑35B‑A0.6B (encoder‑decoder, MoE) по результатам Поиска. Модель дообучается онлайн-RL на сигналах поведения пользователей. Источник: https://habr.com/ru/companies/yandex/articles/1080654/ (корпоративный блог Яндекса). Проверено 2026-09-25 (по сниппету поиска).
- **Механика «план → запросы в поиск → отбор страниц».** Алиса составляет план ответа, отправляет запросы в обычный поиск Яндекса, получает органическую выдачу и из неё отбирает страницы. Источник: https://habr.com/ru/articles/1072206/. Проверено 2026-09-25 (по сниппету поиска). **Мнение/наблюдение практика, не документация.**
- Память модели как источник ссылок: не документирована. В ответах Поиска ссылки ведут на страницы выдачи. **Не проверено.**

### Роботы и user-agent
| Токен в robots.txt | Назначение | Статус проверки |
|---|---|---|
| `YandexBot` (UA `Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)`) | Основной индексирующий робот. Без индексации нет выдачи, значит, нет и источника для Алисы | Список UA проверен 2026-09-25 по сниппету страниц https://yandex.ru/support/webmaster/ru/robot-workings/check-yandex-robots.html и https://yandex.ru/blog/platon/1713 (старый пост). Точный актуальный список роботов на странице **не открывался** |
| `YandexAdditional`, `YandexAdditionalBot` | Токены для запрета использования контента в генеративных ответах (быстрые ответы YandexGPT, Нейро, Алиса AI) | Проверено 2026-09-25 (по сниппету): https://yandex.com/support/webmaster/en/yandex-ai, https://yandex.ru/support/webmaster/ru/search-appearance/fast.html. В реестре ai.robots.txt оба токена добавлены 2025-06-03 (коммит 3187fd8) со ссылкой на fast.html и пометкой respect: Yes. Проверено 2026-09-25 (файл репозитория) |
| `YandexRenderResourcesBot` | Загрузка ресурсов для рендеринга | Строка UA `Mozilla/5.0 (compatible; YandexRenderResourcesBot/1.0; +http://yandex.com/bots) …`. Проверено 2026-09-25 (файл crawler-user-agents) |

- **Не проверено.** Является ли `YandexAdditional` отдельным краулером со своей строкой UA или только токеном для robots.txt, при котором сайт обходит обычный YandexBot. Строка UA `YandexAdditional` в реестре crawler-user-agents не найдена. В одном сниппете сказано: «YandexAdditionalBot используется для определения источников ответов для сервиса Яндекс Нейро» (выдача по запросу о роботах Яндекса, точная страница не подтверждена). **Гипотеза:** это токен управления, аналог Google-Extended. Проверять по логам сервера.

### Как пускать и запрещать (robots.txt)
Полный запрет использования сайта в ответах Алисы AI и быстрых ответах при сохранении обычной индексации:
```
User-agent: YandexAdditional
Disallow: /

User-agent: Yandex
Allow: /
```
Запрет для одной страницы (пример из документации Яндекса):
```
User-agent: YandexAdditionalBot
Disallow: /cats/mycat.html
```
Источник: https://yandex.com/support/webmaster/en/yandex-ai. Проверено 2026-09-25 (по сниппету поиска). Пример с `Disallow: /` для `YandexAdditional` взят со страницы https://yandex.ru/support/webmaster/ru/search-appearance/fast.html. Проверено 2026-09-25 (по сниппету поиска).

### Последствия запрета
- Сайт «перестанет использоваться как источник данных и для ответов Нейро, и для быстрых ответов под поисковой строкой». Изменения учитываются «при обновлении поисковых данных, в течение 2–14 дней». Источник: https://yandex.ru/support/webmaster/ru/search-appearance/fast.html. Проверено 2026-09-25 (по сниппету поиска).
- Влияние на обычную выдачу. По логике, это отдельный токен, а не `YandexBot`, и индексация сохраняется. **Явная фраза о том, что ранжирование не пострадает, в сниппетах не найдена, не проверено.**
- Использование для обучения моделей. В сниппетах документации Яндекса ни разрешение, ни запрет обучения через `YandexAdditional` не описаны. **Не проверено.**
- Запрет `YandexBot` или `User-agent: Yandex` → страницы выпадают из индекса и, как следствие, из источников Алисы. Это логическое следствие того, что источники берутся из выдачи (см. выше). Отдельной формулировки документации не найдено: **вывод, не цитата.**

### Инструменты контроля
- В Яндекс Вебмастере есть раздел «Эффективность → Видимость сайта в Алисе AI», открыт 7 апреля 2026.
  - Что показывает: долю запросов, где сайт упомянут источником, динамику по месяцам, примеры запросов и сайты своей тематики, которые часто попадают в ответы.
  - Влиять на попадание инструмент не позволяет.
  - Источники: https://yandex.ru/support/webmaster/ru/service/alice-answers, https://webmaster.yandex.ru/blog/efficiency-alice, https://yandex.ru/company/news/07-04-2026-01. Проверено 2026-09-25 (по сниппету поиска).

---

## 2. ChatGPT с веб-поиском (ChatGPT Search)

### Откуда берёт источники
- Свой поисковый краулер **OAI-SearchBot**: «crawls sites to surface as results in SearchGPT/ChatGPT search». Проверено 2026-09-25 (файл ai.robots.txt со ссылкой на https://platform.openai.com/docs/bots).
- Разовые загрузки по запросу пользователя: **ChatGPT-User**.
- **Партнёрство с Bing** как поставщиком результатов. Широко известно, но в этой сессии **не проверено**: поиск по документации OpenAI до исчерпания лимита на это не выходил. По памяти модели (до 06.2026), OpenAI упоминала сторонних поисковых провайдеров. Использовать только после проверки.
- Память модели (обучающие данные, в том числе собранные GPTBot) используется, когда поиск не вызывается. Это общеизвестное свойство LLM, **документального подтверждения в сессии нет.**

### Роботы и user-agent
| Робот | Строка UA | Назначение | Статус проверки |
|---|---|---|---|
| `OAI-SearchBot` | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot` | Индекс для поиска в ChatGPT | Проверено 2026-09-25 (файл crawler-user-agents; сниппет https://developers.openai.com/api/docs/bots) |
| `GPTBot` | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0; +https://openai.com/gptbot)` | Сбор данных для обучения моделей | Проверено 2026-09-25 (файл crawler-user-agents; сниппет help.openai.com) |
| `ChatGPT-User` | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot` | Загрузки по действию пользователя | Проверено 2026-09-25 (файл crawler-user-agents) |
| `OAI-AdsBot` | — | Проверка посадочных страниц рекламы в ChatGPT. По словам OpenAI, данные не идут в обучение, и контент используется, чтобы решить, когда показывать рекламу. Документация не говорит, соблюдает ли бот robots.txt | Проверено 2026-09-25: файл ai.robots.txt, коммит 2d79317 от 2026-09-05 со ссылкой на developers.openai.com/api/docs/bots, где OAI-AdsBot назван четвёртым из четырёх краулеров OpenAI |

Диапазоны IP опубликованы: `https://openai.com/chatgpt-user.json`, `/searchbot.json`, `/gptbot.json`. Проверено 2026-09-25 (по сниппету поиска: https://developers.openai.com/api/docs/bots).

### robots.txt: показываться в ChatGPT Search, но не отдавать данные на обучение
```
User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /
```
- «Publishers should disallow the GPTBot user-agent from sites and pages they wish to exclude from potential training». Источник: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq. Проверено 2026-09-25 (по сниппету поиска).
- Если OAI-SearchBot пущен, переходы из ChatGPT видны в веб-аналитике, например в Google Analytics. Источник тот же, проверено 2026-09-25 (по сниппету поиска).
- Для рекламодателей OpenAI даёт пример `User-agent: OAI-SearchBot / Allow: /` и `User-agent: OAI-AdsBot / Allow: /`. Источник: https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers. Проверено 2026-09-25 (по сниппету поиска).

### Последствия запрета
- `GPTBot: Disallow` означает исключение из будущего обучения. На показ в поиске не влияет: это разные токены. Проверено по сниппету help.openai.com.
- `OAI-SearchBot: Disallow`. По памяти модели (до 06.2026), документация OpenAI говорит, что такие сайты не показываются в ответах ChatGPT search, но могут появляться навигационными ссылками. Обновление robots.txt для поиска учитывается примерно за 24 часа. **В этой сессии не проверено.**
- `ChatGPT-User`. По памяти модели, OpenAI указывает, что для действий, инициированных пользователем, robots.txt «may not apply». Реестр ai.robots.txt помечает бота как respect: Yes. **Противоречие не разрешено, не проверено.**

---

## 3. Perplexity

### Откуда берёт источники
- Собственный индекс, который строит **PerplexityBot**, плюс загрузки в момент запроса через **Perplexity-User**. Источник: https://docs.perplexity.ai/docs/resources/perplexity-crawlers. Проверено 2026-09-25 (по сниппету поиска).
- Используются ли сторонние поисковые API: **не проверено.**

### Роботы и user-agent
| Робот | Строка UA | robots.txt | Статус проверки |
|---|---|---|---|
| `PerplexityBot` | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)` | Соблюдает | Проверено 2026-09-25 (сниппет docs.perplexity.ai; файл crawler-user-agents) |
| `Perplexity-User` | `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)` | Как правило, не соблюдает: запрос идёт от имени пользователя. В реестре ai.robots.txt respect: No со ссылкой на docs.perplexity.ai/guides/bots | Проверено 2026-09-25 (файлы реестров). Позицию Perplexity «пользовательские загрузщики ставят опыт пользователя выше robots.txt» подтверждает сниппет https://www.perplexity.ai/hub/blog/agents-or-bots-making-sense-of-ai-on-the-open-web |

- Контент, полученный через Perplexity-User, «isn't stored for training», он используется сразу для ответа. Источник: блог Perplexity (URL выше). Проверено 2026-09-25 (по сниппету поиска).
- IP-диапазоны: `https://www.perplexity.com/perplexitybot.json`, `https://www.perplexity.com/perplexity-user.json`. Проверено 2026-09-25 (по сниппету поиска).

### robots.txt
```
User-agent: PerplexityBot
Allow: /
```
Запрет выглядит как `Disallow: /` для `PerplexityBot`. Последствие: страница не попадает в индекс Perplexity. **Гипотеза, не проверено:** ссылка на страницу всё равно может появиться, если пользователь сам даст URL или сработает Perplexity-User. Надёжно отсечь Perplexity-User можно только на уровне сервера или WAF по UA и IP.

---

## 4. Google AI Overviews / AI Mode

### Откуда берёт источники
- Из **индекса Google Поиска**. Чтобы стать поддерживающей ссылкой в AI Overviews или AI Mode, страница должна быть проиндексирована и пригодна к показу в Поиске со сниппетом, то есть выполнять технические требования Поиска. Источник: https://developers.google.com/search/docs/appearance/ai-features. Проверено 2026-09-25 (по сниппету поиска).
- Механика query fan-out (разбиение запроса на подзапросы) и формулировка «никакой специальной оптимизации не требуется» — по памяти модели (до 06.2026) взяты с той же страницы. **В этой сессии не проверено.**
- В выдаче обнаружен новый документ Google «Google's Guide to Optimizing for Generative AI Features on Google Search»: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide. Существует по сниппету, **содержание не проверено.**

### Роботы и токены
| Токен | Что делает | Статус проверки |
|---|---|---|
| `Googlebot` (`Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)` и мобильные варианты) | Индексирует для Поиска, а значит, и для AI Overviews и AI Mode | UA проверен 2026-09-25 (файл crawler-user-agents) |
| `Google-Extended` | Токен управления: использование контента для обучения и grounding Gemini и Vertex AI. «Does not impact a site's inclusion or ranking in Google Search» | Цитата Google, приведённая в ai.robots.txt со ссылкой на https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers. Проверено 2026-09-25 (файл репозитория) |
| `Google-Agent` | Агенты на инфраструктуре Google, действующие по запросу пользователя | Реестр ai.robots.txt со ссылкой на https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-agent. Проверено 2026-09-25 (файл репозитория) |

### Как ограничить показ в AI Overviews и AI Mode
- **Не через robots.txt для Google-Extended.** Показ управляется теми же средствами, что и сниппеты: `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`. Чем строже ограничение, тем меньше контента попадает в AI-функции. Источник: https://developers.google.com/search/docs/appearance/ai-features. Проверено 2026-09-25 (по сниппету поиска).
- AI Mode добавлен в спецификацию robots meta, `data-nosnippet` и `X-Robots-Tag`. Источники: https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag, https://developers.google.com/search/updates. Проверено 2026-09-25 (по сниппету поиска).
- Если URL закрыт в robots.txt, meta-правила на нём не будут прочитаны. Для `noindex` или `nosnippet` страницу нельзя закрывать от обхода. Источник: robots-meta-tag, проверено 2026-09-25 (по сниппету поиска).
```html
<meta name="robots" content="max-snippet:160">
<div data-nosnippet>Этот блок не пойдёт в сниппеты и AI-ответы</div>
```
- `User-agent: Google-Extended / Disallow: /` **не убирает** сайт из AI Overviews: они строятся на индексе Googlebot. Это вывод из цитаты «does not impact inclusion in Google Search» и из того, что AI Overviews — функция Поиска. Прямой формулировки об AI Overviews в сниппетах нет: **вывод, частично проверено.**

---

## 5. GigaChat (Сбер)

- **Веб-поиск в API есть (документированно).** Официальный SDK `ai-forever/gigachat`:
  - встроенный инструмент `web_search` с параметрами `type` (режим поиска, в примере `"actual_info_web_search"`), `indexes` («Search index names») и `flags`;
  - инструмент `url_content_extraction` для извлечения содержимого по URL;
  - принудительный вызов поиска через `tool_config={"mode":"forced","tool_name":"web_search"}`;
  - в ответе модели источники возвращаются в `inline_data.sources` с полями `url` и `title`.

  Файлы: `src/gigachat/models/chat_completions.py` (классы `ChatWebSearchTool`, `ChatSource`), `examples/tools/web_search.py`, `examples/tools/web_search_options.py`, `examples/tools/forced_web_search.py`. Репозиторий: https://github.com/ai-forever/gigachat. Проверено 2026-09-25 (файл репозитория).
- **Чей поисковый индекс использует `web_search`** (собственный Сбера, партнёрский или иной): в SDK не указано. **Не проверено**, developers.sber.ru недоступен, лимит поиска исчерпан.
- **Краулер и user-agent GigaChat/Сбера: не найден.** В реестре ai.robots.txt (175 ботов) и в crawler-user-agents нет записей с «Giga» или «Sber», кроме не связанного Gigabot поисковика Gigablast. Проверено 2026-09-25 (файлы репозиториев). Официального документа о краулере для robots.txt **не найдено**.
- Практическое следствие (**гипотеза**): управлять попаданием в GigaChat через robots.txt сейчас нечем. Остаётся смотреть логи сервера и заголовки запросов, которые приходят в момент вызова `url_content_extraction` или `web_search`.

---

## 6. DeepSeek

- **Краулер `DeepSeekBot`** (сторонние реестры):
  - UA `Mozilla/5.0 (compatible; DeepSeekBot/1.0; +https://www.deepseek.com/bot)`, добавлен в crawler-user-agents 2026-04-26;
  - в ai.robots.txt добавлен 2025-09-24 (коммит bf347bd), назначение «Training language models and improving AI products», respect: **No**, то есть robots.txt, по оценке составителей, не соблюдает.

  Проверено 2026-09-25 (файлы репозиториев). **Официальная страница https://www.deepseek.com/bot не открывалась, не проверено.**
- Веб-поиск в чате DeepSeek (кнопка «Поиск»): какой поисковый провайдер используется, не документировано в доступных источниках. **Не проверено.** Есть ли веб-поиск в официальном API (api-docs.deepseek.com): **не проверено**, домен заблокирован.
- robots.txt, **эффект не гарантирован**:
```
User-agent: DeepSeekBot
Disallow: /
```

---

## Итоговая таблица

| Система | Откуда источники | User-agent / токен | Как запретить | Последствия запрета | Документ (проверка) |
|---|---|---|---|---|---|
| Поиск с Алисой / Алиса AI | Живая выдача Поиска Яндекса. Модель отбирает страницы из топа | `YandexBot` (индекс); `YandexAdditional` / `YandexAdditionalBot` (генеративные ответы) | `User-agent: YandexAdditional` + `Disallow: /` (или путь) | Сайт перестаёт быть источником Нейро / Алисы AI и быстрых ответов, срок 2–14 дней. Влияние на обычную выдачу и на обучение в документации (по сниппетам) не описано | yandex.com/support/webmaster/en/yandex-ai; yandex.ru/support/webmaster/ru/search-appearance/fast.html (сниппет 2026-09-25) |
| ChatGPT Search | Собственный индекс OAI-SearchBot + загрузки ChatGPT-User. Партнёрство с Bing не проверено | `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `OAI-AdsBot` | `GPTBot: Disallow` — обучение; `OAI-SearchBot: Disallow` — поиск | Запрет GPTBot исключает сайт из обучения, но не из поиска. Запрет OAI-SearchBot убирает сайт из ответов поиска (по памяти модели, не проверено) | developers.openai.com/api/docs/bots; help.openai.com/…/12627856 (сниппет 2026-09-25) |
| Perplexity | Собственный индекс PerplexityBot + загрузки Perplexity-User | `PerplexityBot`, `Perplexity-User` | `PerplexityBot: Disallow`; Perplexity-User — только WAF по UA / IP | Страница не индексируется. Пользовательские загрузки robots.txt, как правило, игнорируют и в обучение не идут | docs.perplexity.ai/docs/resources/perplexity-crawlers; perplexity.ai/hub/blog/agents-or-bots… (сниппет 2026-09-25) |
| Google AI Overviews / AI Mode | Индекс Google Поиска, страница должна быть пригодна к показу со сниппетом | `Googlebot` (показ), `Google-Extended` (Gemini / Vertex, не Поиск) | `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex`; `Google-Extended` не убирает из AIO | Чем строже ограничения сниппета, тем меньше показ в AIO / AI Mode. `noindex` означает полное отсутствие | developers.google.com/search/docs/appearance/ai-features (сниппет 2026-09-25) |
| GigaChat | Встроенный `web_search` API с источниками url / title, индекс не раскрыт | Краулер не найден | Документированного способа нет | — | github.com/ai-forever/gigachat (файлы 2026-09-25) |
| DeepSeek | Веб-поиск в чате, провайдер не документирован; память модели | `DeepSeekBot` (сторонние реестры) | `DeepSeekBot: Disallow`, по реестру может не соблюдаться | Не гарантировано | github.com/ai-robots-txt/ai.robots.txt (файл 2026-09-25); официальный документ не проверен |

## Что обязательно перепроверить перед публикацией чек-листа
1. Полный текст https://yandex.ru/support/webmaster/ru/search-appearance/fast.html и https://yandex.com/support/webmaster/en/yandex-ai: влияет ли `YandexAdditional` на ранжирование и используется ли контент для обучения.
2. https://developers.openai.com/api/docs/bots: формулировки об OAI-SearchBot (срок около 24 часов, навигационные ссылки) и о ChatGPT-User (применимость robots.txt).
3. Используется ли Bing в ChatGPT Search: официальная формулировка OpenAI.
4. developers.sber.ru: какой индекс у GigaChat `web_search`, есть ли краулер.
5. https://www.deepseek.com/bot и api-docs.deepseek.com.
