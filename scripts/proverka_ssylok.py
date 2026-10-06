"""Проверка ссылок в пакетах и портфолио: у каждой внешней ссылки должен быть код 200.

Запуск: python3 scripts/proverka_ssylok.py
Берёт ссылки из пакеты/*/index.html, пакеты/*/бриф.md, портфолио/*.md. Ничего не отправляет.
Код возврата 1, если хоть одна ссылка не 200 — тогда страницы не публикуем.
"""
import glob, re, sys, urllib.request

FILES = glob.glob('пакеты/*/index.html') + glob.glob('пакеты/*/бриф.md') + glob.glob('портфолио/*.md')
URL = re.compile(r'https?://[^\s"\'<>)\]]+')


def code(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'SMG-link-check/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return f'ошибка: {type(e).__name__}'


urls = {}
for f in FILES:
    for u in URL.findall(open(f, encoding='utf-8').read()):
        u = u.rstrip('.,;:')
        urls.setdefault(u, set()).add(f)
bad = 0
for u in sorted(urls):
    c = code(u)
    bad += c != 200
    print(f'{c}\t{u}\t' + ', '.join(sorted(urls[u])))
print(f'Ссылок: {len(urls)}, не 200: {bad}')
sys.exit(1 if bad else 0)
