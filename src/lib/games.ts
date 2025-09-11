
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
  },
  {
    slug: "cube-runner",
    title: "Cube Runner",
    description: "Navigate a high-speed field of cubes. How long can you survive?",
    category: "Modern",
    image: "https://picsum.photos/seed/cuberunner/600/400",
    imageHint: "3d cubes"
  },
  {
    slug: "flappy-jetpack",
    title: "Flappy Jetpack",
    description: "Tap to fly your jetpack through a series of challenging pipes.",
    category: "Modern",
    image: "https://picsum.photos/seed/flappy/600/400",
    imageHint: "jetpack character"
  },
  {
    slug: "stack-tower",
    title: "Stack Tower",
    description: "Time your taps to stack blocks as high as you can. Precision is key!",
    category: "Modern",
    image: "https://picsum.photos/seed/stacker/600/400",
    imageHint: "block tower"
  },
  {
    slug: "doodle-ascend",
    title: "Doodle Ascend",
    description: "Jump your way up an endless series of platforms. Don't fall!",
    category: "Modern",
    image: "https://picsum.photos/seed/doodle/600/400",
    imageHint: "character jumping"
  },
  {
    slug: "geo-dash",
    title: "Geo-Dash",
    description: "A fast-paced rhythm-based platformer. Jump over obstacles in sync with the beat.",
    category: "Modern",
    image: "https://picsum.photos/seed/geodash/600/400",
    imageHint: "geometric shapes"
  },
  {
    slug: "sky-dodge",
    title: "Sky Dodge",
    description: "Control your character and dodge the objects falling from the sky.",
    category: "Modern",
    image: "https://picsum.photos/seed/skydodge/600/400",
    imageHint: "falling objects"
  },
  {
    slug: "clicker-mania",
    title: "Clicker Mania",
    description: "An incremental game where every click brings you closer to victory. Can you reach a billion?",
    category: "Modern",
    image: "https://picsum.photos/seed/clicker/600/400",
    imageHint: "mouse cursor"
  },
  {
    slug: "gem-match",
    title: "Gem Match",
    description: "Swap colorful gems to make matches of three or more. A dazzling puzzle challenge.",
    category: "Modern",
    image: "https://picsum.photos/seed/gemmatch/600/400",
    imageHint: "colorful gems"
  },
  {
    slug: "bubble-pop",
    title: "Bubble Pop",
    description: "Shoot and match colored bubbles to clear the board in this addictive puzzle game.",
    category: "Modern",
    image: "https://picsum.photos/seed/bubblepop/600/400",
    imageHint: "colored bubbles"
  },
  {
    slug: "endless-road",
    title: "Endless Road",
    description: "Steer your car down an endless road, avoiding traffic and collecting coins.",
    category: "Modern",
    image: "https://picsum.photos/seed/road/600/400",
    imageHint: "car road"
  }
];

export const allGameSlugs = games.map(game => game.slug);
