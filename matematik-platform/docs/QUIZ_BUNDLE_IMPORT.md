# Quiz Bundle Import

Bu proje artik iki farkli soru import akisi destekler:

- `Excel` fallback
- `PDF/Drive ZIP bundle` import

ZIP bundle, harici converter uygulamasinin urettigi ciktiyi kabul eder.

## Bundle formati

ZIP icinde su dosyalar bulunur:

- `quiz.json`
- `images/`
- `questions.xlsx`

`quiz.json` icerigi:

```json
{
  "meta": {
    "title": "PDF Test Import",
    "grade": 8,
    "difficulty": "Orta",
    "time_limit": 20,
    "description": "..."
  },
  "questions": [
    {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_index": 1,
      "explanation": "...",
      "question_image_files": ["q1.png"],
      "option_image_files": [[], [], [], []]
    }
  ]
}
```

Kurallar:

- Sadece `A-D` dort sik desteklenir.
- `correct_index` `0..3` araliginda olmalidir.
- Referans verilen gorseller `images/` klasorunde bulunmalidir.
- 30 sorudan fazlasi reddedilir.

## Admin kullanim akisi

1. Converter app ile PDF veya Drive linkini isleyin.
2. Olusan `export.zip` dosyasini alin.
3. Admin panelde `Soru Ice Aktar` modalini acin.
4. `PDF/Drive ZIP yukle` alanindan ZIP'i secin.
5. Onizlemeyi kontrol edin.
6. `Kaydet` ile importu tamamlayin.

Yerel admin:

- [http://localhost:3000/admin](http://localhost:3000/admin)

## Storage ve veritabani davranisi

Import sirasinda:

- Gorseller `quiz-images` bucket'ina yuklenir.
- Yeni DB kolonlari varsa:
  - `question_image_url`
  - `option_image_urls`
- Yeni kolonlar henuz yoksa sistem geriye uyumlu fallback kullanir:
  - medya bilgisi `explanation` alanina internal metadata olarak gomulur
  - uygulama okuma sirasinda bu veriyi yeniden cozer

Bu nedenle migration uygulanmamis olsa bile ZIP import calismaya devam eder.

## Istege bagli migration

Native kolonlarla devam etmek icin su migration uygulanabilir:

- [20260420131000_quiz_bundle_images.sql](/Users/ugurmac/Desktop/ugurhoca/matematik-platform/supabase/migrations/20260420131000_quiz_bundle_images.sql)

Migration sonrasinda da fallback kodu zarar vermez; once yeni kolonlari kullanir.

## Canli dogrulama

Bu akisin yerelde dogrulandigi ornekler:

- metin bundle importu basarili
- gorselli bundle importu basarili
- storage upload basarili
- admin route: `/api/import-questions-bundle`

