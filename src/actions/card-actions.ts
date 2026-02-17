"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createCardSchema,
  updateCardSchema,
  deleteCardSchema,
  type CreateCardInput,
  type UpdateCardInput,
  type DeleteCardInput,
} from "@/schemas/card-schemas";

/**
 * Create a new card in a deck (only if the deck belongs to the authenticated user)
 */
export async function createCard(input: CreateCardInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate with Zod
  const validated = createCardSchema.parse(input);

  // 3. Verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(
      and(eq(decksTable.id, validated.deckId), eq(decksTable.userId, userId))
    );

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Create the card
  const [newCard] = await db
    .insert(cardsTable)
    .values({
      deckId: validated.deckId,
      front: validated.front,
      back: validated.back,
    })
    .returning();

  // 5. Revalidate the deck page
  revalidatePath(`/decks/${validated.deckId}`);

  return newCard;
}

/**
 * Update an existing card (only if the parent deck belongs to the authenticated user)
 */
export async function updateCard(input: UpdateCardInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate with Zod
  const validated = updateCardSchema.parse(input);

  // 3. Verify ownership through deck join and update
  const result = await db
    .update(cardsTable)
    .set({
      front: validated.front,
      back: validated.back,
      updatedAt: new Date(),
    })
    .where(eq(cardsTable.id, validated.id))
    .returning();

  if (result.length === 0) {
    throw new Error("Card not found");
  }

  const [updatedCard] = result;

  // Verify the deck belongs to the user
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(
      and(eq(decksTable.id, updatedCard.deckId), eq(decksTable.userId, userId))
    );

  if (!deck) {
    throw new Error("Unauthorized");
  }

  // 4. Revalidate the deck page
  revalidatePath(`/decks/${updatedCard.deckId}`);

  return updatedCard;
}

/**
 * Delete a card (only if the parent deck belongs to the authenticated user)
 */
export async function deleteCard(input: DeleteCardInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate with Zod
  const validated = deleteCardSchema.parse(input);

  // 3. Get the card first to know which deck it belongs to
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.id, validated.id));

  if (!card) {
    throw new Error("Card not found");
  }

  // 4. Verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, card.deckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Unauthorized");
  }

  // 5. Delete the card
  const [deletedCard] = await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, validated.id))
    .returning();

  // 6. Revalidate the deck page
  revalidatePath(`/decks/${card.deckId}`);

  return deletedCard;
}

/**
 * Get all cards for a specific deck (only if the deck belongs to the authenticated user)
 */
export async function getCardsByDeckId(deckId: number) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 3. Fetch cards for the deck
  const cards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(cardsTable.createdAt);

  return cards;
}

/**
 * Get a single card by ID (only if the parent deck belongs to the authenticated user)
 */
export async function getCardById(cardId: number) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Fetch card with deck join to verify ownership
  const result = await db
    .select({
      card: cardsTable,
      deck: decksTable,
    })
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.id, cardId), eq(decksTable.userId, userId)));

  if (result.length === 0) {
    throw new Error("Card not found or unauthorized");
  }

  return result[0].card;
}
