'use client';

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, Check, X } from "lucide-react";
import Link from "next/link";

interface CardData {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StudyInterfaceProps {
  cards: CardData[];
  deckId: number;
}

interface CardReview {
  cardId: number;
  correct: boolean | null; // null means not yet reviewed
}

export function StudyInterface({ cards, deckId }: StudyInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyCards, setStudyCards] = useState(cards);
  const [isFinished, setIsFinished] = useState(false);
  const [reviews, setReviews] = useState<CardReview[]>(
    cards.map(card => ({ cardId: card.id, correct: null }))
  );

  const currentCard = studyCards[currentIndex];
  const totalCards = studyCards.length;
  const currentReview = reviews.find(r => r.cardId === currentCard.id);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, totalCards]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleShuffle = useCallback(() => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFinished(false);
    // Reset reviews for new order
    setReviews(shuffled.map(card => ({ cardId: card.id, correct: null })));
  }, [studyCards]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setIsFinished(false);
    setIsFlipped(false);
    // Reset all reviews
    setReviews(studyCards.map(card => ({ cardId: card.id, correct: null })));
  }, [studyCards]);

  const handleMarkCorrect = useCallback(() => {
    setReviews(prev => 
      prev.map(r => 
        r.cardId === currentCard.id ? { ...r, correct: true } : r
      )
    );
    // Auto-advance to next card
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentCard, currentIndex, totalCards]);

  const handleMarkIncorrect = useCallback(() => {
    setReviews(prev => 
      prev.map(r => 
        r.cardId === currentCard.id ? { ...r, correct: false } : r
      )
    );
    // Auto-advance to next card
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  }, [currentCard, currentIndex, totalCards]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFinished) return;

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          handleFlip();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFinished, handleFlip, handlePrevious, handleNext]);

  if (isFinished) {
    const correctCount = reviews.filter(r => r.correct === true).length;
    const incorrectCount = reviews.filter(r => r.correct === false).length;
    const notReviewedCount = reviews.filter(r => r.correct === null).length;
    const accuracy = correctCount + incorrectCount > 0 
      ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) 
      : 0;

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold">Study Session Complete!</h2>
          <p className="text-muted-foreground text-lg">
            You have reviewed all {totalCards} cards in this deck.
          </p>
          
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {correctCount}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Correct
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {incorrectCount}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Incorrect
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Accuracy
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {notReviewedCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Note: {notReviewedCount} {notReviewedCount === 1 ? "card was" : "cards were"} not marked
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleRestart} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Study Again
            </Button>
            <Button onClick={handleShuffle} variant="outline" size="lg">
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle & Restart
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/decks/${deckId}`}>
                Back to Deck
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress and shuffle */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {totalCards}
        </div>
        <Button onClick={handleShuffle} variant="outline" size="sm">
          <Shuffle className="mr-2 h-4 w-4" />
          Shuffle
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-8">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <Card
        className={`min-h-[400px] cursor-pointer hover:shadow-lg transition-shadow duration-200 mb-8 ${
          currentReview?.correct === true ? 'border-green-500 border-2' : 
          currentReview?.correct === false ? 'border-red-500 border-2' : ''
        }`}
        onClick={handleFlip}
      >
        <CardContent className="flex items-center justify-center h-full min-h-[400px] p-8">
          <div className="text-center space-y-4 w-full">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {isFlipped ? "Back" : "Front"}
            </div>
            <div className="text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
            <div className="text-sm text-muted-foreground italic pt-4">
              {isFlipped ? "Did you get it right?" : "Click card or press Space/Enter to flip"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correct/Incorrect buttons (shown when flipped) */}
      {isFlipped && (
        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={handleMarkIncorrect}
            variant="destructive"
            size="lg"
            className="flex-1 max-w-xs"
          >
            <X className="mr-2 h-5 w-5" />
            Incorrect
          </Button>
          <Button
            onClick={handleMarkCorrect}
            variant="default"
            size="lg"
            className="flex-1 max-w-xs bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-5 w-5" />
            Correct
          </Button>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          size="lg"
          className="flex-1 max-w-xs"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          onClick={handleFlip}
          variant="secondary"
          size="lg"
          className="flex-1 max-w-xs"
        >
          Flip Card
        </Button>

        <Button
          onClick={handleNext}
          variant="outline"
          size="lg"
          className="flex-1 max-w-xs"
        >
          {currentIndex === totalCards - 1 ? "Finish" : "Next"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Session statistics */}
      <div className="mt-8 flex justify-center gap-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span className="text-muted-foreground">
            Correct: {reviews.filter(r => r.correct === true).length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <span className="text-muted-foreground">
            Incorrect: {reviews.filter(r => r.correct === false).length}
          </span>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Keyboard shortcuts: ← Previous | → Next | Space/Enter Flip</p>
      </div>
    </div>
  );
}
