
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.5;

interface DoodleAscendGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function DoodleAscendGame({ setScore, onGameOver, isGameOver }: DoodleAscendGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, width: 30, height: 30, dy: 0 },
    platforms: [] as { x: number, y: number, width: number }[],
    score: 0,
    keys: {} as { [key: string]: boolean },
    cameraY: 0,
    animationFrameId: 0,
  });

  const resetGame = useCallback(() => {
    const game = gameState.current;
    game.player = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50, width: 30, height: 30, dy: 0 };
    game.platforms = [];
    for (let i = 0; i < 10; i++) {
        game.platforms.push({
            x: Math.random() * (CANVAS_WIDTH - 60),
            y: CANVAS_HEIGHT - 50 - i * 60,
            width: 60,
        });
    }
    game.score = 0;
    setScore(() => 0);
    game.cameraY = 0;
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
    const player = game.player;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Player movement
    if (game.keys['a'] || game.keys['arrowleft']) player.x -= 5;
    if (game.keys['d'] || game.keys['arrowright']) player.x += 5;
    if (player.x > CANVAS_WIDTH) player.x = -player.width;
    if (player.x < -player.width) player.x = CANVAS_WIDTH;

    // Player physics
    player.dy += GRAVITY;
    player.y += player.dy;

    // Camera follow
    if (player.y - game.cameraY < CANVAS_HEIGHT / 3) {
        game.cameraY = player.y - CANVAS_HEIGHT / 3;
    }
    
    // Update score
    const newScore = Math.max(game.score, Math.floor(-game.cameraY / 10));
    if (newScore > game.score) {
        game.score = newScore;
        setScore(() => game.score);
    }


    // Collision with platforms
    game.platforms.forEach(platform => {
        if (
            player.dy > 0 &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + 20
        ) {
            player.dy = -12;
        }
    });

    // Game over
    if (player.y - game.cameraY > CANVAS_HEIGHT) {
        onGameOver(game.score);
    }
    
    // Generate new platforms
    if (game.platforms[game.platforms.length - 1].y > game.cameraY - 50) {
        game.platforms.push({
            x: Math.random() * (CANVAS_WIDTH - 60),
            y: game.platforms[game.platforms.length - 1].y - 60,
            width: 60,
        });
        game.platforms.shift();
    }


    // Drawing
    ctx.save();
    ctx.fillStyle = '#182848';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.translate(0, -game.cameraY);

    // Draw platforms
    ctx.fillStyle = '#a3e635';
    game.platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, 15);
    });

    // Draw player
    ctx.fillStyle = '#f97316';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.restore();

    game.animationFrameId = requestAnimationFrame(gameLoop);
  }, [isGameOver, onGameOver, setScore]);

  useEffect(() => {
    gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameState.current.animationFrameId);
  }, [gameLoop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
