'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BOARD_SIZE = 12;
const NUM_MINES = 20;
const CELL_SIZE = 30;
const CANVAS_WIDTH = BOARD_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = BOARD_SIZE * CELL_SIZE;

type Cell = {
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

const createEmptyBoard = (): Cell[][] =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, (): Cell => ({
      isMine: false,
      isOpen: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );

interface MinefieldGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function MinefieldGame({ setScore, onGameOver, isGameOver }: MinefieldGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const startTimeRef = useRef<number | null>(null);

  const initGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setIsFirstClick(true);
    setIsGameActive(false);
    setScore(() => 0);
    startTimeRef.current = null;
  }, [setScore]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const plantMinesAndCalculateNeighbors = (clickedX: number, clickedY: number, currentBoard: Cell[][]): Cell[][] => {
    let minesPlaced = 0;
    const newBoard = JSON.parse(JSON.stringify(currentBoard));

    while (minesPlaced < NUM_MINES) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      if (!newBoard[y][x].isMine && !(x === clickedX && y === clickedY)) {
        newBoard[y][x].isMine = true;
        minesPlaced++;
      }
    }

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (!newBoard[y][x].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const nx = x + j;
              const ny = y + i;
              if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && newBoard[ny][nx].isMine) {
                count++;
              }
            }
          }
          newBoard[y][x].neighborMines = count;
        }
      }
    }
    return newBoard;
  };

  const revealCells = (x: number, y: number, currentBoard: Cell[][]): Cell[][] => {
    const newBoard = JSON.parse(JSON.stringify(currentBoard));
    
    const reveal = (x: number, y: number) => {
        if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || newBoard[y][x].isOpen || newBoard[y][x].isFlagged) {
            return;
        }

        newBoard[y][x].isOpen = true;

        if (newBoard[y][x].neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i !== 0 || j !== 0) {
                        reveal(x + j, y + i);
                    }
                }
            }
        }
    };
    
    reveal(x, y);
    return newBoard;
  }
  
  const checkWinCondition = (currentBoard: Cell[][]) => {
    const openNonMineCells = currentBoard.flat().filter(cell => cell.isOpen && !cell.isMine).length;
    const totalNonMineCells = BOARD_SIZE * BOARD_SIZE - NUM_MINES;
    if (openNonMineCells === totalNonMineCells) {
      const endTime = Date.now();
      const timeTaken = Math.floor(((endTime - (startTimeRef.current ?? endTime)) / 1000));
      setScore(() => timeTaken);
      onGameOver(timeTaken);
    }
  };
  
  const handleLeftClick = (x: number, y: number) => {
    setBoard(currentBoard => {
      let newBoard = currentBoard;
      if (isFirstClick) {
        newBoard = plantMinesAndCalculateNeighbors(x, y, newBoard);
        setIsFirstClick(false);
        setIsGameActive(true);
        startTimeRef.current = Date.now();
      }

      if (newBoard[y][x].isFlagged) {
        return newBoard;
      }

      if (newBoard[y][x].isMine) {
        setIsGameActive(false);
        onGameOver(0);
        const finalBoard = JSON.parse(JSON.stringify(newBoard));
        finalBoard.flat().forEach(cell => { if(cell.isMine) cell.isOpen = true; });
        return finalBoard;
      }
      
      const boardAfterReveal = revealCells(x, y, newBoard);
      checkWinCondition(boardAfterReveal);
      return boardAfterReveal;
    });
  };

  const handleRightClick = (x: number, y: number) => {
    if (!isGameActive && !isFirstClick) return;
    setBoard(currentBoard => {
        const newBoard = JSON.parse(JSON.stringify(currentBoard));
        if (!newBoard[y][x].isOpen) {
            newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
        }
        return newBoard;
    });
  };


  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) * scaleY / CELL_SIZE);

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    
    if (event.button === 0) { // Left click
      handleLeftClick(x, y);
    } else if (event.button === 2) { // Right click
      handleRightClick(x, y);
    }
  };
  
  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const colors = {
        text: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        closed: 'hsl(var(--secondary))',
        open: 'hsl(var(--muted))',
        flag: 'hsl(var(--primary))'
    };

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cell = board[y]?.[x];
        if (!cell) continue;

        ctx.strokeStyle = colors.border;
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        
        if (cell.isOpen) {
          if (cell.isMine) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${CELL_SIZE * 0.6}px "Space Grotesk"`;
            ctx.fillText("💣", x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
          } else {
            ctx.fillStyle = colors.open;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            if (cell.neighborMines > 0) {
              ctx.fillStyle = colors.text;
              ctx.font = `${CELL_SIZE * 0.6}px "Space Grotesk"`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(cell.neighborMines.toString(), x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
            }
          }
        } else if (cell.isFlagged) {
            ctx.fillStyle = colors.closed;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = colors.flag;
            ctx.font = `${CELL_SIZE * 0.6}px "Space Grotesk"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🚩', x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
        } else {
            ctx.fillStyle = colors.closed;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }, [board]);

  useEffect(() => {
    draw();
  }, [draw, board]);
  
  const handleContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      className="w-full h-full object-contain cursor-pointer"
    />
  );
}
