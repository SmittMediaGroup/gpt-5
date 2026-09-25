# Нулевой шаг: пускает ли сайт роботов, которые собирают материал для ИИ-ответов

Проверено: 2026-09-25. Источники разобраны в `research-mehanika/01-istochniki.md`, здесь они собраны и дополнены.

## Резюме

1. В ответ ИИ может попасть только страница, которую робот сумел прочитать. Поэтому сначала я проверяю доступ, а тексты и позиции смотрю потом. Результат этого шага — «доступ есть / доступа нет», прироста видимости он сам по себе не даёт.
2. Роботы делятся на три группы: поисковые (строят индекс, из которого берутся ответы), ответные (приходят по запросу пользователя) и обучающие (собирают данные для будущих моделей). Если закрыть обучающих, сайт из поисковых ответов не пропадает.
3. Для России главное — `YandexBot` и `YandexAdditional` / `YandexAdditionalBot`. Запрет второго по справке Яндекса убирает сайт из ответов Алисы AI и быстрых ответов за 2–14 дней.
4. Сайт чаще всего пропадает не из-за robots.txt, а из-за `noindex`/`nosnippet`, неправильного canonical, ошибок 4xx/5xx и блокировки на уровне WAF/CDN (например, в Cloudflare). Всё это проверяется за 10 минут командами из раздела 4.
5. Официальную документацию владельца я нашёл по 30 из 40 строк таблицы. Почти всё прочитано по сниппетам поиска: прокси не пускает на сами страницы. Для GigaChat/Сбера и VK/Mail.ru задокументированного ИИ-робота нет.

### Как читать пометки

- **страница** — текст официальной страницы открыт и прочитан. В этой сессии таких нет: прокси блокирует `WebFetch`/`curl` к сайтам владельцев.
- **сниппет** — формулировка видна в поисковой выдаче, URL ведёт на официальный домен владельца, полный текст не открывался.
- **реестр** — сведения только из сторонних реестров на GitHub: `ai-robots-txt/ai.robots.txt` (коммит 5631dee от 2026-09-22, 175 записей) и `monperrus/crawler-user-agents`. Это не документация владельца.
- **память** — моё знание до 06.2026, в этой сессии не подтверждено. Перед использованием в работе с клиентом нужно перепроверить.

---

## 1. Таблица роботов

«Соблюдает robots.txt» — так пишет сам владелец. Если сказано «по реестру», это оценка составителей реестра. Во всех строках дата проверки — 2026-09-25.

