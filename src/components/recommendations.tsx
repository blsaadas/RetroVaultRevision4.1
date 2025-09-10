'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { getRecommendationsAction } from '@/app/actions';
import { Loader2, Wand2 } from 'lucide-react';
import { games as allGames } from '@/lib/games';
import Link from 'next/link';

export function PersonalizedRecommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations([]);

    try {
      const historyJSON = localStorage.getItem('retrovault_play_history');
      const playHistory = historyJSON ? JSON.parse(historyJSON) : [];

      if (playHistory.length === 0) {
        toast({
            title: "Not enough data",
            description: "Play some games first to get personalized recommendations.",
            variant: "default",
        });
        setIsLoading(false);
        return;
      }

      const result = await getRecommendationsAction({
        playHistory,
        allGames: allGames.map(g => g.title),
      });

      if (result.success && result.data) {
        setRecommendations(result.data.recommendations);
        if (result.data.recommendations.length === 0) {
            toast({
                title: "No new recommendations",
                description: "You've explored a lot! We couldn't find new games for you right now.",
            });
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not fetch recommendations. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 border-primary/20 border-dashed">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]"/>
          Personalized Recommendations
        </CardTitle>
        <CardDescription>
          Based on your play history, here are some games you might enjoy. Click the button to get your personalized list!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {recommendations.map((rec, index) => {
              const game = allGames.find(g => g.title === rec);
              if (!game) return null;
              return (
                <Link key={index} href={`/games/${game.slug}`}>
                  <div className="group text-center">
                    <div className="aspect-square relative w-full h-auto rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-all group-hover:scale-105">
                         <img src={game.image} alt={game.title} className="w-full h-full object-cover" data-ai-hint={game.imageHint}/>
                    </div>
                    <p className="mt-2 text-sm font-medium truncate">{rec}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <Button onClick={handleGetRecommendations} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              {recommendations.length > 0 ? 'Get New Recommendations' : 'Get Recommendations'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
