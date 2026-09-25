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
