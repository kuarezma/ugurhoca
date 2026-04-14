#!/usr/bin/env python3

from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "import" / "lgs_school_targets_2025.json"
BASE_URL = "https://tabanpuanlari.tr"
LIST_URL = f"{BASE_URL}/lise"
YEAR = 2025

TYPE_PATTERNS = (
    ("Anadolu Imam Hatip Lisesi", "Anadolu Imam Hatip Lisesi"),
    ("Mesleki ve Teknik Anadolu Lisesi", "Mesleki ve Teknik Anadolu Lisesi"),
    ("Sosyal Bilimler Lisesi", "Sosyal Bilimler Lisesi"),
    ("Anadolu Lisesi", "Anadolu Lisesi"),
    ("Fen Lisesi", "Fen Lisesi"),
)


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=60) as response:
        return response.read().decode("utf-8", errors="replace")


def strip_html(value: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", value, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = text.replace("\xa0", " ")
    return text.strip()


def normalize_ascii(value: str) -> str:
    text = strip_html(value).lower()
    replacements = {
        "ç": "c",
        "ğ": "g",
        "ı": "i",
        "İ": "i",
        "ö": "o",
        "ş": "s",
        "ü": "u",
    }

    for source, target in replacements.items():
        text = text.replace(source, target)

    return text


def parse_float(value: str) -> float | None:
    text = parse_first_line(value)
    if not text or text == "-":
        return None

    normalized = text.replace(".", "").replace(",", ".")

    try:
        return float(normalized)
    except ValueError:
        return None


def parse_dot_float(value: str) -> float | None:
    text = parse_first_line(value)
    if not text or text == "-":
        return None

    try:
        return float(text.replace(",", ""))
    except ValueError:
        return None


def parse_first_line(value: str) -> str:
    text = strip_html(value)
    return text.splitlines()[0].strip() if text else ""


def parse_first_number(value: str) -> int | None:
    text = parse_first_line(value)
    match = re.search(r"\d+", text)
    return int(match.group(0)) if match else None


def parse_boarding(value: str) -> bool:
    text = normalize_ascii(value)
    return text not in {"", "yok", "-"}


def infer_school_type(school_name: str) -> str:
    normalized = normalize_ascii(school_name)

    for needle, rendered in TYPE_PATTERNS:
        if normalize_ascii(needle) in normalized:
            return rendered

    return "Lise"


def parse_instruction_language(value: str) -> str:
    text = parse_first_line(value)
    if " - " in text:
        return text.split(" - ", 1)[0].strip()

    return text or "Belirsiz"


def extract_province_links(html_text: str) -> list[str]:
    links = re.findall(r'href="(https://tabanpuanlari\.tr/lise/[^"]+)"', html_text)
    deduped: list[str] = []

    for link in links:
        if link == LIST_URL or link in deduped:
            continue
        deduped.append(link)

    return deduped


def extract_rows(page_html: str) -> list[list[str]]:
    body_match = re.search(r"<tbody>(.*?)</tbody>", page_html, re.IGNORECASE | re.DOTALL)
    if not body_match:
        return []

    rows: list[list[str]] = []

    for row_html in re.findall(r"<tr>(.*?)</tr>", body_match.group(1), re.IGNORECASE | re.DOTALL):
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row_html, re.IGNORECASE | re.DOTALL)
        if len(cells) == 9:
            rows.append(cells)

    return rows


def create_row(source_url: str, cells: list[str]) -> dict:
    school_name = strip_html(cells[1])
    location_lines = [part.strip() for part in strip_html(cells[2]).splitlines() if part.strip()]
    province = location_lines[0].title() if location_lines else ""
    district = location_lines[1].title() if len(location_lines) > 1 else ""

    return {
        "year": YEAR,
        "school_name": school_name,
        "province": province,
        "district": district,
        "school_type": infer_school_type(school_name),
        "placement_mode": "central",
        "instruction_language": parse_instruction_language(cells[3]),
        "boarding": parse_boarding(cells[7]),
        "prep_class": "Hazırlık" in school_name,
        "base_score": parse_dot_float(cells[5]),
        "national_percentile": parse_float(cells[6]),
        "quota_total": parse_first_number(cells[8]),
        "source_url": source_url,
        "source_year": YEAR,
    }


def dedupe_rows(rows: list[dict]) -> list[dict]:
    deduped: dict[tuple[int, str, str], dict] = {}

    for row in rows:
        key = (row["year"], row["school_name"], row["district"])
        existing = deduped.get(key)

        if existing is None:
            deduped[key] = row
            continue

        current_score = row["base_score"] or -1
        previous_score = existing["base_score"] or -1

        if current_score > previous_score:
            deduped[key] = row

    return sorted(
        deduped.values(),
        key=lambda row: (
            row["province"],
            row["district"],
            -(row["base_score"] or 0),
            row["school_name"],
        ),
    )


def main() -> int:
    root_html = fetch_text(LIST_URL)
    province_links = extract_province_links(root_html)
    rows: list[dict] = []

    for index, province_url in enumerate(province_links, start=1):
        page_html = fetch_text(province_url)
        province_rows = [create_row(province_url, cells) for cells in extract_rows(page_html)]
        rows.extend(province_rows)
        print(f"{index:02d}/{len(province_links)} {province_url} -> {len(province_rows)} rows")

    final_rows = dedupe_rows([row for row in rows if row["base_score"] is not None])
    provinces = sorted({row["province"] for row in final_rows})

    OUTPUT_PATH.write_text(json.dumps(final_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"\nSaved {len(final_rows)} LGS rows to {OUTPUT_PATH}")
    print(f"Provinces: {len(provinces)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
