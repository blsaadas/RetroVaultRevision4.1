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
    "     #.## ######## ##.#     ",
    "######.## #      # ##.######",
    "        #      #          ",
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
            { x: 13.5, y: 14, dx: 1, dy: 0, color: 'red', isInBox: true },
            { x: 14.5, y: 14, dx: -1, dy: 0, color: 'pink', isInBox: true },
            { x: 15.5, y: 14, dx: 1, dy: 0, color: 'cyan', isInBox: true },
            { x: 12.5, y: 14, dx: -1, dy: 0, color: 'orange', isInBox: true },
        ],
        pellets: [] as {x: number, y: number, isPowerPellet: boolean}[],
        score: 0,
        isFrightened: 0,
        animationFrameId: 0,
        frameCount: 0,
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
            if(isGameOver) return;
            e.preventDefault();
            switch(e.key) {
                case 'w': case 'ArrowUp': game.player.nextDx=0; game.player.nextDy=-1; break;
                case 's': case 'ArrowDown': game.player.nextDx=0; game.player.nextDy=1; break;
                case 'a': case 'ArrowLeft': game.player.nextDx=-1; game.player.nextDy=0; break;
                case 'd': case 'ArrowRight': game.player.nextDx=1; game.player.nextDy=0; break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameOver]);


    const isWall = (x: number, y: number) => {
        const char = map[Math.floor(y)]?.[Math.floor(x)];
        return char === '#';
    };

    const isGhostWall = (x: number, y: number) => {
        const char = map[Math.floor(y)]?.[Math.floor(x)];
        return char === '#' || char === '-';
    }


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
        
        game.frameCount++;

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

        // Update player position only every few frames
        if (game.frameCount % 8 === 0) {
            const { player } = game;
            
            // Try to apply next direction
            const nextGridX = player.x + player.nextDx;
            const nextGridY = player.y + player.nextDy;
            if (!isWall(nextGridX, nextGridY)) {
                player.dx = player.nextDx;
                player.dy = player.nextDy;
            }

            // Move in current direction
            const currentGridX = player.x + player.dx;
            const currentGridY = player.y + player.dy;
            if (!isWall(currentGridX, currentGridY)) {
                player.x = currentGridX;
                player.y = currentGridY;
            }
        
            // Handle wrapping
            if (player.x < -1) player.x = map[0].length;
            if (player.x > map[0].length) player.x = -1;
        }


        // Update ghost positions
        if (game.frameCount % 8 === 0) {
            game.ghosts.forEach(ghost => {
                 if (ghost.isInBox && ghost.y > 12) {
                     ghost.dy = -1; // Move up to exit box
                     ghost.dx = 0;
                 } else if (ghost.isInBox && ghost.y <= 12) {
                     ghost.isInBox = false;
                 }

                 if (!ghost.isInBox) {
                    const possibleMoves = [];
                    if (!isGhostWall(ghost.x, ghost.y - 1) && ghost.dy !== 1) possibleMoves.push({dx:0, dy:-1});
                    if (!isGhostWall(ghost.x, ghost.y + 1) && ghost.dy !== -1) possibleMoves.push({dx:0, dy:1});
                    if (!isGhostWall(ghost.x - 1, ghost.y) && ghost.dx !== 1) possibleMoves.push({dx:-1, dy:0});
                    if (!isGhostWall(ghost.x + 1, ghost.y) && ghost.dx !== -1) possibleMoves.push({dx:1, dy:0});
                    
                    if (possibleMoves.length > 1) { // Don't turn back if not at intersection
                        const backMoveIndex = possibleMoves.findIndex(m => m.dx === -ghost.dx && m.dy === -ghost.dy);
                        if(backMoveIndex > -1) possibleMoves.splice(backMoveIndex, 1);
                    }

                    if (possibleMoves.length > 0) {
                        const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                        ghost.dx = move.dx;
                        ghost.dy = move.dy;
                    }
                }
                ghost.x += ghost.dx;
                ghost.y += ghost.dy;

                // Handle wrapping for ghosts
                if (ghost.x < -1) ghost.x = map[0].length;
                if (ghost.x > map[0].length) ghost.x = -1;
            });
        }

        // Eat pellets
        const playerGridX = Math.round(game.player.x);
        const playerGridY = Math.round(game.player.y);
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
            const dx = game.player.x - ghost.x;
            const dy = game.player.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 1) {
                if (game.isFrightened > 0) {
                    ghost.x = 13.5;
                    ghost.y = 14;
                    ghost.isInBox = true;
                    game.score += 200;
                    setScore(() => game.score);
                } else {
                    game.player.lives--;
                    if(game.player.lives <= 0) {
                       onGameOver(game.score);
                    } else {
                       game.player.x = 14; game.player.y = 23;
                       game.player.dx = 0; game.player.dy = 0;
                       game.player.nextDx = 0; game.player.nextDy = 0;
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
            const size = p.isPowerPellet ? GRID_SIZE / 3 : GRID_SIZE / 6;
            ctx.beginPath();
            ctx.arc(p.x * GRID_SIZE + GRID_SIZE / 2, p.y * GRID_SIZE + GRID_SIZE / 2, size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw player
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        const playerAngle = game.player.dx === 1 ? 0 : game.player.dx === -1 ? Math.PI : game.player.dy === 1 ? Math.PI/2 : -Math.PI/2;
        const mouthAngle = game.frameCount % 20 < 10 ? 0.2 : 0;
        ctx.arc(game.player.x * GRID_SIZE + GRID_SIZE/2, game.player.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 - 2, playerAngle + mouthAngle * Math.PI, playerAngle - mouthAngle * Math.PI);
        ctx.lineTo(game.player.x * GRID_SIZE + GRID_SIZE/2, game.player.y * GRID_SIZE + GRID_SIZE/2);
        ctx.fill();

        // Draw ghosts
        game.ghosts.forEach(g => {
            ctx.fillStyle = game.isFrightened > 0 ? (game.isFrightened < 100 && game.isFrightened % 20 > 10 ? 'white' : 'blue') : g.color;
            ctx.beginPath();
            ctx.arc(g.x * GRID_SIZE + GRID_SIZE / 2, g.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE/2 - 1, Math.PI, 0);
            ctx.lineTo(g.x * GRID_SIZE + GRID_SIZE - 1, g.y * GRID_SIZE + GRID_SIZE);
            ctx.lineTo(g.x * GRID_SIZE + 1, g.y * GRID_SIZE + GRID_SIZE);
            ctx.fill();
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

    