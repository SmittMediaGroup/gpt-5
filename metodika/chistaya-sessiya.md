# Чистая сессия: как я убираю память и персонализацию из замера видимости бренда

Версия от 2026-09-25. Все проверки источников сделаны в этот день.

## Резюме

1. Память о прошлых диалогах (Алиса AI с 25.06.2026, GigaChat, ChatGPT) есть в **потребительских приложениях**, а не в API. Замер через API без истории от этой памяти не зависит, но состояние может появиться из-за моих же параметров: `previous_response_id`/`conversation` у OpenAI, `storage`/`thread_id` и `X-Session-ID` у GigaChat, Responses API у Yandex AI Studio.
2. Правило: один запрос — одно сообщение `user`, без истории и идентификаторов сессии. У OpenAI ставлю `store=false`, у Яндекса передаю `x-data-logging-enabled: false`, у GigaChat новый `X-Request-ID` на каждый запрос. Регион и язык фиксирую явно.
3. Для «Поиска с Алисой» открытого API нет. Ближайшая замена — Yandex Search API: генеративный ответ (`/v2/gen/search`) и выдача (`/v2/web/search`, `region=63`). Интерфейс Алисы снимаю вручную в гостевом профиле, без входа в аккаунт, с `lr=63`. Автоматизация браузера рискованна и может нарушать правила Яндекса.
4. Чистоту проверяю тремя способами: маркер-слово не должно всплыть во втором запросе, выдуманный «канареечный» бренд должен давать 0 упоминаний, а A/A-тест двух независимых прогонов должен давать разницу долей с нулём внутри 95% интервала.
5. В отчёт клиенту ставлю блок «Условия замера»: дата и время, модель и версия, эндпоинт, параметры, регион, чистая сессия, результаты контроля. Код для пяти систем лежит в `metodika/code/`, все файлы прошли `py_compile` и офлайн-проверку разбора ответов на заглушках. Реальных вызовов API я не делал.

## Источники и статус проверки

| # | Что | Где | Тип | Дата проверки |
|---|---|---|---|---|
| S1 | vc.ru: в июне 2026 Алиса и GigaChat получили память, замер видимости искажается | https://vc.ru/marketing/3008747-alisa-i-gigachat-poluchili-pamyat-i-izmenili-vidimost-brendov | сниппет поиска (страницу не открывал) | 2026-09-25 |
| S2 | Яндекс: обновление Алисы AI 25.06.2026, «запоминает важное из диалога» | https://yandex.ru/company/news/25-06-2026-03 | сниппет | 2026-09-25 |
| S3 | Память Алисы отключается в настройках, можно спросить, что она помнит | https://alice.yandex.ru/support/ru/assistant/faq, https://alice.yandex.ru/blog/2026/digest-alice-june | сниппет | 2026-09-25 |
| S4 | GigaChat (приложение): долгосрочная память в профиле Сбер ID, синхронизация веб/мобайл/Telegram, отключается в настройках | https://www.ixbt.com/news/2026/03/24/masshtabnoe-obnovlenie-sber-perevjol-iipomoshnika-gigachat-na-novuju-flagmanskuju-model-s-dolgosrochnoj-pamjatju.html | сниппет. Расхождение: по ixbt память появилась 24.03.2026, по vc.ru (S1) — в июне 2026 | 2026-09-25 |
| S5 | GigaChat SDK: `AUTH_URL`, `SCOPE`, `BASE_URL=https://api.giga.chat/v1` | github.com/ai-forever/gigachat → `src/gigachat/settings.py` (коммит efdc363, 08.09.2026) | файл репозитория | 2026-09-25 |
| S6 | GigaChat OAuth: `Authorization: Basic`, `RqUID: uuid4`, тело `scope=` | там же → `src/gigachat/api/auth.py` | файл репозитория | 2026-09-25 |
| S7 | GigaChat: заголовки `X-Session-ID`, `X-Request-ID`, `X-Client-ID`, `X-Trace-ID` и др. | там же → `src/gigachat/api/utils.py`, `README.md` («Context Variables») | файл репозитория | 2026-09-25 |
| S8 | GigaChat v2: поле `storage` (`thread_id`, `limit`); `storage=False` → поле не отправляется; `tools: web_search`; источники в `inline_data.sources` | там же → `src/gigachat/models/chat_completions.py`, `examples/chat_completions/thread_storage.py`, `examples/tools/web_search.py`, `MIGRATION_GUIDE.md` | файл репозитория | 2026-09-25 |
| S9 | GigaChat: сертификат «Russian Trusted Root CA» с gosuslugi.ru/crt, `GIGACHAT_CA_BUNDLE_FILE` | там же → `README.md`, раздел «SSL Certificates» | файл репозитория | 2026-09-25 |
| S10 | GigaChat: «опциональный X-Session-ID для кэширования контекста»; историю в API передают явно в `messages` | https://developers.sber.ru/docs/ru/gigachat/guides/keeping-context | сниппет (страница заблокирована прокси) | 2026-09-25 |
| S11 | YandexGPT: `POST /foundationModels/v1/completion`, поля `model_uri`, `completion_options`, `messages{role,text}`, **дефолт temperature 0.3** | github.com/yandex-cloud/cloudapi → `yandex/cloud/ai/foundation_models/v1/text_generation/text_generation_service.proto`, `.../v1/text_common.proto` (коммит 9286306, 17.09.2026) | файл репозитория | 2026-09-25 |
| S12 | `x-data-logging-enabled`: SDK добавляет заголовок ко всем запросам, «enable or disable logging of user data on server side… only on those parts of backends which supports this option» | github.com/yandex-cloud/yandex-cloud-ml-sdk → `src/yandex_ai_studio_sdk/_sdk.py`, `_client.py` (коммит e30f36c, 30.08.2026) | файл репозитория | 2026-09-25 |
| S13 | Документация: логирование включено по умолчанию, с `false` «запросы не сохраняются на серверах» | https://aistudio.yandex.ru/docs/ru/ai-studio/operations/disable-logging.html | сниппет | 2026-09-25 |
| S14 | Assistants/Threads/Runs удалены из SDK, миграция на Responses API | yandex-cloud-ml-sdk → `README.md` | файл репозитория | 2026-09-25 |
| S15 | Yandex Responses API: `previous_response_id`, база `https://ai.api.cloud.yandex.net/v1` | https://aistudio.yandex.ru/docs/en/ai-studio/concepts/agents/assistant-responses-migration.html | сниппет | 2026-09-25 |
| S16 | Search API: `GenSearchService` → `POST /v2/gen/search`, поля запроса и ответа (в том числе `sources[].used`, `is_answer_rejected`); **поля region нет** | cloudapi → `yandex/cloud/searchapi/v2/gen_search_service.proto` | файл репозитория | 2026-09-25 |
| S17 | Search API: `POST /v2/web/search`, `region`, `l10n`, `response_format`, `raw_data` | cloudapi → `yandex/cloud/searchapi/v2/search_service.proto`, `search_query.proto` | файл репозитория | 2026-09-25 |
| S18 | Генеративный ответ: RU/KK/UZ, только синхронно; хост `searchapi.api.cloud.yandex.net`; 5,08 ₽ за запрос; квота 10 000/мес | https://aistudio.yandex.ru/docs/ru/search-api/concepts/generative-response.html, https://aistudio.yandex.ru/docs/ru/search-api/pricing.html | сниппет | 2026-09-25 |
| S19 | Код региона Иркутска `lr=63` | https://www.rush-analytics.ru/blog/spisok-regionov-yandeksa, https://jsonseo.ru/yandex/regions | сниппет (вторичные источники) | 2026-09-25 |
| S20 | OpenAI Responses: `store` (по умолчанию true, хранение от 30 дней), `previous_response_id`, `conversation`, `include`, `temperature`, `prompt_cache_key`, `safety_identifier` | github.com/openai/openai-python v3.19.2 → `src/openai/types/responses/response_create_params.py` | файл репозитория | 2026-09-25 |
| S21 | OpenAI `web_search`: `user_location{type:"approximate",country,city,region,timezone}`, `search_context_size`, `filters` | там же → `src/openai/types/responses/web_search_tool_param.py`, `response_includable.py` | файл репозитория | 2026-09-25 |
| S22 | Chat Completions: `seed` (Beta, «Determinism is not guaranteed», смотреть `system_fingerprint`), `store` | там же → `src/openai/types/chat/completion_create_params.py` | файл репозитория | 2026-09-25 |
| S23 | Память ChatGPT недоступна через API | https://help.openai.com/en/articles/8590148-memory-faq, https://community.openai.com/t/will-memory-capabilities-come-to-the-api/934907 | сниппет (форум — вторичный источник) | 2026-09-25 |
| S24 | Perplexity Search API: `POST https://api.perplexity.ai/search`, параметры `query`, `country`, `max_results`, `search_language_filter`, …; ответ `id`, `results[{title,url,snippet,date,last_updated}]` | github.com/perplexityai/perplexity-py v0.43.5 → `api.md`, `src/perplexity/_client.py`, `src/perplexity/types/search_create_params.py`, `search_create_response.py` | файл репозитория | 2026-09-25 |
| S25 | Пользовательское соглашение Яндекса: Яндекс вправе запрещать автоматические обращения к сервисам | https://yandex.ru/legal/rules (страница заблокирована прокси) | сниппет, **дословную формулировку не проверил** | 2026-09-25 |
| S26 | Условия Yandex Search API | https://yandex.ru/legal/cloud_terms_search_api/ru/ | только заголовок в выдаче, текст не читал | 2026-09-25 |

