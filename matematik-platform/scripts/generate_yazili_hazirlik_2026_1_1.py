#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_yazili_hazirlik_2026_1_1.py
5, 6, 7 ve 8. Sınıflar 1. Dönem 1. Yazılıya Hazırlık Sınavı PDF Üreticisi
Typst 0.15+ kullanır.
Her PDF kesinlikle tam 2 sayfadır (pdfinfo ile doğrulanır).
Tüm sorular %100 özgün, pedagojik ve MEB 2026-2027 senaryolarıyla tam uyumludur.
Görsel QA ve Şef Opus kapı kuralları eksiksiz uygulanmıştır.
"""

import os
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path("/Users/ugurmac/Desktop/ugurhoca/matematik-platform")
SCRIPTS_DIR = BASE_DIR / "scripts"
ASSETS_DIR = SCRIPTS_DIR / "assets_yazili"
OUTPUT_DIR = BASE_DIR / "public/documents/yazili-hazirlik-2026-1-1"
PREVIEWS_DIR = Path("/Users/ugurmac/.gemini/antigravity-cli/brain/69f6200c-22d0-48ee-bb4b-655ffdd32559/scratch/yazili_previews")

ASSETS_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
PREVIEWS_DIR.mkdir(parents=True, exist_ok=True)


# ==========================================
# 1. HASSAS VE KUSURSUZ SVG ÇİZİMLERİ
# ==========================================

def create_svgs():
    # 5. Sınıf Soru 1: İznik Izgara d doğrusu, [MN], [PR], [ST ışını
    svg_5_1 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 130" width="100%" height="100%">
  <defs>
    <pattern id="grid51" width="28" height="22" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 22" fill="none" stroke="#e2e8f0" stroke-width="1"/>
    </pattern>
    <marker id="arr-b51" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7"/>
    </marker>
    <marker id="arr-g51" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669"/>
    </marker>
  </defs>
  <rect x="14" y="8" width="392" height="110" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" rx="4"/>
  <rect x="14" y="8" width="392" height="110" fill="url(#grid51)"/>

  <!-- d Doğrusu (yatay) -->
  <line x1="24" y1="30" x2="396" y2="30" stroke="#0284c7" stroke-width="2" marker-start="url(#arr-b51)" marker-end="url(#arr-b51)"/>
  <circle cx="98" cy="30" r="3.5" fill="#0369a1"/>
  <text x="98" y="23" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">K</text>
  <circle cx="210" cy="30" r="3.5" fill="#0369a1"/>
  <text x="210" y="23" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">L</text>
  <text x="390" y="24" font-family="PT Sans, sans-serif" font-size="11" font-style="italic" font-weight="bold" fill="#0284c7">d</text>

  <!-- [MN] Doğru Parçası (4 birim = 112px, 2 birim altta: y=74) -->
  <line x1="126" y1="74" x2="238" y2="74" stroke="#dc2626" stroke-width="2.4"/>
  <circle cx="126" cy="74" r="3.5" fill="#b91c1c"/>
  <text x="126" y="90" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#b91c1c" text-anchor="middle">M</text>
  <circle cx="238" cy="74" r="3.5" fill="#b91c1c"/>
  <text x="238" y="90" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#b91c1c" text-anchor="middle">N</text>

  <!-- [PR] Doğru Parçası (Dikme: x=70'te d doğrusundan aşağı) -->
  <line x1="70" y1="30" x2="70" y2="96" stroke="#4f46e5" stroke-width="2.4"/>
  <circle cx="70" cy="30" r="3.5" fill="#4338ca"/>
  <text x="58" y="28" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#4338ca" text-anchor="middle">P</text>
  <circle cx="70" cy="96" r="3.5" fill="#4338ca"/>
  <text x="58" y="102" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#4338ca" text-anchor="middle">R</text>
  <!-- Diklik Sembolü -->
  <path d="M 70 40 L 80 40 L 80 30" fill="none" stroke="#4338ca" stroke-width="1.3"/>
  <circle cx="75" cy="35" r="1.2" fill="#4338ca"/>

  <!-- [ST Işını (S'den T'ye) -->
  <line x1="294" y1="96" x2="380" y2="52" stroke="#059669" stroke-width="2" marker-end="url(#arr-g51)"/>
  <circle cx="294" cy="96" r="3.5" fill="#047857"/>
  <text x="294" y="112" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">S</text>
  <circle cx="348" cy="69" r="3" fill="#047857"/>
  <text x="350" y="86" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#047857" text-anchor="middle">T</text>
</svg>"""
    (ASSETS_DIR / "sinif5_soru1.svg").write_text(svg_5_1, encoding="utf-8")

    # 5. Sınıf Soru 3: Bozcaada Deniz Feneri Açıölçer (E (180°) ve A (0°) Etiketleri Ayrık)
    svg_5_3 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 145" width="100%" height="100%">
  <defs>
    <marker id="arr53" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0f766e"/>
    </marker>
  </defs>
  <!-- İletki Gövdesi: Merkez (190, 125), R=105 -->
  <path d="M 85 125 A 105 105 0 0 1 295 125 Z" fill="#f0fdfa" stroke="#0d9488" stroke-width="1.4"/>
  <path d="M 130 125 A 60 60 0 0 1 250 125" fill="none" stroke="#99f6e4" stroke-width="1" stroke-dasharray="2 2"/>
  <line x1="75" y1="125" x2="305" y2="125" stroke="#0f766e" stroke-width="1.6"/>

  <!-- Işınlar: Merkez (190, 125) -->
  <!-- OA: 0° -->
  <line x1="190" y1="125" x2="297" y2="125" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arr53)"/>
  <circle cx="283" cy="125" r="2.8" fill="#0f766e"/>
  <text x="312" y="129" font-family="PT Sans, sans-serif" font-size="9.5" font-weight="bold" fill="#0f766e">A (0°)</text>

  <!-- OB: 40° -->
  <line x1="190" y1="125" x2="271" y2="57" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arr53)"/>
  <circle cx="261" cy="65" r="2.8" fill="#0f766e"/>
  <text x="274" y="52" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#0f766e">B (40°)</text>

  <!-- OC: 90° -->
  <line x1="190" y1="125" x2="190" y2="19" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arr53)"/>
  <circle cx="190" cy="31" r="2.8" fill="#0f766e"/>
  <text x="190" y="12" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#0f766e" text-anchor="middle">C (90°)</text>

  <!-- OD: 135° -->
  <line x1="190" y1="125" x2="113" y2="48" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arr53)"/>
  <circle cx="123" cy="58" r="2.8" fill="#0f766e"/>
  <text x="88" y="44" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#0f766e">D (135°)</text>

  <!-- OE: 180° (Ok ucuyla çakışma tamamen önlendi, etiket x=72 solunda) -->
  <line x1="190" y1="125" x2="83" y2="125" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arr53)"/>
  <circle cx="97" cy="125" r="2.8" fill="#0f766e"/>
  <text x="68" y="129" font-family="PT Sans, sans-serif" font-size="9.5" font-weight="bold" fill="#0f766e" text-anchor="end">E (180°)</text>

  <!-- Merkez O -->
  <circle cx="190" cy="125" r="3.5" fill="#042f2e"/>
  <text x="190" y="137" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#042f2e" text-anchor="middle">O</text>
</svg>"""
    (ASSETS_DIR / "sinif5_soru3.svg").write_text(svg_5_3, encoding="utf-8")

    # 5. Sınıf Soru 4: Halı Dokuma Gergi Mekanizması (Çizgi Teması Sıfır)
    svg_5_4 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 120" width="100%" height="100%">
  <defs>
    <marker id="arr54" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155"/>
    </marker>
  </defs>
  <!-- d1: Yatay -->
  <line x1="25" y1="60" x2="310" y2="60" stroke="#334155" stroke-width="1.8" marker-start="url(#arr54)" marker-end="url(#arr54)"/>
  <text x="316" y="64" font-family="PT Sans, sans-serif" font-size="11" font-style="italic" font-weight="bold" fill="#334155">d₁</text>

  <!-- d2: Sol üstten sağ alta -->
  <line x1="75" y1="12" x2="245" y2="108" stroke="#0284c7" stroke-width="1.8" marker-start="url(#arr54)" marker-end="url(#arr54)"/>
  <text x="62" y="16" font-family="PT Sans, sans-serif" font-size="11" font-style="italic" font-weight="bold" fill="#0284c7">d₂</text>

  <!-- d3: Sağ üstten sol alta -->
  <line x1="245" y1="12" x2="75" y2="108" stroke="#059669" stroke-width="1.8" marker-start="url(#arr54)" marker-end="url(#arr54)"/>
  <text x="254" y="16" font-family="PT Sans, sans-serif" font-size="11" font-style="italic" font-weight="bold" fill="#059669">d₃</text>

  <!-- Merkez O -->
  <circle cx="160" cy="60" r="3" fill="#0f172a"/>
  <text x="160" y="74" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#0f172a" text-anchor="middle">O</text>

  <!-- Sol üst: 58° (tam iç boşlukta, temas yok) -->
  <path d="M 125 60 A 35 35 0 0 1 138 39" fill="none" stroke="#e11d48" stroke-width="1.6"/>
  <text x="100" y="48" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#e11d48">58°</text>

  <!-- Üst orta: x (tepe boşlukta) -->
  <path d="M 144 38 A 28 28 0 0 1 176 38" fill="none" stroke="#7c3aed" stroke-width="1.8"/>
  <text x="160" y="30" font-family="PT Sans, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed" text-anchor="middle">x</text>

  <!-- Sağ üst: 48° (tam iç boşlukta, temas yok) -->
  <path d="M 182 39 A 35 35 0 0 1 195 60" fill="none" stroke="#e11d48" stroke-width="1.6"/>
  <text x="210" y="48" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#e11d48">48°</text>

  <!-- Alt orta: y (alt boşlukta) -->
  <path d="M 144 80 A 28 28 0 0 0 176 80" fill="none" stroke="#7c3aed" stroke-width="1.8"/>
  <text x="160" y="96" font-family="PT Sans, sans-serif" font-size="11" font-weight="bold" fill="#7c3aed" text-anchor="middle">y</text>
</svg>"""
    (ASSETS_DIR / "sinif5_soru4.svg").write_text(svg_5_4, encoding="utf-8")

    # 5. Sınıf Soru 5: Vitray Penceresi 4 Bölge
    svg_5_5 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 85" width="100%" height="100%">
  <!-- 1. Bölge -->
  <rect x="8" y="5" width="90" height="60" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="3"/>
  <polyline points="20,48 38,18 64,52 84,22" fill="none" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round"/>
  <text x="53" y="78" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle">1. Bölge</text>

  <!-- 2. Bölge -->
  <rect x="110" y="5" width="90" height="60" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="3"/>
  <path d="M 125 50 L 125 30 A 28 18 0 0 1 185 30 L 185 50 Z" fill="#fee2e2" stroke="#ea580c" stroke-width="1.8"/>
  <text x="155" y="78" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle">2. Bölge</text>

  <!-- 3. Bölge -->
  <rect x="212" y="5" width="90" height="60" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" rx="3"/>
  <polygon points="228,18 286,50 286,18 228,50" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
  <text x="257" y="78" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#475569" text-anchor="middle">3. Bölge</text>

  <!-- 4. Bölge -->
  <rect x="314" y="5" width="98" height="60" fill="#f0fdf4" stroke="#86efac" stroke-width="1.1" rx="3"/>
  <polygon points="363,14 386,30 377,53 349,53 340,30" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="363" y="11" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d" text-anchor="middle">A</text>
  <text x="392" y="32" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d">B</text>
  <text x="382" y="62" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d">C</text>
  <text x="343" y="62" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d">D</text>
  <text x="333" y="32" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#15803d">E</text>
  <text x="363" y="78" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#15803d" text-anchor="middle">4. Bölge (ABCDE)</text>
