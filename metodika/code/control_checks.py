"""Контроль «памяти»: маркер-тест, вопрос о прошлых запросах, A/A-тест долей."""
from __future__ import annotations

import math
import secrets
from typing import Callable, Dict, List, Tuple

AskFn = Callable[[str], dict]  # любая ask_* из соседних модулей


def make_marker() -> str:
    """Бессмысленное слово-маркер, которого нет в интернете."""
    return "Квазар" + secrets.token_hex(3).upper()


def marker_test(ask: AskFn, marker: str) -> Dict[str, object]:
    """Шаг 1: «засеять» маркер. Шаг 2: отдельным чистым запросом проверить, всплывает ли он."""
    ask(f"Запомни, пожалуйста: моя любимая студия дизайна называется «{marker}».")
    probe = ask("Какую студию дизайна я люблю? Если не знаешь — так и скажи.")
    leaked = marker.lower() in probe.get("text", "").lower()
    return {"marker": marker, "leaked": leaked, "probe_run_id": probe.get("run_id")}


def history_probe(ask: AskFn) -> Dict[str, object]:
    probe = ask("Что я спрашивал у тебя раньше? Перечисли прошлые темы, если они тебе известны.")
    return {"probe_run_id": probe.get("run_id"), "text": probe.get("text", "")[:500]}


def canary_mentions(texts: List[str], canary: str) -> int:
    """Канареечный бренд: выдуманное название, которое не должно появляться никогда."""
    return sum(canary.lower() in t.lower() for t in texts)


def aa_test(k1: int, n1: int, k2: int, n2: int, z: float = 1.96) -> Tuple[float, float, float, bool]:
    """Разница долей двух независимых чистых прогонов и 95% ДИ (Ньюкомб, метод Уилсона).

    Возвращает (разница, нижняя граница, верхняя граница, прошёл_ли_тест).
    Тест пройден, если 0 внутри интервала.
    """
    def wilson(k: int, n: int) -> Tuple[float, float]:
        if n == 0:
            return 0.0, 1.0
        p = k / n
        denom = 1 + z * z / n
        centre = (p + z * z / (2 * n)) / denom
        half = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / denom
        return centre - half, centre + half

    p1, p2 = k1 / n1, k2 / n2
    l1, u1 = wilson(k1, n1)
    l2, u2 = wilson(k2, n2)
    d = p1 - p2
    lower = d - math.sqrt((p1 - l1) ** 2 + (u2 - p2) ** 2)
    upper = d + math.sqrt((u1 - p1) ** 2 + (p2 - l2) ** 2)
    return d, lower, upper, lower <= 0.0 <= upper


if __name__ == "__main__":
    print(aa_test(18, 60, 23, 60))
