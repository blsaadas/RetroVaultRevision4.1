'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface GalaxyPatrolGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function GalaxyPatrolGame({ setScore, onGameOver, isGameOver }: GalaxyPatrolGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { x: CANVAS_WIDTH / 2 - 15, y: CANVAS_HEIGHT - 30, width: 30, height: 20 },
    bullets: [] as { x: number, y: number }[],
    aliens: [] as { x: number, y: number, width: number, height: number, type: number }[],
    alienBullets: [] as { x: number, y: number }[],
    alienDirection: 1,
    keys: {} as { [key: string]: boolean },
    score: 0,
    level: 1,
    alienMoveTimer: 0,
    alienShootTimer: 0,
  });

  const resetLevel = useCallback(() => {
    const game = gameState.current;
    game.aliens = [];
    const alienRows = 2 + game.level;
    const alienCols = 8;
    for (let r = 0; r < alienRows; r++) {
      for (let c = 0; c < alienCols; c++) {
        game.aliens.push({
          x: c * 50 + 50,
          y: r * 30 + 30,
          width: 30,
          height: 20,
          type: r % 3
        });
      }
    }
  }, []);

  useEffect(() => {
    resetLevel();

    const handleKeyDown = (e: KeyboardEvent) => {
      gameState.current.keys[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      gameState.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [resetLevel]);

  const gameLoop = useCallback(() => {
    if (isGameOver) return;

    const game = gameState.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Player movement
    if ((game.keys['ArrowLeft'] || game.keys['a']) && game.player.x > 0) game.player.x -= 5;
    if ((game.keys['ArrowRight'] || game.keys['d']) && game.player.x < CANVAS_WIDTH - game.player.width) game.player.x += 5;

    // Player shoot
    if (game.keys[' '] && game.bullets.length < 5) {
      game.bullets.push({ x: game.player.x + game.player.width / 2 - 2, y: game.player.y });
      game.keys[' '] = false; // Prevent holding space
    }

    // Update and draw bullets
    ctx.fillStyle = 'yellow';
    game.bullets.forEach((bullet, index) => {
      bullet.y -= 7;
      ctx.fillRect(bullet.x, bullet.y, 4, 10);
      if (bullet.y < 0) game.bullets.splice(index, 1);
    });
    
    // Update and draw aliens
    game.alienMoveTimer++;
    let moveDown = false;
    if(game.alienMoveTimer > 30 - game.level * 2) {
        game.alienMoveTimer = 0;
        let edgeReached = false;
        game.aliens.forEach(alien => {
            alien.x += 10 * game.alienDirection;
            if (alien.x <= 0 || alien.x >= CANVAS_WIDTH - alien.width) {
                edgeReached = true;
            }
        });
        if(edgeReached) {
            game.alienDirection *= -1;
            moveDown = true;
        }
    }

    game.aliens.forEach(alien => {
        if(moveDown) alien.y += 10;
        ctx.fillStyle = ['#f87171', '#fb923c', '#facc15'][alien.type];
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
        
        // Check for game over
        if (alien.y + alien.height >= game.player.y) {
            onGameOver(game.score);
        }
    });

    // Alien shoot
    game.alienShootTimer++;
    if(game.alienShootTimer > 60 - game.level * 5 && game.aliens.length > 0) {
        game.alienShootTimer = 0;
        const shootingAlien = game.aliens[Math.floor(Math.random() * game.aliens.length)];
        game.alienBullets.push({ x: shootingAlien.x + shootingAlien.width / 2, y: shootingAlien.y + shootingAlien.height});
    }

    // Update and draw alien bullets
    ctx.fillStyle = 'red';
    game.alienBullets.forEach((bullet, index) => {
        bullet.y += 5;
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
        if (bullet.y > CANVAS_HEIGHT) game.alienBullets.splice(index, 1);

        // Collision with player
        if (
            bullet.x < game.player.x + game.player.width &&
            bullet.x + 4 > game.player.x &&
            bullet.y < game.player.y + game.player.height &&
            bullet.y + 10 > game.player.y
        ) {
            onGameOver(game.score);
        }
    });

    // Collision detection: bullets and aliens
    game.bullets.forEach((bullet, bIndex) => {
      game.aliens.forEach((alien, aIndex) => {
        if (
          bullet.x < alien.x + alien.width &&
          bullet.x + 4 > alien.x &&
          bullet.y < alien.y + alien.height &&
          bullet.y + 10 > alien.y
        ) {
          game.aliens.splice(aIndex, 1);
          game.bullets.splice(bIndex, 1);
          game.score += 10;
          setScore(prev => prev + 10);
        }
      });
    });

    // Draw player
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
    
    // Check for win condition
    if (game.aliens.length === 0) {
        game.level++;
        resetLevel();
    }

    requestAnimationFrame(gameLoop);
  }, [isGameOver, onGameOver, setScore, resetLevel]);

  useEffect(() => {
    requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