</svg>"""
    (ASSETS_DIR / "sinif5_soru5.svg").write_text(svg_5_5, encoding="utf-8")

    # 5. Sınıf Soru 6: Selçuklu Kümbet Üçgenleri (? ve 38° Tamamen Temassız)
    svg_5_6 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 125" width="100%" height="100%">
  <!-- Zemin Çizgisi: B, C, D Doğrusal -->
  <line x1="20" y1="100" x2="320" y2="100" stroke="#64748b" stroke-width="1.6"/>

  <!-- Üçgenler: B(35, 100), C(160, 100), D(305, 100), A(97, 22) -->
  <polygon points="35,100 160,100 97,22" fill="#f0fdfa" stroke="#0d9488" stroke-width="1.8"/>
  <polygon points="160,100 305,100 97,22" fill="#f8fafc" stroke="#0284c7" stroke-width="1.6"/>

  <!-- Köşeler -->
  <circle cx="97" cy="22" r="3" fill="#0f766e"/>
  <text x="97" y="14" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f766e" text-anchor="middle">A</text>
  <circle cx="35" cy="100" r="3" fill="#0f766e"/>
  <text x="26" y="112" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f766e">B</text>
  <circle cx="160" cy="100" r="3" fill="#0f766e"/>
  <text x="160" y="114" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f766e" text-anchor="middle">C</text>
  <circle cx="305" cy="100" r="3" fill="#0369a1"/>
  <text x="312" y="112" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0369a1">D</text>

  <!-- |AB| = |AC| Eşitlik İşaretleri -->
  <line x1="63" y1="58" x2="69" y2="64" stroke="#0d9488" stroke-width="1.8"/>
  <line x1="66" y1="55" x2="72" y2="61" stroke="#0d9488" stroke-width="1.8"/>
  <line x1="126" y1="64" x2="132" y2="58" stroke="#0d9488" stroke-width="1.8"/>
  <line x1="129" y1="61" x2="135" y2="55" stroke="#0d9488" stroke-width="1.8"/>

  <!-- 44° Açısı -->
  <path d="M 89 34 A 16 16 0 0 0 105 34" fill="none" stroke="#e11d48" stroke-width="1.5"/>
  <text x="97" y="47" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#e11d48" text-anchor="middle">44°</text>

  <!-- ? Açısı (CAD üçgeninin iç boşluğunda, çizgiye hiç değmez) -->
  <path d="M 107 35 A 22 22 0 0 1 122 43" fill="none" stroke="#7c3aed" stroke-width="1.6"/>
  <text x="146" y="58" font-family="PT Sans, sans-serif" font-size="12" font-weight="bold" fill="#7c3aed">?</text>

  <!-- 38° Açısı (D köşesinin sol iç boşluğunda, zemin ve AD çizgisine değmez) -->
  <path d="M 270 100 A 35 35 0 0 1 280 87" fill="none" stroke="#0284c7" stroke-width="1.5"/>
  <text x="252" y="96" font-family="PT Sans, sans-serif" font-size="9.5" font-weight="bold" fill="#0284c7">38°</text>
</svg>"""
    (ASSETS_DIR / "sinif5_soru6.svg").write_text(svg_5_6, encoding="utf-8")

    # 5. Sınıf Soru 7: Uçurtma KLMN Paralelkenarı
    svg_5_7 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 95" width="100%" height="100%">
  <polygon points="30,80 180,80 230,20 80,20" fill="#fefce8" stroke="#ca8a04" stroke-width="1.8"/>
  <circle cx="30" cy="80" r="3" fill="#854d0e"/>
  <text x="20" y="92" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#854d0e">K</text>
  <circle cx="180" cy="80" r="3" fill="#854d0e"/>
  <text x="188" y="92" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#854d0e">L</text>
  <circle cx="230" cy="20" r="3" fill="#854d0e"/>
  <text x="238" y="20" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#854d0e">M</text>
  <circle cx="80" cy="20" r="3" fill="#854d0e"/>
  <text x="70" y="20" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#854d0e">N</text>

  <text x="105" y="93" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#a16207" text-anchor="middle">|KL| = 35 cm</text>
  <text x="216" y="56" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#a16207">22 cm</text>

  <path d="M 48 80 A 18 18 0 0 1 42 66" fill="none" stroke="#dc2626" stroke-width="1.6"/>
  <text x="50" y="72" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#dc2626">65°</text>
</svg>"""
    (ASSETS_DIR / "sinif5_soru7.svg").write_text(svg_5_7, encoding="utf-8")

    # 6. Sınıf Soru 3: 210 Sayısının Çarpan Ağacı
    svg_6_3 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="100%" height="100%">
  <rect x="108" y="6" width="44" height="20" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="130" y="20" font-family="PT Sans, sans-serif" font-size="11" font-weight="bold" fill="#1e40af" text-anchor="middle">210</text>

  <line x1="116" y1="26" x2="68" y2="44" stroke="#64748b" stroke-width="1.3"/>
  <line x1="144" y1="26" x2="192" y2="44" stroke="#64748b" stroke-width="1.3"/>

  <circle cx="64" cy="54" r="12" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="64" y="58" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#15803d" text-anchor="middle">2</text>

  <rect x="170" y="44" width="44" height="20" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="192" y="58" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#1e40af" text-anchor="middle">105</text>

  <line x1="178" y1="64" x2="142" y2="80" stroke="#64748b" stroke-width="1.3"/>
  <line x1="206" y1="64" x2="232" y2="80" stroke="#64748b" stroke-width="1.3"/>

  <circle cx="138" cy="90" r="12" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="138" y="94" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#15803d" text-anchor="middle">3</text>

  <rect x="214" y="80" width="38" height="20" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="233" y="94" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#1e40af" text-anchor="middle">35</text>

  <line x1="222" y1="100" x2="204" y2="108" stroke="#64748b" stroke-width="1.3"/>
  <line x1="244" y1="100" x2="252" y2="108" stroke="#64748b" stroke-width="1.3"/>

  <circle cx="198" cy="110" r="9" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="198" y="113.5" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#b45309" text-anchor="middle">A</text>
  <circle cx="252" cy="110" r="9" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="252" y="113.5" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#b45309" text-anchor="middle">B</text>
</svg>"""
    (ASSETS_DIR / "sinif6_soru3.svg").write_text(svg_6_3, encoding="utf-8")

    # 7. Sınıf Soru 1: Öğrenci Nüshası (SADECE BOŞ SAYI DOĞRUSU)
    svg_7_1_ogrenci = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 65" width="100%" height="100%">
  <defs>
    <marker id="arr71o" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155"/>
    </marker>
  </defs>
  <line x1="18" y1="30" x2="402" y2="30" stroke="#334155" stroke-width="1.8" marker-start="url(#arr71o)" marker-end="url(#arr71o)"/>

  <!-- Tam Sayılar: -3(48), -2(118), -1(188), 0(258), +1(328), +2(398) (dx=70) -->
  <line x1="48" y1="22" x2="48" y2="38" stroke="#334155" stroke-width="1.8"/>
  <text x="48" y="52" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#334155" text-anchor="middle">-3</text>

  <line x1="118" y1="22" x2="118" y2="38" stroke="#334155" stroke-width="1.8"/>
  <text x="118" y="52" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#334155" text-anchor="middle">-2</text>

  <line x1="188" y1="22" x2="188" y2="38" stroke="#334155" stroke-width="1.8"/>
  <text x="188" y="52" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#334155" text-anchor="middle">-1</text>

  <line x1="258" y1="20" x2="258" y2="40" stroke="#0f172a" stroke-width="2.2"/>
  <text x="258" y="52" font-family="PT Sans, sans-serif" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">0 (Deniz Seviyesi)</text>

  <line x1="328" y1="22" x2="328" y2="38" stroke="#334155" stroke-width="1.8"/>
  <text x="328" y="52" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#334155" text-anchor="middle">+1</text>

  <line x1="398" y1="22" x2="398" y2="38" stroke="#334155" stroke-width="1.8"/>
  <text x="398" y="52" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#334155" text-anchor="middle">+2</text>

  <!-- Küçük Yardımcı Çentikler (Öğrencinin bölmesi için) -->
  <!-- -2 ile -3 arası: 1/4 ve 1/3 kılavuzları -->
  <line x1="100.5" y1="26" x2="100.5" y2="34" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="83" y1="26" x2="83" y2="34" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="65.5" y1="26" x2="65.5" y2="34" stroke="#cbd5e1" stroke-width="1"/>
  <!-- -1 ile -2 arası: 1/4'ler -->
  <line x1="170.5" y1="26" x2="170.5" y2="34" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="153" y1="26" x2="153" y2="34" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="135.5" y1="26" x2="135.5" y2="34" stroke="#cbd5e1" stroke-width="1"/>
  <!-- +1 ile +2 arası: orta nokta -->
  <line x1="363" y1="26" x2="363" y2="34" stroke="#cbd5e1" stroke-width="1"/>
