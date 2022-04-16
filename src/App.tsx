import React from "react";
import useGame from "./hooks/useGame";
import Board from "./components/board/Board";

function App() {
  const { gameState, resetGame, revealTile, flagTile } = useGame();

  React.useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleTileClick = (x: number, y: number) => {
    revealTile(x, y);
  };

  const handleTileFlag = (x: number, y: number) => {
    flagTile(x, y);
  };

  return (
    <Board
      gameState={gameState}
      onTileClick={handleTileClick}
      onTileRightClick={handleTileFlag}
      resetGame={resetGame}
    />
  );
}

export default App;