Что не проверено: как именно ведёт себя память Алисы для гостя без входа в аккаунт; совпадает ли генеративный ответ Search API с ответом в интерфейсе «Поиска с Алисой»; действует ли `x-data-logging-enabled` на Search API; поддерживает ли конкретная модель OpenAI параметр `temperature`; хранит ли GigaChat что-то между запросами без `storage` (публичного описания нет). Живых вызовов API в этой работе я не делал: код проверен компиляцией и заглушками.

---

## 1. Почему память искажает замер

Я измеряю одно: как часто и в каком виде бренд появляется в ответе у **типичного** пользователя в Иркутске. Любое состояние, которое тянется из моих прошлых запросов, подменяет этот вопрос другим: «что система знает обо мне». Так прямо и сказано в S1: чем активнее я сам обсуждаю тему с Алисой или GigaChat, тем сильнее искажение.

Механизмы, от сильного к слабому:

| Механизм | Где встречается | Как искажает | Как устраняю |
|---|---|---|---|
| Серверная память аккаунта (факты о пользователе между диалогами) | Алиса AI (с 25.06.2026, S2–S3), GigaChat в приложении (профиль Сбер ID, S4), ChatGPT в приложении | Модель помнит, что я «владелец студии дизайна» и какие бренды я называл, и подмешивает это в ответ | В браузере: без входа в аккаунт, гостевой профиль. Через API такой памяти нет (S23; по GigaChat и Яндексу в SDK полей «памяти пользователя» я не нашёл) |
| Контекст треда или сессии, который хранит сервер | OpenAI `previous_response_id` / `conversation` (S20); GigaChat `storage.thread_id` (S8); Yandex Responses API `previous_response_id` (S15) | В запрос неявно попадают прошлые реплики, в том числе мои «наводящие» вопросы | Эти поля не передаю вообще. У GigaChat проверяю, что в ответе нет `thread_id` |
| Идентификатор сессии для кэша | GigaChat `X-Session-ID` («для кэширования контекста», S10; `README.md` SDK: «Session identifier for grouping requests», S7) | Официально это кэш токенов при одинаковой истории. На текст ответа влиять не должен, но группирует мои запросы | Не передаю. Если шлюз требует, генерирую новый UUID на каждый запрос |
| Кэш промпта | OpenAI `prompt_cache_key` (S20), GigaChat (кэш токенов, S10) | Задуман как оптимизация стоимости, а не ответа. Влияние на текст не проверено | Не передаю `prompt_cache_key`. Порядок запросов перемешиваю |
| Хранение и логирование на стороне провайдера | OpenAI `store` (по умолчанию true, S20); Yandex `x-data-logging-enabled` (по умолчанию логирование включено, S13) | На текущий ответ не влияет. Но данные остаются у провайдера, и их можно поднять через API или использовать в продуктах провайдера | `store=false`, `x-data-logging-enabled: false`. Это гигиена данных, а не «обнуление памяти» |
| Персонализация по региону, IP, языку | Поиск Яндекса (`lr`), OpenAI `web_search.user_location`, Perplexity `country` | Региональная выдача сильно меняет список брендов | Фиксирую регион явно и записываю, откуда шёл запрос |
| Cookies и авторизация в браузере | «Поиск с Алисой» | История поиска, Яндекс ID, память Алисы, региональная cookie | Новый профиль или контекст на каждый запрос, без входа, с `lr=63` в URL |
| История в самом запросе | Любой API, если я сам передаю массив `messages` | Самый частый и незаметный источник искажения в моём же коде | Одно сообщение `user`. System-промпт одинаковый и без сведений обо мне, лучше вовсе без него |

Отдельно: **память в приложениях и чистый API — разные продукты.** Клиент видит Алису и GigaChat в приложении, где память включена по умолчанию. Поэтому в отчёте я пишу честно: я меряю «нового» пользователя без истории. Реальный давний пользователь может видеть другое, и в какую сторону — зависит от его собственной истории.

## 2. Как обнулять контекст по каждой из пяти систем

### 2.1 YandexGPT (Yandex AI Studio)

