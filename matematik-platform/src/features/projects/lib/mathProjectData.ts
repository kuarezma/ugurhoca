export interface ProjectRubricItem {
  criterion: string;
  maxPoints: number;
  description: string;
}

export interface MathProject {
  id: string;
  title: string;
  grade: string;
  durationWeeks: number;
  difficulty: 'Kolay' | 'Orta' | 'İleri';
  summary: string;
  realWorldScenario: string;
  milestones: { step: number; title: string; description: string }[];
  rubric: ProjectRubricItem[];
  sampleDeliverables: string[];
}

export const MATH_PROJECTS: MathProject[] = [
  {
    id: 'proj-energy-linear',
    title: 'Evimizin Enerji Verimliliği & Doğrusal Fonksiyonlar',
    grade: '8',
    durationWeeks: 3,
    difficulty: 'Orta',
    summary: 'Ailenizin son 6 aylık elektrik/su tüketim verilerini toplayarak doğrusal denklem kurun, tasarruf eğimini hesaplayın.',
    realWorldScenario: 'Bir enerji danışmanı gibi davranarak hanenizin tüketim grafiğini çıkaracak ve LED lamba değişiminin faturaya yansımasını doğrusal modelle (y = mx + b) tahmin edeceksiniz.',
    milestones: [
      { step: 1, title: 'Veri Toplama', description: 'Son 6 aya ait tüketim kWh/m³ değerlerini tabloya aktarın.' },
      { step: 2, title: 'Grafik ve Denklem Çıkarma', description: 'Kartezyen düzlemde noktaları birleştirin, eğimi (birim tüketim maliyeti) bulun.' },
      { step: 3, title: 'Tasarruf Senaryosu', description: '%20 tasarruf durumundaki yeni denklem doğrusunu çizip sunum raporunu hazırlayın.' },
    ],
    rubric: [
      { criterion: 'Matematiksel Doğruluk', maxPoints: 40, description: 'Doğrusal denklem, eğim hesabı ve birim dönüşümleri eksiksiz olmalı.' },
      { criterion: 'Veri Analizi & Grafik', maxPoints: 30, description: 'Eksenler doğru ölçeklendirilmeli, grafik temiz çizilmeli.' },
      { criterion: 'Raporlama & Çözüm Önerisi', maxPoints: 30, description: 'Gerçekçi tasarruf önerileri ve matematiksel gerekçelendirme.' },
    ],
    sampleDeliverables: ['Tüketim Veri Tablosu', 'Milimetrik Grafik Çizimi', '1 Sayfalık Yönetici Özeti'],
  },
  {
    id: 'proj-golden-ratio',
    title: 'Altın Oran & Mimari Tasarım Atölyesi',
    grade: '8',
    durationWeeks: 2,
    difficulty: 'Orta',
    summary: 'Fibonacci dizisi ve altın dikdörtgen kuralını kullanarak kendi çalışma odanızın veya bir tarihi yapının oran analizini yapın.',
    realWorldScenario: 'Mimar Sinan eserlerinde veya modern logolarda altın oran (φ ≈ 1.618) izlerini sürerek estetik ve matematiğin buluşmasını modelleyin.',
    milestones: [
      { step: 1, title: 'Fibonacci Spirali Çizimi', description: 'Pergel ve cetvelle 1, 1, 2, 3, 5, 8, 13 karelerini çizip altın spirali oluşturun.' },
      { step: 2, title: 'Obje/Mekan Ölçümü', description: 'Seçtiğiniz 3 objenin en/boy oranını ölçüp 1.618 değerine yakınlığını hesaplayın.' },
      { step: 3, title: 'Ölçekli Plan Tasarımı', description: 'Altın oran prensibine uygun 1:50 ölçekli bir çalışma alanı taslağı çizin.' },
    ],
    rubric: [
      { criterion: 'Geometrik Çizim & Ölçek', maxPoints: 40, description: 'Karelerin oranları ve pergel yayları kusursuz olmalı.' },
      { criterion: 'Oran & Orantı Hesapları', maxPoints: 35, description: 'Ölçüm hata payları ve altın oran yüzdesi doğru hesaplanmalı.' },
      { criterion: 'Yaratıcılık ve Estetik', maxPoints: 25, description: 'Tasarımın özgünlüğü ve mimari detaylar.' },
    ],
    sampleDeliverables: ['Altın Spiral Çizimi', 'Ölçüm Karşılaştırma Föyü', 'Ölçekli Mimari Taslak'],
  },
  {
    id: 'proj-fractal-geometry',
    title: 'Fraktallar: Doğadaki Geometrik Örüntüler',
    grade: '8 & Lise',
    durationWeeks: 3,
    difficulty: 'İleri',
    summary: 'Sierpinski üçgeni veya Koch kartanesi modelleyerek sonsuz çevre - sonlu alan paradoksunu keşfedin.',
    realWorldScenario: 'Akciğer bronşları, nehir yatakları ve ağaç dallarındaki fraktal matematiği modelleyerek anten teknolojilerindeki fraktal kullanımını inceleyin.',
    milestones: [
      { step: 1, title: 'Adım Adım Fraktal İnşası', description: 'Eşkenar üçgenden başlayarak ilk 4 adımı cetvelle çizin.' },
      { step: 2, title: 'Üslü Sayı Örüntüsü', description: 'Her adımdaki üçgen sayısı (3^n) ve kenar uzunluğu (1/2^n) cebirsel tablosunu çıkarın.' },
      { step: 3, title: 'Paradoks Kanıtı', description: 'Adım sayısı sonsuza giderken çevre ve alan değişimini açıklayan infografik oluşturun.' },
    ],
    rubric: [
      { criterion: 'Örüntü ve Üslü İfadeler', maxPoints: 45, description: 'Geometrik dizinin genel terim formülü doğru türetilmeli.' },
      { criterion: 'Çizim Hassasiyeti', maxPoints: 30, description: 'Geometrik benzerlik ve ölçek oranı korunmalı.' },
      { criterion: 'Paradoks İzahı', maxPoints: 25, description: 'Sonsuzluk kavramının mantıksal açıklaması.' },
    ],
    sampleDeliverables: ['4 Aşamalı Fraktal Çizimi', 'Üslü Sayı Tablosu', 'Fraktal İnfografiği'],
  },
];

