import React from "react";

class Tile {
  public isMine: boolean;
  public isFlagged: boolean;
  public isRevealed: boolean;
  public value: number | null;

  constructor(isMine: boolean) {
    this.isMine = isMine;
    this.isFlagged = false;
    this.isRevealed = false;
    this.value = null;
  }
}

export type Difficulty = "easy" | "medium" | "hard";

export interface GameState {
  grid: Tile[][];
  mineCount: number;
  width: number;
  height: number;
  hasFailed: boolean;
  hasWon: boolean;
  difficulty: Difficulty;
  flagCount: number;
  minesSet: boolean;
}

const defaultStateEasy: GameState = {
  grid: [[]],
  mineCount: 10,
  width: 10,
  height: 8,
  hasFailed: false,
  hasWon: false,
  difficulty: "easy",
  flagCount: 0,
  minesSet: false
};

const defaultStateMedium: GameState = {
  grid: [[]],
  mineCount: 40,
  width: 18,
  height: 14,
  hasFailed: false,
  hasWon: false,
  difficulty: "medium",
  flagCount: 0,
  minesSet: false
};

const defaultStateHard: GameState = {
  grid: [[]],
  mineCount: 99,
  width: 24,
  height: 20,
  hasFailed: false,
  hasWon: false,
  difficulty: "hard",
  flagCount: 0,
  minesSet: false
};

const difficultyMap = {
  easy: defaultStateEasy,
  medium: defaultStateMedium,
  hard: defaultStateHard
};

/* Get a tile from the grid, if the corrdinates are out of bound, return null */
const safeIndex = (grid: Tile[][], x: number, y: number) => {
  if (x < 0 || x >= grid.length) return null;
  if (y < 0 || y >= grid[x].length) return null;

  return grid[x][y];
};

/* Count the ammount of mines around a given tile */
const getTileValue = (grid: Tile[][], x: number, y: number) => {
  const tile = grid[x][y];

  if (tile.isMine) return null;

  let value = 0;
  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      // Iterate around the adjacent tiles
      if (xOffset === 0 && yOffset === 0) continue; // Dont count the tile itself
      const adjacentTile = safeIndex(grid, x + xOffset, y + yOffset);
      if (!adjacentTile) continue;

      if (adjacentTile.isMine) value++;
    }
  }

  return value;
};

/* Generate a grid of tiles with a given width and height */
const getGrid = (width: number, height: number) => {
  const columns = [];
  for (let x = 0; x < width; x++) {
    const column = [];
    for (let y = 0; y < height; y++) {
      column.push(new Tile(false));
    }
    columns.push(column);
  }

  return columns;
};

/* Calculate and set the value of each tile */
const setGridValues = (grid: Tile[][]) => {
  grid.forEach((column, x) => {
    column.forEach((tile, y) => {
      tile.value = getTileValue(grid, x, y);
    });
  });
};

/* Randomly set an exact number of mines on the grid at least 2 tiles from the start position */
const setMines = (grid: Tile[][], mineCount: number, x: number, y: number) => {
  let minesPlaced = 0;

  while (minesPlaced < mineCount) {
    const randomColumn = Math.floor(Math.random() * grid.length);
    const randomRow = Math.floor(Math.random() * grid[randomColumn].length);

    if (Math.abs(randomColumn - x) <= 1 && Math.abs(randomRow - y) <= 1)
      continue; // Dont place mines within 1 tile of the tile clicked

    if (grid[randomColumn][randomRow].isMine) continue; // Tile is already a mine

    grid[randomColumn][randomRow].isMine = true;
    minesPlaced++;
  }

  setGridValues(grid);
};

/* Reveal all tiles around a given tile that are not mines */
const revealAround = (grid: Tile[][], x: number, y: number) => {
  for (let xOffset = -1; xOffset <= 1; xOffset++) {
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      if (xOffset === 0 && yOffset === 0) continue; // Skip the tile itself

      const adjacentTile = safeIndex(grid, x + xOffset, y + yOffset);

      if (!adjacentTile) continue;
      if (adjacentTile.isMine) continue;
      if (adjacentTile.isRevealed) continue;
      adjacentTile.isRevealed = true;

      if (!adjacentTile.value) revealAround(grid, x + xOffset, y + yOffset); // Recurively flood the grid
    }
  }
};

/* Count the ammount of revealed tiles on the grid */
const getRevealCount = (grid: Tile[][]) => {
  let count = 0;
  grid.forEach((column) => {
    column.forEach((tile) => {
      if (tile.isRevealed) count++;
    });
  });
  return count;
};

type GameAction =
  | { type: "reset"; difficulty?: Difficulty }
  | { type: "reveal"; x: number; y: number }
  | { type: "flag"; x: number; y: number };

const gameReducer = (state: GameState, action: GameAction) => {
  switch (action.type) {
    case "reset": {
      const difficulity = action.difficulty || state.difficulty; // Default to the current difficulty
      const defaultState = difficultyMap[difficulity];
      const grid = getGrid(defaultState.width, defaultState.height);

      // Does not place mines, must be done manually

      return { ...defaultState, grid };
    }
    case "reveal": {
      if (!state.minesSet)
        setMines(state.grid, state.mineCount, action.x, action.y); // Mines have not been placed

      const tile = state.grid[action.x][action.y];
      if (tile.isFlagged) return state;

      tile.isRevealed = true;
      if (tile.isMine) return { ...state, hasFailed: true };
      if (!tile.value) revealAround(state.grid, action.x, action.y);

      const hasWon =
        getRevealCount(state.grid) ===
        state.width * state.height - state.mineCount; // Set has won if the player has revealed all non mine tiles

      return {
        ...state,
        hasWon,
        minesSet: true
      };
    }
    case "flag": {
      const tile = state.grid[action.x][action.y];
      if (tile.isRevealed) return state;

      tile.isFlagged = !tile.isFlagged;
      if (tile.isFlagged) {
        // New flag placed
        return { ...state, flagCount: state.flagCount + 1 };
      } else {
        // Flag removed
        return { ...state, flagCount: state.flagCount - 1 };
      }
    }
  }
};

const useGame = () => {
  const [gameState, updateGameState] = React.useReducer(
    gameReducer,
    difficultyMap.easy
  );

  const resetGame = React.useCallback(
    (difficulty?: Difficulty) =>
      updateGameState({
        type: "reset",
        difficulty: difficulty || gameState.difficulty
      }),
    [gameState.difficulty]
  );

  const revealTile = React.useCallback(
    (x: number, y: number) => updateGameState({ type: "reveal", x, y }),
    []
  );

  const flagTile = React.useCallback(
    (x: number, y: number) => updateGameState({ type: "flag", x, y }),
    []
  );

  return { gameState, resetGame, revealTile, flagTile };
};

export default useGame;
export { Tile };
