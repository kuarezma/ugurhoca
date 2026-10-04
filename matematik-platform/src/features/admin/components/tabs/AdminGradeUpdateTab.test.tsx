import { render, screen, within } from '@testing-library/react';
import { ADMIN_EMAIL } from '@/lib/admin';
import type { AdminUser } from '@/features/admin/types';
import AdminGradeUpdateTab from './AdminGradeUpdateTab';

it('counts numeric and string grades together, including all graduate representations', () => {
  const grades = [5, '5', 0, '0', 'Mezun', null, ''];
  const users = grades.map((grade, index) => ({
    id: String(index),
    grade,
    name: 'Öğrenci',
    email: 'student@example.com',
  })) as AdminUser[];
  users.push({ id: 'admin', grade: 5, email: ADMIN_EMAIL, name: 'Admin' });
  render(
    <AdminGradeUpdateTab
      users={users}
      isSubmitting={false}
      lastGradeUpdate={null}
      onUpdateGrades={vi.fn()}
    />,
  );
  expect(
    within(screen.getByText('5. Sınıf').parentElement!).getByText('2'),
  ).toBeInTheDocument();
  expect(
    within(screen.getByText('Mezun').parentElement!).getByText('3'),
  ).toBeInTheDocument();
});
