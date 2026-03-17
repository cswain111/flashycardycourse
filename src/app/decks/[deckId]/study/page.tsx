import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { StudyInterface } from "@/components/study-interface";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StudyPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  // Authenticate user
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const resolvedParams = await params;
  const deckId = parseInt(resolvedParams.deckId);

  if (isNaN(deckId)) {
    notFound();
  }

  // Fetch deck and verify ownership
  const deck = await getDeckById(deckId, userId);

  if (!deck) {
    notFound();
  }

  // Fetch cards for this deck
  const cards = await getCardsByDeckId(deckId);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deck
          </Link>
        </Button>
        
        <div className="mb-4">
          <h1 className="text-4xl font-bold tracking-tight">Study: {deck.name}</h1>
          {deck.description && (
            <p className="text-muted-foreground mt-2 text-lg">
              {deck.description}
            </p>
          )}
        </div>
      </div>

      {/* Study interface */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-semibold">No cards to study</h2>
            <p className="text-muted-foreground">
              Add some cards to this deck before starting a study session.
            </p>
            <Button asChild>
              <Link href={`/decks/${deckId}`}>
                Go to Deck
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <StudyInterface cards={cards} deckId={deckId} />
      )}
    </div>
  );
}
