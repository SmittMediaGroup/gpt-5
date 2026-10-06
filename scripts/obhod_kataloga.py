"""Обход каталога демо: адрес → код ответа → заголовок → описание.

Запуск (у владельца, где сайт доступен):
    python3 scripts/obhod_kataloga.py [https://demo.smittmediagroup.ru/] [--glubina 2]
Результат: data/katalog-demo.csv (разделитель «;», UTF-8 с BOM).
Только стандартная библиотека. Ходит только по ссылкам того же хоста, ничего не отправляет.
Колонка «учебные_данные» = да, если на странице встречаются слова «учебн»/«демонстрац»/«тестов».
"""
import csv, re, sys, time, urllib.parse, urllib.request
from html.parser import HTMLParser

START = next((a for a in sys.argv[1:] if a.startswith('http')), 'https://demo.smittmediagroup.ru/')
DEPTH = int(sys.argv[sys.argv.index('--glubina') + 1]) if '--glubina' in sys.argv else 2
OUT = 'data/katalog-demo.csv'
UA = 'SMG-katalog-check/1.0'
SKIP = re.compile(r'\.(jpg|jpeg|png|webp|gif|svg|ico|css|js|mp4|webm|woff2?|ttf|zip)(\?|$)', re.I)


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.title, self.desc, self.h1, self._in = [], '', '', '', None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        elif tag == 'meta' and (a.get('name') or '').lower() == 'description':
            self.desc = (a.get('content') or '').strip()
        elif tag in ('title', 'h1'):
            self._in = tag

    def handle_endtag(self, tag):
        if tag == self._in:
            self._in = None

    def handle_data(self, data):
        if self._in == 'title':
            self.title += data
        elif self._in == 'h1' and len(self.h1) < 200:
            self.h1 += data


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            ctype = r.headers.get('Content-Type', '')
            body = r.read(2_000_000).decode('utf-8', 'replace') if 'html' in ctype else ''
            return r.status, r.geturl(), body
    except urllib.error.HTTPError as e:
        return e.code, url, ''
    except Exception as e:  # сеть, таймаут, TLS
        return f'ошибка: {type(e).__name__}', url, ''


def norm(base, href):
    u = urllib.parse.urljoin(base, href.split('#')[0])
    p = urllib.parse.urlsplit(u)
    return urllib.parse.urlunsplit((p.scheme, p.netloc, p.path or '/', p.query, ''))


def main():
    host = urllib.parse.urlsplit(START).netloc
    seen, queue, rows = {START}, [(START, 0)], []
    while queue:
        url, d = queue.pop(0)
        code, final, body = fetch(url)
        pg = Page()
        if body:
            pg.feed(body)
        text = re.sub(r'<[^>]+>', ' ', body).lower()
        rows.append([url, code, final if final != url else '', ' '.join(pg.title.split()),
                     ' '.join(pg.h1.split()), pg.desc,
                     'да' if re.search(r'учебн|демонстрац|тестов', text) else ''])
        print(code, url, flush=True)
        if d < DEPTH:
            for h in pg.links:
                u = norm(url, h)
                if urllib.parse.urlsplit(u).netloc == host and u not in seen and not SKIP.search(u):
                    seen.add(u)
                    queue.append((u, d + 1))
        time.sleep(0.3)
    with open(OUT, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f, delimiter=';')
        w.writerow(['адрес', 'код', 'редирект_на', 'title', 'h1', 'description', 'учебные_данные'])
        w.writerows(rows)
    ok = sum(1 for r in rows if r[1] == 200)
    print(f'Готово: {len(rows)} страниц, код 200 у {ok}. Файл: {OUT}')


if __name__ == '__main__':
    main()
