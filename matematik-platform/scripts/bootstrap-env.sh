#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/.env.local"
EXAMPLE="$ROOT/.env.example"

if [[ -f "$TARGET" ]]; then
  echo "Zaten var: $TARGET (değiştirilmedi)."
  exit 0
fi

if [[ ! -f "$EXAMPLE" ]]; then
  echo "Bulunamadı: $EXAMPLE" >&2
  exit 1
fi

cp "$EXAMPLE" "$TARGET"
echo "Oluşturuldu: $TARGET — Supabase ve diğer değerleri düzenleyin."
