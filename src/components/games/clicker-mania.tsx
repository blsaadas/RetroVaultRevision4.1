
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

interface ClickerManiaGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function ClickerManiaGame({ setScore, onGameOver, isGameOver }: ClickerManiaGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [localScore, setLocalScore] = useState(0);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [upgrades, setUpgrades] = useState({
      clickPower: { level: 1, cost: 10, baseCost: 10 },
      autoClicker: { level: 0, cost: 50, baseCost: 50 },
  });

  const resetGame = useCallback(() => {
    setLocalScore(0);
    setScore(() => 0);
    setClicksPerSecond(0);
    setUpgrades({
      clickPower: { level: 1, cost: 10, baseCost: 10 },
      autoClicker: { level: 0, cost: 50, baseCost: 50 },
    });
  }, [setScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleClick = () => {
    if (isGameOver) return;
    const newScore = localScore + upgrades.clickPower.level;
    setLocalScore(newScore);
    setScore(() => newScore);
  };
  
  const buyUpgrade = (upgradeKey: keyof typeof upgrades) => {
    const upgrade = upgrades[upgradeKey];
    if (localScore >= upgrade.cost) {
      setLocalScore(prev => prev - upgrade.cost);
      setUpgrades(prev => ({
        ...prev,
        [upgradeKey]: {
          ...upgrade,
          level: upgrade.level + 1,
          cost: Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level)),
        }
      }));
    }
  };

  useEffect(() => {
    const autoClickerInterval = setInterval(() => {
      const newScore = localScore + upgrades.autoClicker.level;
      setLocalScore(newScore);
      setScore(() => newScore);
    }, 1000);
    return () => clearInterval(autoClickerInterval);
  }, [localScore, upgrades.autoClicker.level, setScore]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Background
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Main Click Area (Cookie/Button)
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 80, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px "Space Grotesk"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Click Me!", CANVAS_WIDTH/2, CANVAS_HEIGHT/2);

    // Score Display
    ctx.fillStyle = 'white';
    ctx.font = '40px "Space Grotesk"';
    ctx.fillText(localScore.toLocaleString(), CANVAS_WIDTH/2, 50);
    ctx.font = '20px "Inter"';
    ctx.fillText(`${upgrades.autoClicker.level} per second`, CANVAS_WIDTH/2, 80);
    
    // Upgrades
    // Click Power
    ctx.fillStyle = localScore >= upgrades.clickPower.cost ? '#4ade80' : '#475569';
    ctx.fillRect(50, CANVAS_HEIGHT - 80, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px "Inter"';
    ctx.fillText(`Power: ${upgrades.clickPower.level}`, 150, CANVAS_HEIGHT - 60);
    ctx.font = '14px "Inter"';
    ctx.fillText(`Cost: ${upgrades.clickPower.cost}`, 150, CANVAS_HEIGHT - 40);

    // Auto Clicker
    ctx.fillStyle = localScore >= upgrades.autoClicker.cost ? '#4ade80' : '#475569';
    ctx.fillRect(CANVAS_WIDTH - 250, CANVAS_HEIGHT - 80, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px "Inter"';
    ctx.fillText(`Auto: ${upgrades.autoClicker.level}/s`, CANVAS_WIDTH - 150, CANVAS_HEIGHT - 60);
    ctx.font = '14px "Inter"';
    ctx.fillText(`Cost: ${upgrades.autoClicker.cost}`, CANVAS_WIDTH - 150, CANVAS_HEIGHT - 40);


  }, [localScore, upgrades, isGameOver]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Main button
    const dist = Math.sqrt(Math.pow(x - CANVAS_WIDTH / 2, 2) + Math.pow(y - CANVAS_HEIGHT / 2, 2));
    if (dist < 80) handleClick();

    // Upgrades
    if(y > CANVAS_HEIGHT - 80 && y < CANVAS_HEIGHT - 20) {
        if (x > 50 && x < 250) buyUpgrade('clickPower');
        if (x > CANVAS_WIDTH - 250 && x < CANVAS_WIDTH - 50) buyUpgrade('autoClicker');
    }
  };

  return <canvas ref={canvasRef} onClick={handleCanvasClick} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain cursor-pointer" />;
}
