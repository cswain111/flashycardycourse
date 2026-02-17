import { z } from "zod";

// Schema for creating a new card
export const createCardSchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front of card is required"),
  back: z.string().min(1, "Back of card is required"),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

// Schema for updating a card
export const updateCardSchema = z.object({
  id: z.number(),
  front: z.string().min(1, "Front of card is required"),
  back: z.string().min(1, "Back of card is required"),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

// Schema for deleting a card
export const deleteCardSchema = z.object({
  id: z.number(),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
