import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/actions/deck-actions";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { DeckCard } from "@/components/deck-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  // Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch user's decks
  const decks = await getUserDecks();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flashcard decks
          </p>
        </div>
        <CreateDeckDialog />
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-semibold">No decks yet</h2>
            <p className="text-muted-foreground">
              Create your first flashcard deck to get started learning!
            </p>
            <CreateDeckDialog />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
