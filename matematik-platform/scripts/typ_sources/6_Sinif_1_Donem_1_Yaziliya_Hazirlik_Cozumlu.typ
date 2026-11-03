
#set page(
  paper: "a4",
  margin: (top: 9mm, bottom: 10mm, left: 10mm, right: 10mm),
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
#set text(font: "PT Sans", size: 8.5pt, fill: rgb("#0f172a"))
#set par(leading: 0.46em, justify: true)


// --- SINAV BAŞLIK KARTI ---
#rect(width: 100%, stroke: 1pt + rgb("#2563eb"), radius: 5pt, fill: rgb("#eff6ff"), inset: (x: 4mm, y: 2.5mm))[
  #grid(
    columns: (1fr, auto),
    gutter: 3mm,
    align: (left + horizon, right + horizon),
    [
      #text(size: 8pt, weight: "bold", fill: rgb("#64748b"), tracking: 0.5pt)[2026-2027 EĞİTİM-ÖĞRETİM YILI] \
      #v(-0.5mm)
      #text(size: 11pt, weight: "bold", fill: rgb("#2563eb"))[6. SINIF MATEMATİK DERSİ] \
      #v(-0.5mm)
      #text(size: 9pt, weight: "bold", fill: rgb("#1e293b"))[1. DÖNEM 1. YAZILIYA HAZIRLIK SINAVI]
    ],
    [
      #box(fill: rgb("#2563eb"), radius: 4pt, inset: (x: 3.5mm, y: 2.5mm))[
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[ÖĞRETMEN ÇÖZÜM ANAHTARI] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[VE PUANLAMA CETVELİ]]
      ]
    ]
  )
  
  #v(1.2mm)
  #rect(width: 100%, stroke: 0.5pt + rgb("#2563eb"), radius: 3pt, fill: rgb("#eff6ff"), inset: (x: 4mm, y: 1.5mm))[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#2563eb"))[NOT:] #h(1mm) #text(size: 7.8pt, fill: rgb("#1e293b"))[Bu nüsha ders öğretmenleri için MEB açık uçlu soru yönergeleri ve kazanım puanlama adımları esas alınarak hazırlanmıştır.]
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.1]]
  )
  #v(0.8mm)
  29 Ekim Cumhuriyet Bayramı töreninde sahne alacak 84 kişilik Çocuk Korosu, her sırada eşit sayıda öğrenci bulunacak biçimde dikdörtgen bir düzende dizilecektir. Koro şefi sıra sayısının *5'ten fazla ve 25'ten az* olmasını istemektedir.
  #v(0.5mm)
  *Buna göre tüm farklı (sıra sayısı, sıradaki öğrenci sayısı) ikililerini listeleyiniz ve kaç farklı düzen kurulabileceğini bulunuz.*
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     84 sayısının pozitif tam sayı çarpanları: 1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84 *(4p)*.     5 ile 25 arasındaki sıra sayıları: 6, 7, 12, 14, 21'dir. Uygun dizilişler:     (6 sıra, 14 öğrenci), (7 sıra, 12 öğrenci), (12 sıra, 7 öğrenci), (14 sıra, 6 öğrenci), (21 sıra, 4 öğrenci) olmak üzere *5 farklı düzen* kurulabilir *(6p)*.
  ]

]

#v(1.4mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.2]]
  )
  #v(0.8mm)
  Efes Antik Kenti kazısında bulunan tarihi bir amforanın dört basamaklı 7A4B envanter kodu hem 4'e hem de 9'a kalansız bölünebilmekte; ancak 5'e kalansız *bölünememektedir*.
  #v(0.5mm)
  *Buna göre $A$ ve $B$ basamak değerlerini belirleyerek $A + B$ toplamının alabileceği farklı değerleri bulunuz.*
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     4 ile bölünme: Son iki basamak 4B olmalıdır $arrow B in {{0, 4, 8}}$. Sayı 5 ile bölünemediğinden $B eq.not 0$ olur. Dolayısıyla $B = 4$ veya $B = 8$ *(4p)*.     *Durum 1 ($B = 4$):* $7 A 4 4 arrow 7 + A + 4 + 4 = 15 + A = 18 arrow A = 3$. Bu durumda $A + B = 3 + 4 = 7$ *(3p)*.     *Durum 2 ($B = 8$):* $7 A 4 8 arrow 7 + A + 4 + 8 = 19 + A = 27 arrow A = 8$. Bu durumda $A + B = 8 + 8 = 16$ *(3p)*.
  ]

]