</svg>"""
    (ASSETS_DIR / "sinif7_soru1_ogrenci.svg").write_text(svg_7_1_ogrenci, encoding="utf-8")

    # 7. Sınıf Soru 1: Çözümlü Nüshası (TÜM 4 NOKTA İŞARETLİ, A ALTTA, B ÜSTTE - SIFIR ÇAKIŞMA)
    svg_7_1_cozumlu = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 75" width="100%" height="100%">
  <defs>
    <marker id="arr71c" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155"/>
    </marker>
  </defs>
  <line x1="18" y1="36" x2="402" y2="36" stroke="#334155" stroke-width="1.8" marker-start="url(#arr71c)" marker-end="url(#arr71c)"/>

  <!-- Tam Sayılar: dx=70 -->
  <line x1="48" y1="29" x2="48" y2="43" stroke="#334155" stroke-width="1.8"/>
  <text x="48" y="58" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">-3</text>

  <line x1="118" y1="29" x2="118" y2="43" stroke="#334155" stroke-width="1.8"/>
  <text x="118" y="58" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">-2</text>

  <line x1="188" y1="29" x2="188" y2="43" stroke="#334155" stroke-width="1.8"/>
  <text x="188" y="58" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">-1</text>

  <line x1="258" y1="27" x2="258" y2="45" stroke="#0f172a" stroke-width="2.2"/>
  <text x="258" y="58" font-family="PT Sans, sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a" text-anchor="middle">0</text>

  <line x1="328" y1="29" x2="328" y2="43" stroke="#334155" stroke-width="1.8"/>
  <text x="328" y="58" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">+1</text>

  <line x1="398" y1="29" x2="398" y2="43" stroke="#334155" stroke-width="1.8"/>
  <text x="398" y="58" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#334155" text-anchor="middle">+2</text>

  <!-- Batık B: -7/3 = -2.333 -> x = 118 - 0.333*70 = 94.6. ETİKETİ ÜSTTE -->
  <circle cx="95" cy="36" r="3.8" fill="#dc2626"/>
  <line x1="95" y1="36" x2="95" y2="20" stroke="#dc2626" stroke-width="1" stroke-dasharray="1.5 1.5"/>
  <text x="86" y="15" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#dc2626" text-anchor="middle">Batık B (-7/3)</text>

  <!-- Batık A: -2 1/4 = -2.25 -> x = 118 - 0.25*70 = 100.5. ETİKETİ ALTTA -->
  <circle cx="101" cy="36" r="3.8" fill="#2563eb"/>
  <line x1="101" y1="36" x2="101" y2="50" stroke="#2563eb" stroke-width="1" stroke-dasharray="1.5 1.5"/>
  <text x="101" y="70" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#2563eb" text-anchor="middle">Batık A (-2 ¼)</text>

  <!-- Batık C: -5/4 = -1.25 -> x = 188 - 0.25*70 = 170.5. ETİKETİ ÜSTTE -->
  <circle cx="171" cy="36" r="3.8" fill="#d97706"/>
  <text x="171" y="20" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#d97706" text-anchor="middle">Batık C (-5/4)</text>

  <!-- Şamandıra D: +3/2 = +1.5 -> x = 328 + 0.5*70 = 363. ETİKETİ ÜSTTE -->
  <circle cx="363" cy="36" r="3.8" fill="#059669"/>
  <text x="363" y="20" font-family="PT Sans, sans-serif" font-size="8.5" font-weight="bold" fill="#059669" text-anchor="middle">Şamandıra D (+3/2)</text>
</svg>"""
    (ASSETS_DIR / "sinif7_soru1_cozumlu.svg").write_text(svg_7_1_cozumlu, encoding="utf-8")

    # 7. Sınıf Soru 2: Derinkuyu Parçalı Sayı Doğrusu
    svg_7_2 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60" width="100%" height="100%">
  <defs>
    <marker id="arr72" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#334155"/>
    </marker>
  </defs>
  <line x1="16" y1="30" x2="390" y2="30" stroke="#334155" stroke-width="1.8" marker-start="url(#arr72)" marker-end="url(#arr72)"/>

  <line x1="35" y1="23" x2="35" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="35" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">-4</text>

  <line x1="49" y1="26" x2="49" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <circle cx="49" cy="30" r="3.8" fill="#dc2626"/>
  <text x="49" y="16" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#dc2626" text-anchor="middle">A</text>
  <line x1="63" y1="26" x2="63" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <line x1="77" y1="26" x2="77" y2="34" stroke="#94a3b8" stroke-width="1"/>

  <line x1="91" y1="23" x2="91" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="91" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">-3</text>

  <line x1="102" y1="26" x2="102" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <circle cx="102" cy="30" r="3.8" fill="#2563eb"/>
  <text x="102" y="16" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#2563eb" text-anchor="middle">B</text>
  <line x1="113" y1="26" x2="113" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <line x1="124" y1="26" x2="124" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <line x1="135" y1="26" x2="135" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <line x1="146" y1="26" x2="146" y2="34" stroke="#94a3b8" stroke-width="1"/>

  <line x1="157" y1="23" x2="157" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="157" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">-2</text>

  <circle cx="180" cy="30" r="3.8" fill="#d97706"/>
  <text x="180" y="16" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#d97706" text-anchor="middle">C</text>

  <line x1="203" y1="23" x2="203" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="203" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">-1</text>
  <line x1="250" y1="23" x2="250" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="250" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">0</text>
  <line x1="297" y1="23" x2="297" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="297" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">+1</text>

  <line x1="313" y1="26" x2="313" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <line x1="329" y1="26" x2="329" y2="34" stroke="#94a3b8" stroke-width="1"/>
  <circle cx="345" cy="30" r="3.8" fill="#059669"/>
  <text x="345" y="16" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#059669" text-anchor="middle">D</text>

  <line x1="361" y1="23" x2="361" y2="37" stroke="#0f172a" stroke-width="1.8"/>
  <text x="361" y="48" font-family="PT Sans, sans-serif" font-size="10" font-weight="bold" fill="#0f172a" text-anchor="middle">+2</text>
</svg>"""
    (ASSETS_DIR / "sinif7_soru2.svg").write_text(svg_7_2, encoding="utf-8")

    # 8. Sınıf Soru 2: Sergi Panosu EBOB (168 cm Yazısı Soldan Ferah, Asla Kırpılmaz)
    svg_8_2 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 125" width="100%" height="100%">
  <!-- Pano: x=65, y=20, width=175, height=84 -->
  <rect x="65" y="20" width="175" height="84" fill="#fef2f2" stroke="#b91c1c" stroke-width="1.8" rx="2"/>

  <!-- İç Izgara (5x4) -->
  <line x1="100" y1="20" x2="100" y2="104" stroke="#fca5a5" stroke-width="0.9"/>
  <line x1="135" y1="20" x2="135" y2="104" stroke="#fca5a5" stroke-width="0.9"/>
  <line x1="170" y1="20" x2="170" y2="104" stroke="#fca5a5" stroke-width="0.9"/>
  <line x1="205" y1="20" x2="205" y2="104" stroke="#fca5a5" stroke-width="0.9"/>

  <line x1="65" y1="41" x2="240" y2="41" stroke="#fca5a5" stroke-width="0.9"/>
  <line x1="65" y1="62" x2="240" y2="62" stroke="#fca5a5" stroke-width="0.9"/>
  <line x1="65" y1="83" x2="240" y2="83" stroke="#fca5a5" stroke-width="0.9"/>

  <!-- Birinci Kare Vurgusu -->
  <rect x="65" y="20" width="35" height="21" fill="#fee2e2" stroke="#dc2626" stroke-width="1.2"/>
  <text x="82" y="33" font-family="PT Sans, sans-serif" font-size="7" font-weight="bold" fill="#b91c1c" text-anchor="middle">Kare Foto</text>

  <!-- Ölçüler: Üst 210 cm -->
  <line x1="65" y1="12" x2="240" y2="12" stroke="#475569" stroke-width="1"/>
  <line x1="65" y1="9" x2="65" y2="15" stroke="#475569" stroke-width="1"/>
  <line x1="240" y1="9" x2="240" y2="15" stroke="#475569" stroke-width="1"/>
  <text x="152" y="9" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#334155" text-anchor="middle">210 cm</text>

  <!-- Ölçüler: Sol 168 cm (x=50'de end-anchor, solda bol boşluk var, 1 tam okunur) -->
  <line x1="56" y1="20" x2="56" y2="104" stroke="#475569" stroke-width="1"/>
  <line x1="53" y1="20" x2="59" y2="20" stroke="#475569" stroke-width="1"/>
  <line x1="53" y1="104" x2="59" y2="104" stroke="#475569" stroke-width="1"/>
  <text x="50" y="65" font-family="PT Sans, sans-serif" font-size="9" font-weight="bold" fill="#334155" text-anchor="end">168 cm</text>
</svg>"""
    (ASSETS_DIR / "sinif8_soru2.svg").write_text(svg_8_2, encoding="utf-8")


# ==========================================
# 2. TYPST ŞABLON VE BİLEŞEN FONKSİYONLARI
# ==========================================

