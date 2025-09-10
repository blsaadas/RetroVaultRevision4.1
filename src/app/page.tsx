'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { GameGrid } from '@/components/game-grid';
import { games } from '@/lib/games';
import type { Game } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonalizedRecommendations } from '@/components/recommendations';
import { Gamepad } from 'lucide-react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => ['all', ...Array.from(new Set(games.map(g => g.category)))], []);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-12 md:mb-16">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <Gamepad className="h-12 w-12 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"/>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-4">Welcome to RetroVault</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Your portal to the golden age of gaming. Play timeless classics, track your high scores, and discover new favorites.
        </p>
      </section>

      <section className="mb-12 md:mb-16">
        <PersonalizedRecommendations />
      </section>

      <section>
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
          <h2 className="font-headline text-3xl font-bold">Game Library</h2>
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              type="search"
              placeholder="Search games..."
              className="w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <GameGrid games={filteredGames} />
        {filteredGames.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No games found.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
