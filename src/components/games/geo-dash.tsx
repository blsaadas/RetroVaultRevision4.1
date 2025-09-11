
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.8;

interface GeoDashGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function GeoDashGame({ setScore, onGameOver, isGameOver }: GeoDashGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { x: 50, y: CANVAS_HEIGHT - 50, width: 30, height: 30, dy: 0, onGround: true },
    obstacles: [] as { x: number, width: number, height: number }[],
    score: 0,
    speed: 5,
    animationFrameId: 0,
  });

  const resetGame = useCallback(() => {
    const game = gameState.current;
    game.player = { x: 50, y: CANVAS_HEIGHT - 50, width: 30, height: 30, dy: 0, onGround: true };
    game.obstacles = [];
    for(let i=0; i<3; i++){
        game.obstacles.push({
            x: CANVAS_WIDTH + i * 300,
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 40
        });
    }
    game.score = 0;
    setScore(() => 0);
    game.speed = 5;
  }, [setScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const jump = useCallback(() => {
    const game = gameState.current;
    if (!isGameOver && game.player.onGround) {
      game.player.dy = -15;
      game.player.onGround = false;
    }
  }, [isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', jump);
    window.addEventListener('click', jump);
    return () => {
        window.removeEventListener('keydown', jump);
        window.removeEventListener('click', jump);
    };
  }, [jump]);

  const gameLoop = useCallback(() => {
    if (isGameOver) {
      cancelAnimationFrame(gameState.current.animationFrameId);
      return;
    }
    
    const game = gameState.current;
    const player = game.player;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Update player
    player.dy += GRAVITY;
    player.y += player.dy;

    if (player.y >= CANVAS_HEIGHT - player.height) {
        player.y = CANVAS_HEIGHT - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // Update obstacles
    game.obstacles.forEach(obstacle => {
        obstacle.x -= game.speed;
        if(obstacle.x + obstacle.width < 0) {
            obstacle.x = CANVAS_WIDTH + Math.random() * 100;
            game.score++;
            setScore(() => game.score);
            game.speed += 0.1;
        }
    });

    // Drawing
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Ground
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Draw obstacles
    ctx.fillStyle = 'hsl(var(--destructive))';
    game.obstacles.forEach(obs => {
        ctx.beginPath();
        ctx.moveTo(obs.x, CANVAS_HEIGHT - 20);
        ctx.lineTo(obs.x + obs.width/2, CANVAS_HEIGHT - 20 - obs.height);
        ctx.lineTo(obs.x + obs.width, CANVAS_HEIGHT - 20);
        ctx.closePath();
        ctx.fill();
    });

    // Draw player
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Collision
    game.obstacles.forEach(obstacle => {
        if( player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y + player.height > CANVAS_HEIGHT - 20 - obstacle.height)
        {
            onGameOver(game.score);
        }
    });

    game.animationFrameId = requestAnimationFrame(gameLoop);
  }, [isGameOver, onGameOver, setScore]);

  useEffect(() => {
    gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameState.current.animationFrameId);
  }, [gameLoop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