#v(1.4mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.3]]
  )
  #v(0.8mm)
  #grid(columns: (1.3fr, 1fr), gutter: 3mm, align: horizon,
    [
      Biyoloji araştırmasında periyodik ağustosböceği popülasyonunun döngü katsayısı 210 olarak modellenmiş ve yandaki çarpan ağacı oluşturulmuştur.
      #v(0.8mm)
      *a)* Çarpan ağacındaki $A$ ve $B$ asal sayılarını bulunuz.       *b)* 210 sayısını asal çarpanlarının üslü çarpımı olarak yazınız.       *c)* 210 sayısının birbirinden farklı asal çarpanlarının toplamını bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif6_soru3.svg", width: 90%)]
    ]
  )
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* $35 = A times B$ ve $A < B$ asal sayıları $arrow A = 5, B = 7$ *(4p)*.     *b)* $210 = 2 times 3 times 5 times 7 = 2^1 times 3^1 times 5^1 times 7^1$ *(7p)*.     *c)* Farklı asal çarpanlar: 2, 3, 5, 7. Toplam $= 2 + 3 + 5 + 7 = 17$ *(4p)*.
  ]

]

#v(1.4mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.4]]
  )
  #v(0.8mm)
  Tarihi Saat Kulesi'ndeki küçük çan 18 dakikada bir, büyük çan ise 24 dakikada bir çalmaktadır. Bu iki çan ilk kez sabah saat 09.00'da birlikte çalmıştır.
  #v(0.5mm)
  *a)* İki çanın kaç dakikada bir aynı anda çaldığını (ortak katların en küçüğünü) hesaplayınız.   *b)* Bu iki çanın 3. kez birlikte saat kaçta çalacağını bulunuz.   *c)* 18 ve 24 sayılarının ortak bölenlerini listeleyiniz.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* 18'in katları: 18, 36, 54, 72, 90... | 24'ün katları: 24, 48, 72, 96... Ortak periyot $= "EKOK"(18, 24) = 72$ dk ($1$ saat $12$ dk) *(5p)*.     *b)* 1. birlikte çalış: 09.00 | 2. çalış: $09.00 + 1$ sa $12$ dk $= 10.12$ | 3. çalış: $10.12 + 1$ sa $12$ dk $= 11.24$ *(5p)*.     *c)* 18'in bölenleri: 1, 2, 3, 6, 9, 18 | 24'ün bölenleri: 1, 2, 3, 4, 6, 8, 12, 24 $arrow$ Ortak bölenler: 1, 2, 3, 6 *(5p)*.
  ]

]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("#2563eb"), radius: 3pt, fill: rgb("#eff6ff"), inset: (x: 3mm, y: 1.2mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 8pt, weight: "bold", fill: rgb("#2563eb"))[6. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Ortak Sınav)]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.5mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.6.1]]
  )
  #v(0.8mm)
  Kazdağları Milli Parkı'ndaki fotokapanın 1 ay boyunca kaydettiği 80 yaban hayvanının sıklık tablosu aşağıdadır:
  #v(0.8mm)
  #align(center)[
    #table(
      columns: (2.2fr, 1.2fr, 1.2fr, 1.5fr, 1.2fr),
      inset: (x: 3mm, y: 1.5mm),
      fill: (x, y) => if y == 0 { rgb("#eff6ff") } else { white },
      stroke: 0.5pt + rgb("#cbd5e1"),
      [*Tür*], [*Karaca*], [*Kızıl Geyik*], [*Yaban Tavşanı*], [*Vaşak*],
      [Kayıt Sayısı], [28], [20], [18], [14]
    )
  ]
  #v(0.5mm)
  *Buna göre fotokapanın bir sonraki kaydının "Kızıl Geyik" veya "Vaşak" olma deneysel olasılığını:*   *a)* En sade kesir biçiminde, #h(3mm) *b)* Ondalık gösterimle, #h(3mm) *c)* Yüzde (%) sembolüyle yazınız.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     Toplam deneme $= 80$. İstenen durum sayısı (Kızıl Geyik veya Vaşak) $= 20 + 14 = 34$ *(2p)*.     *a)* En sade kesir: $34 / 80 = (34 div 2) / (80 div 2) = 17 / 40$ *(3p)*.     *b)* Ondalık gösterim: $17 / 40 = (17 times 25) / (40 times 25) = 425 / 1000 = 0,425$ *(3p)*.     *c)* Yüzde sembolü: $425 / 1000 = 42,5 / 100 = %42,5$ *(2p)*.
  ]

]