- **Эндпоинт:** `POST https://llm.api.cloud.yandex.net/foundationModels/v1/completion` (S11). Это синхронный completion, без состояния: вся история приходит только из поля `messages`. Использую именно его.
- **Не использую** Responses API (`https://ai.api.cloud.yandex.net/v1`, `previous_response_id`) и старые Assistants/Threads. Последние из SDK уже удалены (S14, S15). Если перейду на Responses ради веб-поиска, `previous_response_id` не передаю. Есть ли там свой аналог `store`, я не проверял.
- **Заголовки:** `Authorization: Api-Key <ключ>`, `x-data-logging-enabled: false`. Этот заголовок **отключает логирование данных запроса на серверах Yandex Cloud** (S12, S13). На «память» модели он не влияет, потому что completion и так без состояния. Он нужен как гигиена: мои промпты с названиями брендов клиента не оседают в логах. SDK оговаривает, что заголовок работает «только в тех частях бэкенда, которые его поддерживают».
- **Тело:** `modelUri = gpt://<folder>/yandexgpt/latest`, `completionOptions.stream=false`, `messages=[{"role":"user","text":…}]`.
- **Источников нет:** completion не ходит в поиск, это «память модели». Для веб-ответа Яндекса смотрю Search API (2.2).
- **Регион:** параметра нет. Если нужен контекст «я в Иркутске», добавляю его в текст промпта одинаково во всех прогонах и записываю в условия.

### 2.2 «Поиск с Алисой» (генеративный ответ Яндекс Поиска)

**Программного доступа к ответу интерфейса «Поиска с Алисой» нет** (публичного API я не нашёл, S18 описывает только Search API). Что есть:

1. **Yandex Search API, генеративный ответ:** `POST https://searchapi.api.cloud.yandex.net/v2/gen/search` (S16, S18). Ответ строит модель YandexGPT по выдаче Яндекса. Приходят `message.content`, `sources[]{url,title,used}`, `search_queries`, `is_answer_rejected`, `is_bullet_answer`. Каждый запрос без состояния: контекст задаётся только массивом `messages`, поэтому передаю одну реплику `ROLE_USER`. **Поля региона в `GenSearchRequest` нет**, есть только `search_type` (домен `SEARCH_TYPE_RU`), фильтры и `metadata`. Задать Иркутск здесь нельзя. Стоимость: 5,08 ₽ за запрос, квота 10 000 в месяц (S18, сниппет).
   Важно: это **не тот же** ответ, что видит человек в «Поиске с Алисой», совпадение я не проверял. В отчёте называю его «генеративный ответ Yandex Search API».
2. **Yandex Search API, обычная выдача:** `POST https://searchapi.api.cloud.yandex.net/v2/web/search` с `region: "63"` (Иркутск, S19), `l10n: LOCALIZATION_RU`, `responseFormat: FORMAT_XML`. Ответ приходит в `rawData` (base64 от XML). Это показатель «есть ли бренд в топе Яндекса по Иркутску», по нему я проверяю источник, откуда генеративный ответ мог бы взять бренд.
3. **Интерфейс «Поиска с Алисой» — ручной протокол** (рекомендую его, автоматизацию — только как схему):
   - отдельный профиль браузера или окно инкогнито, **без входа в Яндекс ID**, cookies пустые (новый профиль на каждую серию; между запросами закрываю окно);
   - URL вида `https://yandex.ru/search/?text=<запрос>&lr=63`: регион задан параметром, а не определяется по IP;
   - язык интерфейса русский, часовой пояс Иркутска, VPN выключен, провайдер и IP записываю (IP всё равно влияет на антибот и может влиять на регион);
   - сохраняю полный скриншот и HTML, текст генеративного блока переношу руками;
   - если появилась капча («запросы похожи на автоматические»), прогон недействителен.
   - Об условиях сервиса. По сниппету Пользовательского соглашения (S25), Яндекс вправе запрещать автоматические обращения к своим сервисам. Дословный пункт я не проверил: страница заблокирована прокси. Поэтому автоматизацию браузера (Playwright, Selenium) по yandex.ru **считаю способной нарушить условия** и включаю её только вручную, единичными запросами, по явному флагу. Официальный путь для автоматики — Search API (условия: S26, текст не читал).

### 2.3 GigaChat (API Сбера)

- **Токен:** `POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth`, заголовки `Authorization: Basic <ключ авторизации в base64>`, `RqUID: <uuid4>`, тело `scope=GIGACHAT_API_PERS` (физлица; для юрлиц `GIGACHAT_API_B2B` — предоплата или `GIGACHAT_API_CORP` — постоплата, `README.md` SDK). Ответ: `access_token`, `expires_at` (S5, S6).
- **Сертификаты:** цепочка НУЦ Минцифры. Скачиваю «Russian Trusted Root CA» с https://www.gosuslugi.ru/crt и указываю путь в `GIGACHAT_CA_BUNDLE_FILE` (или `verify=` в httpx). `verify=False` не использую (S9).
- **Хост:** в актуальном SDK по умолчанию `https://api.giga.chat/v1`, основной чат — `/v2/chat/completions` (S5, S8). Старый хост `gigachat.devices.sberbank.ru/api/v1` SDK упоминает для входа по логину и паролю и для mTLS. В коде хост вынесен в переменную окружения.
- **Чистый запрос:**
  - **не передаю** `X-Session-ID` (S7, S10). Если шлюз его требует, передаю новый UUID на каждый запрос;
  - передаю **новый `X-Request-ID`** (uuid4) на каждый запрос: он для трассировки и в журнал;
  - **не передаю поле `storage`**. С ним сервер ведёт тред (`thread_id`), и следующий запрос с тем же `thread_id` получает историю (пример `thread_storage.py`, S8). В SDK `storage=False` означает «поле не отправлять». Проверяю, что `thread_id` в ответе пустой;
  - `assistant_id` и `tools_state_id` не передаю;
  - веб-поиск: `tools: [{"web_search": {}}]`, `tool_config: {"mode": "auto"}`. Источники беру из `messages[].content[].inline_data.sources` (S8).
- **Флаг «памяти пользователя»:** в SDK отдельного флага памяти нет. Долгосрочная память (S4) живёт в приложении GigaChat, в профиле Сбер ID, и в API не выставлена (поля не нашёл). Это вывод по SDK, в документации Сбера я его не проверял.

### 2.4 ChatGPT (OpenAI API)

- **Responses API:** `POST https://api.openai.com/v1/responses`:
  - `store: false`. По умолчанию `true`, ответ хранится от 30 дней и его можно достать, а потом случайно передать как `previous_response_id` (S20);
  - **не передаю** `previous_response_id` и `conversation`: `conversation` прямо «prepends items» из беседы (S20);
  - не передаю `prompt_cache_key`, `instructions` о себе, `user`/`safety_identifier` с постоянным значением. `safety_identifier` на ответ не влияет, но это стабильный идентификатор меня, а в чистом замере он не нужен;
  - веб-поиск: `tools: [{"type": "web_search", "user_location": {"type": "approximate", "country": "RU", "city": "Иркутск", "region": "Иркутская область", "timezone": "Asia/Irkutsk"}}]` (S21). Источники беру из аннотаций `url_citation` и, через `include: ["web_search_call.action.sources"]`, полный список просмотренных источников.
