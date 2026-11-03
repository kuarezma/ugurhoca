
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
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[ÖĞRETMEN ÇÖZÜM ANAHTARI] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[VE PUANLAMA CETVELİ]]
      ]
    ]
  )
  
  #v(1.2mm)
  #rect(width: 100%, stroke: 0.5pt + rgb("#b91c1c"), radius: 3pt, fill: rgb("#fef2f2"), inset: (x: 4mm, y: 1.5mm))[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#b91c1c"))[NOT:] #h(1mm) #text(size: 7.8pt, fill: rgb("#1e293b"))[Bu nüsha ders öğretmenleri için MEB açık uçlu soru yönergeleri ve kazanım puanlama adımları esas alınarak hazırlanmıştır.]
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.1.1]]
  )
  #v(0.6mm)
  Antik Babil astronomisinde ve takvim hesaplarında kullanılan 360 ve 540 sayıları incelenmektedir.
  #v(0.5mm)
  *a)* 360 ve 540 sayılarını asal çarpanlarının üslü ifadelerinin çarpımı biçiminde yazınız.   *b)* Bu iki sayının her birinin pozitif tam sayı çarpan sayısını ve *asal olmayan* pozitif tam sayı çarpan sayısını bulunuz.
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* $360 = 2^3 times 3^2 times 5^1$ *(3p)* | $540 = 2^2 times 3^3 times 5^1$ *(3p)*.     *b)* 360 için: $(3+1) times (2+1) times (1+1) = 4 times 3 times 2 = 24$ pozitif çarpan; asal olanlar 3 tane ($2, 3, 5$) $arrow$ Asal olmayan çarpan sayısı $= 24 - 3 = 21$ *(2p)*.     540 için: $(2+1) times (3+1) times (1+1) = 3 times 4 times 2 = 24$ pozitif çarpan; asal olanlar 3 tane $arrow$ Asal olmayan çarpan sayısı $= 24 - 3 = 21$ *(2p)*.
  ]

]

#v(1.2mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.1.2]]
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
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* Karenin kenarı 168 ve 210'un en büyük ortak böleni olmalıdır: $"EBOB"(168, 210) = 42$ cm *(9p)*.     *b)* Fotoğraf sayısı $= (168 div 42) times (210 div 42) = 4 times 5 = 20$ adet fotoğraf gerekir *(6p)*.
  ]

]

#v(1.2mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.1.2]]
  )
  #v(0.6mm)
  GÖKTÜRK-X uydusu her 45 dakikada bir, İMECE-Y uydusu ise her 60 dakikada bir Ankara Yer İstasyonu üzerinden geçmektedir. Bu iki uydu ilk kez sabah saat 08.15'te birlikte istasyon üzerinden geçmiştir.
  #v(0.5mm)
  *Bu uydular aynı gün saat 20.00'ye kadar kaç kez daha birlikte geçerler? Geçiş saatlerini belirleyiniz.*
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     Ortak geçiş periyodu $= "EKOK"(45, 60) = 180$ dakika $= 3$ saat *(6p)*.     1. Geçiş: 08.15 (başlangıç).     Sonraki geçişler: 11.15, 14.15 ve 17.15 *(6p)*. Bir sonraki geçiş $17.15 + 3 = 20.15$ olup $20.00$'den sonradır.     Dolayısıyla saat 20.00'ye kadar *3 kez daha* birlikte geçerler *(3p)*.
  ]

]

#v(1.2mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.1.3]]
  )
  #v(0.6mm)
  Kule saatindeki iki dişli çarkın diş sayıları $(2x + 3)$ ve 35 olup aralarındaki oran $(2x + 3) / 35 = 36 / 84$ eşitliğini sağlamaktadır.
  #v(0.5mm)
  *a)* $x$ doğal sayısının değerini bulunuz.   *b)* Bulduğunuz $x$ sayısı ile 18 sayısının aralarında asal olup olmadığını gerekçesiyle açıklayınız.
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* $36 / 84 = (36 div 12) / (84 div 12) = 3 / 7$. Paydası 35 olacak şekilde genişletilirse: $3/7 = (3 times 5)/(7 times 5) = 15/35$.     $2x + 3 = 15 arrow 2x = 12 arrow x = 6$ *(6p)*.     *b)* 6 ve 18 sayılarının bölenleri: 6'nın bölenleri (1, 2, 3, 6); 18'in bölenleri (1, 2, 3, 6, 9, 18). $"EBOB"(6, 18) = 6 eq.not 1$ olduğundan 6 ve 18 *aralarında asal değildir* *(4p)*.
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
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.2.1]]
  )
  #v(0.6mm)
  Radyoaktif karbon-14 kalibrasyon katsayıları $A = (-2)^6$, $B = -3^4$, $C = (-4)^(-2)$ ve $D = (-1/5)^(-3)$ olarak verilmiştir.
  #v(0.5mm)
  *a)* $A, B, C, D$ rasyonel ve tam sayı değerlerini hesaplayınız. #h(4mm)
  *b)* $(A + B) + (1 / C) + D$ işleminin sonucunu bulunuz.
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* $A = (-2)^6 = +64$ *(2p)* | $B = -3^4 = -81$ *(2p)* | $C = (-4)^(-2) = 1 / (-4)^2 = 1/16$ *(2p)* | $D = (-1/5)^(-3) = (-5)^3 = -125$ *(2p)*.     *b)* $1 / C = 1 / (1/16) = 16$. İşlem: $(64 + (-81)) + 16 + (-125) = (-17) + 16 - 125 = -1 - 125 = -126$ *(2p)*.
  ]

]

