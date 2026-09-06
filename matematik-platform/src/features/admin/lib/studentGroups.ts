import { supabase } from '@/lib/supabase/client';

export type StudentGroup = {
  id: string;
  name: string;
  grade?: string | null;
  description?: string | null;
  color?: string;
  memberCount?: number;
  created_at: string;
  updated_at: string;
};

export type StudentGroupMember = {
  group_id: string;
  user_id: string;
  joined_at: string;
};

/**
 * Verilen öğrenci listesini ve grup üyeliğini birleştirerek
 * sadece ilgili gruptaki öğrencileri döndürür.
 */
export function filterStudentsByGroup<T extends { id: string }>(
  students: T[],
  groupMemberUserIds: Set<string> | string[],
): T[] {
  const memberSet = groupMemberUserIds instanceof Set
    ? groupMemberUserIds
    : new Set(groupMemberUserIds);

  return students.filter((student) => memberSet.has(student.id));
}

/**
 * Birden fazla grup seçildiğinde, bu gruplara ait tüm tekil (unique)
 * öğrenci ID'lerini birleştirir.
 */
export function mergeGroupStudentIds(
  groupMembersMap: Record<string, string[]>,
  selectedGroupIds: string[],
): string[] {
  const uniqueIds = new Set<string>();

  for (const gId of selectedGroupIds) {
    const memberIds = groupMembersMap[gId] || [];
    for (const uid of memberIds) {
      uniqueIds.add(uid);
    }
  }

  return Array.from(uniqueIds);
}

/**
 * Supabase'den mevcut grupları ve opsiyonel üye sayılarını çeker.
 */
export async function fetchStudentGroups(): Promise<StudentGroup[]> {
  try {
    const { data, error } = await supabase
      .from('student_groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Gruplar çekilemedi:', error.message);
      return [];
    }

    return (data || []) as StudentGroup[];
  } catch (err) {
    console.warn('Gruplar çekilirken istisna oluştu:', err);
    return [];
  }
}

/**
 * Belirli bir gruba ait öğrenci ID'lerini çeker.
 */
export async function fetchGroupMemberIds(groupId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('student_group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (error) {
      console.warn('Grup üyeleri çekilemedi:', error.message);
      return [];
    }

    return (data || []).map((row) => row.user_id);
  } catch {
    return [];
  }
}
