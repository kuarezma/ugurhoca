#!/usr/bin/env node
/**
 * 2026-2027 Eğitim-Öğretim Yılı 1. Dönem 1. Yazılıya Hazırlık Sınavları
 * Supabase public.documents Tablosuna İdempotent Kayıt / Güncelleme Betiği
 */

import { loadEnv, createAdminClient } from './import/utils.mjs';

loadEnv();
const supabase = createAdminClient();

const FORBIDDEN_WORDS = [
  /okul\s+müdürü/i,
  /mustafa\s+özkan/i,
  /ali\s+rıza\s+hacıoğlu/i,
  /özel\s+ders/i,
];

function checkPrivacy(text) {
  if (!text) return;
  for (const pattern of FORBIDDEN_WORDS) {
    if (pattern.test(text)) {
      throw new Error(`Gizlilik kuralı ihlali tespit edildi (${pattern}): ${text}`);
    }
  }
}

const DOCUMENTS_TO_PUBLISH = [
  {
    grade: [5],
    title: '5. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 2 - Açık Uçlu)',
    type: 'deneme-sinav',
    file_name: '5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    file_url: '/documents/yazili-hazirlik-2026-1-1/5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    solution_url: '/documents/yazili-hazirlik-2026-1-1/5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu.pdf',
    description:
      'MEB Senaryo 2 konu soru dağılım tablosuna tam uyumlu, 7 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: MAT.5.3.1 (Açılar ve İletki), MAT.5.3.2 (Açı Çeşitleri ve Gönye), MAT.5.3.3 (Komşu, Tümler, Bütünler, Ters Açılar), MAT.5.1.1 (Doğal Sayılar ve Basamak Değeri), MAT.5.3.4 (Üçgen ve Dörtgenlerde Açılar), MAT.5.1.3 (Dört İşlem Problemleri).',
    answer_key_text:
      'Soru 1 (15 P): a) Dar açı (65°), b) Geniş açı (130°), c) Dik açı (90°).\n' +
      'Soru 2 (15 P): a) BOA ve AOC açıları komşudur; ortak köşe [O] ve ortak ışın [OB). b) m(BOC) = 68° (Dar açı).\n' +
      'Soru 3 (15 P): a) m(BOD) = 90° (Dik açı), b) m(DOE) = 55° (Dar açı).\n' +
      'Soru 4 (15 P): x = 74°.\n' +
      'Soru 5 (15 P): 89 542 376; 4\'ün basamak değeri = 40.000, 7\'nin basamak değeri = 70; Fark = 39.930.\n' +
      'Soru 6 (15 P): m(CAD) = 38°.\n' +
      'Soru 7 (10 P): 4 kutu cıvata artar.',
    is_admin_only: false,
    is_new: true,
    downloads: 0,
    views: 0,
    likes: 0,
    rating: 5,
    comments_count: 0,
  },
  {
    grade: [6],
    title: '6. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Ortak Sınav - Açık Uçlu)',
    type: 'deneme-sinav',
    file_name: '6_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    file_url: '/documents/yazili-hazirlik-2026-1-1/6_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    solution_url: '/documents/yazili-hazirlik-2026-1-1/6_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu.pdf',
    description:
      'MEB Ülke Geneli Ortak Yazılı Sınav konu soru dağılım tablosuna tam uyumlu, 8 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: M.6.1.2.2 (Bölünebilme Kuralları), M.6.1.2.3 (Asal Sayılar), M.6.1.2.4 (Asal Çarpanlar), M.6.1.2.5 (Ortak Bölenler ve Katlar), M.6.1.3.1 (Kümeler ve Sembolik Gösterim), M.6.1.3.2 (Kümelerde Kesişim ve Birleşim), M.6.1.1.1 (Üslü İfadeler), M.6.1.1.4 (Dört İşlem Problemleri).',
    answer_key_text:
      'Soru 1 (10 P): 15 asal sayı değildir; çünkü 1 ve kendisi dışında 3 ve 5 bölenleri vardır (15 = 3 x 5).\n' +
      'Soru 2 (15 P): B = 4 veya B = 8; A\'nın alabileceği değerler toplamı = 3 + 8 = 11.\n' +
      'Soru 3 (10 P): 180 = 2² x 3² x 5¹; a = 2, b = 2, c = 1 -> a + b + c = 5.\n' +
      'Soru 4 (15 P): a) En büyük kare kenarı = 6 cm. b) En az kare sayısı = (48/6) x (30/6) = 8 x 5 = 40 adet.\n' +
      'Soru 5 (10 P): a) K = {12, 18, 24, 30, 36, 42, 48}. b) s(K) = 7.\n' +
      'Soru 6 (15 P): a) A ∩ B = {a, l, i}, s(A ∩ B) = 3. b) A ∪ B = {k, a, n, d, i, l, y}, s(A ∪ B) = 7.\n' +
      'Soru 7 (10 P): a) A grubu hacmi = 2³ = 8 cm³, B grubu hacmi = 3² = 9 cm³. b) A grubu toplam kil = 24 cm³, B grubu toplam kil = 18 cm³. c) Birer küp karşılaştırmasında B grubu küpünde daha fazla kil kullanılmıştır (9 cm³ > 8 cm³).\n' +
      'Soru 8 (15 P): Toplam ödenen tutar = 5820 TL.',
    is_admin_only: false,
    is_new: true,
    downloads: 0,
    views: 0,
    likes: 0,
    rating: 5,
    comments_count: 0,
  },
  {
    grade: [7],
    title: '7. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 3 - Açık Uçlu)',
    type: 'deneme-sinav',
    file_name: '7_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    file_url: '/documents/yazili-hazirlik-2026-1-1/7_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    solution_url: '/documents/yazili-hazirlik-2026-1-1/7_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu.pdf',
    description:
      'MEB Senaryo 3 konu soru dağılım tablosuna tam uyumlu, 7 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: M.7.1.1.1 (Tam Sayılarla Toplama ve Çıkarma), M.7.1.1.2 (Tam Sayılarla Çarpma ve Bölme), M.7.1.1.3 (Tam Sayıların Kendisiyle Tekrarlı Çarpımı), M.7.1.1.4 (Tam Sayı Problemleri), M.7.1.2.1 (Rasyonel Sayıları Tanıma ve Sayı Doğrusunda Gösterme), M.7.1.2.2 (Rasyonel Sayıların Ondalık Gösterimi).',
    answer_key_text:
      'Soru 1 (15 P): B (-7/3 = -2 1/3) < A (-2 1/4) < C (-5/4 = -1 1/4) < 0 < D (+3/2 = +1 1/2). Sayı doğrusunda doğru işaretleme.\n' +
      'Soru 2 (15 P): a) 7/20 = 0,35. b) -11/8 = -1,375. c) 5/9 = 0,555... = 0,5 (devirli).\n' +
      'Soru 3 (10 P): a) (-3)⁴ = +81. b) -2⁶ = -64. c) (-5)³ = -125.\n' +
      'Soru 4 (15 P): A = -2, B = -18 -> A - B = (-2) - (-18) = +16.\n' +
      'Soru 5 (15 P): [(-3) x (-8)] ÷ (-4) - (+5) = 24 ÷ (-4) - 5 = -6 - 5 = -11.\n' +
      'Soru 6 (15 P): Başlangıç: -8°C. Son sıcaklık: -8 + 12 - 9 = -5°C.\n' +
      'Soru 7 (15 P): a) (-15) + [(+22) + (-8)] = (-15) + (+14) = -1. b) [(-12) + (+12)] + (-7) = 0 + (-7) = -7.',
    is_admin_only: false,
    is_new: true,
    downloads: 0,
    views: 0,
    likes: 0,
    rating: 5,
    comments_count: 0,
  },
  {
    grade: [8],
    title: '8. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 6 - Açık Uçlu)',
    type: 'deneme-sinav',
    file_name: '8_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    file_url: '/documents/yazili-hazirlik-2026-1-1/8_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    solution_url: '/documents/yazili-hazirlik-2026-1-1/8_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu.pdf',
    description:
      'MEB Senaryo 6 konu soru dağılım tablosuna tam uyumlu, 9 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: M.8.1.1.1 (Çarpanlar ve Katlar), M.8.1.1.2 (EBOB ve EKOK), M.8.1.1.3 (Aralarında Asal Sayılar), M.8.1.2.1 (Tam Sayıların Tam Sayı Kuvvetleri), M.8.1.2.2 (Üslü İfadelerle Temel Kurallar ve İşlemler), M.8.1.2.3 (Sayıların Ondalık Gösterimlerini Çözümleme), M.8.1.2.4 (Çok Büyük ve Çok Küçük Sayılar), M.8.1.2.5 (Bilimsel Gösterim).',
    answer_key_text:
      'Soru 1 (10 P): 72\'nin pozitif tam sayı çarpanları: 1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36, 72 (12 adet).\n' +
      'Soru 2 (15 P): EBOB(120, 168) = 24 cm. En az kare sayısı = (120/24) x (168/24) = 5 x 7 = 35 adet.\n' +
      'Soru 3 (10 P): EKOK(30, 45) = 90 dk (1 saat 30 dk). Birlikte hareket saati: 08.00 + 01.30 = 09.30.\n' +
      'Soru 4 (10 P): (12, 25) aralarında asaldır çünkü EBOB(12, 25) = 1\'dir. (18, 27) aralarında asal değildir çünkü ortak bölenleri (3 ve 9) vardır.\n' +
      'Soru 5 (10 P): 3⁻⁴ = 1/81; (-2)⁻⁵ = -1/32; (-4)⁻² = 1/16.\n' +
      'Soru 6 (15 P): İşlem sonucu = 2¹¹ = 2048.\n' +
      'Soru 7 (10 P): Sayı = 504,078.\n' +
      'Soru 8 (10 P): 0,000035 x 10⁸ = 3,5 x 10⁻⁵ x 10⁸ = 3,5 x 10³ = 3500.\n' +
      'Soru 9 (10 P): 28.000.000.000 = 2,8 x 10¹⁰ (1 <= 2,8 < 10 şartını sağlar).',
    is_admin_only: false,
    is_new: true,
    downloads: 0,
    views: 0,
    likes: 0,
    rating: 5,
    comments_count: 0,
  },
];

