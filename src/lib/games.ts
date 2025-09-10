import type { Game } from "./types";

export const games: Game[] = [
  {
    slug: "snake-classic",
    title: "Snake Classic",
    description: "The timeless classic. Guide the snake to eat the food, but don't hit the walls or yourself!",
    category: "Arcade",
    image: "https://picsum.photos/seed/snake/600/400",
    imageHint: "snake game"
  },
  {
    slug: "tetro-fall",
    title: "Tetro Fall",
    description: "A challenging puzzle game where you must fit falling blocks together to clear lines.",
    category: "Puzzle",
    image: "https://picsum.photos/seed/tetris/600/400",
    imageHint: "tetris blocks"
  },
  {
    slug: "brick-buster",
    title: "Brick Buster",
    description: "An action-packed arcade game. Use the paddle to break all the bricks with the ball.",
    category: "Action",
    image: "https://picsum.photos/seed/breakout/600/400",
    imageHint: "arcade game"
  },
];

export const allGameSlugs = games.map(game => game.slug);
