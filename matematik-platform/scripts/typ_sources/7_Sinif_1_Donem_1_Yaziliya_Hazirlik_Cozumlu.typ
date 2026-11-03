
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
#set par(leading: 0.48em, justify: true)


// --- SINAV BAŞLIK KARTI ---
#rect(width: 100%, stroke: 1pt + rgb("#d97706"), radius: 5pt, fill: rgb("#fffbeb"), inset: (x: 4mm, y: 2.5mm))[
  #grid(
    columns: (1fr, auto),
    gutter: 3mm,
    align: (left + horizon, right + horizon),
    [
      #text(size: 8pt, weight: "bold", fill: rgb("#64748b"), tracking: 0.5pt)[2026-2027 EĞİTİM-ÖĞRETİM YILI] \
      #v(-0.5mm)
      #text(size: 11pt, weight: "bold", fill: rgb("#d97706"))[7. SINIF MATEMATİK DERSİ] \
      #v(-0.5mm)
      #text(size: 9pt, weight: "bold", fill: rgb("#1e293b"))[1. DÖNEM 1. YAZILIYA HAZIRLIK SINAVI]
    ],
    [
      #box(fill: rgb("#d97706"), radius: 4pt, inset: (x: 3.5mm, y: 2.5mm))[
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[ÖĞRETMEN ÇÖZÜM ANAHTARI] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[VE PUANLAMA CETVELİ]]
      ]
    ]
  )
  
  #v(1.2mm)
  #rect(width: 100%, stroke: 0.5pt + rgb("#d97706"), radius: 3pt, fill: rgb("#fffbeb"), inset: (x: 4mm, y: 1.5mm))[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#d97706"))[NOT:] #h(1mm) #text(size: 7.8pt, fill: rgb("#1e293b"))[Bu nüsha ders öğretmenleri için MEB açık uçlu soru yönergeleri ve kazanım puanlama adımları esas alınarak hazırlanmıştır.]
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.1]]
  )
  #v(1mm)
  Sualtı arkeoloji araştırma ekibi deniz seviyesini 0 metre kabul ederek buldukları Batık A ($-2 1/4$ m), Batık B ($-7/3$ m), Batık C ($-5/4$ m) ve Şamandıra D ($+3/2$ m) konumlarını kaydetmiştir.
  #v(0.8mm)
  #align(center)[#image("../assets_yazili/sinif7_soru1_cozumlu.svg", width: 85%)]
  #v(0.5mm)
  *Bu dört konumu sayı doğrusunda işaretleyiniz ve bu sayıların tam sayılar ($ZZ$) ile rasyonel sayılar ($QQ$) kümeleriyle ilişkisini açıklayınız.*
  #v(1.2mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *Sayı Doğrusu Konumları:* Batık B ($-7/3 approx -2,33$, $-2$ ile $-3$ arasında $-7/3$), Batık A ($-2 1/4 = -2,25$, B'nin sağında), Batık C ($-5/4 = -1,25$, $-1$ ile $-2$ arasında), Şamandıra D ($+3/2 = +1,5$, $+1$ ile $+2$'nin tam ortasında) *(8p)*.     *Küme İlişkisi:* Her biri $a/b$ ($b eq.not 0, a, b in ZZ$) biçiminde ifade edildiği için $QQ$ kümesinin elemanıdır; ancak tam sayı olmadıkları için $ZZ$ kümesine ait değillerdir *(2p)*.
  ]

]

