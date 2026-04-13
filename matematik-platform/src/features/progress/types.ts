export type StudySession = {
  activity_type?: string;
  date: string;
  duration: number;
  id?: string;
  topics?: string[];
};

export type ProgressRow = {
  id?: string;
  last_practiced?: string;
  mastery_level: number;
  practice_count?: number;
  topic: string;
  user_id: string;
};

export type StudyGoal = {
  target_duration: number;
  week_start: string;
};

export type UserBadge = {
  description?: string | null;
  earned_at?: string;
  icon?: string | null;
  id: string;
  name: string;
};
