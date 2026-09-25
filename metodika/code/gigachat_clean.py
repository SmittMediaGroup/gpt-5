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
