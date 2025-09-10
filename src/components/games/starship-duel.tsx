'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface StarshipDuelGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function StarshipDuelGame({ setScore, onGameOver, isGameOver }: StarshipDuelGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { x: CANVAS_WIDTH / 2 - 15, y: CANVAS_HEIGHT - 40, width: 30, height: 20, lives: 3 },
    bullets: [] as { x: number, y: number }[],
    aliens: [] as { x: number, y: number, width: number, height: number, type: number, path: {x:number, y:number}[], pathIndex: number, dive: boolean }[],
    alienBullets: [] as { x: number, y: number }[],
    keys: {} as { [key: string]: boolean },
    score: 0,
    level: 1,
    waveTimer: 0,
  });

  const createWave = useCallback(() => {
    const game = gameState.current;
    game.aliens = [];
    const alienRows = 2 + game.level;
    const alienCols = 8;
    for (let i = 0; i < alienRows * alienCols; i++) {
        const path = [];
        const startX = Math.random() < 0.5 ? -30 : CANVAS_WIDTH + 30;
        const startY = Math.random() * 100 + 50;
        const endX = (i % alienCols) * 50 + 50;
        const endY = Math.floor(i / alienCols) * 30 + 30;

        for(let t=0; t<1; t+=0.02){
            const xt = (1-t)*((1-t)*startX + t*(CANVAS_WIDTH/2)) + t*(t*endX + (1-t)*(CANVAS_WIDTH/2));
            const yt = (1-t)*((1-t)*startY + t*(CANVAS_HEIGHT/2)) + t*(t*endY + (1-t)*(CANVAS_HEIGHT/2));
            path.push({x: xt, y: yt});
        }
        
        game.aliens.push({
            x: startX,
            y: startY,
            width: 30,
            height: 20,
            type: (i % alienCols) % 3,
            path: path,
            pathIndex: 0,
            dive: false,
        });
    }
  }, []);

  useEffect(() => {
    createWave();
    const handleKeyDown = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [createWave]);

  const gameLoop = useCallback(() => {
    if (isGameOver) return;
    
    const game = gameState.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Player movement
    if ((game.keys['a'] || game.keys['arrowleft']) && game.player.x > 0) game.player.x -= 5;
    if ((game.keys['d'] || game.keys['arrowright']) && game.player.x < CANVAS_WIDTH - game.player.width) game.player.x += 5;

    // Player shoot
    if (game.keys[' '] && game.bullets.length < 3) {
      game.bullets.push({ x: game.player.x + game.player.width / 2 - 2, y: game.player.y });
      game.keys[' '] = false;
    }
    
    // Player
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);

    // Bullets
    ctx.fillStyle = 'yellow';
    game.bullets.forEach((bullet, index) => {
      bullet.y -= 7;
      ctx.fillRect(bullet.x, bullet.y, 4, 10);
      if (bullet.y < 0) game.bullets.splice(index, 1);
    });

    // Aliens
    game.waveTimer++;
    game.aliens.forEach((alien, aIndex) => {
        if (alien.pathIndex < alien.path.length) {
            alien.x = alien.path[alien.pathIndex].x;
            alien.y = alien.path[alien.pathIndex].y;
            alien.pathIndex++;
        } else {
             // Dive bombing
             if (!alien.dive && Math.random() < 0.001) {
                 alien.dive = true;
                 alien.path = []; // New path to player
                 const startX = alien.x;
                 const startY = alien.y;
                 const endX = game.player.x;
                 const endY = CANVAS_HEIGHT + 20;
                 for(let t=0; t<1; t+=0.02){
                    alien.path.push({x: startX + (endX - startX) * t, y: startY + (endY - startY)*t});
                 }
                 alien.pathIndex = 0;
             }
             if(alien.dive && alien.pathIndex < alien.path.length){
                 alien.x = alien.path[alien.pathIndex].x;
                 alien.y = alien.path[alien.pathIndex].y;
                 alien.pathIndex++;
             } else if(alien.dive) {
                 alien.dive = false;
                 alien.x = Math.random() * CANVAS_WIDTH;
                 alien.y = -20;
                 // reset to top
                 alien.path = [];
                 const endX = Math.random() * (CANVAS_WIDTH - 100) + 50;
                 const endY = Math.random() * 100 + 30;
                  for(let t=0; t<1; t+=0.02){
                    alien.path.push({x: alien.x + (endX - alien.x) * t, y: alien.y + (endY - alien.y)*t});
                 }
                 alien.pathIndex = 0;
             }
        }


        ctx.fillStyle = ['#f87171', '#fb923c', '#facc15'][alien.type];
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);

        // Player bullet collision
        game.bullets.forEach((bullet, bIndex) => {
            if (bullet.x < alien.x + alien.width && bullet.x + 4 > alien.x &&
                bullet.y < alien.y + alien.height && bullet.y + 10 > alien.y) {
                game.aliens.splice(aIndex, 1);
                game.bullets.splice(bIndex, 1);
                game.score += 100;
                setScore(() => game.score);
            }
        });
        
        // Player collision
        if( game.player.x < alien.x + alien.width && game.player.x + game.player.width > alien.x &&
            game.player.y < alien.y + alien.height && game.player.y + game.player.height > alien.y)
        {
            game.player.lives--;
            if(game.player.lives <= 0) onGameOver(game.score);
            else createWave();
        }
    });

    if (game.aliens.length === 0 && game.waveTimer > 100) {
        game.level++;
        game.waveTimer = 0;
        createWave();
    }

    requestAnimationFrame(gameLoop);
  }, [isGameOver, onGameOver, setScore, createWave]);

  useEffect(() => {
    requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
