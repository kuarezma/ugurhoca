import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { AdminUser } from '@/features/admin/types';

type ToastFn = (type: 'success' | 'error' | 'info', message: string) => void;

export function useClassroomGuidanceNotes(
  students: AdminUser[],
  showToast: ToastFn,
) {
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [serverNotes, setServerNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!students || students.length === 0) return;
    const studentIds = students.map((s) => s.id);

    const fetchNotes = async () => {
      try {
        if (!supabase || typeof supabase.from !== 'function') return;
        const { data, error } = await supabase
          .from('student_admin_notes')
          .select('student_id, body')
          .in('student_id', studentIds);

        if (data && !error) {
          const notesMap: Record<string, string> = {};
          data.forEach((row) => {
            if (row.student_id && row.body) {
              notesMap[row.student_id] = row.body;
              if (typeof window !== 'undefined') {
                localStorage.setItem(
                  `ugurhoca_guidance_note_${row.student_id}`,
                  row.body,
                );
              }
            }
          });
          setServerNotes((prev) => ({ ...prev, ...notesMap }));
        }
      } catch {
        // offline fallback to localStorage
      }
    };

    void fetchNotes();
  }, [students]);

  const getSavedNote = useCallback(
    (studentId: string) => {
      if (serverNotes[studentId] !== undefined) {
        return serverNotes[studentId];
      }
      if (typeof window !== 'undefined') {
        return (
          localStorage.getItem(`ugurhoca_guidance_note_${studentId}`) || ''
        );
      }
      return '';
    },
    [serverNotes],
  );

  const handleSaveNote = useCallback(
    async (studentId: string, text: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`ugurhoca_guidance_note_${studentId}`, text);
      }
      setServerNotes((prev) => ({ ...prev, [studentId]: text }));

      try {
        if (!supabase || typeof supabase.from !== 'function') {
          showToast('success', 'Rehberlik gözlem notu kaydedildi.');
          return;
        }
        const { data: userData } = await supabase.auth.getUser();
        const authorId = userData?.user?.id;

        const { data: existing } = await supabase
          .from('student_admin_notes')
          .select('id')
          .eq('student_id', studentId)
          .maybeSingle();

        if (existing?.id) {
          await supabase
            .from('student_admin_notes')
            .update({
              body: text,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('student_admin_notes').insert({
            student_id: studentId,
            author_id: authorId,
            body: text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
        showToast('success', 'Rehberlik gözlem notu kaydedildi.');
      } catch {
        showToast('success', 'Rehberlik gözlem notu kaydedildi.');
      }
    },
    [showToast],
  );

  return {
    editingNotes,
    setEditingNotes,
    getSavedNote,
    handleSaveNote,
  };
}
