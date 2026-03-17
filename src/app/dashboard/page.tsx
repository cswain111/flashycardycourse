import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/actions/deck-actions";
import { CreateDeckDialog } from "@/components/create-deck-dialog";
import { DeckCard } from "@/components/deck-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { AlertCircle, Crown } from "lucide-react";

export default async function DashboardPage() {
  // Authenticate user
  const { userId, has } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  // Fetch user's decks
  const decks = await getUserDecks();
  
  // Check if user has unlimited decks
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const deckCount = decks.length;
  const isAtLimit = !hasUnlimitedDecks && deckCount >= 3;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your flashcard decks
          </p>
        </div>
        <CreateDeckDialog disabled={isAtLimit} />
      </div>

      {/* Deck limit alert for free users */}
      {!hasUnlimitedDecks && (
        <Alert className="mb-6" variant={isAtLimit ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isAtLimit ? "Deck Limit Reached" : "Free Plan"}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {isAtLimit 
                ? `You've reached the free plan limit of 3 decks. Upgrade to Pro for unlimited decks.`
                : `You're using ${deckCount} of 3 decks on the free plan.`
              }
            </span>
            <Button asChild variant={isAtLimit ? "default" : "outline"} size="sm" className="ml-4">
              <Link href="/pricing">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-semibold">No decks yet</h2>
            <p className="text-muted-foreground">
              Create your first flashcard deck to get started learning!
            </p>
            <CreateDeckDialog disabled={isAtLimit} />
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
