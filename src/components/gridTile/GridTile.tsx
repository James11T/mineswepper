import cn from "classnames";
import React from "react";
import { Tile as TileType } from "../../hooks/useGame";
import styles from "./GridTile.module.css";

const DEBUG_ENABLED = false;
const FLAG = "⚑";

interface Props {
  tile: TileType;
  onClick: () => void;
  onRightClick: () => void;
}

const Tile = ({ tile, onClick, onRightClick }: Props): JSX.Element => {
  const pressTime = React.useRef<number | null>(null);
  const timerId = React.useRef<number | null>(null);

  const handleRightClick = (event: React.MouseEvent): void => {
    event.preventDefault();
    onRightClick();
  };

  const onPressStart = () => {
    pressTime.current = Date.now();
    timerId.current = window.setTimeout(() => {
      onPressEnd(true);
    }, 300);
  };

  const onPressEnd = (isLong = false) => {
    if (!isLong && !pressTime.current) return;

    timerId.current && window.clearTimeout(timerId.current);
    const pressLength = pressTime.current ? Date.now() - pressTime.current : 0;

    if (isLong || pressLength >= 300) {
      onRightClick();
    } else {
      onClick();
    }

    pressTime.current = null;
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
      onMouseDown={(event: React.MouseEvent) =>
        event.button === 0 && onPressStart()
      }
      onTouchStart={() => onPressStart()}
      onMouseUp={(event: React.MouseEvent) =>
        event.button === 0 && onPressEnd()
      }
      onTouchEnd={() => onPressEnd()}
      onMouseLeave={() => onPressEnd()}
      onContextMenu={handleRightClick}>
      {content}
    </div>
  );
};

export default Tile;