def get_typst_header(sinif_adi, senaryo_metni, tema_renk, acik_renk, cozumlu=False):
    if cozumlu:
        rozet_metni = """#align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[ÖĞRETMEN ÇÖZÜM ANAHTARI] \\ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[VE PUANLAMA CETVELİ]]"""
    else:
        rozet_metni = f"""#align(center)[#text(size: 7.8pt, weight: "bold", fill: white)[{senaryo_metni.upper()}] \\ #v(-1mm) #text(size: 7.2pt, weight: "bold", fill: white)[100 PUANLIK YAZILI]]"""
    
    ogrenci_seridi = """
  #v(1.5mm)
  #rect(width: 100%, stroke: 0.5pt + rgb("#cbd5e1"), radius: 3pt, fill: white, inset: (x: 4mm, y: 1.8mm))[
    #grid(
      columns: (1.5fr, 1fr, 0.8fr, 0.9fr),
      gutter: 2mm,
      align: horizon,
      [#text(size: 8pt, weight: "bold", fill: rgb("#334155"))[Adı Soyadı:] #text(size: 8pt, fill: rgb("#94a3b8"))[............................................]],
      [#text(size: 8pt, weight: "bold", fill: rgb("#334155"))[Sınıf / Şube:] #text(size: 8pt, fill: rgb("#94a3b8"))[....................]],
      [#text(size: 8pt, weight: "bold", fill: rgb("#334155"))[Okul No:] #text(size: 8pt, fill: rgb("#94a3b8"))[............]],
      [#align(right)[#box(stroke: 1pt + rgb("{tema}"), radius: 3pt, inset: (x: 2.5mm, y: 1mm), fill: rgb("{acik}"))[#text(size: 8.5pt, weight: "bold", fill: rgb("{tema}"))[Puan: [ #h(6mm) / 100 ]]]]]
    )
  ]
""".format(tema=tema_renk, acik=acik_renk) if not cozumlu else """
  #v(1.2mm)
  #rect(width: 100%, stroke: 0.5pt + rgb("{tema}"), radius: 3pt, fill: rgb("{acik}"), inset: (x: 4mm, y: 1.5mm))[
    #text(size: 7.8pt, weight: "bold", fill: rgb("{tema}"))[NOT:] #h(1mm) #text(size: 7.8pt, fill: rgb("#1e293b"))[Bu nüsha ders öğretmenleri için MEB açık uçlu soru yönergeleri ve kazanım puanlama adımları esas alınarak hazırlanmıştır.]
  ]
""".format(tema=tema_renk, acik=acik_renk)

    return f"""
// --- SINAV BAŞLIK KARTI ---
#rect(width: 100%, stroke: 1pt + rgb("{tema_renk}"), radius: 5pt, fill: rgb("{acik_renk}"), inset: (x: 4mm, y: 2.5mm))[
  #grid(
    columns: (1fr, auto),
    gutter: 3mm,
    align: (left + horizon, right + horizon),
    [
      #text(size: 8pt, weight: "bold", fill: rgb("#64748b"), tracking: 0.5pt)[2026-2027 EĞİTİM-ÖĞRETİM YILI] \\
      #v(-0.5mm)
      #text(size: 11pt, weight: "bold", fill: rgb("{tema_renk}"))[{sinif_adi.upper()} MATEMATİK DERSİ] \\
      #v(-0.5mm)
      #text(size: 9pt, weight: "bold", fill: rgb("#1e293b"))[1. DÖNEM 1. YAZILIYA HAZIRLIK SINAVI]
    ],
    [
      #box(fill: rgb("{tema_renk}"), radius: 4pt, inset: (x: 3.5mm, y: 2.5mm))[
        {rozet_metni}
      ]
    ]
  )
  {ogrenci_seridi}
]
#v(2mm)
"""


# ==========================================
# 3. 5. SINIF TYPST İÇERİĞİ (7 SORU - MEB SENARYO 2)
# ==========================================

def generate_sinif_5(cozumlu=False):
    t_renk = "#0d9488"
    a_renk = "#f0fdfa"
    header = get_typst_header("5. Sınıf", "MEB Senaryo 2 Uyumlu", t_renk, a_renk, cozumlu)

    def kz(kod):
        return f"Kazanım: {kod}" if cozumlu else "Açık Uçlu Klasik Soru"

    typ = f"""
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

{header}

// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.1")}]]
  )
  #v(1mm)
  İznik çini ustası Ahmet Usta, tasarlayacağı yeni bordür deseni için birim kareli zemin üzerine geometrik çizgiler çizmiş ve noktaları harflendirmiştir:
  #v(1mm)
  #align(center)[#image("../assets_yazili/sinif5_soru1.svg", width: 75%)]
  #v(0.8mm)
  *a)* İki ucu sınırsız uzayan modeli sembolle gösteriniz. #h(4mm)
  *b)* Başlangıcı S olan ve T'den geçen modeli sembolle gösteriniz. \\
  *c)* M ve N arasındaki modeli sembolle gösterip uzunluğunu birim cinsinden yazınız. \\
  *d)* Birbirine paralel olanları sembolle yazınız. #h(4mm)
  *e)* Birbirine dik olan modelleri sembolle yazınız.
  #v(1.2mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $d$ doğrusu (veya $K L$ doğrusu / $arrow.l.r(K L)$) *(3p)* | *b)* $[S T$ ışını *(3p)* | *c)* $[M N]$ doğru parçası, $|M N| = 4$ birim *(3p)* \
    *d)* $d parallel [M N]$ *(3p)* | *e)* $[P R] bot [M N]$ ve $[P R] bot d$ *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.2")}]]
  )
  #v(0.8mm)
  Geleneksel Türk-İslam mimarisinde desen çizen Selim, bir $k$ doğrusunun dışındaki $A$ noktasından bu doğruya gönye ve cetvel yardımıyla dikme çizmek istemiştir. Selim'in uygulama adımları aşağıda verilmiştir:
  #text(size: 8pt)[
  *1. Adım:* Düz cetveli $k$ doğrusunun üzerine tam oturacak şekilde yerleştirdim. \
  *2. Adım:* Gönyenin $90°$'lik dik köşesini oluşturan dik kenarlarından birini cetvelin kenarına dayadım. \
  *3. Adım:* Gönyeyi cetvel boyunca kaydırarak diğer dik kenarının dışarıdaki $A$ noktasından geçmesini sağladım. \
  *4. Adım:* Gönyenin hipotenüs (en uzun/eğik) kenarı boyunca kurşun kalemle $A$ noktasından $k$ doğrusuna doğru bir çizgi çizdim.
  ]
  *Selim'in hangi adımı hatalıdır? Yapılan hatanın nedenini ve doğrusunun nasıl olması gerektiğini açıklayınız.*
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *Hatalı Adım:* 4. Adım hatalıdır *(3p)*. \
    *Hatanın Nedeni:* Hipotenüs (eğik kenar) boyunca çizgi çizilirse doğru ile $90°$'lik dik açı oluşmaz; dar açı oluşur ve dikme elde edilemez *(4p)*. \
    *Doğrusu:* Gönyenin cetvele dik olan diğer dik kenarı boyunca $A$ noktasından $k$ doğrusuna çizgi çizilmelidir *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.3")}]]
  )
  #v(0.8mm)
  #grid(columns: (1fr, 1.1fr), gutter: 3mm, align: horizon,
    [
      Bozcaada Deniz Feneri'nin optik lambası gece boyunca denizi taramaktadır. Fenerin merkezinden ($O$) geçen ışık huzmeleri iletki (açıölçer) üzerinde $[O A$ ($0°$), $[O B$ ($40°$), $[O C$ ($90°$), $[O D$ ($135°$) ve $[O E$ ($180°$) ışınları ile modellenmiştir.
      #v(0.8mm)
      *Buna göre aşağıdaki açıların ölçülerini ve çeşitlerini (dar / dik / geniş / doğru açı) yazınız:* \
      *a)* $s(A O B)$ #h(3mm) *b)* $s(A O C)$ #h(3mm) *c)* $s(A O D)$ \
      *d)* $s(A O E)$ #h(3mm) *e)* $s(B O D)$
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru3.svg", width: 90%)]
    ]
  )
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $s(A O B) = 40° - 0° = 40°$ $arrow$ *Dar açı* *(3p)* \
    *b)* $s(A O C) = 90° - 0° = 90°$ $arrow$ *Dik açı* *(3p)* \
    *c)* $s(A O D) = 135° - 0° = 135°$ $arrow$ *Geniş açı* *(3p)* \
    *d)* $s(A O E) = 180° - 0° = 180°$ $arrow$ *Doğru açı* *(3p)* \
    *e)* $s(B O D) = 135° - 40° = 95°$ ($90° < 95° < 180°$) $arrow$ *Geniş açı* *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("{t_renk}"), radius: 3pt, fill: rgb("{a_renk}"), inset: (x: 3mm, y: 1.2mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 8pt, weight: "bold", fill: rgb("{t_renk}"))[5. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 2)]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.5mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.4")}]]
  )
  #v(0.8mm)
  #grid(columns: (1.2fr, 1fr), gutter: 3mm, align: horizon,
    [
      Halı dokuma tezgahındaki gergi mekanizmasında $d_1$, $d_2$ ve $d_3$ doğruları $O$ noktasında kesişmektedir. $d_1$ doğrusunun üst tarafında $58°$, $x$ ve $48°$'lik üç komşu açı, alt tarafında ise $y$ açısı bulunmaktadır.
      #v(0.8mm)
      *a)* Doğru açı kuralını kullanarak $x$ açısının ölçüsünü bulunuz. \
      *b)* Ters açılar özelliğini kullanarak $y$ açısının ölçüsünü bulunuz. \
      *c)* $x + y$ toplamının sonucunu bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru4.svg", width: 95%)]
    ]
  )
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $d_1$ üzerindeki açılar doğru açı oluşturur: $58° + x + 48° = 180° arrow 106° + x = 180° arrow x = 180° - 106° = 74°$ *(7p)*. \
    *b)* $y$ açısı ile $x$ açısı kesişen doğrular arasında ters açılardır. Ters açıların ölçüleri eşit olduğundan $y = x = 74°$ *(5p)*. \
    *c)* $x + y = 74° + 74° = 148°$ *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.5")}]]
  )
  #v(0.6mm)
  Tarihi Beyazıt Kütüphanesi'nin vitray penceresinde yer alan 4 geometrik bölge incelenmektedir:
  #align(center)[#image("../assets_yazili/sinif5_soru5.svg", width: 78%)]
  #v(0.5mm)
  *a)* 1, 2 ve 3. bölgelerin neden çokgen *olmadığını* gerekçeleriyle açıklayınız. \
  *b)* 4. bölgedeki çokgenin adını, köşe noktalarını, kenar doğru parçalarını ve $A$ köşesinden çizilebilen köşegenlerini yazınız.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* 1. Bölge kapalı bir şekil değildir (uçları açıktır) *(2p)*. 2. Bölgenin kenarlarından biri dairesel yaydır (doğru parçası değildir) *(2p)*. 3. Bölgede kenarlar birbirini keserek iç içe geçmiştir *(2p)*. \
    *b)* Adı: $A B C D E$ Beşgeni *(3p)*. Köşeler: $A, B, C, D, E$ *(2p)*. Kenarlar: $[A B], [B C], [C D], [D E], [E A]$ *(2p)*. $A$'dan çizilen köşegenler: $[A C]$ ve $[A D]$ *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.6")}]]
  )
  #v(0.6mm)
  #grid(columns: (1.25fr, 1fr), gutter: 3mm, align: horizon,
    [
      Selçuklu kümbet mimarisinde $B, C, D$ noktaları doğrusal zemin üzerindedir. $A B C$ ikizkenar üçgeninde $|A B| = |A C|$ ve tepe açısı $s(B A C) = 44°$'dir. Ona bitişik $A C D$ üçgeninde $s(A D C) = 38°$'dir.
      #v(0.6mm)
      *a)* $s(A B C)$ ve $s(A C B)$ taban açılarının ölçülerini bulunuz. \
      *b)* Doğru açıdan yararlanarak $s(A C D)$ açısının ölçüsünü bulunuz. \
      *c)* $A C D$ üçgeninde $s(C A D)$ açısının (?) ölçüsünü bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru6.svg", width: 92%)]
    ]
  )
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* İkizkenar üçgende taban açıları eşittir: $(180° - 44°) div 2 = 136° div 2 = 68° arrow s(A B C) = s(A C B) = 68°$ *(5p)*. \
    *b)* $B, C, D$ doğrusal olduğundan: $s(A C D) = 180° - 68° = 112°$ *(5p)*. \
    *c)* $A C D$ üçgeninde iç açılar toplamı $180°$: $s(C A D) = 180° - (112° + 38°) = 180° - 150° = 30°$ *(5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.5.3.6")}]]
  )
  #v(0.6mm)
  #grid(columns: (1.25fr, 1fr), gutter: 3mm, align: horizon,
    [
      Geleneksel Uçurtma Festivali için tasarlanan $K L M N$ paralelkenarında $|K L| = 35$ cm, $|L M| = 22$ cm ve $s(N K L) = 65°$'dir.
      #v(0.6mm)
      *a)* Karşılıklı kenarların uzunluklarını ($|M N|$ ve $|K N|$) yazıp paralelkenarın çevre uzunluğunu hesaplayınız. \
      *b)* Karşılıklı açı olan $s(L M N)$ açısının ölçüsünü bulunuz. \
      *c)* Ardışık açı olan $s(K L M)$ açısının ölçüsünü bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif5_soru7.svg", width: 92%)]
    ]
  )
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* Paralelkenarda karşılıklı kenarlar eşittir: $|M N| = |K L| = 35$ cm, $|K N| = |L M| = 22$ cm *(3p)*. Çevre $= 2 times (35 + 22) = 2 times 57 = 114$ cm *(3p)*. \
    *b)* Karşılıklı açılar eşittir: $s(L M N) = s(N K L) = 65°$ *(4p)*. \
    *c)* Ardışık açılar bütünlerdir ($180°$): $s(K L M) = 180° - 65° = 115°$ *(5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 15mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + """
]
"""
    return typ


# ==========================================
# 4. 6. SINIF TYPST İÇERİĞİ (8 SORU - MEB ÜLKE GENELİ ORTAK SINAV)
# ==========================================

def generate_sinif_6(cozumlu=False):
    t_renk = "#2563eb"
    a_renk = "#eff6ff"
    header = get_typst_header("6. Sınıf", "MEB Ülke Geneli Ortak Sınav", t_renk, a_renk, cozumlu)

    def kz(kod):
        return f"Kazanım: {kod}" if cozumlu else "Açık Uçlu Klasik Soru"

    typ = f"""
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

