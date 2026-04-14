#!/usr/bin/env python3

from __future__ import annotations

import html
import json
import re
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = ROOT / "data" / "import" / "lgs_school_targets_2021_2025.json"
LATEST_OUTPUT_PATH = ROOT / "data" / "import" / "lgs_school_targets_2025.json"
BASE_URL = "https://tabanpuanlari.tr"
LIST_URL = f"{BASE_URL}/lise"
CURRENT_YEAR = 2025
HTML_HISTORY_YEARS = (2025, 2024, 2023, 2022)
PDF_2021_URL = "https://www.meb.gov.tr/meb_iys_dosyalar/2021_07/26102304_2021LGSTabanTavan.pdf"
LANGUAGES = (
    "İngilizce",
    "Almanca",
    "Fransızca",
    "Arapça",
    "Rusça",
    "İspanyolca",
    "Japonca",
    "Çince",
)
TYPE_PATTERNS = (
    ("Mesleki ve Teknik Anadolu Lisesi", "Mesleki ve Teknik Anadolu Lisesi"),
    ("Anadolu İmam Hatip Lisesi", "Anadolu İmam Hatip Lisesi"),
    ("Sosyal Bilimler Lisesi", "Sosyal Bilimler Lisesi"),
    ("Güzel Sanatlar Lisesi", "Güzel Sanatlar Lisesi"),
    ("Spor Lisesi", "Spor Lisesi"),
    ("Anadolu Lisesi", "Anadolu Lisesi"),
    ("Fen Lisesi", "Fen Lisesi"),
)
BOARDING_KEYWORDS = ("pansiyon", "parasız", "yatılı")


def fetch_text(url: str) -> str:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=60) as response:
        return response.read().decode("utf-8", errors="replace")


def fetch_pdf(url: str) -> PdfReader:
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=60) as response:
        return PdfReader(BytesIO(response.read()))


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


def to_title_case(value: str) -> str:
    value = value.strip()
    return value.title() if value else ""


def parse_float(value: str) -> float | None:
    text = value.strip()
    if not text or text == "-":
        return None

    normalized = text.replace(".", "").replace(",", ".")

    try:
        return float(normalized)
    except ValueError:
        return None


def parse_dot_float(value: str) -> float | None:
    text = value.strip()
    if not text or text == "-":
        return None

    try:
        return float(text.replace(",", ""))
    except ValueError:
        return None


def parse_first_number(value: str) -> int | None:
    match = re.search(r"\d+", value)
    return int(match.group(0)) if match else None


def infer_school_type(school_name: str) -> str:
    normalized = normalize_ascii(school_name)

    for needle, rendered in TYPE_PATTERNS:
        if normalize_ascii(needle) in normalized:
            return rendered

    return "Lise"


def parse_instruction_language(value: str) -> str:
    text = value.strip()
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


def extract_rows(page_html: str) -> list[tuple[str, list[str]]]:
    body_match = re.search(r"<tbody>(.*?)</tbody>", page_html, re.IGNORECASE | re.DOTALL)
    if not body_match:
        return []

    rows: list[tuple[str, list[str]]] = []

    for row_html in re.findall(r"<tr>(.*?)</tr>", body_match.group(1), re.IGNORECASE | re.DOTALL):
        cells = re.findall(r"<td[^>]*>(.*?)</td>", row_html, re.IGNORECASE | re.DOTALL)
        if len(cells) == 9:
            rows.append((row_html, cells))

    return rows


def parse_multiline_cell(cell: str) -> list[str]:
    text = strip_html(cell)
    return [line.strip() for line in text.splitlines() if line.strip()]


def parse_boarding_from_row(row_html: str) -> bool:
    normalized = normalize_ascii(row_html)
    return any(keyword in normalized for keyword in BOARDING_KEYWORDS)


def create_multiyear_rows(source_url: str, row_html: str, cells: list[str]) -> list[dict]:
    school_name = strip_html(cells[1])
    location_lines = parse_multiline_cell(cells[2])
    province = to_title_case(location_lines[0]) if location_lines else ""
    district = to_title_case(location_lines[1]) if len(location_lines) > 1 else ""
    instruction_language = parse_instruction_language(strip_html(cells[3]))
    years = [int(line) for line in parse_multiline_cell(cells[4]) if line.isdigit()]
    scores = parse_multiline_cell(cells[5])
    percentiles = parse_multiline_cell(cells[6])
    quotas = parse_multiline_cell(cells[8])

    rows: list[dict] = []

    for index, year in enumerate(years):
        if year not in HTML_HISTORY_YEARS:
            continue

        score = parse_dot_float(scores[index]) if index < len(scores) else None
        percentile = parse_float(percentiles[index]) if index < len(percentiles) else None
        quota_total = parse_first_number(quotas[index]) if index < len(quotas) else None

        rows.append(
            {
                "year": year,
                "school_name": school_name,
                "province": province,
                "district": district,
                "school_type": infer_school_type(school_name),
                "placement_mode": "central",
                "instruction_language": instruction_language,
                "boarding": parse_boarding_from_row(row_html),
                "prep_class": "Hazırlık" in school_name,
                "base_score": score,
                "national_percentile": percentile,
                "quota_total": quota_total,
                "source_url": source_url,
                "source_year": year,
            }
        )

    return rows


