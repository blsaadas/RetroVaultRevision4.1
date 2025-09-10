'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const ROWS = 6;
const COLS = 7;
const CELL_SIZE = 50;
const CANVAS_WIDTH = COLS * CELL_SIZE;
const CANVAS_HEIGHT = (ROWS + 1) * CELL_SIZE;

interface FourInARowGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function FourInARowGame({ setScore, onGameOver, isGameOver }: FourInARowGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [board, setBoard] = useState<number[][]>(() => Array(ROWS).fill(0).map(() => Array(COLS).fill(0)));
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState<number | null>(null);

    const dropPiece = (col: number, player: number) => {
        for (let row = ROWS - 1; row >= 0; row--) {
            if (board[row][col] === 0) {
                const newBoard = JSON.parse(JSON.stringify(board));
                newBoard[row][col] = player;
                setBoard(newBoard);
                return newBoard;
            }
        }
        return null;
    };
    
    const checkWin = (currentBoard: number[][]): number | null => {
        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (currentBoard[r][c] !== 0 && currentBoard[r][c] === currentBoard[r][c+1] && currentBoard[r][c] === currentBoard[r][c+2] && currentBoard[r][c] === currentBoard[r][c+3]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Vertical
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c < COLS; c++) {
                if (currentBoard[r][c] !== 0 && currentBoard[r][c] === currentBoard[r+1][c] && currentBoard[r][c] === currentBoard[r+2][c] && currentBoard[r][c] === currentBoard[r+3][c]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Diagonal (down-right)
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (currentBoard[r][c] !== 0 && currentBoard[r][c] === currentBoard[r+1][c+1] && currentBoard[r][c] === currentBoard[r+2][c+2] && currentBoard[r][c] === currentBoard[r+3][c+3]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Diagonal (up-right)
         for (let r = 3; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (currentBoard[r][c] !== 0 && currentBoard[r][c] === currentBoard[r-1][c+1] && currentBoard[r][c] === currentBoard[r-2][c+2] && currentBoard[r][c] === currentBoard[r-3][c+3]) {
                    return currentBoard[r][c];
                }
            }
        }
        // Check for tie
        if (currentBoard.flat().every(cell => cell !== 0)) {
            return 3; // Tie
        }

        return null;
    }

    const aiMove = useCallback((currentBoard: number[][]) => {
        const availableCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
            if (currentBoard[0][c] === 0) {
                availableCols.push(c);
            }
        }
        if(availableCols.length === 0) return;

        const col = availableCols[Math.floor(Math.random() * availableCols.length)];
        const newBoard = dropPiece(col, 2);
        if(newBoard){
            const gameWinner = checkWin(newBoard);
             if (gameWinner) {
                setWinner(gameWinner);
                onGameOver(gameWinner === 1 ? 1 : 0);
            } else {
                setCurrentPlayer(1);
            }
        }
    }, [board, onGameOver]);

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isGameOver || winner || currentPlayer !== 1) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scale = canvas.width / rect.width;
        const x = (event.clientX - rect.left) * scale;
        const col = Math.floor(x / CELL_SIZE);
        
        const newBoard = dropPiece(col, 1);
        if (newBoard) {
            const gameWinner = checkWin(newBoard);
            if (gameWinner) {
                setWinner(gameWinner);
                const score = gameWinner === 1 ? 1 : 0;
                setScore(() => score);
                onGameOver(score);
            } else {
                setCurrentPlayer(2);
                setTimeout(() => aiMove(newBoard), 500);
            }
        }
    };
    
    const draw = useCallback(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw board
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(c * CELL_SIZE, (r + 1) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                ctx.fillStyle = '#18181b';
                ctx.beginPath();
                ctx.arc(c * CELL_SIZE + CELL_SIZE / 2, (r + 1) * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Draw pieces
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c] !== 0) {
                    ctx.fillStyle = board[r][c] === 1 ? '#facc15' : '#ef4444';
                    ctx.beginPath();
                    ctx.arc(c * CELL_SIZE + CELL_SIZE / 2, (r + 1) * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }, [board]);
    
    useEffect(() => {
        draw();
    }, [draw]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleClick}
            className="w-full h-full object-contain cursor-pointer"
        />
    );
}
