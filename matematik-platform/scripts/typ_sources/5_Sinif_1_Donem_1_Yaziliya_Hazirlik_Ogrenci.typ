
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
#rect(width: 100%, stroke: 1pt + rgb("#0d9488"), radius: 5pt, fill: rgb("#f0fdfa"), inset: (x: 4mm, y: 2.5mm))[
  #grid(
    columns: (1fr, auto),
    gutter: 3mm,
    align: (left + horizon, right + horizon),
    [
      #text(size: 8pt, weight: "bold", fill: rgb("#64748b"), tracking: 0.5pt)[2026-2027 EĞİTİM-ÖĞRETİM YILI] \
      #v(-0.5mm)
      #text(size: 11pt, weight: "bold", fill: rgb("#0d9488"))[5. SINIF MATEMATİK DERSİ] \
      #v(-0.5mm)
      #text(size: 9pt, weight: "bold", fill: rgb("#1e293b"))[1. DÖNEM 1. YAZILIYA HAZIRLIK SINAVI]
    ],
    [
      #box(fill: rgb("#0d9488"), radius: 4pt, inset: (x: 3.5mm, y: 2.5mm))[
        #align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[MEB SENARYO 2 UYUMLU] \ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[100 PUANLIK YAZILI]]
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
      [#align(right)[#box(stroke: 1pt + rgb("#0d9488"), radius: 3pt, inset: (x: 2.5mm, y: 1mm), fill: rgb("#f0fdfa"))[#text(size: 8.5pt, weight: "bold", fill: rgb("#0d9488"))[Puan: [ #h(6mm) / 100 ]]]]]
    )
  ]

]
#v(2mm)


// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(1mm)
  İznik çini ustası Ahmet Usta, tasarlayacağı yeni bordür deseni için birim kareli zemin üzerine geometrik çizgiler çizmiş ve noktaları harflendirmiştir:
  #v(1mm)
  #align(center)[#image("../assets_yazili/sinif5_soru1.svg", width: 75%)]
  #v(0.8mm)
  *a)* İki ucu sınırsız uzayan modeli sembolle gösteriniz. #h(4mm)
  *b)* Başlangıcı S olan ve T'den geçen modeli sembolle gösteriniz. \
  *c)* M ve N arasındaki modeli sembolle gösterip uzunluğunu birim cinsinden yazınız. \
  *d)* Birbirine paralel olanları sembolle yazınız. #h(4mm)
  *e)* Birbirine dik olan modelleri sembolle yazınız.
  #v(1.2mm)
  
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  Geleneksel Türk-İslam mimarisinde desen çizen Selim, bir $k$ doğrusunun dışındaki $A$ noktasından bu doğruya gönye ve cetvel yardımıyla dikme çizmek istemiştir. Selim'in uygulama adımları aşağıda verilmiştir:
  #text(size: 8pt)[
  *1. Adım:* Düz cetveli $k$ doğrusunun üzerine tam oturacak şekilde yerleştirdim.   *2. Adım:* Gönyenin $90°$'lik dik köşesini oluşturan dik kenarlarından birini cetvelin kenarına dayadım.   *3. Adım:* Gönyeyi cetvel boyunca kaydırarak diğer dik kenarının dışarıdaki $A$ noktasından geçmesini sağladım.   *4. Adım:* Gönyenin hipotenüs (en uzun/eğik) kenarı boyunca kurşun kalemle $A$ noktasından $k$ doğrusuna doğru bir çizgi çizdim.
  ]
  *Selim'in hangi adımı hatalıdır? Yapılan hatanın nedenini ve doğrusunun nasıl olması gerektiğini açıklayınız.*
  #v(1mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  #grid(columns: (1fr, 1.1fr), gutter: 3mm, align: horizon,
    [
      Bozcaada Deniz Feneri'nin optik lambası gece boyunca denizi taramaktadır. Fenerin merkezinden ($O$) geçen ışık huzmeleri iletki (açıölçer) üzerinde $[O A$ ($0°$), $[O B$ ($40°$), $[O C$ ($90°$), $[O D$ ($135°$) ve $[O E$ ($180°$) ışınları ile modellenmiştir.
      #v(0.8mm)
      *Buna göre aşağıdaki açıların ölçülerini ve çeşitlerini (dar / dik / geniş / doğru açı) yazınız:*       *a)* $s(A O B)$ #h(3mm) *b)* $s(A O C)$ #h(3mm) *c)* $s(A O D)$       *d)* $s(A O E)$ #h(3mm) *e)* $s(B O D)$
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru3.svg", width: 90%)]
    ]
  )
  #v(1mm)
  
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("#0d9488"), radius: 3pt, fill: rgb("#f0fdfa"), inset: (x: 3mm, y: 1.2mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 8pt, weight: "bold", fill: rgb("#0d9488"))[5. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 2)]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.5mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.8mm)
  #grid(columns: (1.2fr, 1fr), gutter: 3mm, align: horizon,
    [
      Halı dokuma tezgahındaki gergi mekanizmasında $d_1$, $d_2$ ve $d_3$ doğruları $O$ noktasında kesişmektedir. $d_1$ doğrusunun üst tarafında $58°$, $x$ ve $48°$'lik üç komşu açı, alt tarafında ise $y$ açısı bulunmaktadır.
      #v(0.8mm)
      *a)* Doğru açı kuralını kullanarak $x$ açısının ölçüsünü bulunuz.       *b)* Ters açılar özelliğini kullanarak $y$ açısının ölçüsünü bulunuz.       *c)* $x + y$ toplamının sonucunu bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru4.svg", width: 95%)]
    ]
  )
  #v(1mm)
  
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  Tarihi Beyazıt Kütüphanesi'nin vitray penceresinde yer alan 4 geometrik bölge incelenmektedir:
  #align(center)[#image("../assets_yazili/sinif5_soru5.svg", width: 78%)]
  #v(0.5mm)
  *a)* 1, 2 ve 3. bölgelerin neden çokgen *olmadığını* gerekçeleriyle açıklayınız.   *b)* 4. bölgedeki çokgenin adını, köşe noktalarını, kenar doğru parçalarını ve $A$ köşesinden çizilebilen köşegenlerini yazınız.
  #v(0.8mm)
  
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  #grid(columns: (1.25fr, 1fr), gutter: 3mm, align: horizon,
    [
      Selçuklu kümbet mimarisinde $B, C, D$ noktaları doğrusal zemin üzerindedir. $A B C$ ikizkenar üçgeninde $|A B| = |A C|$ ve tepe açısı $s(B A C) = 44°$'dir. Ona bitişik $A C D$ üçgeninde $s(A D C) = 38°$'dir.
      #v(0.6mm)
      *a)* $s(A B C)$ ve $s(A C B)$ taban açılarının ölçülerini bulunuz.       *b)* Doğru açıdan yararlanarak $s(A C D)$ açısının ölçüsünü bulunuz.       *c)* $A C D$ üçgeninde $s(C A D)$ açısının (?) ölçüsünü bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru6.svg", width: 92%)]
    ]
  )
  #v(0.8mm)
  
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]

#v(1.2mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("#0d9488"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Açık Uçlu Klasik Soru]]
  )
  #v(0.6mm)
  #grid(columns: (1.25fr, 1fr), gutter: 3mm, align: horizon,
    [
      Geleneksel Uçurtma Festivali için tasarlanan $K L M N$ paralelkenarında $|K L| = 35$ cm, $|L M| = 22$ cm ve $s(N K L) = 65°$'dir.
      #v(0.6mm)
      *a)* Karşılıklı kenarların uzunluklarını ($|M N|$ ve $|K N|$) yazıp paralelkenarın çevre uzunluğunu hesaplayınız.       *b)* Karşılıklı açı olan $s(L M N)$ açısının ölçüsünü bulunuz.       *c)* Ardışık açı olan $s(K L M)$ açısının ölçüsünü bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru7.svg", width: 92%)]
    ]
  )
  #v(0.8mm)
  
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]

]
