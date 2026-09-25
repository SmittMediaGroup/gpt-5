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
