export type MatMatikPlayer = 1 | 2;
export type MatMatikDifficulty = 'easy' | 'medium' | 'hard';

export type MatMatikCellOwner = MatMatikPlayer | null;
export type MatMatikBoard = MatMatikCellOwner[];

export type MatMatikMove = {
  a: number;
  b: number;
  product: number;
};

export const MATMATIK_GRID_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28,
  30, 32, 35, 36, 40, 42, 45, 48, 49, 54, 56, 63, 64, 72, 81,
] as const;

export const MATMATIK_FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const BOARD_WIDTH = 6;
const WIN_LENGTH = 4;
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

export function createMatMatikBoard(): MatMatikBoard {
  return Array.from({ length: MATMATIK_GRID_NUMBERS.length }, () => null);
}

export function getProductIndex(product: number): number {
  return MATMATIK_GRID_NUMBERS.indexOf(
    product as (typeof MATMATIK_GRID_NUMBERS)[number],
  );
}

export function getValidMoves(board: MatMatikBoard): MatMatikMove[] {
  const moves = new Map<number, MatMatikMove>();

  for (const a of MATMATIK_FACTORS) {
    for (const b of MATMATIK_FACTORS) {
      const product = a * b;
      const productIndex = getProductIndex(product);

      if (productIndex >= 0 && board[productIndex] === null) {
        moves.set(product, { a, b, product });
      }
    }
  }

  return Array.from(moves.values());
}

export function applyMatMatikMove(
  board: MatMatikBoard,
  product: number,
  player: MatMatikPlayer,
): MatMatikBoard | null {
  const productIndex = getProductIndex(product);

  if (productIndex < 0 || board[productIndex] !== null) {
    return null;
  }

  const nextBoard = [...board];
  nextBoard[productIndex] = player;
  return nextBoard;
}

export function findWinner(board: MatMatikBoard): MatMatikPlayer | null {
  for (let row = 0; row < BOARD_WIDTH; row += 1) {
    for (let col = 0; col < BOARD_WIDTH; col += 1) {
      const index = row * BOARD_WIDTH + col;
      const owner = board[index];

      if (!owner) {
        continue;
      }

      for (const [rowStep, colStep] of DIRECTIONS) {
        let length = 1;

        for (let offset = 1; offset < WIN_LENGTH; offset += 1) {
          const nextRow = row + rowStep * offset;
          const nextCol = col + colStep * offset;

          if (
            nextRow < 0 ||
            nextRow >= BOARD_WIDTH ||
            nextCol < 0 ||
            nextCol >= BOARD_WIDTH
          ) {
            break;
          }

          const nextIndex = nextRow * BOARD_WIDTH + nextCol;
          if (board[nextIndex] !== owner) {
            break;
          }

          length += 1;
        }

        if (length >= WIN_LENGTH) {
          return owner;
        }
      }
    }
  }

  return null;
}

export function isBoardFull(board: MatMatikBoard): boolean {
  return board.every(Boolean);
}

export function chooseComputerMove(
  board: MatMatikBoard,
  difficulty: MatMatikDifficulty,
  randomIndex = Math.random,
): MatMatikMove | null {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    return null;
  }

  if (difficulty === 'easy') {
    return pickRandomMove(validMoves, randomIndex);
  }

  const winningMove = findImmediateMove(board, validMoves, 2);
  if (winningMove) {
    return winningMove;
  }

  const blockingMove = findImmediateMove(board, validMoves, 1);
  if (blockingMove) {
    return blockingMove;
  }

  if (difficulty === 'medium') {
    return pickRandomMove(validMoves, randomIndex);
  }

  const bestScore = Math.max(
    ...validMoves.map((move) => scoreMove(board, move, 2)),
  );
  const bestMoves = validMoves.filter(
    (move) => scoreMove(board, move, 2) === bestScore,
  );

  return pickRandomMove(bestMoves, randomIndex);
}

function findImmediateMove(
  board: MatMatikBoard,
  validMoves: MatMatikMove[],
  player: MatMatikPlayer,
) {
  return (
    validMoves.find((move) => {
      const nextBoard = applyMatMatikMove(board, move.product, player);
      return nextBoard ? findWinner(nextBoard) === player : false;
    }) ?? null
  );
}

function scoreMove(
  board: MatMatikBoard,
  move: MatMatikMove,
  player: MatMatikPlayer,
) {
  const productIndex = getProductIndex(move.product);
  if (productIndex < 0) {
    return 0;
  }

  const row = Math.floor(productIndex / BOARD_WIDTH);
  const col = productIndex % BOARD_WIDTH;
  let score = 0;

  for (const [rowStep, colStep] of DIRECTIONS) {
    let playerCount = 1;
    let openCount = 0;

    for (const direction of [-1, 1]) {
      for (let offset = 1; offset < WIN_LENGTH; offset += 1) {
        const nextRow = row + rowStep * offset * direction;
        const nextCol = col + colStep * offset * direction;

        if (
          nextRow < 0 ||
          nextRow >= BOARD_WIDTH ||
          nextCol < 0 ||
          nextCol >= BOARD_WIDTH
        ) {
          break;
        }

        const owner = board[nextRow * BOARD_WIDTH + nextCol];
        if (owner === player) {
          playerCount += 1;
        } else if (owner === null) {
          openCount += 1;
          break;
        } else {
          break;
        }
      }
    }

    if (playerCount >= 3) {
      score += 40;
    } else if (playerCount === 2) {
      score += 15;
    }
    score += openCount;
  }

  return score;
}

function pickRandomMove(
  moves: MatMatikMove[],
  randomIndex: () => number,
): MatMatikMove {
  return moves[Math.floor(randomIndex() * moves.length)] ?? moves[0];
}
