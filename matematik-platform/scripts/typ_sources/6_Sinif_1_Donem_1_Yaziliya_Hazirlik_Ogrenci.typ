
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
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[MEB ÜLKE GENELI ORTAK SINAV] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[100 PUANLIK YAZILI]]
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
      [#align(right)[#box(stroke: 1pt + rgb("#2563eb"), radius: 3pt, inset: (x: 2.5mm, y: 1mm), fill: rgb("#eff6ff"))[#text(size: 8.5pt, weight: "bold", fill: rgb("#2563eb"))[Puan: [ #h(6mm) / 100 ]]]]]
    )
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  29 Ekim Cumhuriyet Bayramı töreninde sahne alacak 84 kişilik Çocuk Korosu, her sırada eşit sayıda öğrenci bulunacak biçimde dikdörtgen bir düzende dizilecektir. Koro şefi sıra sayısının *5'ten fazla ve 25'ten az* olmasını istemektedir.
  #v(0.5mm)
  *Buna göre tüm farklı (sıra sayısı, sıradaki öğrenci sayısı) ikililerini listeleyiniz ve kaç farklı düzen kurulabileceğini bulunuz.*
  #v(1mm)
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.4mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Efes Antik Kenti kazısında bulunan tarihi bir amforanın dört basamaklı 7A4B envanter kodu hem 4'e hem de 9'a kalansız bölünebilmekte; ancak 5'e kalansız *bölünememektedir*.
  #v(0.5mm)
  *Buna göre $A$ ve $B$ basamak değerlerini belirleyerek $A + B$ toplamının alabileceği farklı değerleri bulunuz.*
  #v(1mm)
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.4mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
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
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.4mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Tarihi Saat Kulesi'ndeki küçük çan 18 dakikada bir, büyük çan ise 24 dakikada bir çalmaktadır. Bu iki çan ilk kez sabah saat 09.00'da birlikte çalmıştır.
  #v(0.5mm)
  *a)* İki çanın kaç dakikada bir aynı anda çaldığını (ortak katların en küçüğünü) hesaplayınız.   *b)* Bu iki çanın 3. kez birlikte saat kaçta çalacağını bulunuz.   *c)* 18 ve 24 sayılarının ortak bölenlerini listeleyiniz.
  #v(1mm)
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
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
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
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
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.4mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Okullar arası kısa kulvar yüzme yarışında Derin'in yarışı bitirme süresi $24,308$ saniye; Kaan'ın derecesinin çözümlenmiş hali ise $(2 times 10) + (4 times 1) + (7 times 1/100) + (5 times 1/1000)$ saniyedir.
  #v(0.5mm)
  *a)* Derin'in derecesini kesirlerle çözümleyiniz.   *b)* Kaan'ın derecesini ondalık gösterimle yazınız.   *c)* Yarışı hangi sporcunun daha önce bitirdiğini ondalık sayıları karşılaştırarak gerekçesiyle açıklayınız.
  #v(1mm)
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.4mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Avanos çömlek atölyesinde 1. grup öğrenci 27 kg kili 4 eş küpe, 2. grup öğrenci ise 34 kg kili 5 eş küpe eşit olarak paylaştırmıştır.
  #v(0.5mm)
  *a)* 1. gruptaki bir küpte kullanılan kil miktarını ondalık gösterimle yazınız.   *b)* 2. gruptaki bir küpte kullanılan kil miktarını ondalık gösterimle yazınız.   *c)* Bu iki gruptaki birer küpten hangisinde daha fazla kil kullanıldığını ve aralarındaki farkı kg cinsinden bulunuz.
  #v(1mm)
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.4mm)

// --- SORU 8 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#2563eb"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 8 (20 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Bilim ve Çocuk Yayınevi bastığı 600 adet matematik dergisinin $2/5$'sini köy okullarına bağışlamış, geriye kalan dergilerin ise %35'ini halk kütüphanelerine ayırmıştır. Yayınevi elde kalan diğer dergilerin tamamını tanesi 42,5 TL'den satmıştır.
  #v(0.5mm)
  *Buna göre yayınevinin sattığı dergilerden elde ettiği toplam geliri işlem basamaklarıyla bulunuz.*
  #v(1mm)
  
  #rect(width: 100%, height: 20mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]
