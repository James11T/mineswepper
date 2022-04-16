import React from "react";
import { Difficulty, GameState } from "../../hooks/useGame";
import GridTile from "../gridTile/GridTile";
import styles from "./Board.module.css";

interface Props {
  gameState: GameState;
  onTileClick: (x: number, y: number) => void;
  onTileRightClick: (x: number, y: number) => void;
  resetGame: (difficulty?: Difficulty) => void;
}

interface OverlayProps {
  resetGame: (difficulty?: Difficulty) => void;
  children: React.ReactNode;
}

const titleCase = (str: string) =>
  str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  );

const Overlay = ({ resetGame, children: text }: OverlayProps) => {
  return (
    <div className={styles.overlay}>
      <h1>{text}</h1>
      <button onClick={() => resetGame()}>Restart</button>
    </div>
  );
};

const Board = ({
  gameState,
  onTileClick,
  onTileRightClick,
  resetGame
}: Props) => {
  const handleDiffictyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let value = event.target.value;

    if (!(value === "easy" || value === "medium" || value === "hard")) return;

    resetGame(value);
  };

  return (
    <div className={styles.gameArea}>
      <div className={styles.gameData}>
        <h1>Mineswepper</h1>
        <div>Difficulty: {titleCase(gameState.difficulty)}</div>
        <div>⚑ Mines left: {gameState.mineCount - gameState.flagCount}</div>
        <div className={styles.spacer}></div>
        <select
          name="difficulty"
          id="difficultySelector"
          onChange={handleDiffictyChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={() => resetGame()}>Reset</button>
      </div>
      <div className={styles.grid}>
        {gameState.grid.map((column, x) => (
          <div key={x} className={styles.column}>
            {column.map((tile, y) => (
              <GridTile
                key={`${x},${y}`}
                tile={tile}
                onClick={() => onTileClick(x, y)}
                onRightClick={() => onTileRightClick(x, y)}
              />
            ))}
          </div>
        ))}
        {gameState.hasFailed && (
          <Overlay resetGame={resetGame}>You Failed!</Overlay>
        )}
        {gameState.hasWon && <Overlay resetGame={resetGame}>You Won!</Overlay>}
      </div>
    </div>
  );
};

export default Board;