- **Chat Completions:** `store: false`, в `messages` одно сообщение. `seed` есть только здесь и помечен как Beta: «Determinism is not guaranteed», сверяю `system_fingerprint` (S22).
- Память ChatGPT из приложения в API не действует (S23, сниппет и форум).
- Важно: ответ API с web_search **не равен** ответу приложения ChatGPT. У приложения свои системные инструкции, память и модель по умолчанию. В отчёте пишу «OpenAI API, модель X», а не «ChatGPT».

### 2.5 Perplexity (Search API)

- `POST https://api.perplexity.ai/search`, `Authorization: Bearer $PERPLEXITY_API_KEY` (S24).
- Полей сессии, истории или пользователя в параметрах нет. Запрос stateless по контракту (S24).
- Фиксирую: `country: "RU"`, `search_language_filter: ["ru"]`, `max_results` (1–20, по сниппету документации), без `search_recency_filter`, если он не нужен задаче.
- Это **поисковая выдача, а не генеративный ответ** Perplexity: генеративного ответа Sonar у меня нет, он платный. В отчёте называю «Perplexity Search API: наличие бренда в выдаче» и с генеративными системами напрямую не сравниваю.

### 2.6 Что сбрасываю между прогонами

- Новый HTTP-клиент (новое соединение) на каждый запрос или хотя бы на прогон. Постоянных пользовательских идентификаторов не шлю.
- Порядок промптов внутри прогона перемешиваю случайно и записываю seed перемешивания. Так кэш и прогрев не влияют систематически.
- Токены GigaChat живут около 30 минут, перевыпуск на ответ не влияет. `RqUID` новый на каждый запрос токена.
- В браузере: новый контекст или профиль на каждый запрос, после серии удаляю каталог профиля.
- Промпты и модель фиксирую по хэшу (`prompt_sha`) и по полю `model`/`modelVersion` из ответа.

### 2.7 Temperature и seed

- **Для замера «как видит пользователь» оставляю дефолтную температуру** (параметр не передаю). Пользователь в приложении не выбирает температуру. Если занизить её до 0, я получу самый вероятный ответ, и доля упоминаний окажется завышенной для «сильных» брендов и заниженной для «хвоста». Дефолт у YandexGPT — 0.3 (из proto, S11). У OpenAI и GigaChat дефолт в SDK явно не указан, значит, его определяет сервер (не проверено).
- Разброс ответов при дефолтной температуре нормален. Поэтому каждый промпт повторяю N раз (у меня N ≥ 3) и считаю **долю** упоминаний с доверительным интервалом, а не «да/нет».
- **Для отладки и воспроизводимости** (например, если клиент спорит о конкретном ответе): `temperature=0`, а у OpenAI Chat Completions ещё и `seed` с записью `system_fingerprint`. Такой прогон помечаю в отчёте как «технический», в метрику видимости он не идёт. Полного детерминизма не обещает ни один провайдер (S22).

## 3. Контроль: как проверить, что память не влияет

1. **Маркер-слово (обязательно на каждом прогоне).** В начале прогона отправляю отдельный запрос «Запомни: моя любимая студия — «КвазарA1B2C3»» с выдуманным словом. Затем в самом конце прогона отдельным чистым запросом спрашиваю «Какую студию я люблю?». Маркер не должен появиться. Если появился, значит, где-то сохраняется состояние, и прогон бракуется (`control_checks.marker_test`).
2. **Вопрос о прошлом.** «Что я спрашивал у тебя раньше?» Ожидаю «не знаю / нет истории». Если модель перечисляет реальные темы прогона, это утечка. Галлюцинацию о прошлом, без совпадения с реальными темами, утечкой не считаю, но записываю.
3. **Канареечный бренд.** Придумываю несуществующую студию (уникальное название, которого нет в интернете) и один раз «продвигаю» её в прогоне-засеве с того же ключа. Затем в основном прогоне она должна давать **0 упоминаний** во всех ответах (`canary_mentions`).
4. **A/A-тест (раз в месяц и после любой смены кода или модели).** Два независимых прогона одного набора промптов в чистых сессиях, с разными ключами или клиентами, в один день. Для каждого бренда считаю долю упоминаний p1 и p2 и 95% интервал разницы (Ньюкомб/Уилсон, `aa_test`). Критерий: ноль внутри интервала у ≥ 95% брендов. Если нет, значит, либо слишком мало повторов, либо влияет состояние.
5. **Контроль «грязного» профиля (разово, для отчёта клиенту).** Тот же набор в приложении под моим аккаунтом, с включённой памятью. Разницу с чистым прогоном показываю как иллюстрацию того, что даёт память (S1).

## 4. Блок «Условия замера» для отчёта клиенту

```text
УСЛОВИЯ ЗАМЕРА
Дата и время прогона:    2026-__-__, __:__–__:__ (Asia/Irkutsk, UTC+8)
Идентификатор прогона:   run_____ (журнал runs.jsonl, хэш набора промптов: ________)
Набор промптов:          __ промптов × __ повторов, порядок перемешан (seed ____)

Система               | Эндпоинт / способ                               | Модель (из ответа)   | Параметры                                   | Регион / язык          | Чистая сессия
YandexGPT             | llm.api.cloud.yandex.net/foundationModels/v1/completion | yandexgpt/__ (modelVersion ____) | temperature=дефолт (0.3), x-data-logging-enabled=false | в промпте: Иркутск / ru | да (stateless)
Поиск Яндекса (ген.)  | searchapi.api.cloud.yandex.net/v2/gen/search    | —                    | searchType=RU, fixMisspell=false             | регион не задаётся API / ru | да (1 реплика)
Поиск Яндекса (выдача)| searchapi.api.cloud.yandex.net/v2/web/search    | —                    | region=63, l10n=RU                           | Иркутск (lr=63) / ru   | да
Поиск с Алисой (UI)   | yandex.ru/search/?lr=63, ручной снимок          | —                    | гость, без входа, новый профиль              | Иркутск (lr=63), IP: ____ | да / нет
GigaChat              | api.giga.chat/v2/chat/completions               | GigaChat-__          | web_search=auto, storage не передан, без X-Session-ID | в промпте / ru    | да (thread_id пуст)
OpenAI API            | api.openai.com/v1/responses                     | ______               | store=false, web_search, без previous_response_id | user_location: Иркутск, RU | да
Perplexity Search API | api.perplexity.ai/search                        | —                    | country=RU, lang=ru, max_results=__          | RU / ru                | да (stateless)

Контроль памяти:
  маркер-слово:          не всплыл в __ из __ систем (где всплыл: ____)
  «что я спрашивал»:     утечек нет / есть в ____
  канареечный бренд:     0 упоминаний из ___ ответов
  A/A-тест (дата ____):  0 внутри 95% ДИ у __% брендов
Ограничения:             приложения с памятью (Алиса, GigaChat, ChatGPT) у давних пользователей могут
                         показывать иначе; генеративный ответ Search API ≠ ответ «Поиска с Алисой»;
                         Perplexity — только выдача, не генеративный ответ.
Ответственный:           ________
```

## 5. Код

