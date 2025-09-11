
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.3;
const LIFT = -6;
const PIPE_WIDTH = 60;
const PIPE_GAP = 120;
const PIPE_SPACING = 250;

interface FlappyJetpackGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function FlappyJetpackGame({ setScore, onGameOver, isGameOver }: FlappyJetpackGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { y: CANVAS_HEIGHT / 2, velocity: 0, size: 20 },
    pipes: [] as { x: number, y: number }[],
    score: 0,
    frameCount: 0,
    animationFrameId: 0,
  });

  const resetGame = useCallback(() => {
    const game = gameState.current;
    game.player = { y: CANVAS_HEIGHT / 2, velocity: 0, size: 20 };
    game.pipes = [];
    for (let i = 0; i < 3; i++) {
        game.pipes.push({
            x: CANVAS_WIDTH + i * PIPE_SPACING,
            y: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50
        });
    }
    game.score = 0;
    setScore(() => 0);
    game.frameCount = 0;
  }, [setScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const flap = useCallback(() => {
    if (!isGameOver) {
      gameState.current.player.velocity = LIFT;
    }
  }, [isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', flap);
    window.addEventListener('click', flap);
    window.addEventListener('touchstart', flap);
    return () => {
      window.removeEventListener('keydown', flap);
      window.removeEventListener('click', flap);
      window.removeEventListener('touchstart', flap);
    };
  }, [flap]);

  const gameLoop = useCallback(() => {
    if (isGameOver) {
      cancelAnimationFrame(gameState.current.animationFrameId);
      return;
    }

    const game = gameState.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Update player
    game.player.velocity += GRAVITY;
    game.player.y += game.player.velocity;

    // Update pipes
    game.pipes.forEach(pipe => {
      pipe.x -= 2;
      if (pipe.x + PIPE_WIDTH < 0) {
        pipe.x = CANVAS_WIDTH + PIPE_SPACING - (3 * 2); // Reposition
        pipe.y = Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50;
      }
    });
    
    // Increment score
    game.frameCount++;
    if(game.frameCount % 125 === 0) {
        game.score++;
        setScore(() => game.score);
    }

    // Drawing
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    ctx.fillStyle = '#4ade80';
    game.pipes.forEach(pipe => {
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.y); // Top pipe
      ctx.fillRect(pipe.x, pipe.y + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - pipe.y - PIPE_GAP); // Bottom pipe
    });

    // Draw player
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(100, game.player.y, game.player.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Collision detection
    if (game.player.y > CANVAS_HEIGHT - game.player.size / 2 || game.player.y < game.player.size / 2) {
      onGameOver(game.score);
    }

    game.pipes.forEach(pipe => {
      if (
        100 > pipe.x && 100 < pipe.x + PIPE_WIDTH &&
        (game.player.y - game.player.size/2 < pipe.y || game.player.y + game.player.size/2 > pipe.y + PIPE_GAP)
      ) {
        onGameOver(game.score);
      }
    });

    game.animationFrameId = requestAnimationFrame(gameLoop);
  }, [isGameOver, onGameOver, setScore]);

  useEffect(() => {
    game.animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameState.current.animationFrameId);
  }, [gameLoop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
