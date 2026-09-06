'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Presentation,
  Smartphone,
  PlusCircle,
  History,
  Sparkles,
  ArrowRight,
  School,
} from 'lucide-react';
import type { ExitTicketSession } from '../types';
import {
  getSavedSessions,
  createExitTicketSession,
} from '../lib/exitTicketStorage';
import { EXIT_TICKET_TEMPLATES } from '../lib/exitTicketTemplates';
import { ExitTicketTeacherPresenter } from '../components/ExitTicketTeacherPresenter';
import { ExitTicketStudentPad } from '../components/ExitTicketStudentPad';
import { ExitTicketCreateModal } from '../components/ExitTicketCreateModal';

export function ExitTicketPageContainer() {
  const searchParams = useSearchParams();
  const initialPin = searchParams.get('pin') || '';
  const initialRole = searchParams.get('role');

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(
    initialRole === 'teacher' ? 'teacher' : initialPin ? 'student' : 'student',
  );

  const [currentSession, setCurrentSession] = useState<ExitTicketSession | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<ExitTicketSession[]>([]);

  useEffect(() => {
    setSavedSessions(getSavedSessions());
  }, []);

  // Hızlı Demo Oturumu Aç (Öğretmenler için tek tık)
  const handleLaunchQuickDemo = () => {
    const template = EXIT_TICKET_TEMPLATES[0];
    const session = createExitTicketSession(
      template.title,
      template.grade,
      template.questions,
    );
    setCurrentSession(session);
    setActiveTab('teacher');
  };

  const handleSelectSavedSession = (session: ExitTicketSession) => {
    setCurrentSession(session);
    setActiveTab('teacher');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Üst Mod Değiştirici (Öğrenci / Öğretmen Sekmeleri) - Oturum sunulmuyorsa göster */}
      {!currentSession && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Sınıf İçi Anlık Değerlendirme
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Ders Sonu Çıkış Bileti (Exit Ticket)
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              3 soruda sınıfın konuyu ne kadar kavradığını ve kavram yanılgılarını canlı görün.
            </p>
          </div>

          <div className="flex items-center p-1.5 rounded-2xl bg-slate-900 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'student'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Öğrenci Girişi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('teacher')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === 'teacher'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Öğretmen / Akıllı Tahta</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. ÖĞRETMEN / AKILLI TAHTA GÖRÜNÜMÜ */}
      {activeTab === 'teacher' && (
        <div className="w-full flex flex-col gap-6">
          {currentSession ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSession(null);
                    setSavedSessions(getSavedSessions());
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1.5"
                >
                  ← Oturum Listesine Dön
                </button>
              </div>

              <ExitTicketTeacherPresenter
                session={currentSession}
                onUpdateSession={(updated) => setCurrentSession(updated)}
                onEndSession={() => setSavedSessions(getSavedSessions())}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sol: Yeni Oturum Başlatma Kartları */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/30 via-slate-900 to-slate-950 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Sınıf Sunumu Modu
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
                      Akıllı Tahtada Çıkış Bileti Başlatın
                    </h2>
                    <p className="text-slate-300 text-sm mt-2 max-w-lg leading-relaxed">
                      Öğrencileriniz üye olmadan, sadece ekranda görecekleri 6 haneli kod ile telefon veya tabletlerinden bağlanır. Seçilen şıklar ve kavram yanılgıları tahtada anlık olarak analiz edilir.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-3 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
                      >
                        <PlusCircle className="w-5 h-5" />
                        <span>Şablonla Yeni Oturum Aç</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLaunchQuickDemo}
                        className="px-5 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition flex items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span>Hızlı Demo (Kesirler)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pedagojik Özellikler Listesi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-sm">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
                      1
                    </div>
                    <h4 className="font-bold text-white text-sm">10 Saniyede Katılım</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Kayıt yok, şifre yok. 6 haneli PIN ile her cihazdan doğrudan bağlantı.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-sm">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-2">
                      2
                    </div>
                    <h4 className="font-bold text-white text-sm">Canlı Dağılım</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Tüm sınıfın A, B, C, D dağılımını yüzde ve adet olarak tahtada gösterin.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 text-sm">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-2">
                      3
                    </div>
                    <h4 className="font-bold text-white text-sm">Yanılgı Teşhisi</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Öğrenci neden B şıkkına gitti? Çeldiriciye özel pedagojik uyarı anında devrede.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sağ: Kayıtlı & Geçmiş Oturumlar */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-slate-300">
                  <History className="w-4 h-4 text-violet-400" />
                  <span>Son Oturumlarınız</span>
                </div>

                {savedSessions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                    <School className="w-8 h-8 mb-2 opacity-40" />
                    Henüz kayıtlı bir oturumunuz yok. Yukarıdan bir oturum başlatabilirsiniz.
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-[380px]">
                    {savedSessions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSavedSession(s)}
                        className="w-full text-left p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-violet-500/40 hover:bg-violet-500/10 transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-1.5 py-0.5 rounded">
                              {s.code}
                            </span>
                            <span className="text-xs text-slate-400">
                              {s.responses.length} Cevap
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-white mt-1 group-hover:text-violet-300 transition line-clamp-1">
                            {s.title}
                          </h4>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ÖĞRENCİ PAD GÖRÜNÜMÜ */}
      {activeTab === 'student' && (
        <div className="w-full flex justify-center py-4">
          <ExitTicketStudentPad initialCode={initialPin} />
        </div>
      )}

      {/* Yeni Oturum Oluşturma Modal */}
      <ExitTicketCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={(session) => {
          setCurrentSession(session);
          setSavedSessions(getSavedSessions());
          setActiveTab('teacher');
        }}
      />
    </div>
  );
}
