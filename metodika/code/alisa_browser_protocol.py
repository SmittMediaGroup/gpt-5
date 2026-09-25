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
