import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdventureLearningPath } from './AdventureLearningPath';
import { ADVENTURE_CURRICULUM } from './AdventureCurriculumData';
import { calculateAdventureTopics } from './adventure-progress';

describe('annual curriculum learning path', () => {
  it.each(['5', '6', '7', '8'])(
    'renders every grade %s topic and its theme with accessible detail',
    (grade) => {
      const topics = calculateAdventureTopics(ADVENTURE_CURRICULUM[grade], []);
      const { container } = render(
        <AdventureLearningPath
          topics={topics}
          selectedGrade={grade}
          onGradeChange={vi.fn()}
          showProgress={false}
        />,
      );
      expect(
        screen.getAllByRole('button', { name: /\d+\. Ünite:/ }),
      ).toHaveLength(topics.length);
      expect(container.querySelector('.lg\\:grid-cols-2')).toBeInTheDocument();
      expect(screen.getAllByText(topics[0].theme!)[0]).toBeInTheDocument();
      const last = topics[topics.length - 1];
      fireEvent.click(
        screen.getByRole('button', {
          name: `${last.unitNumber}. Ünite: ${last.title}`,
        }),
      );
      expect(screen.getByRole('dialog')).toHaveAccessibleName(last.title);
    },
  );
});
