#!/usr/bin/env bash
# catchup/ kopyalarını kaynak migration'larla karşılaştırır.
# "-- catchup" ile başlayan ya da biten satırlar (başlık, eklenen lock_timeout) yok sayılır.
# BİREBİR KOPYA farklıysa çıkış kodu 1; DÜZELTİLMİŞ KOPYA farkı bilgi olarak basılır.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
migrations="$here/../migrations"
repo_root="$(git -C "$here" rev-parse --show-toplevel)"
status=0

strip() { grep -v -e '^-- catchup' -e '-- catchup$'; }

for copy in "$here"/[0-9][0-9]_*.sql; do
  base="$(basename "$copy")"
  name="${base#??_}"
  case "$base" in 90_*) continue ;; esac
  if [ -f "$migrations/$name" ]; then
    source_sql="$(cat "$migrations/$name")"
  else
    # PR #10 dosyaları bu dalda yok; birleşene kadar commit'ten okunur.
    source_sql="$(git -C "$repo_root" show "5d4caa3:matematik-platform/supabase/migrations/$name" 2>/dev/null)" || {
      echo "KAYNAK YOK  $base"; status=1; continue; }
  fi
  if head -1 "$copy" | grep -q 'DÜZELTİLMİŞ KOPYA'; then
    echo "DÜZELTİLMİŞ $base (fark bilgi amaçlı):"
    diff <(printf '%s\n' "$source_sql") <(strip < "$copy") | sed 's/^/    /' | head -60
  elif diff -q <(printf '%s\n' "$source_sql") <(strip < "$copy") >/dev/null; then
    echo "AYNI        $base"
  else
    echo "FARKLI      $base"; status=1
    diff <(printf '%s\n' "$source_sql") <(strip < "$copy") | head -20
  fi
done
exit $status