Все файлы лежат в `metodika/code/`. Зависимость — только `httpx`; для браузерной схемы ещё `playwright`. Ключи берутся из переменных окружения: `YC_API_KEY`, `YC_FOLDER_ID`, `GIGACHAT_CREDENTIALS`, `GIGACHAT_SCOPE`, `GIGACHAT_CA_BUNDLE_FILE`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `PERPLEXITY_API_KEY`. Каждый вызов дописывает строку в `runs.jsonl` (путь задаётся `VIS_LOG_PATH`). Ключи и токены в журнал не пишутся. Проверка: `python3 -m py_compile` для всех файлов проходит; разбор ответов проверен на заглушках (httpx 0.28), живых вызовов не было.

### 5.0 Общие утилиты — `code/common.py`

```python
"""Общие утилиты для «чистых» замеров: ретраи, таймауты, журнал условий замера.

Ключи берутся только из переменных окружения. В журнал ключи и токены не пишутся.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import pathlib
import time
import uuid
from typing import Any, Dict, Optional

import httpx

DEFAULT_TIMEOUT = httpx.Timeout(connect=10.0, read=120.0, write=30.0, pool=10.0)
RETRY_STATUSES = {429, 500, 502, 503, 504}
LOG_PATH = pathlib.Path(os.environ.get("VIS_LOG_PATH", "runs.jsonl"))


def env(name: str, default: Optional[str] = None) -> str:
    value = os.environ.get(name, default)
    if not value:
        raise RuntimeError(f"Не задана переменная окружения {name}")
    return value


def now_utc() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def new_run_id() -> str:
    return uuid.uuid4().hex


def post_with_retry(
    client: httpx.Client,
    url: str,
    *,
    attempts: int = 3,
    backoff: float = 2.0,
    **kwargs: Any,
) -> httpx.Response:
    """POST с минимальными ретраями на 429/5xx и сетевые ошибки."""
    last_exc: Optional[Exception] = None
    for attempt in range(1, attempts + 1):
        try:
            resp = client.post(url, **kwargs)
            if resp.status_code in RETRY_STATUSES and attempt < attempts:
                retry_after = resp.headers.get("Retry-After")
                delay = float(retry_after) if retry_after and retry_after.isdigit() else backoff ** attempt
                time.sleep(delay)
                continue
            resp.raise_for_status()
            return resp
        except (httpx.TransportError, httpx.TimeoutException) as exc:
            last_exc = exc
            if attempt < attempts:
                time.sleep(backoff ** attempt)
                continue
            raise
    raise RuntimeError(f"Запрос не удался: {last_exc}")


def prompt_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def log_run(record: Dict[str, Any]) -> None:
    """Дописывает строку JSONL с условиями замера и результатом."""
    record = dict(record)
    record.setdefault("logged_at_utc", now_utc())
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")
```

### 5.1 YandexGPT — `code/yandexgpt_clean.py`

```python
"""YandexGPT: один «чистый» запрос к stateless completion API (Yandex AI Studio).

Источник полей: yandex-cloud/cloudapi, файлы
yandex/cloud/ai/foundation_models/v1/text_generation/text_generation_service.proto
и yandex/cloud/ai/foundation_models/v1/text_common.proto (проверено 2026-09-25).
Заголовок x-data-logging-enabled: yandex-cloud-ml-sdk, src/yandex_ai_studio_sdk/_client.py.
"""
from __future__ import annotations

import httpx

from common import DEFAULT_TIMEOUT, env, log_run, new_run_id, now_utc, post_with_retry, prompt_hash

URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"


def ask_yandexgpt(prompt: str, temperature: float | None = None) -> dict:
    api_key = env("YC_API_KEY")
    folder_id = env("YC_FOLDER_ID")
    model = env("YANDEXGPT_MODEL", "yandexgpt/latest")
    model_uri = f"gpt://{folder_id}/{model}"

    headers = {
        "Authorization": f"Api-Key {api_key}",
        # Отключает сохранение запроса на стороне Yandex Cloud (логирование данных),
        # к памяти модели отношения не имеет: completion API и так stateless.
        "x-data-logging-enabled": "false",
        "x-client-request-id": new_run_id(),
    }
    completion_options: dict = {"stream": False, "maxTokens": "2000"}
    if temperature is not None:  # по умолчанию не передаём: дефолт сервиса 0.3 (из proto)
        completion_options["temperature"] = temperature

    body = {
        "modelUri": model_uri,
        "completionOptions": completion_options,
        # Только один user-message: никакой истории, никакого system с «памятью».
        "messages": [{"role": "user", "text": prompt}],
    }

    run_id = new_run_id()
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        resp = post_with_retry(client, URL, headers=headers, json=body)
    data = resp.json()
    result = data.get("result", data)
    alternatives = result.get("alternatives") or [{}]
    text = (alternatives[0].get("message") or {}).get("text", "")

    record = {
        "run_id": run_id,
        "system": "yandexgpt",
        "started_utc": started,
        "endpoint": URL,
        "model_uri": model_uri,
        "model_version": result.get("modelVersion"),
        "params": {"temperature": temperature, "maxTokens": 2000, "stream": False},
        "headers_sent": {"x-data-logging-enabled": "false"},
        "clean_session": True,
        "prompt_sha": prompt_hash(prompt),
        "status": alternatives[0].get("status"),
        "usage": result.get("usage"),
        "text": text,
        "sources": [],  # completion API не ходит в интернет и источников не отдаёт
    }
    log_run(record)
    return record


if __name__ == "__main__":
    print(ask_yandexgpt("Какие студии веб-дизайна в Иркутске вы знаете?")["text"])
```

### 5.2 Yandex Search API (замена «Поиску с Алисой») — `code/yandex_search_clean.py`

