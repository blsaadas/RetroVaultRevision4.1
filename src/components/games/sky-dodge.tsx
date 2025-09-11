
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface SkyDodgeGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function SkyDodgeGame({ setScore, onGameOver, isGameOver }: SkyDodgeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, width: 30, height: 30 },
    obstacles: [] as { x: number, y: number, size: number, speed: number }[],
    score: 0,
    keys: {} as { [key: string]: boolean },
    animationFrameId: 0,
    spawnTimer: 0,
    speedMultiplier: 1,
  });

  const resetGame = useCallback(() => {
    const game = gameState.current;
    game.player = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 30, width: 30, height: 30 };
    game.obstacles = [];
    game.score = 0;
    setScore(() => 0);
    game.spawnTimer = 0;
    game.speedMultiplier = 1;
  }, [setScore]);

  useEffect(() => {
    resetGame();
    const handleKeyDown = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetGame]);

  const gameLoop = useCallback(() => {
    if (isGameOver) {
      cancelAnimationFrame(gameState.current.animationFrameId);
      return;
    }
    const game = gameState.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Player movement
    if ((game.keys['a'] || game.keys['arrowleft']) && game.player.x > 0) game.player.x -= 5;
    if ((game.keys['d'] || game.keys['arrowright']) && game.player.x < CANVAS_WIDTH - game.player.width) game.player.x += 5;

    // Spawn obstacles
    game.spawnTimer++;
    if (game.spawnTimer > Math.max(20, 60 - game.speedMultiplier * 5)) {
        game.spawnTimer = 0;
        game.obstacles.push({
            x: Math.random() * CANVAS_WIDTH,
            y: -20,
            size: Math.random() * 20 + 10,
            speed: (Math.random() * 2 + 1) * game.speedMultiplier
        });
    }

    // Update obstacles
    game.obstacles.forEach((obs, index) => {
        obs.y += obs.speed;
        if (obs.y > CANVAS_HEIGHT) {
            game.obstacles.splice(index, 1);
            game.score++;
            setScore(() => game.score);
            if(game.score % 10 === 0) game.speedMultiplier += 0.1;
        }
    });
    
    // Drawing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw obstacles
    ctx.fillStyle = 'hsl(var(--accent))';
    game.obstacles.forEach(obs => {
        ctx.fillRect(obs.x - obs.size/2, obs.y - obs.size/2, obs.size, obs.size);
    });

    // Draw Player
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);

    // Collision
    game.obstacles.forEach(obs => {
        if( game.player.x < obs.x + obs.size/2 &&
            game.player.x + game.player.width > obs.x - obs.size/2 &&
            game.player.y < obs.y + obs.size/2 &&
            game.player.y + game.player.height > obs.y - obs.size/2
        ){
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
