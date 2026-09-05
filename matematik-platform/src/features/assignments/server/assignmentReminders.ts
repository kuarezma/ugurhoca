import { createServiceRoleClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';
import type { Assignment, Submission } from '@/types';

const log = createLogger('assignment-reminders');

export type AssignmentReminderResult = {
  assignmentCount: number;
  sentCount: number;
  notifiedStudentIds: string[];
};

export async function sendDueAssignmentReminders(): Promise<AssignmentReminderResult> {
  const supabase = createServiceRoleClient();
  const now = new Date();
  // Önümüzdeki 24 saat içinde teslim tarihi gelen ödevler
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*')
    .gte('due_date', now.toISOString())
    .lte('due_date', next24Hours.toISOString());

  if (assignmentsError) {
    log.error('Failed to query upcoming assignments', assignmentsError);
    return { assignmentCount: 0, sentCount: 0, notifiedStudentIds: [] };
  }

  if (!assignments || assignments.length === 0) {
    return { assignmentCount: 0, sentCount: 0, notifiedStudentIds: [] };
  }

  let totalSent = 0;
  const notifiedStudentIds: string[] = [];

  for (const assignment of assignments as Assignment[]) {
    if (!assignment.due_date) continue;

    // 1. İlgili öğrencileri bul
    let studentIds: string[] = [];

    if (assignment.student_id) {
      studentIds = [assignment.student_id];
    } else if (assignment.grade !== undefined && assignment.grade !== null) {
      const numGrade = Number(assignment.grade);
      const gradeFilter = Number.isFinite(numGrade) ? numGrade : assignment.grade;
      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('grade', gradeFilter);

      studentIds = (students || []).map((s: { id: string }) => s.id);
    }

    if (studentIds.length === 0) continue;

    // 2. Halihazırda ödevini teslim etmiş öğrencileri filtrele
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select('student_id')
      .eq('assignment_id', assignment.id);

    const submittedStudentIds = new Set(
      (submissions || []).map((sub: Pick<Submission, 'student_id'>) => sub.student_id),
    );

    const pendingStudentIds = studentIds.filter((id) => !submittedStudentIds.has(id));
    if (pendingStudentIds.length === 0) continue;

    // 3. Daha önce bu ödev için hatırlatma gitmiş mi kontrol et (mükerrer bildirim önleme)
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('type', 'assignment')
      .contains('metadata', { assignment_id: assignment.id });

    const alreadyNotified = new Set(
      (existingNotifications || []).map((n: { user_id: string }) => n.user_id),
    );

    const toNotify = pendingStudentIds.filter((id) => !alreadyNotified.has(id));
    if (toNotify.length === 0) continue;

    const formattedDueDate = new Intl.DateTimeFormat('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'Europe/Istanbul',
    }).format(new Date(assignment.due_date));

    const rows = toNotify.map((studentId) => ({
      user_id: studentId,
      title: 'Ödev Teslim Hatırlatması',
      message: `"${assignment.title}" ödevinin teslim tarihi yaklaşıyor (${formattedDueDate}). Lütfen teslim etmeyi unutma!`,
      type: 'assignment',
      metadata: {
        assignment_id: assignment.id,
        due_date: assignment.due_date,
        href: '/odevler',
      },
    }));

    const { error: insertError } = await supabase.from('notifications').insert(rows);

    if (insertError) {
      log.error('Failed to insert assignment reminders', insertError);
    } else {
      totalSent += rows.length;
      notifiedStudentIds.push(...toNotify);
    }
  }

  log.info('Assignment reminders finished', {
    assignmentCount: assignments.length,
    sentCount: totalSent,
  });

  return {
    assignmentCount: assignments.length,
    sentCount: totalSent,
    notifiedStudentIds,
  };
}
