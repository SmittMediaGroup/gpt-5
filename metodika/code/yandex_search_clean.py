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
