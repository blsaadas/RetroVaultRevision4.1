import { notFound } from 'next/navigation';
import { games, allGameSlugs } from '@/lib/games';
import { GameContainer } from '@/components/game-container';
import SnakeGame from '@/components/games/snake';
import TetrisGame from '@/components/games/tetris';
import BreakoutGame from '@/components/games/breakout';
import GalaxyPatrolGame from '@/components/games/galaxy-patrol';
import Game2048 from '@/components/games/2048';
import type { Game } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
            </div>
        </aside>
      </div>
    </div>
  );
}
