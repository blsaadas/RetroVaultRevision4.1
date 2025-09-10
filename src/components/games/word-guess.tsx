
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const words = [
    "react", "nextjs", "tailwind", "genkit", "firebase", 
    "retro", "vault", "arcade", "puzzle", "classic"
];

const MAX_GUESSES = 6;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;


interface WordGuessGameProps {
  setScore: (score: (prev: number) => number) => void;
  onGameOver: (finalScore: number) => void;
  isGameOver: boolean;
}

export default function WordGuessGame({ setScore, onGameOver, isGameOver }: WordGuessGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);

  const initGame = useCallback(() => {
    setWord(words[Math.floor(Math.random() * words.length)]);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setScore(() => 0);
  }, [setScore]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const checkWinOrLose = useCallback(() => {
      if(isGameOver || !word) return;
      
      const wordSet = new Set(word.split(''));
      const guessedSet = new Set(guessedLetters);
      const correctGuesses = [...wordSet].filter(letter => guessedSet.has(letter));

      if (correctGuesses.length === wordSet.size) {
        const score = (MAX_GUESSES - wrongGuesses) * 10;
        setScore(() => score);
        onGameOver(score);
      } else if (wrongGuesses >= MAX_GUESSES) {
        onGameOver(0);
      }
  }, [word, guessedLetters, wrongGuesses, onGameOver, setScore, isGameOver]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver || !/^[a-zA-Z]$/.test(e.key)) return;

      const letter = e.key.toLowerCase();
      if (!guessedLetters.includes(letter)) {
        setGuessedLetters(prev => [...prev, letter]);
        if (!word.includes(letter)) {
          setWrongGuesses(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, word, guessedLetters]);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw hangman
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 4;
    
    // Base
    if(wrongGuesses > 0) { ctx.beginPath(); ctx.moveTo(50, 350); ctx.lineTo(150, 350); ctx.stroke(); }
    // Post
    if(wrongGuesses > 1) { ctx.beginPath(); ctx.moveTo(100, 350); ctx.lineTo(100, 50); ctx.stroke(); }
    // Beam
    if(wrongGuesses > 2) { ctx.beginPath(); ctx.moveTo(100, 50); ctx.lineTo(250, 50); ctx.stroke(); }
    // Rope
    if(wrongGuesses > 3) { ctx.beginPath(); ctx.moveTo(250, 50); ctx.lineTo(250, 100); ctx.stroke(); }
    // Head
    if(wrongGuesses > 4) { ctx.beginPath(); ctx.arc(250, 125, 25, 0, Math.PI * 2); ctx.stroke(); }
    // Body, arms, legs
    if(wrongGuesses > 5) { 
        ctx.beginPath(); ctx.moveTo(250, 150); ctx.lineTo(250, 250); ctx.stroke(); // Body
        ctx.beginPath(); ctx.moveTo(250, 170); ctx.lineTo(200, 220); ctx.stroke(); // Left arm
        ctx.beginPath(); ctx.moveTo(250, 170); ctx.lineTo(300, 220); ctx.stroke(); // Right arm
        ctx.beginPath(); ctx.moveTo(250, 250); ctx.lineTo(200, 300); ctx.stroke(); // Left leg
        ctx.beginPath(); ctx.moveTo(250, 250); ctx.lineTo(300, 300); ctx.stroke(); // Right leg
    }


    // Draw word
    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.font = '48px "Space Grotesk"';
    ctx.textAlign = 'center';
    let displayWord = word.split('').map(letter => (guessedLetters.includes(letter) || isGameOver ? letter : '_')).join(' ');
    ctx.fillText(displayWord, CANVAS_WIDTH / 2 + 100, 300);
    
    // Draw guessed letters
    ctx.font = '24px "Inter"';
    ctx.textAlign = 'center';
    ctx.fillText(`Guessed: ${guessedLetters.join(', ')}`,  CANVAS_WIDTH / 2 + 100, 350);
    
    checkWinOrLose();

  }, [word, guessedLetters, wrongGuesses, checkWinOrLose, isGameOver]);

  useEffect(() => {
    draw();
  }, [draw, guessedLetters]);


  return <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" />;
}

