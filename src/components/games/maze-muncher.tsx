'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 20;

const map = [
    "##############################",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#o####.#####.##.#####.####o#",
    "#.####.#####.##.#####.####.#",
    "#..........................#",
    "#.####.##.########.##.####.#",
    "#.####.##.########.##.####.#",
    "#......##....##....##......#",
    "######.##### ## #####.######",
    "     #.##### ## #####.#     ",
    "     #.##          ##.#     ",
    "     #.## ###--### ##.#     ",
    "######.## #      # ##.######",
    "      .   #      #   .      ",
    "######.## #      # ##.######",
    "     #.## ######## ##.#     ",
    "     #.##          ##.#     ",
    "     #.## ######## ##.#     ",
    "######.## ######## ##.######",
    "#............##............#",
    "#.####.#####.##.#####.####.#",
    "#.####.#####.##.#####.####.#",
    "#o..##................##..o#",
    "###.##.##.########.##.##.###",
    "###.##.##.########.##.##.###",
    "#......##....##....##......#",
    "#.##########.##.##########.#",
    "#o##########.##.##########o#",
    "#..........................#",
    "##############################"
];


interface MazeMuncherGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function MazeMuncherGame({ setScore, onGameOver, isGameOver }: MazeMuncherGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scaleRef = useRef(1);
    
    const gameState = useRef({
        player: { x: 14, y: 23, dx: 0, dy: 0, nextDx: 0, nextDy: 0, lives: 3 },
        ghosts: [
            { x: 13, y: 14, dx: 1, dy: 0, color: 'red' },
            { x: 14, y: 14, dx: -1, dy: 0, color: 'pink' },
            { x: 15, y: 14, dx: 1, dy: 0, color: 'cyan' },
            { x: 12, y: 14, dx: -1, dy: 0, color: 'orange' },
        ],
        pellets: [] as {x: number, y: number, isPowerPellet: boolean}[],
        score: 0,
        isFrightened: 0,
        animationFrameId: 0,
    });

    const setupGame = useCallback(() => {
        const game = gameState.current;
        game.pellets = [];
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === '.') {
                    game.pellets.push({ x, y, isPowerPellet: false });
                } else if (map[y][x] === 'o') {
                    game.pellets.push({ x, y, isPowerPellet: true });
                }
            }
        }
    }, []);

    useEffect(() => {
        setupGame();
    }, [setupGame]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const game = gameState.current;
            switch(e.key) {
                case 'w': case 'ArrowUp': game.player.nextDx=0; game.player.nextDy=-1; break;
                case 's': case 'ArrowDown': game.player.nextDx=0; game.player.nextDy=1; break;
                case 'a': case 'ArrowLeft': game.player.nextDx=-1; game.player.nextDy=0; break;
                case 'd': case 'ArrowRight': game.player.nextDx=1; game.player.nextDy=0; break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    const isWall = (x: number, y: number) => {
        const char = map[Math.floor(y)]?.[Math.floor(x)];
        return char === '#' || char === '-';
    };

    const gameLoop = useCallback(() => {
        if (isGameOver) {
            cancelAnimationFrame(gameState.current.animationFrameId);
            return;
        }

        const game = gameState.current;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const MAP_WIDTH_PX = map[0].length * GRID_SIZE;
        const MAP_HEIGHT_PX = map.length * GRID_SIZE;

        const scaleX = canvas.width / MAP_WIDTH_PX;
        const scaleY = canvas.height / MAP_HEIGHT_PX;
        const scale = Math.min(scaleX, scaleY);
        scaleRef.current = scale;
        
        ctx.save();
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const offsetX = (canvas.width - MAP_WIDTH_PX * scale) / 2;
        const offsetY = (canvas.height - MAP_HEIGHT_PX * scale) / 2;
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // Update player position
        const { player } = game;
        if (Math.abs(player.x - Math.round(player.x)) < 0.1 && Math.abs(player.y - Math.round(player.y)) < 0.1) {
            player.x = Math.round(player.x);
            player.y = Math.round(player.y);
            if (!isWall(player.x + player.nextDx, player.y + player.nextDy) && (player.nextDx !== 0 || player.nextDy !== 0)) {
                player.dx = player.nextDx;
                player.dy = player.nextDy;
            }
        }
        if (isWall(player.x + player.dx * 0.1, player.y + player.dy * 0.1)) {
            player.dx = 0;
            player.dy = 0;
        }
        player.x += player.dx * 0.1;
        player.y += player.dy * 0.1;
        
        // Handle wrapping
        if (player.x < -1) player.x = map[0].length;
        if (player.x > map[0].length) player.x = -1;


        // Update ghost positions
        game.ghosts.forEach(ghost => {
             if (Math.abs(ghost.x - Math.round(ghost.x)) < 0.1 && Math.abs(ghost.y - Math.round(ghost.y)) < 0.1) {
                ghost.x = Math.round(ghost.x);
                ghost.y = Math.round(ghost.y);

                const possibleMoves = [];
                if (!isWall(ghost.x, ghost.y - 1) && ghost.dy !== 1) possibleMoves.push({dx:0, dy:-1});
                if (!isWall(ghost.x, ghost.y + 1) && ghost.dy !== -1) possibleMoves.push({dx:0, dy:1});
                if (!isWall(ghost.x - 1, ghost.y) && ghost.dx !== 1) possibleMoves.push({dx:-1, dy:0});
                if (!isWall(ghost.x + 1, ghost.y) && ghost.dx !== -1) possibleMoves.push({dx:1, dy:0});
                
                if (possibleMoves.length > 0) {
                    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                    ghost.dx = move.dx;
                    ghost.dy = move.dy;
                }
             }
             ghost.x += ghost.dx * 0.05;
             ghost.y += ghost.dy * 0.05;
        });

        // Eat pellets
        const playerGridX = Math.round(player.x);
        const playerGridY = Math.round(player.y);
        const pelletIndex = game.pellets.findIndex(p => p.x === playerGridX && p.y === playerGridY);
        if (pelletIndex !== -1) {
            const pellet = game.pellets[pelletIndex];
            if(pellet.isPowerPellet) {
                game.score += 50;
                game.isFrightened = 300; // 5 seconds at 60fps
            } else {
                game.score += 10;
            }
            setScore(() => game.score);
            game.pellets.splice(pelletIndex, 1);

            if (game.pellets.length === 0) {
                setupGame(); // Next level
            }
        }

        if(game.isFrightened > 0) game.isFrightened--;


        // Ghost collision
        game.ghosts.forEach(ghost => {
            const dx = player.x - ghost.x;
            const dy = player.y - ghost.y;
            if (Math.sqrt(dx*dx + dy*dy) < 0.8) {
                if (game.isFrightened > 0) {
                    ghost.x = 13.5;
                    ghost.y = 11.5;
                    game.score += 200;
                    setScore(() => game.score);
                } else {
                    player.lives--;
                    if(player.lives <= 0) {
                       onGameOver(game.score);
                    } else {
                       player.x = 14; player.y = 23;
                       player.dx = 0; player.dy = 0;
                       player.nextDx = 0; player.nextDy = 0;
                    }
                }
            }
        });

        // DRAWING
        // Draw map
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === '#') {
                    ctx.fillStyle = '#3b82f6';
                    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                }
            }
        }
        // Draw pellets
        game.pellets.forEach(p => {
            ctx.fillStyle = 'white';
            const size = p.isPowerPellet ? GRID_SIZE / 2 : GRID_SIZE / 4;
            ctx.beginPath();
            ctx.arc(p.x * GRID_SIZE + GRID_SIZE / 2, p.y * GRID_SIZE + GRID_SIZE / 2, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw player
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(player.x * GRID_SIZE + GRID_SIZE/2, player.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2, 0, Math.PI * 2);
        ctx.fill();

        // Draw ghosts
        game.ghosts.forEach(g => {
            ctx.fillStyle = game.isFrightened > 0 ? (game.isFrightened < 100 && game.isFrightened % 20 > 10 ? 'white' : 'blue') : g.color;
            ctx.fillRect(g.x * GRID_SIZE, g.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        });

        ctx.restore();

        game.animationFrameId = requestAnimationFrame(gameLoop);
    }, [isGameOver, onGameOver, setScore, setupGame]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);
        
        gameState.current.animationFrameId = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(gameState.current.animationFrameId);
        }
    }, [gameLoop]);

    return <canvas ref={canvasRef} />;
}