| User-agent (токен) | Владелец | Назначение | Соблюдает robots.txt | Что означает запрет для попадания в ответы | Официальный источник | Дата | Пометка |
|---|---|---|---|---|---|---|---|
| `YandexBot` (группа `Yandex` действует на всех роботов Яндекса) | Яндекс | Поиск: основной индексирующий робот | Да | Страницы выпадают из Поиска, а вместе с ним и из ответов Алисы AI: Алиса берёт источники из выдачи. Это вывод, а не цитата | https://yandex.ru/support/webmaster/ru/robot-workings/check-yandex-robots.html ; https://yandex.ru/support/webmaster/ru/robot-workings/user-agent.html ; https://yandex.ru/support/webmaster/ru/service/alice-answers | 2026-09-25 | сниппет |
| `YandexAdditional` | Яндекс | Ответ: генеративные ответы (Алиса AI, быстрые ответы YandexGPT) | Да | **Убирает из ответов Алисы AI и быстрых ответов** за 2–14 дней. Пишет ли документация что-то о влиянии на обычный Поиск и на обучение, я не нашёл | https://yandex.com/support/webmaster/en/yandex-ai ; https://yandex.ru/support/webmaster/ru/search-appearance/fast.html | 2026-09-25 | сниппет |
| `YandexAdditionalBot` | Яндекс | То же, пример в справке записан с этим токеном | Да | То же. Отдельная строка UA в логах не подтверждена: возможно, это только токен для robots.txt | Те же | 2026-09-25 | сниппет |
| `OAI-SearchBot` | OpenAI | Поиск: индекс для ChatGPT search | Да | **Убирает из ответов ChatGPT search** примерно через 24 часа. Но если OpenAI знает URL от стороннего поисковика, в ответе может остаться голая ссылка с заголовком. Чтобы убрать и её, нужен `noindex` | https://developers.openai.com/api/docs/bots ; https://help.openai.com/en/articles/12627856-publishers-and-developers-faq | 2026-09-25 | сниппет |
| `GPTBot` | OpenAI | Обучение моделей | Да | **Только обучение.** Настройки GPTBot и OAI-SearchBot независимы | Те же | 2026-09-25 | сниппет |
| `ChatGPT-User` | OpenAI | Ответ по запросу пользователя: открывает страницу, когда об этом просят в чате | Спорно: реестр пишет «Yes». По памяти, OpenAI пишет, что для действий пользователя правила robots.txt могут не применяться, но в этой сессии я это не подтвердил | Скорее всего, почти ничего не меняет | https://developers.openai.com/api/docs/bots | 2026-09-25 | сниппет (сама страница) + память |
| `OAI-AdsBot` | OpenAI | Реклама: проверяет посадочные страницы объявлений в ChatGPT, в обучение не идёт | Не указано | На органические ответы не влияет (вывод). Касается только тех, кто даёт рекламу в ChatGPT | https://developers.openai.com/api/docs/bots ; https://help.openai.com/en/articles/20001243-advertiser-guidance-for-allowing-openai-web-crawlers | 2026-09-25 | реестр + сниппет |
| `PerplexityBot` | Perplexity | Поиск: индекс Perplexity | Да | **Убирает из индекса Perplexity** и, значит, из обычных ответов | https://docs.perplexity.ai/docs/resources/perplexity-crawlers | 2026-09-25 | сниппет |
| `Perplexity-User` | Perplexity | Ответ по запросу пользователя, не хранит и не обучает | Как правило, нет: Perplexity ставит запрос пользователя выше robots.txt | **Почти ничего.** Отсечь можно только WAF по UA и IP | https://docs.perplexity.ai/docs/resources/perplexity-crawlers ; https://www.perplexity.ai/hub/blog/agents-or-bots-making-sense-of-ai-on-the-open-web | 2026-09-25 | сниппет |
| `Googlebot` | Google | Поиск, а через него AI Overviews и AI Mode | Да | **Убирает из Поиска, а значит, из AI Overviews и AI Mode.** Чтобы ссылка появилась в AI-блоке, страница должна быть в индексе и иметь право на сниппет | https://developers.google.com/search/docs/appearance/ai-features ; https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | 2026-09-25 | сниппет |
| `Google-Extended` | Google | Токен, отдельно не обходит сайт. Управляет обучением Gemini и «grounding в некоторых других системах Google» | Да | **На Поиск и AI Overviews не влияет** («does not impact inclusion or ranking in Google Search»). Может ограничить использование сайта для grounding в Gemini: это компромисс, см. раздел 3 | https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers ; https://developers.google.com/search/docs/appearance/ai-features | 2026-09-25 | сниппет + реестр |
| `GoogleOther` (`-Image`, `-Video`) | Google | Разовые обходы для исследований и разработки | Да | **Почти ничего** для ответов | https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers | 2026-09-25 | сниппет + реестр |
| `Google-Agent` | Google | Агенты на инфраструктуре Google, действующие по просьбе пользователя | По реестру да, у владельца не подтверждено | Неясно | https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-agent | 2026-09-25 | реестр |
| `bingbot` | Microsoft | Поиск Bing, из которого строятся ответы Copilot. ChatGPT search тоже использует сторонних поисковых провайдеров, а для Enterprise/Edu OpenAI прямо называет Bing | Да | **Убирает из Bing и ответов Copilot.** Для ChatGPT, вероятно, уменьшает число источников (вывод). Управлять можно и мета-тегами: `NOARCHIVE` — не в ответах Copilot/Bing Chat и не в обучении; `NOCACHE` — в ответе только URL, заголовок и сниппет. В обычной выдаче страница остаётся в обоих случаях | https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat ; https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0 ; https://help.openai.com/en/articles/9237897-chatgpt-search | 2026-09-25 | сниппет |
| `ClaudeBot` | Anthropic | Обучение | Да, поддерживает и `Crawl-delay` | **Только обучение** | https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler (зеркало: privacy.claude.com) | 2026-09-25 | сниппет |
| `Claude-User` | Anthropic | Ответ по запросу пользователя Claude | Да, по заявлению Anthropic | **Убирает из ответов по запросу пользователя** («may reduce your site's visibility for user-directed web search») | Та же | 2026-09-25 | сниппет |
| `Claude-SearchBot` | Anthropic | Поиск: индекс для поиска Claude | Да | **Снижает видимость в поиске Claude** | Та же | 2026-09-25 | сниппет |
| `anthropic-ai` | Anthropic | Устаревший токен | Неясно (реестр) | **Почти ничего.** В сниппетах официальной страницы не упоминается | Нет. Сейчас Anthropic называет три бота (см. выше) | 2026-09-25 | реестр |
| `Amazonbot` | Amazon | Улучшение продуктов Amazon, «may be used to train Amazon AI models» | Да, плюс мета-теги: `noarchive` — не использовать для обучения | **Обучение и продукты Amazon.** Поиск в Alexa относится к другому боту | https://developer.amazon.com/amazonbot | 2026-09-25 | сниппет |
| `Amzn-SearchBot` | Amazon | Поиск в продуктах Amazon (Alexa и др.), не для обучения | Да. Если не упомянут, следует правилам для других поисковых ботов | **Убирает из поисковых ответов Alexa** | https://developer.amazon.com/amazonbot | 2026-09-25 | сниппет |
| `Amzn-User` | Amazon | Ответ по запросу пользователя Alexa, не для обучения | «May not follow all robots.txt directives» | **Почти ничего** | https://developer.amazon.com/amazonbot | 2026-09-25 | сниппет |
| `Applebot` | Apple | Поиск: Siri, Spotlight, Safari. Собранное «may be used to train» модели Apple | Да | **Убирает из поиска Apple и ответов Siri** | https://support.apple.com/en-us/119829 | 2026-09-25 | сниппет |
| `Applebot-Extended` | Apple | Токен запрета обучения, сам сайт не обходит | Да | **Только обучение.** Страницы остаются в поиске Apple | https://support.apple.com/en-us/119829 | 2026-09-25 | сниппет |
| `CCBot` | Common Crawl (некоммерческий фонд) | Обучение, косвенно: открытый архив веба, на котором обучают многие модели | Да | **Только обучение**, и только в будущих срезах. Уже собранные срезы остаются (вывод) | https://commoncrawl.org/ccbot ; https://commoncrawl.org/faq | 2026-09-25 | сниппет |
| `Meta-ExternalAgent` | Meta | Обучение и «improving products by indexing content directly» | Да | **В основном обучение.** Может ли запрет убрать сайт из ответов Meta AI, не описано | https://developers.facebook.com/documentation/sharing/webmasters/web-crawlers | 2026-09-25 | сниппет |
| `Meta-ExternalFetcher` | Meta | Ответ по запросу пользователя | «May bypass robots.txt» | **Почти ничего** | Та же | 2026-09-25 | сниппет |
| `Bytespider` | ByteDance | Обучение (по реестру) | По реестру нет. Независимые разборы логов тоже говорят, что бот обходит запрещённые URL | **Почти ничего.** Остаётся только блокировка на сервере или CDN | Официального нет | 2026-09-25 | реестр |
| `DeepSeekBot` | DeepSeek | Обучение (по реестру) | По реестру нет | **Почти ничего / неизвестно** | Официального не нашёл. UA ссылается на deepseek.com/bot, но страницу я не видел | 2026-09-25 | реестр |
| `MistralAI-User` | Mistral | Ответ по запросу пользователя в Le Chat (теперь Vibe), не для обучения | Да: токен «governs which sites these user requests can be made to» | **Убирает из ответов с открытием страниц** | https://docs.mistral.ai/robots | 2026-09-25 | сниппет |
| `MistralAI-Index` | Mistral | Поиск: индекс для ответов Vibe | Да | **Убирает из поиска Mistral** | https://docs.mistral.ai/robots | 2026-09-25 | сниппет |
| `MistralAI-Training` | Mistral | Обучение | Да | **Только обучение** | https://docs.mistral.ai/robots | 2026-09-25 | сниппет |
| `cohere-ai` | Cohere | По реестру ответ по запросу пользователя | Неясно | **Почти ничего.** Cohere пишет, что сейчас не использует ботов для сбора обучающих данных | https://docs.cohere.com/docs/cohere-web-crawlers (о `cohere-ai` там ничего нет) | 2026-09-25 | сниппет + реестр |
| `cohere-training-data-crawler` | Cohere (по реестру) | Обучение (по реестру) | Неясно | Неясно: официальная страница Cohere этому противоречит | Та же | 2026-09-25 | реестр, спорно |
| `DuckAssistBot` | DuckDuckGo | Ответ: DuckAssist (ИИ-ответы со ссылками), не для обучения | Да, изменения учитываются через 72 часа | **Убирает из ИИ-ответов DuckDuckGo**, органику не трогает | https://duckduckgo.com/duckduckgo-help-pages/results/duckassistbot | 2026-09-25 | сниппет |
| `YouBot` | You.com | Поиск и LLM You.com | По реестру да | **Убирает из You.com** (по реестру) | Реестр ссылается на https://about.you.com/youbot/, но в выдаче официальной страницы не нашёл | 2026-09-25 | реестр |
| GigaChat / Сбер | Сбер | В API GigaChat есть `web_search` и `url_content_extraction`. Чей индекс, не раскрыто | — | **Управлять через robots.txt нечем**: краулер с именем не задокументирован | Официального документа о краулере нет. SDK: https://github.com/ai-forever/gigachat | 2026-09-25 | реестр (нет записей) |
| `Mail.RU_Bot` | VK (Mail.ru) | Поиск Mail.ru. Связь с ИИ-ответами не найдена | Справка Mail.ru о robots.txt есть | Для ИИ-ответов, по имеющимся данным, ничего | https://help.mail.ru/webmaster/indexing/robots.txt/rules/user-agent | 2026-09-25 | сниппет |
| VK: `VKRobot`, `vkShare` | VK | Превью ссылок и служебные запросы, не ИИ | — | Для ИИ-ответов ничего | Официального описания ИИ-краулера VK нет | 2026-09-25 | реестр |
| `Google-CloudVertexBot` | Google | Обходит сайт по запросу его владельца для агентов Vertex AI | Да | Ничего для публичных ответов | https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers | 2026-09-25 | реестр |
| `PetalBot` | Huawei | Поиск и ИИ-ассистент Huawei | По реестру да | Убирает из поиска Huawei (по реестру). Для РФ несущественно | Официального не проверял | 2026-09-25 | реестр |

**Счёт.** В таблице 40 строк. Официальный источник владельца (сниппет с официального домена) подтверждён для 30. Только реестр — 8: Google-Agent, Google-CloudVertexBot, Bytespider, DeepSeekBot, cohere-training-data-crawler, YouBot, PetalBot, VKRobot/vkShare. Официального документа нет совсем — 2: GigaChat/Сбер и anthropic-ai как действующий токен. Страниц, открытых целиком, — 0: прокси их не пускает.

---

## 2. Что на самом деле делает запрет

### Запрет убирает сайт из ответов
Закрывать этих роботов нельзя, если сайт хочет попадать в ответы.
- `YandexBot` / группа `Yandex` — из всего Яндекса, включая Алису AI.
- `YandexAdditional` / `YandexAdditionalBot` — из Алисы AI и быстрых ответов, поиск остаётся.
- `Googlebot` — из Google Поиска, AI Overviews и AI Mode.
- `bingbot` — из Bing и Copilot. Для ChatGPT, вероятно, тоже ослабляет, раз OpenAI использует сторонних поисковых провайдеров.
- `OAI-SearchBot` — из ChatGPT search. Голая ссылка при этом может остаться.
- `PerplexityBot`, `Claude-SearchBot`, `Claude-User`, `Applebot`, `Amzn-SearchBot`, `DuckAssistBot`, `MistralAI-Index`, `MistralAI-User`, `YouBot` (по реестру).

### Запрет убирает только из обучения
Попадание в поисковые ответы не страдает. Но модель, которая отвечает без поиска, будет знать о сайте меньше.
- `GPTBot`, `ClaudeBot`, `Applebot-Extended`, `CCBot`, `MistralAI-Training`.
- `Google-Extended` — оговорка: Google пишет не только про обучение, но и про grounding в некоторых системах, то есть это может задеть ответы Gemini-приложения. На Поиск и AI Overviews не влияет.
- `Amazonbot` — обучение и «улучшение продуктов». Поиск Alexa идёт через `Amzn-SearchBot`.
- `Meta-ExternalAgent` — оговорка: Meta пишет и про обучение, и про «индексирование для продуктов».

### Запрет почти ничего не делает
- Ответные агенты, которые официально могут игнорировать robots.txt: `Perplexity-User`, `Meta-ExternalFetcher`, `Amzn-User`. `ChatGPT-User` — спорно, см. таблицу.
- Роботы, которые по реестру не соблюдают robots.txt: `Bytespider`, `DeepSeekBot`.
- Устаревшие или неактуальные токены: `anthropic-ai`, `GoogleOther`, `cohere-ai`.
- Для органических ответов: `OAI-AdsBot`.
- GigaChat: закрывать нечего, имя робота неизвестно.

Если кого-то из этой группы нужно отсечь всерьёз, это делается на сервере или в WAF по UA и опубликованным IP-диапазонам, а не в robots.txt.

---

## 3. robots.txt для малого бизнеса, который хочет попадать в ответы

### Как роботы читают файл (коротко)
- Каждый робот выбирает **одну** группу: с точным своим именем, а если такой нет — `*`. У роботов Яндекса порядок такой: своя группа, затем `User-agent: Yandex`, затем `*`. Если для робота есть своя группа, группу `*` он **не читает вообще**. Это подтверждено справкой Яндекса (сниппет); у Google то же по RFC 9309.
- Отсюда главная ловушка. Кто-то добавляет `User-agent: OAI-SearchBot` + `Allow: /`, чтобы «пустить ИИ», — и этот бот перестаёт видеть `Disallow: /admin/` из группы `*`. Поэтому тех, кого пускаем, я **отдельной группой не пишу**: они живут в `*`. Отдельные группы нужны только для тех, кого закрываем.
- Внутри группы побеждает самое длинное совпадение пути. При равной длине Яндекс выбирает `Allow`.

### Базовый вариант: пускать всех поисковых и ответных роботов

```
# robots.txt — example.ru — версия 2026-09-25
# Все поисковые и ИИ-роботы, которых здесь не видно, читают группу "*".
# Отдельные группы для OAI-SearchBot, YandexAdditional и других поисковых роботов
# НЕ добавляю: иначе они перестанут читать запреты ниже.

User-agent: *
# Служебное: не нужно ни людям, ни ИИ
Disallow: /admin/
Disallow: /bitrix/admin/
Disallow: /cart/
Disallow: /personal/
# Внутренний поиск и сортировки плодят дубли
Disallow: /search/
Disallow: /*?sort=
Disallow: /*&sort=
# CSS, JS и картинки НЕ закрываю: без них робот не видит страницу так же, как человек

# Для Яндекса: не считать разными страницами URL, которые отличаются только метками.
# Другие роботы эту строку пропускают. Результат проверить в «Анализе robots.txt».
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid&fbclid

Sitemap: https://example.ru/sitemap.xml
```

Пути `/bitrix/admin/`, `/cart/` и подобные — пример. Их нужно заменить на реальные разделы сайта, а лишнее удалить.

**Про Clean-param.** Справка Яндекса описывает директиву так: не учитывать незначащие GET-параметры, чтобы робот не обходил дубли (сниппет, https://yandex.com/support/webmaster/en/robot-workings/clean-param). По памяти, в справке она названа межсекционной, то есть работает из любого места файла. Это я не перепроверял, поэтому после выкладки смотрю в «Анализе robots.txt», что строка распознана без ошибок. Google неизвестные строки игнорирует; в отчёте robots.txt Search Console она может показаться как предупреждение, на правила это не влияет.

### Дополнительный блок: закрыть обучение, но остаться в ответах

Добавляется **после** базового блока. У каждого закрываемого робота своя группа, поэтому на `*` он уже не смотрит, и ничего дублировать не нужно: `Disallow: /` и так закрывает всё.

```
# ===== Опционально: не отдавать тексты на обучение моделей =====
# На ответы ChatGPT search, Perplexity, Claude, Google AI Overviews и Алисы AI не влияет:
# за них отвечают другие роботы (они в группе "*").

User-agent: GPTBot               # OpenAI, обучение
User-agent: ClaudeBot            # Anthropic, обучение (поиск Claude — Claude-SearchBot, он открыт)
User-agent: Applebot-Extended    # Apple, обучение (поиск Apple — Applebot, он открыт)
User-agent: CCBot                # Common Crawl — открытый архив, на нём учат многие модели
User-agent: MistralAI-Training   # Mistral, обучение
User-agent: Meta-ExternalAgent   # Meta, обучение (+ «индексирование для продуктов» — см. ниже)
User-agent: Bytespider           # ByteDance: по реестру robots.txt не соблюдает, строка «для порядка»
User-agent: DeepSeekBot          # DeepSeek: то же
Disallow: /

# Google-Extended — отдельно и осознанно (см. компромисс ниже)
# User-agent: Google-Extended
# Disallow: /
```

**Компромисс, честно.**
- **Что получаем.** Тексты, цены и кейсы с сайта не попадут в будущие обучающие наборы этих компаний, по крайней мере у тех, кто соблюдает robots.txt. Уже собранное назад не вернуть.
- **Что можем потерять.** Модель, которая отвечает «из памяти», без поиска, знает о компании меньше. Насколько это важно для локального бизнеса, никто не измерял: сколько ответов строится из памяти, а сколько из поиска, в открытых данных нет. Для запроса «где в Иркутске сделать X» ответ почти всегда идёт через поиск.
- **Серые зоны:**
  - `Google-Extended` по формулировке Google ограничивает и обучение, и grounding в некоторых системах, то есть может задеть ответы Gemini. Поэтому по умолчанию я оставляю его закомментированным.
  - `Meta-ExternalAgent` у Meta описан как «обучение и индексирование для продуктов».
  - `Amazonbot` у Amazon — «улучшение продуктов и обучение». Я его в блок не включил: для рынка РФ это несущественно.
- **Моя позиция по умолчанию.** Сайту услуг (салон, клиника, автосервис, стройка) я блок обучения не рекомендую: продаёт не текст, а услуга, а упоминание в памяти моделей скорее полезно. Если сам контент и есть продукт (статьи, курсы, авторские методики), блок включаем. Решение за владельцем, я фиксирую его в отчёте.

### Чего НЕ писать

| Не писать | Почему | Источник |
|---|---|---|
| `User-agent: *` + `Disallow: /` (часто остаётся с тестового сервера) | Закрывает всех, включая Googlebot, YandexBot и поисковых ИИ-роботов | Логика протокола |
| `User-agent: YandexAdditional` + `Disallow: /` «на всякий случай» | Сайт уходит из Алисы AI и быстрых ответов за 2–14 дней | yandex.ru/support/webmaster/ru/search-appearance/fast.html (сниппет) |
| Отдельную группу `Allow: /` для пускаемого бота без копии запретов | Бот перестаёт читать `*` и пойдёт в `/admin/`, `/cart/`, дубли | Справка Яндекса о User-agent (сниппет), RFC 9309 |
| `Crawl-delay` для Яндекса | Не учитывается с 22.02.2018. Скорость обхода задаётся в Вебмастере («Скорость обхода»). Google `Crawl-delay` тоже не поддерживает (память). Учитывает его, например, ClaudeBot | yandex.ru/support/webmaster/ru/robot-workings/crawl-delay.html ; webmaster.yandex.ru/blog/skorost-obkhoda-ili-ob-izmeneniyakh-v-uchete-direktivy-crawl-delay (сниппет) ; support.claude.com/…/8896518 (сниппет) |
| `Host:` | Яндекс отказался от директивы в 2018 году, главное зеркало задаётся 301-редиректом (память, не перепроверял) | — |
| `Noindex:` внутри robots.txt | Google её не поддерживает (память). Для запрета индексации нужен мета-тег или X-Robots-Tag | — |
| Закрыть страницу в robots.txt и одновременно поставить на ней `noindex` / `nosnippet` | Робот не зайдёт на страницу и мета-тег не прочитает | developers.google.com/search/docs/crawling-indexing/robots-meta-tag (сниппет) |
| Запрет `/*.css`, `/*.js`, `/upload/`, `/images/` | Робот не отрисует страницу. Картинки нужны для поиска по картинкам | Общая практика |
| Пустой `Allow:` как «запрет всего» | Яндекс перестал так его толковать: теперь он ничего не означает | webmaster.yandex.ru/blog/izmeneniya-v-obrabotke-robots-txt (сниппет) |
| Блокировать Anthropic по IP вместо robots.txt | Anthropic пишет, что так отказ может работать ненадёжно: бот не прочитает robots.txt | support.claude.com/…/8896518 (сниппет) |

---

## 4. Чек-лист проверки за 10 минут

Подставьте свой домен и одну ключевую страницу (услуга или цены). Команды проверены на тестовом локальном сервере 2026-09-25: bash, curl, grep, python3.

```bash
S=https://example.ru          # домен без слэша в конце
P=/uslugi/remont/             # ключевая страница
```

### 4.1. robots.txt существует и отдаётся с кодом 200 (1 мин)

```bash
curl -sS -o /dev/null -w '%{http_code} %{content_type} %{size_download}B\n' "$S/robots.txt"
curl -sS "$S/robots.txt" | grep -inE '^\s*(user-agent|disallow|allow|sitemap|clean-param|crawl-delay|host)\s*:'
```
- Норма: `200 text/plain`. Код 404 тоже допустим: значит, ограничений нет.
- Плохо: 5xx или обрыв. По справке Google, если нет ни валидного файла, ни 404, Google замедляет или останавливает обход сайта (https://support.google.com/webmasters/answer/6062598, сниппет).
- Плохо: вместо файла отдаётся HTML-страница, например заглушка CMS или «проверка браузера» от CDN.

### 4.2. Какая группа действует для каждого робота (2 мин)

Глазами это легко пропустить, поэтому я использую скрипт. Он выбирает группу по RFC 9309 (для Яндекса: своя группа → `Yandex` → `*`) и проверяет путь по правилу самого длинного совпадения.

```python
#!/usr/bin/env python3
"""Какая группа robots.txt действует для каждого робота и открыт ли путь.
Логика по RFC 9309: берётся группа с точным именем робота (без учёта регистра),
иначе группа '*'; одинаковые группы склеиваются; внутри - самое длинное совпадение,
при равенстве - Allow. Поддержаны * и $. Запуск:
python3 robots_check.py https://example.ru/robots.txt /uslugi/
"""
import re, sys, urllib.request

BOTS = ["YandexBot", "YandexAdditional", "YandexAdditionalBot", "Googlebot",
        "Google-Extended", "Bingbot", "OAI-SearchBot", "GPTBot", "ChatGPT-User",
        "PerplexityBot", "Claude-SearchBot", "Claude-User", "ClaudeBot",
        "Applebot", "Applebot-Extended", "Amzn-SearchBot", "DuckAssistBot",
        "MistralAI-Index", "MistralAI-User", "CCBot", "Meta-ExternalAgent"]
# Роботы Яндекса сначала ищут свою группу, потом группу "Yandex", потом "*"
YANDEX = {"yandexbot", "yandexadditional", "yandexadditionalbot"}

def parse(text):
    groups, agents, last_ua = {}, [], False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if ":" not in line:
            continue
        key, val = [x.strip() for x in line.split(":", 1)]
        key = key.lower()
        if key == "user-agent":
            if not last_ua:          # новая группа начинается после правил
                agents = []
            agents.append(val.lower())
            groups.setdefault(val.lower(), [])
            last_ua = True
            continue
        last_ua = False
        if key in ("allow", "disallow"):
            for a in agents:
                groups[a].append((key, val))
    return groups

def pick(groups, bot):
    b = bot.lower()
    order = [b] + (["yandex"] if b in YANDEX else []) + ["*"]
    for name in order:
        if name in groups:
            return name, groups[name]
    return None, []

def match(pattern, path):
    if pattern == "":
        return None
    rx = "^" + re.escape(pattern).replace(r"\*", ".*")
    if rx.endswith(r"\$"):
        rx = rx[:-2] + "$"
    return re.match(rx, path)

def verdict(rules, path):
    best = ("allow", -1)
    for kind, pat in rules:
        if match(pat, path) and (len(pat) > best[1] or (len(pat) == best[1] and kind == "allow")):
            best = (kind, len(pat))
    return "ОТКРЫТО" if best[0] == "allow" else "ЗАКРЫТО"

if __name__ == "__main__":
    url, path = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "/")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 robots-check"})
    text = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "replace")
    groups = parse(text)
    for bot in BOTS:
        name, rules = pick(groups, bot)
        print(f"{bot:22} группа: {name or 'нет (всё открыто)':22} {path}: {verdict(rules, path)}")
```

```bash
python3 robots_check.py "$S/robots.txt" "$P"
```
- Норма: все поисковые и ответные роботы показывают `ОТКРЫТО`. `ЗАКРЫТО` допустимо только у обучающих, и только если владелец так решил.
- Скрипт — черновая проверка. Решающий ответ дают инструменты самих поисковиков:
  - **Яндекс Вебмастер → Инструменты → «Анализ robots.txt»** (https://webmaster.yandex.ru/tools/robotstxt/). Показывает ошибки и позволяет проверить конкретные URL. Робота `YandexAdditional` там, по памяти, выбрать нельзя, проверка идёт для основного робота; поэтому для него смотрю скрипт.
  - **Google Search Console → Настройки → «Отчёт о файле robots.txt»**. Показывает, какие файлы Google нашёл по 20 главным хостам, когда их последний раз загружал, ошибки и предупреждения. Можно запросить повторную загрузку (https://support.google.com/webmasters/answer/6062598, сниппет). Доступ к конкретному URL проверяется через «Проверку URL».

### 4.3. Мета-теги robots и X-Robots-Tag (2 мин)

```bash
# мета-теги в HTML (robots и именные: googlebot, yandex, bingbot)
curl -sSL "$S$P" | grep -ioE '<meta[^>]+name=["'"'"']?(robots|googlebot|yandex|bingbot)["'"'"' ][^>]*>'
# HTTP-заголовок (часто так закрывают PDF и целые разделы)
curl -sSIL "$S$P" | grep -i '^x-robots-tag' || echo 'X-Robots-Tag нет'
# сколько блоков исключено из сниппетов
curl -sSL "$S$P" | grep -o 'data-nosnippet' | wc -l
```

Что значит каждое значение для ИИ-ответов (по документации):

| Значение | Google (AI Overviews / AI Mode) | Яндекс (Алиса AI) | Bing / Copilot |
|---|---|---|---|
| `noindex` | Страницы нет в индексе, значит, нет и в AI-блоках | Страницы нет в Поиске, значит, нет и в источниках (вывод) | Нет в индексе. Amazon, OpenAI: `noindex` убирает и «голую ссылку» из ChatGPT |
| `nofollow` | Не переходить по ссылкам. На показ самой страницы не влияет | То же | То же |
| `nosnippet` | Сниппета нет, а значит, нет права быть ссылкой в AI Overviews / AI Mode | Влияние на Алису в справке (по сниппетам) не описано, **не проверено** | — |
| `max-snippet:N` | Ограничивает объём текста, который можно взять. `0` действует как `nosnippet` | Не проверено | Bing поддерживает (память) |
| `data-nosnippet` (атрибут блока) | Этот блок не пойдёт в сниппет и AI-ответ | Не проверено | — |
| `noarchive` | Для Google устарел: перенесён в исторический раздел | Убирает ссылку на сохранённую копию, на ответы не влияет (по справке, сниппет) | **Не в ответах Copilot и не в обучении.** У Amazon означает «не использовать для обучения» |
| `nocache` | — | — | В ответе Copilot только URL, заголовок и сниппет |
| `none` | = `noindex, nofollow` | = `noindex, nofollow` | Amazon трактует как `noindex` |

Источники: developers.google.com/search/docs/appearance/ai-features; developers.google.com/search/docs/crawling-indexing/robots-meta-tag; yandex.ru/support/webmaster/ru/controlling-robot/meta-robots; blogs.bing.com (сентябрь 2023); developer.amazon.com/amazonbot. Всё прочитано по сниппетам 2026-09-25.

- **Норма:** на ключевых страницах нет `noindex`, `none`, `nosnippet`, `max-snippet:0`, а у Bing ещё и `noarchive`.
- **Для Алисы AI** надёжный способ управления по справке один: robots.txt с `YandexAdditional`. Как мета-теги влияют на её ответы, Яндекс (по найденным сниппетам) не описывает.

### 4.4. canonical (1 мин)

```bash
curl -sSL "$S$P" | grep -ioE '<link[^>]+rel=["'"'"']?canonical["'"'"' ][^>]*>'
```
- Норма: canonical указывает на эту же страницу (тот же протокол, хост и слэш) или его нет вовсе.
- Плохо: все страницы ссылаются canonical на главную; canonical ведёт на `http://` или на тестовый домен; на странице два canonical. Тогда в индекс и в ответы попадает другой URL или вообще никакой.

### 4.5. Коды ответа и редиректы (1 мин)

```bash
for u in "$S/" "$S$P" "$S/sitemap.xml"; do
  curl -sS -o /dev/null -L -w "%{http_code} редиректов:%{num_redirects} итог:%{url_effective}  <- $u\n" "$u"
done
# главное зеркало: http и www должны вести на один адрес одним 301
curl -sS -o /dev/null -w '%{http_code} -> %{redirect_url}\n' "http://${S#https://}/"
```
- Норма: итоговый код 200, не больше одного редиректа.
- Плохо: 404/410 на ключевой странице, 5xx, цепочки из 3 и больше редиректов, 302 вместо 301 при смене зеркала.

### 4.6. WAF / CDN не режет роботов (2 мин)

```bash
for ua in \
 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)' \
 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' \
 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot' \
 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)' \
 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)' \
 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
do curl -sS -o /dev/null -L -w "%{http_code}  ${ua:0:60}\n" -A "$ua" "$S$P"; done
# какой CDN стоит перед сайтом
curl -sSI "$S/" | grep -iE '^(server|cf-ray|x-cdn|x-served-by|via):'
```
- **Как читать.**
  - Если браузерный UA получает 200, а бот 403/429/503 — сайт режет по User-Agent.
  - Если у всех 200, это **ещё не доказательство**: WAF часто проверяет IP (настоящий Googlebot приходит с IP Google, мой запрос — нет) и может пропускать поддельный UA, а настоящего бота блокировать, или наоборот.
  - Окончательно это видно только в логах сервера или в панели CDN: есть ли запросы настоящих ботов и с какими кодами.
- **Cloudflare**, если в ответе есть `server: cloudflare` / `cf-ray`:
  - **«Block AI bots»** (Security → Bots) блокирует проверенных ботов, которые собирают данные для обучения, в том числе **смешанные**, то есть работающие и на обучение, и на поиск (https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/, сниппет). Для сайта, который хочет попадать в ответы, это риск.
  - Появилась отдельная настройка «Disallow AI Training». Googlebot, Bingbot и Applebot Cloudflare относит к «Accountable» смешанным краулерам, и при этой настройке они продолжают ходить за поиском (https://blog.cloudflare.com/accountable-mixed-use-ai-crawlers/, сниппет).
  - С 15.09.2026 новым доменам предлагаются пресеты: обучение и агенты по умолчанию блокируются на страницах с рекламой, поиск разрешён. Это прочитано по сводке выдачи, точные формулировки не проверены.
  - **«Managed robots.txt»**: Cloudflare сам дописывает в robots.txt запреты для ИИ-краулеров (https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/, сниппет). Поэтому robots.txt смотрю **с боевого домена** (п. 4.1), а не из файла в CMS.
  - **AI Crawl Control**: блокировка конкретного краулера создаёт правило WAF (https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/, сниппет). Смотрю, кто заблокирован: Search, Agent или Training.
- Российские CDN и хостинги с «защитой от ботов» (DDoS-Guard, Qrator, панели хостинга) проверяю так же, по кодам и логам. Их настройки по ИИ-ботам я в этой сессии не проверял.

### 4.7. Sitemap (30 сек)

```bash
curl -sS "$S/robots.txt" | grep -i '^sitemap'
curl -sS -o /dev/null -w '%{http_code} %{content_type}\n' "$S/sitemap.xml"
curl -sS "$S/sitemap.xml" | grep -c '<loc>'
```
- Норма: sitemap указан в robots.txt, отдаёт 200 и XML, в нём есть ключевая страница: `curl -sS "$S/sitemap.xml" | grep -c "$P"` больше 0. Если sitemap — индекс, ключевая страница лежит во вложенном файле.

### 4.8. llms.txt (30 сек, справочно)

```bash
curl -sS -o /dev/null -w 'llms.txt: %{http_code}\n' "$S/llms.txt"
```
- **Статус:** это не стандарт, а предложение сообщества. Google в руководстве по оптимизации под генеративные функции пишет, что Google Search не использует llms.txt и подобные файлы: они не помогают и не вредят (https://developers.google.com/search/docs/fundamentals/ai-optimization-guide, по сниппету и пересказам SEJ и SER). Официальных подтверждений, что его читают Яндекс, OpenAI, Perplexity или Anthropic, я не нашёл.
- **Что делаю:** в отчёт идёт как «не влияет, делать не обязательно». Если файл есть, проверяю только одно: он не противоречит robots.txt и не раскрывает закрытые разделы.

### 4.9. Сверка с кабинетами (если есть доступ)
- Яндекс Вебмастер: «Анализ robots.txt», «Проверка URL» (страница в поиске?), «Эффективность → Видимость сайта в Алисе AI» (с 07.04.2026).
- Google Search Console: отчёт о robots.txt, «Проверка URL», «Индексирование страниц».
- Bing Webmaster Tools: отчёт AI Performance (публичная превью-версия с февраля 2026, https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview, сниппет).

---

## 5. Отчёт клиенту по нулевому шагу

### Шаблон

Шапка: сайт, дата проверки, что проверялось (главная и N ключевых страниц), кто проверял. Одна фраза о смысле шага: «Этот шаг проверяет только одно: могут ли поисковые и ИИ-роботы прочитать сайт. Сам по себе он не приводит сайт в ответы, но без него остальная работа бесполезна».

| № | Проверка | Статус | Что это значит | Что сделать | Кто / срок |
|---|---|---|---|---|---|
| 1 | robots.txt отдаётся (код, формат) | ✅ / ⚠️ / ❌ | | | |
| 2 | Яндекс: YandexBot и YandexAdditional открыты | | | | |
| 3 | Google: Googlebot открыт; Google-Extended — по решению владельца | | | | |
| 4 | Bing (Copilot, источник для ChatGPT) открыт | | | | |
| 5 | Поисковые ИИ-роботы: OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot | | | | |
| 6 | Обучающие роботы: решение владельца зафиксировано | | | | |
| 7 | Мета-теги / X-Robots-Tag на ключевых страницах | | | | |
| 8 | canonical | | | | |
| 9 | Коды ответа и редиректы | | | | |
| 10 | WAF / CDN не блокирует роботов | | | | |
| 11 | Sitemap | | | | |
| 12 | llms.txt (справочно) | | | | |

Статусы: ✅ — в порядке; ⚠️ — не мешает сейчас, но стоит поправить; ❌ — мешает попаданию в поиск или ответы.

В конце отчёта всегда два абзаца:
- **Что этот шаг не даёт:** «Исправления снимают технические препятствия. Попадёт ли сайт в ответы, дальше зависит от позиций в поиске, содержания страниц и данных о компании на других площадках. Это следующие шаги».
- **Что осталось непроверенным:** например, нет доступа к логам или к панели CDN.

### Пример: условный сайт «Ремонт квартир в Иркутске», remont-irk.example

**Проверено 2026-09-25:** главная, `/ceny/`, `/uslugi/remont-vannoy/`. Доступ был к Яндекс Вебмастеру, доступа к логам сервера не было.

| № | Проверка | Статус | Что это значит | Что сделать | Кто / срок |
|---|---|---|---|---|---|
| 1 | robots.txt отдаётся | ✅ | Файл на месте, код 200, текстовый формат | — | — |
| 2 | Яндекс: YandexBot и YandexAdditional | ❌ | В robots.txt есть строки `User-agent: YandexAdditional` / `Disallow: /`. По справке Яндекса такая запись запрещает использовать сайт как источник для Алисы AI и быстрых ответов. Сайт при этом остаётся в обычном поиске. Скорее всего, строку добавили вместе с шаблоном «закрыть всех ИИ-ботов» | Удалить эти две строки. Проверить файл в Вебмастере → «Анализ robots.txt». Яндекс учитывает изменения за 2–14 дней | Разработчик, 1 день |
| 3 | Google | ✅ | Googlebot открыт. Google-Extended закрыт — это решение владельца, на Google Поиск и AI Overviews оно не влияет | — | — |
| 4 | Bing | ✅ | Открыт | — | — |
| 5 | Поисковые ИИ-роботы | ⚠️ | Для `OAI-SearchBot` добавлена отдельная группа `Allow: /`. Из-за этого бот не читает общие запреты и может ходить в `/admin/` и по страницам сортировки. На попадание в ответы это не мешает, но плодит дубли | Удалить отдельную группу: бот и так открыт общей группой `*` | Разработчик, вместе с п. 2 |
| 6 | Обучающие роботы | ✅ | Закрыты GPTBot, CCBot, Google-Extended — так решил владелец. На ответы ChatGPT search, Perplexity и Алисы это не влияет. Модели, которые отвечают без поиска, будут знать о компании меньше, насколько — никто не измерял | Оставить как есть. Пересмотреть решение через полгода | Владелец |
| 7 | Мета-теги / X-Robots-Tag | ❌ | На странице `/ceny/` стоит `<meta name="robots" content="noindex, follow">`. Страницы с ценами нет в индексе Яндекса и Google, поэтому на вопрос «сколько стоит» ни поиск, ни ИИ её показать не могут. Вероятно, метку поставили на время обновления прайса и забыли снять | Убрать `noindex` с `/ceny/`. Отправить страницу на переобход: Вебмастер → «Переобход страниц», GSC → «Проверка URL» | Разработчик, 1 день |
| 8 | canonical | ✅ | Каждая страница ссылается на себя | — | — |
| 9 | Коды ответа | ⚠️ | `http://` → `https://www.` → `https://` — два редиректа подряд. Работает, но лишний шаг | Настроить один 301 сразу на итоговый адрес | Разработчик, при случае |
| 10 | WAF / CDN | ⚠️ | Сайт за Cloudflare. С UA поисковых ботов мой запрос получил 200, но это не доказывает, что настоящие боты проходят. Доступа к панели Cloudflare не было | Владельцу или разработчику открыть Security → Bots и AI Crawl Control и прислать скриншот. Главное — выключена ли «Block AI bots» и не заблокирована ли категория Search | Владелец, 1 неделя |
| 11 | Sitemap | ✅ | Указан в robots.txt, 214 адресов, ключевые страницы есть | — | — |
| 12 | llms.txt | — | Файла нет. Google пишет, что не использует такие файлы. Подтверждений, что его читают другие системы, я не нашёл | Не требуется | — |

**Итог простыми словами.** Нашёл две вещи, которые мешают прямо сейчас:
- строка в robots.txt, которая запрещает Яндексу брать сайт в ответы Алисы;
- метка `noindex` на странице цен.

Обе исправляются за день. После этого сайт снова *может* попадать в ответы Алисы и в поиск по ценам. Попадёт ли он туда, зависит от следующих шагов: позиции, содержание страниц, данные в картах и на агрегаторах. Одну вещь проверить не смог — настройки Cloudflare: нужен доступ или скриншот.

---

## Спорные места и что перепроверить при доступе к страницам

1. **`ChatGPT-User` и robots.txt.** Реестр пишет «соблюдает». По памяти, OpenAI пишет, что для действий пользователя robots.txt может не применяться. В сниппетах этой сессии подтверждения нет.
2. **`YandexAdditional`.** Это отдельный робот или только токен? Влияет ли запрет на обучение моделей Яндекса? Действуют ли `nosnippet` и `noarchive` на ответы Алисы? В сниппетах справки ответа нет.
3. **`Google-Extended`.** Формулировка «grounding в некоторых других системах» означает, что запрет может задеть ответы Gemini-приложения. Насколько сильно, не описано.
4. **`Clean-param`.** Действует ли он из группы `*` (межсекционность — по памяти)? Проверять в «Анализе robots.txt».
5. **Cloudflare, пресеты с 15.09.2026.** Прочитаны по сводке выдачи. Нужно открыть сам пост и документацию и проверить, что именно включено по умолчанию.
6. **Реестровые записи без официальных страниц:** Bytespider, DeepSeekBot, YouBot, cohere-training-data-crawler (здесь Cohere официально говорит обратное).
7. **GigaChat и VK.** Задокументированного ИИ-краулера нет. Что приходит на сайт при `url_content_extraction`, видно только по логам.
