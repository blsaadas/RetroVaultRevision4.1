// src/ai/flows/personalized-game-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized game recommendations based on the user's play history.
 *
 * - getPersonalizedGameRecommendations - A function to retrieve personalized game recommendations.
 * - PersonalizedGameRecommendationsInput - The input type for the getPersonalizedGameRecommendations function.
 * - PersonalizedGameRecommendationsOutput - The return type for the getPersonalizedGameRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedGameRecommendationsInputSchema = z.object({
  playHistory: z
    .array(z.string())
    .describe('An array of game titles representing the user play history.'),
  allGames: z.array(z.string()).describe('An array of all available game titles.'),
});
export type PersonalizedGameRecommendationsInput = z.infer<
  typeof PersonalizedGameRecommendationsInputSchema
>;

const PersonalizedGameRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of game titles recommended to the user.'),
});
export type PersonalizedGameRecommendationsOutput = z.infer<
  typeof PersonalizedGameRecommendationsOutputSchema
>;

export async function getPersonalizedGameRecommendations(
  input: PersonalizedGameRecommendationsInput
): Promise<PersonalizedGameRecommendationsOutput> {
  return personalizedGameRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedGameRecommendationsPrompt',
  input: {schema: PersonalizedGameRecommendationsInputSchema},
  output: {schema: PersonalizedGameRecommendationsOutputSchema},
  prompt: `You are a game recommendation expert.

Based on the user's play history, recommend games from the available games that the user might enjoy.

Play History:
{{#if playHistory}}
  {{#each playHistory}}- {{{this}}}
  {{/each}}
{{else}}
  No play history available.
{{/if}}

Available Games:
{{#if allGames}}
  {{#each allGames}}- {{{this}}}
  {{/each}}
{{else}}
  No games available.
{{/if}}


Recommend games that are similar to the games in the play history. Only suggest games that are in the list of available games.
Limit the recommendations to 5 games.  Return the recommendations as a simple list of game names.
`,
});

const personalizedGameRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedGameRecommendationsFlow',
    inputSchema: PersonalizedGameRecommendationsInputSchema,
    outputSchema: PersonalizedGameRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
