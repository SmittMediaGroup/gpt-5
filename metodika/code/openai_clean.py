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
