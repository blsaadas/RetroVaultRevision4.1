'use client';

import { useState, useCallback } from 'react';
import type { Game } from '@/lib/types';
import { useGameState } from '@/hooks/use-game-state';
import { AdaptiveDifficultyTool } from './adaptive-difficulty-tool';
import { Award, RotateCw, Trophy } from 'lucide-react';
import { Button } from './ui/button';

interface GameContainerProps {
  game: Game;
  GameComponent: React.ComponentType<any>;
}

export function GameContainer({ game, GameComponent }: GameContainerProps) {
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameKey, setGameKey] = useState(Date.now());
  const { highScore, setHighScore, addToPlayHistory } = useGameState(game.slug);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    setIsGameOver(true);
    addToPlayHistory(game.title);
  }, [highScore, setHighScore, addToPlayHistory, game.title]);

  const handleRestart = () => {
    setScore(0);
    setIsGameOver(false);
    setGameKey(Date.now());
  };

  return (
    <div className="relative aspect-video bg-neutral-900 rounded-lg shadow-2xl overflow-hidden border-4 border-card">
      <div className="absolute top-2 left-4 z-10 flex items-center gap-4 text-white font-bold text-shadow">
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-md">
          <Award className="h-5 w-5 text-yellow-400" />
          <span>Score: {score}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-md">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>High Score: {highScore}</span>
        </div>
      </div>

      <GameComponent
        key={gameKey}
        setScore={setScore}
        onGameOver={handleGameOver}
        isGameOver={isGameOver}
      />

      {isGameOver && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <h2 className="font-headline text-5xl font-bold text-white mb-2">Game Over</h2>
          <p className="text-xl text-white mb-6">Your score: {score}</p>
          <div className="flex gap-4">
            <Button onClick={handleRestart} variant="secondary">
              <RotateCw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <AdaptiveDifficultyTool 
                gameName={game.title}
                playerScore={score}
            />
          </div>
        </div>
      )}
    </div>
  );
}
