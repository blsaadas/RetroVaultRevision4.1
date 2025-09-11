
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface EndlessRoadGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function EndlessRoadGame({ setScore, onGameOver, isGameOver }: EndlessRoadGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    player: { x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 80, width: 40, height: 60 },
    road: [] as { y: number, x_offset: number }[],
    obstacles: [] as { x: number, y: number, width: number, height: number }[],
    score: 0,
    speed: 5,
    keys: {} as { [key: string]: boolean },
    animationFrameId: 0,
  });

  const resetGame = useCallback(() => {
    const game = gameState.current;
    game.player = { x: CANVAS_WIDTH / 2 - 20, y: CANVAS_HEIGHT - 80, width: 40, height: 60 };
    game.road = [];
    for(let i=0; i < CANVAS_HEIGHT / 10 + 1; i++){
        game.road.push({y: i * 10, x_offset: 0});
    }
    game.obstacles = [];
    game.score = 0;
    setScore(() => 0);
    game.speed = 5;
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
    if ((game.keys['a'] || game.keys['arrowleft'])) game.player.x -= 5;
    if ((game.keys['d'] || game.keys['arrowright'])) game.player.x += 5;
    
    // Update road
    let current_x = 0;
    game.road.forEach(segment => {
        segment.y += game.speed;
        current_x = segment.x_offset;
    });

    if(game.road[0].y > CANVAS_HEIGHT){
        game.road.shift();
        const last_segment = game.road[game.road.length - 1];
        game.road.push({
            y: last_segment.y - 10,
            x_offset: last_segment.x_offset + (Math.random() - 0.5) * 10
        });
        game.score++;
        setScore(()=>game.score);
        game.speed += 0.01;
    }

    // Update obstacles
    if(Math.random() < 0.02) {
        game.obstacles.push({
            x: Math.random() * (CANVAS_WIDTH/2) + CANVAS_WIDTH/4,
            y: -60,
            width: 40, height: 60
        });
    }
    game.obstacles.forEach((obs, i) => {
        obs.y += game.speed;
        if(obs.y > CANVAS_HEIGHT) game.obstacles.splice(i, 1);
    });
    
    // Drawing
    ctx.fillStyle = '#16a34a'; // Grass
    ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw road
    ctx.fillStyle = '#4b5563'; // Road
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    game.road.forEach((s, i) => {
        const roadWidth = CANVAS_WIDTH / 2;
        const x_pos = CANVAS_WIDTH / 2 + s.x_offset;
        if (i === 0) ctx.moveTo(x_pos - roadWidth/2, s.y);
        else ctx.lineTo(x_pos - roadWidth/2, s.y);
    });
    game.road.slice().reverse().forEach(s => {
        const roadWidth = CANVAS_WIDTH / 2;
        const x_pos = CANVAS_WIDTH / 2 + s.x_offset;
        ctx.lineTo(x_pos + roadWidth/2, s.y);
    });
    ctx.closePath();
    ctx.fill();
    
    // Draw obstacles
    ctx.fillStyle = '#b91c1c';
    game.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Draw player
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(game.player.x, game.player.y, game.player.width, game.player.height);
    
    // Collision
    if (game.player.x < CANVAS_WIDTH/4 || game.player.x > CANVAS_WIDTH - CANVAS_WIDTH/4 - game.player.width) {
        onGameOver(game.score);
    }
    game.obstacles.forEach(obs => {
        if( game.player.x < obs.x + obs.width &&
            game.player.x + game.player.width > obs.x &&
            game.player.y < obs.y + obs.height &&
            game.player.y + game.player.height > obs.y
        ){
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
