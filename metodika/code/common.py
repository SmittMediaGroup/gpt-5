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
