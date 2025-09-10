'use client';

import { useEffect, useRef } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

// Paddle
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const PADDLE_MARGIN_BOTTOM = 30;

// Ball
const BALL_RADIUS = 8;

// Bricks
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

interface BreakoutGameProps {
  setScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function BreakoutGame({ setScore, onGameOver, isGameOver }: BreakoutGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstance = useRef({
    paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - PADDLE_MARGIN_BOTTOM - BALL_RADIUS,
    ballDX: 3,
    ballDY: -3,
    bricks: [] as { x: number; y: number; status: number }[][],
    score: 0,
    animationFrameId: 0,
    rightPressed: false,
    leftPressed: false,
  });

  useEffect(() => {
    const game = gameInstance.current;
    
    // Initialize bricks
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      game.bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        game.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    const keyDownHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        game.rightPressed = true;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        game.leftPressed = true;
      }
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.key === 'Right' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        game.rightPressed = false;
      } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        game.leftPressed = false;
      }
    };
    const mouseMoveHandler = (e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const relativeX = e.clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.offsetWidth) {
            const scale = canvas.width / canvas.offsetWidth;
            const newPaddleX = relativeX * scale - PADDLE_WIDTH / 2;
            if (newPaddleX > 0 && newPaddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
              game.paddleX = newPaddleX;
            }
        }
    }

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      document.removeEventListener('mousemove', mouseMoveHandler);
      cancelAnimationFrame(game.animationFrameId);
    };
  }, []);

  useEffect(() => {
    if (isGameOver) {
      cancelAnimationFrame(gameInstance.current.animationFrameId);
      return;
    }
    
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const game = gameInstance.current;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Background
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw elements
      drawBricks(ctx, game);
      drawBall(ctx, game);
      drawPaddle(ctx, game);
      collisionDetection(game);

      // Ball movement
      game.ballX += game.ballDX;
      game.ballY += game.ballDY;

      // Wall collision (left/right)
      if (game.ballX + game.ballDX > CANVAS_WIDTH - BALL_RADIUS || game.ballX + game.ballDX < BALL_RADIUS) {
        game.ballDX = -game.ballDX;
      }

      // Wall collision (top)
      if (game.ballY + game.ballDY < BALL_RADIUS) {
        game.ballDY = -game.ballDY;
      } else if (game.ballY + game.ballDY > CANVAS_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT + 5) {
          if (game.ballX > game.paddleX && game.ballX < game.paddleX + PADDLE_WIDTH) {
              game.ballDY = -game.ballDY;
              let collidePoint = game.ballX - (game.paddleX + PADDLE_WIDTH/2);
              collidePoint = collidePoint / (PADDLE_WIDTH/2);
              game.ballDX = collidePoint * 5;

          } else if (game.ballY + game.ballDY > CANVAS_HEIGHT - BALL_RADIUS) {
              onGameOver(game.score);
              return;
          }
      }

      // Paddle movement
      if (game.rightPressed && game.paddleX < CANVAS_WIDTH - PADDLE_WIDTH) {
        game.paddleX += 7;
      } else if (game.leftPressed && game.paddleX > 0) {
        game.paddleX -= 7;
      }
      
      game.animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(gameInstance.current.animationFrameId);
  }, [isGameOver, onGameOver, setScore]);

  const drawPaddle = (ctx: CanvasRenderingContext2D, game: typeof gameInstance.current) => {
    ctx.beginPath();
    ctx.rect(game.paddleX, CANVAS_HEIGHT - PADDLE_HEIGHT - (PADDLE_MARGIN_BOTTOM - 20), PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.fill();
    ctx.closePath();
  };

  const drawBall = (ctx: CanvasRenderingContext2D, game: typeof gameInstance.current) => {
    ctx.beginPath();
    ctx.arc(game.ballX, game.ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'hsl(var(--accent))';
    ctx.fill();
    ctx.closePath();
  };
  
  const brickColors = ['#f87171', '#fb923c', '#facc15', '#a3e635', '#4ade80'];

  const drawBricks = (ctx: CanvasRenderingContext2D, game: typeof gameInstance.current) => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        if (game.bricks[c][r].status === 1) {
          const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
          const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
          game.bricks[c][r].x = brickX;
          game.bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
          ctx.fillStyle = brickColors[r % brickColors.length];
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const collisionDetection = (game: typeof gameInstance.current) => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = game.bricks[c][r];
        if (b.status === 1) {
          if (
            game.ballX > b.x &&
            game.ballX < b.x + BRICK_WIDTH &&
            game.ballY > b.y &&
            game.ballY < b.y + BRICK_HEIGHT
          ) {
            game.ballDY = -game.ballDY;
            b.status = 0;
            game.score++;
            setScore(game.score);

            if (game.score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT) {
                onGameOver(game.score); // Win condition
            }
          }
        }
      }
    }
  };


  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
