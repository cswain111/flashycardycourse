"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  createDeckSchema,
  updateDeckSchema,
  deleteDeckSchema,
  type CreateDeckInput,
  type UpdateDeckInput,
  type DeleteDeckInput,
} from "@/schemas/deck-schemas";

/**
 * Create a new deck for the authenticated user
 */
export async function createDeck(input: CreateDeckInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 2. Validate with Zod
  const validated = createDeckSchema.parse(input);

  // 3. Perform database operation
  const [newDeck] = await db
    .insert(decksTable)
    .values({
      userId,
      name: validated.name,
      description: validated.description,
    })
    .returning();

  // 4. Revalidate the decks page
  revalidatePath("/decks");

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

  // 3. Verify ownership and update
  const [updatedDeck] = await db
    .update(decksTable)
    .set({
      name: validated.name,
      description: validated.description,
      updatedAt: new Date(),
    })
    .where(and(eq(decksTable.id, validated.id), eq(decksTable.userId, userId)))
    .returning();

  if (!updatedDeck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Revalidate relevant pages
  revalidatePath("/decks");
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

  // 3. Verify ownership and delete
  const [deletedDeck] = await db
    .delete(decksTable)
    .where(and(eq(decksTable.id, validated.id), eq(decksTable.userId, userId)))
    .returning();

  if (!deletedDeck) {
    throw new Error("Deck not found or unauthorized");
  }

  // 4. Revalidate the decks page
  revalidatePath("/decks");

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

  // 2. Fetch decks filtered by userId
  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(decksTable.createdAt);

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

  // 2. Fetch deck with ownership verification
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)));

  if (!deck) {
    throw new Error("Deck not found or unauthorized");
  }

  return deck;
}
