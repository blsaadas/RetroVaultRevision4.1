'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BOARD_SIZE = 12;
const NUM_MINES = 20;
const CELL_SIZE = 30;

type Cell = {
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

interface MinefieldGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function MinefieldGame({ setScore, onGameOver, isGameOver }: MinefieldGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<Cell[][]>([]);
  const [firstClick, setFirstClick] = useState(true);
  const startTimeRef = useRef<number | null>(null);

  const initBoard = useCallback(() => {
    const newBoard = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, (): Cell => ({
        isMine: false,
        isOpen: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
    setBoard(newBoard);
    setFirstClick(true);
    setScore(() => 0);
  }, [setScore]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const placeMines = (clickedX: number, clickedY: number, initialBoard: Cell[][]): Cell[][] => {
    let minesPlaced = 0;
    const newBoard = JSON.parse(JSON.stringify(initialBoard));

    while (minesPlaced < NUM_MINES) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);

      if (!newBoard[y][x].isMine && !(x === clickedX && y === clickedY)) {
        newBoard[y][x].isMine = true;
        minesPlaced++;
      }
    }
    
    // Calculate neighbors
    for(let y=0; y<BOARD_SIZE; y++){
        for(let x=0; x<BOARD_SIZE; x++){
            if(!newBoard[y][x].isMine){
                let count = 0;
                for(let i=-1; i<=1; i++){
                    for(let j=-1; j<=1; j++){
                        if(i === 0 && j === 0) continue;
                        const nx = x+j;
                        const ny = y+i;
                        if(nx >=0 && nx < BOARD_SIZE && ny >=0 && ny < BOARD_SIZE && newBoard[ny][nx].isMine){
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
  
  const revealCells = useCallback((x: number, y: number, currentBoard: Cell[][]): Cell[][] => {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE || currentBoard[y][x].isOpen || currentBoard[y][x].isFlagged) {
      return currentBoard;
    }

    let newBoard = JSON.parse(JSON.stringify(currentBoard));
    newBoard[y][x].isOpen = true;

    if (newBoard[y][x].isMine) {
      onGameOver(0);
      return newBoard;
    }

    if (newBoard[y][x].neighborMines === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          newBoard = revealCells(x + j, y + i, newBoard);
        }
      }
    }
    return newBoard;
  }, [onGameOver]);

  const checkWin = (currentBoard: Cell[][]) => {
      const nonMineCells = BOARD_SIZE * BOARD_SIZE - NUM_MINES;
      const openCells = currentBoard.flat().filter(c => c.isOpen && !c.isMine).length;
      if (nonMineCells === openCells) {
          const score = Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
          setScore(()=>score);
          onGameOver(score);
      }
  }

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    
    setBoard(currentBoard => {
      let newBoard = JSON.parse(JSON.stringify(currentBoard));

      if (firstClick && event.button === 0) {
        startTimeRef.current = Date.now();
        newBoard = placeMines(x, y, newBoard);
        setFirstClick(false);
      }
      
      if(event.button === 0) { // Left click
        if (newBoard[y][x].isFlagged) return newBoard;
        newBoard = revealCells(x, y, newBoard);
        checkWin(newBoard);
      } else if(event.button === 2) { // Right click
          if(!newBoard[y][x].isOpen){
              newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
          }
      }
      return newBoard;
    });
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
  }

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, BOARD_SIZE * CELL_SIZE, BOARD_SIZE * CELL_SIZE);

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cell = board[y]?.[x];
        if(!cell) continue;

        ctx.strokeStyle = 'hsl(var(--border))';
        ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        if (cell.isOpen) {
          if (cell.isMine) {
            ctx.fillStyle = 'red';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          } else {
            ctx.fillStyle = 'hsl(var(--muted))';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            if (cell.neighborMines > 0) {
              ctx.fillStyle = 'hsl(var(--foreground))';
              ctx.font = '16px "Space Grotesk"';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(
                cell.neighborMines.toString(),
                x * CELL_SIZE + CELL_SIZE / 2,
                y * CELL_SIZE + CELL_SIZE / 2
              );
            }
          }
        } else if (cell.isFlagged) {
          ctx.fillStyle = 'hsl(var(--primary))';
          ctx.font = '20px "Space Grotesk"';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚩', x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2);
        } else {
            ctx.fillStyle = 'hsl(var(--secondary))';
            ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }
      }
    }
  }, [board]);

  useEffect(() => {
    draw();
  }, [draw]);
  
  // Show all mines on game over
  useEffect(() => {
      if(isGameOver && board.length > 0) {
        setBoard(currentBoard => {
            const newBoard = JSON.parse(JSON.stringify(currentBoard));
            newBoard.flat().forEach((cell: Cell) => {
                if(cell.isMine) cell.isOpen = true;
            });
            return newBoard;
        });
      }
  }, [isGameOver, board.length]);

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_SIZE * CELL_SIZE}
      height={BOARD_SIZE * CELL_SIZE}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      className="w-full h-full object-contain cursor-pointer"
    />
  );
}
