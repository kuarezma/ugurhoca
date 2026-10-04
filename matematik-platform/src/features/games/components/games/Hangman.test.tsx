import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Hangman, mathTerms as terms } from './Hangman';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each(terms.map((term, index) => ({ term, index })))(
  'can win the shipped term $term using only keyboard letters',
  ({ term, index }) => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue((index + 0.5) / terms.length);
    render(<Hangman onScore={vi.fn()} scoreMultiplier={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Oyunu Başlat' }));
    for (const letter of new Set(
      term.toLocaleUpperCase('tr-TR').replace(/[^\p{L}]/gu, ''),
    )) {
      fireEvent.click(
        screen.getByRole('button', {
          name: `${letter} harfini dene`,
        }),
      );
    }
    expect(screen.getByText('🎉 Doğru bildin!')).toBeInTheDocument();
  },
);

it('reveals spaces before guessing any letters', () => {
  vi.spyOn(Math, 'random').mockReturnValue(
    (terms.indexOf('ALT KÜME') + 0.5) / terms.length,
  );
  render(<Hangman onScore={vi.fn()} scoreMultiplier={1} />);
  fireEvent.click(screen.getByRole('button', { name: 'Oyunu Başlat' }));
  expect(
    screen.getByText('_ _ _   _ _ _ _', { normalizer: (text) => text }),
  ).toBeInTheDocument();
});

it('reveals punctuation and numbers and distinguishes Turkish dotted and dotless letters', () => {
  vi.useFakeTimers();
  terms.push('iki-ışık! 2');
  try {
    vi.spyOn(Math, 'random').mockReturnValue(
      (terms.length - 0.5) / terms.length,
    );
    render(<Hangman onScore={vi.fn()} scoreMultiplier={1} />);
    fireEvent.click(screen.getByRole('button', { name: 'Oyunu Başlat' }));
    expect(
      screen.getByText('_ _ _ - _ _ _ _ !   2', { normalizer: (text) => text }),
    ).toBeInTheDocument();
    for (const letter of ['İ', 'K', 'I', 'Ş']) {
      fireEvent.click(
        screen.getByRole('button', { name: `${letter} harfini dene` }),
      );
    }
    expect(
      screen.getByText('İ K İ - I Ş I K !   2', { normalizer: (text) => text }),
    ).toBeInTheDocument();
    expect(screen.getByText('🎉 Doğru bildin!')).toBeInTheDocument();
  } finally {
    terms.pop();
  }
});
