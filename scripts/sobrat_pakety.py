"""Сборка трёх черновиков страниц пакетов: python3 scripts/sobrat_pakety.py (пишет пакеты/*/index.html). Витрины и демо — списки VITRINY и DEMOS3."""
import html, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / 'пакеты'

CSS = """
:root{--bg:%(bg)s;--ink:%(ink)s;--acc:%(acc)s;--acc-ink:%(accink)s;--card:%(card)s;--soft:%(soft)s;--line:%(line)s}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%%}
body{margin:0;background:var(--soft);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:inherit}
.draft{background:var(--acc);color:var(--acc-ink);font:600 13px/1.4 ui-monospace,monospace;padding:8px 16px;text-align:center}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line);background:var(--bg)}
.top b{font:700 15px ui-monospace,monospace;letter-spacing:.04em}
.top nav{display:flex;gap:14px;flex-wrap:wrap;font-size:14px}
.top nav a{text-decoration:none;border-bottom:1px solid var(--line)}
.hero{background:var(--bg);padding:48px 16px 56px}
.hero h1{font-size:clamp(2.3rem,9vw,5.4rem);line-height:.95;letter-spacing:-.02em;margin:0 0 18px;max-width:14ch}
.hero p.lead{font-size:clamp(1.05rem,3.6vw,1.35rem);max-width:38ch;margin:0 0 24px}
.chips{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 28px;padding:0;list-style:none}
.chips li{border:1.5px solid var(--ink);border-radius:999px;padding:7px 14px;font:600 15px ui-monospace,monospace}
.btn{display:inline-block;background:var(--acc);color:var(--acc-ink);text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px}
.wrap{max-width:1040px;margin:0 auto}
section{padding:40px 16px}
h2{font-size:clamp(1.5rem,5.5vw,2.4rem);line-height:1.05;margin:0 0 18px;letter-spacing:-.01em}
.grid{display:grid;gap:14px;grid-template-columns:1fr}
@media(min-width:760px){.grid.two{grid-template-columns:1fr 1fr}.grid.three{grid-template-columns:repeat(3,1fr)}}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px}
.card h3{margin:0 0 8px;font-size:1.1rem}
.card p{margin:0}
ul.list{margin:0;padding-left:20px}ul.list li{margin:4px 0}
.no{opacity:.85}
.band{background:var(--bg)}
.num{font:700 clamp(2rem,8vw,3rem)/1 ui-monospace,monospace;display:block;margin-bottom:6px}
.demo a{font-weight:700;word-break:break-all}
.tag{display:inline-block;font:600 12px ui-monospace,monospace;background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:2px 6px;margin-top:8px}
.tag.warn{background:var(--acc);color:var(--acc-ink);border-color:transparent}
details{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:0 0 10px}
summary{font-weight:700;cursor:pointer}
details p{margin:10px 0 0}
form{display:grid;gap:10px;max-width:520px}
input,textarea{font:inherit;padding:12px;border:1.5px solid var(--ink);border-radius:10px;background:var(--card);color:var(--ink);width:100%%}
label.pd{font-size:13px;display:flex;gap:8px;align-items:flex-start}
label.pd input{width:auto;margin-top:3px}
footer{padding:28px 16px;font-size:13px;border-top:1px solid var(--line);background:var(--bg)}
"""

def esc(s): return html.escape(s, quote=True)

def page(p):
    css = CSS % p['pal']
    out = [f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(p['title'])}</title>
