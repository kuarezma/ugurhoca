import type { GradeValue } from '@/types';

export type LiveLessonStatus = 'scheduled' | 'active' | 'ended' | 'cancelled';
export type LiveLessonRole = 'teacher' | 'student';

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
  joined_at: string;
  left_at?: string | null;
  microphone_allowed?: boolean | null;
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