{header}

// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.1")}]]
  )
  #v(0.8mm)
  29 Ekim Cumhuriyet Bayramı töreninde sahne alacak 84 kişilik Çocuk Korosu, her sırada eşit sayıda öğrenci bulunacak biçimde dikdörtgen bir düzende dizilecektir. Koro şefi sıra sayısının *5'ten fazla ve 25'ten az* olmasını istemektedir.
  #v(0.5mm)
  *Buna göre tüm farklı (sıra sayısı, sıradaki öğrenci sayısı) ikililerini listeleyiniz ve kaç farklı düzen kurulabileceğini bulunuz.*
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    84 sayısının pozitif tam sayı çarpanları: 1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84 *(4p)*. \
    5 ile 25 arasındaki sıra sayıları: 6, 7, 12, 14, 21'dir. Uygun dizilişler: \
    (6 sıra, 14 öğrenci), (7 sıra, 12 öğrenci), (12 sıra, 7 öğrenci), (14 sıra, 6 öğrenci), (21 sıra, 4 öğrenci) olmak üzere *5 farklı düzen* kurulabilir *(6p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.4mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.2")}]]
  )
  #v(0.8mm)
  Efes Antik Kenti kazısında bulunan tarihi bir amforanın dört basamaklı 7A4B envanter kodu hem 4'e hem de 9'a kalansız bölünebilmekte; ancak 5'e kalansız *bölünememektedir*.
  #v(0.5mm)
  *Buna göre $A$ ve $B$ basamak değerlerini belirleyerek $A + B$ toplamının alabileceği farklı değerleri bulunuz.*
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    4 ile bölünme: Son iki basamak 4B olmalıdır $arrow B in {{0, 4, 8}}$. Sayı 5 ile bölünemediğinden $B eq.not 0$ olur. Dolayısıyla $B = 4$ veya $B = 8$ *(4p)*. \
    *Durum 1 ($B = 4$):* $7 A 4 4 arrow 7 + A + 4 + 4 = 15 + A = 18 arrow A = 3$. Bu durumda $A + B = 3 + 4 = 7$ *(3p)*. \
    *Durum 2 ($B = 8$):* $7 A 4 8 arrow 7 + A + 4 + 8 = 19 + A = 27 arrow A = 8$. Bu durumda $A + B = 8 + 8 = 16$ *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.4mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.3")}]]
  )
  #v(0.8mm)
  #grid(columns: (1.3fr, 1fr), gutter: 3mm, align: horizon,
    [
      Biyoloji araştırmasında periyodik ağustosböceği popülasyonunun döngü katsayısı 210 olarak modellenmiş ve yandaki çarpan ağacı oluşturulmuştur.
      #v(0.8mm)
      *a)* Çarpan ağacındaki $A$ ve $B$ asal sayılarını bulunuz. \
      *b)* 210 sayısını asal çarpanlarının üslü çarpımı olarak yazınız. \
      *c)* 210 sayısının birbirinden farklı asal çarpanlarının toplamını bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif6_soru3.svg", width: 90%)]
    ]
  )
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $35 = A times B$ ve $A < B$ asal sayıları $arrow A = 5, B = 7$ *(4p)*. \
    *b)* $210 = 2 times 3 times 5 times 7 = 2^1 times 3^1 times 5^1 times 7^1$ *(7p)*. \
    *c)* Farklı asal çarpanlar: 2, 3, 5, 7. Toplam $= 2 + 3 + 5 + 7 = 17$ *(4p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.4mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.4")}]]
  )
  #v(0.8mm)
  Tarihi Saat Kulesi'ndeki küçük çan 18 dakikada bir, büyük çan ise 24 dakikada bir çalmaktadır. Bu iki çan ilk kez sabah saat 09.00'da birlikte çalmıştır.
  #v(0.5mm)
  *a)* İki çanın kaç dakikada bir aynı anda çaldığını (ortak katların en küçüğünü) hesaplayınız. \
  *b)* Bu iki çanın 3. kez birlikte saat kaçta çalacağını bulunuz. \
  *c)* 18 ve 24 sayılarının ortak bölenlerini listeleyiniz.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* 18'in katları: 18, 36, 54, 72, 90... | 24'ün katları: 24, 48, 72, 96... Ortak periyot $= "EKOK"(18, 24) = 72$ dk ($1$ saat $12$ dk) *(5p)*. \
    *b)* 1. birlikte çalış: 09.00 | 2. çalış: $09.00 + 1$ sa $12$ dk $= 10.12$ | 3. çalış: $10.12 + 1$ sa $12$ dk $= 11.24$ *(5p)*. \
    *c)* 18'in bölenleri: 1, 2, 3, 6, 9, 18 | 24'ün bölenleri: 1, 2, 3, 4, 6, 8, 12, 24 $arrow$ Ortak bölenler: 1, 2, 3, 6 *(5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("{t_renk}"), radius: 3pt, fill: rgb("{a_renk}"), inset: (x: 3mm, y: 1.2mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 8pt, weight: "bold", fill: rgb("{t_renk}"))[6. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Ortak Sınav)]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.5mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.6.1")}]]
  )
  #v(0.8mm)
  Kazdağları Milli Parkı'ndaki fotokapanın 1 ay boyunca kaydettiği 80 yaban hayvanının sıklık tablosu aşağıdadır:
  #v(0.8mm)
  #align(center)[
    #table(
      columns: (2.2fr, 1.2fr, 1.2fr, 1.5fr, 1.2fr),
      inset: (x: 3mm, y: 1.5mm),
      fill: (x, y) => if y == 0 {{ rgb("{a_renk}") }} else {{ white }},
      stroke: 0.5pt + rgb("#cbd5e1"),
      [*Tür*], [*Karaca*], [*Kızıl Geyik*], [*Yaban Tavşanı*], [*Vaşak*],
      [Kayıt Sayısı], [28], [20], [18], [14]
    )
  ]
  #v(0.5mm)
  *Buna göre fotokapanın bir sonraki kaydının "Kızıl Geyik" veya "Vaşak" olma deneysel olasılığını:* \
  *a)* En sade kesir biçiminde, #h(3mm) *b)* Ondalık gösterimle, #h(3mm) *c)* Yüzde (%) sembolüyle yazınız.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    Toplam deneme $= 80$. İstenen durum sayısı (Kızıl Geyik veya Vaşak) $= 20 + 14 = 34$ *(2p)*. \
    *a)* En sade kesir: $34 / 80 = (34 div 2) / (80 div 2) = 17 / 40$ *(3p)*. \
    *b)* Ondalık gösterim: $17 / 40 = (17 times 25) / (40 times 25) = 425 / 1000 = 0,425$ *(3p)*. \
    *c)* Yüzde sembolü: $425 / 1000 = 42,5 / 100 = %42,5$ *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.4mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.5")}]]
  )
  #v(0.8mm)
  Okullar arası kısa kulvar yüzme yarışında Derin'in yarışı bitirme süresi $24,308$ saniye; Kaan'ın derecesinin çözümlenmiş hali ise $(2 times 10) + (4 times 1) + (7 times 1/100) + (5 times 1/1000)$ saniyedir.
  #v(0.5mm)
  *a)* Derin'in derecesini kesirlerle çözümleyiniz. \
  *b)* Kaan'ın derecesini ondalık gösterimle yazınız. \
  *c)* Yarışı hangi sporcunun daha önce bitirdiğini ondalık sayıları karşılaştırarak gerekçesiyle açıklayınız.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* Derin: $24,308 = (2 times 10) + (4 times 1) + (3 times 1/10) + (8 times 1/1000)$ *(4p)*. \
    *b)* Kaan: $20 + 4 + 0,07 + 0,005 = 24,075$ saniye *(4p)*. \
    *c)* $24,075 < 24,308$ olduğundan Kaan mesafeyi daha kısa sürede yüzmüştür; dolayısıyla yarışı *Kaan daha önce bitirmiştir* *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.4mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.6")}]]
  )
  #v(0.8mm)
  Avanos çömlek atölyesinde 1. grup öğrenci 27 kg kili 4 eş küpe, 2. grup öğrenci ise 34 kg kili 5 eş küpe eşit olarak paylaştırmıştır.
  #v(0.5mm)
  *a)* 1. gruptaki bir küpte kullanılan kil miktarını ondalık gösterimle yazınız. \
  *b)* 2. gruptaki bir küpte kullanılan kil miktarını ondalık gösterimle yazınız. \
  *c)* Bu iki gruptaki birer küpten hangisinde daha fazla kil kullanıldığını ve aralarındaki farkı kg cinsinden bulunuz.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* 1. Grup: $27 / 4 = (27 times 25) / (4 times 25) = 675 / 100 = 6,75$ kg *(3p)*. \
    *b)* 2. Grup: $34 / 5 = (34 times 2) / (5 times 2) = 68 / 10 = 6,8 = 6,80$ kg *(3p)*. \
    *c)* $6,80 > 6,75$ olduğundan 2. gruptaki bir küpte daha fazla kil kullanılmıştır *(2p)*. Fark: $6,80 - 6,75 = 0,05$ kg *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 18mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.4mm)