#v(1.8mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.1]]
  )
  #v(1mm)
  Derinkuyu Yeraltı Şehri havalandırma bacası seviye doğrusunda $[-4, -3]$ arası 4 eş parçaya (A noktası $-3$'ten sola 3. çizgi), $[-3, -2]$ arası 6 eş parçaya (B noktası $-2$'den sola 5. çizgi), $[-2, -1]$ arası 2 eş parçaya (C noktası orta çizgi) ve $[+1, +2]$ arası 4 eş parçaya (D noktası $+1$'den sağa 3. çizgi) bölünmüştür:
  #v(0.8mm)
  #align(center)[#image("../assets_yazili/sinif7_soru2.svg", width: 85%)]
  #v(0.5mm)
  *Buna göre $A, B, C, D$ noktalarına karşılık gelen rasyonel sayıları hem tam sayılı hem de bileşik kesir olarak yazınız.*
  #v(1.2mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *A:* $-3$ ile $-4$ arasında 4 parçadan 3.'sü $arrow A = -3 3/4 = -15/4$ *(4p)*.     *B:* $-2$ ile $-3$ arasında 6 parçadan 5.'si $arrow B = -2 5/6 = -17/6$ *(4p)*.     *C:* $-1$ ile $-2$ arasında 2 parçadan 1.'si $arrow C = -1 1/2 = -3/2$ *(3p)*.     *D:* $+1$ ile $+2$ arasında 4 parçadan 3.'sü $arrow D = +1 3/4 = +7/4$ *(4p)*.
  ]

]

#v(1.8mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.2]]
  )
  #v(1mm)
  Müzik konservatuvarı ses laboratuvarında ölçülen üç ritim frekans oranı $11/8$, $17/25$ ve $-9/16$ rasyonel sayıları olarak tespit edilmiştir.
  #v(0.8mm)
  *Bu rasyonel sayıları paydalarını 10'un pozitif kuvveti olacak biçimde genişleterek ve bölme işlemi adımlarını göstererek sonlu ondalık gösterime dönüştürünüz.*
  #v(1.2mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *1)* $11 / 8 = (11 times 125) / (8 times 125) = 1375 / 1000 = 1,375$ *(5p)*.     *2)* $17 / 25 = (17 times 4) / (25 times 4) = 68 / 100 = 0,68$ *(5p)*.     *3)* $-9 / 16 = -(9 times 625) / (16 times 625) = -5625 / 10000 = -0,5625$ *(5p)*.
  ]

]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("#d97706"), radius: 3pt, fill: rgb("#fffbeb"), inset: (x: 3mm, y: 1.2mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 8pt, weight: "bold", fill: rgb("#d97706"))[7. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 3)]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.5mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.2]]
  )
  #v(0.8mm)
  Kuyumcu atölyesinde 14 ayar altın saflık oranı $14/24 = 7/12$, 22 ayar altın saflık oranı $22/24 = 11/12$ ve lehim katkı oranı $16/45$'tir.
  #v(0.5mm)
  *a)* Bu üç rasyonel sayının devirli ondalık açılımlarını devir çizgisi kullanarak gösteriniz.   *b)* Bu üç devirli ondalık sayının virgülden sonraki 25. basamağında yer alan rakamlarını bulunuz.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *1)* $7 / 12 = 0,58333... = 0,58accent(3, -)$. Virgülden sonra 1. basamak 5, 2. basamak 8, 3. basamaktan itibaren hep 3 tekrarlar $arrow$ 25. basamak: *3* *(5p)*.     *2)* $11 / 12 = 0,91666... = 0,91accent(6, -)$. 1. basamak 9, 2. basamak 1, 3. basamaktan itibaren hep 6 tekrarlar $arrow$ 25. basamak: *6* *(5p)*.     *3)* $16 / 45 = 0,3555... = 0,3accent(5, -)$. 1. basamak 3, 2. basamaktan itibaren hep 5 tekrarlar $arrow$ 25. basamak: *5* *(5p)*.
  ]

]

