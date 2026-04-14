#!/usr/bin/env python3

from __future__ import annotations

import html
import json
import math
import re
import sys
from http.cookiejar import CookieJar
from pathlib import Path
from typing import Iterable
from urllib.parse import quote, urlencode
from urllib.request import HTTPCookieProcessor, Request, build_opener


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "import" / "yks_program_targets_2025.json"
YEAR = 2025
BASE_URL = "https://yokatlas.yok.gov.tr"
OSYM_URL = "https://www.osym.gov.tr"
PAGE_SIZE = 100
T4_SCORE_CONFIG = (
    ("say", "SAY"),
    ("ea", "EA"),
    ("söz", "SOZ"),
)

LANGUAGE_DEFAULT = "Turkce"
KNOWN_LANGUAGES = {
    "Arapca": "Arapca",
    "Almanca": "Almanca",
    "Fransizca": "Fransizca",
    "Farsca": "Farsca",
    "Ispanyolca": "Ispanyolca",
    "Ingilizce": "Ingilizce",
    "Japonca": "Japonca",
    "Rusca": "Rusca",
    "Turkce": "Turkce",
}

TR_LOWER_MAP = str.maketrans("ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZQWX", "abcçdefgğhıijklmnoöprsştuüvyzqwx")


def build_session():
    return build_opener(HTTPCookieProcessor(CookieJar()))


def fetch_text(opener, url: str, data: dict[str, str] | None = None, headers: dict[str, str] | None = None) -> str:
    payload = None
    request_url = url

    if data is not None:
        payload = urlencode(data).encode("utf-8")

    request = Request(request_url, data=payload)
    request.add_header("User-Agent", "Mozilla/5.0")

    for key, value in (headers or {}).items():
        request.add_header(key, value)

    with opener.open(request, timeout=60) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_json(opener, url: str, data: dict[str, str] | None = None, headers: dict[str, str] | None = None):
    return json.loads(fetch_text(opener, url, data=data, headers=headers).lstrip("\ufeff"))


