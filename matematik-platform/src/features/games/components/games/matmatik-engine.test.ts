import { describe, expect, it } from 'vitest';
import {
  applyMatMatikMove,
  chooseComputerMove,
  createMatMatikBoard,
  findWinner,
  getProductIndex,
  getValidMoves,
  isBoardFull,
} from './matmatik-engine';

describe('matmatik-engine', () => {
  it('marks the product cell for a valid move', () => {
    const board = createMatMatikBoard();
    const nextBoard = applyMatMatikMove(board, 12, 1);

    expect(nextBoard).not.toBeNull();
    expect(nextBoard?.[getProductIndex(12)]).toBe(1);
    expect(board[getProductIndex(12)]).toBeNull();
  });

  it('rejects a move when the product cell is occupied', () => {
    const board = applyMatMatikMove(createMatMatikBoard(), 12, 1);

    expect(board).not.toBeNull();
    expect(applyMatMatikMove(board!, 12, 2)).toBeNull();
  });

  it('detects horizontal, vertical, and diagonal wins', () => {
    const horizontal = createMatMatikBoard();
    horizontal[0] = 1;
    horizontal[1] = 1;
    horizontal[2] = 1;
    horizontal[3] = 1;

    const vertical = createMatMatikBoard();
    vertical[1] = 2;
    vertical[7] = 2;
    vertical[13] = 2;
    vertical[19] = 2;

    const diagonal = createMatMatikBoard();
    diagonal[3] = 1;
    diagonal[8] = 1;
    diagonal[13] = 1;
    diagonal[18] = 1;

    expect(findWinner(horizontal)).toBe(1);
    expect(findWinner(vertical)).toBe(2);
    expect(findWinner(diagonal)).toBe(1);
  });

  it('detects full boards for draw handling', () => {
    const board = createMatMatikBoard().map((_, index) =>
      index % 2 === 0 ? 1 : 2,
    );

    expect(isBoardFull(board)).toBe(true);
  });

  it('lets medium computer take an immediate winning move first', () => {
    const board = createMatMatikBoard();
    board[getProductIndex(1)] = 2;
    board[getProductIndex(2)] = 2;
    board[getProductIndex(3)] = 2;

    expect(chooseComputerMove(board, 'medium')?.product).toBe(4);
  });

  it('lets medium computer block an immediate player win', () => {
    const board = createMatMatikBoard();
    board[getProductIndex(7)] = 1;
    board[getProductIndex(8)] = 1;
    board[getProductIndex(9)] = 1;

    expect(chooseComputerMove(board, 'medium')?.product).toBe(10);
  });

  it('returns only moves for empty product cells', () => {
    const board = applyMatMatikMove(createMatMatikBoard(), 9, 1);
    const moves = getValidMoves(board!);

    expect(moves.some((move) => move.product === 9)).toBe(false);
    expect(moves.length).toBeGreaterThan(0);
  });
});