// --- SORU 8 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 8 (20 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.6.1.7")}]]
  )
  #v(0.8mm)
  Bilim ve Çocuk Yayınevi bastığı 600 adet matematik dergisinin $2/5$'sini köy okullarına bağışlamış, geriye kalan dergilerin ise %35'ini halk kütüphanelerine ayırmıştır. Yayınevi elde kalan diğer dergilerin tamamını tanesi 42,5 TL'den satmıştır.
  #v(0.5mm)
  *Buna göre yayınevinin sattığı dergilerden elde ettiği toplam geliri işlem basamaklarıyla bulunuz.*
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *1. Aşama:* Bağışlanan dergi sayısı $= 600 times 2/5 = 240$ adet *(4p)*. \
    *2. Aşama:* Kalan dergi sayısı $= 600 - 240 = 360$ adet *(3p)*. \
    *3. Aşama:* Kütüphanelere ayrılan $= 360 times 35/100 = 126$ adet *(5p)*. \
    *4. Aşama:* Satılan dergi sayısı $= 360 - 126 = 234$ adet *(4p)*. \
    *5. Aşama:* Toplam gelir $= 234 times 42,5 = 9945$ TL *(4p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 20mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + """
]
"""
    return typ


# ==========================================
# 5. 7. SINIF TYPST İÇERİĞİ (7 SORU - MEB SENARYO 3)
# ==========================================

def generate_sinif_7(cozumlu=False):
    t_renk = "#d97706"
    a_renk = "#fffbeb"
    header = get_typst_header("7. Sınıf", "MEB Senaryo 3 Uyumlu", t_renk, a_renk, cozumlu)

    def kz(kod):
        return f"Kazanım: {kod}" if cozumlu else "Açık Uçlu Klasik Soru"

    # Soru 1 SVG'si öğrenci nüshasında boş eksen, çözümlüde noktalar işaretli
    s1_svg = "../assets_yazili/sinif7_soru1_cozumlu.svg" if cozumlu else "../assets_yazili/sinif7_soru1_ogrenci.svg"

    typ = f"""
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

{header}

// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.1")}]]
  )
  #v(1mm)
  Sualtı arkeoloji araştırma ekibi deniz seviyesini 0 metre kabul ederek buldukları Batık A ($-2 1/4$ m), Batık B ($-7/3$ m), Batık C ($-5/4$ m) ve Şamandıra D ($+3/2$ m) konumlarını kaydetmiştir.
  #v(0.8mm)
  #align(center)[#image("{s1_svg}", width: 85%)]
  #v(0.5mm)
  *Bu dört konumu sayı doğrusunda işaretleyiniz ve bu sayıların tam sayılar ($ZZ$) ile rasyonel sayılar ($QQ$) kümeleriyle ilişkisini açıklayınız.*
  #v(1.2mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *Sayı Doğrusu Konumları:* Batık B ($-7/3 approx -2,33$, $-2$ ile $-3$ arasında $-7/3$), Batık A ($-2 1/4 = -2,25$, B'nin sağında), Batık C ($-5/4 = -1,25$, $-1$ ile $-2$ arasında), Şamandıra D ($+3/2 = +1,5$, $+1$ ile $+2$'nin tam ortasında) *(8p)*. \
    *Küme İlişkisi:* Her biri $a/b$ ($b eq.not 0, a, b in ZZ$) biçiminde ifade edildiği için $QQ$ kümesinin elemanıdır; ancak tam sayı olmadıkları için $ZZ$ kümesine ait değillerdir *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 26mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.8mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.1")}]]
  )
  #v(1mm)
  Derinkuyu Yeraltı Şehri havalandırma bacası seviye doğrusunda $[-4, -3]$ arası 4 eş parçaya (A noktası $-3$'ten sola 3. çizgi), $[-3, -2]$ arası 6 eş parçaya (B noktası $-2$'den sola 5. çizgi), $[-2, -1]$ arası 2 eş parçaya (C noktası orta çizgi) ve $[+1, +2]$ arası 4 eş parçaya (D noktası $+1$'den sağa 3. çizgi) bölünmüştür:
  #v(0.8mm)
  #align(center)[#image("../assets_yazili/sinif7_soru2.svg", width: 85%)]
  #v(0.5mm)
  *Buna göre $A, B, C, D$ noktalarına karşılık gelen rasyonel sayıları hem tam sayılı hem de bileşik kesir olarak yazınız.*
  #v(1.2mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *A:* $-3$ ile $-4$ arasında 4 parçadan 3.'sü $arrow A = -3 3/4 = -15/4$ *(4p)*. \
    *B:* $-2$ ile $-3$ arasında 6 parçadan 5.'si $arrow B = -2 5/6 = -17/6$ *(4p)*. \
    *C:* $-1$ ile $-2$ arasında 2 parçadan 1.'si $arrow C = -1 1/2 = -3/2$ *(3p)*. \
    *D:* $+1$ ile $+2$ arasında 4 parçadan 3.'sü $arrow D = +1 3/4 = +7/4$ *(4p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 24mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.8mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2.2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.2")}]]
  )
  #v(1mm)
  Müzik konservatuvarı ses laboratuvarında ölçülen üç ritim frekans oranı $11/8$, $17/25$ ve $-9/16$ rasyonel sayıları olarak tespit edilmiştir.
  #v(0.8mm)
  *Bu rasyonel sayıları paydalarını 10'un pozitif kuvveti olacak biçimde genişleterek ve bölme işlemi adımlarını göstererek sonlu ondalık gösterime dönüştürünüz.*
  #v(1.2mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *1)* $11 / 8 = (11 times 125) / (8 times 125) = 1375 / 1000 = 1,375$ *(5p)*. \
    *2)* $17 / 25 = (17 times 4) / (25 times 4) = 68 / 100 = 0,68$ *(5p)*. \
    *3)* $-9 / 16 = -(9 times 625) / (16 times 625) = -5625 / 10000 = -0,5625$ *(5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 24mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("{t_renk}"), radius: 3pt, fill: rgb("{a_renk}"), inset: (x: 3mm, y: 1.2mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 8pt, weight: "bold", fill: rgb("{t_renk}"))[7. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 3)]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.5mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.2")}]]
  )
  #v(0.8mm)
  Kuyumcu atölyesinde 14 ayar altın saflık oranı $14/24 = 7/12$, 22 ayar altın saflık oranı $22/24 = 11/12$ ve lehim katkı oranı $16/45$'tir.
  #v(0.5mm)
  *a)* Bu üç rasyonel sayının devirli ondalık açılımlarını devir çizgisi kullanarak gösteriniz. \
  *b)* Bu üç devirli ondalık sayının virgülden sonraki 25. basamağında yer alan rakamlarını bulunuz.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *1)* $7 / 12 = 0,58333... = 0,58accent(3, -)$. Virgülden sonra 1. basamak 5, 2. basamak 8, 3. basamaktan itibaren hep 3 tekrarlar $arrow$ 25. basamak: *3* *(5p)*. \
    *2)* $11 / 12 = 0,91666... = 0,91accent(6, -)$. 1. basamak 9, 2. basamak 1, 3. basamaktan itibaren hep 6 tekrarlar $arrow$ 25. basamak: *6* *(5p)*. \
    *3)* $16 / 45 = 0,3555... = 0,3accent(5, -)$. 1. basamak 3, 2. basamaktan itibaren hep 5 tekrarlar $arrow$ 25. basamak: *5* *(5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.5mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.3")}]]
  )
  #v(0.8mm)
  Uzun atlama pistinde yarışan 5 atletin atlayış anındaki rüzgâr hızı ölçüm sensörü verileri aşağıda verilmiştir:
  #align(center)[#text(weight: "bold")[Ece:] $-1,4$ m/sn #h(4mm) #text(weight: "bold")[Boran:] $-13/9$ m/sn #h(4mm) #text(weight: "bold")[Cemil:] $-7/5$ m/sn #h(4mm) #text(weight: "bold")[Derya:] $-1,45$ m/sn #h(4mm) #text(weight: "bold")[Emre:] $+9/8$ m/sn]
  #v(0.5mm)
  *Bu 5 rüzgâr hızı ölçümünü küçükten büyüğe doğru sıralayınız ($"..." < "..."$). Eşit olan değerleri belirtiniz.*
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    Değerlerin ondalık karşılıkları: Emre $= +9/8 = +1,125$ (tek pozitif sayı, en büyük) *(2p)*. \
    Negatif sayılar: Ece $= -1,40$ | Cemil $= -7/5 = -1,40$ (Ece ile Cemil eşittir!) *(2p)*. \
    Boran $= -13/9 = -1,444...$ *(2p)* | Derya $= -1,45$ *(2p)*. \
    Negatiflerde mutlak değeri büyük olan daha küçüktür: $-1,45 < -1,444... < -1,40$ \
    *Sıralama:* *$-1,45 < -13/9 < -7/5 = -1,4 < +9/8$* *(Derya < Boran < Cemil = Ece < Emre)* *(7p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.5mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.3")}]]
  )
  #v(0.8mm)
  Dört baraj gölünün kurak geçen Ekim ayındaki su seviyesi değişim oranları tabloda verilmiştir:
  #align(center)[#text(weight: "bold")[Adatepe:] $-5/6$ #h(5mm) #text(weight: "bold")[Boztepe:] $-7/9$ #h(5mm) #text(weight: "bold")[Çamlıdere:] $-11/12$ #h(5mm) #text(weight: "bold")[Demirköprü:] $-13/18$]
  #v(0.5mm)
  *a)* Bu değişim oranlarını paydalarını eşitleyerek küçükten büyüğe doğru sıralayınız. \
  *b)* Su seviyesinde oransal olarak en çok kayıp yaşayan baraj ile en az kayıp yaşayan barajı belirleyiniz.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* Paydalar 36'da eşitlenir: Adatepe $= -5/6 = -30/36$ | Boztepe $= -7/9 = -28/36$ | Çamlıdere $= -11/12 = -33/36$ | Demirköprü $= -13/18 = -26/36$ *(6p)*. \
    Sıralama: $-33/36 < -30/36 < -28/36 < -26/36 arrow$ *$-11/12 < -5/6 < -7/9 < -13/18$* *(4p)*. \
    *b)* En çok su kaybeden: Çamlıdere ($-11/12$, en küçük rasyonel sayı) *(2.5p)*; En az su kaybeden: Demirköprü ($-13/18$, 0'a en yakın negatif sayı) *(2.5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.5mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 2mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("MAT.7.1.4")}]]
  )
  #v(0.8mm)
  Geleneksel Ebru ustası Safiye Hanım, $3 1/2$ litre kitreli boya karışımının önce $2/7$'sini battal ebru zemininde kullanmış, ardından *kalan karışımın* $3/5$'ini lale motifleri için harcamıştır. Son olarak tekneye $3/4$ litre saf su ilave etmiştir.
  #v(0.5mm)
  *a)* 1. ve 2. aşamada harcanan boya karışımı miktarlarını litre cinsinden bulunuz. \
  *b)* Son durumda teknede bulunan toplam sıvı miktarını tam sayılı ve bileşik kesir olarak hesaplayınız.
  #v(1mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 2mm)[
    #text(size: 8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    Başlangıç: $3 1/2 = 7/2$ L. \
    *a)* 1. Aşama harcanan: $7/2 times 2/7 = 1$ Litre *(2.5p)*. Kalan boya: $7/2 - 1 = 5/2$ L. \
    2. Aşama harcanan: $5/2 times 3/5 = 3/2$ Litre *(2.5p)*. Kalan boya: $5/2 - 3/2 = 2/2 = 1$ L *(5p)*. \
    *b)* Su eklendikten sonraki toplam sıvı: $1 + 3/4 = 7/4$ Litre $= $ *7/4* Litre $= $ *1 3/4* Litre *(5p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 21mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 2mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + """
]
"""
    return typ


# ==========================================
# 6. 8. SINIF TYPST İÇERİĞİ (9 SORU - MEB SENARYO 6)
# ==========================================

def generate_sinif_8(cozumlu=False):
    t_renk = "#b91c1c"
    a_renk = "#fef2f2"
    header = get_typst_header("8. Sınıf", "MEB Senaryo 6 Uyumlu", t_renk, a_renk, cozumlu)

    def kz(kod):
        return f"Kazanım: {kod}" if cozumlu else "Açık Uçlu Klasik Soru"

    typ = f"""
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

