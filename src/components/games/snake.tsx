'use client';

import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

const initialSnake = [{ x: 10, y: 10 }];
const initialFood = { x: 15, y: 15 };

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface SnakeGameProps {
  setScore: (score: number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function SnakeGame({ setScore, onGameOver, isGameOver }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState(initialFood);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [speed, setSpeed] = useState(200);

  // Game loop
  useEffect(() => {
    if (isGameOver) return;

    const gameInterval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(gameInterval);
  }, [snake, isGameOver, speed]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#18181b'; // dark background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw snake
    ctx.fillStyle = '#4ade80'; // green
    snake.forEach(segment => ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE));
    
    // Draw head
    ctx.fillStyle = '#86efac'; // lighter green
    ctx.fillRect(snake[0].x * GRID_SIZE, snake[0].y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

    // Draw food
    ctx.fillStyle = '#f87171'; // red
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  }, [snake, food]);

  const generateFood = (currentSnake: typeof snake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };
  
  const moveSnake = () => {
    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP': head.y -= 1; break;
      case 'DOWN': head.y += 1; break;
      case 'LEFT': head.x -= 1; break;
      case 'RIGHT': head.x += 1; break;
    }

    // Wall collision
    if (head.x < 0 || head.x * GRID_SIZE >= CANVAS_WIDTH || head.y < 0 || head.y * GRID_SIZE >= CANVAS_HEIGHT) {
      onGameOver(snake.length - 1);
      return;
    }

    // Self collision
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      onGameOver(snake.length - 1);
      return;
    }

    newSnake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(snake.length);
      setFood(generateFood(newSnake));
      setSpeed(prev => Math.max(50, prev * 0.95)); // Increase speed
    } else {
      newSnake.pop();
    }
    
    setSnake(newSnake);
  };

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}
