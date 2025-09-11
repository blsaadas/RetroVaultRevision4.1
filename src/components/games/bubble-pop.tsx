
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const BUBBLE_RADIUS = 15;
const ROWS = 10;
const COLS = 18;
const BUBBLE_COLORS = ['#ef4444', '#f97316', '#4ade80', '#3b82f6', '#8b5cf6'];

type Bubble = { x: number; y: number; color: string; isStatic: boolean, vx: number, vy: number };

interface BubblePopGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function BubblePopGame({ setScore, onGameOver, isGameOver }: BubblePopGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [currentBubble, setCurrentBubble] = useState<Bubble | null>(null);

  const initGame = useCallback(() => {
    let newBubbles: Bubble[] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < COLS - (r % 2); c++) {
        newBubbles.push({
          x: c * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS + (r % 2) * BUBBLE_RADIUS,
          y: r * (BUBBLE_RADIUS * 2 * 0.866) + BUBBLE_RADIUS,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          isStatic: true,
          vx: 0,
          vy: 0,
        });
      }
    }
    setBubbles(newBubbles);
    setCurrentBubble({
        x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - BUBBLE_RADIUS,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        isStatic: false, vx: 0, vy: 0
    });
    setScore(() => 0);
  }, [setScore]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const shootBubble = useCallback((e: MouseEvent) => {
    if (isGameOver || !currentBubble || !currentBubble.isStatic) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const angle = Math.atan2((e.clientY - rect.top) - currentBubble.y, (e.clientX - rect.left) - currentBubble.x);
    
    let newBubble = { ...currentBubble, isStatic: false, vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8 };
    setBubbles(prev => [...prev, newBubble]);
    setCurrentBubble(null);
    
    setTimeout(() => {
        setCurrentBubble({
            x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - BUBBLE_RADIUS,
            color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
            isStatic: true, vx: 0, vy: 0
        });
    }, 500);
  }, [currentBubble, isGameOver]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener('click', shootBubble);
    return () => canvas.removeEventListener('click', shootBubble);
  }, [shootBubble]);
  
  const gameLoop = useCallback(() => {
      if(isGameOver) return;
      setBubbles(prevBubbles => {
        let newBubbles = prevBubbles.map(b => ({...b}));
        
        newBubbles.filter(b => !b.isStatic).forEach(bubble => {
            bubble.x += bubble.vx;
            bubble.y += bubble.vy;

            // Wall collision
            if(bubble.x < BUBBLE_RADIUS || bubble.x > CANVAS_WIDTH - BUBBLE_RADIUS) bubble.vx *= -1;
            
            // Top collision -> becomes static
            if(bubble.y < BUBBLE_RADIUS) bubble.isStatic = true;
            
            // Bubble collision
            newBubbles.filter(b => b.isStatic).forEach(staticBubble => {
                const dist = Math.hypot(bubble.x - staticBubble.x, bubble.y - staticBubble.y);
                if (dist < BUBBLE_RADIUS * 2) {
                    bubble.isStatic = true;
                }
            });
        });
        
        return newBubbles;
      });
      requestAnimationFrame(gameLoop);
  }, [isGameOver]);

  useEffect(() => {
    const frame = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frame);
  }, [gameLoop]);


  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#0c1427';
    ctx.fillRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
    
    bubbles.forEach(bubble => {
        ctx.fillStyle = bubble.color;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    });

    if (currentBubble) {
         ctx.fillStyle = currentBubble.color;
        ctx.beginPath();
        ctx.arc(currentBubble.x, currentBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
    }

  }, [bubbles, currentBubble]);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain cursor-pointer" />;
}