def strip_html(value) -> str:
    if value is None:
        return ""

    text = re.sub(r"<br\s*/?>", "\n", str(value), flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = text.replace("\xa0", " ")

    return text.strip()


def first_line(value) -> str:
    text = strip_html(value)
    return text.splitlines()[0].strip() if text else ""


def normalize_ascii_slug(value: str) -> str:
    return strip_html(value).lower().translate(TR_LOWER_MAP)


def parse_language(extra: str) -> str:
    normalized = normalize_ascii_slug(extra)

    for language in KNOWN_LANGUAGES:
        if language.lower() in normalized:
            return KNOWN_LANGUAGES[language]

    return LANGUAGE_DEFAULT


def parse_nullable_float(value) -> float | None:
    text = strip_html(value)
    if not text or text == "---":
        return None

    normalized = text
    if "," in normalized and "." not in normalized:
        normalized = normalized.replace(",", ".")
    elif "," in normalized and "." in normalized:
        normalized = normalized.replace(".", "").replace(",", ".")

    try:
        return float(normalized)
    except ValueError:
        return None


def parse_nullable_int(value) -> int | None:
    text = strip_html(value)
    if not text or text == "---":
        return None

    normalized = re.sub(r"[^\d]", "", text)

    if not normalized:
        return None

    return int(normalized)


def parse_quota_total(value) -> int | None:
    text = first_line(value)
    numbers = [int(number) for number in re.findall(r"\d+", text)]
    return sum(numbers) if numbers else None


def parse_scholarship_rate(value) -> int:
    text = normalize_ascii_slug(value)

    if "burslu" in text and "%" not in text:
        return 100

    match = re.search(r"%\s*(\d+)", text)
    if match:
        return int(match.group(1))

    return 0


def normalize_city(city: str, university_type: str) -> str:
    raw = strip_html(city)
    if raw:
        return raw

    if strip_html(university_type) == "Yurt Dışı":
        return "Yurt Dışı"

    return ""


def normalize_level(raw_level: str) -> str:
    return "onlisans" if raw_level == "tyt" else "lisans"


def create_t4_payload(score_param: str, start: int) -> dict[str, str]:
    payload = {
        "draw": "1",
        "start": str(start),
        "length": str(PAGE_SIZE),
        "search[value]": "",
        "search[regex]": "false",
        "puan_turu": score_param,
        "ust_bs": "0",
        "alt_bs": "10000000",
        "yeniler": "1",
        "kilavuz_kodu": "",
        "universite": "[]",
        "program": "[]",
        "sehir": "[]",
        "universite_turu": "[]",
        "ucret": "[]",
        "ogretim_turu": "[]",
        "doluluk": "[]",
        "order[0][column]": "37",
        "order[0][dir]": "desc",
        "order[1][column]": "41",
        "order[1][dir]": "asc",
        "order[2][column]": "42",
        "order[2][dir]": "asc",
    }

    for index in range(45):
        payload[f"columns[{index}][data]"] = ""
        payload[f"columns[{index}][name]"] = ""
        payload[f"columns[{index}][searchable]"] = "true"
        payload[f"columns[{index}][orderable]"] = "true"
        payload[f"columns[{index}][search][value]"] = ""
        payload[f"columns[{index}][search][regex]"] = "false"

    return payload


def create_t3_payload(start: int) -> dict[str, str]:
    payload = {
        "draw": "1",
        "start": str(start),
        "length": str(PAGE_SIZE),
        "search[value]": "",
        "search[regex]": "false",
        "puan_turu": "tyt",
        "ust_puan": "500",
        "alt_puan": "150",
        "tip": "TYT",
        "yeniler": "1",
        "kilavuz_kodu": "",
        "universite": "[]",
        "program": "[]",
        "sehir": "[]",
        "universite_turu": "[]",
        "ucret": "[]",
        "ogretim_turu": "[]",
        "order[0][column]": "30",
        "order[0][dir]": "desc",
        "order[1][column]": "33",
        "order[1][dir]": "asc",
        "order[2][column]": "34",
        "order[2][dir]": "asc",
    }

    for index in range(35):
        payload[f"columns[{index}][data]"] = ""
        payload[f"columns[{index}][name]"] = ""
        payload[f"columns[{index}][searchable]"] = "true"
        payload[f"columns[{index}][orderable]"] = "true"
        payload[f"columns[{index}][search][value]"] = ""
        payload[f"columns[{index}][search][regex]"] = "false"

    return payload


def fetch_t4_rows(opener, score_param: str) -> list[list]:
    page_url = f"{BASE_URL}/tercih-sihirbazi-t4-tablo.php?p={quote(score_param)}"
    endpoint = f"{BASE_URL}/server_side/server_processing-atlas2016-TS-t4.php"
    headers = {
        "Referer": page_url,
        "Origin": BASE_URL,
        "X-Requested-With": "XMLHttpRequest",
    }

    fetch_text(opener, page_url, headers={"Referer": BASE_URL})
    initial = fetch_json(opener, endpoint, data=create_t4_payload(score_param, 0), headers=headers)

    total = int(initial["recordsFiltered"])
    rows = list(initial["data"])

    for start in range(PAGE_SIZE, total, PAGE_SIZE):
        response = fetch_json(opener, endpoint, data=create_t4_payload(score_param, start), headers=headers)
        rows.extend(response["data"])

    return rows


def fetch_t3_rows(opener) -> list[list]:
    page_url = f"{BASE_URL}/tercih-sihirbazi-t3-tablo.php?p=tyt"
    endpoint = f"{BASE_URL}/server_side/server_processing-atlas2016-TS-t3.php"
    headers = {
        "Referer": page_url,
        "Origin": BASE_URL,
        "X-Requested-With": "XMLHttpRequest",
    }

    fetch_text(opener, page_url, headers={"Referer": BASE_URL})
    initial = fetch_json(opener, endpoint, data=create_t3_payload(0), headers=headers)

    total = int(initial["recordsFiltered"])
    rows = list(initial["data"])

    for start in range(PAGE_SIZE, total, PAGE_SIZE):
        response = fetch_json(opener, endpoint, data=create_t3_payload(start), headers=headers)
        rows.extend(response["data"])

    return rows


def parse_lisans_row(row: list, score_type: str) -> dict:
    program_code = parse_nullable_int(row[1])
    if not program_code:
        raise ValueError("Missing lisans program code")

    university_type = first_line(row[7])
    city = normalize_city(first_line(row[6]), university_type)

    return {
        "year": YEAR,
        "program_code": str(program_code),
        "university_name": first_line(row[2]),
        "university_type": university_type,
        "faculty_or_school": first_line(row[3]) or None,
        "program_name": first_line(row[4]),
        "level": normalize_level(score_type),
        "city": city,
        "score_type": score_type.upper(),
        "teaching_type": first_line(row[9]) or None,
        "scholarship_rate": parse_scholarship_rate(row[8]),
        "instruction_language": parse_language(row[5]),
        "quota_total": parse_quota_total(row[10]),
        "base_rank": parse_nullable_int(row[38]),
        "base_score": parse_nullable_float(row[37]),
        "source_url_osym": OSYM_URL,
        "source_url_yokatlas": f"{BASE_URL}/lisans.php?y={program_code}",
    }


def parse_onlisans_row(row: list) -> dict:
    program_code = parse_nullable_int(row[1])
    if not program_code:
        raise ValueError("Missing onlisans program code")

    university_type = first_line(row[7])
    city = normalize_city(first_line(row[6]), university_type)

    return {
        "year": YEAR,
        "program_code": str(program_code),
        "university_name": first_line(row[2]),
        "university_type": university_type,
        "faculty_or_school": first_line(row[3]) or None,
        "program_name": first_line(row[4]),
        "level": "onlisans",
        "city": city,
        "score_type": "TYT",
        "teaching_type": first_line(row[9]) or None,
        "scholarship_rate": parse_scholarship_rate(row[8]),
        "instruction_language": parse_language(row[5]),
        "quota_total": parse_quota_total(row[10]),
        "base_rank": parse_nullable_int(row[23]) or parse_nullable_int(row[22]),
        "base_score": parse_nullable_float(row[30]) or parse_nullable_float(row[21]),
        "source_url_osym": OSYM_URL,
        "source_url_yokatlas": f"{BASE_URL}/onlisans.php?y={program_code}",
    }


def dedupe_rows(rows: Iterable[dict]) -> list[dict]:
    deduped: dict[tuple[int, str], dict] = {}

    for row in rows:
        deduped[(row["year"], row["program_code"])] = row

    return sorted(
        deduped.values(),
        key=lambda row: (
            row["score_type"],
            row["base_rank"] is None,
            row["base_rank"] or math.inf,
            row["city"],
            row["university_name"],
            row["program_name"],
            row["program_code"],
        ),
    )


def main() -> int:
    opener = build_session()

    all_rows: list[dict] = []

    for score_param, score_type in T4_SCORE_CONFIG:
        rows = fetch_t4_rows(opener, score_param)
        parsed = [parse_lisans_row(row, score_type.lower()) for row in rows]
        all_rows.extend(parsed)
        print(f"{score_type}: fetched {len(parsed)} rows")

    tyt_rows = fetch_t3_rows(opener)
    parsed_tyt = [parse_onlisans_row(row) for row in tyt_rows]
    all_rows.extend(parsed_tyt)
    print(f"TYT: fetched {len(parsed_tyt)} rows")

    final_rows = dedupe_rows(all_rows)
    cities = sorted({row["city"] for row in final_rows if row["city"]})

    OUTPUT_PATH.write_text(json.dumps(final_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"\nSaved {len(final_rows)} YKS rows to {OUTPUT_PATH}")
    print(f"Cities: {len(cities)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
