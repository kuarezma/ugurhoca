
#set page(
  paper: "a4",
  margin: (top: 8.5mm, bottom: 9.5mm, left: 10mm, right: 10mm),
  footer: context [
    #line(length: 100%, stroke: 0.4pt + rgb("#cbd5e1"))
    #v(0.8mm)
    #grid(
      columns: (1fr, 1fr),
      align(left)[#text(size: 7.2pt, fill: rgb("#64748b"))[Uğur YAŞAYAN • Matematik Öğretmeni | ugurhoca.com]],
      align(right)[#text(size: 7.2pt, fill: rgb("#64748b"))[Sayfa #counter(page).display("1 / 1", both: true)]]
    )
  ]
)
#set text(font: "PT Sans", size: 8.3pt, fill: rgb("#0f172a"))
#set par(leading: 0.44em, justify: true)


// --- SINAV BAŞLIK KARTI ---
#rect(width: 100%, stroke: 1pt + rgb("#b91c1c"), radius: 5pt, fill: rgb("#fef2f2"), inset: (x: 4mm, y: 2.5mm))[
  #grid(
    columns: (1fr, auto),
    gutter: 3mm,
    align: (left + horizon, right + horizon),
    [
      #text(size: 8pt, weight: "bold", fill: rgb("#64748b"), tracking: 0.5pt)[2026-2027 EĞİTİM-ÖĞRETİM YILI] \
      #v(-0.5mm)
      #text(size: 11pt, weight: "bold", fill: rgb("#b91c1c"))[8. SINIF MATEMATİK DERSİ] \
      #v(-0.5mm)
      #text(size: 9pt, weight: "bold", fill: rgb("#1e293b"))[1. DÖNEM 1. YAZILIYA HAZIRLIK SINAVI]
    ],
    [
      #box(fill: rgb("#b91c1c"), radius: 4pt, inset: (x: 3.5mm, y: 2.5mm))[
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[MEB SENARYO 6 UYUMLU] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[100 PUANLIK YAZILI]]
      ]
    ]
  )
  
  #v(1.5mm)
  #rect(width: 100%, stroke: 0.5pt + rgb("#cbd5e1"), radius: 3pt, fill: white, inset: (x: 4mm, y: 1.8mm))[
    #grid(
      columns: (1.5fr, 1fr, 0.8fr, 0.9fr),
      gutter: 2mm,
      align: horizon,
      [#text(size: 8pt, weight: "bold", fill: rgb("#334155"))[Adı Soyadı:] #text(size: 8pt, fill: rgb("#94a3b8"))[............................................]],
      [#text(size: 8pt, weight: "bold", fill: rgb("#334155"))[Sınıf / Şube:] #text(size: 8pt, fill: rgb("#94a3b8"))[....................]],
      [#text(size: 8pt, weight: "bold", fill: rgb("#334155"))[Okul No:] #text(size: 8pt, fill: rgb("#94a3b8"))[............]],
      [#align(right)[#box(stroke: 1pt + rgb("#b91c1c"), radius: 3pt, inset: (x: 2.5mm, y: 1mm), fill: rgb("#fef2f2"))[#text(size: 8.5pt, weight: "bold", fill: rgb("#b91c1c"))[Puan: [ #h(6mm) / 100 ]]]]]
    )
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Antik Babil astronomisinde ve takvim hesaplarında kullanılan 360 ve 540 sayıları incelenmektedir.
  #v(0.5mm)
  *a)* 360 ve 540 sayılarını asal çarpanlarının üslü ifadelerinin çarpımı biçiminde yazınız.   *b)* Bu iki sayının her birinin pozitif tam sayı çarpan sayısını ve *asal olmayan* pozitif tam sayı çarpan sayısını bulunuz.
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  #grid(columns: (1.3fr, 1fr), gutter: 3mm, align: horizon,
    [
      Boyutları 168 cm ve 210 cm olan dikdörtgen biçimindeki bir müze sergi panosu, hiç boşluk kalmayacak ve taşmayacak şekilde birbirine eş büyüklükte *en büyük kare fotoğraflarla* kaplanacaktır.
      #v(0.6mm)
      *a)* Kullanılacak kare fotoğraflardan birinin kenar uzunluğu en fazla kaç cm olabilir?       *b)* Bu pano için toplam kaç adet kare fotoğraf gerektiğini bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif8_soru2.svg", width: 90%)]
    ]
  )
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  GÖKTÜRK-X uydusu her 45 dakikada bir, İMECE-Y uydusu ise her 60 dakikada bir Ankara Yer İstasyonu üzerinden geçmektedir. Bu iki uydu ilk kez sabah saat 08.15'te birlikte istasyon üzerinden geçmiştir.
  #v(0.5mm)
  *Bu uydular aynı gün saat 20.00'ye kadar kaç kez daha birlikte geçerler? Geçiş saatlerini belirleyiniz.*
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Kule saatindeki iki dişli çarkın diş sayıları $(2x + 3)$ ve 35 olup aralarındaki oran $(2x + 3) / 35 = 36 / 84$ eşitliğini sağlamaktadır.
  #v(0.5mm)
  *a)* $x$ doğal sayısının değerini bulunuz.   *b)* Bulduğunuz $x$ sayısı ile 18 sayısının aralarında asal olup olmadığını gerekçesiyle açıklayınız.
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("#b91c1c"), radius: 3pt, fill: rgb("#fef2f2"), inset: (x: 3mm, y: 1mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 7.8pt, weight: "bold", fill: rgb("#b91c1c"))[8. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 6)]],
    [#text(size: 7.2pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.2mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Radyoaktif karbon-14 kalibrasyon katsayıları $A = (-2)^6$, $B = -3^4$, $C = (-4)^(-2)$ ve $D = (-1/5)^(-3)$ olarak verilmiştir.
  #v(0.5mm)
  *a)* $A, B, C, D$ rasyonel ve tam sayı değerlerini hesaplayınız. #h(4mm)
  *b)* $(A + B) + (1 / C) + D$ işleminin sonucunu bulunuz.
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Ulusal Dijital Kütüphane veri merkezinde $8^6$ adet tarihi belgenin her biri $16^4$ bayt depolama alanı kaplamaktadır. Arşivlenen tüm veri $4^5$ adet eş kapasiteli bulut sunucuya eşit paylaştırılmıştır.
  #v(0.5mm)
  *Buna göre bir sunucuya yüklenen veri miktarını 2 tabanında üslü ifade olarak hesaplayınız.*
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Satranç tahtasının 1. karesine $9^4$, 2. karesine $27^3$, 3. karesine ise $81^2$ adet buğday tanesi konulmuştur.
  #v(0.5mm)
  *a)* Bu üç karedeki buğday sayılarını 3 tabanında üslü ifade olarak yazıp hangi iki karenin birbirine denk olduğunu bulunuz.   *b)* Bu üç karedeki buğday sayılarının çarpımını 3 tabanında tek bir üslü ifade olarak yazınız.
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 8 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 8 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Laboratuvarda üretilen yapay örümcek ipeği lifinin mikron düzeyindeki çapı $0,00048$ metre olarak ölçülmüştür. Bu ölçüm $0,00048 = 48 times 10^a = 0,48 times 10^b$ eşitlikleriyle verilmiştir.
  #v(0.5mm)
  *a)* $a$ ve $b$ tam sayılarının değerlerini bulunuz. #h(5mm)
  *b)* $(a + b)$ ve $(a - b)$ işlemlerinin sonuçlarını hesaplayınız.
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 9 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 9 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Biyoteknolojide DNA sarmalının çapı $2,5 times 10^(-9)$ metre; astrofizikte Dünya ile Güneş arasındaki ortalama mesafe ise $149 600 000$ kilometredir.
  #v(0.5mm)
  *a)* DNA çapının neden bilimsel gösterim kuralına ($a times 10^n$, $1 <= |a| < 10$) uyduğunu açıklayınız.   *b)* Dünya ile Güneş arasındaki mesafeyi *metre* cinsinden bilimsel gösterimle yazınız ($1$ km $= 10^3$ m).   *c)* Bu iki bilimsel gösterimdeki 10'un kuvvetleri arasındaki farkı ($n_1 - n_2$) bulunuz.
  #v(0.8mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]
