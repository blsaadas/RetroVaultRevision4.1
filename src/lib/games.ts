
import type { Game } from "./types";

export const games: Game[] = [
  {
    slug: "snake-classic",
    title: "Snake Classic",
    description: "The timeless classic. Guide the snake to eat the food, but don't hit the walls or yourself!",
    category: "Arcade",
    image: "https://picsum.photos/seed/snake/600/400",
    imageHint: "glowing snake"
  },
  {
    slug: "tetro-fall",
    title: "Tetro Fall",
    description: "A challenging puzzle game where you must fit falling blocks together to clear lines.",
    category: "Puzzle",
    image: "https://picsum.photos/seed/tetris/600/400",
    imageHint: "colorful blocks"
  },
  {
    slug: "brick-buster",
    title: "Brick Buster",
    description: "An action-packed arcade game. Use the paddle to break all the bricks with the ball.",
    category: "Action",
    image: "https://picsum.photos/seed/breakout/600/400",
    imageHint: "arcade game"
  },
  {
    slug: "galaxy-patrol",
    title: "Galaxy Patrol",
    description: "Defend the galaxy from waves of alien invaders in this classic shooter.",
    category: "Arcade",
    image: "https://picsum.photos/seed/invaders/600/400",
    imageHint: "pixel alien"
  },
  {
    slug: "maze-muncher",
    title: "Maze Muncher",
    description: "Navigate a maze, eat all the dots, and avoid the ghosts in this arcade favorite.",
    category: "Arcade",
    image: "https://picsum.photos/seed/pacman/600/400",
    imageHint: "ghost character"
  },
  {
    slug: "asteroid-field",
    title: "Asteroid Field",
    description: "Pilot your spaceship through a dangerous asteroid field, blasting rocks and UFOs.",
    category: "Action",
    image: "https://picsum.photos/seed/asteroids/600/400",
    imageHint: "spaceship asteroids"
  },
  {
    slug: "frog-hopper",
    title: "Frog Hopper",
    description: "Help a frog cross a busy road and a dangerous river to reach its home.",
    category: "Action",
    image: "https://picsum.photos/seed/frogger/600/400",
    imageHint: "frog street"
  },
  {
    slug: "2048",
    title: "2048",
    description: "Slide numbered tiles to combine them and create a tile with the number 2048.",
    category: "Puzzle",
    image: "https://picsum.photos/seed/2048/600/400",
    imageHint: "number blocks"
  },
  {
    slug: "minefield",
    title: "Minefield",
    description: "A classic game of logic and deduction. Clear the board without detonating any mines.",
    category: "Puzzle",
    image: "https://picsum.photos/seed/minesweeper/600/400",
    imageHint: "warning sign"
  },
  {
    slug: "word-guess",
    title: "Word Guess",
    description: "Guess the hidden word before you run out of attempts. A classic word puzzle.",
    category: "Puzzle",
    image: "https://picsum.photos/seed/hangman/600/400",
    imageHint: "letter blocks"
  },
  {
    slug: "four-in-a-row",
    title: "Four in a Row",
    description: "A classic strategy game. Be the first to connect four of your colored discs in a row.",
    category: "Puzzle",
    image: "https://picsum.photos/seed/connectfour/600/400",
    imageHint: "colored discs"
  }
];

export const allGameSlugs = games.map(game => game.slug);