```python
"""«Поиск с Алисой»: ближайший программный аналог — Yandex Search API.

1) Генеративный ответ: POST /v2/gen/search (GenSearchService).
2) Обычная выдача: POST /v2/web/search (WebSearchService), регион lr=63 (Иркутск).
Поля: yandex-cloud/cloudapi, yandex/cloud/searchapi/v2/gen_search_service.proto,
search_service.proto, search_query.proto (проверено 2026-09-25).
ВАЖНО: генеративный ответ Search API — не то же самое, что ответ в интерфейсе
«Поиска с Алисой»; совпадение не проверено. В GenSearchRequest нет поля region.
"""
from __future__ import annotations

import base64
import json
import xml.etree.ElementTree as ET
from typing import Any, Dict, List

import httpx

from common import DEFAULT_TIMEOUT, env, log_run, new_run_id, now_utc, post_with_retry, prompt_hash

GEN_URL = "https://searchapi.api.cloud.yandex.net/v2/gen/search"
WEB_URL = "https://searchapi.api.cloud.yandex.net/v2/web/search"


def _headers() -> Dict[str, str]:
    return {
        "Authorization": f"Api-Key {env('YC_API_KEY')}",
        "x-data-logging-enabled": "false",  # действие для Search API не проверено
    }


def _parse_stream(raw: str) -> List[Dict[str, Any]]:
    """Ответ gen/search объявлен как stream: разбираем и массив, и NDJSON."""
    raw = raw.strip()
    chunks: List[Dict[str, Any]] = []
    try:
        parsed = json.loads(raw)
        items = parsed if isinstance(parsed, list) else [parsed]
    except json.JSONDecodeError:
        items = [json.loads(line) for line in raw.splitlines() if line.strip()]
    for item in items:
        chunks.append(item.get("result", item) if isinstance(item, dict) else {})
    return chunks


def ask_yandex_gen_search(query: str) -> dict:
    body = {
        "messages": [{"content": query, "role": "ROLE_USER"}],  # одна реплика, без истории
        "folderId": env("YC_FOLDER_ID"),
        "searchType": "SEARCH_TYPE_RU",
        "fixMisspell": False,
    }
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        resp = post_with_retry(client, GEN_URL, headers=_headers(), json=body)
    chunks = _parse_stream(resp.text)
    final = chunks[-1] if chunks else {}
    text = (final.get("message") or {}).get("content", "")
    sources = [
        {"url": s.get("url"), "title": s.get("title"), "used": s.get("used", False)}
        for s in final.get("sources", [])
    ]
    record = {
        "run_id": new_run_id(),
        "system": "yandex_search_api_gen",
        "started_utc": started,
        "endpoint": GEN_URL,
        "params": {"searchType": "SEARCH_TYPE_RU", "fixMisspell": False, "region": "нет поля в API"},
        "clean_session": True,
        "prompt_sha": prompt_hash(query),
        "is_answer_rejected": final.get("isAnswerRejected"),
        "is_bullet_answer": final.get("isBulletAnswer"),
        "search_queries": final.get("searchQueries"),
        "text": text,
        "sources": sources,
    }
    log_run(record)
    return record


def ask_yandex_web_search(query: str, region: str = "63") -> dict:
    body = {
        "query": {"searchType": "SEARCH_TYPE_RU", "queryText": query},
        "region": region,  # 63 = Иркутск (код lr)
        "l10n": "LOCALIZATION_RU",
        "folderId": env("YC_FOLDER_ID"),
        "responseFormat": "FORMAT_XML",
    }
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        resp = post_with_retry(client, WEB_URL, headers=_headers(), json=body)
    raw_b64 = resp.json().get("rawData", "")
    xml_text = base64.b64decode(raw_b64).decode("utf-8") if raw_b64 else ""
    results = []
    if xml_text:
        root = ET.fromstring(xml_text)
        for pos, doc in enumerate(root.iter("doc"), start=1):
            title_el = doc.find("title")
            results.append({
                "position": pos,
                "url": doc.findtext("url"),
                "title": "".join(title_el.itertext()) if title_el is not None else None,
            })
    record = {
        "run_id": new_run_id(),
        "system": "yandex_search_api_web",
        "started_utc": started,
        "endpoint": WEB_URL,
        "params": {"region": region, "l10n": "LOCALIZATION_RU", "searchType": "SEARCH_TYPE_RU"},
        "clean_session": True,
        "prompt_sha": prompt_hash(query),
        "text": "",
        "sources": results,
    }
    log_run(record)
    return record


if __name__ == "__main__":
    r = ask_yandex_gen_search("студия веб-дизайна Иркутск")
    print(r["text"])
    for s in r["sources"]:
        print("-", s["url"])
```

### 5.3 «Поиск с Алисой» в браузере — схема, без гарантий — `code/alisa_browser_protocol.py`

```python
"""«Поиск с Алисой» в браузере: СХЕМА фиксации чистой сессии через Playwright.

Без гарантий. Автоматизированные запросы к yandex.ru могут нарушать Пользовательское
соглашение сервисов Яндекса (yandex.ru/legal/rules) и упираются в капчу. Официальный
программный путь — Yandex Search API (yandex_search_clean.py). Запуск только
вручную, единичные запросы, по явному флагу ALLOW_BROWSER_AUTOMATION=1.
Селектор генеративного блока не проверен: сохраняем скриншот и HTML целиком,
разметку делаем руками.
"""
from __future__ import annotations

import os
import pathlib
import urllib.parse

from common import log_run, new_run_id, now_utc, prompt_hash

OUT_DIR = pathlib.Path(os.environ.get("ALISA_OUT_DIR", "alisa_captures"))


def capture_alisa(query: str, lr: str = "63") -> dict:
    if os.environ.get("ALLOW_BROWSER_AUTOMATION") != "1":
        raise RuntimeError("Выключено. Сначала прочитайте раздел про условия сервиса.")
    from playwright.sync_api import sync_playwright  # pip install playwright; playwright install chromium

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    run_id = new_run_id()
    url = "https://yandex.ru/search/?" + urllib.parse.urlencode({"text": query, "lr": lr})
    started = now_utc()
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        # Новый контекст = чистый профиль: без cookies, localStorage и входа в аккаунт.
        context = browser.new_context(
            locale="ru-RU",
            timezone_id="Asia/Irkutsk",
            viewport={"width": 1366, "height": 900},
        )
        page = context.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        page.wait_for_timeout(8_000)  # генеративный блок догружается асинхронно
        shot = OUT_DIR / f"{run_id}.png"
        html = OUT_DIR / f"{run_id}.html"
        page.screenshot(path=str(shot), full_page=True)
        html.write_text(page.content(), encoding="utf-8")
        cookies_before_close = len(context.cookies())
        final_url = page.url
        context.close()
        browser.close()

    record = {
        "run_id": run_id,
        "system": "alisa_browser",
        "started_utc": started,
        "endpoint": url,
        "final_url": final_url,  # если тут showcaptcha — прогон недействителен
        "params": {"lr": lr, "locale": "ru-RU", "timezone": "Asia/Irkutsk", "logged_in": False},
        "clean_session": True,
        "cookies_set_during_run": cookies_before_close,
        "prompt_sha": prompt_hash(query),
        "artifacts": [str(shot), str(html)],
        "text": "",  # заполняется вручную по скриншоту
        "sources": [],
    }
    log_run(record)
    return record
```

### 5.4 GigaChat — `code/gigachat_clean.py`

