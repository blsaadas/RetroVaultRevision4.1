
import { notFound } from 'next/navigation';
import { games, allGameSlugs } from '@/lib/games';
import { GameContainer } from '@/components/game-container';
import SnakeGame from '@/components/games/snake';
import TetrisGame from '@/components/games/tetris';
import BreakoutGame from '@/components/games/breakout';
import GalaxyPatrolGame from '@/components/games/galaxy-patrol';
import Game2048 from '@/components/games/2048';
import MazeMuncherGame from '@/components/games/maze-muncher';
import AsteroidFieldGame from '@/components/games/asteroid-field';
import FrogHopperGame from '@/components/games/frog-hopper';
import MinefieldGame from '@/components/games/minefield';
import WordGuessGame from '@/components/games/word-guess';
import type { Game } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import FourInARowGame from '@/components/games/four-in-a-row';
import CubeRunnerGame from '@/components/games/cube-runner';
import FlappyJetpackGame from '@/components/games/flappy-jetpack';
import StackTowerGame from '@/components/games/stack-tower';
import DoodleAscendGame from '@/components/games/doodle-ascend';
import GeoDashGame from '@/components/games/geo-dash';
import SkyDodgeGame from '@/components/games/sky-dodge';
import ClickerManiaGame from '@/components/games/clicker-mania';
import GemMatchGame from '@/components/games/gem-match';
import BubblePopGame from '@/components/games/bubble-pop';
import EndlessRoadGame from '@/components/games/endless-road';


interface GamePageProps {
  params: {
    slug: string;
  };
}

// Statically generate routes for all games
export function generateStaticParams() {
  return allGameSlugs.map(slug => ({ slug }));
}

function getGameComponent(slug: string) {
  switch (slug) {
    case 'snake-classic':
      return SnakeGame;
    case 'tetro-fall':
      return TetrisGame;
    case 'brick-buster':
      return BreakoutGame;
    case 'galaxy-patrol':
      return GalaxyPatrolGame;
    case '2048':
      return Game2048;
    case 'maze-muncher':
        return MazeMuncherGame;
    case 'asteroid-field':
        return AsteroidFieldGame;
    case 'frog-hopper':
        return FrogHopperGame;
    case 'minefield':
        return MinefieldGame;
    case 'word-guess':
        return WordGuessGame;
    case 'four-in-a-row':
        return FourInARowGame;
    case 'cube-runner':
        return CubeRunnerGame;
    case 'flappy-jetpack':
        return FlappyJetpackGame;
    case 'stack-tower':
        return StackTowerGame;
    case 'doodle-ascend':
        return DoodleAscendGame;
    case 'geo-dash':
        return GeoDashGame;
    case 'sky-dodge':
        return SkyDodgeGame;
    case 'clicker-mania':
        return ClickerManiaGame;
    case 'gem-match':
        return GemMatchGame;
    case 'bubble-pop':
        return BubblePopGame;
    case 'endless-road':
        return EndlessRoadGame;
    default:
      return null;
  }
}