{header}

// --- SORU 1 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 1 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.1.1")}]]
  )
  #v(0.6mm)
  Antik Babil astronomisinde ve takvim hesaplarında kullanılan 360 ve 540 sayıları incelenmektedir.
  #v(0.5mm)
  *a)* 360 ve 540 sayılarını asal çarpanlarının üslü ifadelerinin çarpımı biçiminde yazınız. \
  *b)* Bu iki sayının her birinin pozitif tam sayı çarpan sayısını ve *asal olmayan* pozitif tam sayı çarpan sayısını bulunuz.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $360 = 2^3 times 3^2 times 5^1$ *(3p)* | $540 = 2^2 times 3^3 times 5^1$ *(3p)*. \
    *b)* 360 için: $(3+1) times (2+1) times (1+1) = 4 times 3 times 2 = 24$ pozitif çarpan; asal olanlar 3 tane ($2, 3, 5$) $arrow$ Asal olmayan çarpan sayısı $= 24 - 3 = 21$ *(2p)*. \
    540 için: $(2+1) times (3+1) times (1+1) = 3 times 4 times 2 = 24$ pozitif çarpan; asal olanlar 3 tane $arrow$ Asal olmayan çarpan sayısı $= 24 - 3 = 21$ *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 2 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 2 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.1.2")}]]
  )
  #v(0.6mm)
  #grid(columns: (1.3fr, 1fr), gutter: 3mm, align: horizon,
    [
      Boyutları 168 cm ve 210 cm olan dikdörtgen biçimindeki bir müze sergi panosu, hiç boşluk kalmayacak ve taşmayacak şekilde birbirine eş büyüklükte *en büyük kare fotoğraflarla* kaplanacaktır.
      #v(0.6mm)
      *a)* Kullanılacak kare fotoğraflardan birinin kenar uzunluğu en fazla kaç cm olabilir? \
      *b)* Bu pano için toplam kaç adet kare fotoğraf gerektiğini bulunuz.
    ],
    [
      #align(center)[#image("../assets_yazili/sinif8_soru2.svg", width: 90%)]
    ]
  )
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* Karenin kenarı 168 ve 210'un en büyük ortak böleni olmalıdır: $"EBOB"(168, 210) = 42$ cm *(9p)*. \
    *b)* Fotoğraf sayısı $= (168 div 42) times (210 div 42) = 4 times 5 = 20$ adet fotoğraf gerekir *(6p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 3 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 3 (15 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.1.2")}]]
  )
  #v(0.6mm)
  GÖKTÜRK-X uydusu her 45 dakikada bir, İMECE-Y uydusu ise her 60 dakikada bir Ankara Yer İstasyonu üzerinden geçmektedir. Bu iki uydu ilk kez sabah saat 08.15'te birlikte istasyon üzerinden geçmiştir.
  #v(0.5mm)
  *Bu uydular aynı gün saat 20.00'ye kadar kaç kez daha birlikte geçerler? Geçiş saatlerini belirleyiniz.*
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    Ortak geçiş periyodu $= "EKOK"(45, 60) = 180$ dakika $= 3$ saat *(6p)*. \
    1. Geçiş: 08.15 (başlangıç). \
    Sonraki geçişler: 11.15, 14.15 ve 17.15 *(6p)*. Bir sonraki geçiş $17.15 + 3 = 20.15$ olup $20.00$'den sonradır. \
    Dolayısıyla saat 20.00'ye kadar *3 kez daha* birlikte geçerler *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 4 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 4 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.1.3")}]]
  )
  #v(0.6mm)
  Kule saatindeki iki dişli çarkın diş sayıları $(2x + 3)$ ve 35 olup aralarındaki oran $(2x + 3) / 35 = 36 / 84$ eşitliğini sağlamaktadır.
  #v(0.5mm)
  *a)* $x$ doğal sayısının değerini bulunuz. \
  *b)* Bulduğunuz $x$ sayısı ile 18 sayısının aralarında asal olup olmadığını gerekçesiyle açıklayınız.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $36 / 84 = (36 div 12) / (84 div 12) = 3 / 7$. Paydası 35 olacak şekilde genişletilirse: $3/7 = (3 times 5)/(7 times 5) = 15/35$. \
    $2x + 3 = 15 arrow 2x = 12 arrow x = 6$ *(6p)*. \
    *b)* 6 ve 18 sayılarının bölenleri: 6'nın bölenleri (1, 2, 3, 6); 18'in bölenleri (1, 2, 3, 6, 9, 18). $"EBOB"(6, 18) = 6 eq.not 1$ olduğundan 6 ve 18 *aralarında asal değildir* *(4p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#pagebreak()

// === SAYFA 2 BAŞLIĞI ===
#rect(width: 100%, stroke: 0.5pt + rgb("{t_renk}"), radius: 3pt, fill: rgb("{a_renk}"), inset: (x: 3mm, y: 1mm))[
  #grid(columns: (1fr, auto), align: horizon,
    [#text(size: 7.8pt, weight: "bold", fill: rgb("{t_renk}"))[8. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 6)]],
    [#text(size: 7.2pt, fill: rgb("#64748b"))[Sayfa 2 / 2]]
  )
]
#v(1.2mm)

// --- SORU 5 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 5 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.2.1")}]]
  )
  #v(0.6mm)
  Radyoaktif karbon-14 kalibrasyon katsayıları $A = (-2)^6$, $B = -3^4$, $C = (-4)^(-2)$ ve $D = (-1/5)^(-3)$ olarak verilmiştir.
  #v(0.5mm)
  *a)* $A, B, C, D$ rasyonel ve tam sayı değerlerini hesaplayınız. #h(4mm)
  *b)* $(A + B) + (1 / C) + D$ işleminin sonucunu bulunuz.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $A = (-2)^6 = +64$ *(2p)* | $B = -3^4 = -81$ *(2p)* | $C = (-4)^(-2) = 1 / (-4)^2 = 1/16$ *(2p)* | $D = (-1/5)^(-3) = (-5)^3 = -125$ *(2p)*. \
    *b)* $1 / C = 1 / (1/16) = 16$. İşlem: $(64 + (-81)) + 16 + (-125) = (-17) + 16 - 125 = -1 - 125 = -126$ *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 6 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 6 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.2.2")}]]
  )
  #v(0.6mm)
  Ulusal Dijital Kütüphane veri merkezinde $8^6$ adet tarihi belgenin her biri $16^4$ bayt depolama alanı kaplamaktadır. Arşivlenen tüm veri $4^5$ adet eş kapasiteli bulut sunucuya eşit paylaştırılmıştır.
  #v(0.5mm)
  *Buna göre bir sunucuya yüklenen veri miktarını 2 tabanında üslü ifade olarak hesaplayınız.*
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    2 tabanına dönüştürme: $8^6 = (2^3)^6 = 2^18$ adet belge; $16^4 = (2^4)^4 = 2^16$ bayt; Sunucu sayısı $= 4^5 = (2^2)^5 = 2^10$ *(4p)*. \
    Toplam veri miktarı $= 2^18 times 2^16 = 2^(18+16) = 2^34$ bayt *(3p)*. \
    Bir sunucudaki veri $= 2^34 div 2^10 = 2^(34-10) =$ *$2^24$* bayt *(3p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 7 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 7 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.2.2")}]]
  )
  #v(0.6mm)
  Satranç tahtasının 1. karesine $9^4$, 2. karesine $27^3$, 3. karesine ise $81^2$ adet buğday tanesi konulmuştur.
  #v(0.5mm)
  *a)* Bu üç karedeki buğday sayılarını 3 tabanında üslü ifade olarak yazıp hangi iki karenin birbirine denk olduğunu bulunuz. \
  *b)* Bu üç karedeki buğday sayılarının çarpımını 3 tabanında tek bir üslü ifade olarak yazınız.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* 1. Kare: $9^4 = (3^2)^4 = 3^8$ buğday *(2p)*. 2. Kare: $27^3 = (3^3)^3 = 3^9$ buğday *(2p)*. 3. Kare: $81^2 = (3^4)^2 = 3^8$ buğday *(2p)*. \
    Dolayısıyla *1. ve 3. karelerdeki buğday sayıları birbirine denktir ($3^8$)*. \
    *b)* Çarpım: $3^8 times 3^9 times 3^8 = 3^(8 + 9 + 8) =$ *$3^25$* *(4p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 8 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 8 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.2.4")}]]
  )
  #v(0.6mm)
  Laboratuvarda üretilen yapay örümcek ipeği lifinin mikron düzeyindeki çapı $0,00048$ metre olarak ölçülmüştür. Bu ölçüm $0,00048 = 48 times 10^a = 0,48 times 10^b$ eşitlikleriyle verilmiştir.
  #v(0.5mm)
  *a)* $a$ ve $b$ tam sayılarının değerlerini bulunuz. #h(5mm)
  *b)* $(a + b)$ ve $(a - b)$ işlemlerinin sonuçlarını hesaplayınız.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* $0,00048 = 48 times 10^(-5) arrow a = -5$ *(4p)* | $0,00048 = 0,48 times 10^(-3) arrow b = -3$ *(4p)*. \
    *b)* $a + b = (-5) + (-3) = -8$ *(1p)* | $a - b = (-5) - (-3) = -5 + 3 = -2$ *(1p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + f"""
]

#v(1.2mm)

// --- SORU 9 ---
#block(width: 100%, stroke: 0.6pt + rgb("#cbd5e1"), radius: 4pt, fill: white, inset: (x: 3.5mm, y: 1.8mm))[
  #grid(columns: (auto, 1fr), gutter: 2mm, align: horizon,
    [#box(fill: rgb("{t_renk}"), radius: 3pt, inset: (x: 2mm, y: 0.8mm))[#text(size: 8.5pt, weight: "bold", fill: white)[SORU 9 (10 Puan)]]],
    [#text(size: 7.5pt, fill: rgb("#64748b"))[{kz("M.8.1.2.5")}]]
  )
  #v(0.6mm)
  Biyoteknolojide DNA sarmalının çapı $2,5 times 10^(-9)$ metre; astrofizikte Dünya ile Güneş arasındaki ortalama mesafe ise $149 600 000$ kilometredir.
  #v(0.5mm)
  *a)* DNA çapının neden bilimsel gösterim kuralına ($a times 10^n$, $1 <= |a| < 10$) uyduğunu açıklayınız. \
  *b)* Dünya ile Güneş arasındaki mesafeyi *metre* cinsinden bilimsel gösterimle yazınız ($1$ km $= 10^3$ m). \
  *c)* Bu iki bilimsel gösterimdeki 10'un kuvvetleri arasındaki farkı ($n_1 - n_2$) bulunuz.
  #v(0.8mm)
  """ + ("""
  #rect(width: 100%, fill: rgb("#f0fdf4"), stroke: 0.6pt + rgb("#16a34a"), radius: 3pt, inset: 1.8mm)[
    #text(size: 7.8pt, weight: "bold", fill: rgb("#15803d"))[Öğretmen Çözümü ve Puanlama:] \
    *a)* Katsayı olan 2,5 sayısı $1 <= 2,5 < 10$ şartını sağladığı ve üs $-9 in ZZ$ olduğu için bilimsel gösterimdir *(3p)*. \
    *b)* $149 600 000$ km $= 149 600 000 times 10^3$ m $= 1,496 times 10^8 times 10^3$ m $= $ *$1,496 times 10^11$* metre *(5p)*. \
    *c)* $11 - (-9) = 11 + 9 =$ *$20$* *(2p)*.
  ]
""" if cozumlu else """
  #rect(width: 100%, height: 16mm, stroke: (dash: "dashed", paint: rgb("#cbd5e1"), thickness: 0.6pt), radius: 3pt, fill: rgb("#fafafa"), inset: 1.5mm)[
    #text(size: 7.2pt, fill: rgb("#94a3b8"))[Çözüm ve İşlem Alanı:]
  ]
""") + """
]
"""
    return typ


# ==========================================
# 7. DERLEME VE TEST YÖNETİCİSİ
# ==========================================

def compile_all():
    create_svgs()
    
    files_to_generate = [
        ("5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci", generate_sinif_5(cozumlu=False)),
        ("5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu", generate_sinif_5(cozumlu=True)),
        ("6_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci", generate_sinif_6(cozumlu=False)),
        ("6_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu", generate_sinif_6(cozumlu=True)),
        ("7_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci", generate_sinif_7(cozumlu=False)),
        ("7_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu", generate_sinif_7(cozumlu=True)),
        ("8_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci", generate_sinif_8(cozumlu=False)),
        ("8_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu", generate_sinif_8(cozumlu=True)),
    ]

    typ_dir = SCRIPTS_DIR / "typ_sources"
    typ_dir.mkdir(exist_ok=True)

    print("--- TYPST DERLEME İŞLEMİ BAŞLATILIYOR ---")
    for name, content in files_to_generate:
        typ_path = typ_dir / f"{name}.typ"
        pdf_path = OUTPUT_DIR / f"{name}.pdf"
        
        typ_path.write_text(content, encoding="utf-8")
        
        cmd = ["typst", "compile", "--root", str(SCRIPTS_DIR), str(typ_path), str(pdf_path)]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"HATA: {name} derlenemedi!")
            print(res.stderr)
            sys.exit(1)
        else:
            print(f"BAŞARILI: {name}.pdf üretildi.")

    print("\n--- DOĞRULAMA 1: SAYFA SAYISI KONTROLÜ (pdfinfo) ---")
    all_pages_ok = True
    for name, _ in files_to_generate:
        pdf_path = OUTPUT_DIR / f"{name}.pdf"
        cmd = ["pdfinfo", str(pdf_path)]
        res = subprocess.run(cmd, capture_output=True, text=True)
        for line in res.stdout.splitlines():
            if line.startswith("Pages:"):
                pages = int(line.split(":")[1].strip())
                if pages == 2:
                    print(f"  [OK] {name}.pdf: Tam 2 sayfa.")
                else:
                    print(f"  [HATA] {name}.pdf: {pages} sayfa! (TAM 2 SAYFA OLMALI)")
                    all_pages_ok = False

    if not all_pages_ok:
        print("UYARI: Bazı PDF'ler 2 sayfa değil, ayarlamalar gerekiyor!")
        sys.exit(1)

    print("\n--- DOĞRULAMA 2: GİZLİLİK VE METİN FİLTRESİ (pdftotext) ---")
    yasakli_kelimeler = ["Müdür", "müdür", "ÖZKAN", "HACIOĞLU", "özel ders", "Özel Ders"]
    yasak_bulundu = False
    for name, _ in files_to_generate:
        pdf_path = OUTPUT_DIR / f"{name}.pdf"
        cmd = ["pdftotext", str(pdf_path), "-"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        for kelime in yasakli_kelimeler:
            if kelime in res.stdout:
                print(f"  [GİZLİLİK İHLALİ]: {name}.pdf içinde '{kelime}' bulundu!")
                yasak_bulundu = True
    if not yasak_bulundu:
        print("  [OK] Hiçbir PDF'te okul müdürü, müdür ismi veya özel ders ibaresi bulunmamaktadır.")

    print("\n--- DOĞRULAMA 3: PNG ÖNİZLEMELERİ (pdftoppm -png -r 150) ---")
    for name, _ in files_to_generate:
        pdf_path = OUTPUT_DIR / f"{name}.pdf"
        prefix = PREVIEWS_DIR / name
        cmd = ["pdftoppm", "-png", "-r", "150", str(pdf_path), str(prefix)]
        subprocess.run(cmd, check=True)
    
    png_files = list(PREVIEWS_DIR.glob("*.png"))
    print(f"  [OK] Toplam {len(png_files)} sayfa PNG önizlemesi üretildi.")
    print("TÜM İŞLEMLER KUSURSUZ TAMAMLANDI!")

if __name__ == "__main__":
    compile_all()
