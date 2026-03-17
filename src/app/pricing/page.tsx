import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Unlock more features with FlashyCardy Pro
          </p>
        </div>
        
        <div className="w-full">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}
