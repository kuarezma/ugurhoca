import 'server-only';

import { getServerAccessToken, getServerAuthSnapshot } from '@/lib/auth-snapshot.server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AppUser, Assignment, Submission } from '@/types';

type InitialAssignmentsPageData = {
  initialAssignments: Assignment[];
  initialSubmissions: Record<string, Submission>;
  initialUser: AppUser | null;
  isHydrated: boolean;
};

export const loadInitialAssignmentsPageData =
  async (): Promise<InitialAssignmentsPageData> => {
    const [snapshot, accessToken] = await Promise.all([
      getServerAuthSnapshot(),
      getServerAccessToken(),
    ]);

    if (!snapshot) {
      return {
        initialAssignments: [],
        initialSubmissions: {},
        initialUser: null,
        isHydrated: false,
      };
    }

    const initialUser: AppUser = {
      ...snapshot,
    };

    if (!accessToken) {
      return {
        initialAssignments: [],
        initialSubmissions: {},
        initialUser,
        isHydrated: false,
      };
    }

    const supabase = createServerSupabaseClient(accessToken);
    const gradeOrStudentClause =
      typeof snapshot.grade === 'string'
        ? `grade.eq.${snapshot.grade},student_id.eq.${snapshot.id}`
        : `grade.eq.${Number(snapshot.grade)},student_id.eq.${snapshot.id}`;

    const [assignmentsRes, submissionsRes] = await Promise.all([
      supabase
        .from('assignments')
        .select('*')
        .or(gradeOrStudentClause)
        .order('created_at', { ascending: false }),
      supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', snapshot.id),
    ]);

    const initialSubmissions = ((submissionsRes.data || []) as Submission[]).reduce<
      Record<string, Submission>
    >((acc, submission) => {
      acc[submission.assignment_id] = submission;
      return acc;
    }, {});

    return {
      initialAssignments: (assignmentsRes.data || []) as Assignment[],
      initialSubmissions,
      initialUser,
      isHydrated: true,
    };
  };
