import cn from "classnames";
import React from "react";
import { Tile as TileType } from "../../hooks/useGame";
import styles from "./GridTile.module.css";

const DEBUG_ENABLED = false;
const FLAG = "⚑";

interface Props {
  tile: TileType;
  onClick: (event: React.MouseEvent) => void;
  onRightClick: (event: React.MouseEvent) => void;
}

const Tile = ({ tile, onClick, onRightClick }: Props): JSX.Element => {
  const handleOnClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    onClick(event);
  };

  const handleRightClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    onRightClick(event);
  };

  let content: string;
  let className: string;

  if (tile.isRevealed) {
    if (tile.value) {
      content = tile.value.toString();
      className = styles[`tile-number-${tile.value}`];
    } else {
      content = "";
      className = styles.clear;
    }
  } else if (tile.isFlagged) {
    content = FLAG;
    className = styles.flag;
  } else {
    content = "";
    className = styles.blank;
  }

  return (
    <div
      className={cn(
        styles.tile,
        className,
        tile.isMine && tile.isRevealed && styles.mine,
        tile.isMine && DEBUG_ENABLED && styles.debugMine
      )}
      onClick={handleOnClick}
      onContextMenu={handleRightClick}>
      {content}
    </div>
  );
};

export default Tile;
