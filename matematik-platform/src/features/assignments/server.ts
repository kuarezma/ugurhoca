import 'server-only';

import { getServerAccessToken, getServerAuthSkeleton } from '@/lib/auth-snapshot.server';
import { getVerifiedServerUser } from '@/lib/auth-verify.server';
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
    // Sorgu kimliği yalnızca doğrulanmış kullanıcıdan gelir; imzasız snapshot
    // çerezi doğrulama başarısızsa yalnız yükleme iskeleti için kullanılır.
    const [verifiedUser, skeleton, accessToken] = await Promise.all([
      getVerifiedServerUser(),
      getServerAuthSkeleton(),
      getServerAccessToken(),
    ]);

    if (!verifiedUser || !accessToken) {
      return {
        initialAssignments: [],
        initialSubmissions: {},
        initialUser: skeleton,
        isHydrated: false,
      };
    }

    const initialUser: AppUser = {
      ...verifiedUser,
    };

    const supabase = createServerSupabaseClient(accessToken);
    const gradeOrStudentClause =
      typeof verifiedUser.grade === 'string'
        ? `grade.eq.${verifiedUser.grade},student_id.eq.${verifiedUser.id}`
        : `grade.eq.${Number(verifiedUser.grade)},student_id.eq.${verifiedUser.id}`;

    const [assignmentsRes, submissionsRes] = await Promise.all([
      supabase
        .from('assignments')
        .select('*')
        .or(gradeOrStudentClause)
        .order('created_at', { ascending: false }),
      supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', verifiedUser.id),
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