#v(1.2mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.2.2]]
  )
  #v(0.6mm)
  Ulusal Dijital Kütüphane veri merkezinde $8^6$ adet tarihi belgenin her biri $16^4$ bayt depolama alanı kaplamaktadır. Arşivlenen tüm veri $4^5$ adet eş kapasiteli bulut sunucuya eşit paylaştırılmıştır.
  #v(0.5mm)
  *Buna göre bir sunucuya yüklenen veri miktarını 2 tabanında üslü ifade olarak hesaplayınız.*
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     2 tabanına dönüştürme: $8^6 = (2^3)^6 = 2^18$ adet belge; $16^4 = (2^4)^4 = 2^16$ bayt; Sunucu sayısı $= 4^5 = (2^2)^5 = 2^10$ *(4p)*.     Toplam veri miktarı $= 2^18 times 2^16 = 2^(18+16) = 2^34$ bayt *(3p)*.     Bir sunucudaki veri $= 2^34 div 2^10 = 2^(34-10) =$ *$2^24$* bayt *(3p)*.
  ]

]

#v(1.2mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.2.2]]
  )
  #v(0.6mm)
  Satranç tahtasının 1. karesine $9^4$, 2. karesine $27^3$, 3. karesine ise $81^2$ adet buğday tanesi konulmuştur.
  #v(0.5mm)
  *a)* Bu üç karedeki buğday sayılarını 3 tabanında üslü ifade olarak yazıp hangi iki karenin birbirine denk olduğunu bulunuz.   *b)* Bu üç karedeki buğday sayılarının çarpımını 3 tabanında tek bir üslü ifade olarak yazınız.
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* 1. Kare: $9^4 = (3^2)^4 = 3^8$ buğday *(2p)*. 2. Kare: $27^3 = (3^3)^3 = 3^9$ buğday *(2p)*. 3. Kare: $81^2 = (3^4)^2 = 3^8$ buğday *(2p)*.     Dolayısıyla *1. ve 3. karelerdeki buğday sayıları birbirine denktir ($3^8$)*.     *b)* Çarpım: $3^8 times 3^9 times 3^8 = 3^(8 + 9 + 8) =$ *$3^25$* *(4p)*.
  ]

]

#v(1.2mm)

// --- SORU 8 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 8 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.2.4]]
  )
  #v(0.6mm)
  Laboratuvarda üretilen yapay örümcek ipeği lifinin mikron düzeyindeki çapı $0,00048$ metre olarak ölçülmüştür. Bu ölçüm $0,00048 = 48 times 10^a = 0,48 times 10^b$ eşitlikleriyle verilmiştir.
  #v(0.5mm)
  *a)* $a$ ve $b$ tam sayılarının değerlerini bulunuz. #h(5mm)
  *b)* $(a + b)$ ve $(a - b)$ işlemlerinin sonuçlarını hesaplayınız.
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* $0,00048 = 48 times 10^(-5) arrow a = -5$ *(4p)* | $0,00048 = 0,48 times 10^(-3) arrow b = -3$ *(4p)*.     *b)* $a + b = (-5) + (-3) = -8$ *(1p)* | $a - b = (-5) - (-3) = -5 + 3 = -2$ *(1p)*.
  ]

]

#v(1.2mm)

// --- SORU 9 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#b91c1c"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 9 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: M.8.1.2.5]]
  )
  #v(0.6mm)
  Biyoteknolojide DNA sarmalının çapı $2,5 times 10^(-9)$ metre; astrofizikte Dünya ile Güneş arasındaki ortalama mesafe ise $149 600 000$ kilometredir.
  #v(0.5mm)
  *a)* DNA çapının neden bilimsel gösterim kuralına ($a times 10^n$, $1 <= |a| < 10$) uyduğunu açıklayınız.   *b)* Dünya ile Güneş arasındaki mesafeyi *metre* cinsinden bilimsel gösterimle yazınız ($1$ km $= 10^3$ m).   *c)* Bu iki bilimsel gösterimdeki 10'un kuvvetleri arasındaki farkı ($n_1 - n_2$) bulunuz.
  #v(0.8mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* Katsayı olan 2,5 sayısı $1 <= 2,5 < 10$ şartını sağladığı ve üs $-9 in ZZ$ olduğu için bilimsel gösterimdir *(3p)*.     *b)* $149 600 000$ km $= 149 600 000 times 10^3$ m $= 1,496 times 10^8 times 10^3$ m $= $ *$1,496 times 10^11$* metre *(5p)*.     *c)* $11 - (-9) = 11 + 9 =$ *$20$* *(2p)*.
  ]

]
