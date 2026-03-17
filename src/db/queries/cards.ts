import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Query Functions - Read Operations
 */

/**
 * Get all cards for a specific deck
 * Does not verify deck ownership - should be done by caller
 */
export async function getCardsByDeckId(deckId: number) {
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.createdAt);
}

/**
 * Get a single card by ID with deck join to verify ownership
 * Returns undefined if not found or deck doesn't belong to userId
 */
export async function getCardById(cardId: number, userId: string) {
  const result = await db
    .select({
      card: cardsTable,
      deck: decksTable,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.id, cardId), eq(decksTable.userId, userId)));

  if (result.length === 0) {
    return undefined;
  }

  return result[0].card;
}

/**
 * Get a card by ID without ownership verification
 * Use with caution - should verify deck ownership separately
 */
export async function getCardByIdUnsafe(cardId: number) {
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, cardId));

  return card;
}

/**
 * Verify if a deck belongs to a user
 */
export async function verifyDeckOwnership(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  return !!deck;
}

/**
 * Mutation Functions - Write Operations
 */

/**
 * Insert a new card
 * Does not verify deck ownership - should be done by caller
 */
export async function insertCard(data: {
  deckId: number;
  front: string;
  back: string;
}) {
  const [newCard] = await db
    .insert(cardsTable)
    .values(data)
    .returning();

  return newCard;
}

/**
 * Update an existing card
 * Returns undefined if card not found
 */
export async function updateCard(
  cardId: number,
  data: { front?: string; back?: string }
) {
  const [updatedCard] = await db
    .update(cardsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, cardId))
    .returning();

  return updatedCard;
}

/**
 * Delete a card
 * Returns undefined if card not found
 */
export async function deleteCard(cardId: number) {
  const [deletedCard] = await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .returning();

  return deletedCard;
}
