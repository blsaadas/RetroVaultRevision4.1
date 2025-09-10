import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto flex h-[calc(100vh-10rem)] items-center justify-center text-center">
      <div>
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <Ghost className="h-16 w-16 text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]" />
        </div>
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-4">404 - Page Not Found</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Button asChild size="lg">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
