'use server';

/**
 * @fileOverview An AI agent that dynamically adjusts game difficulty based on player skill.
 *
 * - adjustDifficulty - A function that adjusts the game difficulty.
 * - AdjustDifficultyInput - The input type for the adjustDifficulty function.
 * - AdjustDifficultyOutput - The return type for the adjustDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyInputSchema = z.object({
  gameName: z.string().describe('The name of the game being played.'),
  playerScore: z.number().describe('The player\'s current score in the game.'),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The player\'s current skill level.'),
  recentPerformance: z
    .string()
    .describe(
      'A description of the player\'s recent performance in the game, including any challenges or successes.'
    ),
});
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;

const AdjustDifficultyOutputSchema = z.object({
  difficultyAdjustment: z
    .string()
    .describe(
      'Suggested adjustments to the game difficulty, providing specific recommendations and reasoning.'
    ),
  adaptiveAdvice: z
    .string()
    .describe(
      'Provides personalized advice to the player on how to adapt to the adjusted difficulty level, considering their skill and performance.'
    ),
});
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

export async function adjustDifficulty(
  input: AdjustDifficultyInput
): Promise<AdjustDifficultyOutput> {
  return adjustDifficultyFlow(input);
}

const adjustDifficultyPrompt = ai.definePrompt({
  name: 'adjustDifficultyPrompt',
  input: {schema: AdjustDifficultyInputSchema},
  output: {schema: AdjustDifficultyOutputSchema},
  prompt: `You are an AI game advisor that dynamically adjusts the difficulty of classic video games.

You will take into account the game being played, the player\'s score, their overall skill level, and their recent performance to make a determination on whether or not to adjust the difficulty.

Game Name: {{{gameName}}}
Player Score: {{{playerScore}}}
Skill Level: {{{skillLevel}}}
Recent Performance: {{{recentPerformance}}}

Based on this information, provide a suggestion on how to adjust the difficulty to keep the game engaging. Include specific recommendations. Also provide personalized advice to the player on how to adapt to the adjusted difficulty level, considering their skill and performance.

Difficulty Adjustment: 
Adaptive Advice: `,
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async input => {
    const {output} = await adjustDifficultyPrompt(input);
    return output!;
  }
);

