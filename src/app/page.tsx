import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  
  // Redirect logged-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex flex-col items-center justify-center gap-8 text-center px-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-6xl font-bold tracking-tight text-foreground">
            FlashyCardy
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button>
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}