def iter_pdf_rows(reader: PdfReader) -> list[str]:
    rows: list[str] = []
    current = ""

    for page in reader.pages:
        text = page.extract_text() or ""

        for raw_line in text.splitlines():
            line = " ".join(raw_line.split())
            if not line:
                continue
            if line.startswith("2021 Yılı Merkezi Sınav Puanı"):
                continue
            if line.startswith("TERCİH"):
                continue
            if line.startswith("KODU İL İLÇE"):
                continue
            if re.fullmatch(r"\d+", line):
                continue

            if re.match(r"^\d{5}\s", line):
                if current:
                    rows.append(current.strip())
                current = line
            elif current:
                current = f"{current} {line}"

    if current:
        rows.append(current.strip())

    return rows


def extract_2021_school_name(value: str) -> str:
    match = re.search(r"^(.+?Lisesi)", value)
    if match:
        return match.group(1).strip()

    for stop_phrase in (
        " Hazırlık Sınıfı",
        " Anadolu Teknik Programı",
        " Anadolu Meslek Programı",
        " FEN VE SOSYAL BİLİMLER PROGRAMI",
    ):
        if stop_phrase in value:
            return value.split(stop_phrase, 1)[0].strip()

    return value.strip()


def parse_2021_pdf_row(row_text: str) -> dict | None:
    metric_match = re.search(r"([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)\s+([\d,\.]+)$", row_text)
    if not metric_match:
        return None

    metrics_start = metric_match.start()
    prefix = row_text[:metrics_start].strip()
    metric_values = metric_match.groups()
    parts = prefix.split()

    if len(parts) < 4:
        return None

    province = to_title_case(parts[1])
    district = to_title_case(parts[2])
    tail = " ".join(parts[3:])

    language = "Belirsiz"
    language_index = -1

    for candidate in LANGUAGES:
        index = tail.rfind(candidate)
        if index > language_index:
            language = candidate
            language_index = index

    school_and_extra = tail[:language_index].strip() if language_index >= 0 else tail
    school_name = extract_2021_school_name(school_and_extra)

    if not school_name:
        return None

    return {
        "year": 2021,
        "school_name": school_name,
        "province": province,
        "district": district,
        "school_type": infer_school_type(school_name),
        "placement_mode": "central",
        "instruction_language": language,
        "boarding": any(keyword in normalize_ascii(row_text) for keyword in BOARDING_KEYWORDS),
        "prep_class": "Hazırlık" in school_name,
        "base_score": parse_float(metric_values[0]),
        "national_percentile": parse_float(metric_values[1]),
        "quota_total": None,
        "source_url": PDF_2021_URL,
        "source_year": 2021,
    }


def dedupe_rows(rows: list[dict]) -> list[dict]:
    deduped: dict[tuple[int, str, str], dict] = {}

    for row in rows:
        if row["base_score"] is None:
            continue

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
            row["year"],
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
        province_rows: list[dict] = []

        for row_html, cells in extract_rows(page_html):
            province_rows.extend(create_multiyear_rows(province_url, row_html, cells))

        rows.extend(province_rows)
        print(f"{index:02d}/{len(province_links)} {province_url} -> {len(province_rows)} rows")

    pdf_rows = [row for row in (parse_2021_pdf_row(item) for item in iter_pdf_rows(fetch_pdf(PDF_2021_URL))) if row]
    rows.extend(pdf_rows)
    print(f"2021 official PDF -> {len(pdf_rows)} rows")

    final_rows = dedupe_rows(rows)
    latest_rows = [row for row in final_rows if row["year"] == CURRENT_YEAR]
    years = sorted({row["year"] for row in final_rows})

    OUTPUT_PATH.write_text(json.dumps(final_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    LATEST_OUTPUT_PATH.write_text(json.dumps(latest_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for year in years:
        count = sum(1 for row in final_rows if row["year"] == year)
        print(f"Year {year}: {count} rows")

    print(f"\nSaved {len(final_rows)} LGS rows to {OUTPUT_PATH}")
    print(f"Saved {len(latest_rows)} latest LGS rows to {LATEST_OUTPUT_PATH}")
    print(f"Provinces: {len({row['province'] for row in latest_rows})}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
