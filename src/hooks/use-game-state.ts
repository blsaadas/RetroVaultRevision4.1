'use client';

import { useState, useEffect, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export function useGameState(gameSlug: string) {
  const [highScore, setHighScore] = useLocalStorage<number>(`retrovault_highscore_${gameSlug}`, 0);
  const [playHistory, setPlayHistory] = useLocalStorage<string[]>('retrovault_play_history', []);

  const addToPlayHistory = useCallback((gameTitle: string) => {
    // Add to history only if it's not the last game played
    if (playHistory[playHistory.length - 1] !== gameTitle) {
      const newHistory = [...playHistory, gameTitle].slice(-10); // Keep last 10 games
      setPlayHistory(newHistory);
    }
  }, [playHistory, setPlayHistory]);

  return { highScore, setHighScore, playHistory, addToPlayHistory };
}
