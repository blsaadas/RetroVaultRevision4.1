
import type { Game } from "./types";

export const games: Game[] = [
  {
    slug: "snake-classic",
    title: "Snake Classic",
    description: "The timeless classic. Guide the snake to eat the food, but don't hit the walls or yourself!",
    category: "Arcade",
    image: "https://images.unsplash.com/photo-1585224320436-1c88a851147e?q=80&w=600&h=400&fit=crop",
    imageHint: "glowing snake"
  },
  {
    slug: "tetro-fall",
    title: "Tetro Fall",
    description: "A challenging puzzle game where you must fit falling blocks together to clear lines.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1557833513-3c24b54b1f4c?q=80&w=600&h=400&fit=crop",
    imageHint: "colorful blocks"
  },
  {
    slug: "brick-buster",
    title: "Brick Buster",
    description: "An action-packed arcade game. Use the paddle to break all the bricks with the ball.",
    category: "Action",
    image: "https://images.unsplash.com/photo-1549397225-835b0e5502a5?q=80&w=600&h=400&fit=crop",
    imageHint: "arcade game"
  },
  {
    slug: "galaxy-patrol",
    title: "Galaxy Patrol",
    description: "Defend the galaxy from waves of alien invaders in this classic shooter.",
    category: "Arcade",
    image: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=600&h=400&fit=crop",
    imageHint: "pixel alien"
  },
  {
    slug: "maze-muncher",
    title: "Maze Muncher",
    description: "Navigate a maze, eat all the dots, and avoid the ghosts in this arcade favorite.",
    category: "Arcade",
    image: "https://images.unsplash.com/photo-1531398595856-252c10015504?q=80&w=600&h=400&fit=crop",
    imageHint: "ghost character"
  },
  {
    slug: "asteroid-field",
    title: "Asteroid Field",
    description: "Pilot your spaceship through a dangerous asteroid field, blasting rocks and UFOs.",
    category: "Action",
    image: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=600&h=400&fit=crop",
    imageHint: "spaceship asteroids"
  },
  {
    slug: "frog-hopper",
    title: "Frog Hopper",
    description: "Help a frog cross a busy road and a dangerous river to reach its home.",
    category: "Action",
    image: "https://images.unsplash.com/photo-1496032849530-7deff979e3a3?q=80&w=600&h=400&fit=crop",
    imageHint: "frog street"
  },
  {
    slug: "2048",
    title: "2048",
    description: "Slide numbered tiles to combine them and create a tile with the number 2048.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1596496050827-8957c8795b28?q=80&w=600&h=400&fit=crop",
    imageHint: "number blocks"
  },
  {
    slug: "minefield",
    title: "Minefield",
    description: "A classic game of logic and deduction. Clear the board without detonating any mines.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1579208570335-3c10a331165f?q=80&w=600&h=400&fit=crop",
    imageHint: "warning sign"
  },
  {
    slug: "word-guess",
    title: "Word Guess",
    description: "Guess the hidden word before you run out of attempts. A classic word puzzle.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1501870195119-755954211e86?q=80&w=600&h=400&fit=crop",
    imageHint: "letter blocks"
  },
  {
    slug: "four-in-a-row",
    title: "Four in a Row",
    description: "A classic strategy game. Be the first to connect four of your colored discs in a row.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1613110037568-354398321035?q=80&w=600&h=400&fit=crop",
    imageHint: "colored discs"
  }
];

export const allGameSlugs = games.map(game => game.slug);
