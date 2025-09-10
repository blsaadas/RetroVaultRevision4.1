'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 650;
const GRID_SIZE = 50;
const NUM_LANES = 5;
const NUM_LOG_LANES = 5;

interface FrogHopperGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function FrogHopperGame({ setScore, onGameOver, isGameOver }: FrogHopperGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameState = useRef({
        frog: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - GRID_SIZE, width: GRID_SIZE, height: GRID_SIZE },
        homes: [] as { x: number, y: number, filled: boolean }[],
        cars: [] as { x: number, y: number, width: number, speed: number }[],
        logs: [] as { x: number, y: number, width: number, speed: number }[],
        score: 0,
        lives: 5,
        animationFrameId: 0,
    });

    const resetFrog = useCallback(() => {
        gameState.current.frog = { x: CANVAS_WIDTH / 2 - GRID_SIZE / 2, y: CANVAS_HEIGHT - GRID_SIZE, width: GRID_SIZE, height: GRID_SIZE };
    }, []);

    const initGame = useCallback(() => {
        const game = gameState.current;
        game.score = 0;
        game.lives = 5;
        resetFrog();

        // Homes
        game.homes = [];
        for (let i = 0; i < 5; i++) {
            game.homes.push({ x: i * (GRID_SIZE * 2.4) + GRID_SIZE, y: GRID_SIZE, filled: false });
        }

        // Cars
        game.cars = [];
        for (let i = 0; i < NUM_LANES; i++) {
            const y = CANVAS_HEIGHT - (i + 2) * GRID_SIZE;
            const speed = (Math.random() * 2 + 1) * (i % 2 === 0 ? 1 : -1);
            for (let j = 0; j < 3; j++) {
                const x = j * 250 + Math.random() * 100;
                game.cars.push({ x, y, width: GRID_SIZE * (Math.random() > 0.5 ? 2:1), speed });
            }
        }
        
        // Logs
        game.logs = [];
        for (let i = 0; i < NUM_LOG_LANES; i++) {
            const y = GRID_SIZE * (i + 2);
            const speed = (Math.random() * 1.5 + 0.5) * (i % 2 === 0 ? 1 : -1);
            for (let j = 0; j < 3; j++) {
                const x = j * 300 + Math.random() * 150;
                game.logs.push({ x, y, width: GRID_SIZE * (Math.floor(Math.random() * 2) + 2), speed });
            }
        }
    }, [resetFrog]);

    useEffect(() => {
        initGame();
        const handleKeyDown = (e: KeyboardEvent) => {
             e.preventDefault();
             if (isGameOver) return;
             const frog = gameState.current.frog;
             switch (e.key) {
                case 'w': case 'ArrowUp': frog.y -= GRID_SIZE; break;
                case 's': case 'ArrowDown': if(frog.y < CANVAS_HEIGHT - GRID_SIZE) frog.y += GRID_SIZE; break;
                case 'a': case 'ArrowLeft': if(frog.x > 0) frog.x -= GRID_SIZE; break;
                case 'd': case 'ArrowRight': if(frog.x < CANVAS_WIDTH - GRID_SIZE) frog.x += GRID_SIZE; break;
             }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            cancelAnimationFrame(gameState.current.animationFrameId);
        };
    }, [initGame, isGameOver]);
    
    const gameLoop = useCallback(() => {
        if (isGameOver) {
            cancelAnimationFrame(gameState.current.animationFrameId);
            return;
        }

        const game = gameState.current;
        const frog = game.frog;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Drawing background
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = '#4f46e5'; // water
        ctx.fillRect(0, GRID_SIZE, CANVAS_WIDTH, NUM_LOG_LANES * GRID_SIZE + GRID_SIZE);
        ctx.fillStyle = '#16a34a'; // end zone
        ctx.fillRect(0, 0, CANVAS_WIDTH, GRID_SIZE * 2);
         ctx.fillStyle = '#4b5563'; // road
        ctx.fillRect(0, CANVAS_HEIGHT - (NUM_LANES + 1) * GRID_SIZE, CANVAS_WIDTH, NUM_LANES * GRID_SIZE);
        ctx.fillStyle = '#a1a1aa'; // safe zone
        ctx.fillRect(0, CANVAS_HEIGHT - GRID_SIZE, CANVAS_WIDTH, GRID_SIZE);
        ctx.fillRect(0, CANVAS_HEIGHT / 2 - GRID_SIZE/2, CANVAS_WIDTH, GRID_SIZE);


        // Draw homes
        game.homes.forEach(home => {
            ctx.fillStyle = home.filled ? '#22c55e' : '#4338ca';
            ctx.fillRect(home.x, home.y, GRID_SIZE, GRID_SIZE);
        });

        // Update and draw cars
        ctx.fillStyle = '#ef4444';
        game.cars.forEach(car => {
            car.x += car.speed;
            if (car.speed > 0 && car.x > CANVAS_WIDTH) car.x = -car.width;
            if (car.speed < 0 && car.x < -car.width) car.x = CANVAS_WIDTH;
            ctx.fillRect(car.x, car.y, car.width, GRID_SIZE);
        });

        // Update and draw logs
        ctx.fillStyle = '#a16207';
        let onLog = false;
        game.logs.forEach(log => {
            log.x += log.speed;
            if (log.speed > 0 && log.x > CANVAS_WIDTH) log.x = -log.width;
            if (log.speed < 0 && log.x < -log.width) log.x = CANVAS_WIDTH;
            ctx.fillRect(log.x, log.y, log.width, GRID_SIZE);

            if (frog.y === log.y && frog.x >= log.x && frog.x + frog.width <= log.x + log.width) {
                frog.x += log.speed;
                onLog = true;
            }
        });
        
        // Draw frog
        ctx.fillStyle = 'lime';
        ctx.fillRect(frog.x, frog.y, frog.width, frog.height);

        // Check collisions
        if(frog.y < CANVAS_HEIGHT / 2 && frog.y > GRID_SIZE * 2 && !onLog){
            game.lives--;
            resetFrog();
        }

        game.cars.forEach(car => {
            if (frog.y === car.y && frog.x < car.x + car.width && frog.x + frog.width > car.x) {
                game.lives--;
                resetFrog();
            }
        });
        
        // Check for reaching home
        if (frog.y <= GRID_SIZE * 2) {
            let inHome = false;
            game.homes.forEach(home => {
                if (!home.filled && frog.x > home.x && frog.x < home.x + GRID_SIZE) {
                    home.filled = true;
                    game.score += 100;
                    setScore(() => game.score);
                    inHome = true;
                }
            });
            if (!inHome) game.lives--;
            resetFrog();
        }

        // Check game over
        if (game.lives <= 0) {
            onGameOver(game.score);
        }
        
        // Check win
        if (game.homes.every(h => h.filled)) {
            game.score += 1000;
            setScore(() => game.score);
            initGame(); // Reset for next level
        }

        ctx.font = '32px "Space Grotesk"';
        ctx.fillStyle = 'white';
        ctx.fillText(`Lives: ${game.lives}`, 10, 35);
        
        game.animationFrameId = requestAnimationFrame(gameLoop);
    }, [isGameOver, onGameOver, setScore, resetFrog, initGame]);
    
    useEffect(() => {
        gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameState.current.animationFrameId);
    }, [gameLoop]);

    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