#v(1.4mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.5]]
  )
  #v(0.8mm)
  Okullar arası kısa kulvar yüzme yarışında Derin'in yarışı bitirme süresi $24,308$ saniye; Kaan'ın derecesinin çözümlenmiş hali ise $(2 times 10) + (4 times 1) + (7 times 1/100) + (5 times 1/1000)$ saniyedir.
  #v(0.5mm)
  *a)* Derin'in derecesini kesirlerle çözümleyiniz.   *b)* Kaan'ın derecesini ondalık gösterimle yazınız.   *c)* Yarışı hangi sporcunun daha önce bitirdiğini ondalık sayıları karşılaştırarak gerekçesiyle açıklayınız.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* Derin: $24,308 = (2 times 10) + (4 times 1) + (3 times 1/10) + (8 times 1/1000)$ *(4p)*.     *b)* Kaan: $20 + 4 + 0,07 + 0,005 = 24,075$ saniye *(4p)*.     *c)* $24,075 < 24,308$ olduğundan Kaan mesafeyi daha kısa sürede yüzmüştür; dolayısıyla yarışı *Kaan daha önce bitirmiştir* *(2p)*.
  ]

]

#v(1.4mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.6]]
  )
  #v(0.8mm)
  Avanos çömlek atölyesinde 1. grup öğrenci 27 kg kili 4 eş küpe, 2. grup öğrenci ise 34 kg kili 5 eş küpe eşit olarak paylaştırmıştır.
  #v(0.5mm)
  *a)* 1. gruptaki bir küpte kullanılan kil miktarını ondalık gösterimle yazınız.   *b)* 2. gruptaki bir küpte kullanılan kil miktarını ondalık gösterimle yazınız.   *c)* Bu iki gruptaki birer küpten hangisinde daha fazla kil kullanıldığını ve aralarındaki farkı kg cinsinden bulunuz.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* 1. Grup: $27 / 4 = (27 times 25) / (4 times 25) = 675 / 100 = 6,75$ kg *(3p)*.     *b)* 2. Grup: $34 / 5 = (34 times 2) / (5 times 2) = 68 / 10 = 6,8 = 6,80$ kg *(3p)*.     *c)* $6,80 > 6,75$ olduğundan 2. gruptaki bir küpte daha fazla kil kullanılmıştır *(2p)*. Fark: $6,80 - 6,75 = 0,05$ kg *(2p)*.
  ]

]

#v(1.4mm)

// --- SORU 8 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 8 (20 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.6.1.7]]
  )
  #v(0.8mm)
  Bilim ve Çocuk Yayınevi bastığı 600 adet matematik dergisinin $2/5$'sini köy okullarına bağışlamış, geriye kalan dergilerin ise %35'ini halk kütüphanelerine ayırmıştır. Yayınevi elde kalan diğer dergilerin tamamını tanesi 42,5 TL'den satmıştır.
  #v(0.5mm)
  *Buna göre yayınevinin sattığı dergilerden elde ettiği toplam geliri işlem basamaklarıyla bulunuz.*
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *1. Aşama:* Bağışlanan dergi sayısı $= 600 times 2/5 = 240$ adet *(4p)*.     *2. Aşama:* Kalan dergi sayısı $= 600 - 240 = 360$ adet *(3p)*.     *3. Aşama:* Kütüphanelere ayrılan $= 360 times 35/100 = 126$ adet *(5p)*.     *4. Aşama:* Satılan dergi sayısı $= 360 - 126 = 234$ adet *(4p)*.     *5. Aşama:* Toplam gelir $= 234 times 42,5 = 9945$ TL *(4p)*.
  ]

]
