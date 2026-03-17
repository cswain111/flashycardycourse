"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createDeckSchema,
  updateDeckSchema,
  deleteDeckSchema,
  type CreateDeckInput,
  type UpdateDeckInput,
  type DeleteDeckInput,
} from "@/schemas/deck-schemas";
import {
  getUserDecks as getUserDecksQuery,
  getDeckById as getDeckByIdQuery,
  insertDeck,
  updateDeck as updateDeckQuery,
  deleteDeck as deleteDeckQuery,
} from "@/db/queries/decks";

/**
 * Create a new deck for the authenticated user
 */
export async function createDeck(input: CreateDeckInput) {
  // 1. Authenticate
  const { userId, has } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Check if user has unlimited decks feature
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });

  // 3. If not unlimited, check deck limit
  if (!hasUnlimitedDecks) {
    const userDecks = await getUserDecksQuery(userId);
    if (userDecks.length >= 3) {
      throw new Error(
        "Free users are limited to 3 decks. Upgrade to Pro for unlimited decks."
      );
    }
  }

  // 4. Validate with Zod
  const validated = createDeckSchema.parse(input);

  // 5. Call mutation function
  const newDeck = await insertDeck({
    userId,
    name: validated.name,
    description: validated.description,
  });

  // 6. Revalidate the dashboard page
  revalidatePath("/dashboard");

  return newDeck;
}

/**
 * Update an existing deck (only if it belongs to the authenticated user)
 */
export async function updateDeck(input: UpdateDeckInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate with Zod
  const validated = updateDeckSchema.parse(input);

  // 3. Call mutation function
  const updatedDeck = await updateDeckQuery(validated.id, userId, {
    name: validated.name,
    description: validated.description,
  });

  if (!updatedDeck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Revalidate relevant pages
  revalidatePath("/dashboard");
  revalidatePath(`/decks/${validated.id}`);

  return updatedDeck;
}

/**
 * Delete a deck (only if it belongs to the authenticated user)
 * Cards will be automatically deleted due to cascade delete
 */
export async function deleteDeck(input: DeleteDeckInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate with Zod
  const validated = deleteDeckSchema.parse(input);

  // 3. Call mutation function
  const deletedDeck = await deleteDeckQuery(validated.id, userId);

  if (!deletedDeck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Revalidate the dashboard page
  revalidatePath("/dashboard");

  return deletedDeck;
}

/**
 * Get all decks for the authenticated user
 */
export async function getUserDecks() {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Call query function
  const decks = await getUserDecksQuery(userId);

  return decks;
}

/**
 * Get a single deck by ID (only if it belongs to the authenticated user)
 */
export async function getDeckById(deckId: number) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Call query function
  const deck = await getDeckByIdQuery(deckId, userId);

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  return deck;
}