<meta name="description" content="{esc(p['description'])}">
<meta name="robots" content="noindex,nofollow"><!-- черновик: убрать noindex при публикации -->
<style>{css}</style></head><body>
<div class="draft">ЧЕРНОВИК · ссылки на демо не проверены кодом 200 · не публиковать до проверки</div>
<header class="top"><b>SMG</b><nav><a href="#vhodit">Что входит</a><a href="#primery">Примеры</a><a href="#cena">Цена</a><a href="#faq">Вопросы</a></nav></header>
<div class="hero"><div class="wrap">
<h1>{p['h1']}</h1>
<p class="lead">{p['lead']}</p>
<ul class="chips">{''.join(f'<li>{c}</li>' for c in p['chips'])}</ul>
<a class="btn" href="#zayavka">{esc(p['cta'])}</a>
</div></div>
<section id="vhodit"><div class="wrap"><h2>Что входит и что нет</h2><div class="grid two">
<div class="card"><h3>Входит</h3><ul class="list">{''.join(f'<li>{x}</li>' for x in p['in'])}</ul></div>
<div class="card no"><h3>Не входит</h3><ul class="list">{''.join(f'<li>{x}</li>' for x in p['out'])}</ul></div>
</div></div></section>
<section class="band"><div class="wrap"><h2>{p['steps_title']}</h2><div class="grid three">
{''.join(f'<div class="card"><span class="num">{n}</span><p>{t}</p></div>' for n,t in p['steps'])}
</div></div></section>
"""]
    out.append(p['special'])
    out.append(f"""<section><div class="wrap"><h2>Три риска и как я их снимаю</h2><div class="grid three">
{''.join(f'<div class="card"><h3>{r}</h3><p>{a}</p></div>' for r,a in p['risks'])}
</div></div></section>
<section id="cena" class="band"><div class="wrap"><h2>Цена и приёмка</h2><div class="grid two">
<div class="card"><span class="num">{p['price']}</span><p>{p['price_note']}</p></div>
<div class="card"><h3>Как принимаете работу</h3><p>{p['accept']}</p></div>
</div></div></section>
<section id="faq"><div class="wrap"><h2>Вопросы</h2>
{''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in p['faq'])}
</div></section>
<section id="zayavka" class="band"><div class="wrap"><h2>Заявка</h2>
<form onsubmit="return false"><!-- черновик: отправка не подключена -->
<input name="name" placeholder="Имя" autocomplete="name">
<input name="contact" placeholder="Телефон или Telegram" autocomplete="tel">
<textarea name="task" rows="3" placeholder="{esc(p['form_hint'])}"></textarea>
<label class="pd"><input type="checkbox" required> Согласен на обработку персональных данных по <a href="#politika">политике</a> (152-ФЗ).</label>
<button class="btn" type="submit">{esc(p['cta'])}</button>
</form></div></section>
<footer><div class="wrap">SmittMediaGroup · Иркутск · <a id="politika" href="#">Политика обработки персональных данных</a> [нужно от владельца: ссылка и реквизиты оператора ПДн]</div></footer>
</body></html>
""")
    return ''.join(out)

def demo_cards(items):
    cells = []
    for name, url, seen, note in items:
        link = f'<a href="{esc(url)}" rel="noopener">{esc(url.replace("https://",""))}</a>' if url else '<span class="tag warn">[нужно: ссылка из каталога]</span>'
        tag = f'<span class="tag{" warn" if "учебн" in note or "демонстр" in note else ""}">{note}</span>' if note else ''
        cells.append(f'<div class="card demo"><h3>{name}</h3><p>{seen}</p><p>{link}</p>{tag}</div>')
    return '\n'.join(cells)

P1 = dict(
    pal=dict(bg='#FFD23F', ink='#3A1C71', acc='#FF5E5B', accink='#FFFFFF', card='#FFF6D6', soft='#FFF9E8', line='rgba(58,28,113,.25)'),
    title='Сайт специалиста за 2–3 дня — от 15 000 ₽ | SmittMediaGroup',
    description='Сайт врача, мастера, репетитора, учителя или психолога за 2–3 дня: готовая витрина, ваш домен, заявки в Telegram, Метрика, согласие по 152-ФЗ. 15 000–25 000 ₽.',
    h1='Сайт специалиста за&nbsp;2&nbsp;дня',
    lead='Для врача, мастера, репетитора, учителя, психолога, фотографа. Одна страница: кто вы, услуги и цены, отзывы, запись. Заявки приходят в Telegram.',
    chips=['15 000–25 000 ₽','2–3 дня','ваш домен','заявки в Telegram'],
    cta='Обсудить сайт',
    **{'in':['Готовая витрина под специалиста: услуги, цены, о себе, отзывы, контакты','Перенос на ваш домен; если домена нет — помогу купить (домен оплачиваете вы)','Форма заявки → сообщение в ваш Telegram','Яндекс Метрика с целью «отправлена заявка»','Согласие на обработку ПДн и политика (152-ФЗ) — шаблон под ваши данные','Базовое SEO: title, description, заголовки, карта сайта, robots.txt, Вебмастер','Тексты правлю по вашим ответам на анкету (15 вопросов)'],
       'out':['Фотосессия и съёмка — фото ваши или стоковые','Интернет-магазин, личный кабинет, онлайн-оплата','Сайт на 10+ страниц и блог','Платная реклама и ведение соцсетей','Хостинг и домен — оплачиваются отдельно по тарифам регистратора [нужно от владельца: свой хостинг или клиента]']},
    steps_title='Как идёт работа: 3 дня',
    steps=[('День 1','Анкета 15 вопросов → тексты и структура → показываю черновик.'),('День 2','Правки (2 круга), форма в Telegram, Метрика, согласие по 152-ФЗ.'),('День 3','Домен, проверка на телефоне, Вебмастер. Сдаю с инструкцией на 1 страницу.')],
    risks=[('«Нет текстов»','Пишу по анкете из 15 вопросов. Вы правите готовый текст, а не пишете с нуля.'),('«Заявки потеряются»','Тестовая заявка при сдаче: приходит в Telegram и видна в Метрике как цель.'),('«Штраф за персональные данные»','Форма не отправляется без галочки согласия; политика и согласие лежат на сайте до запуска.')],
    price='15 000–25 000 ₽',
    price_note='15 000 ₽ — витрина без правок структуры. До 25 000 ₽ — свои блоки, 2 языка или запись на время. Оплата 50/50.',
    accept='Отправляю тестовую заявку с вашего телефона. Она пришла в Telegram и отметилась в Метрике — работа принята.',
    faq=[('Сколько стоит сайт специалиста?','15 000–25 000 ₽. Точная цена — после анкеты, до начала работы.'),('Почему 2–3 дня, а не месяц?','Берём готовую витрину и наполняем вашими данными. Дизайн с нуля не рисуем.'),('Можно ли потом менять тексты и цены самому?','[нужно от владельца: есть ли админка в этом пакете или правки по запросу]'),('Нужен ли свой домен?','Да, сайт переезжает на ваш домен. Если домена нет — подберём и купим на ваше имя.'),('Будет ли сайт в Яндексе?','Сайт добавлен в Вебмастер и открыт для индексации. Место в выдаче зависит от конкуренции — его не обещаю.')],
    form_hint='Кто вы и чем занимаетесь, город, есть ли домен',
    special='''<section id="primery"><div class="wrap"><h2>Для учителя и репетитора</h2><div class="grid two">
<div class="card"><h3>Кейс: преподаватель математики</h3><p>Одна страница: кому помогает, формат занятий, цены, запись. Живой сайт:</p><p class="demo"><a href="https://paskevskaya.ru/" rel="noopener">paskevskaya.ru</a></p><span class="tag">ссылка не проверена кодом 200</span></div>
<div class="card"><h3>Что на сайте учителя</h3><ul class="list"><li>предмет, классы, ОГЭ/ЕГЭ — в первой строке</li><li>формат: очно, онлайн, группа</li><li>цена урока и пакета — цифрой</li><li>запись: форма → Telegram</li><li>согласие родителя на обработку ПДн ребёнка — если ученик младше 14 [нужно от владельца: проверить формулировку с юристом]</li></ul></div>
</div></div></section>
''')

VITRINY = [(f'Витрина {i}: [ниша]', '', 'Первый экран: [что видно за 15 секунд]', '') for i in range(1, 11)]
P2 = dict(
    pal=dict(bg='#FF8A3D', ink='#2D0B3A', acc='#2D6BFF', accink='#FFFFFF', card='#FFF1E6', soft='#FFF7F0', line='rgba(45,11,58,.25)'),
    title='Сайт для вашей ниши + 30 дней трафика — от 30 000 ₽ | SmittMediaGroup',
    description='Готовая витрина под нишу, Яндекс Вебмастер и Бизнес, 30 дней сопровождения с отчётом по заявкам. 30 000–45 000 ₽, дальше 3 000–5 000 ₽ в месяц.',
    h1='Сайт ниши +&nbsp;30&nbsp;дней трафика',
    lead='Берём витрину из каталога под вашу нишу, ставим на ваш домен, подключаем Яндекс Вебмастер и Бизнес. Первые 30 дней смотрю заявки и правлю страницу.',
    chips=['30 000–45 000 ₽','+ 3 000–5 000 ₽/мес','30 дней с отчётом','Вебмастер + Бизнес'],
    cta='Подобрать витрину',
    **{'in':['Витрина под нишу из каталога (кино-первый экран, цвет заливкой)','Ваши тексты, цены, фото, контакты; домен клиента','Форма заявки → Telegram, Метрика с целями','Яндекс Вебмастер: подтверждение, карта сайта, регион','Яндекс Бизнес: карточка организации со ссылкой на сайт','30 дней сопровождения: еженедельно смотрю заявки и Метрику, правлю 1 блок в неделю','Отчёт на 30-й день: заявки, источники, что поменял'],
       'out':['Рекламный бюджет Директа [нужно от владельца: что входит в «30 дней трафика»]','Обещание числа заявок — его не даю','Фото- и видеосъёмка','Интернет-магазин и оплата на сайте']},
    steps_title='Как идёт работа',
    steps=[('Дни 1–3','Выбор витрины, тексты, домен, форма, Метрика.'),('Дни 4–7','Вебмастер, Бизнес, проверка на телефоне, запуск.'),('Дни 8–37','Сопровождение: раз в неделю заявки и правка. На 30-й день — отчёт.')],
    risks=[('«Сделали и забыли»','30 дней сопровождения входят в цену. Отчёт по заявкам — на 30-й день.'),('«Шаблон как у всех»','Витрина собирается под нишу: свой первый экран, свои блоки, ваши цены.'),('«Не понятно, работает ли»','Каждая заявка — цель в Метрике. В отчёте: сколько, откуда, с какой страницы.')],
    price='30 000–45 000 ₽',
    price_note='Сайт и первые 30 дней. Дальше по желанию — 3 000–5 000 ₽ в месяц: заявки, правки, отчёт. Оплата 50/50.',
    accept='Сайт открывается на вашем домене, тестовая заявка пришла в Telegram и видна в Метрике, сайт подтверждён в Вебмастере.',
    faq=[('Сколько стоит?','30 000–45 000 ₽ за сайт и 30 дней. Сопровождение потом — 3 000–5 000 ₽ в месяц, можно отказаться.'),('Что значит «30 дней трафика»?','Слежу за заявками и Метрикой и раз в неделю правлю страницу. [нужно от владельца: входит ли настройка Директа]'),('Можно посмотреть витрины заранее?','Да, примеры ниже. Каждая — живая страница из каталога.'),('Сколько будет заявок?','Не обещаю. Обещаю, что каждая заявка будет посчитана и в отчёте будет видно, откуда она.'),('Сайт будет мой?','Да: ваш домен, доступы к Метрике и Вебмастеру — на ваш аккаунт.')],
    form_hint='Ниша, город, есть ли сайт и домен',
    special=f'''<section id="primery" class="band"><div class="wrap"><h2>Витрины из каталога</h2><p>[нужно: 8–10 самых ярких витрин из каталога demo.smittmediagroup.ru с кодом 200 — каталог из этой среды недоступен, слоты ниже пустые]</p><div class="grid three">
{demo_cards(VITRINY)}
</div></div></section>
''')

DEMOS3 = [
    ('Шахматка новостроек', 'https://kvartira38.com/', 'Схема дома: квартиры по этажам, статус и цена каждой.', 'данные демонстрационные'),
    ('Шахматка — витрина для застройщика', 'https://shakhmatka.smittmediagroup.ru/', 'Та же механика на поддомене студии: клик по квартире — карточка.', 'данные демонстрационные'),
    ('Проверка PDF-документации', 'https://demo.smittmediagroup.ru/pdf-soderzhanie/', 'Содержание комплекта: тома, ссылки, отметки о битых ссылках.', 'проект: 42 тома, 417 ссылок по ГОСТ Р 21.101, 0 битых'),
    ('Приёмник заявок в CRM', '', 'Заявка с сайта → карточка в CRM.', ''),
    ('Telegram-бот записи', '', 'Выбор услуги и времени → запись у администратора.', ''),
    ('Формы Битрикс24', '', 'Форма на сайте → лид в Битрикс24 с полями.', ''),
    ('Дашборд', '', 'Заявки и продажи на одном экране, по дням.', ''),
]
P3 = dict(
    pal=dict(bg='#2EC4B6', ink='#12355B', acc='#FFD23F', accink='#12355B', card='#E9FBF8', soft='#F3FDFB', line='rgba(18,53,91,.25)'),
    title='Интеграция, бот или дашборд за 5–10 дней — от 35 000 ₽ | SmittMediaGroup',
    description='Приёмник заявок в CRM, Telegram-бот записи, формы Битрикс24, дашборд, проверка PDF-документации, шахматка новостроек. 35 000–70 000 ₽, 5–10 дней.',
    h1='Интеграция, бот или дашборд за&nbsp;неделю',
    lead='Одна задача — одна вещь, которая работает: заявки сами попадают в CRM, бот записывает клиентов, дашборд считает продажи. Сначала показываю демо, потом делаю под вас.',
    chips=['35 000–70 000 ₽','5–10 дней','демо до оплаты','доступы — ваши'],
    cta='Описать задачу',
    **{'in':['Разбор задачи 30 минут: что откуда и куда передаём','Демо похожей вещи из каталога до начала работы','Сборка: API, вебхуки, бот, дашборд — по задаче','Проверка на ваших данных (тестовый прогон)','Инструкция на 1–2 страницы и передача доступов','14 дней исправлений после сдачи'],
       'out':['Покупка лицензий CRM, Битрикс24, хостинга — по тарифам сервисов','Доработка сторонних систем, к которым нет API','Сопровождение после 14 дней — отдельно [нужно от владельца: цена]']},
    steps_title='Как идёт работа: 5–10 дней',
    steps=[('День 1','Разбор, схема «откуда → куда», доступы. Показываю демо.'),('Дни 2–7','Сборка и тестовый прогон на ваших данных.'),('Дни 8–10','Правки, инструкция, передача. 14 дней исправлений.')],
    risks=[('«Сломается, когда меня не будет»','Логи и уведомление в Telegram при ошибке. Инструкция — что делать, если не пришло.'),('«Потеряем заявки при переходе»','Сначала параллельный режим: старый канал работает, новый пишет копию. Отключаем старый после сверки.'),('«Доступы у подрядчика»','Аккаунты и ключи — на вашем имени. При сдаче меняем пароли.')],
    price='35 000–70 000 ₽',
    price_note='35 000 ₽ — одна связка «форма → CRM» или простой бот. До 70 000 ₽ — несколько источников, дашборд или разбор документации. Оплата 50/50.',
    accept='Тестовый прогон на ваших данных: 10 заявок или записей прошли путь целиком, без ручных действий.',
    faq=[('Сколько стоит интеграция?','35 000–70 000 ₽. Точная цена — после 30-минутного разбора.'),('Сколько займёт?','5–10 рабочих дней от получения доступов.'),('С какой CRM работаете?','Битрикс24 и любые CRM с открытым API. [нужно от владельца: список проверенных CRM]'),('Что если API нет?','Говорю об этом на разборе. Бывают обходы (почта, выгрузка), но не обещаю, пока не проверю.'),('Можно посмотреть до оплаты?','Да, демо ниже. На разборе показываю ближайшее к вашей задаче.')],
    form_hint='Что откуда куда должно попадать, какая CRM',
    special=f'''<section id="primery" class="band"><div class="wrap"><h2>Демо: что видно за 15 секунд</h2><div class="grid three">
{demo_cards(DEMOS3)}
</div></div></section>
''')

for slug, p in [('sait-specialista', P1), ('sait-nishi-30-dnei', P2), ('integraciya-bot-dashbord', P3)]:
    (ROOT / slug / 'index.html').write_text(page(p), encoding='utf-8')
print('ok')
