import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAdminModalState } from './useAdminModalState';

describe('admin sınıf düzenleme başlangıcı', () => {
  it('saklanan 0 değerini beşinci sınıfa çevirmeden Mezun seçer', () => {
    const { result } = renderHook(() => useAdminModalState());
    act(() =>
      result.current.openEditUser({
        id: 'graduate',
        name: 'Ada',
        email: 'a@example.com',
        grade: 0,
      }),
    );
    expect(result.current.formData.grade).toBe('Mezun');
  });
});
