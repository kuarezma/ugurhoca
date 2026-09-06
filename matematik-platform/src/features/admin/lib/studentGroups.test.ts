import { describe, it, expect } from 'vitest';
import { filterStudentsByGroup, mergeGroupStudentIds } from './studentGroups';

describe('studentGroups utility functions', () => {
  const mockStudents = [
    { id: 'student-1', name: 'Ali' },
    { id: 'student-2', name: 'Ayşe' },
    { id: 'student-3', name: 'Mehmet' },
    { id: 'student-4', name: 'Zeynep' },
  ];

  it('filterStudentsByGroup sadece grup üyesi öğrencileri filtreler', () => {
    const memberIds = ['student-1', 'student-3'];
    const filtered = filterStudentsByGroup(mockStudents, memberIds);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((s) => s.id)).toEqual(['student-1', 'student-3']);
  });

  it('mergeGroupStudentIds birden çok grubun tekil öğrenci listesini birleştirir', () => {
    const groupMembersMap = {
      'group-A': ['student-1', 'student-2'],
      'group-B': ['student-2', 'student-3'],
      'group-C': ['student-4'],
    };

    const merged = mergeGroupStudentIds(groupMembersMap, ['group-A', 'group-B']);
    expect(merged.sort()).toEqual(['student-1', 'student-2', 'student-3'].sort());
  });

  it('seçili grup boşsa boş dizi döndürür', () => {
    const merged = mergeGroupStudentIds({}, []);
    expect(merged).toEqual([]);
  });
});
