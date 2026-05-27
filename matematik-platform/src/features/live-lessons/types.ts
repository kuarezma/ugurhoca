import type { GradeValue } from '@/types';

export type LiveLessonStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';
export type LiveLessonRole = 'teacher' | 'student';
export type LiveLessonMicPermission = 'blocked' | 'requested' | 'allowed';
export type LiveLessonHandStatus = 'lowered' | 'raised' | 'mic_requested';

export type LiveLesson = {
  id: string;
  room_id: string;
  title: string;
  description?: string | null;
  target_grade: string;
  target_student_ids?: string[] | null;
  starts_at: string;
  duration_minutes: number;
  status: LiveLessonStatus;
  created_by?: string | null;
  teacher_proof?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type LiveLessonParticipant = {
  id: string;
  lesson_id: string;
  user_id?: string | null;
  user_name: string;
  role: LiveLessonRole;
  identity?: string | null;
  joined_at: string;
  left_at?: string | null;
  microphone_allowed?: boolean | null;
  mic_permission?: LiveLessonMicPermission | null;
  hand_status?: LiveLessonHandStatus | null;
  approved_at?: string | null;
  muted_by_teacher?: boolean | null;
  last_seen_at?: string | null;
  updated_at?: string | null;
};

export type LiveLessonEvent = {
  id: string;
  lesson_id: string;
  user_id?: string | null;
  user_name?: string | null;
  event_type: string;
  payload?: Record<string, unknown> | null;
  created_at: string;
};

export type LiveLessonChatMessage = {
  id: string;
  lesson_id: string;
  user_id?: string | null;
  user_name: string;
  role: LiveLessonRole;
  message: string;
  created_at: string;
};

export type LiveLessonAudienceGrade = Extract<GradeValue, number> | 'Mezun' | 'all';

export type LiveLessonDashboardData = {
  lessons: LiveLesson[];
  participants: LiveLessonParticipant[];
  events: LiveLessonEvent[];
  chatMessages: LiveLessonChatMessage[];
};
