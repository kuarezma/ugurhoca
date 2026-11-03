
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
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[MEB SENARYO 3 UYUMLU] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[100 PUANLIK YAZILI]]
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
      [#align(right)[#box(stroke: 1pt + rgb("#d97706"), radius: 3pt, inset: (x: 2.5mm, y: 1mm), fill: rgb("#fffbeb"))[#text(size: 8.5pt, weight: "bold", fill: rgb("#d97706"))[Puan: [ #h(6mm) / 100 ]]]]]
    )
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(1mm)
  Sualtı arkeoloji araştırma ekibi deniz seviyesini 0 metre kabul ederek buldukları Batık A ($-2 1/4$ m), Batık B ($-7/3$ m), Batık C ($-5/4$ m) ve Şamandıra D ($+3/2$ m) konumlarını kaydetmiştir.
  #v(0.8mm)
  #align(center)[#image("../assets_yazili/sinif7_soru1_ogrenci.svg", width: 85%)]
  #v(0.5mm)
  *Bu dört konumu sayı doğrusunda işaretleyiniz ve bu sayıların tam sayılar ($ZZ$) ile rasyonel sayılar ($QQ$) kümeleriyle ilişkisini açıklayınız.*
  #v(1.2mm)
  
  #rect(width: 100%, height: 26mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.8mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(1mm)
  Derinkuyu Yeraltı Şehri havalandırma bacası seviye doğrusunda $[-4, -3]$ arası 4 eş parçaya (A noktası $-3$'ten sola 3. çizgi), $[-3, -2]$ arası 6 eş parçaya (B noktası $-2$'den sola 5. çizgi), $[-2, -1]$ arası 2 eş parçaya (C noktası orta çizgi) ve $[+1, +2]$ arası 4 eş parçaya (D noktası $+1$'den sağa 3. çizgi) bölünmüştür:
  #v(0.8mm)
  #align(center)[#image("../assets_yazili/sinif7_soru2.svg", width: 85%)]
  #v(0.5mm)
  *Buna göre $A, B, C, D$ noktalarına karşılık gelen rasyonel sayıları hem tam sayılı hem de bileşik kesir olarak yazınız.*
  #v(1.2mm)
  
  #rect(width: 100%, height: 24mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.8mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(1mm)
  Müzik konservatuvarı ses laboratuvarında ölçülen üç ritim frekans oranı $11/8$, $17/25$ ve $-9/16$ rasyonel sayıları olarak tespit edilmiştir.
  #v(0.8mm)
  *Bu rasyonel sayıları paydalarını 10'un pozitif kuvveti olacak biçimde genişleterek ve bölme işlemi adımlarını göstererek sonlu ondalık gösterime dönüştürünüz.*
  #v(1.2mm)
  
  #rect(width: 100%, height: 24mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
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
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Kuyumcu atölyesinde 14 ayar altın saflık oranı $14/24 = 7/12$, 22 ayar altın saflık oranı $22/24 = 11/12$ ve lehim katkı oranı $16/45$'tir.
  #v(0.5mm)
  *a)* Bu üç rasyonel sayının devirli ondalık açılımlarını devir çizgisi kullanarak gösteriniz.   *b)* Bu üç devirli ondalık sayının virgülden sonraki 25. basamağında yer alan rakamlarını bulunuz.
  #v(1mm)
  
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.5mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Uzun atlama pistinde yarışan 5 atletin atlayış anındaki rüzgâr hızı ölçüm sensörü verileri aşağıda verilmiştir:
  #align(center)[#text(weight: "bold")[Ece:] $-1,4$ m/sn #h(4mm) #text(weight: "bold")[Boran:] $-13/9$ m/sn #h(4mm) #text(weight: "bold")[Cemil:] $-7/5$ m/sn #h(4mm) #text(weight: "bold")[Derya:] $-1,45$ m/sn #h(4mm) #text(weight: "bold")[Emre:] $+9/8$ m/sn]
  #v(0.5mm)
  *Bu 5 rüzgâr hızı ölçümünü küçükten büyüğe doğru sıralayınız ($"..." < "..."$). Eşit olan değerleri belirtiniz.*
  #v(1mm)
  
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.5mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Dört baraj gölünün kurak geçen Ekim ayındaki su seviyesi değişim oranları tabloda verilmiştir:
  #align(center)[#text(weight: "bold")[Adatepe:] $-5/6$ #h(5mm) #text(weight: "bold")[Boztepe:] $-7/9$ #h(5mm) #text(weight: "bold")[Çamlıdere:] $-11/12$ #h(5mm) #text(weight: "bold")[Demirköprü:] $-13/18$]
  #v(0.5mm)
  *a)* Bu değişim oranlarını paydalarını eşitleyerek küçükten büyüğe doğru sıralayınız.   *b)* Su seviyesinde oransal olarak en çok kayıp yaşayan baraj ile en az kayıp yaşayan barajı belirleyiniz.
  #v(1mm)
  
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.5mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#d97706"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Geleneksel Ebru ustası Safiye Hanım, $3 1/2$ litre kitreli boya karışımının önce $2/7$'sini battal ebru zemininde kullanmış, ardından *kalan karışımın* $3/5$'ini lale motifleri için harcamıştır. Son olarak tekneye $3/4$ litre saf su ilave etmiştir.
  #v(0.5mm)
  *a)* 1. ve 2. aşamada harcanan boya karışımı miktarlarını litre cinsinden bulunuz.   *b)* Son durumda teknede bulunan toplam sıvı miktarını tam sayılı ve bileşik kesir olarak hesaplayınız.
  #v(1mm)
  
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]