export default function GamePage({ params }: GamePageProps) {
  const { slug } = params;
  const game = games.find((g) => g.slug === slug);

  if (!game) {
    notFound();
  }

  const GameComponent = getGameComponent(slug);

  if (!GameComponent) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="font-headline text-4xl font-bold mb-4">Coming Soon!</h1>
            <p className="text-muted-foreground text-lg">This game is under construction. Please check back later!</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GameContainer game={game} GameComponent={GameComponent} />
        </div>
        <aside className="space-y-6">
            <div className="p-6 bg-card rounded-lg shadow-sm">
                <div className="aspect-video relative mb-4">
                    <Image
                        src={game.image}
                        alt={game.title}
                        fill
                        className="object-cover rounded-md"
                        data-ai-hint={game.imageHint}
                    />
                </div>
                <h1 className="font-headline text-3xl font-bold mb-2">{game.title}</h1>
                <p className="text-muted-foreground mb-4">{game.description}</p>
                <Badge variant="secondary">{game.category}</Badge>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-sm">
                <h2 className="font-headline text-2xl font-bold mb-4">How to Play</h2>
                {game.slug === 'snake-classic' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">WASD</span> to move the snake.</li>
                        <li>Eat the red food to grow longer and increase your score.</li>
                        <li>Avoid hitting the walls or your own tail.</li>
                        <li>The game gets faster as you grow!</li>
                    </ul>
                )}
                {game.slug === 'tetro-fall' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><span className="font-semibold text-foreground">Left/Right Arrows</span> or <span className="font-semibold text-foreground">A/D</span>: Move piece.</li>
                        <li><span className="font-semibold text-foreground">Up Arrow</span> or <span className="font-semibold text-foreground">W</span>: Rotate piece.</li>
                        <li><span className="font-semibold text-foreground">Down Arrow</span> or <span className="font-semibold text-foreground">S</span>: Soft drop.</li>
                        <li><span className="font-semibold text-foreground">Spacebar</span>: Hard drop.</li>
                        <li>Clear lines to score points.</li>
                    </ul>
                )}
                {game.slug === 'brick-buster' && (
                     <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span>, <span className="font-semibold text-foreground">A/D</span>, or <span className="font-semibold text-foreground">Mouse</span> to move the paddle.</li>
                        <li>Break all the bricks with the ball to win.</li>
                        <li>Don't let the ball fall below your paddle.</li>
                    </ul>
                )}
                {game.slug === 'galaxy-patrol' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">A/D</span> to move your ship.</li>
                        <li>Press <span className="font-semibold text-foreground">Spacebar</span> to shoot.</li>
                        <li>Defeat all aliens to win the level.</li>
                        <li>Avoid getting hit by alien bullets.</li>
                    </ul>
                )}
                {game.slug === '2048' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">W/A/S/D</span> to slide the tiles.</li>
                        <li>Tiles with the same number merge into one when they touch.</li>
                        <li>Combine tiles to reach the 2048 tile to win!</li>
                    </ul>
                )}
                {game.slug === 'maze-muncher' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">W/A/S/D</span> to move.</li>
                        <li>Eat all the pellets to clear the level.</li>
                        <li>Avoid the ghosts!</li>
                        <li>Eat a power pellet (large dot) to turn ghosts blue and eat them for extra points!</li>
                    </ul>
                )}
                {game.slug === 'asteroid-field' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><span className="font-semibold text-foreground">Left/Right Arrows</span> or <span className="font-semibold text-foreground">A/D</span> to rotate.</li>
                        <li><span className="font-semibold text-foreground">Up Arrow</span> or <span className="font-semibold text-foreground">W</span> to thrust forward.</li>
                        <li>Press <span className="font-semibold text-foreground">Spacebar</span> to shoot.</li>
                        <li>Shoot all asteroids to win. Avoid crashing into them!</li>
                    </ul>
                )}
                {game.slug === 'frog-hopper' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">W/A/S/D</span> to move.</li>
                        <li>Get all 5 frogs to their homes at the top.</li>
                        <li>Avoid cars on the road and drowning in the river!</li>
                    </ul>
                )}
                 {game.slug === 'minefield' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li><span className="font-semibold text-foreground">Left-click</span> to reveal a square.</li>
                        <li><span className="font-semibold text-foreground">Right-click</span> to place a flag on a suspected mine.</li>
                        <li>The numbers indicate how many mines are adjacent to that square.</li>
                        <li>Clear all non-mine squares to win!</li>
                    </ul>
                )}
                {game.slug === 'word-guess' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Guess the hidden word by typing letters on your keyboard.</li>
                        <li>Each incorrect guess will add a part to the hangman drawing.</li>
                        <li>You have 6 incorrect guesses before you lose.</li>
                        <li>Guess the word before the hangman is complete to win!</li>
                    </ul>
                )}
                {game.slug === 'four-in-a-row' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Click on a column to drop your piece (yellow).</li>
                        <li>Your goal is to get four of your pieces in a row.</li>
                        <li>Rows can be horizontal, vertical, or diagonal.</li>
                        <li>The first to get four in a row wins!</li>
                    </ul>
                )}
                {game.slug === 'cube-runner' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">A/D</span> to move.</li>
                        <li>Dodge the incoming cubes for as long as you can.</li>
                        <li>The game gets faster over time!</li>
                    </ul>
                )}
                {game.slug === 'flappy-jetpack' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Press any key, click, or tap to flap your jetpack upwards.</li>
                        <li>Navigate through the gaps in the pipes.</li>
                        <li>Don't hit the pipes or the ground!</li>
                    </ul>
                )}
                {game.slug === 'stack-tower' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Press any key, click, or tap to place the moving block.</li>
                        <li>Try to line it up perfectly with the block below.</li>
                        <li>Any part of the block that doesn't overlap is cut off.</li>
                        <li>Stack as high as you can!</li>
                    </ul>
                )}
                {game.slug === 'doodle-ascend' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">A/D</span> to move left and right.</li>
                        <li>Jump on platforms to go higher.</li>
                        <li>The screen will move up with you. Don't fall off the bottom!</li>
                    </ul>
                )}
                {game.slug === 'geo-dash' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Press any key, click, or tap to jump.</li>
                        <li>Jump over the triangular obstacles.</li>
                        <li>The game speeds up as you go!</li>
                    </ul>
                )}
                {game.slug === 'sky-dodge' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">A/D</span> to move left and right.</li>
                        <li>Dodge the objects falling from the sky.</li>
                        <li>Survive as long as you can!</li>
                    </ul>
                )}
                {game.slug === 'clicker-mania' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Click the main button to earn points.</li>
                        <li>Use points to buy upgrades for more power and automation.</li>
                        <li>Reach the highest score possible!</li>
                    </ul>
                )}
                {game.slug === 'gem-match' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Click to select a gem, then click an adjacent gem to swap.</li>
                        <li>Match 3 or more gems of the same color in a row or column.</li>
                        <li>New gems will fall to fill the gaps.</li>
                    </ul>
                )}
                {game.slug === 'bubble-pop' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Aim with your mouse and click to shoot the bubble.</li>
                        <li>Match 3 or more bubbles of the same color to pop them.</li>
                        <li>Clear the board to win! (Note: Popping logic is simplified)</li>
                    </ul>
                )}
                {game.slug === 'endless-road' && (
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Use <span className="font-semibold text-foreground">Arrow Keys</span> or <span className="font-semibold text-foreground">A/D</span> to steer your car.</li>
                        <li>Stay on the road and avoid other cars.</li>
                        <li>Drive as far as you can!</li>
                    </ul>
                )}
            </div>
        </aside>
      </div>
    </div>
  );
}