```python
"""GigaChat: OAuth-токен + один «чистый» запрос без серверного контекста.

Источник: ai-forever/gigachat (проверено 2026-09-25):
- src/gigachat/settings.py — AUTH_URL, SCOPE, BASE_URL (https://api.giga.chat/v1);
- src/gigachat/api/auth.py — заголовки Authorization: Basic, RqUID, тело scope=...;
- src/gigachat/api/utils.py — X-Session-ID, X-Request-ID и др. заголовки;
- src/gigachat/models/chat_completions.py — поле storage (thread_id), tools.web_search;
- README.md, раздел SSL Certificates — «Russian Trusted Root CA» с gosuslugi.ru/crt.
"""
from __future__ import annotations

import os
import time
import uuid
from typing import Any, Dict, List, Optional

import httpx

from common import DEFAULT_TIMEOUT, env, log_run, new_run_id, now_utc, post_with_retry, prompt_hash

AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
# v2-контракт; SDK сам переписывает .../v1 на .../v2/chat/completions
CHAT_URL = os.environ.get("GIGACHAT_CHAT_URL", "https://api.giga.chat/v2/chat/completions")

_token_cache: Dict[str, Any] = {"token": None, "expires_at_ms": 0}


def _verify() -> Any:
    # Путь к PEM «Russian Trusted Root CA» (НУЦ Минцифры). verify=False не используем.
    return os.environ.get("GIGACHAT_CA_BUNDLE_FILE", True)


def get_token(client: httpx.Client) -> str:
    if _token_cache["token"] and _token_cache["expires_at_ms"] - 60_000 > time.time() * 1000:
        return _token_cache["token"]
    headers = {
        "Authorization": f"Basic {env('GIGACHAT_CREDENTIALS')}",  # ключ авторизации (base64)
        "RqUID": str(uuid.uuid4()),
        "Accept": "application/json",
    }
    scope = os.environ.get("GIGACHAT_SCOPE", "GIGACHAT_API_PERS")  # или GIGACHAT_API_CORP / _B2B
    resp = post_with_retry(client, AUTH_URL, headers=headers, data={"scope": scope})
    data = resp.json()
    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at_ms"] = int(data["expires_at"])
    return _token_cache["token"]


def _message_text(msg: Dict[str, Any]) -> str:
    return "".join(part.get("text") or "" for part in msg.get("content") or [])


def _message_sources(msg: Dict[str, Any]) -> List[Dict[str, Optional[str]]]:
    seen = set()
    out: List[Dict[str, Optional[str]]] = []
    for part in msg.get("content") or []:
        inline = part.get("inline_data") or {}
        for src in (inline.get("sources") or {}).values():
            key = (src.get("url"), src.get("title"))
            if key not in seen:
                seen.add(key)
                out.append({"url": src.get("url"), "title": src.get("title")})
    return out


def ask_gigachat(prompt: str, web_search: bool = True, temperature: Optional[float] = None) -> dict:
    model = env("GIGACHAT_MODEL", "GigaChat-2")
    body: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": [{"text": prompt}]}],
        # Поле storage НЕ передаём: без него сервер не создаёт тред (thread_id).
    }
    if web_search:
        body["tools"] = [{"web_search": {}}]
        body["tool_config"] = {"mode": "auto"}
    if temperature is not None:
        body["model_options"] = {"temperature": temperature}

    request_id = str(uuid.uuid4())
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT, verify=_verify()) as client:
        token = get_token(client)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            # X-Session-ID НЕ передаём (он группирует запросы и используется для кэша контекста).
            "X-Request-ID": request_id,
        }
        resp = post_with_retry(client, CHAT_URL, headers=headers, json=body)
    data = resp.json()
    assistant = [m for m in data.get("messages", []) if m.get("role") == "assistant"] or data.get("messages", [{}])
    msg = assistant[-1] if assistant else {}

    record = {
        "run_id": new_run_id(),
        "system": "gigachat",
        "started_utc": started,
        "endpoint": CHAT_URL,
        "model_requested": model,
        "model_resolved": data.get("model"),
        "params": {"web_search": web_search, "temperature": temperature, "storage": "не передан"},
        "headers_sent": {"X-Request-ID": request_id, "X-Session-ID": None},
        "thread_id_returned": data.get("thread_id"),  # должен быть пустым в чистом режиме
        "clean_session": data.get("thread_id") in (None, ""),
        "prompt_sha": prompt_hash(prompt),
        "usage": data.get("usage"),
        "text": _message_text(msg),
        "sources": _message_sources(msg),
    }
    log_run(record)
    return record


if __name__ == "__main__":
    r = ask_gigachat("Какие студии веб-дизайна в Иркутске вы знаете?")
    print(r["text"])
    for s in r["sources"]:
        print("-", s["url"])
```

### 5.5 OpenAI — `code/openai_clean.py`

```python
"""ChatGPT через OpenAI API: Responses API + web_search, без сохранения состояния.

Источник полей: openai/openai-python v3.19.2 (проверено 2026-09-25):
src/openai/types/responses/response_create_params.py (store, previous_response_id,
conversation, include, temperature), web_search_tool_param.py (user_location),
response_includable.py ("web_search_call.action.sources"),
src/openai/types/chat/completion_create_params.py (seed, store).
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from common import DEFAULT_TIMEOUT, env, log_run, new_run_id, now_utc, post_with_retry, prompt_hash

RESPONSES_URL = "https://api.openai.com/v1/responses"
CHAT_URL = "https://api.openai.com/v1/chat/completions"


def ask_openai_responses(prompt: str, temperature: Optional[float] = None) -> dict:
    model = env("OPENAI_MODEL")
    body: Dict[str, Any] = {
        "model": model,
        "input": prompt,
        "store": False,  # не хранить ответ (по умолчанию true, хранение от 30 дней)
        # previous_response_id и conversation НЕ передаём: они подмешивают историю.
        "tools": [{
            "type": "web_search",
            "user_location": {
                "type": "approximate",
                "country": "RU",
                "city": "Иркутск",
                "region": "Иркутская область",
                "timezone": "Asia/Irkutsk",
            },
        }],
        "include": ["web_search_call.action.sources"],
    }
    if temperature is not None:  # часть reasoning-моделей temperature не принимает (не проверено по моделям)
        body["temperature"] = temperature

    headers = {"Authorization": f"Bearer {env('OPENAI_API_KEY')}"}
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        resp = post_with_retry(client, RESPONSES_URL, headers=headers, json=body)
    data = resp.json()

    texts: List[str] = []
    citations: List[Dict[str, Any]] = []
    consulted: List[str] = []
    for item in data.get("output", []):
        if item.get("type") == "message":
            for part in item.get("content", []):
                if part.get("type") == "output_text":
                    texts.append(part.get("text", ""))
                    for ann in part.get("annotations", []):
                        if ann.get("type") == "url_citation":
                            citations.append({"url": ann.get("url"), "title": ann.get("title")})
        elif item.get("type") == "web_search_call":
            for src in (item.get("action") or {}).get("sources") or []:
                if src.get("url"):
                    consulted.append(src["url"])

    record = {
        "run_id": new_run_id(),
        "system": "openai_responses",
        "started_utc": started,
        "endpoint": RESPONSES_URL,
        "model_requested": model,
        "model_resolved": data.get("model"),
        "response_id": data.get("id"),
        "params": {"store": False, "temperature": temperature, "tool": "web_search", "user_location": "Иркутск, RU"},
        "clean_session": True,
        "prompt_sha": prompt_hash(prompt),
        "usage": data.get("usage"),
        "text": "".join(texts),
        "sources": citations,
        "sources_consulted": consulted,
    }
    log_run(record)
    return record


def ask_openai_chat(prompt: str, seed: Optional[int] = None, temperature: Optional[float] = None) -> dict:
    """Chat Completions — без веб-поиска (для search-моделей параметры отличаются, не проверено)."""
    model = env("OPENAI_CHAT_MODEL", env("OPENAI_MODEL"))
    body: Dict[str, Any] = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "store": False,
    }
    if seed is not None:
        body["seed"] = seed  # Beta, детерминизм не гарантирован; смотрите system_fingerprint
    if temperature is not None:
        body["temperature"] = temperature
    headers = {"Authorization": f"Bearer {env('OPENAI_API_KEY')}"}
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        resp = post_with_retry(client, CHAT_URL, headers=headers, json=body)
    data = resp.json()
    record = {
        "run_id": new_run_id(),
        "system": "openai_chat",
        "started_utc": started,
        "endpoint": CHAT_URL,
        "model_resolved": data.get("model"),
        "system_fingerprint": data.get("system_fingerprint"),
        "params": {"store": False, "seed": seed, "temperature": temperature},
        "clean_session": True,
        "prompt_sha": prompt_hash(prompt),
        "text": data["choices"][0]["message"].get("content") or "",
        "sources": [],
    }
    log_run(record)
    return record


if __name__ == "__main__":
    r = ask_openai_responses("Какие студии веб-дизайна в Иркутске вы знаете?")
    print(r["text"])
    for s in r["sources"]:
        print("-", s["url"])
```

