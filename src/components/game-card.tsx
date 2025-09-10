import Link from "next/link";
import Image from "next/image";
import type { Game } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="aspect-video relative mb-4">
          <Image
            src={game.image}
            alt={game.title}
            fill
            className="object-cover rounded-md"
            data-ai-hint={game.imageHint}
          />
        </div>
        <CardTitle className="font-headline">{game.title}</CardTitle>
        <CardDescription>{game.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Badge variant="secondary">{game.category}</Badge>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/games/${game.slug}`}>
            Play Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
