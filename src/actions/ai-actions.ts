"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { insertCard, verifyDeckOwnership } from "@/db/queries/cards";
import { getDeckById } from "@/db/queries/decks";

const generateCardsSchema = z.object({
  deckId: z.number(),
});

type GenerateCardsInput = z.infer<typeof generateCardsSchema>;

export async function generateAIFlashcards(input: GenerateCardsInput) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const validated = generateCardsSchema.parse(input);

  const hasProPlan = has({ plan: "pro" });
  const hasAIFeature = has({ feature: "ai_flashcard_generation" });

  if (!hasProPlan && !hasAIFeature) {
    throw new Error("AI flashcard generation requires a Pro plan");
  }

  const isOwner = await verifyDeckOwnership(validated.deckId, userId);

  if (!isOwner) {
    throw new Error("Deck not found or unauthorized");
  }

  const deck = await getDeckById(validated.deckId, userId);

  if (!deck) {
    throw new Error("Deck not found");
  }

  const hasTitle = !!deck.name?.trim();
  const hasDescription = !!deck.description?.trim();
  if (!hasTitle || !hasDescription) {
    throw new Error(
      "Please add a title and description to your deck before generating cards with AI."
    );
  }

  const topic = buildTopicFromDeck(deck.name, deck.description);

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: z.object({
      cards: z.array(
        z.object({
          front: z.string().describe("Question or prompt"),
          back: z.string().describe("Answer or explanation"),
        })
      ),
    }),
    prompt: buildPrompt(topic),
  });

  const cardsToInsert = object.cards.slice(0, 20);

  for (const card of cardsToInsert) {
    await insertCard({
      deckId: validated.deckId,
      front: card.front,
      back: card.back,
    });
  }

  revalidatePath(`/decks/${validated.deckId}`);

  return {
    success: true,
    cardsGenerated: cardsToInsert.length,
  };
}

function buildTopicFromDeck(name: string, description?: string | null) {
  if (description && description.trim().length > 0) {
    return `${name} - ${description}`;
  }

  return name;
}

function buildPrompt(topic: string) {
  return `You are an expert educator.

Generate exactly 20 educational flashcards about: "${topic}".

Requirements:
- Each card must have a clear question or prompt on the front.
- Each card must have a concise, accurate answer on the back.
- Cover different key aspects of the topic.
- Make the cards helpful for spaced-repetition learning.
- Keep the front text under 200 characters.
- Keep the back text under 500 characters.`;
}

