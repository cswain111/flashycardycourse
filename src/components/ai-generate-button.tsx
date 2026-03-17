"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateAIFlashcards } from "@/actions/ai-actions";

interface AIGenerateButtonProps {
  deckId: number;
  canUseAI: boolean;
  hasDescription: boolean;
}

export function AIGenerateButton({
  deckId,
  canUseAI,
  hasDescription,
}: AIGenerateButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canGenerate = canUseAI && hasDescription;

  const handleClick = () => {
    if (!canUseAI) {
      router.push("/pricing");
      return;
    }
    if (!hasDescription) {
      return;
    }

    startTransition(async () => {
      await generateAIFlashcards({ deckId });
      router.refresh();
    });
  };

  const button = (
    <Button
      type="button"
      variant={canGenerate ? "default" : "outline"}
      onClick={handleClick}
      disabled={isPending || (canUseAI && !hasDescription)}
    >
      <Sparkles className="mr-2 h-4 w-4" />
      {isPending ? "Generating..." : "Generate cards with AI"}
    </Button>
  );

  // Pro/feature gate: show pricing tooltip and redirect on click
  if (!canUseAI) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>
              AI card generation is a Pro feature. Click to view pricing and
              upgrade.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Has Pro/AI but deck has no description: prompt to add description
  if (!hasDescription) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex cursor-not-allowed">
              {button}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add a description to your deck first so AI can generate relevant cards.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}