### 5.6 Perplexity Search API — `code/perplexity_search_clean.py`

```python
"""Perplexity Search API: stateless поисковая выдача (без генеративного ответа).

Источник: perplexityai/perplexity-py v0.43.5 (проверено 2026-09-25):
src/perplexity/_client.py (base_url https://api.perplexity.ai, PERPLEXITY_API_KEY),
src/perplexity/types/search_create_params.py, search_create_response.py; api.md: post /search.
"""
from __future__ import annotations

from typing import Any, Dict

import httpx

from common import DEFAULT_TIMEOUT, env, log_run, new_run_id, now_utc, post_with_retry, prompt_hash

URL = "https://api.perplexity.ai/search"


def ask_perplexity_search(query: str, max_results: int = 10) -> dict:
    body: Dict[str, Any] = {
        "query": query,
        "max_results": max_results,
        "country": "RU",
        "search_language_filter": ["ru"],
    }
    headers = {"Authorization": f"Bearer {env('PERPLEXITY_API_KEY')}"}
    started = now_utc()
    with httpx.Client(timeout=DEFAULT_TIMEOUT) as client:
        resp = post_with_retry(client, URL, headers=headers, json=body)
    data = resp.json()
    results = [
        {"position": i, "url": r.get("url"), "title": r.get("title"), "date": r.get("date")}
        for i, r in enumerate(data.get("results", []), start=1)
    ]
    record = {
        "run_id": new_run_id(),
        "system": "perplexity_search",
        "started_utc": started,
        "endpoint": URL,
        "search_id": data.get("id"),
        "params": {k: v for k, v in body.items() if k != "query"},
        "clean_session": True,  # у Search API нет полей сессии/истории
        "prompt_sha": prompt_hash(query),
        "text": "",
        "sources": results,
    }
    log_run(record)
    return record


if __name__ == "__main__":
    for s in ask_perplexity_search("студия веб-дизайна Иркутск")["sources"]:
        print(s["position"], s["url"])
```

### 5.7 Контрольные проверки — `code/control_checks.py`

```python
"""Контроль «памяти»: маркер-тест, вопрос о прошлых запросах, A/A-тест долей."""
from __future__ import annotations

import math
import secrets
from typing import Callable, Dict, List, Tuple

AskFn = Callable[[str], dict]  # любая ask_* из соседних модулей


def make_marker() -> str:
    """Бессмысленное слово-маркер, которого нет в интернете."""
    return "Квазар" + secrets.token_hex(3).upper()


def marker_test(ask: AskFn, marker: str) -> Dict[str, object]:
    """Шаг 1: «засеять» маркер. Шаг 2: отдельным чистым запросом проверить, всплывает ли он."""
    ask(f"Запомни, пожалуйста: моя любимая студия дизайна называется «{marker}».")
    probe = ask("Какую студию дизайна я люблю? Если не знаешь — так и скажи.")
    leaked = marker.lower() in probe.get("text", "").lower()
    return {"marker": marker, "leaked": leaked, "probe_run_id": probe.get("run_id")}


def history_probe(ask: AskFn) -> Dict[str, object]:
    probe = ask("Что я спрашивал у тебя раньше? Перечисли прошлые темы, если они тебе известны.")
    return {"probe_run_id": probe.get("run_id"), "text": probe.get("text", "")[:500]}


def canary_mentions(texts: List[str], canary: str) -> int:
    """Канареечный бренд: выдуманное название, которое не должно появляться никогда."""
    return sum(canary.lower() in t.lower() for t in texts)


def aa_test(k1: int, n1: int, k2: int, n2: int, z: float = 1.96) -> Tuple[float, float, float, bool]:
    """Разница долей двух независимых чистых прогонов и 95% ДИ (Ньюкомб, метод Уилсона).

    Возвращает (разница, нижняя граница, верхняя граница, прошёл_ли_тест).
    Тест пройден, если 0 внутри интервала.
    """
    def wilson(k: int, n: int) -> Tuple[float, float]:
        if n == 0:
            return 0.0, 1.0
        p = k / n
        denom = 1 + z * z / n
        centre = (p + z * z / (2 * n)) / denom
        half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom
        return centre - half, centre + half

    p1, p2 = k1 / n1, k2 / n2
    l1, u1 = wilson(k1, n1)
    l2, u2 = wilson(k2, n2)
    d = p1 - p2
    lower = d - math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)
    upper = d + math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)
    return d, lower, upper, lower <= 0.0 <= upper


if __name__ == "__main__":
    print(aa_test(18, 60, 23, 60))
```

## Чек-лист «перед каждым прогоном»

1. Набор промптов не менялся или получил новую версию; хэш набора записан в журнал.
2. В коде нет истории: в каждом запросе одно сообщение `user`, нет `previous_response_id`, `conversation`, `storage`, `thread_id`, `assistant_id`, `X-Session-ID`.
3. OpenAI: `store=false`; Яндекс: `x-data-logging-enabled: false`; GigaChat: новый `X-Request-ID` на каждый запрос.
4. Регион и язык заданы явно: `region=63`/`lr=63`, `user_location` Иркутск, `country=RU`, язык `ru`. Записан IP и провайдер, с которых идёт прогон.
5. Модель указана явно, а версия из ответа (`model`, `modelVersion`) пишется в журнал. Сверил с прошлым прогоном: если модель сменилась, отмечаю в отчёте.
6. Температура дефолтная (не передаётся) для метрики видимости; прогоны с `temperature=0`/`seed` помечены как технические.
7. Сгенерированы новое маркер-слово и канареечный бренд; засев стоит в начале прогона, проверка — в конце.
8. Порядок промптов перемешан, seed перемешивания записан; количество повторов N ≥ 3.
9. Для браузерного снимка Алисы: новый профиль или инкогнито, вход в Яндекс ID не выполнен, cookies пустые, в URL `lr=63`, капчи нет.
10. После прогона проверил контроль: маркер не всплыл, у канарейки 0 упоминаний, `thread_id` у GigaChat пуст. Заполнил блок «Условия замера». Если контроль не пройден, прогон в отчёт не идёт.
