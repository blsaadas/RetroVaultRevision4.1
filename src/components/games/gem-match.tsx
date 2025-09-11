
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BOARD_SIZE = 8;
const CELL_SIZE = 40;
const CANVAS_WIDTH = BOARD_SIZE * CELL_SIZE;
const CANVAS_HEIGHT = BOARD_SIZE * CELL_SIZE;
const GEM_COLORS = ['#ef4444', '#f97316', '#facc15', '#4ade80', '#3b82f6', '#8b5cf6'];

type Gem = {
    color: string;
    id: number;
};
type Board = (Gem | null)[][];

interface GemMatchGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function GemMatchGame({ setScore, onGameOver, isGameOver }: GemMatchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<Board>([]);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [localScore, setLocalScore] = useState(0);

  const createBoard = useCallback(() => {
    let idCounter = 0;
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null).map(() => ({
        color: GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)],
        id: idCounter++,
    })));
    setBoard(newBoard);
  }, []);

  useEffect(() => {
    createBoard();
  }, [createBoard]);
  
  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);

    board.forEach((row, r) => {
        row.forEach((gem, c) => {
            if (gem) {
                ctx.fillStyle = gem.color;
                ctx.fillRect(c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                
                if (selected && selected.r === r && selected.c === c) {
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(c * CELL_SIZE + 1, r * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                }
            }
        });
    });
  }, [board, selected]);

  useEffect(() => {
    draw();
  }, [draw]);
  
  const checkMatches = useCallback((currentBoard: Board): Board => {
    const matches = new Set<string>();
    // Horizontal
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        if (currentBoard[r][c] && currentBoard[r][c+1] && currentBoard[r][c+2] &&
            currentBoard[r][c]!.color === currentBoard[r][c+1]!.color &&
            currentBoard[r][c+1]!.color === currentBoard[r][c+2]!.color) {
          matches.add(`${r}-${c}`);
          matches.add(`${r}-${c+1}`);
          matches.add(`${r}-${c+2}`);
        }
      }
    }
    // Vertical
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
        if (currentBoard[r][c] && currentBoard[r+1][c] && currentBoard[r+2][c] &&
            currentBoard[r][c]!.color === currentBoard[r+1][c]!.color &&
            currentBoard[r+1][c]!.color === currentBoard[r+2][c]!.color) {
          matches.add(`${r}-${c}`);
          matches.add(`${r+1}-${c}`);
          matches.add(`${r+2}-${c}`);
        }
      }
    }

    if (matches.size > 0) {
      setLocalScore(prev => prev + matches.size * 10);
      setScore(() => localScore + matches.size * 10);
      matches.forEach(key => {
        const [r, c] = key.split('-').map(Number);
        currentBoard[r][c] = null;
      });
    }
    return currentBoard;
  }, [setScore, localScore]);

  const dropGems = useCallback((currentBoard: Board): Board => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      let emptyRow = BOARD_SIZE - 1;
      for (let r = BOARD_SIZE - 1; r >= 0; r--) {
        if (currentBoard[r][c]) {
          [currentBoard[r][c], currentBoard[emptyRow][c]] = [currentBoard[emptyRow][c], currentBoard[r][c]];
          emptyRow--;
        }
      }
    }
    return currentBoard;
  }, []);
  
  const fillGems = useCallback((currentBoard: Board): Board => {
      let idCounter = Date.now();
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (!currentBoard[r][c]) {
                currentBoard[r][c] = {
                    color: GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)],
                    id: idCounter++,
                };
            }
        }
      }
      return currentBoard;
  }, []);
  
  const updateBoard = useCallback(() => {
      setBoard(prevBoard => {
        let newBoard = JSON.parse(JSON.stringify(prevBoard));
        newBoard = checkMatches(newBoard);
        newBoard = dropGems(newBoard);
        newBoard = fillGems(newBoard);
        if (JSON.stringify(newBoard) !== JSON.stringify(prevBoard)) {
            // If board changed, there might be new matches
            setTimeout(updateBoard, 200);
        }
        return newBoard;
      });
  }, [checkMatches, dropGems, fillGems]);

  useEffect(() => {
      const timeoutId = setTimeout(updateBoard, 200);
      return () => clearTimeout(timeoutId);
  }, [board, updateBoard]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / (rect.width / BOARD_SIZE));
    const r = Math.floor((e.clientY - rect.top) / (rect.height / BOARD_SIZE));

    if (!selected) {
      setSelected({ r, c });
    } else {
      const dr = Math.abs(r - selected.r);
      const dc = Math.abs(c - selected.c);
      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        setBoard(prevBoard => {
          const newBoard = JSON.parse(JSON.stringify(prevBoard));
          [newBoard[r][c], newBoard[selected.r][selected.c]] = [newBoard[selected.r][selected.c], newBoard[r][c]];
          return newBoard;
        });
      }
      setSelected(null);
    }
  };

  return <canvas ref={canvasRef} onClick={handleClick} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain cursor-pointer" />;
}
