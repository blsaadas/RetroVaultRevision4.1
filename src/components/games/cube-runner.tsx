
'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface CubeRunnerGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function CubeRunnerGame({ setScore, onGameOver, isGameOver }: CubeRunnerGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameState = useRef({
        player: { x: CANVAS_WIDTH / 2, width: 20 },
        cubes: [] as { x: number, y: number, z: number, size: number }[],
        score: 0,
        keys: {} as { [key: string]: boolean },
        animationFrameId: 0,
        speed: 5,
        fov: 300,
    });

    const resetGame = useCallback(() => {
        const game = gameState.current;
        game.player = { x: CANVAS_WIDTH / 2, width: 20 };
        game.cubes = [];
        for (let i = 0; i < 50; i++) {
            game.cubes.push({
                x: Math.random() * CANVAS_WIDTH * 4 - CANVAS_WIDTH * 2,
                y: Math.random() * CANVAS_HEIGHT * 4 - CANVAS_HEIGHT * 2,
                z: Math.random() * 1000,
                size: Math.random() * 30 + 10,
            });
        }
        game.score = 0;
        game.speed = 5;
        setScore(() => 0);
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
            cancelAnimationFrame(gameState.current.animationFrameId);
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

        // Handle Input
        if (game.keys['a'] || game.keys['arrowleft']) {
            game.player.x -= game.speed / 2;
        }
        if (game.keys['d'] || game.keys['arrowright']) {
            game.player.x += game.speed / 2;
        }
        game.player.x = Math.max(0, Math.min(CANVAS_WIDTH - game.player.width, game.player.x));

        // Update score and speed
        game.score += 1;
        setScore(() => Math.floor(game.score / 10));
        if(game.score % 500 === 0) {
            game.speed += 0.5;
        }

        // Drawing
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        game.cubes.sort((a, b) => b.z - a.z);

        game.cubes.forEach(cube => {
            cube.z -= game.speed;

            if (cube.z < 1) {
                cube.x = Math.random() * CANVAS_WIDTH * 4 - CANVAS_WIDTH * 2;
                cube.y = Math.random() * CANVAS_HEIGHT * 4 - CANVAS_HEIGHT * 2;
                cube.z = 1000 + Math.random() * 500;
            }

            const scale = game.fov / (game.fov + cube.z);
            const x2d = (cube.x - CANVAS_WIDTH / 2) * scale + CANVAS_WIDTH / 2;
            const y2d = (cube.y - CANVAS_HEIGHT / 2) * scale + CANVAS_HEIGHT / 2;
            const width2d = cube.size * scale;

            if (x2d + width2d > 0 && x2d < CANVAS_WIDTH && y2d + width2d > 0 && y2d < CANVAS_HEIGHT) {
                const lightness = Math.max(0, 1 - cube.z / 1000);
                ctx.fillStyle = `hsl(180, 80%, ${lightness * 70 + 20}%)`;
                ctx.fillRect(x2d - width2d / 2, y2d - width2d / 2, width2d, width2d);
                ctx.strokeStyle = `hsl(180, 80%, ${lightness * 60 + 10}%)`;
                ctx.strokeRect(x2d - width2d / 2, y2d - width2d / 2, width2d, width2d);
            }

            // Collision detection
            if (cube.z < 30 && cube.z > 10) {
                const playerLeft = game.player.x;
                const playerRight = game.player.x + game.player.width;
                const cubeLeft = x2d - width2d / 2;
                const cubeRight = x2d + width2d / 2;
                const cubeTop = y2d - width2d / 2;
                const cubeBottom = y2d + width2d / 2;

                if (playerRight > cubeLeft && playerLeft < cubeRight &&
                    CANVAS_HEIGHT - 50 < cubeBottom && CANVAS_HEIGHT - 30 > cubeTop) {
                    onGameOver(Math.floor(game.score / 10));
                }
            }
        });
        
        // Draw player indicator
        ctx.fillStyle = 'hsl(var(--primary))';
        const p_y = CANVAS_HEIGHT - 50;
        ctx.beginPath();
        ctx.moveTo(game.player.x, p_y + 20);
        ctx.lineTo(game.player.x + game.player.width / 2, p_y);
        ctx.lineTo(game.player.x + game.player.width, p_y + 20);
        ctx.closePath();
        ctx.fill();


        game.animationFrameId = requestAnimationFrame(gameLoop);
    }, [isGameOver, onGameOver, setScore]);

    useEffect(() => {
        game.animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameState.current.animationFrameId);
    }, [gameLoop]);

    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
