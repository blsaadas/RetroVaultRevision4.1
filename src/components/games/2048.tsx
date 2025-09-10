'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 4;
const CELL_SIZE = 100;
const CELL_GAP = 15;
const CANVAS_WIDTH = GRID_SIZE * (CELL_SIZE + CELL_GAP) + CELL_GAP;
const CANVAS_HEIGHT = CANVAS_WIDTH;

interface Tile {
  x: number;
  y: number;
  value: number;
}

interface Game2048Props {
  setScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

const getTileColor = (value: number) => {
    const power = Math.log2(value);
    const colors = [
        '#eee4da', '#ede0c8', '#f2b179', '#f59563',
        '#f67c5f', '#f65e3b', '#edcf72', '#edcc61',
        '#edc850', '#edc53f', '#edc22e'
    ];
    return colors[Math.min(power - 1, colors.length - 1)] || '#3c3a32';
}

const getTextColor = (value: number) => (value <= 4 ? '#776e65' : '#f9f6f2');


export default function Game2048({ setScore, onGameOver, isGameOver }: Game2048Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, updateScore] = useState(0);

  const addRandomTile = useCallback((currentTiles: Tile[]): Tile[] => {
    const emptyCells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!currentTiles.some(t => t.x === c && t.y === r)) {
          emptyCells.push({ x: c, y: r });
        }
      }
    }
    if (emptyCells.length === 0) return currentTiles;

    const newTilePos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newTile = { ...newTilePos, value: Math.random() > 0.9 ? 4 : 2 };
    return [...currentTiles, newTile];
  }, []);

  const resetGame = useCallback(() => {
    let newTiles: Tile[] = [];
    newTiles = addRandomTile(newTiles);
    newTiles = addRandomTile(newTiles);
    setTiles(newTiles);
    updateScore(0);
    setScore(0);
  },[addRandomTile, setScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.fillStyle = '#bbada0';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        ctx.fillStyle = 'rgba(238, 228, 218, 0.35)';
        ctx.fillRect(
          c * (CELL_SIZE + CELL_GAP) + CELL_GAP,
          r * (CELL_SIZE + CELL_GAP) + CELL_GAP,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }

    // Draw tiles
    tiles.forEach(tile => {
      ctx.fillStyle = getTileColor(tile.value);
      ctx.fillRect(
        tile.x * (CELL_SIZE + CELL_GAP) + CELL_GAP,
        tile.y * (CELL_SIZE + CELL_GAP) + CELL_GAP,
        CELL_SIZE,
        CELL_SIZE
      );

      ctx.fillStyle = getTextColor(tile.value);
      ctx.font = `bold ${tile.value > 1000 ? '35' : '45'}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        tile.value.toString(),
        tile.x * (CELL_SIZE + CELL_GAP) + CELL_GAP + CELL_SIZE / 2,
        tile.y * (CELL_SIZE + CELL_GAP) + CELL_GAP + CELL_SIZE / 2
      );
    });
  }, [tiles]);

  useEffect(() => {
    draw();
  }, [draw]);

  const move = useCallback((dx: number, dy: number) => {
    let moved = false;
    let newTiles = JSON.parse(JSON.stringify(tiles)) as Tile[];
    let newScore = score;
    
    const isSorted = (dx === 1 || dy === 1);
    const sortedTiles = newTiles.sort((a,b) => {
        if(dx !== 0) return isSorted ? b.x - a.x : a.x - b.x;
        return isSorted ? b.y - a.y : a.y - b.y;
    });

    const mergedInTurn: Tile[] = [];

    sortedTiles.forEach(tile => {
        let currentX = tile.x;
        let currentY = tile.y;
        let nextX = currentX + dx;
        let nextY = currentY + dy;

        while(nextX >= 0 && nextX < GRID_SIZE && nextY >= 0 && nextY < GRID_SIZE) {
            const blockingTile = sortedTiles.find(t => t.x === nextX && t.y === nextY);
            if(blockingTile) {
                if (blockingTile.value === tile.value && !mergedInTurn.includes(blockingTile)) {
                    blockingTile.value *= 2;
                    newScore += blockingTile.value;
                    mergedInTurn.push(blockingTile);
                    tile.x = -1; // Mark for removal
                    moved = true;
                }
                break;
            }
            currentX = nextX;
            currentY = nextY;
            nextX += dx;
            nextY += dy;
        }

        if(tile.x !== -1 && (tile.x !== currentX || tile.y !== currentY)) {
            tile.x = currentX;
            tile.y = currentY;
            moved = true;
        }
    });

    if (moved) {
        let finalTiles = addRandomTile(sortedTiles.filter(t => t.x !== -1));
        setTiles(finalTiles);
        updateScore(newScore);
        setScore(newScore);

        if (finalTiles.some(t => t.value === 2048)) {
            onGameOver(newScore);
        } else if (isGameOver(finalTiles)) {
            onGameOver(newScore);
        }
    }
  }, [tiles, score, addRandomTile, onGameOver, setScore]);
  
   const isGameOver = (currentTiles: Tile[]): boolean => {
    if (currentTiles.length < GRID_SIZE * GRID_SIZE) return false;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = currentTiles.find(t => t.x === c && t.y === r);
        if(!tile) continue;
        // Check right
        if (c < GRID_SIZE - 1) {
          const right = currentTiles.find(t => t.x === c + 1 && t.y === r);
          if (right && right.value === tile.value) return false;
        }
        // Check down
        if (r < GRID_SIZE - 1) {
          const down = currentTiles.find(t => t.x === c && t.y === r + 1);
          if (down && down.value === tile.value) return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          move(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          move(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          move(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          move(1, 0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move, isGameOver]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
