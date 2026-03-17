"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createCardSchema,
  updateCardSchema,
  deleteCardSchema,
  type CreateCardInput,
  type UpdateCardInput,
  type DeleteCardInput,
} from "@/schemas/card-schemas";
import {
  getCardsByDeckId as getCardsByDeckIdQuery,
  getCardById as getCardByIdQuery,
  getCardByIdUnsafe,
  verifyDeckOwnership,
  insertCard,
  updateCard as updateCardQuery,
  deleteCard as deleteCardQuery,
} from "@/db/queries/cards";

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
  const isOwner = await verifyDeckOwnership(validated.deckId, userId);

  if (!isOwner) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Call mutation function
  const newCard = await insertCard({
    deckId: validated.deckId,
    front: validated.front,
    back: validated.back,
  });

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

  // 3. Call mutation function
  const updatedCard = await updateCardQuery(validated.id, {
    front: validated.front,
    back: validated.back,
  });

  if (!updatedCard) {
    throw new Error("Card not found");
  }

  // 4. Verify deck ownership
  const isOwner = await verifyDeckOwnership(updatedCard.deckId, userId);

  if (!isOwner) {
    throw new Error("Unauthorized");
  }

  // 5. Revalidate the deck page
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
  const card = await getCardByIdUnsafe(validated.id);

  if (!card) {
    throw new Error("Card not found");
  }

  // 4. Verify deck ownership
  const isOwner = await verifyDeckOwnership(card.deckId, userId);

  if (!isOwner) {
    throw new Error("Unauthorized");
  }

  // 5. Call mutation function
  const deletedCard = await deleteCardQuery(validated.id);

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
  const isOwner = await verifyDeckOwnership(deckId, userId);

  if (!isOwner) {
    throw new Error("Deck not found or unauthorized");
  }

  // 3. Call query function
  const cards = await getCardsByDeckIdQuery(deckId);

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

  // 2. Call query function
  const card = await getCardByIdQuery(cardId, userId);

  if (!card) {
    throw new Error("Card not found or unauthorized");
  }

  return card;
}
