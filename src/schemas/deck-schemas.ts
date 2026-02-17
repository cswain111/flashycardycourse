import { z } from "zod";

// Schema for creating a new deck
export const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
});

export type CreateDeckInput = z.infer<typeof createDeckSchema>;

// Schema for updating a deck
export const updateDeckSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
});

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

// Schema for deleting a deck
export const deleteDeckSchema = z.object({
  id: z.number(),
});

export type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;
