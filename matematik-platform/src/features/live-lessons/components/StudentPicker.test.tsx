import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentPicker } from './StudentPicker';
import type { AppUser } from '@/types';

type TestStudent = Pick<AppUser, 'id' | 'name' | 'email' | 'grade'> & {
  name_normalized?: string | null;
};

const students: TestStudent[] = [
  {
    id: 'student-1',
    name: 'İlker Çağrı',
    name_normalized: 'ilker çağrı',
    email: 'ilker_cagri@ugurhoca.local',
    grade: 7,
  },
  {
    id: 'student-2',
    name: 'Işık Demir',
    name_normalized: 'ışık demir',
    email: 'isik_demir@ugurhoca.local',
    grade: 8,
  },
  {
    id: 'student-3',
    name: 'Ayşe Yılmaz',
    name_normalized: 'ayşe yılmaz',
    email: 'ayse_yilmaz@ugurhoca.local',
    grade: 6,
  },
];

function renderPicker(props: {
  searchQuery?: string;
  selectedStudentIds?: string[];
  students?: TestStudent[];
}) {
  const onSearchChange = vi.fn();
  const onSelectedStudentIdsChange = vi.fn();
  const utils = render(
    <StudentPicker
      onSearchChange={onSearchChange}
      onSelectedStudentIdsChange={onSelectedStudentIdsChange}
      searchQuery={props.searchQuery ?? ''}
      selectedStudentIds={props.selectedStudentIds ?? []}
      students={props.students ?? students}
    />,
  );
  return { ...utils, onSearchChange, onSelectedStudentIdsChange };
}

describe('StudentPicker', () => {
  it('lists all students when the search query is empty', () => {
    renderPicker({});
    expect(screen.getByText('İlker Çağrı')).toBeInTheDocument();
    expect(screen.getByText('Işık Demir')).toBeInTheDocument();
    expect(screen.getByText('Ayşe Yılmaz')).toBeInTheDocument();
  });

  it('matches Turkish names typed with ASCII letters (cagri -> Çağrı)', () => {
    renderPicker({ searchQuery: 'cagri' });
    expect(screen.getByText('İlker Çağrı')).toBeInTheDocument();
    expect(screen.queryByText('Ayşe Yılmaz')).not.toBeInTheDocument();
  });

  it('matches names typed with dotless or capital I', () => {
    renderPicker({ searchQuery: 'isik' });
    expect(screen.getByText('Işık Demir')).toBeInTheDocument();
    expect(screen.queryByText('İlker Çağrı')).not.toBeInTheDocument();
  });

  it('matches the slug email even when only the underscore form is typed', () => {
    renderPicker({ searchQuery: 'ayse yilmaz' });
    expect(screen.getByText('Ayşe Yılmaz')).toBeInTheDocument();
  });

  it('shows the no-match message with the typed query when nothing matches', () => {
    renderPicker({ searchQuery: 'xyzkimsem' });
    expect(screen.getByTestId('student-picker-no-match')).toHaveTextContent(
      'xyzkimsem',
    );
  });

  it('shows the empty-list message when no students are loaded', () => {
    renderPicker({ students: [] });
    expect(screen.getByTestId('student-picker-empty')).toBeInTheDocument();
  });

  it('toggles selection when a student button is clicked', () => {
    const { onSelectedStudentIdsChange } = renderPicker({});
    fireEvent.click(
      screen.getByRole('button', { name: /İlker Çağrı/i }),
    );
    expect(onSelectedStudentIdsChange).toHaveBeenCalledWith(['student-1']);
  });

  it('renders the visible-vs-total summary while searching', () => {
    renderPicker({ searchQuery: 'cagri' });
    expect(screen.getByText('1 / 3 öğrenci')).toBeInTheDocument();
  });
});
