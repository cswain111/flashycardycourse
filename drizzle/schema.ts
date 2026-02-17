import { pgTable, integer, varchar, text, timestamp, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const decks = pgTable("decks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "decks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const cards = pgTable("cards", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "cards_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	deckId: integer().notNull(),
	front: text().notNull(),
	back: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.deckId],
			foreignColumns: [decks.id],
			name: "cards_deckId_decks_id_fk"
		}).onDelete("cascade"),
]);
