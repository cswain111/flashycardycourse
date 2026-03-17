"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteDeck } from "@/actions/deck-actions";
import { type DeleteDeckInput } from "@/schemas/deck-schemas";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const input: DeleteDeckInput = {
        id: deck.id,
      };

      await deleteDeck(input);
      setShowDeleteDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete deck");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex-1">
            <CardTitle className="text-xl">{deck.name}</CardTitle>
            {deck.description && (
              <CardDescription className="line-clamp-2 mt-1.5">
                {deck.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex-1" />
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Updated {new Date(deck.updatedAt).toLocaleDateString()}
          </p>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant="outline"
            >
              <Link href={`/decks/${deck.id}`}>
                View
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="default"
            >
              <Link href={`/decks/${deck.id}/study`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Study
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deck {deck.name} and all of its cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
