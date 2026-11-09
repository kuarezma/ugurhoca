#!/usr/bin/env node
/**
 * 2026-2027 Eğitim-Öğretim Yılı 1. Dönem 1. Yazılıya Hazırlık Sınavları
 * Supabase public.documents Tablosuna İdempotent Kayıt / Güncelleme Betiği
 */

import path from 'node:path';
import { loadEnv, createAdminClient } from './import/utils.mjs';
import {
  assertTextPrivacy,
  assertPdfPrivacy,
  resolveWriteMode,
} from './lib/privacy-guard.mjs';

loadEnv();
const supabase = createAdminClient();

const DOCUMENTS_TO_PUBLISH = [
  {
    grade: [5],
    title: '5. Sınıf Matematik 1. Dönem 1. Yazılıya Hazırlık Sınavı (MEB Senaryo 2 - Açık Uçlu)',
    type: 'deneme-sinav',
    file_name: '5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    file_url: '/documents/yazili-hazirlik-2026-1-1/5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Ogrenci.pdf',
    solution_url: '/documents/yazili-hazirlik-2026-1-1/5_Sinif_1_Donem_1_Yaziliya_Hazirlik_Cozumlu.pdf',
    description:
      'MEB Senaryo 2 konu soru dağılım tablosuna tam uyumlu, 7 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: MAT.5.3.1 (Temel Geometrik Çizimler: Doğru, Doğru Parçası, Işın, Paralel ve Diklik), MAT.5.3.2 (Gönye ve Cetvelle Dikme İnşası), MAT.5.3.3 (İletki ile Açı Ölçme ve Açı Çeşitleri), MAT.5.3.4 (Kesişen Doğrular, Doğru Açı ve Ters Açılar), MAT.5.3.5 (Çokgen Kavramı ve Temel Elemanları), MAT.5.3.6 (Üçgen ve Paralelkenarın Açı/Kenar Özellikleri).',
    answer_key_text:
      'Soru 1 (15 P): a) d doğrusu (KL doğrusu), b) [ST ışını, c) [MN] doğru parçası, |MN| = 4 birim, d) d // [MN], e) [PR] ⊥ [MN] ve [PR] ⊥ d.\n' +
      'Soru 2 (10 P): 4. Adım hatalıdır; eğik kenar (hipotenüs) yerine A noktasından geçen diğer dik kenar boyunca çizilmelidir.\n' +
      'Soru 3 (15 P): a) s(AOB) = 40° (Dar açı), b) s(AOC) = 90° (Dik açı), c) s(AOD) = 135° (Geniş açı), d) s(AOE) = 180° (Doğru açı), e) s(BOD) = 95° (Geniş açı).\n' +
      'Soru 4 (15 P): a) 58° + x + 48° = 180° -> x = 74°, b) Ters açılar eşitliğinden y = 74°, c) x + y = 148°.\n' +
      'Soru 5 (15 P): a) 1. bölge açık şekil, 2. bölge eğri kenarlı, 3. bölge kenarları kesişen şekil olduğu için çokgen değildir. b) 4. bölge ABCDE Beşgeni; Köşeler: A, B, C, D, E; Kenarlar: [AB], [BC], [CD], [DE], [EA]; A\'dan çizilen köşegenler: [AC] ve [AD].\n' +
      'Soru 6 (15 P): a) s(ABC) = s(ACB) = 68°, b) s(ACD) = 112°, c) s(CAD) = 30°.\n' +
      'Soru 7 (15 P): a) |MN| = 35 cm, |KN| = 22 cm, Çevre = 114 cm, b) s(LMN) = 65°, c) s(KLM) = 115°.',
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
      'MEB Ülke Geneli Ortak Yazılı Sınav konu soru dağılım tablosuna tam uyumlu, 8 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: MAT.6.1.1 (Çarpanlar ve Katlar), MAT.6.1.2 (2, 3, 4, 5, 6, 9 ve 10 ile Bölünebilme Kuralları), MAT.6.1.3 (Asal Sayılar ve Asal Çarpanlar), MAT.6.1.4 (Ortak Bölen ve Ortak Kat Problemleri), MAT.6.6.1 (Deneysel Olasılık), MAT.6.1.5 (Ondalık Gösterimlerde Basamak Çözümlemesi), MAT.6.1.6 (Kesir-Bölme İlişkisi ve Ondalık Karşılaştırma), MAT.6.1.7 (Kesir, Ondalık ve Yüzde Problemleri).',
    answer_key_text:
      'Soru 1 (10 P): 5 ile 25 arasındaki sıra sayıları: (6, 14), (7, 12), (12, 7), (14, 6), (21, 4) olmak üzere 5 farklı sahne düzeni.\n' +
      'Soru 2 (10 P): B ∈ {4, 8} (5\'e bölünemediği için B ≠ 0). B = 4 için 7344 -> A = 3, A + B = 7; B = 8 için 7848 -> A = 8, A + B = 16.\n' +
      'Soru 3 (15 P): a) A = 5, B = 7, b) 210 = 2¹ × 3¹ × 5¹ × 7¹, c) Farklı asal çarpanlar toplamı = 2 + 3 + 5 + 7 = 17.\n' +
      'Soru 4 (15 P): a) EKOK(18, 24) = 72 dk (1 sa 12 dk), b) 3. birlikte çalma saati = 11.24, c) Ortak bölenler: 1, 2, 3, 6.\n' +
      'Soru 5 (10 P): İstenen durum = 20 + 14 = 34; a) Kesir: 34/80 = 17/40, b) Ondalık: 0,425, c) Yüzde: %42,5.\n' +
      'Soru 6 (10 P): a) Derin: (2×10) + (4×1) + (3×1/10) + (8×1/1000), b) Kaan: 24,075 sn, c) 24,075 < 24,308 olduğundan yarışı Kaan daha önce bitirmiştir.\n' +
      'Soru 7 (10 P): a) 1. grup küp = 27/4 = 6,75 kg, b) 2. grup küp = 34/5 = 6,80 kg, c) 2. gruptaki birer küpte 0,05 kg daha fazla kil kullanılmıştır.\n' +
      'Soru 8 (20 P): Bağış = 240 adet, Kalan = 360 adet, Kütüphane = 126 adet, Satılan = 234 adet; Toplam gelir = 234 × 42,5 = 9945 TL.',
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
      'MEB Senaryo 3 konu soru dağılım tablosuna tam uyumlu, 7 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: MAT.7.1.1 (Rasyonel Sayıları Tanıma ve Sayı Doğrusunda Gösterme), MAT.7.1.2 (Rasyonel Sayıların Sonlu ve Devirli Ondalık Gösterimleri), MAT.7.1.3 (Rasyonel Sayıları Karşılaştırma ve Sıralama), MAT.7.1.4 (Rasyonel Sayılarla Çok Adımlı Gerçek Yaşam Problemleri).',
    answer_key_text:
      'Soru 1 (10 P): Sayı doğrusunda B (-7/3 = -2,33...), A (-2 1/4 = -2,25), C (-5/4 = -1,25) ve D (+3/2 = +1,5) konumları; hepsi Q elemanıdır, tam bölünmedikleri için Z elemanı değildir.\n' +
      'Soru 2 (15 P): A = -3 tam 3/4 = -15/4, B = -2 tam 5/6 = -17/6, C = -1 tam 1/2 = -3/2, D = +1 tam 3/4 = +7/4.\n' +
      'Soru 3 (15 P): 11/8 = 1375/1000 = 1,375; 17/25 = 68/100 = 0,68; -9/16 = -5625/10000 = -0,5625.\n' +
      'Soru 4 (15 P): a) 7/12 = 0,58333... (3 devirli), 11/12 = 0,91666... (6 devirli), 16/45 = 0,3555... (5 devirli). b) 25. basamaktaki rakamlar sırasıyla 3, 6 ve 5\'tir.\n' +
      'Soru 5 (15 P): -1,45 < -13/9 < -7/5 = -1,4 < +9/8 (Derya < Boran < Cemil = Ece < Emre).\n' +
      'Soru 6 (15 P): Payda 36\'da eşitlenir: -11/12 < -5/6 < -7/9 < -13/18. En çok kayıp: Çamlıdere (-11/12), En az kayıp: Demirköprü (-13/18).\n' +
      'Soru 7 (15 P): a) 1. aşamada harcanan = 1 L, 2. aşamada harcanan = 3/2 L (1,5 L), b) Su eklendikten sonra toplam sıvı = 1 + 3/4 = 7/4 L = 1 tam 3/4 L.',
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
      'MEB Senaryo 6 konu soru dağılım tablosuna tam uyumlu, 9 açık uçlu klasik soru içeren 100 puanlık 1. dönem 1. yazılıya hazırlık sınavı. Kapsanan kazanımlar: M.8.1.1.1 (Asal Çarpanlar ve Üslü Çarpım Gösterimi), M.8.1.1.2 (EBOB ve EKOK Problemleri), M.8.1.1.3 (Aralarında Asal Sayılar), M.8.1.2.1 (Tam Sayıların Tam Sayı Kuvvetleri), M.8.1.2.2 (Üslü İfadelerle İşlemler ve Denk İfadeler), M.8.1.2.4 (10\'un Tam Sayı Kuvvetleriyle İfade Etme), M.8.1.2.5 (Çok Büyük ve Çok Küçük Sayıların Bilimsel Gösterimi).',
    answer_key_text:
      'Soru 1 (10 P): a) 360 = 2³ × 3² × 5¹, 540 = 2² × 3³ × 5¹, b) İkisinin de pozitif çarpan sayısı = 24, asal olmayan pozitif çarpan sayısı = 24 - 3 = 21.\n' +
      'Soru 2 (15 P): a) EBOB(168, 210) = 42 cm, b) Toplam fotoğraf sayısı = (168 ÷ 42) × (210 ÷ 42) = 4 × 5 = 20 adet.\n' +
      'Soru 3 (15 P): EKOK(45, 60) = 180 dk = 3 saat. İlk geçiş 08.15\'ten sonra 20.00\'ye kadar 11.15, 14.15 ve 17.15\'te olmak üzere 3 kez daha birlikte geçerler.\n' +
      'Soru 4 (10 P): a) 36/84 = 3/7 = 15/35 -> 2x + 3 = 15 -> x = 6, b) EBOB(6, 18) = 6 ≠ 1 olduğundan 6 ile 18 aralarında asal değildir.\n' +
      'Soru 5 (10 P): a) A = +64, B = -81, C = 1/16, D = -125, b) (64 - 81) + 16 + (-125) = -126.\n' +
      'Soru 6 (10 P): Toplam veri = 8⁶ × 16⁴ = 2¹⁸ × 2¹⁶ = 2³⁴ bayt; bir sunucudaki veri = 2³⁴ ÷ 4⁵ = 2³⁴ ÷ 2¹⁰ = 2²⁴ bayt.\n' +
      'Soru 7 (10 P): a) 9⁴ = 3⁸, 27³ = 3⁹, 81² = 3⁸ (1. ve 3. kareler birbirine denktir), b) Çarpım = 3⁸ × 3⁹ × 3⁸ = 3²⁵.\n' +
      'Soru 8 (10 P): a) a = -5, b = -3, b) a + b = -8 ve a - b = -2.\n' +
      'Soru 9 (10 P): a) 1 <= 2,5 < 10 ve üs -9 tam sayı olduğu için bilimsel gösterimdir, b) 149 600 000 km = 1,496 × 10¹¹ m, c) Kuvvetler farkı = 11 - (-9) = 20.',
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
  const { dryRun } = resolveWriteMode(process.argv);
  console.log('--- 1. DÖNEM 1. YAZILIYA HAZIRLIK DOKÜMANLARI YAYINLAMA BETİĞİ ---');
  console.log(
    `Çalışma Modu: ${dryRun ? 'KURU ÇALIŞTIRMA (DRY-RUN - Veritabanına yazılmaz)' : 'CANLI ÇALIŞTIRMA (CONFIRMED - Veritabanına yazılır)'}`,
  );

  const results = [];

  for (const doc of DOCUMENTS_TO_PUBLISH) {
    // 1. Metin gizlilik denetimi
    assertTextPrivacy(doc.title, 'title');
    assertTextPrivacy(doc.description, 'description');
    assertTextPrivacy(doc.answer_key_text, 'answer_key_text');

    // 2. PDF dosyaları gizlilik denetimi (pdftotext)
    const studentPdfPath = path.resolve(
      process.cwd(),
      'public',
      doc.file_url.replace(/^\//, ''),
    );
    const solutionPdfPath = path.resolve(
      process.cwd(),
      'public',
      doc.solution_url.replace(/^\//, ''),
    );

    assertPdfPrivacy(studentPdfPath);
    assertPdfPrivacy(solutionPdfPath);

    console.log(
      `[GİZLİLİK ONAYLANDI] Metinler ve PDF'ler temiz: ${doc.file_name}`,
    );

    // Başlığa göre mevcut kaydı ara (idempotent kontrol)
    const { data: existing, error: searchError } = await supabase
      .from('documents')
      .select('id, title, created_at')
      .eq('title', doc.title)
      .maybeSingle();

    if (searchError) {
      throw new Error(
        `Sorgulama hatası (${doc.title}): ${searchError.message}`,
      );
    }

    if (dryRun) {
      if (existing) {
        console.log(
          `[DRY-RUN GÜNCELLENECEK] Var olan kayıt bulundu: ID=${existing.id} | ${doc.title}`,
        );
        results.push({
          action: 'DRY-RUN (UPDATE)',
          document: { id: existing.id, ...doc },
        });
      } else {
        console.log(
          `[DRY-RUN EKLENECEK] Yeni kayıt oluşturulacak: ${doc.title}`,
        );
        results.push({
          action: 'DRY-RUN (INSERT)',
          document: { id: 'DRY-RUN-ID', ...doc },
        });
      }
      continue;
    }

    if (existing) {
      console.log(
        `[GÜNCELLENİYOR] Var olan kayıt bulundu: ID=${existing.id} | ${doc.title}`,
      );
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
        throw new Error(
          `Güncelleme hatası (${doc.title}): ${updateError.message}`,
        );
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
      `[${r.action}] ID: ${r.document.id} | Sınıf: ${r.document.grade.join(',')} | ${r.document.title}`,
    );
    console.log(`   Öğrenci URL: ${r.document.file_url}`);
    console.log(`   Çözümlü URL: ${r.document.solution_url}`);
  }
  console.log('=================================================\n');

  if (dryRun) {
    console.log(
      '💡 [DRY-RUN BİTTİ] Tüm PDF ve metin gizlilik denetimleri BAŞARIYLA GEÇTİ.',
    );
    console.log(
      '💡 Veritabanına yazmak için betiği "--confirm" bayrağı ile çalıştırın:',
    );
    console.log(
      '   node scripts/publish-yazili-hazirlik-2026-1-1.mjs --confirm\n',
    );
    return;
  }

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
    console.log(
      `- ${row.id}: ${row.title} (grade=${JSON.stringify(row.grade)})`,
    );
  }
}

main().catch((err) => {
  console.error('Betiğin çalışmasında hata oluştu:', err);
  process.exit(1);
});
