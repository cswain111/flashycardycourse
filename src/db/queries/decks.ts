import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Query Functions - Read Operations
 */

/**
 * Get all decks for a specific user
 */
export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.createdAt);
}

/**
 * Get a single deck by ID and userId
 * Returns undefined if not found
 */
export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  return deck;
}

/**
 * Mutation Functions - Write Operations
 */

/**
 * Insert a new deck
 */
export async function insertDeck(data: {
  userId: string;
  name: string;
  description?: string;
}) {
  const [newDeck] = await db
    .insert(decksTable)
    .values(data)
    .returning();

  return newDeck;
}

/**
 * Update an existing deck
 * Only updates if deck belongs to the user
 * Returns undefined if deck not found or doesn't belong to user
 */
export async function updateDeck(
  deckId: number,
  userId: string,
  data: { name?: string; description?: string }
) {
  const [updatedDeck] = await db
    .update(decksTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();

  return updatedDeck;
}

/**
 * Delete a deck
 * Only deletes if deck belongs to the user
 * Returns undefined if deck not found or doesn't belong to user
 */
export async function deleteDeck(deckId: number, userId: string) {
  const [deletedDeck] = await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .returning();

  return deletedDeck;
}
