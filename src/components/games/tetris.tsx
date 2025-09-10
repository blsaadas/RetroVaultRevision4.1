
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 25; 

const CANVAS_WIDTH = BOARD_WIDTH * BLOCK_SIZE;
const CANVAS_HEIGHT = BOARD_HEIGHT * BLOCK_SIZE;

const TETROMINOS: {
  [key: string]: { shape: number[][]; color: string };
} = {
  '0': { shape: [[0]], color: 'transparent' },
  I: {
    shape: [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    color: '#4ade80', // green
  },
  J: {
    shape: [
      [0, 2, 0],
      [0, 2, 0],
      [2, 2, 0],
    ],
    color: '#f97316', // orange
  },
  L: {
    shape: [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ],
    color: '#3b82f6', // blue
  },
  O: {
    shape: [
      [4, 4],
      [4, 4],
    ],
    color: '#facc15', // yellow
  },
  S: {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0],
    ],
    color: '#ef4444', // red
  },
  T: {
    shape: [
      [0, 0, 0],
      [6, 6, 6],
      [0, 6, 0],
    ],
    color: 'hsl(var(--primary))', // primary color
  },
  Z: {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ],
    color: 'hsl(var(--accent))', // accent color
  },
};

const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};


interface TetrisGameProps {
  setScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function TetrisGame({ setScore, onGameOver, isGameOver }: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<NodeJS.Timeout>();

  const [board, setBoard] = useState(() => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill([0, '0'])));
  const [player, setPlayer] = useState({
    pos: { x: BOARD_WIDTH / 2 - 1, y: 0 },
    tetromino: randomTetromino(),
    collided: false,
  });
  const [dropTime, setDropTime] = useState<number | null>(1000);
  const [currentScore, setCurrentScore] = useState(0);

  const checkCollision = (p: typeof player, b: typeof board, { x: moveX, y: moveY }: { x: number; y: number }): boolean => {
    for (let y = 0; y < p.tetromino.shape.length; y += 1) {
      for (let x = 0; x < p.tetromino.shape[y].length; x += 1) {
        if (p.tetromino.shape[y][x] !== 0) {
          if (
            !b[y + p.pos.y + moveY] ||
            !b[y + p.pos.y + moveY][x + p.pos.x + moveX] ||
            b[y + p.pos.y + moveY][x + p.pos.x + moveX][0] !== 0
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };
  
  const resetPlayer = useCallback(() => {
    const newTetromino = randomTetromino();
    const newPos = { x: BOARD_WIDTH / 2 - 2, y: 0 };
    if (checkCollision({ pos: newPos, tetromino: newTetromino, collided: false }, board, { x: 0, y: 0 })) {
        onGameOver(currentScore);
    } else {
        setPlayer({
          pos: newPos,
          tetromino: newTetromino,
          collided: false,
        });
    }
  }, [board, onGameOver, currentScore]);


  const updatePlayerPos = ({ x, y, collided }: { x?: number, y?: number, collided?: boolean }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + (x || 0)), y: (prev.pos.y + (y || 0)) },
      collided: collided !== undefined ? collided : prev.collided,
    }));
  };
  
  const movePlayer = (dir: number) => {
    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir });
    }
  };

  const rotate = (matrix: number[][]) => {
    const rotatedTetromino = matrix.map((_, index) => matrix.map(col => col[index]));
    return rotatedTetromino.map(row => row.reverse());
  };

  const playerRotate = (b: typeof board) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, b, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino.shape[0].length) {
        clonedPlayer.pos.x = pos; // Reset if cannot rotate
        return;
      }
    }
    setPlayer(clonedPlayer);
  };
  
  const drop = useCallback(() => {
    if (!checkCollision(player, board, { x: 0, y: 1 })) {
      updatePlayerPos({ y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        onGameOver(currentScore);
        setDropTime(null!);
        return;
      }
      updatePlayerPos({ collided: true });
    }
  }, [player, board, onGameOver, currentScore]);
  
  const dropPlayer = () => {
    setDropTime(null!);
    drop();
  }

  const hardDrop = () => {
    let newY = player.pos.y;
    while (!checkCollision({ ...player, pos: { ...player.pos, y: newY } }, board, { x: 0, y: 1 })) {
        newY++;
    }
    updatePlayerPos({ y: newY - player.pos.y, collided: true });
  }

  useEffect(() => {
    const sweepRows = (newBoard: typeof board) => {
        let rowsCleared = 0;
        const sweptBoard = newBoard.reduce((ack, row) => {
            if (row.findIndex(cell => cell[0] === 0) === -1) {
                rowsCleared += 1;
                ack.unshift(new Array(newBoard[0].length).fill([0, '0']));
                return ack;
            }
            ack.push(row);
            return ack;
        }, [] as typeof board);

        if (rowsCleared > 0) {
            const linePoints = [0, 40, 100, 300, 1200];
            const newScore = currentScore + linePoints[rowsCleared];
            setCurrentScore(newScore);
            setScore(newScore);
        }
        return sweptBoard;
    }

    if (player.collided) {
      const newBoard = [...board];
      player.tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + player.pos.y][x + player.pos.x] = [
              value,
              player.tetromino.color,
            ];
          }
        });
      });
      const sweptBoard = sweepRows(newBoard);
      setBoard(sweptBoard);
      resetPlayer();
      setDropTime(1000);
    }
  }, [player.collided, resetPlayer, setScore, board, currentScore, player.pos.x, player.pos.y, player.tetromino]);
  

  useEffect(() => {
    if (isGameOver) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        movePlayer(-1);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        movePlayer(1);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        dropPlayer();
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        playerRotate(board);
      } else if (e.key === ' ') {
        hardDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (dropTime) {
      gameLoopRef.current = setInterval(() => {
        drop();
      }, dropTime);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [board, drop, dropTime, isGameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Board
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell[0] !== 0) {
          ctx.fillStyle = cell[1];
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = '#18181b';
          ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      });
    });

    // Draw Player
    player.tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = player.tetromino.color;
                ctx.fillRect((player.pos.x + x) * BLOCK_SIZE, (player.pos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#18181b';
                ctx.strokeRect((player.pos.x + x) * BLOCK_SIZE, (player.pos.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });

  }, [board, player, isGameOver]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}

    