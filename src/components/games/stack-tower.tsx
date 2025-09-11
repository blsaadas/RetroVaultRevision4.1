
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface StackTowerGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function StackTowerGame({ setScore, onGameOver, isGameOver }: StackTowerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    blocks: [] as { x: number, y: number, width: number, color: string }[],
    currentBlock: { x: 0, y: 0, width: 100, speed: 3 },
    score: 0,
    animationFrameId: 0,
  });

  const resetGame = useCallback(() => {
    const game = gameState.current;
    game.blocks = [{ x: CANVAS_WIDTH / 2 - 50, y: CANVAS_HEIGHT - 20, width: 100, color: 'hsl(270, 50%, 50%)' }];
    game.currentBlock = { x: 0, y: CANVAS_HEIGHT - 40, width: 100, speed: 3 };
    game.score = 0;
    setScore(() => 0);
  }, [setScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const placeBlock = useCallback(() => {
    if (isGameOver) return;
    const game = gameState.current;
    const prevBlock = game.blocks[game.blocks.length - 1];
    const currentBlock = game.currentBlock;
    
    const overlap = Math.max(0, Math.min(prevBlock.x + prevBlock.width, currentBlock.x + currentBlock.width) - Math.max(prevBlock.x, currentBlock.x));

    if (overlap > 0) {
        const newWidth = overlap;
        const newX = Math.max(prevBlock.x, currentBlock.x);
        const newColor = `hsl(${270 + game.score * 10}, 50%, 50%)`;

        game.blocks.push({ x: newX, y: currentBlock.y, width: newWidth, color: newColor });
        game.score++;
        setScore(() => game.score);

        game.currentBlock.width = newWidth;
        game.currentBlock.y -= 20;
        game.currentBlock.speed *= 1.05;

        // Pan camera up
        if (game.currentBlock.y < CANVAS_HEIGHT / 2) {
            game.blocks.forEach(b => b.y += 20);
        }

    } else {
        onGameOver(game.score);
    }

  }, [isGameOver, onGameOver, setScore]);


  useEffect(() => {
    window.addEventListener('keydown', placeBlock);
    window.addEventListener('click', placeBlock);
    window.addEventListener('touchstart', placeBlock);
    return () => {
        window.removeEventListener('keydown', placeBlock);
        window.removeEventListener('click', placeBlock);
        window.removeEventListener('touchstart', placeBlock);
    };
  }, [placeBlock]);

  const gameLoop = useCallback(() => {
    if (isGameOver) {
      cancelAnimationFrame(gameState.current.animationFrameId);
      return;
    }

    const game = gameState.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Move current block
    game.currentBlock.x += game.currentBlock.speed;
    if (game.currentBlock.x < 0 || game.currentBlock.x + game.currentBlock.width > CANVAS_WIDTH) {
        game.currentBlock.speed *= -1;
    }

    // Drawing
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw placed blocks
    game.blocks.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, 20);
    });

    // Draw current moving block
    ctx.fillStyle = `hsl(${270 + game.score * 10}, 50%, 50%)`;
    ctx.fillRect(game.currentBlock.x, game.currentBlock.y, game.currentBlock.width, 20);


    game.animationFrameId = requestAnimationFrame(gameLoop);
  }, [isGameOver]);

  useEffect(() => {
    game.animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameState.current.animationFrameId);
  }, [gameLoop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
