"use server";

import { adjustDifficulty, AdjustDifficultyInput } from "@/ai/flows/adaptive-difficulty-adjustment";
import { getPersonalizedGameRecommendations, PersonalizedGameRecommendationsInput } from "@/ai/flows/personalized-game-recommendations";

export async function getRecommendationsAction(input: PersonalizedGameRecommendationsInput) {
    try {
        const result = await getPersonalizedGameRecommendations(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get recommendations." };
    }
}

export async function getDifficultyAdviceAction(input: AdjustDifficultyInput) {
    try {
        const result = await adjustDifficulty(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get advice." };
    }
}