export const PROJECT_PROGRESS_STORAGE_KEY = 'ugurhoca_math_project_progress';

export interface ProjectProgressRecord {
  projectId: string;
  completedSteps: number[];
  submissionNotes?: string;
  lastUpdated: string;
}

export function getProjectProgress(projectId: string): ProjectProgressRecord {
  if (typeof window === 'undefined') return { projectId, completedSteps: [], lastUpdated: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(`${PROJECT_PROGRESS_STORAGE_KEY}_${projectId}`);
    if (!raw) return { projectId, completedSteps: [], lastUpdated: new Date().toISOString() };
    return JSON.parse(raw) as ProjectProgressRecord;
  } catch {
    return { projectId, completedSteps: [], lastUpdated: new Date().toISOString() };
  }
}

export function toggleProjectStep(projectId: string, stepNumber: number): ProjectProgressRecord {
  const current = getProjectProgress(projectId);
  const exists = current.completedSteps.includes(stepNumber);
  const updatedSteps = exists
    ? current.completedSteps.filter((s) => s !== stepNumber)
    : [...current.completedSteps, stepNumber].sort((a, b) => a - b);

  const updatedRecord: ProjectProgressRecord = {
    ...current,
    completedSteps: updatedSteps,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${PROJECT_PROGRESS_STORAGE_KEY}_${projectId}`, JSON.stringify(updatedRecord));
  }

  return updatedRecord;
}
