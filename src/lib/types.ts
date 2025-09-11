
export type GameCategory = "Action" | "Puzzle" | "Arcade" | "Modern";

export type Game = {
  slug: string;
  title: string;
  description: string;
  category: GameCategory;
  image: string;
  imageHint: string;
};
