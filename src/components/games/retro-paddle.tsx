'use client';

import { useEffect, useRef, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const WINNING_SCORE = 10;


interface RetroPaddleGameProps {
  setScore: (score: (prevScore: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function RetroPaddleGame({ setScore, onGameOver, isGameOver }: RetroPaddleGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameState = useRef({
        ballX: CANVAS_WIDTH / 2,
        ballY: CANVAS_HEIGHT / 2,
        ballSpeedX: 5,
        ballSpeedY: 5,
        player1Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        player2Y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        player1Score: 0,
        player2Score: 0,
    });
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const animationFrameId = useRef<number>(0);

    const ballReset = () => {
        const game = gameState.current;
        game.ballX = CANVAS_WIDTH / 2;
        game.ballY = CANVAS_HEIGHT / 2;
        game.ballSpeedX = -game.ballSpeedX;
        game.ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
    };
    
    const gameLoop = useCallback(() => {
        if (isGameOver) {
            cancelAnimationFrame(animationFrameId.current);
            return;
        }

        const game = gameState.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;

        // Player 1 movement based on currently pressed keys
        if ((keysPressed.current['w'] || keysPressed.current['arrowup']) && game.player1Y > 0) {
            game.player1Y -= 8;
        }
        if ((keysPressed.current['s'] || keysPressed.current['arrowdown']) && game.player1Y < CANVAS_HEIGHT - PADDLE_HEIGHT) {
            game.player1Y += 8;
        }
        
        // AI player 2 movement
        const player2YCenter = game.player2Y + PADDLE_HEIGHT / 2;
        if (player2YCenter < game.ballY - 35) {
            game.player2Y += 6;
        } else if (player2YCenter > game.ballY + 35) {
            game.player2Y -= 6;
        }
        if (game.player2Y < 0) game.player2Y = 0;
        if (game.player2Y > CANVAS_HEIGHT - PADDLE_HEIGHT) game.player2Y = CANVAS_HEIGHT - PADDLE_HEIGHT;


        // Ball movement
        game.ballX += game.ballSpeedX;
        game.ballY += game.ballSpeedY;

        // Ball collision with top/bottom walls
        if (game.ballY < 0 + BALL_RADIUS || game.ballY > CANVAS_HEIGHT - BALL_RADIUS) {
            game.ballSpeedY = -game.ballSpeedY;
        }

        // Ball collision with paddles
        const paddle1Top = game.player1Y;
        const paddle1Bottom = game.player1Y + PADDLE_HEIGHT;
        const paddle2Top = game.player2Y;
        const paddle2Bottom = game.player2Y + PADDLE_HEIGHT;

        if (game.ballSpeedX < 0 && game.ballX - BALL_RADIUS < PADDLE_WIDTH && game.ballY > paddle1Top && game.ballY < paddle1Bottom) {
             game.ballSpeedX = -game.ballSpeedX;
             const deltaY = game.ballY - (paddle1Top + PADDLE_HEIGHT/2);
             game.ballSpeedY = deltaY * 0.35;
        }

        if (game.ballSpeedX > 0 && game.ballX + BALL_RADIUS > CANVAS_WIDTH - PADDLE_WIDTH && game.ballY > paddle2Top && game.ballY < paddle2Bottom) {
             game.ballSpeedX = -game.ballSpeedX;
             const deltaY = game.ballY - (paddle2Top + PADDLE_HEIGHT/2);
             game.ballSpeedY = deltaY * 0.35;
        }

        // Scoring
        if (game.ballX < 0) {
            game.player2Score++;
            ballReset();
        } else if (game.ballX > CANVAS_WIDTH) {
            game.player1Score++;
            setScore(() => game.player1Score);
            ballReset();
        }

        // Check for win condition
        if (!isGameOver && (game.player1Score >= WINNING_SCORE || game.player2Score >= WINNING_SCORE)) {
            onGameOver(game.player1Score);
        }

        // Drawing
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'hsl(var(--foreground))';
        // Player 1 paddle
        ctx.fillRect(0, game.player1Y, PADDLE_WIDTH, PADDLE_HEIGHT);
        // Player 2 paddle
        ctx.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, game.player2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
        // Ball
        ctx.beginPath();
        ctx.arc(game.ballX, game.ballY, BALL_RADIUS, 0, Math.PI*2);
        ctx.fill();
        
        // Center line
        ctx.strokeStyle = 'hsl(var(--muted))'
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.stroke();

        // Scores
        ctx.font = '48px "Space Grotesk"';
        ctx.fillText(String(game.player1Score), CANVAS_WIDTH/2 - 70, 50);
        ctx.fillText(String(game.player2Score), CANVAS_WIDTH/2 + 50, 50);

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [isGameOver, setScore, onGameOver]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key.toLowerCase()] = false; };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        animationFrameId.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId.current);
            keysPressed.current = {};
        };
    }, [gameLoop]);


    return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
