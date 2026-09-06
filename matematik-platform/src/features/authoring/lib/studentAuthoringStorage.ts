export interface StudentAuthoredQuestion {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  topic: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  distractorExplanations: Record<number, string>;
  solutionExplanation: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  teacherFeedback?: string;
}

export const STUDENT_AUTHORING_STORAGE_KEY = 'ugurhoca_student_authored_questions';

export const DEFAULT_AUTHORED_QUESTIONS: StudentAuthoredQuestion[] = [
  {
    id: 'auth-q1',
    studentId: 'std-1',
    studentName: 'Ahmet Yılmaz',
    grade: '8',
    topic: 'Çarpanlar ve Katlar',
    questionText: 'Bir marangoz 120 cm ve 180 cm uzunluğundaki iki tahtayı hiç parça artmayacak şekilde eşit uzunlukta en büyük parçalara bölmek istiyor. Marangoz toplam kaç kesim işlemi yapar?',
    options: ['5', '3', '4', '6'],
    correctIndex: 1, // 3 kesim (120/60 = 2 parça -> 1 kesim, 180/60 = 3 parça -> 2 kesim. Toplam 1+2 = 3)
    distractorExplanations: {
      0: 'Parça sayısı (2+3=5) ile kesim sayısını karıştırdın. Kesim sayısı her zaman parça sayısının 1 eksiğidir!',
      2: 'Sadece 180 cm tahtanın kesim sayısını hesapladın.',
      3: 'EBOB olan 60 yerine işlem hatası yaptın.',
    },
    solutionExplanation: 'EBOB(120, 180) = 60 cm parça boyudur. 120 cm tahta 2 parça (1 kesim), 180 cm tahta 3 parça (2 kesim) oluşturur. Toplam 1 + 2 = 3 kesim gerekir.',
    difficulty: 'Orta',
    status: 'approved',
    createdAt: '2026-09-04T10:00:00.000Z',
    teacherFeedback: 'Harika bir çeldirici kurgusu! Kesim sayısı ile parça sayısı farkını harika yakalamışsın.',
  },
  {
    id: 'auth-q2',
    studentId: 'std-2',
    studentName: 'Zeynep Kaya',
    grade: '8',
    topic: 'Kareköklü İfadeler',
    questionText: 'Alanı 108 cm² olan bir karenin çevre uzunluğu hangi iki tam sayı arasındadır?',
    options: ['36 ile 37', '41 ile 42', '44 ile 45', '40 ile 41'],
    correctIndex: 1, // √108 ≈ 10.39 -> 4 * 10.39 ≈ 41.56 -> 41 ile 42 arası
    distractorExplanations: {
      0: 'Karenin bir kenarını çevre zannettin.',
      2: '√108 sayısını 11 alıp fazla hesapladın.',
      3: 'İşleminde yuvarlama hatası yaptın.',
    },
    solutionExplanation: 'Bir kenar √108 cm. √100 < √108 < √121 olduğundan bir kenar 10 ile 11 arasındadır (yaklaşık 10.4). Çevre 4 * 10.4 ≈ 41.6 cm olup 41 ile 42 arasındadır.',
    difficulty: 'Orta',
    status: 'pending',
    createdAt: '2026-09-06T09:30:00.000Z',
  },
];

export function getStudentAuthoredQuestions(): StudentAuthoredQuestion[] {
  if (typeof window === 'undefined') return DEFAULT_AUTHORED_QUESTIONS;
  try {
    const raw = localStorage.getItem(STUDENT_AUTHORING_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDENT_AUTHORING_STORAGE_KEY, JSON.stringify(DEFAULT_AUTHORED_QUESTIONS));
      return DEFAULT_AUTHORED_QUESTIONS;
    }
    return JSON.parse(raw) as StudentAuthoredQuestion[];
  } catch {
    return DEFAULT_AUTHORED_QUESTIONS;
  }
}

export function saveStudentAuthoredQuestion(question: StudentAuthoredQuestion): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const questions = getStudentAuthoredQuestions();
    const existingIdx = questions.findIndex((q) => q.id === question.id);
    if (existingIdx >= 0) {
      questions[existingIdx] = question;
    } else {
      questions.unshift(question);
    }
    localStorage.setItem(STUDENT_AUTHORING_STORAGE_KEY, JSON.stringify(questions));
    return true;
  } catch (error) {
    console.error('Failed to save authored question:', error);
    return false;
  }
}

export function updateAuthoredQuestionStatus(
  questionId: string,
  status: 'approved' | 'rejected',
  teacherFeedback?: string
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const questions = getStudentAuthoredQuestions();
    const target = questions.find((q) => q.id === questionId);
    if (!target) return false;

    target.status = status;
    if (teacherFeedback) target.teacherFeedback = teacherFeedback;

    localStorage.setItem(STUDENT_AUTHORING_STORAGE_KEY, JSON.stringify(questions));
    return true;
  } catch (error) {
    console.error('Failed to update question status:', error);
    return false;
  }
}