async function main() {
  console.log('--- 1. DÖNEM 1. YAZILIYA HAZIRLIK DOKÜMANLARI YAYINLAMA BETİĞİ ---');

  const results = [];

  for (const doc of DOCUMENTS_TO_PUBLISH) {
    checkPrivacy(doc.title);
    checkPrivacy(doc.description);
    checkPrivacy(doc.answer_key_text);

    // Başlığa göre mevcut kaydı ara (idempotent kontrol)
    const { data: existing, error: searchError } = await supabase
      .from('documents')
      .select('id, title, created_at')
      .eq('title', doc.title)
      .maybeSingle();

    if (searchError) {
      throw new Error(`Sorgulama hatası (${doc.title}): ${searchError.message}`);
    }

    if (existing) {
      console.log(`[GÜNCELLENİYOR] Var olan kayıt bulundu: ID=${existing.id} | ${doc.title}`);
      const { data: updated, error: updateError } = await supabase
        .from('documents')
        .update({
          grade: doc.grade,
          type: doc.type,
          file_name: doc.file_name,
          file_url: doc.file_url,
          solution_url: doc.solution_url,
          description: doc.description,
          answer_key_text: doc.answer_key_text,
          rating: doc.rating,
          is_admin_only: doc.is_admin_only,
          is_new: doc.is_new,
        })
        .eq('id', existing.id)
        .select('id, title, grade, type, file_url, solution_url, created_at')
        .single();

      if (updateError) {
        throw new Error(`Güncelleme hatası (${doc.title}): ${updateError.message}`);
      }
      results.push({ action: 'UPDATED', document: updated });
    } else {
      console.log(`[EKLENİYOR] Yeni kayıt oluşturuluyor: ${doc.title}`);
      const { data: inserted, error: insertError } = await supabase
        .from('documents')
        .insert({
          ...doc,
          created_at: new Date().toISOString(),
        })
        .select('id, title, grade, type, file_url, solution_url, created_at')
        .single();

      if (insertError) {
        throw new Error(`Ekleme hatası (${doc.title}): ${insertError.message}`);
      }
      results.push({ action: 'INSERTED', document: inserted });
    }
  }

  console.log('\n================== İŞLEM ÖZETİ ==================');
  for (const r of results) {
    console.log(
      `[${r.action}] ID: ${r.document.id} | Sınıf: ${r.document.grade.join(',')} | ${r.document.title}`
    );
    console.log(`   Öğrenci URL: ${r.document.file_url}`);
    console.log(`   Çözümlü URL: ${r.document.solution_url}`);
  }
  console.log('=================================================\n');

  // Doğrulama sorgusu
  console.log('--- DOĞRULAMA: Supabase documents tablosu teyit sorgusu ---');
  const ids = results.map((r) => r.document.id);
  const { data: verifiedRows, error: verifyError } = await supabase
    .from('documents')
    .select('id, title, grade, type, file_url, solution_url, created_at')
    .in('id', ids);

  if (verifyError) {
    throw new Error(`Doğrulama sorgusu hatası: ${verifyError.message}`);
  }

  console.log(`Doğrulanan toplam kayıt sayısı: ${verifiedRows.length}`);
  for (const row of verifiedRows) {
    console.log(`- ${row.id}: ${row.title} (grade=${JSON.stringify(row.grade)})`);
  }
}

main().catch((err) => {
  console.error('Betiğin çalışmasında hata oluştu:', err);
  process.exit(1);
});
