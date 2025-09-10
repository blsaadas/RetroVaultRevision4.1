import type { Game } from "./types";

export const games: Game[] = [
  {
    slug: "snake-classic",
    title: "Snake Classic",
    description: "The timeless classic. Guide the snake to eat the food, but don't hit the walls or yourself!",
    category: "Arcade",
    image: "https://images.unsplash.com/photo-1611117775539-386d5f001915?q=80&w=600&h=400&fit=crop",
    imageHint: "snake game"
  },
  {
    slug: "tetro-fall",
    title: "Tetro Fall",
    description: "A challenging puzzle game where you must fit falling blocks together to clear lines.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1574545233224-c0526a70713e?q=80&w=600&h=400&fit=crop",
    imageHint: "tetris blocks"
  },
  {
    slug: "brick-buster",
    title: "Brick Buster",
    description: "An action-packed arcade game. Use the paddle to break all the bricks with the ball.",
    category: "Action",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&h=400&fit=crop",
    imageHint: "arcade game"
  },
  {
    slug: "galaxy-patrol",
    title: "Galaxy Patrol",
    description: "Defend the galaxy from waves of alien invaders in this classic shooter.",
    category: "Arcade",
    image: "https://images.unsplash.com/photo-1610296669228-602fa8270111?q=80&w=600&h=400&fit=crop",
    imageHint: "space invaders"
  },
  {
    slug: "maze-muncher",
    title: "Maze Muncher",
    description: "Navigate a maze, eat all the dots, and avoid the ghosts in this arcade favorite.",
    category: "Arcade",
    image: "https://images.unsplash.com/photo-1528359509353-2d4239564b67?q=80&w=600&h=400&fit=crop",
    imageHint: "maze game"
  },
  {
    slug: "asteroid-field",
    title: "Asteroid Field",
    description: "Pilot your spaceship through a dangerous asteroid field, blasting rocks and UFOs.",
    category: "Action",
    image: "https://images.unsplash.com/photo-1538313638217-52646d65516a?q=80&w=600&h=400&fit=crop",
    imageHint: "spaceship asteroids"
  },
  {
    slug: "frog-hopper",
    title: "Frog Hopper",
    description: "Help a frog cross a busy road and a dangerous river to reach its home.",
    category: "Action",
    image: "https://images.unsplash.com/photo-1578509322235-3162a83f7732?q=80&w=600&h=400&fit=crop",
    imageHint: "frog hopping"
  },
  {
    slug: "2048",
    title: "2048",
    description: "Slide numbered tiles to combine them and create a tile with the number 2048.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1551433994-d8f99a5ab342?q=80&w=600&h=400&fit=crop",
    imageHint: "number puzzle"
  },
  {
    slug: "minefield",
    title: "Minefield",
    description: "A classic game of logic and deduction. Clear the board without detonating any mines.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1599230231920-70404758795d?q=80&w=600&h=400&fit=crop",
    imageHint: "bomb grid"
  },
  {
    slug: "word-guess",
    title: "Word Guess",
    description: "Guess the hidden word before you run out of attempts. A classic word puzzle.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1455869757666-074d207b8676?q=80&w=600&h=400&fit=crop",
    imageHint: "word puzzle"
  },
  {
    slug: "four-in-a-row",
    title: "Four in a Row",
    description: "A classic strategy game. Be the first to connect four of your colored discs in a row.",
    category: "Puzzle",
    image: "https://images.unsplash.com/photo-1588628003920-551139e654c6?q=80&w=600&h=400&fit=crop",
    imageHint: "board game"
  }
];

export const allGameSlugs = games.map(game => game.slug);