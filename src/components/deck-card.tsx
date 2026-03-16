"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Deck {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{deck.name}</CardTitle>
        {deck.description && (
          <CardDescription className="line-clamp-2">
            {deck.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">
          Created {new Date(deck.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/decks/${deck.id}`}>Open Deck</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
