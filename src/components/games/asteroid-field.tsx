'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const SHIP_SIZE = 20;
const TURN_SPEED = 360; // degrees per second
const THRUST = 5; // pixels per second per second
const FRICTION = 0.7;
const BULLET_SPEED = 500; // pixels per second
const ASTEROID_NUM = 3;
const ASTEROID_SPEED = 1;
const ASTEROID_SIZE = 60;

interface AsteroidFieldGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function AsteroidFieldGame({ setScore, onGameOver, isGameOver }: AsteroidFieldGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameState = useRef({
        ship: {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            r: SHIP_SIZE / 2,
            a: 90 / 180 * Math.PI, // angle
            rot: 0,
            thrusting: false,
            thrust: { x: 0, y: 0 }
        },
        bullets: [] as { x: number, y: number, dx: number, dy: number, life: number }[],
        asteroids: [] as { x: number, y: number, xv: number, yv: number, r: number }[],
        score: 0,
        keys: {} as { [key: string]: boolean },
        animationFrameId: 0,
    });

    const newAsteroid = useCallback((x: number, y: number, r: number) => {
        const roid = {
            x,
            y,
            xv: Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1),
            r
        };
        return roid;
    }, []);

    const createAsteroidBelt = useCallback(() => {
        const game = gameState.current;
        game.asteroids = [];
        for (let i = 0; i < ASTEROID_NUM; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * CANVAS_WIDTH);
                y = Math.floor(Math.random() * CANVAS_HEIGHT);
            } while (Math.sqrt(Math.pow(x - game.ship.x, 2) + Math.pow(y - game.ship.y, 2)) < ASTEROID_SIZE * 2 + game.ship.r);
            game.asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)));
        }
    }, [newAsteroid]);

    useEffect(() => {
        createAsteroidBelt();
        
        const handleKeyDown = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { gameState.current.keys[e.key.toLowerCase()] = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(gameState.current.animationFrameId);
        };
    }, [createAsteroidBelt]);


    const gameLoop = useCallback(() => {
        if (isGameOver) {
            cancelAnimationFrame(gameState.current.animationFrameId);
            return;
        }

        const game = gameState.current;
        const ship = game.ship;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        
        // Handle user input
        ship.thrusting = (game.keys['w'] || game.keys['arrowup']);
        if (game.keys['a'] || game.keys['arrowleft']) ship.rot = TURN_SPEED / 180 * Math.PI / 60;
        else if (game.keys['d'] || game.keys['arrowright']) ship.rot = -TURN_SPEED / 180 * Math.PI / 60;
        else ship.rot = 0;

        if (game.keys[' '] && game.bullets.length < 5) {
            const bullet = {
                x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                dx: BULLET_SPEED / 60 * Math.cos(ship.a),
                dy: -BULLET_SPEED / 60 * Math.sin(ship.a),
                life: 1,
            };
            game.bullets.push(bullet);
            game.keys[' '] = false;
        }


        // Start drawing
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Move ship
        ship.a += ship.rot;
        if (ship.thrusting) {
            ship.thrust.x += THRUST * Math.cos(ship.a) / 60;
            ship.thrust.y -= THRUST * Math.sin(ship.a) / 60;
        } else {
            ship.thrust.x *= FRICTION;
            ship.thrust.y *= FRICTION;
        }
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;

        // Handle wrapping for ship
        if (ship.x < 0 - ship.r) ship.x = CANVAS_WIDTH + ship.r;
        else if (ship.x > CANVAS_WIDTH + ship.r) ship.x = 0 - ship.r;
        if (ship.y < 0 - ship.r) ship.y = CANVAS_HEIGHT + ship.r;
        else if (ship.y > CANVAS_HEIGHT + ship.r) ship.y = 0 - ship.r;


        // Draw ship
        ctx.strokeStyle = 'hsl(var(--primary))';
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();
        ctx.moveTo(
            ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
        );
        ctx.lineTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
        );
        ctx.lineTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.stroke();

        // Draw bullets
        ctx.fillStyle = 'hsl(var(--accent))';
        game.bullets.forEach((bullet, i) => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            bullet.life += 1;
            if(bullet.life > 60) game.bullets.splice(i, 1);
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        });


        // Draw asteroids and handle collisions
        ctx.strokeStyle = '#a1a1aa'; // neutral-400
        ctx.lineWidth = SHIP_SIZE / 20;
        game.asteroids.forEach((roid, i) => {
            roid.x += roid.xv;
            roid.y += roid.yv;

            // Wrapping
            if (roid.x < 0 - roid.r) roid.x = CANVAS_WIDTH + roid.r;
            else if (roid.x > CANVAS_WIDTH + roid.r) roid.x = 0 - roid.r;
            if (roid.y < 0 - roid.r) roid.y = CANVAS_HEIGHT + roid.r;
            else if (roid.y > CANVAS_HEIGHT + roid.r) roid.y = 0 - roid.r;

            // Draw
            ctx.beginPath();
            ctx.arc(roid.x, roid.y, roid.r, 0, Math.PI * 2, false);
            ctx.stroke();
            
            // Ship collision
            if(Math.sqrt(Math.pow(ship.x - roid.x, 2) + Math.pow(ship.y - roid.y, 2)) < ship.r + roid.r){
                onGameOver(game.score);
            }

            // Bullet collision
            game.bullets.forEach((bullet, j) => {
                if (Math.sqrt(Math.pow(bullet.x - roid.x, 2) + Math.pow(bullet.y - roid.y, 2)) < roid.r) {
                    game.bullets.splice(j, 1);

                    // Split asteroid
                    if (roid.r > ASTEROID_SIZE / 4) {
                        game.asteroids.push(newAsteroid(roid.x, roid.y, Math.ceil(roid.r / 2)));
                        game.asteroids.push(newAsteroid(roid.x, roid.y, Math.ceil(roid.r / 2)));
                        game.score += 20;
                    } else {
                        game.score += 50;
                    }
                    game.asteroids.splice(i, 1);
                    setScore(() => game.score);

                    if(game.asteroids.length === 0){
                        // Win condition (or next level)
                        onGameOver(game.score + 1000);
                    }
                }
            });
        });

        game.animationFrameId = requestAnimationFrame(gameLoop);
    }, [isGameOver, onGameOver, setScore, newAsteroid]);

    useEffect(() => {
        gameState.current.animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(gameState.current.animationFrameId);
    }, [gameLoop]);

    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
