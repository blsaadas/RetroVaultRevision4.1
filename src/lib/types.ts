export type GameCategory = "Action" | "Puzzle" | "Arcade";

export type Game = {
  slug: string;
  title: string;
  description: string;
  category: GameCategory;
  image: string;
  imageHint: string;
};