#v(1.5mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.3]]
  )
  #v(0.8mm)
  Uzun atlama pistinde yarışan 5 atletin atlayış anındaki rüzgâr hızı ölçüm sensörü verileri aşağıda verilmiştir:
  #align(center)[#text(weight: "bold")[Ece:] $-1,4$ m/sn #h(4mm) #text(weight: "bold")[Boran:] $-13/9$ m/sn #h(4mm) #text(weight: "bold")[Cemil:] $-7/5$ m/sn #h(4mm) #text(weight: "bold")[Derya:] $-1,45$ m/sn #h(4mm) #text(weight: "bold")[Emre:] $+9/8$ m/sn]
  #v(0.5mm)
  *Bu 5 rüzgâr hızı ölçümünü küçükten büyüğe doğru sıralayınız ($"..." < "..."$). Eşit olan değerleri belirtiniz.*
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     Değerlerin ondalık karşılıkları: Emre $= +9/8 = +1,125$ (tek pozitif sayı, en büyük) *(2p)*.     Negatif sayılar: Ece $= -1,40$ | Cemil $= -7/5 = -1,40$ (Ece ile Cemil eşittir!) *(2p)*.     Boran $= -13/9 = -1,444...$ *(2p)* | Derya $= -1,45$ *(2p)*.     Negatiflerde mutlak değeri büyük olan daha küçüktür: $-1,45 < -1,444... < -1,40$     *Sıralama:* *$-1,45 < -13/9 < -7/5 = -1,4 < +9/8$* *(Derya < Boran < Cemil = Ece < Emre)* *(7p)*.
  ]

]

#v(1.5mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.3]]
  )
  #v(0.8mm)
  Dört baraj gölünün kurak geçen Ekim ayındaki su seviyesi değişim oranları tabloda verilmiştir:
  #align(center)[#text(weight: "bold")[Adatepe:] $-5/6$ #h(5mm) #text(weight: "bold")[Boztepe:] $-7/9$ #h(5mm) #text(weight: "bold")[Çamlıdere:] $-11/12$ #h(5mm) #text(weight: "bold")[Demirköprü:] $-13/18$]
  #v(0.5mm)
  *a)* Bu değişim oranlarını paydalarını eşitleyerek küçükten büyüğe doğru sıralayınız.   *b)* Su seviyesinde oransal olarak en çok kayıp yaşayan baraj ile en az kayıp yaşayan barajı belirleyiniz.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     *a)* Paydalar 36'da eşitlenir: Adatepe $= -5/6 = -30/36$ | Boztepe $= -7/9 = -28/36$ | Çamlıdere $= -11/12 = -33/36$ | Demirköprü $= -13/18 = -26/36$ *(6p)*.     Sıralama: $-33/36 < -30/36 < -28/36 < -26/36 arrow$ *$-11/12 < -5/6 < -7/9 < -13/18$* *(4p)*.     *b)* En çok su kaybeden: Çamlıdere ($-11/12$, en küçük rasyonel sayı) *(2.5p)*; En az su kaybeden: Demirköprü ($-13/18$, 0'a en yakın negatif sayı) *(2.5p)*.
  ]

]

#v(1.5mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Kazanım: MAT.7.1.4]]
  )
  #v(0.8mm)
  Geleneksel Ebru ustası Safiye Hanım, $3 1/2$ litre kitreli boya karışımının önce $2/7$'sini battal ebru zemininde kullanmış, ardından *kalan karışımın* $3/5$'ini lale motifleri için harcamıştır. Son olarak tekneye $3/4$ litre saf su ilave etmiştir.
  #v(0.5mm)
  *a)* 1. ve 2. aşamada harcanan boya karışımı miktarlarını litre cinsinden bulunuz.   *b)* Son durumda teknede bulunan toplam sıvı miktarını tam sayılı ve bileşik kesir olarak hesaplayınız.
  #v(1mm)
  
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:]     Başlangıç: $3 1/2 = 7/2$ L.     *a)* 1. Aşama harcanan: $7/2 times 2/7 = 1$ Litre *(2.5p)*. Kalan boya: $7/2 - 1 = 5/2$ L.     2. Aşama harcanan: $5/2 times 3/5 = 3/2$ Litre *(2.5p)*. Kalan boya: $5/2 - 3/2 = 2/2 = 1$ L *(5p)*.     *b)* Su eklendikten sonraki toplam sıvı: $1 + 3/4 = 7/4$ Litre $= $ *7/4* Litre $= $ *1 3/4* Litre *(5p)*.
  ]

]
