import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getCardsByDeckId } from "@/db/queries/cards";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AddCardDialog } from "@/components/add-card-dialog";
import { CardItem } from "@/components/card-item";
import { ArrowLeft, BookOpen } from "lucide-react";
import { AIGenerateButton } from "@/components/ai-generate-button";

interface DeckDetailPageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  // Authenticate user
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const resolvedParams = await params;
  const deckId = parseInt(resolvedParams.deckId);

  if (isNaN(deckId)) {
    notFound();
  }

  const hasProPlan = has({ plan: "pro" });
  const hasAIFeature = has({ feature: "ai_flashcard_generation" });
  const canUseAI = hasProPlan || hasAIFeature;

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
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-2 text-lg">
                {deck.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </p>
          </div>
          <div className="flex gap-2">
            {cards.length > 0 && (
              <Button asChild>
                <Link href={`/decks/${deckId}/study`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Study
                </Link>
              </Button>
            )}
            <AddCardDialog deckId={deckId} />
            <AIGenerateButton
              deckId={deckId}
              canUseAI={canUseAI}
              hasDescription={!!deck.description?.trim()}
            />
          </div>
        </div>
      </div>

      {/* Cards display */}
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-semibold">No cards yet</h2>
            <p className="text-muted-foreground">
              Create your first flashcard to start learning!
            </p>
            <AddCardDialog deckId={deckId} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
